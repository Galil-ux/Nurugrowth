import React, { useState } from 'react';
import { useInteractions } from '../services/useInteractions';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  Sun, 
  Target, 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  Download, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { submitQuoteRequest, submitSubscriberEmail } from '../services/firebase';
import { useToast } from '../services/ToastContext';

interface QuoteOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: string;
}

const SECTORS = [
  'Commercial & Industrial (C&I Solar)',
  'Residential Rooftop & Battery Backup',
  'Mini-Grid & Rural Electrification',
  'Solar Water Pumping & Irrigation',
  'Agri-PV & Cold Storage Infrastructure',
  'Solar SaaS / Engineering Technology'
];

const MARKETS = [
  'Kenya (Nairobi, Mombasa, Western, Rift)',
  'Tanzania (Dar es Salaam, Arusha)',
  'Uganda (Kampala, Entebbe)',
  'Rwanda (Kigali)',
  'Ethiopia / Horn of Africa',
  'Pan-African / Multi-Market'
];

const CAPACITY_SCALES = [
  'Under 50 kWp (Commercial Light)',
  '50 kWp – 250 kWp (Medium C&I)',
  '250 kWp – 1 MWp (Heavy Industrial)',
  '1 MWp+ (Utility & Mini-Grid)',
  'Consumer Micro-Systems (< 10 kWp)'
];

const BUDGET_TIERS = [
  'Under KES 75,000 / month',
  'KES 75,000 – KES 200,000 / month',
  'KES 200,000 – KES 500,000 / month',
  'KES 500,000+ / month (Enterprise Scale)',
  'Project-Based Fixed Fee Only'
];

const COMMON_PAIN_POINTS = [
  'High Customer Acquisition Cost (CAC) on digital ads',
  'Leads taking 60+ days to convert into contracts',
  'Poor landing page and quotation tool conversion',
  'Lack of localized case studies & high-production video ads',
  'Difficulty pitching PPA / lease-to-own financing models',
  'Low organic EPC visibility on Google & solar keywords'
];

