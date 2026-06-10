import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  customText?: string;
  image?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  status: 'Payment Pending' | 'New' | 'Processing' | 'Shipped' | 'Cancelled';
  date: string;
  customer?: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  giftCardSelected?: string; // e.g., "Spanish: 2 Timothy 1:7"
  giftMessage?: string;
  trackingNumber?: string;
  carrier?: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData: Order[] = [];
      snapshot.forEach((doc) => {
        // Exclude pending payments from showing up in admin as actionable if preferred,
        // but it's good to see abandoned checkouts too.
        orderData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(orderData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (id: string, newStatus: Order['status'], trackingInfo?: { trackingNumber: string, carrier: string }) => {
    try {
      const orderRef = doc(db, 'orders', id);
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (trackingInfo) {
        updateData.trackingNumber = trackingInfo.trackingNumber;
        updateData.carrier = trackingInfo.carrier;
      }
      
      await updateDoc(orderRef, updateData);
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  return { orders, loading, updateOrderStatus };
}
