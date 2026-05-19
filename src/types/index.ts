export interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: 'admin' | 'manager' | 'editor' | 'customer';
  phone: string | null;
  created_at?: string;
  is_active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  price_currency: string;
  discount_price?: string | null;
  image: string;
  additional_images?: string[];
  is_new?: boolean;
  sizes: string[];
  colors?: string[];
  description?: string;
  details?: string[];
  collection_name?: string;
  stock?: number;
  category: string;
  views: number;
  created_at?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
  product_id?: string | null;
}

export interface NewsletterEmail {
  id: string;
  email: string;
  subscribed_at: string;
  source: string;
  is_active: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  customer_name: string;
  email?: string | null;
  phone: string;
  address: string;
  city: string;
  delivery_location: string;
  payment_method: string;
  transaction_id?: string | null;
  payment_verified?: boolean;
  total: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  items: string[];
}

export interface CartItem {
  id: string; // Composite ID: productId + '-' + size + '-' + color
  productId: string;
  name: string;
  price: string;
  currency: string;
  image: string;
  size: string;
  color?: string;
  quantity: number;
}

export interface SystemConfig {
  maintenanceMode: {
    enabled: boolean;
    message: string;
    image: string;
    endAt: string | null;
  };
  comingSoon: {
    image: string;
  };
}

export interface BannerConfig {
  hero: {
    headline: string;
    subHeadline: string;
    buttonText: string;
    image: string;
  };
  featured: {
    headline: string;
    subHeadline: string;
    buttonText: string;
    image: string;
  };
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  featuredTitle: string;
  featuredSubtitle: string;
  signupTitle: string;
  signupSubtitle: string;
  signupImage: string;
  discountPercentage?: number;
}

export interface AppSettings {
  id: string;
  value: any;
  updated_at?: string;
}