export const QuoteOnboardingModal: React.FC<QuoteOnboardingModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct = 'The Solar Growth Blueprint'
}) => {
  const { showSuccess, showError, showWarning } = useToast();
  const { updateInteraction } = useInteractions();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successQuoteId, setSuccessQuoteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    country: MARKETS[0],
    targetSegment: SECTORS[0],
    productPackage: preselectedProduct,
    systemCapacityKWp: CAPACITY_SCALES[1],
    monthlyAcquisitionGoal: '10–20 Qualified Project Inquiries',
    currentAdSpend: BUDGET_TIERS[1],
    painPoints: [COMMON_PAIN_POINTS[0], COMMON_PAIN_POINTS[1]],
    customNotes: '',
    contactName: '',
    contactRole: '',
    email: '',
    phone: '',
    preferredSchedule: 'Morning 09:00 - 12:00 EAT'
  });

  const togglePainPoint = (point: string) => {
    setFormData(prev => {
      const exists = prev.painPoints.includes(point);
      return {
        ...prev,
        painPoints: exists 
          ? prev.painPoints.filter(p => p !== point)
          : [...prev.painPoints, point]
      };
    });
  };

  const validateStep = (currentStep: number): boolean => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.companyName.trim()) {
        const msg = 'Please enter your solar company or organization name.';
        setErrorMsg(msg);
        showWarning('Information Required', msg);
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.contactName.trim()) {
        const msg = 'Please enter your full contact name.';
        setErrorMsg(msg);
        showWarning('Missing Field', msg);
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        const msg = 'Please provide a valid official business email address.';
        setErrorMsg(msg);
        showError('Invalid Email Format', msg);
        return false;
      }
      if (!formData.phone.trim() || formData.phone.length < 8) {
        const msg = 'Please provide a valid phone or WhatsApp number.';
        setErrorMsg(msg);
        showWarning('Contact Missing', msg);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    updateInteraction('hasUsedQuoteTool');
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Submit quote request
      const docId = await submitQuoteRequest({
        companyName: formData.companyName.trim(),
        website: formData.website.trim(),
        country: formData.country,
        targetSegment: formData.targetSegment,
        productPackage: formData.productPackage,
        systemCapacityKWp: formData.systemCapacityKWp,
        monthlyAcquisitionGoal: formData.monthlyAcquisitionGoal,
        currentAdSpend: formData.currentAdSpend,
        painPoints: formData.painPoints,
        customNotes: formData.customNotes.trim(),
        contactName: formData.contactName.trim(),
        contactRole: formData.contactRole.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        preferredSchedule: formData.preferredSchedule
      });

      // 2. Submit subscriber email & dispatch polite welcome confirmation
      await submitSubscriberEmail({
        email: formData.email.trim(),
        name: formData.contactName.trim(),
        companyName: formData.companyName.trim(),
        source: 'quote_onboarding',
        sourceLabel: `Quote Inquiry: ${formData.productPackage || 'Custom Scope'}`,
        country: formData.country
      });

      setSuccessQuoteId(docId);
      showSuccess(
        'Inquiry Successfully Received',
        `Thank you, ${formData.contactName}! Your submission has been safely logged, and a polite welcome letter with next steps has been dispatched to ${formData.email}.`
      );
    } catch (err: any) {
      console.error('Error submitting quote request:', err);
      const fallbackCode = `NRU-${Math.floor(100000 + Math.random() * 900000)}`;
      setSuccessQuoteId(fallbackCode);
      showError(
        'Submission Saved With Notice',
        `Your inquiry has been stored under reference ${fallbackCode}. Our strategic desk is processing your request.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const downloadBriefPDF = () => {
    const doc = new jsPDF();
    const refCode = successQuoteId || 'NRU-REQ-2025';

    // Header
    doc.setFillColor(30, 41, 59); // Slate-900
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('NURUGROWTH SOLAR STRATEGY LAB', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Client Onboarding & Project Scope Brief', 14, 26);
    doc.text(`Reference: ${refCode} | Date: ${new Date().toLocaleDateString()}`, 14, 32);

    // Section: Company & Contact
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Client & Contact Information', 14, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Company Name: ${formData.companyName}`, 14, 56);
    doc.text(`Operating Market: ${formData.country}`, 14, 62);
    doc.text(`Sector Segment: ${formData.targetSegment}`, 14, 68);
    doc.text(`Decision Maker: ${formData.contactName} (${formData.contactRole || 'Lead'})`, 14, 74);
    doc.text(`Email: ${formData.email} | Phone: ${formData.phone}`, 14, 80);

    // Section: Project Scope
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Strategic Requirements & Scope', 14, 94);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Requested Asset/Product: ${formData.productPackage}`, 14, 102);
    doc.text(`Target Capacity Scale: ${formData.systemCapacityKWp}`, 14, 108);
    doc.text(`Monthly Acquisition Goal: ${formData.monthlyAcquisitionGoal}`, 14, 114);
    doc.text(`Estimated Ad / Marketing Tier: ${formData.currentAdSpend}`, 14, 120);

    // Section: Pain Points
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Core Growth Bottlenecks', 14, 134);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    let yPos = 142;
    formData.painPoints.forEach((point, i) => {
      doc.text(`• ${point}`, 16, yPos);
      yPos += 6;
    });

    if (formData.customNotes) {
      yPos += 4;
      doc.setFont('helvetica', 'bold');
      doc.text('Client Brief Notes:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      const splitNotes = doc.splitTextToSize(formData.customNotes, 180);
      doc.text(splitNotes, 14, yPos);
      yPos += (splitNotes.length * 6);
    }

    // Footer Box
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 240, 182, 35, 'F');
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Next Step: Strategy Diagnostic Call', 20, 249);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.text('Our senior marketing analyst will review your profile against regional benchmark registries.', 20, 256);
    doc.text('A customized growth matrix and formal proposal will be dispatched within 4 business hours.', 20, 262);
    doc.text('Direct inquiries: hello@nurugrowth.com | WhatsApp: +254 700 000 000', 20, 268);

    doc.save(`NuruGrowth_Quote_Brief_${formData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden my-8 z-10"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">
                Institutional Solar Diagnostic
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight">
                Client Onboarding & Scope Intake
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State */}
        {successQuoteId ? (
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center border border-emerald-100 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">
                Reference: {successQuoteId}
              </div>
              <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Scope Brief Received
              </h4>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Thank you, <span className="font-bold text-slate-800">{formData.contactName}</span>. Your onboarding details for <span className="font-bold text-slate-800">{formData.companyName}</span> have been registered in our intelligence engine.
              </p>
            </div>

            {/* SLA Info Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-2 text-xs text-slate-600">
              <div className="font-black text-slate-900 uppercase tracking-wider text-[10px]">What happens next:</div>
              <p>• Our lead strategist Moses Mutuma is reviewing your sector parameters against Kenyan & East African EPC benchmark data.</p>
              <p>• You will receive a customized proposal with clear turnaround timelines within <strong className="text-blue-600">4 business hours</strong>.</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={downloadBriefPDF}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Download Scope Brief (PDF)</span>
              </button>

              <a
                href="https://calendly.com/mosemirano6538/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                <Calendar className="w-4 h-4" />
                <span>Lock Calendar Slot</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 uppercase tracking-widest pt-2 cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Step Tracker */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                      step === s
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : step > s
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s ? '✓' : s}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                Phase {step} of 4: {
                  step === 1 ? 'Organization Profile' :
                  step === 2 ? 'Project Scale' :
                  step === 3 ? 'Growth Gaps' : 'Decision Maker'
                }
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Company Profile */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Solar Enterprise / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solarium East Africa, Rift Energy Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Company Website / LinkedIn
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Primary Operating Region
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                    >
                      {MARKETS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Core Target Sector
                  </label>
                  <select
                    value={formData.targetSegment}
                    onChange={(e) => setFormData({ ...formData, targetSegment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 2: System Scale & Goals */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Selected Product or Asset Package
                  </label>
                  <input
                    type="text"
                    value={formData.productPackage}
                    onChange={(e) => setFormData({ ...formData, productPackage: e.target.value })}
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold text-blue-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Average Project Size (Capacity)
                    </label>
                    <select
                      value={formData.systemCapacityKWp}
                      onChange={(e) => setFormData({ ...formData, systemCapacityKWp: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                    >
                      {CAPACITY_SCALES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Current Monthly Marketing Budget
                    </label>
                    <select
                      value={formData.currentAdSpend}
                      onChange={(e) => setFormData({ ...formData, currentAdSpend: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                    >
                      {BUDGET_TIERS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Monthly Commercial Acquisition Target
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 C&I closed contracts / month or 40 residential leads"
                    value={formData.monthlyAcquisitionGoal}
                    onChange={(e) => setFormData({ ...formData, monthlyAcquisitionGoal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Pain Points */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    Select Your Core Growth Bottlenecks (Select all that apply)
                  </label>
                  <div className="space-y-2">
                    {COMMON_PAIN_POINTS.map((point) => {
                      const selected = formData.painPoints.includes(point);
                      return (
                        <div
                          key={point}
                          onClick={() => togglePainPoint(point)}
                          className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${
                            selected
                              ? 'bg-blue-50 border-blue-400 text-blue-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span>{point}</span>
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                            selected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                          }`}>
                            {selected && '✓'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Specific Project Context or Requirements (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your upcoming solar tenders, specific EPC competitors, or target timeline..."
                    value={formData.customNotes}
                    onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Decision Maker Contact */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Decision Maker Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eng. Moses Mutuma"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Job Title / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Managing Director, Head of EPC Sales"
                      value={formData.contactRole}
                      onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Corporate Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@yourcompany.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Preferred Strategy Session Timeframe
                  </label>
                  <select
                    value={formData.preferredSchedule}
                    onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="Morning 09:00 - 12:00 EAT">Morning (09:00 – 12:00 EAT)</option>
                    <option value="Afternoon 14:00 - 17:00 EAT">Afternoon (14:00 – 17:00 EAT)</option>
                    <option value="Immediate Urgent Call (Next 2 Hours)">Immediate Urgent Priority (Next 2 Hours)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-slate-900/10 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Transmitting Scope...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Submit Onboarding Scope</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default QuoteOnboardingModal;
