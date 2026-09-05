"use client";

import { useCustomizationContext } from "@/context/CustomizationContext";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useRouter, usePathname } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

const basePath = "";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

// Earthy, warm, chocolate/brown themed dummy products
export const ALL_PRODUCTS: Product[] = [
  { id: "o1", name: "Leather Tote Bag", price: 185.00, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2000&auto=format&fit=crop", category: "Accessories" },
  { id: "o2", name: "Walnut Serving Tray", price: 75.00, image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?q=80&w=2000&auto=format&fit=crop", category: "Home" },
  { id: "o3", name: "Roasted Coffee Beans", price: 24.00, image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=2000&auto=format&fit=crop", category: "Pantry" },
  { id: "o4", name: "Amber Glass Vase", price: 45.00, image: "https://images.unsplash.com/photo-1580974582391-a6649c82a85f?q=80&w=2000&auto=format&fit=crop", category: "Decor" },
  { id: "o5", name: "Linen Apron", price: 65.00, image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop", category: "Apparel" },
  { id: "o6", name: "Ceramic Coffee Dripper", price: 38.00, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=2000&auto=format&fit=crop", category: "Brewing" },
  { id: "o7", name: "Handcrafted Soap", price: 18.00, image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=2000&auto=format&fit=crop", category: "Apothecary" },
  { id: "o8", name: "Oak Desk Organizer", price: 55.00, image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2000&auto=format&fit=crop", category: "Office" },
];

type CartItem = {
  product: Product;
  quantity: number;
};

export type Review = {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

type CartContextType = {
  currencySymbol: string;
  basePath: string;
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  toastMessage: string | null;
  clearToast: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Coupons
  appliedCoupon: string | null;
  discountAmount: number;
  couponError: string | null;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;

  // Reviews
  reviews: Review[];
  addReview: (productId: string, rating: number, comment: string, userName: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children , initialCustomData }: { children: ReactNode, initialCustomData?: any  }) {
  const { customer, isAuthenticated, siteId, openAuthModal, registerCartHandler } = useCustomerAuth();
  const router = useRouter();
  const pathname = usePathname();
  const storageKey = `cart_${siteId || 'default'}_${customer?.id || 'guest'}`;
  const __customContext = useCustomizationContext();
  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";



  const [items, setItems] = useState<CartItem[]>([]);

  const symbolMap: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", INR: "₹"
  };
  const initCurrency = initialCustomData?.formData?.currency;
  const [currencySymbol, setCurrencySymbol] = useState(symbolMap[initCurrency] || "$");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {

      if (event.data?.type === "MONOLITH_CUSTOMIZATION") {
        const currency = event.data.data?.formData?.currency;
        setCurrencySymbol(symbolMap[currency] || "$");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {}
    } else {
      setItems([]);
    }

    if (isAuthenticated) {
      const pendingItem = sessionStorage.getItem('pending_cart_add');
      if (pendingItem) {
        sessionStorage.removeItem('pending_cart_add');
        try {
          const parsed = JSON.parse(pendingItem);
          const p = parsed.product || parsed;
          if (p && p.id) {
            setItems((prev) => {
              const exists = prev.find((i) => i.product.id === p.id);
              if (exists) {
                return prev.map((i) => i.product.id === p.id ? { ...i, quantity: i.quantity + (parsed.quantity || 1) } : i);
              }
              return [...prev, { product: p, quantity: parsed.quantity || 1 }];
            });
            setToastMessage(`Added ${p.name} to cart.`);
            setTimeout(() => setToastMessage(null), 3000);
          }
        } catch (e) {}
      }
    }
  }, [customer?.id, siteId, isAuthenticated, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
    localStorage.setItem("origin-preview-wishlist", JSON.stringify(wishlist));
    localStorage.setItem("origin-reviews", JSON.stringify(reviews));
  }, [items, wishlist, reviews]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_add', JSON.stringify({ product, quantity }));
      }
      setToastMessage("Please sign in to add items to your cart.");
      setTimeout(() => setToastMessage(null), 3000);
      const currentPath = pathname || '/';
      router.push(`${basePath}/auth/login?return=${encodeURIComponent(currentPath)}&action=add-to-cart&productId=${encodeURIComponent(product.id)}`);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setToastMessage(`Added ${product.name} to cart.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const clearToast = () => setToastMessage(null);

  const removeFromCart = (productId: string) => {

    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {

    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {

    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Wishlist logic
  const toggleWishlist = (product: Product) => {

    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        setToastMessage(`Removed ${product.name} from wishlist.`);
        setTimeout(() => setToastMessage(null), 3000);
        return prev.filter((p) => p.id !== product.id);
      }
      setToastMessage(`Added ${product.name} to wishlist.`);
      setTimeout(() => setToastMessage(null), 3000);
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some((p) => p.id === productId);

  // Coupon logic
  let discountAmount = 0;
  if (appliedCoupon === 'DISCOUNT20') {
    discountAmount = (totalPrice || 0) * 0.2;
  } else if (appliedCoupon === 'SAVE50') {
    discountAmount = Math.min(50, totalPrice || 0);
  } else if (appliedCoupon) {
    discountAmount = (totalPrice || 0) * 0.1; // Default 10% for API coupons for demo
  }

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const slug = basePath.split('/').pop() || "";
      const res = await fetch('/api/v1/store/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, slug })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(code.toUpperCase());
        // For demo/UI consistency, we could store the discount returned by API
        // Here we just accept it. The actual checkout API calculates the final total anyway.
      } else {
        setCouponError(data.error || "Invalid coupon code");
      }
    } catch (err) {
      setCouponError("Failed to validate coupon");
    }
  };;

  const removeCoupon = () => {

    setAppliedCoupon(null);
    setCouponError(null);
  };

  const addReview = async (productId: string, rating: number, comment: string, userName: string) => {
    try {
      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          tenantId: '00000000-0000-0000-0000-000000000000',
          rating,
          comment,
          title: 'Review',
          customerId: null
        })
      });
      
      if (res.ok) {
        const newReview: Review = {
          id: Math.random().toString(36).substr(2, 9),
          productId,
          userName,
          rating,
          comment,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        };
        setReviews(prev => [...prev, newReview]);
        // Call showToast if it exists in scope, else ignore
        try { if (typeof (window as any) !== "undefined" && (window as any).showToast) (window as any).showToast("Review submitted successfully"); } catch(e) {}
      }
    } catch(err) {
      console.error(err);
    }
  };;

  useEffect(() => {
    if (registerCartHandler) {
      return registerCartHandler((p: any, q?: number) => {
        addToCart(p, q || 1);
      });
    }
  }, [registerCartHandler]);

  return (
    <CartContext.Provider
      value={{
        currencySymbol,
        basePath,
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        toastMessage,
        clearToast,
        searchQuery,
        setSearchQuery,
        wishlist,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        discountAmount,
        couponError,
        applyCoupon,
        removeCoupon,
        reviews,
        addReview,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const __customContext = useCustomizationContext();
  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";


  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}