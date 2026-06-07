import { Product } from "../types";

/**
 * DEVELOPER GUIDE: HOW TO ADD / EDIT PRODUCTS & DETAILS
 * 
 * Simply add a new object to the `products` array below following this schema:
 * 
 * {
 *   id: "unique_numerical_string", // e.g. "17"
 *   name: "Product Display Name",
 *   price: 4900, // Price in Rupees (e.g. 4900 for ₹4,900)
 *   description: "Write your luxury artisan description here.", 
 *   category: "Earrings", // Must be: "Earrings" | "Necklaces" | "Bestsellers" | "New Arrivals" | "Gifts"
 *   images: [
 *     "https://images.unsplash.com/your-image-url-1",
 *     "https://images.unsplash.com/your-image-url-2",
 *     "https://images.unsplash.com/your-image-url-3"
 *   ],
 *   rating: 4.8, // Decimal rating out of 5.0
 *   reviews: 24, // Total number of reviews
 *   isNew: true, // [Optional] Triggers "New In" label & "NEW ARRIVALS" page filter
 *   isLimited: true, // [Optional] Triggers "Limited" badge & "LIMITED EDITION" page filter
 *   stock: 15, // Current stock count (e.g. items below 10 show "Only X left")
 * 
 *   // OPTIONAL SPECIFICATION OVERRIDES (If omitted, uses category defaults below):
 *   materials: "Custom silver detailing with rare 24k gold leaf finishing.",
 *   stones: "Natural freshwater baroque pearl accents.",
 *   craftingTime: "Individually set and polished for 16 master-crafting hours.",
 *   dimensions: "35mm length x 12mm width.",
 *   weight: "Extremely comfortable lightweight build (4.1 grams overall).",
 *   certification: "Includes certified custom 24k gold authentication seal.",
 *   careInstructions: [
 *     "Buff occasionally with precious silver cloths.",
 *     "Avoid active water contact."
 *   ],
 *   packaging: "Signature premium rose-lacquer wooden display chest.",
 *   shippingRoute: "En-route within 12 hours via express door delivery.",
 *   exchangePolicy: "Premium 30-day hassle free custom size exchange."
 * }
 */

