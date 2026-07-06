// ============================================
// ESTRA LINK - INITIALISATION PWA + API
// ============================================

// ============ CONFIGURATION API ============
const API_BASE = 'http://localhost:3000/api';

// ============ SERVICE WORKER ============
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker:', registration.scope);
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch((err) => console.log('Service Worker:', err));
  });
}

function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:12px 20px;border-radius:25px;z-index:1000;font-size:0.8rem;border:1px solid #38bdf8;cursor:pointer;white-space:nowrap;';
  banner.textContent = '🔄 Nouvelle version. Cliquer pour actualiser.';
  banner.onclick = () => window.location.reload();
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 8000);
}

// ============ PROMPT D'INSTALLATION PWA ============
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Afficher après 8 secondes si pas déjà installé
  setTimeout(() => {
    if (!localStorage.getItem('pwa_installed')) {
      showInstallBanner();
    }
  }, 8000);
});

function showInstallBanner() {
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:16px 24px;border-radius:16px;z-index:1000;display:flex;align-items:center;gap:12px;border:1px solid #38bdf8;font-size:0.85rem;box-shadow:0 8px 24px rgba(0,0,0,0.3);';
  banner.innerHTML = `
        <span>📱 Installer ESTRA LINK ?</span>
        <button id="pwaInstallBtn" style="background:#38bdf8;border:0;color:#000;padding:8px 16px;border-radius:20px;cursor:pointer;font-weight:600;font-size:0.8rem;">Installer</button>
        <button id="pwaDismissBtn" style="background:none;border:0;color:#94a3b8;cursor:pointer;font-size:1rem;">✕</button>
    `;
  document.body.appendChild(banner);
  
  document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
      }
      deferredPrompt = null;
    }
    banner.remove();
  });
  
  document.getElementById('pwaDismissBtn').addEventListener('click', () => {
    banner.remove();
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  });
}

// Ne plus afficher la bannière pendant 7 jours si fermée
const dismissed = localStorage.getItem('pwa_install_dismissed');
if (dismissed && Date.now() - parseInt(dismissed) < 604800000) {
  // Moins de 7 jours, ne pas réafficher
}

// ============ VÉRIFICATION DE SESSION ============
function checkSession() {
  const token = localStorage.getItem('estra_token');
  const loggedIn = localStorage.getItem('estra_logged_in');
  
  if (!token || loggedIn !== 'true') {
    // Vérifier si on n'est pas déjà sur login.html
    if (!window.location.pathname.includes('login.html') &&
      !window.location.pathname.includes('session-expired.html')) {
      window.location.href = 'session-expired.html';
    }
    return false;
  }
  return true;
}

// ============ FONCTION API UNIVERSELLE ============
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('estra_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    });
    
    // Si le token a expiré
    if (response.status === 401) {
      localStorage.removeItem('estra_token');
      localStorage.removeItem('estra_logged_in');
      if (!window.location.pathname.includes('login.html')) {
        window.location.href = 'session-expired.html';
      }
      throw new Error('Session expirée');
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erreur API');
    }
    
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      console.log('⚠️ API inaccessible - Mode hors-ligne');
      return { error: 'API inaccessible', offline: true };
    }
    throw error;
  }
}

// ============ EXPOSER GLOBALEMENT ============
window.API_BASE = API_BASE;
window.apiCall = apiCall;
window.checkSession = checkSession;

console.log('✅ PWA + API initialisés');