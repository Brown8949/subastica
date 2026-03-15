
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuctionItem, ItemStatus, BidEntry, User } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";

// Utilidades para manejo de audio PCM raw de Gemini
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface ItemDetailProps {
  items: AuctionItem[];
  bids: BidEntry[];
  user: User | null;
  onInterest: (id: string) => void;
  onBuyIntent: (id: string) => void;
  onBid: (id: string, amount: number) => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ items, bids, user, onInterest, onBuyIntent, onBid }) => {
  const { id } = useParams<{ id: string }>();
  const item = items.find(i => i.id === id);
  const [customBid, setCustomBid] = useState<string>('');
  const [isReading, setIsReading] = useState(false);
  
  const itemBids = bids.filter(b => b.itemId === id).sort((a,b) => b.timestamp - a.timestamp);
  const currentPrice = item?.currentBid || item?.basePrice || 0;
  const minNextBid = currentPrice + (item?.minIncrement || 0);

  const timeLeft = item?.endTime ? Math.max(0, Math.floor((item.endTime - Date.now()) / 1000)) : 0;

  if (!item) return <div className="p-8">Ítem no encontrado.</div>;

  const handleSpeak = async () => {
    if (isReading) return;
    setIsReading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Actúa como un relator de subastas profesional. Lee la siguiente ficha: 
      Lote número ${item.number}. ${item.title}. 
      ${item.isCattle ? `Raza ${item.cattleData?.breed}, con un peso de ${item.cattleData?.weight} kilos. Condición: ${item.cattleData?.condition}.` : ''}
      Descripción: ${item.description}. 
      Precio base: ${item.basePrice} dólares.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(
          decodeBase64(base64Audio),
          audioCtx,
          24000,
          1
        );
        
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsReading(false);
        source.start();
      } else {
        setIsReading(false);
      }
    } catch (error) {
      console.error("Error al generar audio:", error);
      setIsReading(false);
      alert("No se pudo reproducir el audio en este momento.");
    }
  };

  const isInterested = user ? item.interestedUserIds.includes(user.id) : false;
  const hasIntent = user ? item.buyIntentUserIds.includes(user.id) : false;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Visuals & Info */}
      <div className="space-y-6">
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-white/90 backdrop-blur-md text-slate-800 px-4 py-1.5 rounded-full text-sm font-black shadow-lg">
              #{item.number}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider shadow-lg ${
              item.status === ItemStatus.ACTIVE_BIDDING ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-800 text-white'
            }`}>
              {item.status}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 relative">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-black text-slate-800 pr-12">{item.title}</h1>
            <button 
              onClick={handleSpeak}
              disabled={isReading}
              className={`absolute right-6 top-6 p-3 rounded-full transition-all ${
                isReading ? 'bg-blue-100 text-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg active:scale-95'
              }`}
              title="Escuchar descripción"
            >
              {isReading ? (
                <div className="flex gap-1 items-center px-1">
                  <span className="w-1 h-4 bg-blue-400 animate-[bounce_1s_infinite]"></span>
                  <span className="w-1 h-6 bg-blue-400 animate-[bounce_1.2s_infinite]"></span>
                  <span className="w-1 h-4 bg-blue-400 animate-[bounce_0.8s_infinite]"></span>
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>
          
          <p className="text-slate-600 leading-relaxed pr-2 italic text-sm">
            {isReading ? "Reproduciendo descripción..." : "Pulsa el icono para escuchar los detalles del animal."}
          </p>
          
          <p className="text-slate-600 leading-relaxed">{item.description}</p>
          
          {item.isCattle && item.cattleData && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {[
                { label: 'Raza', val: item.cattleData.breed },
                { label: 'Peso', val: `${item.cattleData.weight} kg` },
                { label: 'Sexo', val: item.cattleData.sex },
                { label: 'Edad', val: `${item.cattleData.age} meses` },
                { label: 'Estado', val: item.cattleData.condition }
              ].map(stat => (
                <div key={stat.label} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                  <p className="font-bold text-slate-800">{stat.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {item.isCattle && item.cattleData?.vetNotes && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
            <span className="text-xl">🩺</span>
            <div>
              <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Reporte Veterinario</p>
              <p className="text-sm text-blue-700 mt-1">{item.cattleData.vetNotes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right: Bidding & Actions */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-200 flex flex-col gap-6 sticky top-24">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {item.status === ItemStatus.ACTIVE_BIDDING ? 'Oferta Actual' : 'Precio Base'}
              </p>
              <p className="text-4xl font-black text-slate-800 mt-1">${currentPrice.toLocaleString()}</p>
            </div>
            {item.status === ItemStatus.ACTIVE_BIDDING && (
              <div className="text-right">
                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Cierra en</p>
                <p className="text-2xl font-black text-slate-800 tabular-nums">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {item.status === ItemStatus.ACTIVE_BIDDING ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onBid(item.id, minNextBid)}
                  className="bg-emerald-600 text-white p-4 rounded-2xl text-sm font-black transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-100"
                >
                  Ofertar +${item.minIncrement.toLocaleString()}
                </button>
                <div className="relative">
                  <input 
                    type="number"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    placeholder={`Mín $${minNextBid.toLocaleString()}`}
                    className="w-full h-full border-2 border-slate-200 rounded-2xl px-4 text-sm font-bold focus:border-emerald-500 outline-none"
                  />
                  {customBid && Number(customBid) >= minNextBid && (
                    <button 
                      onClick={() => {
                        onBid(item.id, Number(customBid));
                        setCustomBid('');
                      }}
                      className="absolute right-2 top-2 bottom-2 bg-slate-800 text-white px-4 rounded-xl text-xs font-bold"
                    >
                      OK
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 max-h-48 overflow-y-auto">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Historial de Pujas</h4>
                {itemBids.length > 0 ? (
                  <div className="space-y-2">
                    {itemBids.map((bid, idx) => (
                      <div key={bid.id} className={`flex justify-between items-center ${idx === 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-xs font-bold">{bid.userId === user?.id ? 'Tú' : 'Comprador #'+bid.userId.slice(-3)}</span>
                        </div>
                        <span className="text-xs font-black">${bid.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">No hay pujas todavía. ¡Sé el primero!</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onInterest(item.id)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all ${
                    isInterested ? 'bg-blue-600 text-white' : 'bg-white border-2 border-blue-600 text-blue-600'
                  }`}
                >
                  {isInterested ? 'Me Interesa ✓' : '⭐ Marcar Interés'}
                </button>
                <button
                  onClick={() => onBuyIntent(item.id)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all ${
                    hasIntent ? 'bg-amber-500 text-white' : 'bg-white border-2 border-amber-500 text-amber-500'
                  }`}
                >
                  {hasIntent ? 'Quiero Comprar ✓' : '🔥 Quiero Comprar'}
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 px-8">
                Al marcar "Quiero Comprar" notificas al staff tu intención de compra real. La subasta se activará si hay suficiente demanda.
              </p>
            </div>
          )}

          <div className="pt-4 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-slate-800">{item.interestedUserIds.length}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Interesados</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-amber-600">{item.buyIntentUserIds.length}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Listos para comprar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