// CENTRALIZED SPECIFICATIONS (Default values by product category)
export const categorySpecifications = {
  "Earrings": {
    materials: "18k Rose Gold / Premium Platinum triple-layer plating on certified Solid Sterling Silver.",
    stones: "Hand-selected conflict-free simulated flawless diamonds (VVS1 clarity equivalent).",
    craftingTime: "Individually calibrated and post-set by master silversmiths over 14 crafting hours.",
    dimensions: "Approximately 20mm height x 8mm width.",
    weight: "Extremely lightweight (3.8 grams per earring) for allergen-free day and evening comfort.",
    certification: "Every order contains a handcrafted Saiksha Authenticity Seal card validating material purities.",
    careInstructions: [
      "Store in the customized velvet storage bag and airtight casing box provided.",
      "Avoid spraying fine perfume, body oils, or applying lotions directly onto the metal surfaces.",
      "Gently pat dry with a soft microfiber cloth after extended wears; do not apply industrial metal jewelry cleaners."
    ],
    packaging: "Arrives cradled in our custom signature ivory gift drawer box with velvet lining, a physical envelope containing detailed care cards, and clean gold seals.",
    shippingRoute: "Dispatched securely via premium air couriers with complementary shipping insurance. Standard delivery is complete in 2-4 business days.",
    exchangePolicy: "Unused pieces rest in standard security tags are eligible for a graceful 15-day exchange window."
  },
  "Necklaces": {
    materials: "Premium 18k Yellow Gold / Rose Gold vermeil plating over refined 925 sterling silver cores.",
    stones: "Top-grade ultra-lustrous Marine Akoya Pearls, sourced ethically with standard certified certificates.",
    craftingTime: "Chains polished slowly with traditional micro-wire techniques, taking up to 18 hours.",
    dimensions: "16-inch adjustable dainty cable chain with a custom lobster clasp lock adjustment.",
    weight: "Delicate and sleek profile (approx 5.2 grams overall heft) designed to lay optimally on the collarbones.",
    certification: "Every order contains a handcrafted Saiksha Authenticity Seal card validating material purities.",
    careInstructions: [
      "Store flat in the luxury jewelry chest compartment to prevent chain tangles.",
      "Ensure the necklace is taken off before sleeping, exercising, or bathing.",
      "Keep away from direct heat and chemical solvents to maintain the lustrous Akoya coating."
    ],
    packaging: "Protected inside a classic velvet necklace lay-bed case, accented with pristine gold foil embossed logos, premium wrapping and seal verification.",
    shippingRoute: "Delivered within 2-4 days via our private priority courier channel, with complete tracking credentials emailed instantly.",
    exchangePolicy: "Eligible for smooth concierge exchange or scaling adjustment services within 15 days of verified delivery."
  },
  "Bestsellers": {
    materials: "Heirloom-grade solid premium sterling silver, engineered with specialized anti-tarnish backing layers.",
    stones: "Brilliant-cut laboratory-grown cushion diamonds of highest brilliance ratings.",
    craftingTime: "Sourced through customized micro-pavé handcraft channels, completed in restricted batches.",
    dimensions: "Custom statement scale, engineered to pair effortlessly with executive or event styling.",
    weight: "Perfect weight distribution (4.5 grams) ensuring comfortable extended wear.",
    certification: "Shipped with a certified Saiksha Signature Gemstone Appraisal and precious metal test report card.",
    careInstructions: [
      "Sustained by regular light buffing with our custom jewelry treatment cloth provided.",
      "Minimize direct contact with high-humidity settings or thermal treatment environments.",
      "Always store inside separate soft compartments within your velvet jewelry case to avoid micro-scratches."
    ],
    packaging: "Presented inside our flagship limited-edition emerald and gold textured chest box, complete with handwritten collector greetings.",
    shippingRoute: "Hand-delivered with complimentary premium air express. Ships insured directly from our main design house.",
    exchangePolicy: "Premium 15-day return or luxury exchange window automatically covered for all registered collectors."
  },
  "New Arrivals": {
    materials: "Limited-run luxury composite core with polished rose-gild accents.",
    stones: "Premium clear-cut crystal quartz with multi-faceted refraction elements.",
    craftingTime: "Designed in our signature contemporary luxury capsule collection, individually numbered.",
    dimensions: "Sleek and minimalist framing suited for timeless stacking profiles.",
    weight: "Sleek profile weight (3.0 grams equivalent) for a barely-there feeling of fine luxury.",
    certification: "Includes our exclusive Saiksha Limited Production certificate hand-signed by our leading designer.",
    careInstructions: [
      "Clean carefully with a soft cotton swab dipped in warm water without soaps.",
      "Do not wear when handling chlorine pools, oceans, saunas, or sanitizing agents.",
      "Avoid stack-rubbing against heavy metal chains to safeguard the custom rose-gild accents."
    ],
    packaging: "Encased in contemporary minimalist sliding linen box packing, complete with protective tissue and velvet sleeves.",
    shippingRoute: "En-route within 24 hours of ordering. Ultra-fast shipping across domestic metro locations.",
    exchangePolicy: "Graceful 15-day exchange available online or at our partner boutique salons."
  },
  "Gifts": {
    materials: "Heirloom collection plating wrapped around high-density composite layers.",
    stones: "Vibrant gemstone simulants providing spectacular jewel tones.",
    craftingTime: "Polished and presented inside an ivory gift chest, hand-assembled by traditional boxmakers.",
    dimensions: "Standard gift sizing suited to universally delight receivers without size restrictions.",
    weight: "Exquisite weighty feel corresponding to vintage high-society heirlooms.",
    certification: "Enclosed in a sealed wax-stamped envelope containing the custom Saiksha Gift Authenticity Certificate.",
    careInstructions: [
      "Keep product in its original velvet-lined presentation chest when not being worn.",
      "Gently wipe clean after every wear to shield from sweat acidity and moisture residue.",
      "Ensure the safety lock is fully fastened and stored away from open-air draft trays."
    ],
    packaging: "Delivered ready-for-gifting in our premium golden signature gift bag, secured by dual rose silk ribbons and personalized blank card blanks.",
    shippingRoute: "Complementary secure prompt courier shipping with option to append customized digital gift codes.",
    exchangePolicy: "Extended recipient-friendly 30-day exchange period if retained with gift security tag intact."
  }
};

