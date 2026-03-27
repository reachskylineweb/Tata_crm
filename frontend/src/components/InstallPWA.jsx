import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install UI
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is already installed
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      console.log('PWA was installed');
    });

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-install-banner" style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 1000,
      background: 'var(--white)', border: '1px solid var(--grey-200)',
      padding: '12px 16px', borderRadius: 16, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      animation: 'slideUp 0.4s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
         <div style={{ width: 44, height: 44, background: 'var(--tata-blue-50)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/icons/icon-192.png" alt="icon" style={{ width: 32, height: 32 }} />
         </div>
         <div>
            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--tata-blue)' }}>Install DSE CRM App</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--grey-500)', marginTop: 2 }}>Access leads directly from your home screen</div>
         </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setIsVisible(false)} style={{ background: 'none', border: 'none', color: 'var(--grey-400)', padding: 6 }}>
           <X size={18} />
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleInstallClick} style={{ padding: '0 14px', height: 40, borderRadius: 10 }}>
           <Download size={16} /> Install
        </button>
      </div>
    </div>
  );
}
