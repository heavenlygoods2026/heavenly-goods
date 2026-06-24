import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './src/firebase.ts';

async function updateProducts() {
  console.log("Fetching products...");
  const snapshot = await getDocs(collection(db, 'products'));
  let count = 0;
  for (const document of snapshot.docs) {
    const data = document.data();
    console.log(`Updating ${data.name}...`);
    await updateDoc(doc(db, 'products', document.id), {
      _forceSync: Date.now()
    });
    count++;
  }
  console.log(`Successfully forced update on ${count} products.`);
  process.exit(0);
}

updateProducts().catch(console.error);
