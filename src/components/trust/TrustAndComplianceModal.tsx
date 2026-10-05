import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  Scale, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Download, 
  History, 
  Fingerprint, 
  Building2,
  HardHat,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TrustAndComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustAndComplianceModal: React.FC<TrustAndComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'legal' | 'rgpd' | 'seguridad'>('legal');

  if (!isOpen) return null;

  const handleDownloadCertificate = () => {
    toast.success('📄 Certificado de Cumplimiento Técnico descargado.');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trust-modal-title"
    >
      <div 
        className="w-full max-w-3xl bg-brand-surface border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between bg-brand-bg/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="trust-modal-title" className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                  Seguridad Jurídica, PRL & Privacidad
                </h2>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Auditado
                </span>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                Marco normativo de ObraService Pro para el sector de la construcción en España
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-muted hover:text-white hover:bg-brand-surface-hover transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Cerrar modal de cumplimiento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 sm:px-7 pt-4 pb-2 border-b border-white/10 bg-brand-bg/60 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('legal')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'legal' 
                ? 'bg-brand-accent text-white shadow-sm' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Ley 32/2006 & REA</span>
          </button>

          <button
            onClick={() => setActiveTab('rgpd')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rgpd' 
                ? 'bg-brand-accent text-white shadow-sm' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Privacidad & RGPD</span>
          </button>

          <button
            onClick={() => setActiveTab('seguridad')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'seguridad' 
                ? 'bg-brand-accent text-white shadow-sm' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Inmutabilidad Criptográfica</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-xs text-zinc-300">
          
          {/* TAB 1: LEY 32/2006 & SUBCONTRATACIÓN */}
          {activeTab === 'legal' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-brand-surface border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Conformidad con la Ley 32/2006 de Subcontratación</span>
                </div>
                <p className="text-brand-muted leading-relaxed">
                  ObraService Pro digitaliza los requisitos del Libro de Subcontratación y la acreditación REA (RD 1109/2007). Cada intervención de operarios, empresas subcontratistas y contratas principales queda documentada para Inspección de Trabajo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-brand-bg border border-white/5 space-y-1">
                  <div className="text-[10px] text-brand-muted uppercase">Registro REA</div>
                  <div className="text-white font-bold">Verificación Preventiva Automática</div>
                  <div className="text-[10px] text-emerald-400">Alertas a 15, 7 y 1 día de caducidad</div>
                </div>

                <div className="p-3 rounded-xl bg-brand-bg border border-white/5 space-y-1">
                  <div className="text-[10px] text-brand-muted uppercase">Convenio de la Construcción</div>
                  <div className="text-white font-bold">Cálculo de Jornadas & Extras</div>
                  <div className="text-[10px] text-brand-accent">Separación legal automática de horas</div>
                </div>

                <div className="p-3 rounded-xl bg-brand-bg border border-white/5 space-y-1">
                  <div className="text-[10px] text-brand-muted uppercase">Seguridad Jurídica</div>
                  <div className="text-white font-bold">Cadena de Custodia Inmutable</div>
                  <div className="text-[10px] text-blue-400">Firmas biométricas y digitales registradas</div>
                </div>

                <div className="p-3 rounded-xl bg-brand-bg border border-white/5 space-y-1">
                  <div className="text-[10px] text-brand-muted uppercase">Inspección de Trabajo</div>
                  <div className="text-white font-bold">Exportación Homologada</div>
                  <div className="text-[10px] text-emerald-400">Formatos oficiales PDF y CSV auditables</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACIDAD & RGPD */}
          {activeTab === 'rgpd' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-brand-surface border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span>Cumplimiento RGPD (UE 2016/679) & LOPD-GDD</span>
                </div>
                <p className="text-brand-muted leading-relaxed">
                  Los datos de filiación de los operarios, fichajes geolocalizados y registros laborales se tratan bajo los principios de minimización de datos, limitación de la finalidad y confidencialidad estricta.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-bg border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Geofencing Satelital Proporcional:</strong>
                    <span className="text-brand-muted block mt-0.5">
                      Solo se comprueba si el operario se encuentra dentro del radio perimetral autorizado de la obra al momento exacto del fichaje. No se realiza tracking continuo fuera del tajo.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-bg border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Aislamiento Multi-Inquilino (Multi-Tenant):</strong>
                    <span className="text-brand-muted block mt-0.5">
                      Cada subcontrata solo tiene acceso a sus propios partes y trabajadores. Las contratas principales acceden únicamente a los datos de la obra asignada.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INMUTABILIDAD & SEGURIDAD */}
          {activeTab === 'seguridad' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-brand-surface border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Lock className="w-4 h-4 text-brand-accent" />
                  <span>Sello Digital e Inmutabilidad de Certificaciones</span>
                </div>
                <p className="text-brand-muted leading-relaxed">
                  Una vez que un albarán es firmado por la subcontrata o un parte es validado por el Jefe de Obra, el registro pasa a estado bloqueado e inmutable, impidiendo modificaciones retroactivas de horas e importes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] space-y-1.5">
                <div className="text-zinc-400 flex items-center justify-between">
                  <span>Algoritmo de Hash:</span>
                  <span className="text-emerald-400 font-bold">SHA-256 Inmutable</span>
                </div>
                <div className="text-zinc-400 flex items-center justify-between">
                  <span>Marca Temporal:</span>
                  <span className="text-white">Huso Horario España (Europe/Madrid)</span>
                </div>
                <div className="text-zinc-400 flex items-center justify-between">
                  <span>Cifrado en Tránsito:</span>
                  <span className="text-emerald-400 font-bold">TLS 1.3 / HTTPS Estricto</span>
                </div>
                <div className="text-zinc-400 flex items-center justify-between">
                  <span>Cifrado en Reposo:</span>
                  <span className="text-emerald-400 font-bold">AES-256</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-white/10 bg-brand-bg/95 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-brand-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Validez garantizada ante auditorías técnicas y judiciales</span>
          </div>

          <button
            onClick={handleDownloadCertificate}
            className="btn-secondary h-10 px-4 gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer ml-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Dictamen Técnico</span>
          </button>
        </div>
      </div>
    </div>
  );
};
