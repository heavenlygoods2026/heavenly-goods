import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  Languages, 
  Compass, 
  ArrowRight, 
  X, 
  Star, 
  Award, 
  Clock, 
  Gift,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import type { Product, ProductOption } from '../data/products';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  selectedImage: string;
  selectedOption?: string;
  customText?: string;
  quantity: number;
}

const scriptureVerses = {
  'Psalm 139:14': {
    ref: 'Psalm 139:14',
    refEs: 'Salmo 139:14',
    text: '“I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.”',
    textEs: '“Te alabaré; porque formidables, maravillosas son tus obras; estoy maravillado, y mi alma lo sabe muy bien.”'
  },
  '2 Timothy 1:7': {
    ref: '2 Timothy 1:7',
    refEs: '2 Timoteo 1:7',
    text: '“For God has not given us a spirit of fear, but of power and of love and of a sound mind.”',
    textEs: '“Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.”'
  },
  '2 Corinthians 5:17': {
    ref: '2 Corinthians 5:17',
    refEs: '2 Corintios 5:17',
    text: '“Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!”',
    textEs: '“De modo que si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas.”'
  },
  'Proverbs 31:25': {
    ref: 'Proverbs 31:25',
    refEs: 'Proverbios 31:25',
    text: '“She is clothed with strength and dignity; she can laugh at the days to come.”',
    textEs: '“Fuerza y honor son su vestidura; y se ríe de lo por venir.”'
  },
  'Jeremiah 29:11': {
    ref: 'Jeremiah 29:11',
    refEs: 'Jeremías 29:11',
    text: '“For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.”',
    textEs: '“Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.”'
  }
};

