import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  Users, 
  Building2, 
  Zap,
  HelpCircle,
  PlayCircle
} from 'lucide-react';

const categories = [
  {
    id: 'onboarding',
    title: 'Primeros Pasos',
    description: 'Configura tu empresa y conecta tu equipo en minutos.',
    icon: PlayCircle,
    color: 'text-blue-500',
    articles: [
      'Cómo crear tu primera organización',
      'Invitación de miembros del equipo',
      'Configuración de roles y permisos',
      'Primeros pasos en modo Demo'
    ]
  },
  {
    id: 'projects',
    title: 'Gestión de Obras',
    description: 'Control de proyectos, geocercas y personal asignado.',
    icon: Building2,
    color: 'text-[#FF6600]',
    articles: [
      'Creación y edición de proyectos',
      'Configuración de radios de validación GPS',
      'Asignación de subcontratas a obras',
      'Gestión del catálogo de operarios'
    ]
  },
  {
    id: 'reports',
    title: 'Partes y Albaranes',
    description: 'Flujo de trabajo desde el tajo hasta la certificación.',
    icon: FileText,
    color: 'text-emerald-500',
    articles: [
      'Emisión de partes diarios desde el móvil',
      'Validación técnica por el Jefe de Obra',
      'Generación automática de albaranes',
      'Resolución de disputas y correcciones'
    ]
  },
  {
    id: 'security',
    title: 'Seguridad y Red',
    description: 'Inmutabilidad de datos y cumplimiento legal.',
    icon: ShieldCheck,
    color: 'text-purple-500',
    articles: [
      'Entendiendo la red multi-tenant',
      'Auditoría total (Audit Trail)',
      'Protección de datos y RGPD',
      'Exportación inmutable de registros'
    ]
  }
];

import { toast } from 'react-hot-toast';
import { AppState } from '../types';

interface DocsViewProps {
  state?: AppState;
}

export const DocsView: React.FC<DocsViewProps> = ({ state }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDocClick = (title: string) => {
    toast.success(`Abriendo documentación: ${title}`, {
      icon: '📚',
      style: {
        borderRadius: '16px',
        background: '#1F2329',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
    });
  };

  const handleSupportTicket = () => {
    toast.error('El sistema de tickets está en mantenimiento programado.', {
      style: {
        borderRadius: '16px',
        background: '#1F2329',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Centro de Conocimiento</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Documentación Técnica y Guías de Usuario</p>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6600] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="¿CÓMO PODEMOS AYUDARTE?..."
            className="bg-[#1F2329] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-[#FF6600]/30 w-full transition-all"
          />
        </div>
      </div>

      {/* Categories Linear List */}
      <div className="flex flex-col space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-[#1F2329] border border-white/5 rounded-[2.5rem] p-8 hover:border-[#FF6600]/30 transition-all group flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl bg-white/5 ${category.color} group-hover:scale-110 transition-transform`}>
                <category.icon className="w-8 h-8" />
              </div>
              <button 
                onClick={() => handleDocClick(category.title)}
                className="text-[10px] font-black uppercase text-[#FF6600] tracking-widest flex items-center gap-2 cursor-pointer"
              >
                Ver Todo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{category.title}</h3>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
              {category.description}
            </p>

            <div className="space-y-3 mt-auto">
              {category.articles.map((article, i) => (
                <button 
                  key={i}
                  onClick={() => handleDocClick(article)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 text-slate-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
                >
                  {article}
                  <ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Support CTA */}
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-800 rounded-[2.5rem] p-12 text-center relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <HelpCircle className="w-16 h-16 text-white mx-auto mb-6 opacity-80 group-hover:scale-110 transition-transform" />
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">¿No encuentras lo que buscas?</h2>
        <p className="text-white/80 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
          Nuestro equipo de soporte especializado en ingeniería civil está disponible de Lunes a Viernes (08:00 - 18:00 CET) para resolver cualquier duda técnica.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleSupportTicket}
            className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-tighter text-lg hover:bg-black hover:text-white transition-all shadow-xl cursor-pointer"
          >
            Abrir Ticket de Soporte
          </button>
          <button 
            onClick={() => toast('Chat en vivo próximamente...', { icon: '💬' })}
            className="bg-black/20 text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase tracking-tighter text-lg hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer"
          >
            Chat en Vivo
          </button>
        </div>
      </div>
    </div>
  );
};
