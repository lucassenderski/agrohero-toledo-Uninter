export type Category = 
  | 'todos'
  | 'hortalicas'
  | 'frutas'
  | 'legumes_raizes'
  | 'ovos_mel'
  | 'artesanais';

export interface Producer {
  id: string;
  name: string;
  farmName: string;
  district: string; // District in Toledo - PR (e.g. Novo Sarandi, Concórdia do Oeste)
  bio: string;
  phone: string;
  avatar: string;
  yearsFarming: number;
}

export interface Product {
  id: string;
  name: string;
  category: 'hortalicas' | 'frutas' | 'legumes_raizes' | 'ovos_mel' | 'artesanais';
  price: number;
  unit: string; // 'kg', 'maço', 'bandeja 500g', 'dúzia', 'pote 500g'
  stock: number;
  producerId: string;
  producer: Producer;
  organicCert: string; // e.g. "Certificação Orgânica CPOrg-PR" | "Selo Agroecológico Rede Ecovida"
  description: string;
  harvestDate: string; // e.g. "Colheita fresca diária"
  image: string;
  nutritionalBenefits: string[];
  featured?: boolean;
}

export interface RecipeIngredient {
  productId?: string; // Optional link to store product
  name: string;
  quantity: string;
  availableInStore: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  prepTimeMinutes: number;
  servings: number;
  difficulty: 'Fácil' | 'Médio' | 'Elaborado';
  category: 'Prato Principal' | 'Saladas' | 'Lanches & Sopas' | 'Sobremesas' | 'Bebidas & Sucos';
  image: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  chefTip: string;
  toledoOriginNote: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: 'farmer' | 'consumer' | 'chef' | 'cooperative';
  location: string; // e.g. "Novo Sarandi, Toledo - PR"
  avatar: string;
  rating: number;
  text: string;
  date: string;
  badges: string[];
  impactHighlight?: string;
  likesCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'novo' | 'colheita' | 'em_rota' | 'entregue';

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryMethod: 'delivery' | 'pickup';
  neighborhood: string;
  pickupLocation?: string;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card';
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  notes?: string;
}

export type UserRole = 'consumer' | 'farmer' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  farmName?: string;
  avatar: string;
}
