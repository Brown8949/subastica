
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuctionItem, ItemStatus, User } from '../types';

interface UserDashboardProps {
  items: AuctionItem[];
  userId: string;
  onInterest: (id: string) => void;
  onBuyIntent: (id: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ items, userId, onInterest, onBuyIntent }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'my_sales'>('market');
  const [search, setSearch] = useState('');

  const marketItems = items.filter(i => i.sellerId !== userId && 
    (i.title.toLowerCase().includes(search.toLowerCase()) || 
     i.cattleData?.breed.toLowerCase().includes(search.toLowerCase()))
  );
  
  const myItems = items.filter(i => i.sellerId === userId);

  const getStatusLabel = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.AVAILABLE: return { text: 'Disponible', color: 'bg-slate-800 text-white' };
      case ItemStatus.WITH_INTEREST: return { text: 'Con Interés', color: 'bg-blue-600 text-white' };
      case ItemStatus.READY_TO_ACTIVATE: return { text: 'Listo para Puja', color: 'bg-amber-500 text-white' };
      case ItemStatus.ACTIVE_BIDDING: return { text: '¡EN VIVO!', color: 'bg-emerald-500 text-white animate-pulse' };
      case ItemStatus.CLOSED: return { text: 'Finalizado', color: 'bg-gray-400 text-white' };
      case ItemStatus.ADJUDICATED: return { text: 'Adjudicado', color: 'bg-emerald-100 text-emerald-700' };
      default: return { text: status.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-500' };
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Mi Panel</h2>
          <p className="text-slate-500 font-medium">Mercado interactivo en tiempo real.</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-all ${
              activeTab === 'market' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <span>🏪</span> Mercado
          </button>
          <button 
            onClick={() => setActiveTab('my_sales')}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-all ${
              activeTab === 'my_sales' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <span>🐄</span> Mis Lotes
          </button>
        </div>
      </header>

      {activeTab === 'market' ? (
        <div className="space-y-8">
          <div className="relative group">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por lote, raza o características..." 
              className="px-8 py-5 border-2 border-slate-100 rounded-[2rem] bg-white shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none w-full md:w-[32rem] text-sm font-bold transition-all"
            />
            <div className="absolute right-6 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {marketItems.map(item => {
              const status = getStatusLabel(item.status);
              const isInterested = item.interestedUserIds.includes(userId);
              const hasIntent = item.buyIntentUserIds.includes(userId);

              return (
                <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col relative">
                  {/* Badge de Lote */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-slate-900 text-xs font-black shadow-xl border border-white/50">
                      LOTE #{item.number}
                    </div>
                  </div>

                  <Link to={`/item/${item.id}`} className="block relative aspect-[4/3] overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-6 left-6 flex gap-2">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-8 flex-1 flex flex-col bg-white">
                    <div className="mb-6">
                      <h3 className="font-black text-slate-900 text-xl mb-1 tracking-tight line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          {item.cattleData?.breed || 'General'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">•</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          {item.cattleData?.weight ? `${item.cattleData.weight}kg` : 'Peso N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-6">
                      <div className="flex items-center justify-between py-4 border-y border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Valor de entrada</span>
                          <span className="font-black text-slate-900 text-2xl leading-none mt-1">
                            ${(item.currentBid || item.basePrice).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Interés</span>
                          <div className="flex items-center gap-1.5 mt-1 justify-end">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="font-black text-slate-800">{item.interestedUserIds.length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => onInterest(item.id)}
                          className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                            isInterested 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                              : 'bg-white text-blue-600 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50'
                          }`}
                        >
                          {isInterested ? '⭐ Interesado' : 'Me Interesa'}
                        </button>
                        <button
                          onClick={() => onBuyIntent(item.id)}
                          className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                            hasIntent 
                              ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100' 
                              : 'bg-white text-amber-500 border-slate-100 hover:border-amber-500 hover:bg-amber-50/50'
                          }`}
                        >
                          {hasIntent ? '🔥 Comprar ✓' : 'Quiero Comprar'}
                        </button>
                      </div>
                      
                      {item.status === ItemStatus.ACTIVE_BIDDING && (
                        <Link
                          to={`/item/${item.id}`}
                          className="block w-full text-center bg-emerald-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95"
                        >
                          🔥 Participar en Puja Activa
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {marketItems.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <span className="text-7xl mb-6 grayscale opacity-40">🐂</span>
              <h4 className="text-xl font-black text-slate-800 mb-2">No se encontraron lotes</h4>
              <p className="text-slate-400 font-medium">Prueba con otra búsqueda o espera nuevos ingresos.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myItems.map(item => (
            <div key={item.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col group hover:border-blue-100 transition-all">
              <div className="h-56 relative overflow-hidden">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-6 left-6 bg-white/95 px-4 py-2 rounded-2xl text-[10px] font-black shadow-xl">
                  Lote #{item.number}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-black text-slate-900 text-xl mb-3">{item.title}</h3>
                <div className="flex items-center gap-3 mb-8">
                  <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    item.status === ItemStatus.ADJUDICATED ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 
                    item.status === ItemStatus.ACTIVE_BIDDING ? 'bg-blue-600 text-white animate-pulse shadow-lg shadow-blue-200' : 
                    'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="mt-auto space-y-5 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valoración</span>
                    <span className="font-black text-slate-900 text-xl">${(item.currentBid || item.basePrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postores Listos</span>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(item.buyIntentUserIds.length, 3))].map((_, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-amber-600">
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <span className="font-black text-amber-600 text-lg">{item.buyIntentUserIds.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button className="border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-16 text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all bg-slate-50/50 hover:bg-blue-50/30 group">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 border border-slate-100 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-black text-sm uppercase tracking-widest">Registrar Nuevo Lote</span>
            <p className="text-[10px] font-bold mt-2 opacity-60">Sube fotos y datos del animal</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