const generateCartItemId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function Storefront() {
  const [bilingual, setBilingual] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hg_bilingual') === 'true';
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'hair' | 'keychains' | 'individuals'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Custom states for bracelet customization
  const [customWord, setCustomWord] = useState('');
  const [beadType, setBeadType] = useState('gold-white');
  const [braceletSize, setBraceletSize] = useState('adult');
  const [isAdding, setIsAdding] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hg_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBagOpen, setIsBagOpen] = useState(() => {
    try {
      return window.location.search.includes('cart=true');
    } catch {
      return false;
    }
  });
  const [isCheckoutMockOpen, setIsCheckoutMockOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const [giftNote, setGiftNote] = useState<string>(() => {
    try {
      return localStorage.getItem('hg_gift_note') || '';
    } catch {
      return '';
    }
  });
  
  const [scriptureCard, setScriptureCard] = useState<string>(() => {
    try {
      return localStorage.getItem('hg_scripture_card') || 'Psalm 139:14';
    } catch {
      return 'Psalm 139:14';
    }
  });
  
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);

  // Floating bubbles and cart pulse animations
  const [bubbles, setBubbles] = useState<{ id: number; text: string }[]>([]);
  const [cartPulsing, setCartPulsing] = useState(false);

  // Synchronize dynamic user selections to localStorage for persistent boutique sessions
  useEffect(() => {
    try {
      localStorage.setItem('hg_bilingual', String(bilingual));
    } catch (e) {
      console.warn("Failed to persist language setting", e);
    }
  }, [bilingual]);

  useEffect(() => {
    try {
      localStorage.setItem('hg_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Failed to persist cart items", e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('hg_gift_note', giftNote);
    } catch (e) {
      console.warn("Failed to persist gift note", e);
    }
  }, [giftNote]);

  useEffect(() => {
    try {
      localStorage.setItem('hg_scripture_card', scriptureCard);
    } catch (e) {
      console.warn("Failed to persist scripture card", e);
    }
  }, [scriptureCard]);

  useEffect(() => {
    if (window.location.search.includes('cart=true')) {
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.warn("Failed to clean up cart query parameter", e);
      }
    }
  }, []);
  useEffect(() => {
    if (window.location.hash === '#catalog') {
      const timer = setTimeout(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);
  const { products, loading } = useProducts();

  const heroProducts = useMemo(() => {
    return products.filter(p => p.id !== 'our-story' && p.stock !== 0);
  }, [products]);

  const bagCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);


  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        const prod = products.find(p => p.id === item.productId);
        
        // Prevent exceeding stock
        if (delta > 0 && prod && prod.stock != null && newQty > prod.stock) {
          return item;
        }
        
        // Spawn animation bubble and trigger pulse if quantity is increased
        if (delta > 0 && newQty > item.quantity) {
          const bubbleId = Date.now() + Math.random();
          setBubbles(prevBub => [...prevBub, { id: bubbleId, text: '+1' }]);
          setCartPulsing(true);
          setTimeout(() => setCartPulsing(false), 1200);
          setTimeout(() => setBubbles(prevBub => prevBub.filter(b => b.id !== bubbleId)), 1200);
        }
        
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };


  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const lang = bilingual ? 'es' : 'en';

  const translations = {
    en: {
      announcement: "Made with love to celebrate God’s love • Bilingual Support Active",
      navHome: "Home",
      navMission: "Our Mission",
      navCatalog: "Catalog",
      navCraft: "Craftsmanship",
      heroBadge: "Identity in Christ",
      heroTitleOne: "Celebrating",
      heroTitleTwo: "God’s Love",
      heroTitleThree: "through every detail",
      heroSubtitle: "Our mission is to remind you of your identity in Christ. Every accessory and bracelet is lovingly handmade, designed to carry a message of faith, purpose, and love.",
      heroBtnExplore: "Explore Catalog",
      heroBtnStory: "Our Story",
      heroCardSub: "made with love",
      heroCardText: '"I praise you because I am fearfully and wonderfully made..."',
      heroCardVerse: "Psalm 139:14",
      heroCardFooter: "🌸 Hand-crafted Faith Accessories 🌸",
      
      // Welcome Section
      welcomeBadge: "Where Beauty Begins in the Heart",
      welcomeTitle: "Welcome to Heavenly Goods",
      welcomeText: "Welcome to Heavenly Goods – Where we do more than create pretty accessories. Every bow, bracelet, tumbler, and keychains are designed to remind us of our identity in Christ. We believe beauty begins in the heart, and our mission is to celebrate God’s love through every detail. When you shop with us, you’re not just buying cute items—you’re sharing a message of faith, love, and purpose.",
      polaroidOneCap: "Crafted with faith",
      polaroidTwoCap: "Handmade details",
      
      // Core Values
      valuePrayerTitle: "Crafted with Prayer",
      valuePrayerDesc: "Each piece is hand-tied or compiled while praying blessing and courage over the recipient.",
      valueIdentityTitle: "Identity Reminders",
      valueIdentityDesc: "Designed as elegant tactile triggers to bring you back to Scripture and who you are in Him.",
      valuePurposeTitle: "Purpose Over Profit",
      valuePurposeDesc: "A dedicated portion of our proceeds is sown directly into bilingual ministry and community outreach.",
      
      // Catalog Section
      catalogTitle: "Spring Collection",
      catalogSubtitle: "Delicate accessories created to reflect and spread His grace in your day-to-day life.",
      tabAll: "All Accessories",
      tabCustom: "Custom Creations",
      tabHair: "Hair Bow & Clip Collections",
      tabKeychains: "Keychain Collections",
      tabIndividuals: "Bracelets & Individual Items",
      viewDetails: "View Details",
      soldOut: "Restocking Soon",
      
      // Modal translations
      close: "Close",
      modalBack: "Back to Catalog",
      modalCustomTitle: "Personalize Your Bracelet",
      modalInputLabel: "Custom Word / Phrase",
      modalInputPlaceholder: "e.g., GRACE, AMOR, BELOVED",
      modalBeadLabel: "Letter Bead Style",
      modalBeadsGold: "White Acrylic with Gold Lettering",
      modalBeadsPastel: "Pastel Colored Beads with Black Lettering",
      modalSizeLabel: "Wrist Size",
      modalSizeAdult: "Adult Size (approx. 7 inches)",
      modalSizeKids: "Kids Size (approx. 5.5 inches)",
      modalBtnAdd: "Add to Bag",
      modalBtnAdding: "Adding with love...",
      modalBtnSuccess: "Added to Bag! ✨",
      modalFreeShipping: "Ships beautifully inside custom protective crinkle paper boxes.",
      bagTitle: "Your Shopping Bag",
      bagEmpty: "Your bag is empty",
      bagEmptyText: "Add some faith-inspired hand-crafted accessories to remind you of His love!",
      bagTotal: "Subtotal",
      bagCheckout: "Place order with Love & Prayer",
      bagPromoFree: "Yay! You've unlocked Free Shipping! 📦✨",
      bagPromoUnder: "Add only ${amount} more for FREE Shipping! 🌸",
      bagGiftLabel: "Add a Scripture Encouragement Card (Free)",
      bagGiftPlaceholder: "Add a blessing, prayer request, or gift note...",
      bagCardSelector: "Select Scripture Card Style:",
      bagGiftNoteHeader: "Gift Note or Prayer Request",
      checkoutTitle: "Order Placed with Love! 🕊️",
      checkoutSubtitle: "We are preparing your beautiful items with love, care, and prayer.",
      checkoutNotice: "A notification will be sent once shipped inside our tactile crinkle paper packages.",
      checkoutBtnShop: "Continue Spreading Faith",
      
      // Footer
      footerSub: "made with love — para la gloria de Dios —",
      copyright: "Heavenly Goods LLC. All rights reserved. Proudly migrating from Wix to a premium TypeScript & React experience."
    },
    es: {
      announcement: "Hecho con amor para celebrar el amor de Dios • Soporte Bilingüe Activo",
      navHome: "Inicio",
      navMission: "Nuestra Misión",
      navCatalog: "Catálogo",
      navCraft: "Artesanía",
      heroBadge: "Identidad en Cristo",
      heroTitleOne: "Celebrando el",
      heroTitleTwo: "Amor de Dios",
      heroTitleThree: "a través de cada detalle",
      heroSubtitle: "Nuestra misión es recordarte tu identidad en Cristo. Cada accesorio y pulsera está hecho a mano con amor, diseñado para llevar un mensaje de fe, propósito y amor.",
      heroBtnExplore: "Explorar Catálogo",
      heroBtnStory: "Nuestra Historia",
      heroCardSub: "hecho con amor",
      heroCardText: '"Te alabaré; porque formidables, maravillosas son tus obras..."',
      heroCardVerse: "Salmo 139:14",
      heroCardFooter: "🌸 Accesorios de Fe Hechos a Mano 🌸",
      
      // Welcome Section
      welcomeBadge: "Donde la Belleza Comienza en el Corazón",
      welcomeTitle: "Bienvenidos a Heavenly Goods",
      welcomeText: "¡Bienvenidos a Heavenly Goods! – Donde hacemos más que crear hermosos accesorios. Cada lazo, pulsera, termo y llavero está diseñado para recordarnos nuestra identidad en Cristo. Creemos que la belleza comienza en el corazón, y nuestra misión es celebrar el amor de Dios a través de cada detalle. Cuando compras con nosotros, no solo estás adquiriendo artículos lindos—estás compartiendo un mensaje de fe, amor y propósito.",
      polaroidOneCap: "Creado con fe",
      polaroidTwoCap: "Detalles hechos a mano",
      
      // Core Values
      valuePrayerTitle: "Creado con Oración",
      valuePrayerDesc: "Cada pieza es tejida o ensamblada a mano mientras oramos por bendición y valor sobre quien la usará.",
      valueIdentityTitle: "Recordatorios de Identidad",
      valueIdentityDesc: "Diseñados como elegantes recordatorios táctiles para devolverte a las Escrituras y a quién eres en Él.",
      valuePurposeTitle: "Propósito sobre Ganancia",
      valuePurposeDesc: "Una porción dedicada de nuestras ganancias se siembra directamente en ministerios bilingües y apoyo comunitario.",
      
      // Catalog Section
      catalogTitle: "Colección de Primavera",
      catalogSubtitle: "Accesorios hermosos creados para reflejar y difundir Su gracia en tu día a día.",
      tabAll: "Todos los Accesorios",
      tabCustom: "Creaciones Personalizadas",
      tabHair: "Colecciones de Lazos y Pinzas",
      tabKeychains: "Colecciones de Llaveros",
      tabIndividuals: "Pulseras y Accesorios de Fe",
      viewDetails: "Ver Detalles",
      soldOut: "Próximo Reabastecimiento",
      
      // Modal translations
      close: "Cerrar",
      modalBack: "Volver al Catálogo",
      modalCustomTitle: "Personaliza tu Pulsera",
      modalInputLabel: "Palabra o Frase Personalizada",
      modalInputPlaceholder: "ej., GRACIA, AMOR, HIJA",
      modalBeadLabel: "Estilo de Cuentas",
      modalBeadsGold: "Acrílico Blanco con Letras Doradas",
      modalBeadsPastel: "Cuentas de Colores Pastel con Letras Negras",
      modalSizeLabel: "Tamaño de Muñeca",
      modalSizeAdult: "Tamaño Adulto (aprox. 7 pulgadas)",
      modalSizeKids: "Tamaño Infantil (aprox. 5.5 pulgadas)",
      modalBtnAdd: "Agregar al Carrito",
      modalBtnAdding: "Agregando con amor...",
      modalBtnSuccess: "¡Agregado al Carrito! ✨",
      modalFreeShipping: "Se envía hermosamente en cajas de papel viruta protectoras personalizadas.",
      bagTitle: "Tu Bolsa de Compras",
      bagEmpty: "Tu bolsa está vacía",
      bagEmptyText: "¡Agrega algunos accesorios de fe hechos a mano para recordarte Su amor!",
      bagTotal: "Subtotal",
      bagCheckout: "Realizar pedido con Amor y Oración",
      bagPromoFree: "¡Genial! ¡Has desbloqueado Envío Gratis! 📦✨",
      bagPromoUnder: "¡Agrega solo ${amount} más para ENVÍO GRATIS! 🌸",
      bagGiftLabel: "Agrega una Tarjeta con Versículo (Gratis)",
      bagGiftPlaceholder: "Agrega una bendición, petición de oración o nota de regalo...",
      bagCardSelector: "Selecciona el Estilo de la Tarjeta:",
      bagGiftNoteHeader: "Nota de Regalo o Petición de Oración",
      checkoutTitle: "¡Pedido Realizado con Amor! 🕊️",
      checkoutSubtitle: "Estamos preparando tus hermosos artículos con amor, cuidado y oración.",
      checkoutNotice: "Se enviará una notificación una vez enviado dentro de nuestros empaques de papel viruta.",
      checkoutBtnShop: "Seguir Difundiendo la Fe",
      
      // Footer
      footerSub: "hecho con amor — para la gloria de Dios —",
      copyright: "Heavenly Goods LLC. Todos los derechos reservados. Migrado orgullosamente de Wix a una experiencia premium en TypeScript y React."
    }
  };

  const current = translations[lang];

  // Robust product categorization logic derived from Firestore item IDs
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.id === 'our-story') return false; // Filter out story metadata
      if (p.stock === 0) return false; // Hide out of stock items
      if (activeTab === 'all') return true;
      if (activeTab === 'custom') return p.id.includes('create-your-own') || p.id.includes('resin-letter');
      if (activeTab === 'hair') return p.id.includes('crowned-in-grace');
      if (activeTab === 'keychains') return p.id.includes('keychain');
      if (activeTab === 'individuals') return p.id.includes('i-love-jesus');
      return true;
    });
  }, [products, activeTab]);

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setCustomWord('');
    setIsAdding(false);
    setModalImageIndex(0); // Reset carousel slide to first image when opening
    setSelectedOption(null); // Reset option variant when opening
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

  const handleAddToBagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsAdding(true);
    
    // Pick the selected image corresponding to the carousel index
    const imageToAdd = modalImages[modalImageIndex] || selectedProduct.heroImage || (selectedProduct.images && selectedProduct.images[0]) || '';
    
    const newCartItem: CartItem = {
      id: generateCartItemId(),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      selectedImage: imageToAdd,
      selectedOption: selectedOption?.label || undefined,
      customText: selectedProduct.hasCustomText && customWord.trim() ? customWord.trim() : undefined,
      quantity: 1,
    };

    setTimeout(() => {
      setCartItems(prev => {
        // Match product, option, and custom text to prevent duplicate line listings
        const existingIdx = prev.findIndex(item => 
          item.productId === newCartItem.productId &&
          item.selectedOption === newCartItem.selectedOption &&
          item.customText === newCartItem.customText
        );
        
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += 1;
          return updated;
        }
        return [...prev, newCartItem];
      });
      
      setIsAdding(false);

      // Spawn animation bubble and trigger pulse on cart button
      const bubbleId = Date.now();
      setBubbles(prevBub => [...prevBub, { id: bubbleId, text: '+1' }]);
      setCartPulsing(true);
      setTimeout(() => setCartPulsing(false), 1200);
      setTimeout(() => setBubbles(prevBub => prevBub.filter(b => b.id !== bubbleId)), 1200);
      
      // Auto-close modal and slide open the cart drawer!
      setTimeout(() => {
        handleCloseDetails();
        setIsBagOpen(true);
      }, 600);
    }, 1000);
  };


  // Image list and handlers for the product details modal carousel
  const modalImages = (() => {
    if (!selectedProduct) return [];
    const images = selectedProduct.images && selectedProduct.images.length > 0 
      ? selectedProduct.images 
      : [selectedProduct.heroImage || ""];
    return images.filter(img => img && !img.endsWith('.mp4'));
  })();

  const handleModalPrev = () => {
    setModalImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));
  };

  const handleModalNext = () => {
    setModalImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-brand-pink-soft font-sans flex flex-col selection:bg-brand-pink selection:text-brand-taupe-deep scroll-smooth">
      {/* Upper Announcement Bar */}
      <div className="bg-brand-taupe-deep text-brand-pink-soft text-xs py-2.5 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-2 relative z-50">
        <Sparkles size={12} className="text-brand-gold animate-pulse-slow" />
        <span className="tracking-wider text-[10px] sm:text-xs uppercase">{current.announcement}</span>
      </div>

      {/* Header */}
      <header className="border-b border-brand-pink/30 bg-white/60 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo / Brand */}
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-taupe-deep flex items-center gap-1.5 select-none">
              Heavenly Goods
              <span className="inline-block w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            </span>
            <span className="font-cursive text-lg text-brand-gold-dark/80 -mt-1.5 pl-0.5 select-none">
              {current.footerSub}
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-taupe-dark">
            <button 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="hover:text-brand-orange smooth-hover cursor-pointer bg-transparent border-0 font-medium"
            >
              {current.navHome}
            </button>
            <Link to="/about" className="hover:text-brand-orange smooth-hover">{current.navMission}</Link>
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="hover:text-brand-orange smooth-hover cursor-pointer bg-transparent border-0 font-medium"
            >
              {current.navCatalog}
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBilingual(!bilingual)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-pink/50 bg-white/80 hover:bg-brand-pink-light hover:border-brand-pink-dark text-xs font-semibold text-brand-taupe-dark transition-all duration-300 cursor-pointer shadow-sm"
              title="Change Language / Cambiar Idioma"
            >
              <Languages size={14} className="text-brand-orange" />
              <span>{bilingual ? 'EN / ES' : 'ES / EN'}</span>
            </button>
            <button 
              onClick={() => setIsBagOpen(true)}
              className={`p-2.5 rounded-full bg-brand-pink hover:bg-brand-pink-dark text-brand-taupe-deep transition-all duration-500 relative shadow-sm hover:shadow active:scale-95 cursor-pointer ${
                cartPulsing ? 'ring-4 ring-brand-orange/40 scale-110 border border-brand-orange' : ''
              }`}
            >
              <ShoppingBag size={18} />
              
              {/* Floating Bubbles */}
              {bubbles.map(bubble => (
                <span 
                  key={bubble.id} 
                  className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white animate-rise-fade pointer-events-none select-none z-30 shadow-md"
                >
                  {bubble.text}
                </span>
              ))}

              {bagCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-bounce">
                  {bagCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-brand-pink-soft to-white">
        {/* Delicate floating background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-brand-pink/30 blur-2xl animate-float" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-brand-orange-light/40 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Hero Content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink-light border border-brand-pink text-xs font-semibold text-brand-orange-dark shadow-sm">
              <Heart size={12} className="fill-brand-orange text-brand-orange animate-pulse" />
              <span>{current.heroBadge}</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-taupe-deep leading-tight">
              {current.heroTitleOne} <span className="text-brand-orange underline decoration-brand-pink decoration-wavy decoration-3 underline-offset-8">{current.heroTitleTwo}</span> {current.heroTitleThree}
            </h1>

            <p className="text-base sm:text-lg text-brand-taupe-dark max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-normal">
              {current.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#catalog"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>{current.heroBtnExplore}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/about"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-brand-pink-dark/50 bg-white/40 hover:bg-brand-pink-light font-semibold text-sm text-brand-taupe-deep transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Compass size={16} className="text-brand-gold animate-spin-slow" />
                <span>{current.heroBtnStory}</span>
              </Link>
            </div>
          </div>

          {/* Hero Visual Mockup - Endless Panning Product Cards Marquee */}
          <div className="flex-1 w-full max-w-lg relative">
            <div 
              className="aspect-[4/3] rounded-3xl bg-white border border-brand-pink/40 shadow-premium overflow-hidden relative group/hero-carousel w-full max-w-lg mx-auto"
            >
              {/* Textured backing pattern like crinkle paper */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-20" />
              
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-8 h-8 border-3 border-brand-pink border-t-brand-orange rounded-full animate-spin" />
                  <span className="font-serif text-xs text-brand-taupe-dark">Loading Boutique Showcase...</span>
                </div>
              ) : heroProducts.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl block animate-pulse">🌸</span>
                  <span className="text-xs text-brand-taupe-dark mt-2">Boutique items ready soon.</span>
                </div>
              ) : (
                <div className="absolute inset-0 p-4 overflow-hidden flex items-center justify-center">
                  {/* Endless scrolling marquee viewport */}
                  <div className="w-full h-full overflow-hidden relative rounded-2xl bg-brand-pink-light/20 shadow-inner flex items-center">
                    <div className="animate-marquee-pan flex gap-4 h-full p-2 items-center">
                      {/* Set 1 */}
                      {heroProducts.map((prod) => (
                        <div 
                          key={`${prod.id}-set1`}
                          onClick={() => handleOpenDetails(prod)}
                          className="w-[240px] sm:w-[280px] h-[92%] flex-shrink-0 relative overflow-hidden rounded-2xl border border-brand-pink/20 bg-white shadow-sm group/slide cursor-pointer transition-all duration-500 hover:border-brand-orange/40 hover:scale-[1.01]"
                        >
                          {/* Giant product image container */}
                          <div className="absolute inset-0 p-4 flex items-center justify-center bg-white transition-all duration-500">
                            <img 
                              src={prod.heroImage || prod.images[0]} 
                              alt={prod.name}
                              className="max-h-full max-w-full object-contain rounded-xl transition-transform duration-700 group-hover/slide:scale-105" 
                            />
                          </div>
                          
                          {/* Elegant hover drawer: hidden by default, slides up showing only name & price */}
                          <div className="absolute inset-x-0 bottom-0 bg-brand-taupe-deep/90 backdrop-blur-md p-4 text-center transform translate-y-full group-hover/slide:translate-y-0 transition-transform duration-500 ease-out z-10 flex flex-col justify-center items-center gap-2 border-t border-brand-pink/20">
                            <h3 className="font-serif text-xs sm:text-sm font-extrabold text-white leading-tight px-1 line-clamp-2">
                              {prod.name}
                            </h3>
                            <span className="text-white font-extrabold text-xs bg-brand-orange px-3 py-1 rounded-full border border-brand-orange-dark shadow-md">
                              ${prod.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Set 2 for seamless loop snappings */}
                      {heroProducts.map((prod) => (
                        <div 
                          key={`${prod.id}-set2`}
                          onClick={() => handleOpenDetails(prod)}
                          className="w-[240px] sm:w-[280px] h-[92%] flex-shrink-0 relative overflow-hidden rounded-2xl border border-brand-pink/20 bg-white shadow-sm group/slide cursor-pointer transition-all duration-500 hover:border-brand-orange/40 hover:scale-[1.01]"
                        >
                          {/* Giant product image container */}
                          <div className="absolute inset-0 p-4 flex items-center justify-center bg-white transition-all duration-500">
                            <img 
                              src={prod.heroImage || prod.images[0]} 
                              alt={prod.name}
                              className="max-h-full max-w-full object-contain rounded-xl transition-transform duration-700 group-hover/slide:scale-105" 
                            />
                          </div>
                          
                          {/* Elegant hover drawer: hidden by default, slides up showing only name & price */}
                          <div className="absolute inset-x-0 bottom-0 bg-brand-taupe-deep/90 backdrop-blur-md p-4 text-center transform translate-y-full group-hover/slide:translate-y-0 transition-transform duration-500 ease-out z-10 flex flex-col justify-center items-center gap-2 border-t border-brand-pink/20">
                            <h3 className="font-serif text-xs sm:text-sm font-extrabold text-white leading-tight px-1 line-clamp-2">
                              {prod.name}
                            </h3>
                            <span className="text-white font-extrabold text-xs bg-brand-orange px-3 py-1 rounded-full border border-brand-orange-dark shadow-md">
                              ${prod.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME / Our Story Section */}
      <section id="about" className="py-24 relative overflow-hidden texture-crinkle border-y border-brand-pink/30">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Column: Hand-crafted Polaroid Collage Grid */}
            <div className="flex-1 w-full flex justify-center relative">
              <div className="relative w-full max-w-md h-[400px]">
                
                {/* Polaroid 1 (Our Story Portrait) */}
                <div className="polaroid-card absolute top-4 left-2 sm:left-4 w-60 sm:w-64 rotate-[-2deg] z-10">
                  <div className="aspect-[4/5] rounded bg-brand-pink/5 overflow-hidden relative shadow-inner">
                    <img 
                      src="/images/products/our-story/our-story-1.jpg.avif" 
                      alt="Handmaking accessories" 
                      className="w-full h-full object-cover grayscale-[15%] contrast-[105%]"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="font-cursive text-2xl text-brand-taupe-deep block -rotate-1">
                      {current.polaroidOneCap}
                    </span>
                  </div>
                </div>

                {/* Polaroid 2 (Our Story Flatlay) */}
                <div className="polaroid-card absolute bottom-4 right-4 w-60 rotate-[4deg] z-0 hover:z-20">
                  <div className="aspect-[4/5] rounded bg-brand-pink/5 overflow-hidden relative shadow-inner">
                    <img 
                      src="/images/products/our-story/our-story-2.jpeg.avif" 
                      alt="Finished materials and bows" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="font-cursive text-2xl text-brand-gold-dark block rotate-1">
                      {current.polaroidTwoCap}
                    </span>
                  </div>
                </div>

                {/* Small handwritten card embellishment */}
                <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded border border-brand-gold/40 shadow-md rotate-[12deg] z-20 pointer-events-none text-center">
                  <span className="font-cursive text-lg text-brand-orange-dark block font-semibold">
                    made with love ❀
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Mission and Welcome Text */}
            <div className="flex-1 space-y-8">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest font-bold text-brand-orange-dark bg-brand-orange-light px-3 py-1 rounded-full inline-block">
                  {current.welcomeBadge}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-taupe-deep tracking-tight">
                  {current.welcomeTitle}
                </h2>
                <div className="h-1 w-20 bg-brand-orange rounded-full" />
              </div>

              {/* The Core Welcome Copy - beautifully highlighted in a custom foil-border box */}
              <div className="gold-foil-border rounded-2xl bg-white/70 p-8 shadow-sm relative overflow-hidden">
                {/* Crinkle/cracked background line embellishment */}
                <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                
                <p className="text-base text-brand-taupe-deep leading-relaxed font-medium italic select-text">
                  {current.welcomeText}
                </p>
              </div>

              {/* Faith Pillars Mini-Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-pink/50 flex items-center justify-center text-brand-orange-dark">
                      <Star size={14} className="fill-brand-orange-dark" />
                    </div>
                    <h3 className="font-bold text-xs text-brand-taupe-deep uppercase tracking-wider">{current.valuePrayerTitle}</h3>
                  </div>
                  <p className="text-[11px] text-brand-taupe-dark leading-relaxed">
                    {current.valuePrayerDesc}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-pink/50 flex items-center justify-center text-brand-orange-dark">
                      <Award size={14} className="fill-brand-orange-dark" />
                    </div>
                    <h3 className="font-bold text-xs text-brand-taupe-deep uppercase tracking-wider">{current.valueIdentityTitle}</h3>
                  </div>
                  <p className="text-[11px] text-brand-taupe-dark leading-relaxed">
                    {current.valueIdentityDesc}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-pink/50 flex items-center justify-center text-brand-orange-dark">
                      <Gift size={14} className="fill-brand-orange-dark" />
                    </div>
                    <h3 className="font-bold text-xs text-brand-taupe-deep uppercase tracking-wider">{current.valuePurposeTitle}</h3>
                  </div>
                  <p className="text-[11px] text-brand-taupe-dark leading-relaxed">
                    {current.valuePurposeDesc}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Catalog Preview / Main Shop Grid */}
      <section id="catalog" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-taupe-deep">
              {current.catalogTitle}
            </h2>
            <div className="h-1 w-20 bg-brand-orange mx-auto rounded-full" />
            <p className="text-sm text-brand-taupe-dark max-w-md mx-auto leading-relaxed">
              {current.catalogSubtitle}
            </p>
          </div>

          {/* Interactive Filtering Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-12 max-w-4xl mx-auto">
            {[
              { id: 'all', label: current.tabAll },
              { id: 'custom', label: current.tabCustom },
              { id: 'hair', label: current.tabHair },
              { id: 'keychains', label: current.tabKeychains },
              { id: 'individuals', label: current.tabIndividuals }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'custom' | 'hair' | 'keychains' | 'individuals')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-orange text-white shadow-md scale-105 border border-brand-orange'
                    : 'bg-brand-pink-soft text-brand-taupe-deep border border-brand-pink/50 hover:bg-brand-pink-light hover:border-brand-pink-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-brand-pink border-t-brand-orange rounded-full animate-spin" />
                <span className="font-serif text-brand-taupe-dark text-lg animate-pulse-slow">Loading Heavenly Accessories...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-brand-pink-soft/20 rounded-3xl border border-dashed border-brand-pink/50">
                <span className="text-3xl block mb-2">🌸</span>
                <p className="text-brand-taupe-dark text-sm font-semibold">No items match this category currently.</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={handleOpenDetails}
                  viewDetailsText={current.viewDetails}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Shopping Bag slide-in Drawer Panel */}
      {isBagOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setIsBagOpen(false)}
            className="absolute inset-0 bg-brand-taupe-deep/40 backdrop-blur-md transition-opacity cursor-pointer" 
          />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-brand-pink/30 shadow-2xl relative flex flex-col animate-slide-in texture-crinkle">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-brand-pink/20 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="font-serif text-2xl font-bold text-brand-taupe-deep flex items-center gap-2">
                  <ShoppingBag className="text-brand-orange" />
                  {current.bagTitle}
                </h3>
                <button 
                  onClick={() => setIsBagOpen(false)}
                  className="p-2 rounded-full border border-brand-pink/30 text-brand-taupe hover:text-brand-orange hover:scale-105 transition-all cursor-pointer bg-white"
                  title={current.close}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Body */}
              <div 
                className="flex-1 overflow-y-auto p-6 space-y-6"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >

                
                {/* Free Shipping Progress Indicator (Free shipping over $35) */}
                {cartItems.length > 0 && (
                  <div className="bg-brand-pink-light/40 border border-brand-pink/30 rounded-2xl p-4 text-center space-y-2">
                    {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) >= 35 ? (
                      <div className="text-xs font-bold text-brand-orange-dark flex items-center justify-center gap-1.5 animate-bounce">
                        {current.bagPromoFree}
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-brand-taupe-dark">
                        {current.bagPromoUnder.replace('{amount}', (35 - cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2))}
                      </div>
                    )}
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-brand-pink/30 rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className="bg-brand-orange h-full rounded-full transition-all duration-700" 
                        style={{ 
                          width: `${Math.min(100, (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) / 35) * 100)}%` 
                        }} 
                      />
                    </div>
                  </div>
                )}

                {/* Empty Cart State */}
                {cartItems.length === 0 ? (
                  <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-5xl block animate-pulse">🌸</span>
                    <h4 className="font-serif text-lg font-bold text-brand-taupe-deep">{current.bagEmpty}</h4>
                    <p className="text-xs text-brand-taupe leading-relaxed max-w-[250px] mx-auto">{current.bagEmptyText}</p>
                    <button 
                      onClick={() => setIsBagOpen(false)}
                      className="px-6 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs transition-all shadow hover:shadow-md cursor-pointer uppercase tracking-wider"
                    >
                      {current.heroBtnExplore}
                    </button>
                  </div>
                ) : (
                  /* Cart Items List */
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const prod = products.find(p => p.id === item.productId);
                      return (
                        <div key={item.id} className="flex gap-4 bg-brand-pink-soft/10 border border-brand-pink/15 p-4 rounded-2xl relative shadow-sm hover:shadow-md transition-shadow group/item">
                          
                          {/* Image preview with custom saved aspect/zoom */}
                          <div className="w-20 h-20 rounded-xl bg-brand-pink-light flex-shrink-0 overflow-hidden border border-brand-pink/20 flex items-center justify-center relative shadow-inner">
                            <img 
                              src={item.selectedImage} 
                              alt={item.name} 
                              style={{ 
                                objectFit: prod?.imageScales?.[item.selectedImage] && prod.imageScales[item.selectedImage] < 1.0 ? 'contain' : 'cover', 
                                objectPosition: prod?.imagePositions?.[item.selectedImage] || '50% 50%',
                                transform: `scale(${prod?.imageScales?.[item.selectedImage] || 1.0})`
                              }}
                              className="w-full h-full" 
                            />
                          </div>

                          {/* Item details */}
                          <div className="flex-1 min-w-0 pr-6">
                            <h4 className="font-bold text-sm text-brand-taupe-deep truncate mb-0.5">{item.name}</h4>
                            <div className="text-[10px] font-extrabold text-brand-orange-dark mb-2">${item.price.toFixed(2)}</div>
                            
                            {/* Option variant badge */}
                            {item.selectedOption && (
                              <span className="inline-block text-[9px] font-bold bg-brand-pink-light text-brand-orange-dark px-2.5 py-0.5 rounded-full border border-brand-pink/40 shadow-sm mr-2 mb-1.5 select-none animate-scale-up">
                                {item.selectedOption}
                              </span>
                            )}

                            {/* Personalization custom text badge */}
                            {item.customText && (
                              <div className="text-[9px] text-brand-taupe-dark flex items-center gap-1 mb-2">
                                <span className="font-bold">Prompt:</span>
                                <span className="font-cursive font-bold text-brand-gold-dark text-xs select-none">"{item.customText}"</span>
                              </div>
                            )}

                            {/* Quantity and Actions bar */}
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center border border-brand-pink/30 rounded-full bg-white px-2 py-0.5 shadow-sm">
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold text-brand-taupe hover:text-brand-orange transition-colors cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-brand-taupe-deep">{item.quantity}</span>
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, 1)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold text-brand-taupe hover:text-brand-orange transition-colors cursor-pointer"
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Delete Item Trash Trigger */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors cursor-pointer shadow-sm hover:scale-105 active:scale-95 z-10"
                            title="Remove from bag"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Gift scripture note options */}
                {cartItems.length > 0 && (
                  <div className="border-t border-brand-pink/20 pt-6 space-y-4">
                    <h4 className="font-serif text-sm font-bold text-brand-taupe-deep flex items-center gap-1.5">
                      <Gift size={16} className="text-brand-gold-dark animate-float" />
                      {current.bagGiftLabel}
                    </h4>

                    {/* Scripture Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-brand-taupe uppercase tracking-wider select-none">
                        {current.bagCardSelector}
                      </label>
                      <select 
                        value={scriptureCard}
                        onChange={(e) => setScriptureCard(e.target.value)}
                        className="w-full text-xs bg-brand-pink-soft/10 border border-brand-pink/40 rounded-xl p-2.5 font-bold text-brand-taupe-dark focus:outline-none focus:border-brand-orange cursor-pointer"
                      >
                        <option value="Psalm 139:14">Psalm 139:14 — "Fearfully & Wonderfully Made" (Salmo 139:14)</option>
                        <option value="2 Timothy 1:7">2 Timothy 1:7 — "Power, Love & Sound Mind" (2 Timoteo 1:7)</option>
                        <option value="2 Corinthians 5:17">2 Corinthians 5:17 — "A New Creation" (2 Corintios 5:17)</option>
                        <option value="Proverbs 31:25">Proverbs 31:25 — "Clothed with Strength & Dignity" (Proverbios 31:25)</option>
                        <option value="Jeremiah 29:11">Jeremiah 29:11 — "Hope and a Future" (Jeremías 29:11)</option>
                      </select>
                    </div>

                    {/* Gift note input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-brand-taupe uppercase tracking-wider select-none">
                        {current.bagGiftNoteHeader}
                      </label>
                      <textarea
                        rows={2}
                        value={giftNote}
                        onChange={(e) => setGiftNote(e.target.value)}
                        placeholder={current.bagGiftPlaceholder}
                        className="w-full text-xs bg-brand-pink-soft/10 border border-brand-pink/40 rounded-xl p-3 text-brand-taupe-dark focus:outline-none focus:border-brand-orange"
                      />
                    </div>

                    {/* Scripture Preview Card */}
                    <div className="mt-4 p-5 rounded-2xl bg-white border border-brand-pink/30 shadow-md relative overflow-hidden transition-all duration-300 transform hover:scale-[1.01] select-none">
                      {/* crinkle texture and gold foil outline */}
                      <div className="absolute inset-0 texture-crinkle opacity-35 pointer-events-none" />
                      <div className="absolute inset-1.5 border border-brand-gold/30 rounded-xl pointer-events-none" />
                      
                      {/* Card Content */}
                      <div className="relative z-10 text-center space-y-3 px-1 py-0.5">
                        <div className="flex justify-between items-center text-brand-gold-dark/60 text-[9px] font-sans font-bold uppercase tracking-widest">
                          <span>Heavenly Goods</span>
                          <span className="text-xs animate-float">🕊️</span>
                          <span>{bilingual ? 'Tarjeta de Fe' : 'Faith Card'}</span>
                        </div>
                        
                        <div className="w-6 h-6 mx-auto rounded-full bg-brand-pink-light flex items-center justify-center border border-brand-pink/30 text-xs">
                          🌸
                        </div>
                        
                        {/* Scripture Verse Text */}
                        <div className="space-y-1">
                          <p className="text-xs italic text-brand-taupe-deep font-serif leading-relaxed font-semibold px-2">
                            {lang === 'es' 
                              ? scriptureVerses[scriptureCard as keyof typeof scriptureVerses]?.textEs 
                              : scriptureVerses[scriptureCard as keyof typeof scriptureVerses]?.text}
                          </p>
                          <p className="text-[9px] font-bold text-brand-orange-dark uppercase tracking-widest font-sans mt-1">
                            — {lang === 'es' 
                              ? scriptureVerses[scriptureCard as keyof typeof scriptureVerses]?.refEs 
                              : scriptureVerses[scriptureCard as keyof typeof scriptureVerses]?.ref} —
                          </p>
                        </div>

                        {/* Hand-made with love signature */}
                        <div className="border-t border-brand-pink/15 pt-2 flex flex-col items-center">
                          <span className="font-cursive text-brand-gold-dark text-lg leading-none -mt-1 select-none">
                            {lang === 'es' ? 'hecho con amor' : 'made with love'}
                          </span>
                          <span className="text-[7px] text-brand-taupe/70 tracking-wide uppercase mt-1">
                            Heavenly Goods Co.
                          </span>
                        </div>

                        {/* Live Gift Message Preview */}
                        {giftNote.trim() && (
                          <div className="mt-2.5 pt-2 border-t border-dashed border-brand-pink/20 text-left">
                            <span className="text-[8px] font-bold text-brand-taupe uppercase tracking-wider block mb-1">
                              {lang === 'es' ? 'Mensaje o Petición de Oración:' : 'Message or Prayer Request:'}
                            </span>
                            <p className="text-[10px] text-brand-taupe-dark italic bg-brand-pink-light/30 p-2.5 rounded-lg border border-brand-pink/10 shadow-inner font-sans leading-relaxed break-words whitespace-pre-wrap">
                              "{giftNote.trim()}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                )}

              </div>

              {/* Drawer Footer Checkout Panel */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-brand-pink/20 bg-white/80 backdrop-blur-sm sticky bottom-0 z-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-brand-taupe">{current.bagTotal}</span>
                    <span className="font-serif text-2xl font-extrabold text-brand-orange-dark">
                      ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    disabled={isCheckingOut}
                    onClick={async () => {
                      setIsCheckingOut(true);
                      try {
                        const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
                        // Get Stripe Price IDs from products collection data
                        const cartWithStripe = cartItems.map(item => {
                          const prod = products.find(p => p.id === item.productId);
                          return {
                            ...item,
                            stripePriceId: prod?.stripePriceId || 'price_missing'
                          };
                        });
                        const response = await createCheckoutSession({ cartItems: cartWithStripe }) as { data: { url: string } };
                        window.location.href = response.data.url;
                      } catch (error) {
                        console.error('Checkout error:', error);
                        // Fallback to the mockup if Stripe fails or isn't set up yet
                        setIsBagOpen(false);
                        setIsCheckoutMockOpen(true);
                      } finally {
                        setIsCheckingOut(false);
                      }
                    }}
                    className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow hover:shadow-md active:scale-[0.99] gold-foil-border uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span>{isCheckingOut ? 'Loading...' : `🕊️ ${current.bagCheckout}`}</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Elegant Checkout Success Dialog Overlay Mockup */}
      {isCheckoutMockOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-6 animate-fade-in">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setIsCheckoutMockOpen(false)}
            className="absolute inset-0 bg-brand-taupe-deep/40 backdrop-blur-md transition-opacity cursor-pointer" 
          />
          
          {/* Mockup Dialog Card Body */}
          <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-brand-pink/40 shadow-2xl relative text-center space-y-6 animate-scale-up z-10 texture-crinkle">
            <span className="text-6xl block animate-float">🕊️</span>
            
            <div className="space-y-2">
              <h3 className="font-serif text-3xl font-bold text-brand-taupe-deep tracking-tight">
                {current.checkoutTitle}
              </h3>
              <p className="font-cursive text-brand-gold text-lg select-none">made with love — para la gloria de Dios</p>
            </div>

            <div className="p-5 bg-brand-pink-soft/30 border border-brand-pink/30 rounded-2xl space-y-4 shadow-inner text-left max-h-56 overflow-y-auto">
              <div className="font-serif text-xs font-bold text-brand-taupe uppercase tracking-wider border-b border-brand-pink/20 pb-2 mb-2 select-none">
                ⛪ Order Summary & Encouragement Details
              </div>
              
              {/* Items details list */}
              <div className="space-y-2.5">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-brand-taupe-dark">
                    <span className="truncate pr-4 flex-1">
                      <span className="font-bold">{item.quantity}x</span> {item.name} 
                      {item.selectedOption && <span className="text-[10px] text-brand-orange-dark ml-1 select-none">({item.selectedOption})</span>}
                      {item.customText && <span className="text-[10px] text-brand-gold-dark font-cursive ml-1 block select-none">"{item.customText}"</span>}
                    </span>
                    <span className="font-bold text-brand-taupe-deep">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Gift Scripture Encoded details */}
              <div className="border-t border-brand-pink/20 pt-3 mt-3 space-y-2 select-none">
                <div className="text-[10px] font-extrabold text-brand-taupe uppercase tracking-wider">
                  📖 Scripture Card Included:
                </div>
                <div className="text-xs italic text-brand-gold-dark font-serif font-bold">
                  {scriptureCard} — {scriptureCard === 'Psalm 139:14' ? '"Fearfully & Wonderfully Made"' : scriptureCard === '2 Timothy 1:7' ? '"Power, Love & Sound Mind"' : scriptureCard === '2 Corinthians 5:17' ? '"A New Creation"' : scriptureCard === 'Proverbs 31:25' ? '"Clothed with Strength & Dignity"' : '"Hope and a Future"'}
                </div>
                {giftNote.trim() && (
                  <>
                    <div className="text-[10px] font-extrabold text-brand-taupe uppercase tracking-wider pt-1.5">
                      ✍️ Gift Message / Prayer Request:
                    </div>
                    <div className="text-xs text-brand-taupe-dark italic bg-white p-2.5 rounded-xl border border-brand-pink/10 shadow-sm leading-relaxed">
                      "{giftNote.trim()}"
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-brand-taupe leading-relaxed px-2">
                {current.checkoutSubtitle} <br />
                <span className="font-semibold text-brand-orange-dark">{current.checkoutNotice}</span>
              </p>

              <div className="flex justify-between items-center px-4 py-3 bg-brand-pink-light/40 border border-brand-pink/20 rounded-xl select-none">
                <span className="text-xs font-bold text-brand-taupe uppercase tracking-wider">Amount Simulated:</span>
                <span className="font-serif text-xl font-extrabold text-brand-orange-dark">
                  ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setCartItems([]);
                setGiftNote('');
                setIsCheckoutMockOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-dark text-white font-extrabold text-sm transition-all duration-300 cursor-pointer shadow hover:shadow-md uppercase tracking-wider select-none"
            >
              {current.checkoutBtnShop}
            </button>
          </div>
        </div>
      )}

      {/* Product Details Modal Dialog */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-brand-taupe-deep/40 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-brand-pink/40 shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-scale-up max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseDetails}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 shadow border border-brand-pink/30 text-brand-taupe-deep hover:text-brand-orange transition-colors hover:scale-105 active:scale-95 cursor-pointer z-10"
              title={current.close}
            >
              <X size={18} />
            </button>

            {/* Left Side: Product Image Showcase with interactive carousel */}
            <div className="flex-1 bg-brand-pink-soft/20 p-6 flex flex-col items-center justify-center border-r border-brand-pink/20 relative md:max-h-[500px] min-h-[300px]">
              <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white border border-brand-pink/30 shadow-md flex items-center justify-center relative group/modal-carousel min-h-[250px] p-4">
                {modalImages.length > 0 ? (
                  <div 
                    className="flex transition-transform duration-500 ease-out w-full h-full"
                    style={{ transform: `translateX(-${modalImageIndex * 100}%)` }}
                  >
                    {modalImages.map((img, idx) => (
                      <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                        <img 
                          src={img} 
                          alt={selectedProduct.name} 
                          style={{ 
                            objectPosition: selectedProduct.imagePositions?.[img] || '50% 50%',
                            transform: `scale(${selectedProduct.imageScales?.[img] || 1.0})`
                          }}
                          className="w-full h-auto max-h-[340px] object-contain rounded-xl transition-all duration-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-6xl">✨</span>
                )}

                {/* Left/Right Chevrons for modal carousel */}
                {modalImages.length > 1 && (
                  <>
                    <button
                      onClick={handleModalPrev}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 border border-brand-pink/20 hover:bg-white text-brand-taupe-deep hover:text-brand-orange transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95 z-20"
                      title="Previous Image"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleModalNext}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 border border-brand-pink/20 hover:bg-white text-brand-taupe-deep hover:text-brand-orange transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95 z-20"
                      title="Next Image"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Dot Indicators at the bottom of modal images */}
                {modalImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-sm z-20">
                    {modalImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          modalImageIndex === idx ? 'bg-brand-orange w-3.5' : 'bg-white/60 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Subtitle brand tag */}
              <span className="absolute bottom-4 left-6 font-cursive text-2xl text-brand-gold-dark/60 select-none">
                Heavenly Goods
              </span>
            </div>

            {/* Right Side: Product Customization & Checkout Details */}
            <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto max-h-[500px] md:max-h-[none]">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-orange-dark block mb-1">
                    {selectedProduct.verbiage || "Faith Accessory"}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-brand-taupe-deep leading-tight">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-extrabold text-brand-orange-dark">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] bg-brand-gold-light text-brand-gold-dark font-extrabold px-2 py-0.5 rounded border border-brand-gold/10 uppercase tracking-wider">
                      Hand-crafted
                    </span>
                  </div>
                  {selectedProduct.stock != null && selectedProduct.stock > 0 && selectedProduct.stock <= 5 && (
                    <div className="mt-2 text-xs font-bold text-brand-orange-dark bg-brand-orange-light/40 border border-brand-orange/20 px-3 py-1.5 rounded-lg inline-block">
                      {bilingual ? `¡Solo quedan ${selectedProduct.stock} en stock!` : `Only ${selectedProduct.stock} left in stock!`}
                    </div>
                  )}
                </div>

                <div className="h-[1px] bg-brand-pink/30" />

                <div className="space-y-2">
                  <p className="text-xs text-brand-taupe-dark leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Dynamic Product Options / Variants Section */}
                {selectedProduct.options && selectedProduct.options.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <label className="block text-[11px] font-bold text-brand-taupe uppercase tracking-wider select-none">
                      {bilingual ? "Elige tu Variante / Estilo" : "Select Your Option / Style"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedOption(opt);
                            // Auto-transition modal image carousel if tethered image exists
                            if (opt.imageTether) {
                              const tetherIdx = modalImages.indexOf(opt.imageTether);
                              if (tetherIdx !== -1) {
                                setModalImageIndex(tetherIdx);
                              }
                            }
                          }}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm ${
                            selectedOption?.label === opt.label
                              ? 'border-brand-orange bg-brand-orange-light/40 text-brand-orange-dark shadow scale-[1.02]'
                              : 'border-brand-pink/50 hover:bg-brand-pink-light/20 text-brand-taupe-dark'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Custom Textbox Section */}
                {selectedProduct.hasCustomText && (
                  <form onSubmit={handleAddToBagSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-brand-taupe uppercase tracking-wider">
                        {selectedProduct.customTextLabel || current.modalInputLabel} <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        maxLength={20}
                        placeholder={selectedProduct.customTextLabel || current.modalInputPlaceholder}
                        value={customWord}
                        onChange={e => setCustomWord(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-brand-pink bg-brand-pink-light/20 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-semibold uppercase text-brand-taupe-deep placeholder:normal-case placeholder:font-normal shadow-sm"
                      />
                    </div>

                    {/* Keep static bead/wrist options ONLY for the customizable bracelets card for back-compat */}
                    {selectedProduct.id.includes('create-your-own') && (
                      <>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-brand-taupe uppercase tracking-wider">
                            {current.modalBeadLabel}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'gold-white', label: current.modalBeadsGold },
                              { id: 'pastel', label: current.modalBeadsPastel }
                            ].map(bead => (
                              <button
                                key={bead.id}
                                type="button"
                                onClick={() => setBeadType(bead.id)}
                                className={`p-2.5 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer flex flex-col justify-center items-center gap-1 ${
                                  beadType === bead.id
                                    ? 'border-brand-orange bg-brand-orange-light/40 text-brand-orange-dark'
                                    : 'border-brand-pink/50 hover:border-brand-pink hover:bg-brand-pink-light/10 text-brand-taupe-dark'
                                }`}
                              >
                                <span>{bead.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-brand-taupe uppercase tracking-wider">
                            {current.modalSizeLabel}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'adult', label: current.modalSizeAdult },
                              { id: 'kids', label: current.modalSizeKids }
                            ].map(sz => (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() => setBraceletSize(sz.id)}
                                className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                                  braceletSize === sz.id
                                    ? 'border-brand-orange bg-brand-orange-light/40 text-brand-orange-dark'
                                    : 'border-brand-pink/50 hover:border-brand-pink hover:bg-brand-pink-light/10 text-brand-taupe-dark'
                                }`}
                              >
                                {sz.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </form>
                )}

              </div>

              {/* Add to Bag and Shipping block */}
              <div className="mt-8 space-y-4">
                <button
                  disabled={isAdding || (selectedProduct.hasCustomText && !customWord.trim()) || (selectedProduct.stock != null && cartItems.filter(i => i.productId === selectedProduct.id).reduce((sum, i) => sum + i.quantity, 0) >= selectedProduct.stock)}
                  onClick={handleAddToBagSubmit}
                  className={`w-full py-3.5 rounded-xl text-white font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    isAdding 
                      ? 'bg-brand-taupe bg-opacity-70' 
                      : (selectedProduct.hasCustomText && !customWord.trim())
                        ? 'bg-brand-taupe/40'
                        : 'bg-brand-orange hover:bg-brand-orange-dark hover:shadow-lg active:scale-[0.98]'
                  }`}
                >
                  {isAdding ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{current.modalBtnAdding}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>{current.modalBtnAdd}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-[10px] text-brand-taupe justify-center">
                  <Clock size={12} className="text-brand-gold-dark" />
                  <span>{current.modalFreeShipping}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-brand-pink/30 bg-brand-taupe-deep text-brand-pink-soft py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-serif text-xl font-bold">Heavenly Goods</span>
            <span className="font-cursive text-md text-brand-gold">{current.footerSub}</span>
          </div>
          <p className="text-xs text-brand-taupe/80 text-center md:text-right leading-relaxed max-w-md">
            &copy; {new Date().getFullYear()} {current.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}

// Dedicated stateful ProductCard component for premium responsive image carousels
interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  viewDetailsText: string;
}

function ProductCard({ product, onOpenDetails, viewDetailsText }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.heroImage || ""];

  // Filter out any mp4 files if present in images lists for carousel
  const imageFiles = images.filter(img => !img.endsWith('.mp4'));

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageFiles.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === imageFiles.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      onClick={() => onOpenDetails(product)}
      className="rounded-3xl border border-brand-pink/30 hover:border-brand-pink-dark/50 bg-brand-pink-soft/20 hover:bg-white p-6 transition-all duration-500 flex flex-col justify-between group shadow-premium hover:-translate-y-2 hover:shadow-lg relative overflow-hidden cursor-pointer"
    >
      {/* Miniature decorative flower watermark */}
      <span className="absolute -bottom-4 -right-4 text-brand-pink/10 text-8xl pointer-events-none select-none font-cursive">❀</span>
      
      <div className="space-y-4 relative z-10">
        {/* Carousel Image Container - No strict aspect ratio for natural product photo shapes */}
        <div className="w-full rounded-2xl bg-brand-pink-light/40 flex items-center justify-center overflow-hidden relative border border-brand-pink/10 group/carousel min-h-[220px] shadow-inner">
          {imageFiles.length > 0 ? (
            <div 
              className="flex transition-transform duration-500 ease-out w-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {imageFiles.map((img, idx) => (
                <div key={idx} className="w-full flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={img} 
                    alt={product.name} 
                    style={{ 
                      objectPosition: product.imagePositions?.[img] || '50% 50%',
                      transform: `scale(${product.imageScales?.[img] || 1.0})`
                    }}
                    className="w-full h-auto max-h-[350px] object-contain rounded-2xl transition-all duration-500" 
                  />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-4xl text-brand-pink-dark animate-pulse-slow">✨</span>
          )}

          {/* Carousel Chevrons (Fade in on hover of the image area) */}
          {imageFiles.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/85 border border-brand-pink/20 hover:bg-white text-brand-taupe-deep hover:text-brand-orange transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 cursor-pointer shadow active:scale-90 z-20"
                title="Previous Image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/85 border border-brand-pink/20 hover:bg-white text-brand-taupe-deep hover:text-brand-orange transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 cursor-pointer shadow active:scale-90 z-20"
                title="Next Image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Dot Indicators at the bottom */}
          {imageFiles.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-sm z-20 animate-fade-in">
              {imageFiles.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentImageIndex === idx ? 'bg-brand-orange w-3' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif text-lg font-extrabold text-brand-taupe-deep leading-tight tracking-tight group-hover:text-brand-orange-dark transition-colors duration-300">
              {product.name}
            </h3>
            <span className="text-brand-orange-dark font-extrabold text-sm bg-brand-orange-light px-3 py-1 rounded-full whitespace-nowrap border border-brand-orange/10 shadow-sm">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(product);
        }}
        className="mt-6 w-full py-3 rounded-full border-2 border-brand-pink hover:border-brand-pink-dark bg-white hover:bg-brand-pink-light text-xs font-bold text-brand-taupe-deep transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
      >
        <span>{viewDetailsText}</span>
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
