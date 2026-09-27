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

const BUDGET_PRESETS = [100000, 350000, 750000, 1500000, 3000000];
const HOURS_PRESETS = [5000, 12000, 25000, 50000];

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
  const [initialBudget, setInitialBudget] = useState<number | string>(350000);
  const [projectType, setProjectType] = useState('Edificación Residencial');
  const [plannedHours, setPlannedHours] = useState<number | string>(14000);
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

  const numericBudget = typeof initialBudget === 'number' ? initialBudget : (parseFloat(initialBudget) || 0);
  const numericHours = typeof plannedHours === 'number' ? plannedHours : (parseFloat(plannedHours) || 0);

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
    if (numericBudget <= 0) {
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
        plannedHours: numericHours || 12000,
        status: 'Active',
        client: client.trim(),
        initialBudget: numericBudget || 300000,
        spentBudget: 0,
        coverImage,
        projectType,
        description: `Proyecto contratado por ${client.trim()} con presupuesto inicial de ${numericBudget.toLocaleString('es-ES')} € y geocerca de ${radius}m.`
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
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 font-sans overflow-y-auto animate-in fade-in duration-200">
      <div className={`bg-slate-900 text-white rounded-3xl w-full ${isMapExpanded && step === 2 ? 'max-w-6xl h-[94vh]' : 'max-w-3xl max-h-[94vh]'} shadow-2xl border border-slate-800 flex flex-col overflow-hidden my-auto transition-all duration-300`}>
        
        {/* Top Header & Step Progress Bar */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-accent flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 shrink-0">
              {step === 4 ? '✓' : `0${step}`}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-accent">
                  Nueva Obra
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {step === 1 && 'Paso 1: Datos y Presupuesto'}
                  {step === 2 && 'Paso 2: Geocerca Satelital'}
                  {step === 3 && 'Paso 3: Confirmación'}
                  {step === 4 && '¡Proyecto Creado!'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                {step === 1 && 'Información General y Presupuesto'}
                {step === 2 && 'Perímetro Satelital y Fichaje GPS'}
                {step === 3 && 'Validación de Parámetros de Obra'}
                {step === 4 && 'Obra lista para operar'}
              </h2>
            </div>
          </div>

          {step !== 4 && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              title="Cancelar y cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Progress Track */}
        {step !== 4 && (
          <div className="w-full bg-slate-800 h-1 flex shrink-0">
            <div 
              className="bg-brand-accent h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* Wizard Body with scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: BASIC DATA */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nombre de la Obra o Proyecto <span className="text-brand-accent">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Residencial Puerta de Hierro - Fase II"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-700 bg-slate-950 text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    />
                  </div>
                </div>

                {/* Client / Promotora */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Cliente / Promotora <span className="text-brand-accent">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Ej. Metrovacesa S.A."
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-700 bg-slate-950 text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    />
                  </div>
                </div>

                {/* Typology */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Tipología de Construcción
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-brand-accent transition-all cursor-pointer [&>option]:bg-slate-950 [&>option]:text-white"
                  >
                    <option value="Edificación Residencial">Edificación Residencial</option>
                    <option value="Comercial y Oficinas">Comercial y Oficinas</option>
                    <option value="Industrial y Logística">Industrial y Logística</option>
                    <option value="Obra Civil y Vías">Obra Civil y Vías</option>
                    <option value="Rehabilitación Energética">Rehabilitación Energética</option>
                  </select>
                </div>

                {/* Initial Budget in Euros (NO RESTRICTIVE STEP!) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Presupuesto Total (€) <span className="text-brand-accent">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {numericBudget > 0 ? `${numericBudget.toLocaleString('es-ES')} €` : ''}
                    </span>
                  </div>
                  <div className="relative">
                    <Euro className="w-4 h-4 text-brand-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={1}
                      step="any"
                      value={initialBudget}
                      onChange={(e) => setInitialBudget(e.target.value)}
                      placeholder="350000"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-700 bg-slate-950 text-xs sm:text-sm font-bold text-white font-mono focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    />
                  </div>
                  {/* Quick Preset Pills */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
                    {BUDGET_PRESETS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setInitialBudget(p)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                          numericBudget === p 
                            ? 'bg-brand-accent text-white' 
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {(p / 1000).toLocaleString('es-ES')}k €
                      </button>
                    ))}
                  </div>
                </div>

                {/* Planned Hours (NO RESTRICTIVE STEP!) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Horas Mano de Obra
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {numericHours > 0 ? `${numericHours.toLocaleString('es-ES')} H` : ''}
                    </span>
                  </div>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      step="any"
                      value={plannedHours}
                      onChange={(e) => setPlannedHours(e.target.value)}
                      placeholder="14000"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-700 bg-slate-950 text-xs sm:text-sm font-bold text-white font-mono focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    />
                  </div>
                  {/* Quick Preset Pills */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
                    {HOURS_PRESETS.map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setPlannedHours(h)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                          numericHours === h 
                            ? 'bg-brand-accent text-white' 
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {(h / 1000).toLocaleString('es-ES')}k H
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Image Selection (2x2 Grid, Compact & Clean) */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Foto de Portada del Proyecto
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {COVER_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setCoverImage(preset.url)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video ${
                        coverImage === preset.url
                          ? 'border-brand-accent ring-2 ring-brand-accent/40 shadow-md scale-[1.02]'
                          : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider truncate">
                          {preset.title}
                        </span>
                      </div>
                      {coverImage === preset.url && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-accent text-white flex items-center justify-center text-[9px] font-black shadow-md">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-950/30 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continuar a Ubicación y Geocerca</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: LOCATION & GEOFENCE */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 text-xs text-amber-200">
                <Compass className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold text-white block mb-0.5">Control Satelital de Presencia:</strong>
                  Busca la dirección o selecciona una ciudad para ajustar el perímetro. Los operarios solo podrán registrar partes y fichajes si se encuentran físicamente dentro de este radio de seguridad.
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

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-950/30 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Revisar y Confirmar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY & CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-slate-800 shrink-0 relative">
                    <img
                      src={coverImage}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow">
                      Activa
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-brand-accent uppercase tracking-wider">
                        {projectType}
                      </span>
                      <span className="text-slate-700">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Cliente: {client}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase truncate">
                      {name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                      <span className="truncate">{address}</span>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-white">
                        Presupuesto: <span className="text-brand-accent">{numericBudget.toLocaleString('es-ES')} €</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-white">
                        Geocerca: <span className="text-slate-300">{radius} m</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-white">
                        Estimación: <span className="text-slate-300">{numericHours.toLocaleString('es-ES')} H</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold text-xs">Fichaje Georreferenciado</strong>
                    <span className="text-[10px] text-slate-400">Validación GPS a &lt; {radius}m de la obra</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold text-xs">Control de Albaranes</strong>
                    <span className="text-[10px] text-slate-400">Seguimiento de costes y desvíos</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Modificar Ubicación</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmAndCreate}
                  className="px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-orange-950/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando Obra...' : 'Confirmar y Lanzar Obra 🚀'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS STATE */}
          {step === 4 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6 px-2 text-center max-w-lg mx-auto space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-accent">
                  ¡Obra Inicializada con Éxito!
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                  {name}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  El centro de trabajo ya está activo con geocerca de <strong>{radius} metros</strong> y presupuesto de <strong>{numericBudget.toLocaleString('es-ES')} €</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToTeam) {
                      onNavigateToTeam();
                    }
                  }}
                  className="w-full py-3.5 px-5 rounded-xl bg-brand-accent hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-950/25 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Asignar Equipo y Subcontratas</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-all cursor-pointer"
                >
                  Ver en el Listado de Obras
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
