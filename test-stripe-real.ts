import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase.ts';
import Stripe from 'stripe';
import { config } from 'dotenv';

config({ path: './functions/.env' });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' });

async function run() {
  const snapshot = await getDocs(collection(db, 'products'));
  const doc = snapshot.docs.find(d => d.data().name.includes('Hair Bows & Clips'));
  if (!doc) return console.log("Product not found");
  
  const productData = doc.data();
  console.log("Found product:", productData.name);
  
  const rawImages = productData.heroImage ? [productData.heroImage] : productData.images || [];
  const validImages = rawImages.filter((img: string) => img && !img.endsWith('.mp4'));

  try {
    const p = await stripe.products.create({
      name: productData.name || 'Unnamed',
      description: productData.description || '',
      active: productData.stock !== 0,
      images: validImages,
    });
    console.log("Success! Product ID:", p.id);
  } catch (e: any) {
    console.error("Stripe Error on Create:", e.message, e.code, e.param);
  }
}
run().catch(console.error);
