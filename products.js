/* --- Product Data --- 
   To add a new product:
   1. Copy one of the objects below (from { to },)
   2. Paste it at the end of the list
   3. Change the id (must be unique), name, price, description, and image URL.
   
   To put a product on SALE:
   1. Set 'price' to the NEW lower sale price.
   2. Add 'originalPrice' with the OLD higher price.
*/

// Using window.PRODUCTS ensures this variable is accessible globally, 
// preventing issues if scripts are bundled or scoped strictly.
window.PRODUCTS = [
    {
        id: 1,
        name: "The Oxford Shirt",
        category: "Tops",
        price: 65.00, // New Sale Price
        originalPrice: 85.00, // Old Price for display
        description: "A timeless classic reimagined. Crafted from premium organic cotton with a relaxed silhouette and mother-of-pearl buttons. Perfect for layering or wearing solo.",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=688&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "Pleated Linen Trousers",
        category: "Bottoms",
        price: 120.00,
        description: "Lightweight and breathable linen trousers featuring sharp front pleats and a high-waisted fit. The essential summer trouser for effortless elegance.",
        image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=687&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Oversized Wool Blazer",
        category: "Outerwear",
        price: 250.00,
        description: "Structured yet slouchy, this wool-blend blazer adds instant polish to any outfit. Features padded shoulders and deep pockets.",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=736&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Silk Slip Dress",
        category: "Dresses",
        price: 180.00,
        description: "Made from 100% mulberry silk, this bias-cut slip dress drapes beautifully against the body. A versatile piece for day or night.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=783&auto=format&fit=crop"
    },
    {
        id: 5,
        name: "Minimalist Leather Tote",
        category: "Accessories",
        price: 210.00,
        description: "Handcrafted from full-grain vegetable-tanned leather. Spacious enough for a laptop, sleek enough for dinner.",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=738&auto=format&fit=crop"
    },
    {
        id: 6,
        name: "Cotton Knit Sweater",
        category: "Knits",
        price: 75.00,
        originalPrice: 85.00,
        description: "Soft, chunky, and breathable. This fisherman-style rib knit sweater is designed for year-round comfort.",
        image: "https://images.unsplash.com/photo-1624623278313-a930126a11c3?q=80&w=687&auto=format&fit=crop"
    }
];