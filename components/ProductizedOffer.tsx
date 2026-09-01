import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STANDARDIZED_PRODUCTS } from '../constants';
import QuoteOnboardingModal from './QuoteOnboardingModal';
import { Sparkles, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { subscribeSiteSettings } from '../services/firebase';
import { ProductizedOffer as OfferType } from '../types';

const ProductizedOffer: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('The Solar Growth Blueprint');
  const [products, setProducts] = useState<OfferType[]>(STANDARDIZED_PRODUCTS);

  useEffect(() => {
    const unsub = subscribeSiteSettings((settings) => {
      if (settings?.productizedOffers && settings.productizedOffers.length > 0) {
        setProducts(settings.productizedOffers);
      } else {
        setProducts(STANDARDIZED_PRODUCTS);
      }
    });
    return () => unsub();
  }, []);

  const handleOpenQuote = (productTitle: string) => {
    setSelectedProduct(productTitle);
    setIsQuoteModalOpen(true);
  };

  return (
    <section id="products" className="py-32 px-6 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">Standardized Excellence</div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
              High-Impact Products. <br /> Zero Guesswork.
            </h2>
            <p className="mt-6 text-slate-500 text-lg font-medium">
              We've productized our most effective strategic workflows into standardized, fixed-price assets. Get institutional-grade marketing clarity without the long-term retainer commitment.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-3 text-slate-400 text-[11px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Now Accepting 2 Audits per Week
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {products.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative group bg-white rounded-[3.5rem] p-10 md:p-14 border transition-all duration-500 flex flex-col h-full ${
                product.isPopular ? 'border-blue-600 shadow-2xl shadow-blue-600/5' : 'border-slate-100 shadow-sm hover:border-slate-200'
              }`}
            >
              {product.isPopular && (
                <div className="absolute top-8 right-8 bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                  Most Requested
                </div>
              )}

              <div className="mb-10 flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{product.title}</h3>
                  <div className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">{product.subtitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 font-mono">{product.currency} {product.price}</div>
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">One-time Investment</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 mb-10 border border-slate-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Core Deliverable</div>
                  <div className="text-sm font-bold text-slate-900 leading-snug">{product.deliverable}</div>
                </div>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed font-medium mb-10 flex-grow">
                {product.description}
              </p>

              <div className="space-y-4 mb-12">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">What's Included:</div>
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 transition-all group-hover/item:scale-150"></div>
                    <span className="text-sm text-slate-600 font-bold tracking-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-slate-50 gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Typical Turnaround</span>
                  <span className="text-sm font-black text-slate-900">{product.timeToDelivery}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => handleOpenQuote(product.title)}
                  className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all text-center cursor-pointer ${
                    product.isPopular 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700' 
                    : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10'
                  }`}
                >
                  Request Quote & Onboard
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Scope / Enterprise Onboarding Callout */}
        <div className="mt-16 bg-white rounded-3xl md:rounded-[3rem] p-8 md:p-14 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Bespoke Enterprise Scope
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Need a Custom Regional Solar Growth Retainer?
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              For pan-African mini-grid operators, utility EPCs, and multi-market solar franchises needing dedicated CMO oversight and bespoke customer acquisition pipelines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenQuote('Bespoke Enterprise CMO Retainer')}
            className="px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Custom Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Onboarding Quote Request Modal */}
      <QuoteOnboardingModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        preselectedProduct={selectedProduct}
      />
    </section>
  );
};

export default ProductizedOffer;
