export type UserRole = 'GUEST' | 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string; // Optional for receipts
  role: UserRole;
}

export interface OrderItem {
  projectId: string;       // Reference to the ordered project
  name: string;            // Project name at time of order
  themeId: string;         // Theme at time of order
  quantity: number;
  pricePerUnit: number;
  // Legacy format support: some old orders stored a full project snapshot
  project?: { name?: string; previewUrl?: string; pageCount?: number;[key: string]: any };
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
  // Status uses uppercase to match backend DB values
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
}

export interface UploadedImage {
  id: string;
  url: string;
  usedCount: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

export enum SlotType {
  IMAGE = 'image',
  TEXT = 'text',
}

export interface SlotSettings {
  // Image settings
  fit?: 'cover' | 'contain';
  filter?: 'none' | 'grayscale' | 'sepia' | 'contrast';
  cropX?: number;
  cropY?: number;

  // Text settings
  align?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '300' | '400' | '600' | '700';
  fontStyle?: 'normal' | 'italic';
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  uppercase?: boolean;
  verticalAlign?: 'top' | 'center' | 'bottom';
}

export interface LayoutSlot {
  id: string;
  type: SlotType;
  className: string;
  placeholder?: string;
  // Admin Constructed Layouts (percentages 0-100)
  rect?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  rotation?: number;
  opacity?: number;
  borderRadius?: number;
  zIndex?: number;
  locked?: boolean;
  /** Предзаполнение: для IMAGE — URL фото, для TEXT — текст. При применении макета к странице копируется в content. */
  defaultContent?: string;
  /** Позиция фото в слоте (object-position %). При применении макета копируется в slotSettings.cropX/cropY. */
  defaultContentPosition?: { x: number; y: number };
  /** Настройки текста по умолчанию (шрифт, размер, жирность и т.д.). При применении макета копируются в slotSettings. */
  defaultSettings?: SlotSettings;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  thumbnail: string;
  slots: LayoutSlot[];
  gridConfig: string;
  tags?: string[];
  backgroundImage?: string;
  isCustom?: boolean;
}

export interface PageContent {
  [slotId: string]: string;
}

export type PageType = 'content' | 'cover' | 'flyleaf';

export interface PageData {
  id: string;
  layoutId: string;
  type: PageType;
  content: PageContent;
  slotSettings: { [slotId: string]: SlotSettings };
  backgroundColor?: string;
}

export interface Spread {
  id: string;
  leftPage: PageData;
  rightPage: PageData;
}

export type AppView = 'dashboard' | 'theme_selection' | 'editor' | 'cart';
export type ViewMode = 'editor' | 'preview' | 'admin' | 'cart';
export type SidebarTab = 'gallery' | 'templates' | 'backgrounds' | 'text';

// --- Theme System ---

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  palette: string[];
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  price: string;
  badge?: 'Hit' | 'Limited' | 'New';
  previewImage: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  recommendedPages: number;
}

export interface Project {
  id: string;
  name: string;
  themeId: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  previewUrl: string;
  spreads: Spread[];
  pageCount: number;
  price: string;
}

export interface CartItem {
  projectId: string;
  quantity: number;
  pricePerUnit: number;
  addedAt: string; // ISO string
}
