
import { AuctionItem, ItemStatus } from './types';

export const MOCK_ITEMS: AuctionItem[] = [
  {
    id: 'mock-1',
    number: 101,
    title: 'Lote Novillos Angus Premium',
    description: '10 novillos Angus de excelente genética, criados en pasturas naturales. Sanidad certificada.',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800',
    sellerId: 'user-demo-1',
    status: ItemStatus.AVAILABLE,
    basePrice: 5000,
    minIncrement: 100,
    isCattle: true,
    cattleData: {
      breed: 'Angus Black',
      weight: 450,
      age: 24,
      sex: 'MACHO',
      condition: 'Excelente',
      vetNotes: 'Protocolo de vacunación completo. Libres de brucelosis.'
    },
    interestedUserIds: [],
    buyIntentUserIds: [],
  },
  {
    id: 'mock-2',
    number: 102,
    title: 'Vaquillonas Brangus de Reposición',
    description: 'Lote de 5 hembras Brangus ideales para cría. Muy dóciles y rústicas.',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800',
    sellerId: 'user-demo-2',
    status: ItemStatus.WITH_INTEREST,
    basePrice: 3500,
    minIncrement: 50,
    isCattle: true,
    cattleData: {
      breed: 'Brangus Colorado',
      weight: 380,
      age: 18,
      sex: 'HEMBRA',
      condition: 'Muy Buena',
      vetNotes: 'Control reproductivo al día.'
    },
    interestedUserIds: ['u1'],
    buyIntentUserIds: [],
  },
  {
    id: 'mock-3',
    number: 103,
    title: 'Toro Reproductor Brahman Tabapua',
    description: 'Ejemplar de alta pureza, apto para mejorar hato cárnico en zonas tropicales.',
    imageUrl: 'https://images.unsplash.com/photo-1527153358354-fbd99c10917f?auto=format&fit=crop&q=80&w=800',
    sellerId: 'user-demo-1',
    status: ItemStatus.READY_TO_ACTIVATE,
    basePrice: 8000,
    minIncrement: 200,
    isCattle: true,
    cattleData: {
      breed: 'Brahman Pura Sangre',
      weight: 850,
      age: 36,
      sex: 'MACHO',
      condition: 'Feria',
      vetNotes: 'Prueba de fertilidad aprobada.'
    },
    interestedUserIds: ['u1', 'u2'],
    buyIntentUserIds: ['u1'],
  },
  {
    id: 'mock-4',
    number: 104,
    title: 'Lote Terneros Holstein Desmamados',
    description: '15 terneros para engorde o desarrollo lechero. Muy sanos.',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=800',
    sellerId: 'user-demo-3',
    status: ItemStatus.AVAILABLE,
    basePrice: 2000,
    minIncrement: 25,
    isCattle: true,
    cattleData: {
      breed: 'Holstein',
      weight: 120,
      age: 6,
      sex: 'MACHO',
      condition: 'Sana',
      vetNotes: 'Desparasitación interna y externa reciente.'
    },
    interestedUserIds: [],
    buyIntentUserIds: [],
  }
];

export const UI_COLORS = {
  primary: 'blue-600',
  secondary: 'slate-100',
  accent: 'emerald-500',
  danger: 'rose-500',
  warning: 'amber-500'
};
