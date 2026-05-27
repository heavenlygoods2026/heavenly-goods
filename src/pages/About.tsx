import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  Languages, 
  Compass, 
  ArrowRight, 
  Gift 
} from 'lucide-react';

export default function About() {
  const [bilingual, setBilingual] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hg_bilingual') === 'true';
    } catch {
      return false;
    }
  });

  const [bagCount, setBagCount] = useState(0);

  // Synchronize dynamic user selections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hg_bilingual', String(bilingual));
    } catch (e) {
      console.warn("Failed to persist language setting", e);
    }
  }, [bilingual]);

  // Synchronize bag count from localStorage
  useEffect(() => {
    const syncBag = () => {
      try {
        const saved = localStorage.getItem('hg_cart');
        const items = saved ? JSON.parse(saved) : [];
        const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setBagCount(count);
      } catch {
        setBagCount(0);
      }
    };

    syncBag();
    window.addEventListener('storage', syncBag);
    return () => window.removeEventListener('storage', syncBag);
  }, []);

  const lang = bilingual ? 'es' : 'en';

  const translations = {
    en: {
      announcement: "Made with love to celebrate God’s love • Bilingual Support Active",
      navHome: "Home",
      navMission: "Our Mission",
      navCatalog: "Catalog",
      navAbout: "About Us",
      
      // Hero Header
      heroBadge: "A Journey of Purpose",
      heroTitle: "Created with Love, Purpose & Prayer",
      heroSubtitle: "Welcome to Heavenly Goods – where we seek to honor God and remind you of your identity in Christ through every hand-crafted detail.",
      
      // The Brand Section
      brandTitle: "The Brand",
      brandBadge: "Our Foundation",
      brandP1: "Welcome to Heavenly Goods, a faith-based small business created with love, purpose, and prayer. Our mission is to serve others through products that reflect beauty, care, and the goodness of God. From handmade keychains and hair accessories to natural lotions, oils, and treatments, everything we offer is crafted with intentionality and gratitude.",
      brandP2: "We believe that every product should carry not just quality, but a message of hope, love, and faith. Our goal is to bless others through our work, using the gifts God has given us to encourage and inspire.",
      brandP3: "Thank you for supporting our small business. Every order is more than a purchase - it's part of a purpose-driven journey. We pray that our Products bring joy, peace, and blessings to your life.",
      polaroidBrand: "Crafted with faith",
      polaroidFamily: "Made with love",
      
      // About Me Section
      meTitle: "About me & my family",
      meBadge: "From our Home to Yours",
      meP1: "Hi! I'm Nidia, and this little business is a dream that grew from my home and heart. As a wife and a mom of 4, my days are full of love, laughter, and hard work - and God is the center of it all.",
      meP2: "Together, with the help of my husband and our children, we've built this small business with prayer, patience, and faith. Every product - is made with love and by the design that God has given me.",
      meP3: "This is our family project and a way to share a piece of who we are. Through our work, we seek to honor God teaching our children the value of working with integrity, serving others and trusting God in every step of the way.",
      
      // Scripture Card
      scriptureTitle: "Scripture Backing Card",
      scriptureVerse: "“I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.”",
      scriptureRef: "Psalm 139:14",
      
      // Core Values
      valuesTitle: "Boutique Values",
      value1Title: "Faith First",
      value1Desc: "God is at the center of everything we do, guide, and create.",
      value2Title: "Bilingual Joy",
      value2Desc: "Crafting products for diverse families in both English and Spanish.",
      value3Title: "Tactile Packaging",
      value3Desc: "Every order is packaged inside custom crinkle viruta box elements.",
      
      // CTA
      ctaTitle: "Spread Love and Faith",
      ctaSubtitle: "Explore our collection of custom creations, hair bows, and bilingual keychains.",
      ctaBtn: "Browse Catalog",
      
      // Footer
      footerSub: "made with love — para la gloria de Dios —",
      copyright: "Heavenly Goods LLC. All rights reserved. Proudly migrating from Wix to a premium TypeScript & React experience."
    },
    es: {
      announcement: "Hecho con amor para celebrar el amor de Dios • Soporte Bilingüe Activo",
      navHome: "Inicio",
      navMission: "Nuestra Misión",
      navCatalog: "Catálogo",
      navAbout: "Sobre Nosotros",
      
      // Hero Header
      heroBadge: "Un Camino con Propósito",
      heroTitle: "Creado con Amor, Propósito y Oración",
      heroSubtitle: "Bienvenidos a Heavenly Goods – donde buscamos honrar a Dios y recordarte tu identidad en Cristo a través de cada detalle hecho a mano.",
      
      // The Brand Section
      brandTitle: "La Marca",
      brandBadge: "Nuestra Fundación",
      brandP1: "Bienvenidos a Heavenly Goods, una pequeña empresa basada en la fe, creada con amor, propósito y oración. Nuestra misión es servir a los demás a través de productos que reflejen belleza, cuidado y la bondad de Dios. Desde llaveros hechos a mano y accesorios para el cabello hasta lociones naturales, aceites y tratamientos, todo lo que ofrecemos está elaborado con intencionalidad y gratitud.",
      brandP2: "Creemos que cada producto debe llevar no solo calidad, sino también un mensaje de esperanza, amor y fe. Nuestro objetivo es bendecir a otros a través de nuestro trabajo, utilizando los dones que Dios nos ha dado para alentar e inspirar.",
      brandP3: "Gracias por apoyar a nuestra pequeña empresa. Cada pedido es más que una compra: es parte de un viaje impulsado por un propósito. Oramos para que nuestros productos traigan alegría, paz y bendiciones a su vida.",
      polaroidBrand: "Creado con fe",
      polaroidFamily: "Hecho con amor",
      
      // About Me Section
      meTitle: "Sobre mí y mi familia",
      meBadge: "De Nuestro Hogar al Tuyo",
      meP1: "¡Hola! Soy Nidia, y este pequeño negocio es un sueño que creció desde mi hogar y mi corazón. Como esposa y madre de 4 hijos, mis días están llenos de amor, risas y trabajo duro, y Dios es el centro de todo.",
      meP2: "Juntos, con la ayuda de mi esposo y nuestros hijos, hemos construido esta pequeña empresa con oración, paciencia y fe. Cada producto está hecho con amor y bajo el diseño que Dios me ha dado.",
      meP3: "Este es nuestro proyecto familiar y una forma de compartir una parte de lo que somos. A través de nuestro trabajo, buscamos honrar a Dios enseñando a nuestros hijos el valor de trabajar con integridad, servir a los demás y confiar en Dios en cada paso del camino.",
      
      // Scripture Card
      scriptureTitle: "Tarjeta de Versículo",
      scriptureVerse: "“Te alabaré; porque formidables, maravillosas son tus obras; estoy maravillado, y mi alma lo sabe muy bien.”",
      scriptureRef: "Salmo 139:14",
      
      // Core Values
      valuesTitle: "Valores de la Tienda",
      value1Title: "Fe Primero",
      value1Desc: "Dios está en el centro de todo lo que hacemos, guiamos y creamos.",
      value2Title: "Alegría Bilingüe",
      value2Desc: "Diseñando productos para familias diversas tanto en inglés como en español.",
      value3Title: "Empaque Táctil",
      value3Desc: "Cada pedido se empaca cuidadosamente dentro de cajas con papel viruta personalizado.",
      
      // CTA
      ctaTitle: "Difunde el Amor y la Fe",
      ctaSubtitle: "Explora nuestra colección de creaciones personalizadas, lazos para el cabello y llaveros bilingües.",
      ctaBtn: "Explorar Catálogo",
      
      // Footer
      footerSub: "hecho con amor — para la gloria de Dios —",
      copyright: "Heavenly Goods LLC. Todos los derechos reservados. Migrado orgullosamente de Wix a una experiencia premium en TypeScript y React."
    }
  };

  const current = translations[lang];

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
          <Link to="/" className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-taupe-deep flex items-center gap-1.5 select-none">
              Heavenly Goods
              <span className="inline-block w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            </span>
            <span className="font-cursive text-lg text-brand-gold-dark/80 -mt-1.5 pl-0.5 select-none">
              {current.footerSub}
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-taupe-dark">
            <Link to="/" className="hover:text-brand-orange smooth-hover">{current.navHome}</Link>
            <Link to="/about" className="text-brand-orange border-b-2 border-brand-orange/60 pb-0.5">{current.navMission}</Link>
            <a href="/#catalog" className="hover:text-brand-orange smooth-hover">{current.navCatalog}</a>
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

            {/* Shopping Bag link to Home page with cart query parameter trigger */}
            <Link 
              to="/?cart=true"
              className="p-2.5 rounded-full bg-brand-pink hover:bg-brand-pink-dark text-brand-taupe-deep transition-all duration-500 relative shadow-sm hover:shadow active:scale-95 cursor-pointer"
              title="View Shopping Bag"
            >
              <ShoppingBag size={18} />
              {bagCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-bounce">
                  {bagCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-brand-pink-soft via-white to-brand-pink-soft/30 texture-crinkle">
        {/* Soft blurring watermark circles */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-brand-pink/20 blur-2xl animate-float" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-brand-orange-light/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink-light border border-brand-pink text-xs font-semibold text-brand-orange-dark shadow-sm">
            <Compass size={12} className="text-brand-gold animate-spin-slow" />
            <span>{current.heroBadge}</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-taupe-deep leading-tight">
            {current.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-brand-taupe-dark max-w-2xl mx-auto leading-relaxed font-sans font-normal">
            {current.heroSubtitle}
          </p>

          <div className="flex justify-center pt-2">
            <span className="text-brand-pink text-5xl font-cursive">❀</span>
          </div>
        </div>
      </section>

      {/* The Brand Section */}
      <section className="py-20 bg-white relative border-y border-brand-pink/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Column: Story text beautifully highlighted inside a gold foil backing card style container */}
            <div className="flex-1 space-y-6 order-2 lg:order-1">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-bold text-brand-orange-dark bg-brand-orange-light px-3 py-1 rounded-full inline-block">
                  {current.brandBadge}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-taupe-deep tracking-tight">
                  {current.brandTitle}
                </h2>
                <div className="h-1 w-16 bg-brand-orange rounded-full" />
              </div>

              <div className="gold-foil-border rounded-3xl bg-brand-pink-light/20 p-8 shadow-premium relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="space-y-4 text-brand-taupe-deep leading-relaxed text-sm md:text-base font-normal select-text">
                  <p className="font-medium italic">
                    {current.brandP1}
                  </p>
                  <p>
                    {current.brandP2}
                  </p>
                  <p className="font-semibold text-brand-orange-dark">
                    {current.brandP3}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Hand-crafted Polaroid Collage Grid */}
            <div className="flex-1 w-full flex justify-center relative order-1 lg:order-2">
              <div className="relative w-full max-w-md h-[380px] sm:h-[400px]">
                {/* Polaroid 3 (Hair bows collection) */}
                <div className="polaroid-card absolute top-4 left-8 w-56 sm:w-60 rotate-[3deg] z-10 transition-all duration-300 hover:scale-105 hover:z-30 cursor-pointer">
                  <div className="aspect-[4/5] rounded bg-brand-pink/5 overflow-hidden relative shadow-inner">
                    <img 
                      src="/images/products/crowned-in-grace-hair-bows-1/crowned-in-grace-hair-bows-1-1.jpg.avif" 
                      alt="Crowned in Grace Bows" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="font-cursive text-2xl text-brand-gold-dark block rotate-1">
                      {bilingual ? 'Lazos para el cabello' : 'Hair Accessories'}
                    </span>
                  </div>
                </div>

                {/* Polaroid 4 (Resin keychains and bracelets) */}
                <div className="polaroid-card absolute bottom-4 left-2 w-52 sm:w-56 rotate-[-5deg] z-0 hover:z-20 transition-all duration-300 hover:scale-105 hover:z-30 cursor-pointer">
                  <div className="aspect-[4/5] rounded bg-brand-pink/5 overflow-hidden relative shadow-inner">
                    <img 
                      src="/images/products/handmade-i-love-jesus-bracelet/handmade-i-love-jesus-bracelet-1.jpg.avif" 
                      alt="Handmade I Love Jesus Bracelet" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="font-cursive text-2xl text-brand-taupe-deep block -rotate-1">
                      {bilingual ? 'Pulseras con fe' : 'Faith Bracelets'}
                    </span>
                  </div>
                </div>

                {/* Flower stamp details */}
                <span className="absolute bottom-6 right-8 text-brand-pink/20 text-9xl pointer-events-none select-none font-cursive rotate-12">❀</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Me & My Family Section */}
      <section className="py-20 relative overflow-hidden texture-crinkle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Column: Family Story Polaroid Grid */}
            <div className="flex-1 w-full flex justify-center relative">
              <div className="relative w-full max-w-lg h-[440px] sm:h-[480px]">
                {/* Polaroid 1 (Our Story Portrait) */}
                <div className="polaroid-card absolute top-4 left-4 w-68 sm:w-76 rotate-[-3deg] z-10 transition-all duration-300 hover:scale-105 hover:z-30 cursor-pointer">
                  <div className="aspect-[4/5] rounded bg-brand-pink/5 overflow-hidden relative shadow-inner">
                    <img 
                      src="/images/products/our-story/our-story-1.jpg.avif" 
                      alt="Handmaking accessories" 
                      className="w-full h-full object-cover grayscale-[10%] contrast-[105%]"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="font-cursive text-2xl text-brand-taupe-deep block -rotate-1">
                      {current.polaroidBrand}
                    </span>
                  </div>
                </div>

                {/* Polaroid 2 (Our Story Flatlay) */}
                <div className="polaroid-card absolute bottom-4 right-4 w-64 sm:w-72 rotate-[4deg] z-0 hover:z-20 transition-all duration-300 hover:scale-105 hover:z-30 cursor-pointer">
                  <div className="aspect-[4/5] rounded bg-brand-pink/5 overflow-hidden relative shadow-inner">
                    <img 
                      src="/images/products/our-story/our-story-2.jpeg.avif" 
                      alt="Finished materials and bows" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="font-cursive text-2xl text-brand-gold-dark block rotate-1">
                      {current.polaroidFamily}
                    </span>
                  </div>
                </div>

                {/* Small handwritten card embellishment */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded border border-brand-gold/40 shadow-md rotate-[12deg] z-20 pointer-events-none text-center">
                  <span className="font-cursive text-lg text-brand-orange-dark block font-semibold">
                    heavenly goods ❀
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Family story text inside gold foil backing card style container */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-bold text-brand-orange-dark bg-brand-orange-light px-3 py-1 rounded-full inline-block">
                  {current.meBadge}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-taupe-deep tracking-tight">
                  {current.meTitle}
                </h2>
                <div className="h-1 w-16 bg-brand-orange rounded-full" />
              </div>

              <div className="gold-foil-border rounded-3xl bg-white/70 p-8 shadow-premium relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                <div className="space-y-4 text-brand-taupe-deep leading-relaxed text-sm md:text-base font-normal select-text">
                  <p className="font-medium italic">
                    {current.meP1}
                  </p>
                  <p>
                    {current.meP2}
                  </p>
                  <p className="font-semibold text-brand-gold-dark italic">
                    {current.meP3}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Visual Scripture Backing Card Display */}
      <section className="py-16 bg-white border-y border-brand-pink/20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="font-cursive text-4xl text-brand-gold-dark block select-none">
              {bilingual ? 'Nuestra Inspiración' : 'Our Daily Inspiration'}
            </span>
          </div>

          <div className="max-w-xl mx-auto rounded-3xl border border-brand-pink/40 shadow-premium p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group bg-white texture-crinkle">
            <div className="border border-brand-pink/50 rounded-2xl p-6 sm:p-8 flex-1 flex flex-col justify-between bg-brand-pink-light/40 relative z-10 transition-transform duration-500 group-hover:scale-[1.01] shadow-inner">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 rounded-full border border-brand-pink bg-white flex items-center justify-center mx-auto text-brand-orange font-bold text-xs shadow-sm">
                  ✨
                </div>
                <span className="font-cursive text-3xl text-brand-gold-dark block select-none">
                  {bilingual ? 'hecho con amor' : 'made with love'}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-brand-taupe-dark/70 font-bold block">
                  Heavenly Goods
                </span>
              </div>

              <div className="my-8 text-center space-y-3">
                <div className="text-sm font-semibold tracking-wide text-brand-taupe-deep italic">
                  {bilingual ? '"Creado con Gracia"' : '"Crowned in Grace"'}
                </div>
                <div className="h-[2px] w-12 bg-brand-gold/60 mx-auto" />
                <p className="text-sm sm:text-base italic text-brand-taupe-deep max-w-[280px] sm:max-w-[320px] mx-auto leading-relaxed font-medium">
                  {current.scriptureVerse}
                  <span className="font-semibold not-italic text-brand-gold-dark mt-2 block text-xs uppercase tracking-widest">{current.scriptureRef}</span>
                </p>
              </div>

              <div className="text-center text-[10px] text-brand-taupe-dark/60 font-semibold border-t border-brand-pink/30 pt-3">
                🌸 Hand-crafted Faith Accessories 🌸
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faith Pillars Section */}
      <section className="py-20 bg-brand-pink-soft/10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-taupe-deep">
              {current.valuesTitle}
            </h2>
            <div className="h-1 w-16 bg-brand-orange mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-brand-pink/20 shadow-sm hover:shadow-md transition-all duration-300 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-pink-light flex items-center justify-center mx-auto text-brand-orange">
                <Heart size={24} className="fill-brand-orange" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-taupe-deep">{current.value1Title}</h3>
              <p className="text-sm text-brand-taupe-dark leading-relaxed">
                {current.value1Desc}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-brand-pink/20 shadow-sm hover:shadow-md transition-all duration-300 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-orange-light flex items-center justify-center mx-auto text-brand-orange-dark">
                <Languages size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-taupe-deep">{current.value2Title}</h3>
              <p className="text-sm text-brand-taupe-dark leading-relaxed">
                {current.value2Desc}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-brand-pink/20 shadow-sm hover:shadow-md transition-all duration-300 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-pink-light flex items-center justify-center mx-auto text-brand-gold">
                <Gift size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-taupe-deep">{current.value3Title}</h3>
              <p className="text-sm text-brand-taupe-dark leading-relaxed">
                {current.value3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Invitation CTA Section */}
      <section className="py-20 relative overflow-hidden bg-brand-taupe-deep text-brand-pink-soft text-center">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-2xl mx-auto px-6 relative z-10 space-y-6">
          <span className="font-cursive text-3xl text-brand-gold select-none block">
            {bilingual ? 'Creado con amor' : 'crafted with love'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            {current.ctaTitle}
          </h2>
          <p className="text-sm sm:text-base text-brand-pink-soft/80 leading-relaxed max-w-xl mx-auto">
            {current.ctaSubtitle}
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              to="/#catalog"
              className="px-8 py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{current.ctaBtn}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-pink/30 bg-brand-taupe-deep text-brand-pink-soft py-12 px-6">
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
