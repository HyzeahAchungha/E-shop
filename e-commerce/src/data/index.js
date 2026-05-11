export const COLORS = {
  navy:  { hex: "#1a1f2e", label: "Navy" },
  sage:  { hex: "#7a9e7e", label: "Sage" },
  black: { hex: "#111111", label: "Black" },
  teal:  { hex: "#2a7a7a", label: "Teal" },
  cream: { hex: "#e8dfc8", label: "Cream" },
  rust:  { hex: "#b5522a", label: "Rust" },
  olive: { hex: "#5a6b3a", label: "Olive" },
  sand:  { hex: "#c4a882", label: "Sand" },
  white: { hex: "#f9f7f4", label: "White" },
  blush: { hex: "#e8b4a0", label: "Blush" },
};

export const SIZES = ["XS", "S", "M", "L", "XL"];
export const CATEGORIES = ["All", "Dresses", "Pants", "Blouses", "Outwear"];

export const products = [
  {
    id: 1,
    name: "Tailored Stretch",
    sub: "Turn It Up Pants",
    price: 180,
    category: "Pants",
    badge: "Best Seller",
    sizes: ["XS", "S", "M", "L", "XL"],
    colorVariants: {
      navy:  { hex: "#1a1f2e", label: "Navy",  img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80&fit=crop" },
      black: { hex: "#111111", label: "Black", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop" },
      olive: { hex: "#5a6b3a", label: "Olive", img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80&fit=crop" },
    },
  },
  {
    id: 2,
    name: "Technical Silk",
    sub: "Make A Splash Dress",
    price: 120,
    category: "Dresses",
    badge: "New In",
    sizes: ["XS", "S", "M", "L", "XL"],
    colorVariants: {
      sage:  { hex: "#7a9e7e", label: "Sage",  img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80&fit=crop" },
      teal:  { hex: "#2a7a7a", label: "Teal",  img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80&fit=crop" },
      black: { hex: "#111111", label: "Black", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop" },
      cream: { hex: "#e8dfc8", label: "Cream", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80&fit=crop" },
    },
  },
  {
    id: 3,
    name: "Cool Weave",
    sub: "Anywhere Dress",
    price: 210,
    category: "Dresses",
    badge: "Best Seller",
    sizes: ["XS", "S", "M", "L", "XL"],
    colorVariants: {
      navy:  { hex: "#1a1f2e", label: "Navy", img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80&fit=crop" },
      olive: { hex: "#5a6b3a", label: "Olive", img: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80&fit=crop" },
      sand:  { hex: "#c4a882", label: "Sand",  img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80&fit=crop" },
    },
  },
  {
    id: 4,
    name: "Linen Flow",
    sub: "Everyday Blouse",
    price: 95,
    category: "Blouses",
    badge: null,
    sizes: ["XS", "S", "M", "L", "XL"],
    colorVariants: {
      white: { hex: "#f9f7f4", label: "White", img: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80&fit=crop" },
      blush: { hex: "#e8b4a0", label: "Blush", img: "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=600&q=80&fit=crop" },
      sage:  { hex: "#7a9e7e", label: "Sage",  img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80&fit=crop" },
    },
  },
  {
    id: 5,
    name: "Cascade Coat",
    sub: "Structured Outwear",
    price: 340,
    category: "Outwear",
    badge: "Limited",
    sizes: ["S", "M", "L", "XL"],
    colorVariants: {
      sand:  { hex: "#c4a882", label: "Sand",  img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80&fit=crop" },
      black: { hex: "#111111", label: "Black", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop" },
      rust:  { hex: "#b5522a", label: "Rust",  img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80&fit=crop" },
    },
  },
  {
    id: 6,
    name: "Drape Midi",
    sub: "Evening Dress",
    price: 265,
    category: "Dresses",
    badge: "New In",
    sizes: ["XS", "S", "M", "L"],
    colorVariants: {
      black: { hex: "#111111", label: "Black", img: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&q=80&fit=crop" },
      navy:  { hex: "#1a1f2e", label: "Navy",  img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80&fit=crop" },
      blush: { hex: "#e8b4a0", label: "Blush", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80&fit=crop" },
    },
  },
];

export const bestSellers = products.slice(0, 3);

export const collectionItems = [
  { label: "Blouses", img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=800&q=80&fit=crop" },
  { label: "Pants",   img: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80&fit=crop" },
  { label: "Dresses", img: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80&fit=crop" },
  { label: "Outwear", img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80&fit=crop" },
];

export const modiweekItems = [
  { day: "Sunday",    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80&fit=crop" },
  { day: "Monday",    img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80&fit=crop" },
  { day: "Tuesday",   img: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80&fit=crop" },
  { day: "Wednesday", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80&fit=crop" },
  { day: "Thursday",  img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80&fit=crop" },
];

export const socialImgs = [
  "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=400&q=80&fit=crop",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80&fit=crop",
  "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80&fit=crop",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80&fit=crop",
];