export const products: Product[] = [
  {
    id: "1",
    name: "Divine Rose Gold Earrings",
    price: 10400,
    description: "Elegant handcrafted rose gold earrings with delicate floral motifs and pavé diamonds. Perfect for bridesmaids or special evening events.",
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    reviews: 24,
    isNew: true,
    stock: 15
  },
  {
    id: "2",
    name: "Starlight Pearl Necklace",
    price: 15200,
    description: "A timeless piece featuring high-luster Akoya pearls on a delicate 18k gold chain. Accented with a single brilliant-cut diamond.",
    category: "Necklaces",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611085583191-a3b17bc7097e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549439602-43ebcb232811?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    reviews: 42,
    isLimited: true,
    stock: 5
  },
  {
    id: "3",
    name: "Celestial Moon Drop Earrings",
    price: 7200,
    description: "Celestial-inspired drop earrings with moonstone and silver finish. Captures the ethereal glow of moonlight.",
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    reviews: 18,
    isNew: false,
    stock: 20
  },
  {
    id: "4",
    name: "Ethereal Vine Choker",
    price: 17200,
    description: "Intricate vine-inspired choker featuring emerald green crystals and gold-plated stems. A bold statement for fashion-forward women.",
    category: "Necklaces",
    images: [
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549439602-43ebcb232811?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.6,
    reviews: 12,
    isNew: true,
    stock: 8
  },
  {
    id: "5",
    name: "Minimalist Gold Studs",
    price: 3600,
    description: "Everyday luxury. 14k solid gold spherical studs with a high-polish finish. Hypoallergenic and comfortable for daily wear.",
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1589127013318-9764506385a4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 5.0,
    reviews: 86,
    isNew: false,
    stock: 50
  },
  {
    id: "6",
    name: "Opulence Diamond Pendant",
    price: 36000,
    description: "Large 1-carat emerald-cut diamond in a halo setting of smaller diamonds on a heavy platinum chain. The pinnacle of luxury.",
    category: "Bestsellers",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 5.0,
    reviews: 5,
    isLimited: true,
    stock: 2
  },
  {
    id: "7",
    name: "Garden Blossom Studs",
    price: 5200,
    description: "Delicate flower-shaped studs with pink enamel and gold-plated details. A youthful and fresh touch for any outfit.",
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549439602-43ebcb232811?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.5,
    reviews: 14,
    isNew: true,
    stock: 30
  },
  {
    id: "9",
    name: "Midnight Sapphire Drops",
    price: 14000,
    description: "Deep blue sapphire stones encased in a vintage-inspired silver filigree. Elegant and mysterious.",
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1596944209320-213c5fc44894?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611085583191-a3b17bc7097e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    reviews: 21,
    isLimited: true,
    stock: 6
  },
  {
    id: "10",
    name: "Golden Leaf Climbers",
    price: 4400,
    description: "Modern ear climbers featuring a delicate leaf pattern in 14k gold plating. A unique sculptural piece.",
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1598560917027-3199f73f5509?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    reviews: 34,
    isNew: true,
    stock: 25
  },
  {
    id: "11",
    name: "Architectural Hoop Set",
    price: 6800,
    description: "A set of three graded hoops in polished surgical steel. Geometric precision for everyday wear.",
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1589127013318-9764506385a4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    reviews: 52,
    isNew: false,
    stock: 40
  },
  {
    id: "12",
    name: "Aurora Crystal Hoops",
    price: 8800,
    description: "Large gold hoops encrusted with iridescent crystals that catch the light from every angle.",
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1590548784585-645d8b756896?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549439602-43ebcb232811?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    reviews: 28,
    isLimited: false,
    stock: 15
  },
  {
    id: "8",
    name: "Golden Serenity Bangle",
    price: 12400,
    description: "Elegant open bangle in 18k yellow gold with brushed finish. Simple yet sophisticated for the modern woman.",
    category: "Bestsellers",
    images: [
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1573408302185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    reviews: 31,
    isNew: false,
    stock: 12
  },
  {
    id: "13",
    name: "Divine Rose Harmony Gift Set",
    price: 25600,
    description: "The ultimate expression of romance and luxury. Includes our signature Divine Rose Gold Earrings paired with a matching rose-tonal crystal pendant inside our limited-edition velvet jewelry chest.",
    category: "Gifts",
    images: [
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549439602-43ebcb232811?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    reviews: 38,
    isNew: true,
    stock: 12
  },
  {
    id: "14",
    name: "Starlight Pearl Keepsake Bundle",
    price: 19800,
    description: "Gift the magic of the sea. Featuring our highly-coveted Starlight Pearl Necklace alongside a matched pearl charm bracelet in an elegant silk-lined luxury box.",
    category: "Gifts",
    images: [
      "https://images.unsplash.com/photo-1549439602-43ebcb232811?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611085583191-a3b17bc7097e?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 5.0,
    reviews: 14,
    isLimited: true,
    stock: 8
  },
  {
    id: "15",
    name: "The Imperial Serenity Chest",
    price: 34000,
    description: "An incredible curation of our top artisan pieces. Features the Golden Serenity Bangle paired beautifully with minimalist solid gold studs, presented beautifully in an embossed leather gift box.",
    category: "Gifts",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    reviews: 29,
    isNew: true,
    stock: 5
  },
  {
    id: "16",
    name: "Celestial Glow Duo Box",
    price: 16400,
    description: "Capture the ethereal shimmer of the night. Featuring Celestial Moon Drop Earrings and a matched moonstone choker, gorgeously presented in our signature gold-embossed case.",
    category: "Gifts",
    images: [
      "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    reviews: 19,
    isLimited: true,
    stock: 14
  }
];
