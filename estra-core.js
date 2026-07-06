// =============================================
// ESTRA LINK - CORE ENGINE v1.0
// Gestion centrale des données et de la communication entre pages
// =============================================

const ESTRA = {
  API_BASE: 'http://localhost:3000/api',
  USE_API: true,
  
  // ============ SESSION ============
  getToken() {
    return localStorage.getItem('estra_token');
  },
  
  setToken(token) {
    localStorage.setItem('estra_token', token);
  },
  
  getRefreshToken() {
    return localStorage.getItem('estra_refresh_token');
  },
  
  setRefreshToken(token) {
    localStorage.setItem('estra_refresh_token', token);
  },
  
  isLoggedIn() {
    return !!this.getToken() && localStorage.getItem('estra_logged_in') === 'true';
  },
  
  // ============ PROFIL UTILISATEUR ============
  getProfile() {
    const profile = localStorage.getItem('estra_profile');
    return profile ? JSON.parse(profile) : null;
  },
  
  setProfile(profile) {
    localStorage.setItem('estra_profile', JSON.stringify(profile));
    // Déclencher un événement pour que les autres onglets se mettent à jour
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'estra_profile',
      newValue: JSON.stringify(profile)
    }));
  },
  
  updateProfile(updates) {
    const profile = this.getProfile() || {};
    Object.assign(profile, updates);
    this.setProfile(profile);
    return profile;
  },
  
  // ============ APPELS API ============
  async apiCall(endpoint, method = 'GET', body = null) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(`${this.API_BASE}${endpoint}`, options);
      const data = await response.json();
      
      if (!response.ok) {
        // Si token expiré, tenter le refresh
        if (response.status === 401 && this.getRefreshToken()) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Réessayer avec le nouveau token
            return this.apiCall(endpoint, method, body);
          }
        }
        throw new Error(data.error || data.message || 'Erreur API');
      }
      
      return data;
    } catch (error) {
      console.error('❌ API Error:', error.message);
      throw error;
    }
  },
  
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;
      
      const response = await fetch(`${this.API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        this.setToken(data.token);
        if (data.refreshToken) this.setRefreshToken(data.refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Refresh token failed:', error);
      return false;
    }
  },
  
  // ============ AUTH ============
  async login(email, password) {
    const data = await this.apiCall('/auth/login', 'POST', { email, password });
    
    this.setToken(data.token);
    if (data.refreshToken) this.setRefreshToken(data.refreshToken);
    this.setProfile(data.user);
    localStorage.setItem('estra_logged_in', 'true');
    
    return data;
  },
  
  async register(userData) {
    const data = await this.apiCall('/auth/register', 'POST', userData);
    
    this.setToken(data.token);
    if (data.refreshToken) this.setRefreshToken(data.refreshToken);
    this.setProfile(data.user);
    localStorage.setItem('estra_logged_in', 'true');
    
    return data;
  },
  
  async forgotPassword(email) {
    return await this.apiCall('/auth/forgot-password', 'POST', { email });
  },
  
  async verifyResetCode(email, code) {
    return await this.apiCall('/auth/verify-reset-code', 'POST', { email, code });
  },
  
  async resetPassword(email, newPassword, code) {
    return await this.apiCall('/auth/reset-password', 'POST', { email, newPassword, code });
  },
  
  logout() {
    localStorage.clear();
    window.location.href = 'login.html';
  },
  
  // ============ VÉRIFICATION SESSION ============
  checkSession() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// Exposer globalement
window.ESTRA = ESTRA;

// Fonction checkSession pour compatibilité avec les pages existantes
window.checkSession = function() {
  return ESTRA.checkSession();
};

console.log('✅ ESTRA Core Engine initialisé');