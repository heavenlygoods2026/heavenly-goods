import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { db, storage, auth } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Trash2, Edit2, LogOut, UploadCloud, Loader2 } from 'lucide-react';
import type { Product, ProductOption } from '../data/products';


// Helper functions for non-linear, centered scale slider mapping (center of slider at 0.0 represents 1.0x scale)
const getSliderVal = (scale: number) => {
  if (scale < 1.0) {
    return (scale - 1.0) / 0.9;
  } else {
    return (scale - 1.0) / 2.0;
  }
};

const getScaleFromVal = (v: number) => {
  if (v < 0) {
    return 1.0 + v * 0.9;
  } else {
    return 1.0 + v * 2.0;
  }
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const { products, loading: productsLoading } = useProducts();
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [verbiage, setVerbiage] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [hasCustomText, setHasCustomText] = useState(false);
  const [customTextLabel, setCustomTextLabel] = useState('');
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [imagePositions, setImagePositions] = useState<Record<string, string>>({});
  const [imageScales, setImageScales] = useState<Record<string, number>>({});
  
  // Drag Positioning States
  const [adjustingImage, setAdjustingImage] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [percentStart, setPercentStart] = useState({ x: 50, y: 50 });

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    } catch (err: any) {
      console.error(err);
      alert("Login failed. Check your email and password.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEmailInput('');
      setPasswordInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setPrice('');
    setStock('');
    setVerbiage('');
    setDescription('');
    setImages([]);
    setHeroImage(null);
    setHasCustomText(false);
    setCustomTextLabel('');
    setOptions([]);
    setImagePositions({});
    setImageScales({});
    setAdjustingImage(null);
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock != null ? product.stock.toString() : '');
    setVerbiage(product.verbiage);
    setDescription(product.description);
    setImages(product.images || []);
    setHeroImage(product.heroImage || null);
    setHasCustomText(product.hasCustomText || false);
    setCustomTextLabel(product.customTextLabel || '');
    setOptions(product.options || []);
    setImagePositions(product.imagePositions || {});
    setImageScales(product.imageScales || {});
    setAdjustingImage(null);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.error("Error deleting document: ", err);
        alert("Failed to delete product.");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `products/${filename}`);
        const metadata = {
          contentType: file.type || (file.name.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream')
        };
        await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(storageRef);
        newImageUrls.push(downloadURL);
      }
      
      setImages(prev => {
        const updated = [...prev, ...newImageUrls];
        if (!heroImage && updated.length > 0) {
          setHeroImage(updated[0]);
        }
        return updated;
      });
    } catch (err) {
      console.error("Error uploading files: ", err);
      alert("Failed to upload images.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const urlToRemove = images[indexToRemove];
    if (heroImage === urlToRemove) {
      setHeroImage(images.length > 1 ? images.find((_, i) => i !== indexToRemove) || null : null);
    }
    if (adjustingImage === urlToRemove) {
      setAdjustingImage(null);
    }
    
    // Clean up positions, scales, and tethers
    setImagePositions(prev => {
      const copy = { ...prev };
      delete copy[urlToRemove];
      return copy;
    });
    setImageScales(prev => {
      const copy = { ...prev };
      delete copy[urlToRemove];
      return copy;
    });
    setOptions(prev => prev.map(opt => opt.imageTether === urlToRemove ? { ...opt, imageTether: undefined } : opt));
    
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const productData = {
      name,
      price: parseFloat(price) || 0,
      stock: stock === '' ? null : parseInt(stock, 10),
      verbiage,
      description,
      images,
      heroImage,
      hasCustomText,
      customTextLabel,
      options,
      imagePositions,
      imageScales
    };

    const savePromise = isEditing && currentId
      ? updateDoc(doc(db, 'products', currentId), productData)
      : addDoc(collection(db, 'products'), productData);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firestore write timed out")), 6000)
    );

    try {
      await Promise.race([savePromise, timeoutPromise]);
      resetForm();
    } catch (err) {
      console.error("Error saving document: ", err);
      alert("Failed to save product. Please check your network connection and Firebase permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-pink-soft flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-pink-soft flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-premium border border-brand-pink/30 text-center">
          <div className="font-serif text-3xl font-bold text-brand-taupe-deep mb-2">Heavenly Goods</div>
          <div className="font-cursive text-brand-gold text-xl mb-8">admin portal</div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Admin Email" 
              className="w-full px-4 py-3 rounded-xl border border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all text-center"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              autoFocus
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-4 py-3 rounded-xl border border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all text-center"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
            />
            <button 
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold transition-colors cursor-pointer"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-taupe-light font-sans text-brand-taupe-deep pb-20">
      <header className="bg-white border-b border-brand-pink/30 sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="font-serif text-xl font-bold text-brand-taupe-deep flex items-center gap-2">
            Dashboard <span className="font-cursive text-brand-gold text-sm mt-1">manager</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-brand-taupe-dark hover:text-brand-orange transition-colors cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-pink/20 sticky top-24">
            <h2 className="font-serif text-2xl font-bold mb-6">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-taupe mb-1">Product Name</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-brand-pink/50 focus:outline-none focus:border-brand-orange bg-brand-taupe-light/30" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-brand-taupe mb-1">Price ($)</label>
                <input required type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-brand-pink/50 focus:outline-none focus:border-brand-orange bg-brand-taupe-light/30" />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-taupe mb-1">Stock Quantity (Leave blank for infinite)</label>
                <input type="number" min="0" step="1" value={stock} onChange={e=>setStock(e.target.value)} placeholder="Infinite" className="w-full px-3 py-2 rounded-lg border border-brand-pink/50 focus:outline-none focus:border-brand-orange bg-brand-taupe-light/30" />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-taupe mb-1">Verbiage (Short Subtitle)</label>
                <input required type="text" value={verbiage} onChange={e=>setVerbiage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-brand-pink/50 focus:outline-none focus:border-brand-orange bg-brand-taupe-light/30" />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-taupe mb-1">Description</label>
                <textarea required rows={3} value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-brand-pink/50 focus:outline-none focus:border-brand-orange bg-brand-taupe-light/30" />
              </div>

              {/* Variant Options Section */}
              <div className="border-t border-brand-pink/20 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-brand-taupe uppercase tracking-wider">Product Options / Variants</label>
                  <button
                    type="button"
                    onClick={() => setOptions(prev => [...prev, { label: '', imageTether: '' }])}
                    className="text-xs bg-brand-pink-light hover:bg-brand-pink text-brand-orange-dark font-bold px-2.5 py-1 rounded-lg border border-brand-pink transition-colors cursor-pointer"
                  >
                    + Add Option
                  </button>
                </div>
                
                {options.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-brand-pink-soft/30 p-2.5 rounded-xl border border-brand-pink/20">
                        <input
                          required
                          type="text"
                          placeholder="e.g. Baby Pink"
                          value={opt.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOptions(prev => prev.map((o, i) => i === idx ? { ...o, label: val } : o));
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded bg-white border border-brand-pink/30 text-xs focus:outline-none focus:border-brand-orange"
                        />
                        
                        <select
                          value={opt.imageTether || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOptions(prev => prev.map((o, i) => i === idx ? { ...o, imageTether: val || undefined } : o));
                          }}
                          className="w-28 px-1.5 py-1.5 rounded bg-white border border-brand-pink/30 text-[10px] font-bold text-brand-taupe-dark focus:outline-none"
                        >
                          <option value="">No Tether</option>
                          {images.map((url, imgIdx) => (
                            <option key={imgIdx} value={url}>Image {imgIdx + 1}</option>
                          ))}
                        </select>
                        
                        <button
                          type="button"
                          onClick={() => setOptions(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer"
                          title="Remove Variant"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Custom Textbox Section */}
              <div className="border-t border-brand-pink/20 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-taupe uppercase tracking-wider">Require Custom Text Input</label>
                  <input
                    type="checkbox"
                    checked={hasCustomText}
                    onChange={(e) => setHasCustomText(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-orange border-brand-pink focus:ring-brand-orange cursor-pointer"
                  />
                </div>
                
                {hasCustomText && (
                  <div>
                    <label className="block text-[10px] font-bold text-brand-taupe mb-1">Custom Prompt / Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Customize Your Word / Phrase"
                      value={customTextLabel}
                      onChange={(e) => setCustomTextLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-brand-pink/50 focus:outline-none focus:border-brand-orange bg-brand-taupe-light/30 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Image Uploader */}
              <div className="border-t border-brand-pink/20 pt-4">
                <label className="block text-xs font-bold text-brand-taupe mb-2">Product Images</label>
                
                <div className="relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={isUploading}
                  />
                  <div className={`w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${isUploading ? 'border-brand-taupe bg-gray-50' : 'border-brand-pink hover:border-brand-orange hover:bg-brand-pink-soft/20'}`}>
                    {isUploading ? (
                      <Loader2 size={24} className="animate-spin text-brand-orange" />
                    ) : (
                      <>
                        <UploadCloud size={24} className="text-brand-pink-dark" />
                        <span className="text-sm font-medium text-brand-taupe-dark">Click or drag images to upload</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Drag Repositioning Adjuster Frame Panel */}
                {adjustingImage && (
                  <div className="bg-brand-pink-light/40 border border-brand-pink/60 rounded-xl p-4 mt-4 space-y-4 relative animate-scale-up z-10">
                    <button 
                      type="button" 
                      onClick={() => setAdjustingImage(null)}
                      className="absolute top-2 right-2 text-brand-taupe hover:text-brand-orange cursor-pointer font-bold text-xs"
                    >
                      ✕
                    </button>
                    <h4 className="text-[10px] font-extrabold text-brand-taupe-deep uppercase tracking-wider flex items-center gap-1 select-none">
                      🎯 Drag image to center & Zoom
                    </h4>
                    
                    {/* Interactive Frame Viewport */}
                    <div 
                      className="w-full aspect-[4/3] bg-white border border-brand-pink/40 rounded-xl relative overflow-hidden cursor-move select-none flex items-center justify-center"
                      onMouseDown={(e) => {
                        const currentPos = imagePositions[adjustingImage] || '50% 50%';
                        const [px, py] = currentPos.split(' ').map(val => parseFloat(val) || 50);
                        setDragStart({ x: e.clientX, y: e.clientY });
                        setPercentStart({ x: px, y: py });
                        e.preventDefault();
                      }}
                      onMouseMove={(e) => {
                        if (e.buttons !== 1) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const dx = e.clientX - dragStart.x;
                        const dy = e.clientY - dragStart.y;
                        
                        // Scale factors compress drag displacement as zoom levels increase to make movement intuitive
                        const zoom = imageScales[adjustingImage] || 1.0;
                        const scaleFactor = Math.max(0.3, 1 / zoom);
                        const deltaX = (dx / rect.width) * 100 * scaleFactor;
                        const deltaY = (dy / rect.height) * 100 * scaleFactor;
                        
                        const newX = Math.min(100, Math.max(0, percentStart.x - deltaX));
                        const newY = Math.min(100, Math.max(0, percentStart.y - deltaY));
                        
                        setImagePositions(prev => ({
                          ...prev,
                          [adjustingImage]: `${newX.toFixed(0)}% ${newY.toFixed(0)}%`
                        }));
                      }}
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        const currentPos = imagePositions[adjustingImage] || '50% 50%';
                        const [px, py] = currentPos.split(' ').map(val => parseFloat(val) || 50);
                        setDragStart({ x: touch.clientX, y: touch.clientY });
                        setPercentStart({ x: px, y: py });
                      }}
                      onTouchMove={(e) => {
                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        const dx = touch.clientX - dragStart.x;
                        const dy = touch.clientY - dragStart.y;
                        
                        const zoom = imageScales[adjustingImage] || 1.0;
                        const scaleFactor = Math.max(0.3, 1 / zoom);
                        const deltaX = (dx / rect.width) * 100 * scaleFactor;
                        const deltaY = (dy / rect.height) * 100 * scaleFactor;
                        
                        const newX = Math.min(100, Math.max(0, percentStart.x - deltaX));
                        const newY = Math.min(100, Math.max(0, percentStart.y - deltaY));
                        
                        setImagePositions(prev => ({
                          ...prev,
                          [adjustingImage]: `${newX.toFixed(0)}% ${newY.toFixed(0)}%`
                        }));
                      }}
                    >
                      <img 
                        src={adjustingImage} 
                        alt="Adjusting" 
                        style={{ 
                          objectFit: (imageScales[adjustingImage] || 1.0) < 1.0 ? 'contain' : 'cover', 
                          objectPosition: imagePositions[adjustingImage] || '50% 50%',
                          transform: `scale(${imageScales[adjustingImage] || 1.0})`,
                          pointerEvents: 'none'
                        }} 
                        className="w-full h-full select-none"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full select-none font-bold">
                        Focus: {imagePositions[adjustingImage] || '50% 50%'}
                      </div>
                    </div>

                    {/* Zoom Slider Control */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[9px] font-bold text-brand-taupe uppercase tracking-wider select-none">
                        <span>🔍 Zoom / Scale Level</span>
                        <span className="text-brand-orange-dark bg-brand-orange-light px-2 py-0.5 rounded font-extrabold text-[8px]">
                          {(imageScales[adjustingImage] || 1.0).toFixed(2)}x
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="-1.0" 
                        max="1.0" 
                        step="0.02" 
                        value={getSliderVal(imageScales[adjustingImage] || 1.0)} 
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const snappedVal = Math.abs(val) < 0.04 ? 0 : val;
                          const newScale = getScaleFromVal(snappedVal);
                          setImageScales(prev => ({
                            ...prev,
                            [adjustingImage]: parseFloat(newScale.toFixed(2))
                          }));
                        }}
                        className="w-full h-1.5 bg-brand-pink/40 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                      />
                      <div className="flex justify-between text-[8px] text-brand-taupe-dark font-medium px-0.5 select-none">
                        <span>Zoom Out (0.1x)</span>
                        <span>1.0x (Standard)</span>
                        <span>Zoom In (3.0x)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {images.map((url, i) => (
                      <div key={i} className={`relative w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden group ${heroImage === url ? 'border-brand-orange' : 'border-brand-pink'}`}>
                        <img 
                          src={url} 
                          alt="preview" 
                          style={{ 
                            objectFit: (imageScales[url] || 1.0) < 1.0 ? 'contain' : 'cover', 
                            objectPosition: imagePositions[url] || '50% 50%',
                            transform: `scale(${imageScales[url] || 1.0})`
                          }}
                          className="w-full h-full" 
                        />
                        
                        {heroImage === url && (
                          <div className="absolute top-1 left-1 bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                            Hero
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            type="button" 
                            onClick={() => setAdjustingImage(url)}
                            className="p-1 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors cursor-pointer"
                            title="Adjust Image Framing & Zoom"
                          >
                            <span className="text-[10px] block w-3.5 h-3.5 leading-none">🎯</span>
                          </button>
                          {heroImage !== url && (
                            <button 
                              type="button" 
                              onClick={() => setHeroImage(url)}
                              className="p-1 bg-brand-orange hover:bg-brand-orange-dark rounded-full transition-colors cursor-pointer"
                              title="Set as Hero Thumbnail"
                            >
                              <span className="text-[10px] block w-3.5 h-3.5 leading-none">⭐</span>
                            </button>
                          )}
                          <button 
                            type="button" 
                            onClick={() => removeImage(i)}
                            className="p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                {isEditing && (
                  <button type="button" onClick={resetForm} className="flex-1 py-3 rounded-xl border border-brand-pink text-brand-taupe-dark font-bold hover:bg-brand-pink-soft transition-colors cursor-pointer">
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmitting || isUploading}
                  className="flex-1 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer shadow hover:shadow-md"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {isEditing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Inventory List */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-pink/20 overflow-hidden">
            <div className="p-6 border-b border-brand-pink/20 flex justify-between items-center bg-white">
              <h2 className="font-serif text-2xl font-bold">Inventory</h2>
              <span className="text-sm text-brand-taupe-dark bg-brand-taupe-light px-3 py-1 rounded-full">{products.length} Items</span>
            </div>
            
            {productsLoading ? (
              <div className="p-12 text-center text-brand-taupe-dark flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-brand-orange animate-spin-slow" />
                Loading inventory...
              </div>
            ) : (
              <div className="divide-y divide-brand-pink/20 bg-white">
                {products.map(product => (
                  <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:bg-brand-taupe-light/30 transition-colors group">
                    {/* Image Preview with custom position and scale alignment */}
                    <div className="w-20 h-20 rounded-lg bg-brand-pink-light flex-shrink-0 overflow-hidden border border-brand-pink/30 flex items-center justify-center relative shadow-inner">
                      {product.heroImage || (product.images && product.images.length > 0) ? (
                        <img 
                          src={product.heroImage || product.images[0]} 
                          alt={product.name} 
                          style={{ 
                            objectFit: (product.imageScales?.[product.heroImage || product.images[0]] || 1.0) < 1.0 ? 'contain' : 'cover', 
                            objectPosition: product.imagePositions?.[product.heroImage || product.images[0]] || '50% 50%',
                            transform: `scale(${product.imageScales?.[product.heroImage || product.images[0]] || 1.0})`
                          }}
                          className="w-full h-full" 
                        />
                      ) : (
                        <span className="text-xl">✨</span>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-brand-taupe-deep truncate">{product.name}</h3>
                        <span className="font-extrabold text-brand-orange-dark">${product.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-brand-taupe-dark line-clamp-1 mb-1">{product.verbiage}</p>
                      {product.stock != null && (
                         <p className={`text-[10px] font-bold uppercase mb-1 ${product.stock === 0 ? 'text-red-500' : 'text-brand-orange'}`}>Stock: {product.stock}</p>
                      )}
                      <p className="text-xs text-brand-taupe line-clamp-2 leading-relaxed">{product.description}</p>
                      
                      {/* Sub-badges for features */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {product.hasCustomText && (
                          <span className="text-[9px] font-bold text-brand-orange bg-brand-orange-light px-2 py-0.5 rounded border border-brand-orange/10">
                            Custom Text Box
                          </span>
                        )}
                        {product.options && product.options.length > 0 && (
                          <span className="text-[9px] font-bold text-brand-gold-dark bg-brand-gold-light px-2 py-0.5 rounded border border-brand-gold/10">
                            {product.options.length} Style Variants
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-full bg-brand-pink-light text-brand-orange hover:bg-brand-orange hover:text-white transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
