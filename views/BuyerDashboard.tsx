
import React from 'react';
import { Link } from 'react-router-dom';
import { AuctionItem, ItemStatus } from '../types';

interface BuyerDashboardProps {
  items: AuctionItem[];
  onInterest: (id: string) => void;
  onBuyIntent: (id: string) => void;
  userId: string;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ items, onInterest, onBuyIntent, userId }) => {
  const getStatusLabel = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.AVAILABLE: return { text: 'Disponible', color: 'bg-slate-100 text-slate-600' };
      case ItemStatus.WITH_INTEREST: return { text: 'Con Interés', color: 'bg-blue-100 text-blue-600' };
      case ItemStatus.READY_TO_ACTIVATE: return { text: 'Listo para Subasta', color: 'bg-amber-100 text-amber-600' };
      case ItemStatus.ACTIVE_BIDDING: return { text: '¡EN PUJA!', color: 'bg-emerald-500 text-white animate-pulse' };
      case ItemStatus.CLOSED: return { text: 'Cerrado', color: 'bg-gray-800 text-white' };
      default: return { text: status, color: 'bg-slate-100' };
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Mercado en Vivo</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Buscar por # o Raza..." 
            className="px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => {
          const status = getStatusLabel(item.status);
          const isInterested = item.interestedUserIds.includes(userId);
          const hasIntent = item.buyIntentUserIds.includes(userId);

          return (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
              <Link to={`/item/${item.id}`} className="block relative aspect-[4/3]">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
                    {status.text}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold">
                    #{item.number}
                  </span>
                </div>
              </Link>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.isCattle ? `${item.cattleData?.breed} • ${item.cattleData?.weight}kg` : item.description}
                  </p>
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Precio Base</span>
                    <span className="font-bold text-slate-800">
                      ${item.basePrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onInterest(item.id)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isInterested ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {isInterested ? 'Interesado ✓' : 'Me Interesa'}
                    </button>
                    <button
                      onClick={() => onBuyIntent(item.id)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        hasIntent ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      {hasIntent ? 'Quiero Comprar ✓' : 'Quiero Comprar'}
                    </button>
                  </div>
                  
                  {item.status === ItemStatus.ACTIVE_BIDDING && (
                    <Link
                      to={`/item/${item.id}`}
                      className="block w-full text-center bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600"
                    >
                      Participar en Puja
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuyerDashboard;
