
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  User, 
  UserRole, 
  AuctionItem, 
  ItemStatus, 
  BidEntry 
} from './types';
import { supabase } from './supabase';

// Layout Components
import Navbar from './components/Navbar';
import LandingPage from './views/LandingPage';
import UserDashboard from './views/UserDashboard';
import AdminDashboard from './views/AdminDashboard';
import ItemDetail from './views/ItemDetail';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('subastica_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [bids, setBids] = useState<BidEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log('App: Cargando datos iniciales...');
      
      const { data: initialItems, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .order('number', { ascending: true });
        
      const { data: initialBids, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (itemsError) {
        console.error('App: Error al cargar ítems:', itemsError);
        throw itemsError;
      }
      
      console.log('App: Ítems recibidos:', initialItems?.length || 0);
      
      if (initialItems) setItems(initialItems);
      if (initialBids) setBids(initialBids);
    } catch (err) {
      console.error('App: Error crítico en carga inicial:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const itemsSubscription = supabase
      .channel('subastica-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (payload) => {
        console.log('Realtime Update Items:', payload);
        if (payload.eventType === 'UPDATE') {
          setItems(current => current.map(item => item.id === payload.new.id ? payload.new as AuctionItem : item));
        } else if (payload.eventType === 'INSERT') {
          setItems(current => {
            const exists = current.some(i => i.id === payload.new.id);
            return exists ? current : [...current, payload.new as AuctionItem];
          });
        } else if (payload.eventType === 'DELETE') {
          setItems(current => current.filter(i => i.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, (payload) => {
        console.log('Realtime New Bid:', payload);
        setBids(current => [payload.new as BidEntry, ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('subastica_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('subastica_user');
  };

  const handleInterest = async (itemId: string) => {
    if (!currentUser) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const isInterested = item.interestedUserIds.includes(currentUser.id);
    const newList = isInterested 
      ? item.interestedUserIds.filter(id => id !== currentUser.id)
      : [...item.interestedUserIds, currentUser.id];
    
    let newStatus = item.status;
    if (newList.length > 0 && item.status === ItemStatus.AVAILABLE) {
      newStatus = ItemStatus.WITH_INTEREST;
    } else if (newList.length === 0 && item.status === ItemStatus.WITH_INTEREST) {
      newStatus = ItemStatus.AVAILABLE;
    }

    await supabase.from('items').update({ 
      interestedUserIds: newList, 
      status: newStatus 
    }).eq('id', itemId);
  };

  const handleBuyIntent = async (itemId: string) => {
    if (!currentUser) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const hasIntent = item.buyIntentUserIds.includes(currentUser.id);
    const newList = hasIntent
      ? item.buyIntentUserIds.filter(id => id !== currentUser.id)
      : [...item.buyIntentUserIds, currentUser.id];
    
    let newStatus = item.status;
    if (newList.length > 0) {
      newStatus = ItemStatus.READY_TO_ACTIVATE;
    } else if (item.interestedUserIds.length > 0) {
      newStatus = ItemStatus.WITH_INTEREST;
    } else {
      newStatus = ItemStatus.AVAILABLE;
    }

    await supabase.from('items').update({ 
      buyIntentUserIds: newList, 
      status: newStatus 
    }).eq('id', itemId);
  };

  const placeBid = async (itemId: string, amount: number) => {
    if (!currentUser) return;
    const item = items.find(i => i.id === itemId);
    if (!item || item.status !== ItemStatus.ACTIVE_BIDDING) return;

    const currentPrice = item.currentBid || item.basePrice;
    if (amount < currentPrice + item.minIncrement) {
      alert(`Mínimo requerido: $${(currentPrice + item.minIncrement).toLocaleString()}`);
      return;
    }

    const now = Date.now();
    let newEndTime = item.endTime;
    if (item.endTime && (item.endTime - now < 30000)) {
      newEndTime = now + 30000;
    }

    const { error } = await supabase.from('bids').insert({
      itemId,
      userId: currentUser.id,
      amount,
      timestamp: now
    });

    if (!error) {
      await supabase.from('items').update({ 
        currentBid: amount, 
        endTime: newEndTime 
      }).eq('id', itemId);
    }
  };

  const activateBidding = async (itemId: string, durationSeconds: number) => {
    await supabase.from('items').update({ 
      status: ItemStatus.ACTIVE_BIDDING, 
      endTime: Date.now() + (durationSeconds * 1000) 
    }).eq('id', itemId);
  };

  const adjudicateItem = async (itemId: string) => {
    const itemBids = bids.filter(b => b.itemId === itemId).sort((a,b) => b.amount - a.amount);
    const lastBid = itemBids[0];
    await supabase.from('items').update({ 
      status: ItemStatus.ADJUDICATED,
      winnerId: lastBid?.userId 
    }).eq('id', itemId);
  };

  const updateStatus = async (itemId: string, status: ItemStatus) => {
    await supabase.from('items').update({ status }).eq('id', itemId);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const expiredItems = items.filter(item => 
        item.status === ItemStatus.ACTIVE_BIDDING && item.endTime && now > item.endTime
      );

      for (const item of expiredItems) {
        await supabase.from('items').update({ status: ItemStatus.CLOSED }).eq('id', item.id);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [items]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6 text-center px-6">
          <div className="w-16 h-16 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div>
            <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Sincronizando Subas-tica</p>
            <p className="text-slate-400 text-xs mt-2">Conectando con la torre de control en tiempo real...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        {currentUser && <Navbar user={currentUser} onLogout={handleLogout} />}
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route 
              path="/" 
              element={currentUser ? <Navigate to={`/${currentUser.role.toLowerCase()}`} /> : <LandingPage onLogin={handleLogin} />} 
            />
            
            <Route 
              path="/user" 
              element={currentUser?.role === UserRole.USER ? 
                <UserDashboard items={items} userId={currentUser.id} onInterest={handleInterest} onBuyIntent={handleBuyIntent} /> : 
                <Navigate to="/" />} 
            />
            
            <Route 
              path="/admin" 
              element={currentUser?.role === UserRole.ADMIN ? 
                <AdminDashboard items={items} bids={bids} onActivate={activateBidding} onAdjudicate={adjudicateItem} onUpdateStatus={updateStatus} /> : 
                <Navigate to="/" />} 
            />

            <Route 
              path="/item/:id" 
              element={<ItemDetail 
                items={items} 
                bids={bids} 
                user={currentUser} 
                onInterest={handleInterest} 
                onBuyIntent={handleBuyIntent} 
                onBid={placeBid} 
              />} 
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
