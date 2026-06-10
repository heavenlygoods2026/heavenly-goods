import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { products as staticProducts, type Product } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProducts.push({
          id: doc.id,
          ...data,
          price: typeof data.price === 'number' ? data.price : parseFloat(data.price as string) || 0
        } as Product);
      });

      // Gracefully fallback to our high-fidelity static catalog if the Firestore collection is empty
      if (fetchedProducts.length === 0) {
        setProducts(staticProducts);
      } else {
        setProducts(fetchedProducts);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching products from Firestore, falling back to local static catalog:", err);
      setError(err);
      setProducts(staticProducts); // Safe fallback on error
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}
