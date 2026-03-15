
import React, { useState } from 'react';
import { AuctionItem, ItemStatus, BidEntry } from '../types';
import { MOCK_ITEMS } from '../constants';
import { supabase } from '../supabase';

interface AdminDashboardProps {
  items: AuctionItem[];
  bids: BidEntry[];
  onActivate: (id: string, duration: number) => void;
  onAdjudicate: (id: string) => void;
  onUpdateStatus: (id: string, status: ItemStatus) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ items, bids, onActivate, onAdjudicate, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'all' | 'demand' | 'active' | 'closed'>('all');
  const [isSeeding, setIsSeeding] = useState(false);

  const activeBiddingItems = items.filter(i => i.status === ItemStatus.ACTIVE_BIDDING);

  const handleSeedData = async () => {
    if (!confirm('¿Cargar nuevos lotes de ganado de prueba en Supabase?')) return;
    setIsSeeding(true);
    
    // Limpieza profunda: eliminamos el ID manual para que Supabase use UUIDs generados automáticamente.
    // Aseguramos que los arrays y objetos estén inicializados correctamente.
    const cleanMocks = MOCK_ITEMS.map(({ id, ...rest }) => ({
      number: rest.number,
      title: rest.title,
      description: rest.description,
      imageUrl: rest.imageUrl,
      sellerId: rest.sellerId,
      status: ItemStatus.AVAILABLE,
      basePrice: rest.basePrice,
      minIncrement: rest.minIncrement,
      isCattle: rest.isCattle,
      cattleData: rest.cattleData || null,
      interestedUserIds: [],
      buyIntentUserIds: [],
      currentBid: null,
      winnerId: null,
      endTime: null
    }));

    try {
      console.log('Enviando datos a Supabase:', cleanMocks);
      
      const { data, error } = await supabase
        .from('items')
        .insert(cleanMocks)
        .select();

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }
      
      console.log('Datos cargados exitosamente:', data);
      alert(`¡${data?.length || 0} lotes cargados! Si no aparecen, refresca la página.`);
    } catch (e: any) {
      console.error('Error detallado:', e);
      alert(`Error al cargar datos: ${e.message || 'Error desconocido'}. Revisa la consola para más detalles.`);
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'demand') return item.status === ItemStatus.READY_TO_ACTIVATE || item.status === ItemStatus.WITH_INTEREST;
    if (filter === 'active') return item.status === ItemStatus.ACTIVE_BIDDING;
    if (filter === 'closed') return item.status === ItemStatus.CLOSED || item.status === ItemStatus.ADJUDICATED;
    return true;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Torre de Control</h1>
          <p className="text-slate-500 font-medium">Gestión multi-puja simultánea en tiempo real.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {isSeeding ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : '🐄'} 
            {isSeeding ? 'Procesando...' : 'Cargar Lotes de Prueba'}
          </button>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
            {(['all', 'demand', 'active', 'closed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black capitalize transition-all ${
                  filter === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {f === 'demand' ? 'Alta Demanda' : f === 'active' ? 'En Vivo' : f === 'closed' ? 'Terminados' : 'Todos'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Monitor de Pujas Activas */}
      {activeBiddingItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3 px-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Pujas en Vivo ({activeBiddingItems.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBiddingItems.map(item => {
              const itemBids = bids.filter(b => b.itemId === item.id).sort((a,b) => b.timestamp - a.timestamp);
              const timeLeft = item.endTime ? Math.max(0, Math.floor((item.endTime - Date.now()) / 1000)) : 0;
              return (
                <div key={item.id} className="bg-white border-2 border-emerald-500 rounded-[2.5rem] p-6 shadow-xl shadow-emerald-50 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 shadow-inner">#{item.number}</div>
                      <div>
                        <h3 className="font-black text-slate-800 text-lg leading-tight">{item.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.cattleData?.breed}</p>
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-black tabular-nums shadow-lg">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Oferta</p>
                      <p className="text-2xl font-black text-slate-800">${(item.currentBid || item.basePrice).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Postores</p>
                      <p className="text-2xl font-black text-slate-800">{new Set(itemBids.map(b => b.userId)).size}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onUpdateStatus(item.id, ItemStatus.PAUSED)} className="bg-amber-100 text-amber-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-200 transition-colors">Pausar</button>
                    <button onClick={() => onUpdateStatus(item.id, ItemStatus.CLOSED)} className="bg-slate-900 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors">Cerrar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tabla de Gestión Principal */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Identificación Lote</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5">Demanda</th>
                <th className="px-8 py-5">Valoración</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm tracking-tight">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{item.number} • {item.isCattle ? item.cattleData?.breed : 'General'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      item.status === ItemStatus.ACTIVE_BIDDING ? 'bg-emerald-500 text-white' :
                      item.status === ItemStatus.READY_TO_ACTIVATE ? 'bg-amber-100 text-amber-700' :
                      item.status === ItemStatus.ADJUDICATED ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>{item.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">{item.interestedUserIds?.length || 0}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Interés</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-amber-600">{item.buyIntentUserIds?.length || 0}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Listos</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 text-sm">${(item.currentBid || item.basePrice).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      {(item.status === ItemStatus.READY_TO_ACTIVATE || item.status === ItemStatus.WITH_INTEREST || item.status === ItemStatus.AVAILABLE) && (
                        <button onClick={() => onActivate(item.id, 120)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg active:scale-95 transition-all">Activar Puja</button>
                      )}
                      {item.status === ItemStatus.CLOSED && (
                        <button onClick={() => onAdjudicate(item.id)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">Adjudicar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">No hay registros que coincidan.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
