import { ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'memories',
    name: 'Soulmates',
    description: 'Для самых теплых общих воспоминаний',
    price: '4 490 ₽',
    badge: 'Hit',
    previewImage: 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?q=80&w=600&auto=format&fit=crop', // Child/Family style
    colors: {
      primary: '#78350f',
      secondary: '#d97706',
      background: '#ffffff',
      text: '#451a03',
      accent: '#92400e',
      palette: ['#ffffff', '#fffbeb', '#fef3c7', '#fde68a', '#e7e5e4']
    },
    fonts: {
      heading: '"Courier Prime", monospace',
      body: '"Merriweather", serif'
    },
    recommendedPages: 40
  },
  {
    id: 'valentine',
    name: 'Лавбук',
    description: 'Идеальный подарок для любимых',
    price: '4 490 ₽',
    badge: 'Limited',
    previewImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop', // Red/Heart style
    colors: {
      primary: '#e11d48',
      secondary: '#fda4af',
      background: '#fff1f2',
      text: '#881337',
      accent: '#fb7185',
      palette: ['#ffffff', '#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af']
    },
    fonts: {
      heading: '"Great Vibes", cursive',
      body: '"Lato", sans-serif'
    },
    recommendedPages: 40
  },
  {
    id: 'lookbook',
    name: 'Лукбук',
    description: 'Стильное портфолио ваших образов',
    price: '5 590 ₽',
    previewImage: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=600&auto=format&fit=crop', // Minimal beige
    colors: {
      primary: '#000000',
      secondary: '#333333',
      background: '#ffffff',
      text: '#1a1a1a',
      accent: '#737373',
      palette: ['#ffffff', '#f3f4f6', '#e5e7eb', '#111827', '#000000']
    },
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"Inter", sans-serif'
    },
    recommendedPages: 40
  },
  {
    id: 'astrology',
    name: 'Гороскоп',
    description: 'Магия звезд и вашей истории',
    price: '6 590 ₽',
    badge: 'Hit',
    previewImage: 'https://images.unsplash.com/photo-1531303435785-3853ba035cda?q=80&w=600&auto=format&fit=crop', // Dark/Greenish mood
    colors: {
      primary: '#fbbf24', // Gold
      secondary: '#4f46e5',
      background: '#1e293b',
      text: '#f8fafc',
      accent: '#818cf8',
      palette: ['#0f172a', '#1e293b', '#312e81', '#172554', '#ffffff']
    },
    fonts: {
      heading: '"Cinzel", serif',
      body: '"Montserrat", sans-serif'
    },
    recommendedPages: 100
  },
  {
    id: 'kavkaz',
    name: 'Путешествия',
    description: 'Сохраните впечатления из поездок',
    price: '4 490 ₽',
    previewImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop', // Nature/Mountains
    colors: {
      primary: '#3f6212',
      secondary: '#84cc16',
      background: '#f7fee7',
      text: '#1a2e05',
      accent: '#65a30d',
      palette: ['#ffffff', '#ecfccb', '#d9f99d', '#bef264', '#f7fee7']
    },
    fonts: {
      heading: '"Inter", sans-serif',
      body: '"Inter", sans-serif'
    },
    recommendedPages: 40
  },
  {
    id: 'year_2025',
    name: 'Итоги года',
    description: 'Главные моменты прошедшего года',
    price: '4 490 ₽',
    badge: 'Limited',
    previewImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop', // 2025/Journal style
    colors: {
      primary: '#0f172a',
      secondary: '#334155',
      background: '#f8fafc',
      text: '#020617',
      accent: '#475569',
      palette: ['#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#0f172a']
    },
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"Lato", sans-serif'
    },
    recommendedPages: 40
  },
  {
    id: 'red_fabric',
    name: '14 февраля',
    description: 'Романтический подарок',
    price: '5 390 ₽',
    previewImage: 'https://images.unsplash.com/photo-1518930255481-69766465d3d4?q=80&w=600&auto=format&fit=crop',
    colors: {
      primary: '#b91c1c',
      secondary: '#f87171',
      background: '#fff',
      text: '#450a0a',
      accent: '#dc2626',
      palette: ['#ffffff', '#fef2f2', '#fee2e2', '#fca5a5', '#b91c1c']
    },
    fonts: {
      heading: '"Inter", sans-serif',
      body: '"Inter", sans-serif'
    },
    recommendedPages: 40
  }
];