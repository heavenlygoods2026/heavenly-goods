import { useState } from 'react';
import { useOrders, type Order } from '../../hooks/useOrders';
import { Loader2, Package, Truck, CheckCircle, Search, Mail, MapPin } from 'lucide-react';

export function OrdersTab() {
  const { orders, loading, updateOrderStatus } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // State for shipping form
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('USPS');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-brand-taupe-dark">
        <Loader2 className="animate-spin text-brand-orange mb-4" size={32} />
        <p>Loading incoming orders...</p>
      </div>
    );
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'New':
        return <span className="bg-brand-orange text-white px-2 py-0.5 rounded-full text-xs font-bold">NEW</span>;
      case 'Processing':
        return <span className="bg-brand-gold text-white px-2 py-0.5 rounded-full text-xs font-bold">PROCESSING</span>;
      case 'Shipped':
        return <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">SHIPPED</span>;
      case 'Cancelled':
        return <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">CANCELLED</span>;
    }
  };

  const handleShipOrder = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, 'Shipped', { trackingNumber, carrier });
    setTrackingNumber('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Order List */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-pink/20 sticky top-24">
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-taupe-light/30 border border-brand-pink/50 rounded-lg mb-4">
            <Search size={16} className="text-brand-taupe-dark" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>
          
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            {orders.map(order => (
              <button 
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedOrderId === order.id ? 'border-brand-orange bg-brand-orange-light/20 shadow-sm' : 'border-brand-pink/30 hover:border-brand-pink hover:bg-brand-pink-soft/20'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-brand-taupe-deep">{order.id}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="text-sm text-brand-taupe-dark mb-2">{order.customer?.name || 'Pending Payment Info'}</div>
                <div className="flex justify-between items-center text-xs text-brand-taupe">
                  <span>{new Date(order.date).toLocaleDateString()}</span>
                  <span className="font-bold">${order.total.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Order Details */}
      <div className="lg:w-2/3">
        {selectedOrder ? (
          <div className="bg-white rounded-2xl shadow-sm border border-brand-pink/20 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-brand-pink/20 bg-brand-pink-soft/10 flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-taupe-deep mb-1">Order {selectedOrder.id}</h2>
                <div className="text-sm text-brand-taupe-dark flex items-center gap-2">
                  <span>{new Date(selectedOrder.date).toLocaleString()}</span>
                  <span>•</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-2xl text-brand-orange-dark">${selectedOrder.total.toFixed(2)}</div>
                <div className="text-xs text-brand-taupe font-bold uppercase tracking-wide">Total Paid</div>
              </div>
            </div>

            {/* Content grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-brand-taupe uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin size={14} /> Shipping Details
                  </h3>
                  <div className="bg-brand-taupe-light/20 p-4 rounded-xl border border-brand-pink/30 text-sm">
                    <p className="font-bold text-brand-taupe-deep mb-1">{selectedOrder.customer?.name || 'Pending Checkout'}</p>
                    <p className="text-brand-taupe-dark">{selectedOrder.customer?.address || 'Address pending payment completion...'}</p>
                    <p className="text-brand-taupe-dark">
                      {selectedOrder.customer?.city ? `${selectedOrder.customer.city}, ${selectedOrder.customer.state} ${selectedOrder.customer.zip}` : ''}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-brand-taupe uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Mail size={14} /> Contact
                  </h3>
                  <p className="text-sm text-brand-taupe-dark bg-brand-taupe-light/20 p-3 rounded-lg border border-brand-pink/30">
                    {selectedOrder.customer?.email || 'N/A'}
                  </p>
                </div>

                {/* Gift Notes (If any) */}
                {(selectedOrder.giftCardSelected || selectedOrder.giftMessage) && (
                  <div>
                    <h3 className="text-sm font-bold text-brand-gold-dark uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Package size={14} /> Gift / Packaging Notes
                    </h3>
                    <div className="bg-brand-gold-light/20 p-4 rounded-xl border border-brand-gold/30 text-sm">
                      {selectedOrder.giftCardSelected && (
                        <div className="mb-2">
                          <span className="font-bold text-brand-taupe-deep">Backing Card:</span>{' '}
                          <span className="text-brand-taupe-dark">{selectedOrder.giftCardSelected}</span>
                        </div>
                      )}
                      {selectedOrder.giftMessage && (
                        <div>
                          <span className="font-bold text-brand-taupe-deep">Handwritten Note:</span>
                          <p className="mt-1 italic text-brand-taupe-dark font-serif">"{selectedOrder.giftMessage}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-bold text-brand-taupe uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Package size={14} /> Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-brand-pink/40 shadow-sm relative overflow-hidden">
                      {/* Crinkle texture subtle background */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/crinkle-paper.png')" }}></div>
                      
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="font-bold text-brand-taupe-deep">{item.name}</span>
                        <span className="text-sm font-bold text-brand-orange-dark">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <div className="text-xs text-brand-taupe-dark mb-2 relative z-10">
                        Quantity: {item.quantity}
                      </div>

                      {item.selectedVariant && (
                        <div className="text-xs mt-1 bg-brand-pink-soft/50 inline-block px-2 py-1 rounded border border-brand-pink/30 relative z-10">
                          Variant: <span className="font-bold">{item.selectedVariant}</span>
                        </div>
                      )}
                      
                      {item.customText && (
                        <div className="mt-3 bg-brand-orange-light/30 border border-brand-orange/30 p-2 rounded-lg relative z-10">
                          <div className="text-[10px] font-bold text-brand-orange-dark uppercase mb-1">Custom Text Needed:</div>
                          <div className="font-mono text-sm font-bold text-brand-taupe-deep tracking-wider">"{item.customText}"</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Fulfillment Actions */}
                <div className="mt-8 pt-6 border-t border-brand-pink/20">
                  <h3 className="text-sm font-bold text-brand-taupe uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Truck size={14} /> Fulfillment
                  </h3>
                  
                  {selectedOrder.status === 'Shipped' ? (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                      <CheckCircle className="text-green-500 mx-auto mb-2" size={24} />
                      <p className="font-bold text-green-800">Order Shipped</p>
                      <p className="text-xs text-green-600 mt-1">{selectedOrder.carrier} Tracking: {selectedOrder.trackingNumber}</p>
                    </div>
                  ) : (
                    <div className="bg-brand-pink-light/30 p-5 rounded-xl border border-brand-pink/50">
                      <div className="flex gap-2 mb-4">
                        <select 
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-brand-pink/50 focus:outline-none focus:border-brand-orange text-sm font-bold bg-white"
                        >
                          <option value="USPS">USPS</option>
                          <option value="UPS">UPS</option>
                          <option value="FedEx">FedEx</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Paste Tracking Number..." 
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-brand-pink/50 focus:outline-none focus:border-brand-orange text-sm bg-white"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'Processing')}
                          className="flex-1 py-2.5 rounded-xl border border-brand-orange text-brand-orange font-bold text-sm hover:bg-brand-orange-light transition-colors"
                        >
                          Mark Processing
                        </button>
                        <button 
                          onClick={handleShipOrder}
                          disabled={!trackingNumber}
                          className="flex-2 py-2.5 rounded-xl bg-brand-orange text-white font-bold text-sm hover:bg-brand-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Ship Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-2xl shadow-sm border border-brand-pink/20 flex flex-col items-center justify-center p-12 text-brand-taupe-dark">
            <Package size={48} className="text-brand-pink-dark mb-4 opacity-50" />
            <h3 className="font-serif text-xl font-bold mb-2">Select an Order</h3>
            <p className="text-sm">Click an order from the list to view its details and fulfillment status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
