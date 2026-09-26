import React, { useState } from 'react';
import { 
  Euro, 
  ArrowUpRight, 
  Receipt, 
  CreditCard, 
  Building2, 
  Download, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Wallet,
  Activity,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Plus,
  X,
  Sparkles,
  Zap,
  Check,
  RefreshCw,
  Landmark,
  Layers,
  Calendar
} from 'lucide-react';
import { AppState, SubscriptionPlanId, SubscriptionInvoice } from '../types';
import { exportToCSV } from '../utils/export';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';
import { obraStore } from '../services/store';
import { PaymentGatewayModal } from '../components/billing/PaymentGatewayModal';

interface BillingViewProps {
  state: AppState;
}

interface CertItem {
  id: string;
  date: string;
  amount: string;
  numericAmount: number;
  status: 'Confirmed' | 'Pending' | 'Error';
  concept: string;
  projectName: string;
}

export const BillingView: React.FC<BillingViewProps> = ({ state }) => {
  const activeCompany = state.companies.find(c => c.id === state.currentUser?.companyId);
  const currentSub = state.subscription || {
    planId: 'promax',
    billingInterval: 'annual',
    status: 'ACTIVE',
    currentPeriodEnd: '2027-09-15',
    cancelAtPeriodEnd: false,
    paymentMethod: {
      type: 'CARD',
      brand: 'Visa',
      last4: '4242',
      holderName: 'Construcciones Norte S.L.',
      expiryDate: '12/28'
    },
    invoices: []
  };

  const [activeTab, setActiveTab] = useState<'subscription' | 'invoices' | 'certifications'>('subscription');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanToCheckout, setSelectedPlanToCheckout] = useState<SubscriptionPlanId | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Construction certification state
  const [certifications, setCertifications] = useState<CertItem[]>([
    { id: 'CERT-2026-001', date: '2026-09-15', amount: '12,450.00 €', numericAmount: 12450, status: 'Confirmed', concept: 'Certificación Nº 3 - Encofrado y Ferrallado Estación Gran Vía', projectName: 'Ampliación Metro Línea 5' },
    { id: 'CERT-2026-002', date: '2026-09-01', amount: '4,850.00 €', numericAmount: 4850, status: 'Confirmed', concept: 'Certificación Nº 2 - Suministro de Maquinaria de Sondeo y Operario', projectName: 'Ampliación Metro Línea 5' },
    { id: 'CERT-2026-003', date: '2026-08-15', amount: '8,900.00 €', numericAmount: 8900, status: 'Pending', concept: 'Certificación Nº 1 - Vaciado y Muros Pantalla Sótano -2', projectName: 'Torre Residencial Skyline' }
  ]);

  const [isNewCertModalOpen, setIsNewCertModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [concept, setConcept] = useState('');
  const [certAmount, setCertAmount] = useState('');
  const [projectId, setProjectId] = useState(state.projects[0]?.id || '');

  const plans = [
    {
      id: 'starter' as SubscriptionPlanId,
      name: 'CRM Starter',
      tagline: 'Ideal para pequeñas subcontratas y autónomos de obra.',
      monthlyPrice: 49,
      annualPrice: 470,
      features: [
        'Hasta 3 obras activas simultáneas',
        'Gestión de hasta 10 operarios móviles',
        'Albaranes digitales básicos',
        'Fichaje GPS con geolocalización',
        'Exportación de partes en PDF',
        'Soporte por email 48h'
      ],
      popular: false,
      cta: 'Elegir Starter'
    },
    {
      id: 'promax' as SubscriptionPlanId,
      name: 'CRM Pro Max Integrable',
      tagline: 'El estándar de oro para constructoras y promotoras exigentes.',
      monthlyPrice: 149,
      annualPrice: 1430,
      features: [
        'Obras y proyectos ilimitados',
        'CRM Pro Max: Pipeline de licitaciones y clientes',
        'Conexión nativa ERP: SAP, Dynamics 365, Sage, Holded',
        'Certificaciones inmutables oficiales Ley 32/2006',
        'API REST y Webhooks ilimitados en tiempo real',
        'Portal interactivo para el Cliente / Promotor',
        'Escáner OCR de albaranes de proveedores',
        'Soporte prioritario 24/7 con gestor de cuenta'
      ],
      popular: true,
      cta: 'Mejorar a Pro Max'
    },
    {
      id: 'enterprise' as SubscriptionPlanId,
      name: 'Enterprise Construction Suite',
      tagline: 'Solución corporativa para grandes constructoras e infraestructuras.',
      monthlyPrice: 399,
      annualPrice: 3830,
      features: [
        'Multi-empresa y gestión de UTEs centralizada',
        'Base de datos dedicada con auditoría forense',
        'SLA garantizado del 99.9% de disponibilidad',
        'Conectores a medida para ERPs propios y AS400',
        'Asesoría técnica y legal ante inspecciones de trabajo',
        'Personalización de marca blanca completa',
        'Single Sign-On (SSO) SAML / Okta / Azure AD'
      ],
      popular: false,
      cta: 'Elegir Enterprise'
    }
  ];

  const handleOpenCheckout = (planId: SubscriptionPlanId) => {
    setSelectedPlanToCheckout(planId);
    setIsCheckoutOpen(true);
  };

  const handleToggleCancelSubscription = () => {
    if (currentSub.cancelAtPeriodEnd) {
      obraStore.resumeSubscription();
      toast.success('Renovación automática reactivada.');
    } else {
      obraStore.cancelSubscription();
      toast('Suscripción programada para cancelarse al final del periodo actual.', {
        icon: '⚠️'
      });
    }
  };

  const handleDownloadSubscriptionInvoicePDF = (inv: SubscriptionInvoice) => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('OBRASERVICE PRO', 20, 22);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(234, 88, 12);
      doc.text('FACTURA FISCAL OFICIAL REGLAMENTARIA', 20, 32);

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('EMISOR: ObraService Technologies España S.L. (NIF B-89912044)', 20, 55);
      doc.setFont('helvetica', 'normal');
      doc.text('Calle Serrano 45, Planta 4ª, 28001 Madrid', 20, 62);

      doc.setFont('helvetica', 'bold');
      doc.text(`RECEPTOR: ${activeCompany?.name || 'Construcciones Norte S.L.'}`, 120, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(`CIF/NIF: ${activeCompany?.taxId || 'B-87654321'}`, 120, 62);
      doc.text(`${activeCompany?.address || 'Paseo de la Castellana 140, Madrid'}`, 120, 69);

      doc.setDrawColor(226, 232, 240);
      doc.line(20, 80, 190, 80);

      doc.setFont('helvetica', 'bold');
      doc.text(`Nº Factura: ${inv.id}`, 20, 92);
      doc.text(`Fecha: ${inv.date}`, 80, 92);
      doc.text(`Estado: COBRADA`, 150, 92);

      doc.line(20, 100, 190, 100);

      doc.text('Concepto Facturado:', 20, 112);
      doc.setFont('helvetica', 'normal');
      doc.text(inv.planName, 20, 120);

      doc.setFont('helvetica', 'bold');
      doc.text('Base Imponible:', 120, 140);
      doc.setFont('helvetica', 'normal');
      doc.text(`${inv.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 165, 140);

      doc.setFont('helvetica', 'bold');
      doc.text('IVA Soportado (21%):', 120, 148);
      doc.setFont('helvetica', 'normal');
      doc.text(`${inv.taxAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 165, 148);

      doc.setDrawColor(234, 88, 12);
      doc.line(120, 153, 190, 153);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', 120, 162);
      doc.text(`${(inv.amount + inv.taxAmount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 160, 162);

      doc.save(`Factura_${inv.id}.pdf`);
      toast.success(`Factura ${inv.id} descargada`);
    } catch (e) {
      toast.error('Error al generar PDF de la factura');
    }
  };

  const handleDownloadCertificationPDF = (cert: CertItem) => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('CERTIFICACIÓN OFICIAL DE OBRA', 20, 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Nº Documento: ${cert.id}`, 20, 35);
      doc.text(`Fecha: ${cert.date}`, 20, 42);
      doc.text(`Proyecto: ${cert.projectName}`, 20, 49);
      doc.text(`Empresa Emisora: ${activeCompany?.name || 'ObraService Constructora S.L.'}`, 20, 56);
      doc.text(`CIF/NIF: ${activeCompany?.taxId || 'B-88392102'}`, 20, 63);

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 70, 190, 70);

      doc.setFont('helvetica', 'bold');
      doc.text('Concepto de Ejecución:', 20, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(cert.concept, 20, 88);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Base Imponible: ${cert.amount}`, 20, 105);
      doc.text(`IVA (21%): ${(cert.numericAmount * 0.21).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 20, 113);
      doc.text(`Total Certificado: ${(cert.numericAmount * 1.21).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 20, 122);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Documento inmutable generado con firma digital por ObraService. Conforme a la Ley 11/2021 antifraude.', 20, 140);

      doc.save(`Certificacion_${cert.id}.pdf`);
      toast.success(`Certificación ${cert.id} descargada en PDF.`);
    } catch (e) {
      toast.error('Error al generar el PDF de certificación.');
    }
  };

  const handleCreateCertification = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(certAmount.replace(/[^0-9.]/g, ''));
    if (!concept || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Indica un concepto válido y un importe numérico mayor que cero.');
      return;
    }

    const proj = state.projects.find(p => p.id === projectId);
    const newCert: CertItem = {
      id: `CERT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      amount: `${numAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
      numericAmount: numAmount,
      status: 'Pending',
      concept: concept.trim(),
      projectName: proj?.name || 'Obra General'
    };

    setCertifications([newCert, ...certifications]);
    setIsNewCertModalOpen(false);
    setConcept('');
    setCertAmount('');
    toast.success('Nueva certificación de obra emitida correctamente.');
  };

  const currentPlanObj = plans.find(p => p.id === currentSub.planId) || plans[1];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-body">
      
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
              Suscripción & Facturación
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
              CRM Pro Max
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted">
            Gestiona la suscripción de tu empresa, pasarela de pago, facturas fiscales y certificaciones de obra.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-brand-surface border border-brand-border rounded-xl">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'subscription' 
                ? 'bg-brand-accent text-white shadow-md' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Planes & Pagos
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'invoices' 
                ? 'bg-brand-accent text-white shadow-md' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Facturas Fiscales
            {currentSub.invoices?.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">
                {currentSub.invoices.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('certifications')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'certifications' 
                ? 'bg-brand-accent text-white shadow-md' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Certificaciones Obra
          </button>
        </div>
      </div>

      {/* TAB 1: SUBSCRIPTION & PAYMENT PLANS */}
      {activeTab === 'subscription' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Active Plan Banner Card */}
          <div className="card p-6 sm:p-8 bg-gradient-to-br from-brand-surface via-brand-surface to-brand-accent/10 border-brand-accent/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Suscripción Activa
                  </span>
                  <span className="text-xs text-brand-muted font-mono">
                    Renovación: {currentSub.currentPeriodEnd}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                  {currentPlanObj.name}
                </h2>
                <p className="text-sm text-brand-muted max-w-xl">
                  {currentPlanObj.tagline} Facturación {currentSub.billingInterval === 'annual' ? 'Anual (-20% de descuento aplicado)' : 'Mensual'}.
                </p>

                {/* Payment method summary */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-brand-muted">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-4 h-4 text-brand-accent" />
                    <span>Método de pago: <strong className="text-white">{currentSub.paymentMethod?.type === 'CARD' ? `Tarjeta •••• ${currentSub.paymentMethod?.last4 || '4242'}` : currentSub.paymentMethod?.type === 'SEPA' ? 'Adeudo SEPA B2B' : 'Transferencia'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Building2 className="w-4 h-4 text-brand-muted" />
                    <span>Facturado a: <strong className="text-white">{activeCompany?.name || 'Construcciones Norte S.L.'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  onClick={() => handleOpenCheckout('promax')}
                  className="px-5 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/80 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-accent/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Cambiar / Renovar Plan
                </button>
                <button
                  onClick={handleToggleCancelSubscription}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-brand-muted hover:text-white text-xs font-bold uppercase border border-white/10 transition-colors text-center"
                >
                  {currentSub.cancelAtPeriodEnd ? 'Reactivar Renovación' : 'Cancelar Renovación'}
                </button>
              </div>
            </div>
          </div>

          {/* Billing Switcher (Monthly vs Annual) */}
          <div className="flex flex-col items-center justify-center space-y-3 pt-4">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">
                Planes Disponibles de ObraService CRM Pro Max
              </h3>
              <p className="text-xs text-brand-muted">
                Escoge el nivel de integración que mejor se adapte a tu operativa de obra.
              </p>
            </div>

            <div className="flex items-center gap-3 p-1.5 bg-brand-surface border border-brand-border rounded-2xl">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  billingInterval === 'monthly'
                    ? 'bg-brand-accent text-white shadow-md'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                Facturación Mensual
              </button>
              <button
                onClick={() => setBillingInterval('annual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                  billingInterval === 'annual'
                    ? 'bg-brand-accent text-white shadow-md'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                <span>Facturación Anual</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white uppercase">
                  -20% Ahorro
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isCurrent = currentSub.planId === p.id;
              const price = billingInterval === 'annual' ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
              
              return (
                <div
                  key={p.id}
                  className={`card p-6 sm:p-7 flex flex-col justify-between relative transition-all duration-300 ${
                    p.popular 
                      ? 'border-brand-accent ring-2 ring-brand-accent/20 bg-gradient-to-b from-brand-surface to-brand-accent/5' 
                      : 'border-brand-border hover:border-white/20'
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-accent text-white font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Más Recomendado
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-display font-black text-white uppercase tracking-tight">
                        {p.name}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Tu Plan Actual
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-brand-muted min-h-[32px]">
                      {p.tagline}
                    </p>

                    <div className="pt-2 pb-4 border-b border-brand-border">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-black text-white">
                          {price} €
                        </span>
                        <span className="text-xs text-brand-muted font-medium">
                          / mes
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-muted mt-1 font-mono">
                        {billingInterval === 'annual' ? `${p.annualPrice} € facturados anualmente (IVA no incl.)` : 'Facturación mensual sin compromiso'}
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2.5 text-xs text-brand-muted">
                      {p.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                          <span className="text-slate-200">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-brand-border">
                    <button
                      onClick={() => handleOpenCheckout(p.id)}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default'
                          : p.popular
                            ? 'bg-brand-accent hover:bg-brand-accent/80 text-white shadow-xl shadow-brand-accent/20'
                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Plan Activo
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" /> {p.cta}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee Badges */}
          <div className="p-6 bg-brand-surface rounded-2xl border border-brand-border grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase">Cumplimiento Legal</div>
                <div className="text-[11px] text-brand-muted">Validado según Ley 32/2006 y RD 1619/2012</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase">Pasarela PSD2 Segura</div>
                <div className="text-[11px] text-brand-muted">Pagos con 3D Secure y domiciliación SEPA</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase">Factura Oficial Inmediata</div>
                <div className="text-[11px] text-brand-muted">Descarga instantánea en PDF con CIF y desglose de IVA</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL SUBSCRIPTION INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                Historial de Facturas de Suscripción ObraService
              </h3>
              <p className="text-xs text-brand-muted">
                Facturas oficiales emitidas para desgravación fiscal del IVA y justificación contable.
              </p>
            </div>
          </div>

          <div className="card overflow-hidden border-brand-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg/50 text-brand-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Nº Factura</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Concepto / Plan</th>
                    <th className="p-3.5">Base Imponible</th>
                    <th className="p-3.5">IVA (21%)</th>
                    <th className="p-3.5">Total Pagado</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-slate-300">
                  {currentSub.invoices && currentSub.invoices.length > 0 ? (
                    currentSub.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-white">{inv.id}</td>
                        <td className="p-3.5 text-brand-muted">{inv.date}</td>
                        <td className="p-3.5 font-medium text-white">{inv.planName}</td>
                        <td className="p-3.5 font-mono">{inv.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                        <td className="p-3.5 font-mono text-brand-muted">{inv.taxAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          {(inv.amount + inv.taxAmount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {inv.status === 'PAID' ? 'Cobrada' : inv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDownloadSubscriptionInvoicePDF(inv)}
                            className="px-3 py-1.5 rounded-lg bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white border border-brand-accent/20 text-[11px] font-bold transition-all inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF Factura
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-brand-muted">
                        No hay facturas emitidas todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONSTRUCTION CERTIFICATIONS (Ley 32/2006) */}
      {activeTab === 'certifications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                Certificaciones Oficiales de Ejecución de Obra
              </h3>
              <p className="text-xs text-brand-muted">
                Emisión de certificaciones mensuales vinculantes entre contratista principal y subcontratas.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLegalModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-muted hover:text-white border border-brand-border text-xs font-bold uppercase transition-colors"
              >
                Ley 32/2006
              </button>
              <button
                onClick={() => setIsNewCertModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/80 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-accent/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nueva Certificación
              </button>
            </div>
          </div>

          {/* Certifications Table */}
          <div className="card overflow-hidden border-brand-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg/50 text-brand-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Referencia</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Proyecto</th>
                    <th className="p-3.5">Concepto</th>
                    <th className="p-3.5">Importe</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Descargar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-slate-300">
                  {certifications.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-white">{c.id}</td>
                      <td className="p-3.5 text-brand-muted">{c.date}</td>
                      <td className="p-3.5 font-medium text-white">{c.projectName}</td>
                      <td className="p-3.5 text-brand-muted max-w-xs truncate">{c.concept}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">{c.amount}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          c.status === 'Confirmed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {c.status === 'Confirmed' ? 'Aprobada' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDownloadCertificationPDF(c)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-accent text-brand-muted hover:text-white border border-brand-border text-[11px] font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {selectedPlanToCheckout && (
        <PaymentGatewayModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          selectedPlanId={selectedPlanToCheckout}
          billingInterval={billingInterval}
          onSuccess={() => {
            // Stay open to view success receipt or close
          }}
        />
      )}

      {/* New Certification Modal */}
      {isNewCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md bg-brand-surface border-brand-border relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <h3 className="text-base font-display font-black text-white uppercase tracking-tight">
                Nueva Certificación de Obra
              </h3>
              <button 
                onClick={() => setIsNewCertModalOpen(false)}
                className="text-brand-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCertification} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Proyecto / Obra</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                >
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Concepto de Ejecución</label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej. Certificación Nº 4 - Hormigonado losa sótano 1"
                  required
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Importe Base (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={certAmount}
                  onChange={(e) => setCertAmount(e.target.value)}
                  placeholder="15000"
                  required
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-muted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-accent text-white font-bold uppercase tracking-wider"
                >
                  Emitir Certificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal Ley 32/2006 Modal */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-lg bg-brand-surface border-brand-border relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-accent" />
                <h3 className="text-base font-display font-black text-white uppercase tracking-tight">
                  Marco Legal: Ley 32/2006 y RD 1109/2007
                </h3>
              </div>
              <button onClick={() => setIsLegalModalOpen(false)} className="text-brand-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-xs text-brand-muted space-y-3 leading-relaxed">
              <p>
                La <strong className="text-white">Ley 32/2006 reguladora de la subcontratación en el Sector de la Construcción</strong> exige la acreditación fehaciente de la cadena de subcontratación y la inmutabilidad de los registros de trabajo.
              </p>
              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border space-y-2">
                <div className="text-white font-bold uppercase text-[11px]">Requisitos cumplidos por ObraService Pro:</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Inscripción vigente en el Registro de Empresas Acreditadas (REA).</li>
                  <li>Firma electrónica inmutable de partes diarios y certificaciones.</li>
                  <li>Trazabilidad digital antifraude conforme a la Ley 11/2021.</li>
                  <li>Control de jornada y geolocalización de operarios en obra.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsLegalModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-brand-accent text-white font-bold text-xs uppercase"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
