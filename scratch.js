const admin = require("firebase-admin");
const serviceAccount = require("./functions/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function run() {
  const snapshot = await admin.firestore().collection('products').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Product: ${data.name}, StripePriceId: ${data.stripePriceId}`);
  });
}
run();
