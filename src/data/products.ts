export interface ProductOption {
  label: string;
  imageTether?: string; // Optional URL of tethered image
}

export interface Product {
  id: string;
  name: string;
  price: number;
  verbiage: string;
  description: string;
  images: string[];
  heroImage?: string;
  hasCustomText?: boolean;
  customTextLabel?: string;
  options?: ProductOption[];
  imagePositions?: Record<string, string>; // Maps image URL -> object-position string e.g. "30% 45%"
  imageScales?: Record<string, number>;    // Maps image URL -> scale zoom level (e.g. 1.2)
}

export const products: Product[] = [
  {
    "id": "create-your-own-bracelet",
    "name": "Create Your Own Bracelet – Your Style, Your Words",
    "price": 4.99,
    "verbiage": "New Arrival🌈 Create Your Own Bracelet – Your Style, Your Words",
    "description": "A fully customizable handmade bracelet where you choose your style and your words. Perfect for personalizing a message of faith and love.",
    "images": [
      "/images/products/create-your-own-bracelet/create-your-own-bracelet-1.png.avif",
      "/images/products/create-your-own-bracelet/create-your-own-bracelet-2.png.avif"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-1",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-1/crowned-in-grace-hair-bows-1-1.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-1/crowned-in-grace-hair-bows-1-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-1/crowned-in-grace-hair-bows-1-3.png.avif",
      "/images/products/crowned-in-grace-hair-bows-1/crowned-in-grace-hair-bows-1-4.jpg.avif"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-2",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-2/crowned-in-grace-hair-bows-2-1.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-2/crowned-in-grace-hair-bows-2-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-2/crowned-in-grace-hair-bows-2-3.png.avif",
      "/images/products/crowned-in-grace-hair-bows-2/crowned-in-grace-hair-bows-2-4.png.avif"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-3",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-3/crowned-in-grace-hair-bows-3-1.png.avif",
      "/images/products/crowned-in-grace-hair-bows-3/crowned-in-grace-hair-bows-3-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-3/crowned-in-grace-hair-bows-3-3.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-3/crowned-in-grace-hair-bows-3-4.jpg.avif"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-4",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-4/crowned-in-grace-hair-bows-4-1.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-4/crowned-in-grace-hair-bows-4-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-4/crowned-in-grace-hair-bows-4-3.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-4/crowned-in-grace-hair-bows-4-4.jpg.avif"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-5",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-5/crowned-in-grace-hair-bows-5-1.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-5/crowned-in-grace-hair-bows-5-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-5/crowned-in-grace-hair-bows-5-3.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-5/crowned-in-grace-hair-bows-5-4.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-5/crowned-in-grace-hair-bows-5-5.mp4"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-6",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-6/crowned-in-grace-hair-bows-6-1.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-6/crowned-in-grace-hair-bows-6-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-6/crowned-in-grace-hair-bows-6-3.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-6/crowned-in-grace-hair-bows-6-4.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-6/crowned-in-grace-hair-bows-6-5.mp4"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-7",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-7/crowned-in-grace-hair-bows-7-1.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-7/crowned-in-grace-hair-bows-7-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-7/crowned-in-grace-hair-bows-7-3.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-7/crowned-in-grace-hair-bows-7-4.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-7/crowned-in-grace-hair-bows-7-5.mp4"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-8",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-8/crowned-in-grace-hair-bows-8-1.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-8/crowned-in-grace-hair-bows-8-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-8/crowned-in-grace-hair-bows-8-3.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-8/crowned-in-grace-hair-bows-8-4.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-8/crowned-in-grace-hair-bows-8-5.mp4"
    ]
  },
  {
    "id": "crowned-in-grace-hair-bows-9",
    "name": "Crowned in Grace: Hair Bows & Clips",
    "price": 11.99,
    "verbiage": "New Arrival✨ Crowned in Grace: Hair Bows & Clips ✨",
    "description": "These stunning hair bows and clips are characterized by layered ribbons, rhinestones, pastel flowers, and metallic heart embellishments. Crafted with love, they serve as a beautiful reminder of your identity in Christ.",
    "images": [
      "/images/products/crowned-in-grace-hair-bows-9/crowned-in-grace-hair-bows-9-1.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-9/crowned-in-grace-hair-bows-9-2.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-9/crowned-in-grace-hair-bows-9-3.png.avif",
      "/images/products/crowned-in-grace-hair-bows-9/crowned-in-grace-hair-bows-9-4.jpg.avif",
      "/images/products/crowned-in-grace-hair-bows-9/crowned-in-grace-hair-bows-9-5.mp4"
    ]
  },
  {
    "id": "faith-across-nations-keychains",
    "name": "2 Timothy 1:7 Keychain Collection",
    "price": 7.99,
    "verbiage": "2 Timothy 1:7 Keychain Collection, Colección de Llavero 2 Timoteo 1:7",
    "description": "A beautiful bilingual keychain collection (English and Spanish) inspired by 2 Timothy 1:7. A constant reminder that God has not given us a spirit of fear, but of power, love, and a sound mind.",
    "images": [
      "/images/products/faith-across-nations-keychains/faith-across-nations-keychains-1.png.avif",
      "/images/products/faith-across-nations-keychains/faith-across-nations-keychains-2.png.avif",
      "/images/products/faith-across-nations-keychains/faith-across-nations-keychains-3.png.avif",
      "/images/products/faith-across-nations-keychains/faith-across-nations-keychains-4.png.avif",
      "/images/products/faith-across-nations-keychains/faith-across-nations-keychains-5.png.avif"
    ]
  },
  {
    "id": "faith-over-fear-keychains",
    "name": "2 Corinthians 5:17 Keychain Collection",
    "price": 3.99,
    "verbiage": "2 Corinthians 5:17 Keychain Collection",
    "description": "A daily reminder of new beginnings in Christ. These beautifully crafted keychains feature the inspiring message of 2 Corinthians 5:17.",
    "images": [
      "/images/products/faith-over-fear-keychains/faith-over-fear-keychains-1.png.avif",
      "/images/products/faith-over-fear-keychains/faith-over-fear-keychains-2.png.avif",
      "/images/products/faith-over-fear-keychains/faith-over-fear-keychains-3.png.avif",
      "/images/products/faith-over-fear-keychains/faith-over-fear-keychains-4.png.avif"
    ]
  },
  {
    "id": "handmade-i-love-jesus-bracelet",
    "name": "Handmade \"I Love Jesus\" Bracelet",
    "price": 4.99,
    "verbiage": "🌟 Handmade \"I Love Jesus\" Bracelet 🌟",
    "description": "A beautiful handmade adult-sized bracelet designed to proudly declare your faith. Made with vibrant beads and a whole lot of love.",
    "images": [
      "/images/products/handmade-i-love-jesus-bracelet/handmade-i-love-jesus-bracelet-1.jpg.avif",
      "/images/products/handmade-i-love-jesus-bracelet/handmade-i-love-jesus-bracelet-2.png.avif",
      "/images/products/handmade-i-love-jesus-bracelet/handmade-i-love-jesus-bracelet-3.jpg.avif",
      "/images/products/handmade-i-love-jesus-bracelet/handmade-i-love-jesus-bracelet-4.jpg.avif",
      "/images/products/handmade-i-love-jesus-bracelet/handmade-i-love-jesus-bracelet-5.png.avif"
    ]
  },
  {
    "id": "handmade-i-love-jesus-kids-bracelet",
    "name": "Handmade \"I Love Jesus\" Kids Bracelet",
    "price": 2.99,
    "verbiage": "New Arrival🌟 Handmade \"I Love Jesus\" Kids Bracelet 🌟",
    "description": "A handmade, kids-sized version of our popular \"I Love Jesus\" bracelet, perfect for the little ones to celebrate God's love.",
    "images": [
      "/images/products/handmade-i-love-jesus-kids-bracelet/handmade-i-love-jesus-kids-bracelet-1.jpeg.avif",
      "/images/products/handmade-i-love-jesus-kids-bracelet/handmade-i-love-jesus-kids-bracelet-2.png.avif",
      "/images/products/handmade-i-love-jesus-kids-bracelet/handmade-i-love-jesus-kids-bracelet-3.jpeg.avif",
      "/images/products/handmade-i-love-jesus-kids-bracelet/handmade-i-love-jesus-kids-bracelet-4.jpeg.avif",
      "/images/products/handmade-i-love-jesus-kids-bracelet/handmade-i-love-jesus-kids-bracelet-5.png.avif"
    ]
  },
  {
    "id": "our-story",
    "name": "Our Story",
    "price": 0,
    "verbiage": "Welcome to Heavenly Goods",
    "description": "Every bow, bracelet, tumbler, and keychain is designed to remind us of our identity in Christ. We believe beauty begins in the heart, and our mission is to celebrate God’s love through every detail.",
    "images": [
      "/images/products/our-story/our-story-1.jpg.avif",
      "/images/products/our-story/our-story-2.jpeg.avif"
    ]
  },
  {
    "id": "resin-letter-keychains",
    "name": "Personalized Letter Resin Keychain",
    "price": 3.99,
    "verbiage": "Personalized Letter Resin Keychain, Llavero Resin con Letra Personalizada",
    "description": "A personalized bilingual keychain made of high-quality resin featuring a customized letter. A unique and faith-filled accessory.",
    "images": [
      "/images/products/resin-letter-keychains/resin-letter-keychains-1.png"
    ]
  }
];
