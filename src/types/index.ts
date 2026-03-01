/* ============================
   FORTE CUP — Type Definitions
   ============================ */

// ─── B2B Cart Types ──────────────────────

/** A single item in the B2B cart (represents BOXES, not pieces) */
export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  volume: string | null;
  color: string | null;
  sku: string;
  imageUrl: string | null;
  pricePerPiece: number;
  piecesPerBox: number;
  boxPrice: number;
  /** Quantity of BOXES */
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addBox: (item: Omit<CartItem, "quantity">) => void;
  removeBox: (variantId: string) => void;
  decrementBox: (variantId: string) => void;
  clearCart: () => void;
  totalBoxes: () => number;
  totalPieces: () => number;
  totalPrice: () => number;
}

// ─── Serialized DB types for client ──────

export interface SerializedVariant {
  id: string;
  sku: string;
  volume: string | null;
  colorOrDesign: string | null;
  pricePerPiece: number;
  piecesPerBox: number;
  boxPrice: number;
  inStock: boolean;
}

export interface SerializedProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageBaseUrl: string | null;
  isPopular: boolean;
  isDraft: boolean;
  categoryName: string;
  categorySlug: string;
  variants: SerializedVariant[];
}

// ─── Legacy types (kept for compatibility) ──

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface MarqueeItem {
  text: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}
