
import React from 'react';
import { User, UserRole } from '../types';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const roles = [
    { 
      role: UserRole.USER, 
      title: 'Participante (Compra/Venta)', 
      desc: 'Explora el mercado, puja en tiempo real o gestiona tus lotes en venta.',
      icon: '🐄',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    { 
      role: UserRole.ADMIN, 
      title: 'Administrador / Staff', 
      desc: 'Torre de control para activar pujas y adjudicar ganado.',
      icon: '🛡️',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
  ];

  const handleRoleSelection = (role: UserRole) => {
    onLogin({
      id: role === UserRole.ADMIN ? 'admin-001' : `user-${Math.random().toString(36).substr(2, 9)}`,
      name: role === UserRole.ADMIN ? 'Staff Subas-tica' : 'Participante Invitado',
      role,
      identification: '12345678',
      phone: '+506 8888-8888'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Subas-tica</h1>
        <p className="text-lg text-slate-600">Mercado ganadero dinámico y gestión de subastas en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {roles.map(({ role, title, desc, icon, color }) => (
          <button
            key={role}
            onClick={() => handleRoleSelection(role)}
            className={`group p-8 rounded-[2rem] border-2 transition-all hover:shadow-2xl hover:-translate-y-1 text-left flex flex-col ${color}`}
          >
            <span className="text-5xl mb-6">{icon}</span>
            <h3 className="text-2xl font-black mb-3 text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">{desc}</p>
            <div className="mt-auto flex items-center font-bold text-sm">
              Ingresar al Evento <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-16 p-8 bg-white rounded-[2rem] border border-slate-200 w-full max-w-2xl text-center shadow-sm">
        <h4 className="font-black text-slate-800 mb-2 uppercase text-xs tracking-widest">Instrucciones de Recinto</h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          Escanea el código QR en los corrales para abrir la ficha técnica. 
          Podrás marcar interés, intención de compra o pujar directamente cuando el staff active la subasta.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
