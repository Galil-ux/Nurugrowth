
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useToast } from '../services/ToastContext';
import { subscribeSiteSettings } from '../services/firebase';
import { SiteSettings } from '../types';
import { submitSubscriberEmail } from '../services/firebase';
import { Mail, Check, Loader2, ArrowRight, Globe } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const LogoIconSmall = () => (
  <svg width="30" height="30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M50 20L85 52L72 52L50 32L28 52L15 52L50 20Z" fill="#1e293b" />
    <path d="M48 45L70 67L83 67L50 35L17 67L30 67L48 45Z" fill="#1e293b" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z"/></svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"></path></svg>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const unsub = subscribeSiteSettings((data) => setSettings(data));
    return () => unsub();
  }, []);


  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim();

    if (!cleanEmail) {
      showWarning('Email Required', 'Please enter your email address to join the Solar Intelligence Briefing.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showError('Invalid Email Address', 'Please provide a valid email format (e.g. name@company.com).');
      return;
    }

    setSubscribing(true);
    try {
      await submitSubscriberEmail({
        email: cleanEmail,
        source: 'newsletter_footer',
        sourceLabel: 'East Africa Solar Intelligence Briefing (Footer)',
        country: 'Kenya'
      });

      setSubscribed(true);
      setNewsletterEmail('');
      showSuccess(
        'Welcome on Board!',
        `Thank you for subscribing. We have acknowledged your registration and dispatched a welcome letter to ${cleanEmail}.`
      );
    } catch (err: any) {
      console.error('Error submitting newsletter email:', err);
      showError('Subscription Notice', 'Could not record subscription at this moment. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const renderFooterText = () => {
    const text = settings?.footerText || '© 2025 NuruGrowth Lab. Engineering Energy Dignity through Data.';
    const regex = /(\b(202\d)\b)/;
    const match = text.match(regex);
    if (match) {
      const year = match[0];
      const index = text.indexOf(year);
      const before = text.substring(0, index);
      const after = text.substring(index + year.length);
      return (
        <span>
          {before}
          <a 
            href="#cms" 
            className="cursor-default select-none hover:text-slate-400 active:text-slate-400 focus:outline-none" 
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {year}
          </a>
          {after}
        </span>
      );
    }
    return <span>{text}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <footer className="bg-slate-50 border-t border-slate-100 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <LogoIconSmall />
              <div className="flex">
                <span className="text-xl font-black tracking-tighter text-blue-600 uppercase leading-none">Nuru</span>
                <span className="text-xl font-black tracking-tighter text-red-600 uppercase leading-none">Growth</span>
              </div>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed text-sm font-medium">
              Founded by Moses Mutuma, NuruGrowth is a strategic marketing lab engineering the clean energy transition for solar innovators across East Africa through data-backed intelligence.
            </p>

            {/* Newsletter Subscription Box */}
            <div className="pt-2">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm max-w-md">
                <div className="flex items-center gap-2 mb-2 text-slate-900">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider">East Africa Solar Intelligence Briefing</h4>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Join 1,200+ clean energy executives receiving bi-weekly market data, EPC CAC benchmarks, and policy intelligence.
                </p>

                {subscribed ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Subscribed! A welcoming confirmation has been dispatched to your inbox.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="corporate.email@solar.co.ke"
                      className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {subscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                        <>
                          <span>Join</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-slate-900 font-black mb-8 uppercase text-[10px] tracking-[0.3em]">Solutions</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase tracking-wider">
              <li><a href="#services" className="hover:text-blue-600 transition-colors">Growth Engineering</a></li>
              <li><a href="#products" className="hover:text-blue-600 transition-colors">Strategic Assets</a></li>
              <li><a href="#lab" className="hover:text-blue-600 transition-colors">ROI Analytics</a></li>
              <li><a href="#blog" className="hover:text-blue-600 transition-colors">Intelligence Lab</a></li>
            </ul>
          </div>

          {/* Social & Contact Column */}
          <div>
            <h4 className="text-slate-900 font-black mb-8 uppercase text-[10px] tracking-[0.3em]">Connect</h4>
            <div className="flex flex-wrap gap-6 mb-10 items-center">
              <a href={settings?.linkedinUrl || 'https://linkedin.com/company/nurugrowth'} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-all transform hover:scale-110" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
              <a href={settings?.instagramUrl || 'https://instagram.com/nurugrowth'} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-rose-500 transition-all transform hover:scale-110" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href={settings?.facebookUrl || 'https://facebook.com/nurugrowth'} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-700 transition-all transform hover:scale-110" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href={settings?.xUrl || 'https://x.com/nurugrowth'} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-all transform hover:scale-110" aria-label="X">
                <XIcon />
              </a>
              <a href={settings?.whatsappUrl || 'https://wa.me/254700000000'} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-all transform hover:scale-110" aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
              {settings?.customSocialLinks?.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-blue-600 transition-all transform hover:scale-110 flex items-center gap-1" 
                  title={link.platformName}
                  aria-label={link.platformName}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-wider">{link.platformName}</span>
                </a>
              ))}
            </div>
            <ul className="space-y-4 text-slate-500 text-sm font-medium">
              <li className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inquiries</span>
                <a href="mailto:${settings?.inquiriesEmail || 'hello@nurugrowth.com'}" className="text-slate-900 font-black hover:text-blue-600 transition-colors">{settings?.inquiriesEmail || 'hello@nurugrowth.com'}</a>
              </li>
              <li className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Base</span>
                <span className="text-slate-900 font-black">{settings?.operationalBase || 'Nairobi, Kenya'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-slate-200 text-slate-400 text-[9px] md:text-[10px] flex flex-col md:flex-row justify-between items-center gap-6 uppercase tracking-[0.2em] font-black">
          {renderFooterText()}
          <div className="flex gap-8 items-center text-slate-400">
            <a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy Protocol</a>
            <a href="#terms" className="hover:text-slate-900 transition-colors">Strategic Terms</a>
            <a href="#cookies" className="hover:text-slate-900 transition-colors">Intelligence Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
