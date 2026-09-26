import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Building2, 
  X, 
  ArrowRight, 
  Sparkles, 
  Download,
  AlertCircle,
  FileText,
  BadgeCheck,
  RefreshCw,
  Landmark
} from 'lucide-react';
import { SubscriptionPlanId, PaymentMethodInfo, SubscriptionInvoice } from '../../types';
import { obraStore } from '../../services/store';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId: SubscriptionPlanId;
  billingInterval: 'monthly' | 'annual';
  onSuccess?: (invoice: SubscriptionInvoice) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  selectedPlanId,
  billingInterval,
  onSuccess
}) => {
  const [paymentType, setPaymentType] = useState<'CARD' | 'SEPA' | 'TRANSFER'>('CARD');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('CONSTRUCCIONES NORTE S.L.');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // SEPA form state
  const [iban, setIban] = useState('ES91 2100 0418 4502 0005 1332');
  const [bic, setBic] = useState('CAIXESBBXXX');
  const [sepaAccepted, setSepaAccepted] = useState(true);

  // Fiscal info
  const [companyName, setCompanyName] = useState('Construcciones Norte S.L.');
  const [taxId, setTaxId] = useState('B-87654321');
  const [address, setAddress] = useState('Paseo de la Castellana 140');
  const [city, setCity] = useState('Madrid');
  const [postalCode, setPostalCode] = useState('28046');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [completedInvoice, setCompletedInvoice] = useState<SubscriptionInvoice | null>(null);

  if (!isOpen) return null;

  const planPricing: Record<SubscriptionPlanId, { name: string; monthly: number; annual: number; tagline: string }> = {
    starter: { name: 'CRM Starter', monthly: 49, annual: 470, tagline: 'Ideal para pequeñas subcontratas y autónomos' },
    promax: { name: 'CRM Pro Max Integrable', monthly: 149, annual: 1430, tagline: 'Suite completa para constructoras con ERP' },
    enterprise: { name: 'Enterprise Construction Suite', monthly: 399, annual: 3830, tagline: 'Multi-empresa, SLA 99.9% y soporte legal dedicado' }
  };

  const plan = planPricing[selectedPlanId] || planPricing.promax;
  const baseAmount = billingInterval === 'annual' ? plan.annual : plan.monthly;
  const vatAmount = +(baseAmount * 0.21).toFixed(2);
  const totalAmount = +(baseAmount + vatAmount).toFixed(2);

  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 16);
    const groups = clean.match(/.{1,4}/g);
    return groups ? groups.join(' ') : clean;
  };

  const formatIban = (val: string) => {
    const clean = val.replace(/\s+/g, '').toUpperCase().substring(0, 24);
    const groups = clean.match(/.{1,4}/g);
    return groups ? groups.join(' ') : clean;
  };

  const handleDownloadInvoicePdf = (inv: SubscriptionInvoice) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('OBRASERVICE PRO', 20, 22);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(234, 88, 12); // brand orange
      doc.text('FACTURA REGLAMENTARIA DE SUSCRIPCIÓN', 20, 32);

      // Fiscal details
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('DATOS DEL EMISOR:', 20, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('ObraService Technologies España S.L.', 20, 62);
      doc.text('NIF: B-89912044', 20, 68);
      doc.text('Calle Serrano 45, Planta 4ª, 28001 Madrid', 20, 74);
      doc.text('Inscrita en el R.M. de Madrid, Tomo 34.200, Folio 112', 20, 80);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CLIENTE / RECEPTOR:', 120, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(companyName || 'Construcciones Norte S.L.', 120, 62);
      doc.text(`NIF/CIF: ${taxId || 'B-87654321'}`, 120, 68);
      doc.text(address || 'Paseo de la Castellana 140', 120, 74);
      doc.text(`${postalCode || '28046'}, ${city || 'Madrid'}`, 120, 80);

      // Invoice info block
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 90, 190, 90);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Nº Factura: ${inv.id}`, 20, 102);
      doc.text(`Fecha de Emisión: ${inv.date}`, 80, 102);
      doc.text(`Estado: COBRADA`, 150, 102);

      doc.line(20, 110, 190, 110);

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(20, 115, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Concepto / Plan', 25, 121);
      doc.text('Periodo', 110, 121);
      doc.text('Importe Base', 160, 121);

      // Table Content
      doc.setFont('helvetica', 'normal');
      doc.text(inv.planName, 25, 133);
      doc.text(inv.billingInterval === 'annual' ? '12 Meses' : '1 Mes', 110, 133);
      doc.text(`${inv.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 160, 133);

      doc.line(20, 142, 190, 142);

      // Totals
      doc.setFont('helvetica', 'bold');
      doc.text('Base Imponible:', 120, 155);
      doc.setFont('helvetica', 'normal');
      doc.text(`${inv.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 165, 155);

      doc.setFont('helvetica', 'bold');
      doc.text('IVA Soportado (21%):', 120, 163);
      doc.setFont('helvetica', 'normal');
      doc.text(`${inv.taxAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 165, 163);

      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.5);
      doc.line(120, 168, 190, 168);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('TOTAL FACTURA:', 120, 176);
      doc.text(`${(inv.amount + inv.taxAmount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 160, 176);

      // Legal footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Factura digital generada con firma digital conforme al RD 1619/2012 de facturación y Ley 11/2021 antifraude.', 20, 205);
      doc.text('Pago tramitado con autenticación reforzada PSD2. Gracias por confiar en ObraService Pro.', 20, 212);

      doc.save(`Factura_${inv.id}.pdf`);
      toast.success('Factura descargada en PDF');
    } catch (e) {
      toast.error('Error al generar PDF de la factura');
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !taxId.trim()) {
      toast.error('Indica la Razón Social y el CIF de la empresa');
      return;
    }

    if (paymentType === 'SEPA' && !sepaAccepted) {
      toast.error('Debes aceptar expresamente la orden de domiciliación SEPA B2B');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Validando credenciales fiscales y antifraude...');

    await new Promise(r => setTimeout(r, 900));
    setProcessingStep('Conectando con pasarela bancaria segura (3D Secure PSD2)...');

    await new Promise(r => setTimeout(r, 1100));
    setProcessingStep('Autorizando transacción con el banco emisor...');

    await new Promise(r => setTimeout(r, 800));

    const paymentMethod: PaymentMethodInfo = {
      type: paymentType,
      brand: paymentType === 'CARD' ? 'Visa' : undefined,
      last4: paymentType === 'CARD' ? (cardNumber.replace(/\D/g, '').slice(-4) || '4242') : undefined,
      holderName: cardHolder || companyName,
      ibanMasked: paymentType === 'SEPA' ? `ES•• •••• •••• •••• ${iban.slice(-4)}` : undefined,
      expiryDate: cardExpiry
    };

    const res = obraStore.processSubscriptionPayment({
      planId: selectedPlanId,
      billingInterval,
      paymentMethod,
      fiscalData: {
        companyName,
        taxId,
        address,
        city,
        postalCode
      }
    });

    setIsProcessing(false);
    setCompletedInvoice(res.invoice);
    toast.success(`🎉 ¡Pago procesado con éxito! Plan ${plan.name} activado.`);

    if (onSuccess) {
      onSuccess(res.invoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto font-body">
      <div className="relative w-full max-w-3xl bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between bg-gradient-to-r from-brand-surface to-brand-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-black text-white uppercase tracking-tight">
                  Pasarela de Pago Segura
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> SSL 256-bit
                </span>
              </div>
              <p className="text-xs text-brand-muted">
                Contratación directa de {plan.name} ({billingInterval === 'annual' ? 'Facturación Anual -20%' : 'Facturación Mensual'})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedInvoice ? (
          /* Confirmation State */
          <div className="p-6 sm:p-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                ¡Suscripción Activada con Éxito!
              </h3>
              <p className="text-sm text-brand-muted">
                Tu empresa <strong className="text-white">{companyName}</strong> ahora disfruta de todas las funciones de <strong className="text-brand-accent">{plan.name}</strong> sin límites.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="w-full max-w-md bg-brand-bg/80 border border-brand-border rounded-xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Nº Factura Oficial:</span>
                <span className="font-mono font-bold text-white">{completedInvoice.id}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Fecha:</span>
                <span className="text-white">{completedInvoice.date}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Plan Contratado:</span>
                <span className="font-bold text-brand-accent">{completedInvoice.planName}</span>
              </div>
              <div className="flex justify-between text-brand-muted pt-2 border-t border-brand-border">
                <span>Base Imponible:</span>
                <span className="text-white">{completedInvoice.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>IVA (21%):</span>
                <span className="text-white">{completedInvoice.taxAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-brand-border">
                <span>Total Pagado:</span>
                <span className="text-emerald-400 font-mono text-base">
                  {(completedInvoice.amount + completedInvoice.taxAmount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
              <button
                type="button"
                onClick={() => handleDownloadInvoicePdf(completedInvoice)}
                className="w-full h-11 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-accent/20"
              >
                <Download className="w-4 h-4" /> Descargar Factura (PDF)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors"
              >
                Volver al Panel
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleProcessPayment} className="p-5 sm:p-6 space-y-6">
            
            {/* Step 1: Payment Method Tabs */}
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2.5">
                1. Selecciona Método de Pago
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'CARD', label: 'Tarjeta Bancaria', icon: CreditCard, subtitle: 'Visa, Mastercard, Amex' },
                  { id: 'SEPA', label: 'Adeudo Directo SEPA', icon: Landmark, subtitle: 'Domiciliación B2B' },
                  { id: 'TRANSFER', label: 'Transferencia Inmediata', icon: Building2, subtitle: 'Conexión bancaria' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentType(item.id as any)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentType === item.id 
                        ? 'bg-brand-accent/10 border-brand-accent text-white shadow-lg shadow-brand-accent/10' 
                        : 'bg-brand-bg/50 border-brand-border text-brand-muted hover:border-white/20'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 mt-0.5 ${paymentType === item.id ? 'text-brand-accent' : 'text-brand-muted'}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[10px] text-brand-muted">{item.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Inputs */}
            {paymentType === 'CARD' && (
              <div className="bg-brand-bg/60 p-4 sm:p-5 rounded-xl border border-brand-border space-y-4">
                <div className="flex items-center justify-between text-xs text-brand-muted pb-2 border-b border-brand-border">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <CreditCard className="w-4 h-4 text-brand-accent" /> Datos de la Tarjeta Corporativa
                  </span>
                  <span className="text-[10px]">Cifrado de grado bancario</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    placeholder="4000 1234 5678 9010"
                    required
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white tracking-wider focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Titular de la Tarjeta</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="CONSTRUCTORA S.L."
                      required
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Caducidad</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/AA"
                      maxLength={5}
                      required
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white text-center focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Código de Seguridad (CVC / CVV)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.substring(0, 4))}
                      maxLength={4}
                      placeholder="•••"
                      required
                      className="w-24 bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white text-center focus:outline-none focus:border-brand-accent"
                    />
                    <span className="text-[10px] text-brand-muted">3 o 4 dígitos al dorso de la tarjeta</span>
                  </div>
                </div>
              </div>
            )}

            {paymentType === 'SEPA' && (
              <div className="bg-brand-bg/60 p-4 sm:p-5 rounded-xl border border-brand-border space-y-4">
                <div className="flex items-center justify-between text-xs text-brand-muted pb-2 border-b border-brand-border">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <Landmark className="w-4 h-4 text-brand-accent" /> Domiciliación Bancaria SEPA B2B
                  </span>
                  <span className="text-[10px] text-emerald-400">Normativa Europea ISO 20022</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Código de Cuenta IBAN</label>
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(formatIban(e.target.value))}
                      placeholder="ES91 2100 0418 4502 0005 1332"
                      required
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white tracking-wider focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Código BIC / SWIFT</label>
                    <input
                      type="text"
                      value={bic}
                      onChange={(e) => setBic(e.target.value.toUpperCase())}
                      placeholder="CAIXESBBXXX"
                      required
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white text-center focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-brand-muted cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={sepaAccepted}
                    onChange={(e) => setSepaAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span>
                    Autorizo expresamente a ObraService Technologies España S.L. a emitir adeudos por domiciliación bancaria B2B en la cuenta indicada para el pago recurrente del plan seleccionado.
                  </span>
                </label>
              </div>
            )}

            {paymentType === 'TRANSFER' && (
              <div className="bg-brand-bg/60 p-4 sm:p-5 rounded-xl border border-brand-border space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Building2 className="w-4 h-4 text-brand-accent" />
                  Transferencia Inmediata Bancaria
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Realiza la transferencia desde la banca electrónica de tu empresa con los siguientes datos para la activación instantánea:
                </p>
                <div className="bg-brand-surface p-3 rounded-lg border border-brand-border font-mono text-xs space-y-1 text-brand-muted">
                  <div>Beneficiario: <strong className="text-white">ObraService Technologies España S.L.</strong></div>
                  <div>IBAN: <strong className="text-brand-accent">ES76 0049 1500 0512 3456 7890</strong></div>
                  <div>Banco: <strong className="text-white">Banco Santander S.A.</strong></div>
                  <div>Concepto: <strong className="text-amber-400 font-bold">OBS-PRO-{taxId.replace(/[^A-Z0-9]/g, '')}</strong></div>
                </div>
              </div>
            )}

            {/* Step 2: Fiscal Data */}
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2.5">
                2. Datos de Facturación Oficial
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Razón Social</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">CIF / NIF</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent uppercase"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Dirección Fiscal</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Breakdown & Submit */}
            <div className="pt-3 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left w-full sm:w-auto">
                <div className="text-xs text-brand-muted">
                  Subtotal: <strong>{baseAmount.toLocaleString('es-ES')} €</strong> + IVA 21%: <strong>{vatAmount.toLocaleString('es-ES')} €</strong>
                </div>
                <div className="text-xl sm:text-2xl font-display font-black text-white">
                  Total: <span className="text-emerald-400 font-mono">{totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-white hover:bg-white/5 text-xs font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/80 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-brand-accent/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirmar y Pagar ({totalAmount.toLocaleString('es-ES')} €)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
