import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase.ts';

async function verify() {
  const snapshot = await getDocs(collection(db, 'products'));
  let missingCount = 0;
  for (const document of snapshot.docs) {
    const data = document.data();
    if (!data.stripePriceId) {
      console.log(`Missing Price ID for: ${data.name}`);
      missingCount++;
    }
  }
  if (missingCount === 0) {
    console.log("All products have a Stripe Price ID! 🎉");
  }
  process.exit(0);
}

verify().catch(console.error);
