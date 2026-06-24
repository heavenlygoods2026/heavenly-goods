require("dotenv").config();
const admin = require("firebase-admin");

admin.initializeApp();

async function run() {
  console.log("Fetching products...");
  const snapshot = await admin.firestore().collection('products').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`Product: ${data.name}`);
    console.log(` - StripeProductId: ${data.stripeProductId}`);
    console.log(` - StripePriceId: ${data.stripePriceId}`);
    
    // Force an update to trigger the cloud function
    await doc.ref.update({
      _forceSync: Date.now()
    });
    console.log(" - Forced update to trigger syncProductToStripe.");
    count++;
  }
  console.log(`Updated ${count} products.`);
}
run().catch(console.error);
