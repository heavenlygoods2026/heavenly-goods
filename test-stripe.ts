import Stripe from 'stripe';
import { config } from 'dotenv';
config({ path: './functions/.env' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

async function run() {
  try {
    const product = await stripe.products.create({
      id: 'test_id_123',
      name: 'Crowned in Grace: Hair Bows & Clips',
      description: 'Test description',
      active: true,
      images: [],
    });
    console.log("Product created:", product.id);
    
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1199,
      currency: 'usd',
    });
    console.log("Price created:", price.id);
  } catch (e) {
    console.error("Stripe error:", e);
  }
}
run();
