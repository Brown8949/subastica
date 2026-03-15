
import React from 'react';
import { AuctionItem, ItemStatus } from '../types';

interface SellerDashboardProps {
  items: AuctionItem[];
  sellerId: string;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ items, sellerId }) => {
  const sellerItems = items.filter(i => i.sellerId === sellerId);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-800">Mis Ventas</h1>
        <p className="text-slate-500">Sigue el estado de tus lotes y animales en tiempo real.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellerItems.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="h-48 relative">
              <img src={item.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-black shadow-md">
                #{item.number}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.status === ItemStatus.ADJUDICATED ? 'bg-emerald-100 text-emerald-700' : 
                  item.status === ItemStatus.ACTIVE_BIDDING ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Valor Actual</span>
                  <span className="font-black text-slate-800">${(item.currentBid || item.basePrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Intenciones de Compra</span>
                  <span className="font-black text-amber-600">{item.buyIntentUserIds.length}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all bg-slate-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-bold">Registrar Nuevo Lote</span>
        </button>
      </div>
    </div>
  );
};

export default SellerDashboard;
