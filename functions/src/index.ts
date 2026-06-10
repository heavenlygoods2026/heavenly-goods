import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();


// Using process.env natively as Firebase Functions automatically loads the .env file
const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  console.warn("WARNING: STRIPE_SECRET_KEY is not set in the environment.");
}

const stripe = new Stripe(stripeSecret || 'dummy_key', {
  apiVersion: '2024-04-10', // Use the latest compatible API version
});

/**
 * Triggered when a product document is written (created or updated) in Firestore.
 * This syncs the product information to Stripe and saves the Stripe IDs back to Firestore.
 */
export const syncProductToStripe = functions.firestore
  .document('products/{productId}')
  .onWrite(async (change, context) => {
    const productData = change.after.data();
    const productId = context.params.productId;

    // If product was deleted, we optionally could archive it in Stripe.
    if (!productData) {
      console.log(`Product ${productId} was deleted. Skipping Stripe sync.`);
      return null;
    }

    // Prepare Stripe Product payload
    const stripeProductData = {
      name: productData.name || 'Unnamed Product',
      description: productData.description || '',
      active: productData.stock !== 0,
      images: productData.heroImage ? [productData.heroImage] : productData.images || [],
    };

    let stripeProductId = productData.stripeProductId;
    let stripePriceId = productData.stripePriceId;

    try {
      if (!stripeProductId) {
        // Create new Product in Stripe
        const product = await stripe.products.create({
          id: productId, // Try to use the same ID for consistency
          ...stripeProductData,
        });
        stripeProductId = product.id;
      } else {
        // Update existing Product in Stripe
        await stripe.products.update(stripeProductId, stripeProductData);
      }

      // Check if price changed or price doesn't exist
      const priceInCents = Math.round(productData.price * 100);
      
      if (!stripePriceId || productData._lastSyncedPrice !== productData.price) {
        // Create a new price object in Stripe
        const price = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: priceInCents,
          currency: 'usd',
        });
        stripePriceId = price.id;
      }

      // Save Stripe IDs back to Firestore to prevent infinite loops
      if (
        stripeProductId !== productData.stripeProductId ||
        stripePriceId !== productData.stripePriceId ||
        productData.price !== productData._lastSyncedPrice
      ) {
        await change.after.ref.update({
          stripeProductId,
          stripePriceId,
          _lastSyncedPrice: productData.price,
        });
      }

      return null;
    } catch (error) {
      console.error('Stripe Sync Error:', error);
      throw new functions.https.HttpsError('internal', 'Failed to sync with Stripe.');
    }
  });

/**
 * Callable function to create a Stripe Checkout Session for the Storefront cart.
 */
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { cartItems } = data; // Array of items with stripePriceId and quantity

  if (!cartItems || cartItems.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Cart is empty');
  }

  try {
    const lineItems = cartItems.map((item: any) => ({
      price: item.stripePriceId,
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://heavenlygoodss.com/?checkout=success',
      cancel_url: 'https://heavenlygoodss.com/?cart=true',
    });

    return { id: session.id, url: session.url };
  } catch (error) {
    console.error('Checkout Session Error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session.');
  }
});
