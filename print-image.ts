import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase.ts';

async function run() {
  const snapshot = await getDocs(collection(db, 'products'));
  const doc = snapshot.docs.find(d => d.data().name.includes('Hair Bows & Clips'));
  if (doc) {
    console.log("Image URL:", doc.data().heroImage || doc.data().images[0]);
  }
  process.exit(0);
}
run().catch(console.error);
