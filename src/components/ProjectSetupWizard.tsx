import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Euro, 
  Clock, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Calendar,
  Compass,
  FileText,
  AlertCircle,
  Eye,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectLocationPicker } from './ProjectLocationPicker';
import { obraStore } from '../services/store';
import { Project } from '../types';
import toast from 'react-hot-toast';

interface ProjectSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProject: Project) => void;
  onNavigateToTeam?: () => void;
}

const COVER_PRESETS = [
  {
    id: 'res_1',
    title: 'Residencial',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'ind_1',
    title: 'Logística',
    url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'urb_1',
    title: 'Edificación',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'reh_1',
    title: 'Rehabilitación',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80'
  }
];

export const ProjectSetupWizard: React.FC<ProjectSetupWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigateToTeam
}) => {
  // Wizard current step: 1 = Basic Data, 2 = Location & Geofence, 3 = Summary & Confirm, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [initialBudget, setInitialBudget] = useState<number>(350000);
  const [projectType, setProjectType] = useState('Edificación Residencial');
  const [plannedHours, setPlannedHours] = useState<number>(14000);
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);

  // Location states
  const [address, setAddress] = useState('Paseo de la Castellana 140, Madrid');
  const [lat, setLat] = useState<number>(40.4530);
  const [lng, setLng] = useState<number>(-3.6883);
  const [radius, setRadius] = useState<number>(250);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);

  if (!isOpen) return null;

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor, indica el nombre del proyecto u obra.');
      return;
    }
    if (!client.trim()) {
      setErrorMessage('Por favor, introduce el nombre del Cliente o Promotora.');
      return;
    }
    if (!initialBudget || initialBudget <= 0) {
      setErrorMessage('Por favor, especifica un presupuesto inicial válido mayor que 0.');
      return;
    }

    setStep(2);
  };

  const handleNextStep2 = () => {
    setErrorMessage('');
    if (!address.trim()) {
      setErrorMessage('Por favor, selecciona o escribe la dirección de la obra.');
      return;
    }
    setStep(3);
  };

  const handleConfirmAndCreate = () => {
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = obraStore.createProject({
        name: name.trim(),
        address: address.trim(),
        latitude: lat,
        longitude: lng,
        location: {
          address: address.trim(),
          lat,
          lng,
          latitude: lat,
          longitude: lng,
        },
        validationRadiusMeters: radius,
        plannedHours: plannedHours || 12000,
        status: 'Active',
        client: client.trim(),
        initialBudget: initialBudget || 300000,
        spentBudget: 0,
        coverImage,
        projectType,
        description: `Proyecto contratado por ${client.trim()} con presupuesto inicial de ${initialBudget.toLocaleString('es-ES')} € y geocerca de ${radius}m.`
      });

      setIsSubmitting(false);

      if (res.success && res.project) {
        setCreatedProject(res.project);
        setStep(4);
        toast.success(`¡Obra "${res.project.name}" activada con éxito!`, {
          icon: '🏗️',
          duration: 4000
        });
        onSuccess(res.project);
      } else {
        setErrorMessage(res.error || 'No se pudo crear el proyecto. Inténtalo de nuevo.');
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/85 backdrop-blur-md p-3 sm:p-6 font-sans overflow-y-auto animate-in fade-in duration-200">
      <div className={`bg-white rounded-3xl w-full ${isMapExpanded && step === 2 ? 'max-w-6xl h-[92vh]' : 'max-w-3xl max-h-[92vh]'} shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto transition-all duration-300`}>
        
        {/* Top Header & Step Progress Bar */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6600] flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20">
              {step === 4 ? '✓' : `0${step}`}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">
                  Setup de Nueva Obra
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {step === 1 && 'Paso 1: Datos Básicos'}
                  {step === 2 && 'Paso 2: Ubicación & Geocerca'}
                  {step === 3 && 'Paso 3: Revisión y Confirmación'}
                  {step === 4 && '¡Proyecto Inicializado!'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {step === 1 && 'Información General y Presupuesto'}
                {step === 2 && 'Perímetro Satelital y Radio para Fichar'}
                {step === 3 && 'Validación de Parámetros de Obra'}
                {step === 4 && 'Obra lista para recibir cuadrillas'}
              </h2>
            </div>
          </div>

          {step !== 4 && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cancelar y cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Progress Track */}
        {step !== 4 && (
          <div className="w-full bg-slate-100 h-1.5 flex shrink-0">
            <div 
              className="bg-[#FF6600] h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* Wizard Body with scroll */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-3 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: BASIC DATA */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Project Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                    Nombre del Proyecto / Obra <span className="text-[#FF6600]">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Residencial Puerta de Hierro Fase II"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Client / Promotora */}
                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                    Cliente / Promotora <span className="text-[#FF6600]">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Ej. Metrovacesa S.A."
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Initial Budget in Euros */}
                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                    Presupuesto Inicial (€) <span className="text-[#FF6600]">*</span>
                  </label>
                  <div className="relative">
                    <Euro className="w-4 h-4 text-[#FF6600] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={1000}
                      step={5000}
                      value={initialBudget}
                      onChange={(e) => setInitialBudget(parseInt(e.target.value) || 0)}
                      placeholder="350000"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-900 font-mono focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Se utilizará para la barra de avance financiero y control de albaranes.
                  </span>
                </div>

                {/* Typology & Planned Hours */}
                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                    Tipología de Obra
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all shadow-sm cursor-pointer"
                  >
                    <option value="Edificación Residencial">Edificación Residencial</option>
                    <option value="Comercial y Oficinas">Comercial y Oficinas</option>
                    <option value="Industrial y Logística">Industrial y Logística</option>
                    <option value="Obra Civil y Vías">Obra Civil y Vías</option>
                    <option value="Rehabilitación Energética">Rehabilitación Energética</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1.5 uppercase tracking-wider">
                    Horas Estimadas de Cuadrilla
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={plannedHours}
                      onChange={(e) => setPlannedHours(parseInt(e.target.value) || 0)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-900 font-mono focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image Selection */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 mb-2 uppercase tracking-wider">
                  Foto de Portada del Proyecto
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COVER_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setCoverImage(preset.url)}
                      className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-video ${
                        coverImage === preset.url
                          ? 'border-[#FF6600] ring-2 ring-[#FF6600]/30 shadow-md scale-[1.02]'
                          : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                          {preset.title}
                        </span>
                      </div>
                      {coverImage === preset.url && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF6600] text-white flex items-center justify-center text-[10px] font-black shadow-md">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#FF6600] hover:bg-[#EA580C] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-950/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Siguiente: Ubicación y Geocerca</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: LOCATION & GEOFENCE WITH GOOGLE MAPS / LOCATION PICKER */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
                <Compass className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold text-slate-900 block">Control Satelital de Presencia:</strong>
                  Busca la dirección de la obra y ajusta el círculo naranja de Geocerca. Los trabajadores y encargados solo podrán fichar entrada/salida desde su móvil si se encuentran físicamente dentro de este perímetro.
                </div>
              </div>

              {/* Integrated ProjectLocationPicker */}
              <ProjectLocationPicker
                initialLat={lat}
                initialLng={lng}
                radiusMeters={radius}
                initialAddress={address}
                isFullScreen={isMapExpanded}
                onToggleFullScreen={() => setIsMapExpanded(!isMapExpanded)}
                onRadiusChange={(newR) => setRadius(newR)}
                onLocationChange={(newLat, newLng, newAddr) => {
                  setLat(newLat);
                  setLng(newLng);
                  setAddress(newAddr);
                }}
              />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás: Datos Básicos</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="px-6 py-3 rounded-xl bg-[#FF6600] hover:bg-[#EA580C] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-950/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Siguiente: Revisión y Confirmación</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY & CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden border border-slate-200 shrink-0 relative">
                    <img
                      src={coverImage}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow">
                      Activo
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">
                        {projectType}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Cliente: {client}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      {name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <MapPin className="w-4 h-4 text-[#FF6600] shrink-0" />
                      <span className="truncate">{address}</span>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <div className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-900">
                        Presupuesto: <span className="text-[#FF6600]">{initialBudget.toLocaleString('es-ES')} €</span>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-900">
                        Geocerca: <span className="text-slate-700">{radius} m</span>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-900">
                        Horas Mano de Obra: <span className="text-slate-700">{plannedHours.toLocaleString('es-ES')} H</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold">Fichaje Georreferenciado</strong>
                    <span className="text-[11px] text-slate-500">Operarios validados a &lt; {radius}m por GPS</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold">Control Presupuestario</strong>
                    <span className="text-[11px] text-slate-500">Seguimiento automático con albaranes</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Modificar Ubicación</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmAndCreate}
                  className="px-8 py-3.5 rounded-xl bg-[#FF6600] hover:bg-[#EA580C] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-orange-950/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Activando Obra...' : 'Confirmar y Lanzar Proyecto 🚀'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CELEBRATORY SUCCESS STATE */}
          {step === 4 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 px-4 text-center max-w-lg mx-auto"
            >
              {/* Animated Celebration Badge */}
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75 duration-1000" />
                <div className="relative w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              <span className="text-[11px] font-black uppercase tracking-widest text-[#FF6600]">
                ¡Obra Registrada con Éxito!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 mb-3">
                {name}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
                El centro de trabajo ha sido inicializado con su geocerca de <strong>{radius} metros</strong> y un presupuesto de <strong>{initialBudget.toLocaleString('es-ES')} €</strong>. Ahora puedes incorporar a tus encargados y subcontratas autorizadas.
              </p>

              {/* Action Buttons as requested */}
              <div className="space-y-3">
                {/* Requirement 3: Botón rápido "Ir a invitar equipo" */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToTeam) {
                      onNavigateToTeam();
                    }
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-[#FF6600] hover:bg-[#EA580C] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-orange-950/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Ir a invitar equipo</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black text-slate-700 uppercase tracking-wider transition-all cursor-pointer"
                >
                  Ver Obras en el Directorio
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
