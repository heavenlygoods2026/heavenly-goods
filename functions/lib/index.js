"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createCheckoutSession = exports.syncProductToStripe = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
admin.initializeApp();
// Using process.env natively as Firebase Functions automatically loads the .env file
const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
    console.warn("WARNING: STRIPE_SECRET_KEY is not set in the environment.");
}
const stripe = new stripe_1.default(stripeSecret || 'dummy_key', {
    apiVersion: '2024-04-10', // Use the latest compatible API version
});
/**
 * Triggered when a product document is written (created or updated) in Firestore.
 * This syncs the product information to Stripe and saves the Stripe IDs back to Firestore.
 */
exports.syncProductToStripe = functions.runWith({ secrets: ["STRIPE_SECRET_KEY"] }).firestore
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
        }
        else {
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
        if (stripeProductId !== productData.stripeProductId ||
            stripePriceId !== productData.stripePriceId ||
            productData.price !== productData._lastSyncedPrice) {
            await change.after.ref.update({
                stripeProductId,
                stripePriceId,
                _lastSyncedPrice: productData.price,
            });
        }
        return null;
    }
    catch (error) {
        console.error('Stripe Sync Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to sync with Stripe.');
    }
});
/**
 * Callable function to create a Stripe Checkout Session for the Storefront cart.
 */
exports.createCheckoutSession = functions.runWith({ secrets: ["STRIPE_SECRET_KEY"] }).https.onCall(async (data, context) => {
    const { cartItems, giftNote, scriptureCard } = data;
    if (!cartItems || cartItems.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Cart is empty');
    }
    try {
        // 1. Create a pending Order in Firestore
        const orderRef = admin.firestore().collection('orders').doc();
        const orderId = orderRef.id;
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Rough estimate for initial write, webhook will finalize amount
        const estimatedShipping = subtotal >= 35 ? 0 : 4.50;
        await orderRef.set({
            id: orderId,
            status: 'Payment Pending',
            date: new Date().toISOString(),
            items: cartItems.map((item) => ({
                id: item.id,
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                selectedVariant: item.selectedOption || null,
                customText: item.customText || null,
                image: item.selectedImage || null
            })),
            subtotal,
            shipping: estimatedShipping,
            total: subtotal + estimatedShipping,
            giftCardSelected: scriptureCard || null,
            giftMessage: giftNote || null,
            customer: null // Will be populated by webhook
        });
        // 2. Prepare Stripe line items
        const lineItems = cartItems.map((item) => ({
            price: item.stripePriceId,
            quantity: item.quantity,
        }));
        // Add shipping logic if under $35
        if (subtotal < 35) {
            // NOTE: For live, you should create a Shipping Rate in Stripe and pass its ID here.
            // For this implementation, we will let Stripe calculate if you have it set up in the dashboard,
            // or we can pass a dummy inline shipping rate if the Stripe API allows, but standard practice 
            // is to use pre-created shipping_rate IDs. If not setup, Stripe will just charge the line items.
        }
        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['US'], // Restrict to US for now
            },
            line_items: lineItems,
            mode: 'payment',
            client_reference_id: orderId, // Links the Stripe Session to our Firestore Order
            success_url: 'https://heavenlygoodss.com/?checkout=success',
            cancel_url: 'https://heavenlygoodss.com/?cart=true',
        });
        return { id: session.id, url: session.url };
    }
    catch (error) {
        console.error('Checkout Session Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create checkout session.');
    }
});
/**
 * Webhook to handle Stripe events (specifically checkout.session.completed)
 */
exports.stripeWebhook = functions.runWith({ secrets: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY"] }).https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !webhookSecret) {
        console.error('Webhook Error: Missing signature or webhook secret');
        res.status(400).send('Webhook Error: Missing signature or secret');
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    }
    catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.client_reference_id;
        if (!orderId) {
            console.error('Webhook Error: Missing client_reference_id in session');
            res.status(400).send('Missing client_reference_id');
            return;
        }
        try {
            const orderRef = admin.firestore().collection('orders').doc(orderId);
            const customerInfo = {
                name: session.customer_details?.name || 'Unknown Customer',
                email: session.customer_details?.email || 'No email provided',
                address: session.shipping_details?.address?.line1 || '',
                city: session.shipping_details?.address?.city || '',
                state: session.shipping_details?.address?.state || '',
                zip: session.shipping_details?.address?.postal_code || '',
            };
            const finalTotal = (session.amount_total || 0) / 100;
            await orderRef.update({
                status: 'New',
                customer: customerInfo,
                total: finalTotal,
                // Calculate the actual shipping charged by Stripe
                shipping: session.total_details?.amount_shipping ? session.total_details.amount_shipping / 100 : 0
            });
            console.log(`Order ${orderId} successfully marked as Paid/New`);
            res.status(200).json({ received: true });
        }
        catch (error) {
            console.error(`Failed to update order ${orderId}:`, error);
            res.status(500).send('Database update failed');
        }
    }
    else {
        // Return a 200 response to acknowledge receipt of unhandled events
        res.status(200).json({ received: true });
    }
});
//# sourceMappingURL=index.js.map