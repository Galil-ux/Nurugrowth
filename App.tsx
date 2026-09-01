import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import GrowthTool from './components/GrowthTool';
import Methodology from './components/Methodology';
import About from './components/About';
import Services from './components/Services';
import CaseStudies from './components/CaseStudies';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import ProductizedOffer from './components/ProductizedOffer';
import Blog from './components/Blog';
import CMSAdmin from './components/CMSAdmin';
import Discovery from './components/Discovery';
import { NAVIGATION_LINKS } from './constants';
import { AuthProvider } from './services/AuthContext';
import { ToastProvider } from './services/ToastContext';

export type ViewType = 'home' | 'services' | 'products' | 'solutions' | 'lab' | 'blog' | 'discovery' | 'cms';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<ViewType>('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews: string[] = ['home', 'services', 'products', 'solutions', 'lab', 'blog', 'discovery', 'cms'];
      
      if (validViews.includes(hash)) {
        setCurrentPage(hash as ViewType);
      } else if (!hash) {
        setCurrentPage('home');
      }
      
      // Always snap to top on "page" change
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check on mount
    handleHashChange();

    // Anti-copy programmatic listeners
    const preventCopyActions = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('copy', preventCopyActions);
    window.addEventListener('cut', preventCopyActions);
    window.addEventListener('dragstart', preventCopyActions);
    window.addEventListener('selectstart', preventCopyActions);

    // SEO / Schema Data
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "NuruGrowth Solar Lab Tool",
      "operatingSystem": "Web",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KES"
      }
    };

    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(softwareSchema);
    document.head.appendChild(script1);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('copy', preventCopyActions);
      window.removeEventListener('cut', preventCopyActions);
      window.removeEventListener('dragstart', preventCopyActions);
      window.removeEventListener('selectstart', preventCopyActions);
      if (document.head.contains(script1)) {
        document.head.removeChild(script1);
      }
    };
  }, []);

  const renderView = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div id="home">
            <Hero />
            <About />
          </div>
        );
      case 'services':
        return (
          <div id="services">
            <Services />
            <Methodology />
          </div>
        );
      case 'products':
        return (
          <div id="products">
            <ProductizedOffer />
          </div>
        );
      case 'solutions':
        return (
          <div id="solutions">
            <Pricing />
            <CaseStudies />
            <Testimonials />
          </div>
        );
      case 'lab':
        return (
          <div id="lab">
            <GrowthTool />
          </div>
        );
      case 'blog':
        return (
          <div id="blog">
            <Blog />
          </div>
        );
      case 'discovery':
        return (
          <div id="discovery">
            <Discovery />
          </div>
        );
      case 'cms':
        return (
          <div id="cms">
            <CMSAdmin />
          </div>
        );
      default:
        return (
          <div id="home">
            <Hero />
            <About />
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
