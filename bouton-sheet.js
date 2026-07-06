/**
 * ============================================
 * BOTTOM SHEET - Module partagé ESTRA LINK
 * Fonctionne sur TOUTES les pages
 * ============================================
 */

const BottomSheet = {
    // Stocker l'ID du post courant pour le partage
    currentPostId: null,
    currentPostType: null,

    /**
     * Ferme TOUS les bottom sheets ouverts
     */
    closeAll() {
        const overlays = document.querySelectorAll('.bottom-sheet-overlay');
        const sheets = document.querySelectorAll('.bottom-sheet');

        overlays.forEach(o => {
            o.classList.remove('active');
            setTimeout(() => { if (o.parentNode) o.remove(); }, 350);
        });

        sheets.forEach(s => {
            s.classList.remove('active');
            setTimeout(() => { if (s.parentNode) s.remove(); }, 350);
        });
    },

    /**
     * Crée un overlay (fond sombre)
     */
    createOverlay(id) {
        const overlay = document.createElement('div');
        overlay.className = 'bottom-sheet-overlay';
        overlay.id = id || 'bsOverlay';
        return overlay;
    },

    /**
     * Crée un bottom sheet vide
     */
    createSheet(id) {
        const sheet = document.createElement('div');
        sheet.className = 'bottom-sheet';
        sheet.id = id || 'bsSheet';
        return sheet;
    },

    /**
     * Ajoute le swipe pour fermer sur mobile
     */
    enableSwipe(sheet) {
        let startY = 0;

        sheet.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });

        sheet.addEventListener('touchmove', (e) => {
            const deltaY = e.touches[0].clientY - startY;
            if (deltaY > 0) {
                sheet.style.transform = `translateY(${deltaY}px)`;
                sheet.style.transition = 'none';
            }
        }, { passive: true });

        sheet.addEventListener('touchend', (e) => {
            const deltaY = e.changedTouches[0].clientY - startY;
            sheet.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
            if (deltaY > 100) {
                this.closeAll();
            } else {
                sheet.style.transform = 'translateY(0)';
            }
        });
    },

    /**
     * Anime l'ouverture
     */
    animateIn(overlay, sheet) {
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            sheet.classList.add('active');
        });
        overlay.addEventListener('click', () => this.closeAll());
    },

    /**
     * Ouvre le menu d'options d'un post
     * @param {Object} options - { postId, postType, isOwner, isPinned, isSaved }
     * @param {Array} customItems - [{ icon, iconBg, iconColor, label, subtitle, danger, onClick }]
     */
    openPostMenu(options = {}, customItems = []) {
        this.closeAll();

        const {
            postId,
            postType = 'post',
            isOwner = false,
            isPinned = false,
            isSaved = false
        } = options;

        const overlay = this.createOverlay('menuOverlay');
        const sheet = this.createSheet('menuSheet');

        let html = `
            <div class="bottom-sheet-handle"></div>
            <div class="bottom-sheet-header">
                <i class="fas fa-ellipsis-h" style="color: var(--cyan, #0284c7);"></i> Options
            </div>`;

        // Items par défaut selon le propriétaire
        if (isOwner) {
            html += `
                <div class="bottom-sheet-item" data-action="share">
                    <div class="bs-icon" style="background:rgba(56,189,248,0.1);color:var(--cyan,#0284c7);">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <div class="bs-text">
                        <div>Partager</div>
                        <div class="bs-subtitle">Envoyer à vos amis</div>
                    </div>
                    <i class="fas fa-chevron-right" style="color:var(--text-secondary);font-size:0.8rem;"></i>
                </div>
                
                <div class="bottom-sheet-item" data-action="copyLink">
                    <div class="bs-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">
                        <i class="fas fa-link"></i>
                    </div>
                    <div class="bs-text">
                        <div>Copier le lien</div>
                        <div class="bs-subtitle">Copier l'URL</div>
                    </div>
                </div>
                
                <div class="bottom-sheet-divider"></div>
                
                <div class="bottom-sheet-item" data-action="pin">
                    <div class="bs-icon" style="background:rgba(245,158,11,0.1);color:var(--warning,#f59e0b);">
                        <i class="fas fa-thumbtack"></i>
                    </div>
                    <div class="bs-text">
                        <div>${isPinned ? 'Désépingler' : 'Épingler en haut'}</div>
                        <div class="bs-subtitle">${isPinned ? 'Retirer du haut' : 'Afficher en premier'}</div>
                    </div>
                </div>
                
                <div class="bottom-sheet-divider"></div>
                
                <div class="bottom-sheet-item" data-action="hide">
                    <div class="bs-icon" style="background:rgba(100,116,139,0.1);color:var(--text-secondary);">
                        <i class="fas fa-eye-slash"></i>
                    </div>
                    <div class="bs-text">
                        <div>Masquer</div>
                        <div class="bs-subtitle">Ne plus voir</div>
                    </div>
                </div>
                
                <div class="bottom-sheet-item danger" data-action="delete">
                    <div class="bs-icon" style="background:rgba(239,68,68,0.1);color:var(--danger);">
                        <i class="fas fa-trash"></i>
                    </div>
                    <div class="bs-text">
                        <div>Supprimer</div>
                        <div class="bs-subtitle">Action irréversible</div>
                    </div>
                </div>`;
        } else {
            html += `
                <div class="bottom-sheet-item" data-action="share">
                    <div class="bs-icon" style="background:rgba(56,189,248,0.1);color:var(--cyan,#0284c7);">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <div class="bs-text">
                        <div>Partager</div>
                        <div class="bs-subtitle">Envoyer à vos amis</div>
                    </div>
                    <i class="fas fa-chevron-right" style="color:var(--text-secondary);font-size:0.8rem;"></i>
                </div>
                
                <div class="bottom-sheet-item" data-action="copyLink">
                    <div class="bs-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">
                        <i class="fas fa-link"></i>
                    </div>
                    <div class="bs-text">
                        <div>Copier le lien</div>
                        <div class="bs-subtitle">Copier l'URL</div>
                    </div>
                </div>
                
                <div class="bottom-sheet-item" data-action="save">
                    <div class="bs-icon" style="background:rgba(139,92,246,0.1);color:var(--purple,#7c3aed);">
                        <i class="fas fa-bookmark"></i>
                    </div>
                    <div class="bs-text">
                        <div>${isSaved ? 'Retirer des favoris' : 'Enregistrer'}</div>
                        <div class="bs-subtitle">${isSaved ? 'Retirer' : 'Ajouter aux favoris'}</div>
                    </div>
                </div>
                
                <div class="bottom-sheet-divider"></div>
                
                <div class="bottom-sheet-item" data-action="hide">
                    <div class="bs-icon" style="background:rgba(100,116,139,0.1);color:var(--text-secondary);">
                        <i class="fas fa-eye-slash"></i>
                    </div>
                    <div class="bs-text">
                        <div>Masquer</div>
                        <div class="bs-subtitle">Ne plus voir</div>
                    </div>
                </div>
                
                <div class="bottom-sheet-item" data-action="report">
                    <div class="bs-icon" style="background:rgba(245,158,11,0.1);color:var(--warning,#f59e0b);">
                        <i class="fas fa-flag"></i>
                    </div>
                    <div class="bs-text">
                        <div>Signaler</div>
                        <div class="bs-subtitle">Contenu inapproprié</div>
                    </div>
                </div>`;
        }

        // Ajouter les items personnalisés
        customItems.forEach(item => {
            html += `
                <div class="bottom-sheet-item ${item.danger ? 'danger' : ''}" data-action="${item.action || 'custom'}">
                    <div class="bs-icon" style="background:${item.iconBg || 'rgba(100,116,139,0.1)'};color:${item.iconColor || 'var(--text-secondary)'};">
                        <i class="${item.icon || 'fas fa-circle'}"></i>
                    </div>
                    <div class="bs-text">
                        <div>${item.label || ''}</div>
                        ${item.subtitle ? `<div class="bs-subtitle">${item.subtitle}</div>` : ''}
                    </div>
                </div>`;
        });

        html += `
            <button class="bottom-sheet-cancel" onclick="BottomSheet.closeAll()">
                <i class="fas fa-times" style="margin-right:6px;"></i> Annuler
            </button>`;

        sheet.innerHTML = html;

        // Gérer les clics sur les items
        sheet.querySelectorAll('.bottom-sheet-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;

                // Chercher d'abord dans les items personnalisés
                const customItem = customItems.find(ci => ci.action === action);
                if (customItem && customItem.onClick) {
                    customItem.onClick(postId, postType);
                    this.closeAll();
                    return;
                }

                // Actions par défaut
                switch (action) {
                    case 'share':
                        this.closeAll();
                        setTimeout(() => this.openShare(postId, postType), 300);
                        break;
                    case 'copyLink':
                        this.copyLink(postId);
                        break;
                    case 'pin':
                        this.emit('pin', { postId, postType });
                        break;
                    case 'hide':
                        this.emit('hide', { postId, postType });
                        break;
                    case 'delete':
                        this.emit('delete', { postId, postType });
                        break;
                    case 'save':
                        this.emit('save', { postId, postType });
                        break;
                    case 'report':
                        this.emit('report', { postId, postType });
                        break;
                }
            });
        });

        document.body.appendChild(overlay);
        document.body.appendChild(sheet);
        this.animateIn(overlay, sheet);
        this.enableSwipe(sheet);

        // Échap pour fermer
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    /**
     * Ouvre le sheet de partage
     */
    openShare(postId, postType, customOptions = {}) {
        this.closeAll();
        this.currentPostId = postId;
        this.currentPostType = postType;

        setTimeout(() => {
            const overlay = this.createOverlay('shareOverlay');
            const sheet = this.createSheet('shareSheet');

            const {
                messagePlaceholder = 'Ajouter un message...',
                platforms = ['whatsapp', 'facebook', 'twitter', 'linkedin', 'telegram', 'messenger', 'email', 'sms'],
                showCopyLink = true,
                extraButtons = []
            } = customOptions;

            // Configuration des plateformes
            const platformConfig = {
                whatsapp:  { icon: 'fab fa-whatsapp', color: '#25D366', bg: 'rgba(37,211,102,0.15)', label: 'WhatsApp' },
                facebook:  { icon: 'fab fa-facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.15)', label: 'Facebook' },
                twitter:   { icon: 'fab fa-x-twitter', color: '#000', bg: 'rgba(0,0,0,0.1)', label: 'X / Twitter' },
                linkedin:  { icon: 'fab fa-linkedin', color: '#0077B5', bg: 'rgba(0,119,181,0.15)', label: 'LinkedIn' },
                telegram:  { icon: 'fab fa-telegram', color: '#26A5E4', bg: 'rgba(38,165,228,0.15)', label: 'Telegram' },
                messenger: { icon: 'fab fa-facebook-messenger', color: '#00B2FF', bg: 'rgba(0,178,255,0.15)', label: 'Messenger' },
                email:     { icon: 'fas fa-envelope', color: '#EA4335', bg: 'rgba(234,67,53,0.15)', label: 'Email' },
                sms:       { icon: 'fas fa-comment-sms', color: '#FFB800', bg: 'rgba(255,184,0,0.15)', label: 'SMS' },
            };

            let platformsHtml = platforms.map(p => {
                const config = platformConfig[p];
                if (!config) return '';
                return `
                    <div class="share-item-bs" onclick="BottomSheet.shareTo('${p}')">
                        <div class="share-icon-circle" style="background:${config.bg};color:${config.color};">
                            <i class="${config.icon}"></i>
                        </div>
                        <span class="share-label-bs">${config.label}</span>
                    </div>`;
            }).join('');

            let html = `
                <div class="bottom-sheet-handle"></div>
                <div class="bottom-sheet-header">
                    <i class="fas fa-share-alt" style="color:var(--cyan,#0284c7);"></i> Partager
                </div>
                
                <div style="padding:0 16px 8px;">
                    <textarea id="bsShareMessage" class="bs-textarea" 
                        placeholder="${messagePlaceholder}" rows="2"></textarea>
                </div>
                
                <div class="share-grid-bs">
                    ${platformsHtml}
                </div>`;

            if (showCopyLink) {
                html += `
                <div style="padding:0 16px 12px;">
                    <div class="bs-copy-link-zone" onclick="BottomSheet.copyCurrentLink()">
                        <i class="fas fa-link" style="color:var(--cyan,#0284c7);"></i>
                        <span style="color:var(--cyan,#0284c7);font-weight:600;margin-left:8px;">Copier le lien</span>
                    </div>
                </div>`;
            }

            // Boutons supplémentaires
            extraButtons.forEach(btn => {
                html += `
                <div style="padding:0 16px 8px;">
                    <button class="bottom-sheet-cancel" 
                        style="border:1px solid var(--border-color);border-radius:12px;margin-bottom:4px;"
                        onclick="(${btn.onClick.toString()})()">
                        <i class="${btn.icon || 'fas fa-plus'}"></i> ${btn.label}
                    </button>
                </div>`;
            });

            html += `
                <button class="bottom-sheet-cancel" onclick="BottomSheet.closeAll()">
                    <i class="fas fa-times" style="margin-right:6px;"></i> Annuler
                </button>`;

            sheet.innerHTML = html;
            document.body.appendChild(overlay);
            document.body.appendChild(sheet);
            this.animateIn(overlay, sheet);
            this.enableSwipe(sheet);

            setTimeout(() => {
                const textarea = document.getElementById('bsShareMessage');
                if (textarea) textarea.focus();
            }, 400);
        }, 100);
    },

    /**
     * Partager vers une plateforme
     */
    shareTo(platform) {
        const messageInput = document.getElementById('bsShareMessage');
        let shareText = messageInput ? messageInput.value.trim() : '';

        if (!shareText) {
            // Chercher dans les données de la page
            if (typeof posts !== 'undefined' && this.currentPostId) {
                const allItems = [
                    ...(typeof posts !== 'undefined' ? posts : []),
                    ...(typeof jobsList !== 'undefined' ? jobsList : []),
                    ...(typeof eventsList !== 'undefined' ? eventsList : [])
                ];
                const item = allItems.find(x => x.id === this.currentPostId);
                if (item) shareText = (item.content || item.title || '').substring(0, 150);
            }
        }

        if (!shareText) shareText = 'Découvrez ce contenu sur ESTRA LINK !';

        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(window.location.href);
        let url = '';

        switch (platform) {
            case 'whatsapp': url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`; break;
            case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; break;
            case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`; break;
            case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`; break;
            case 'telegram': url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`; break;
            case 'messenger': url = `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=123456789`; break;
            case 'email': url = `mailto:?subject=${encodeURIComponent('ESTRA LINK')}&body=${encodedText}%0A%0A${encodedUrl}`; break;
            case 'sms': url = `sms:?body=${encodedText}%20${encodedUrl}`; break;
        }

        if (url) {
            window.open(url, '_blank');
            setTimeout(() => this.closeAll(), 500);
        }
    },

    /**
     * Copier le lien du post courant
     */
    copyCurrentLink() {
        const url = this.currentPostId
            ? `${window.location.origin}/profile.html?post=${this.currentPostId}`
            : window.location.href;

        this.copyToClipboard(url);
        this.closeAll();
    },

    /**
     * Copier un lien spécifique
     */
    copyLink(postId) {
        const url = postId
            ? `${window.location.origin}/profile.html?post=${postId}`
            : window.location.href;

        this.copyToClipboard(url);
        this.closeAll();
    },

    /**
     * Utilitaire : copier dans le presse-papier
     */
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                if (typeof showToast === 'function') showToast('📋 Lien copié !');
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            if (typeof showToast === 'function') showToast('📋 Lien copié !');
        }
    },

    /**
     * Système d'événements personnalisé
     */
    _listeners: {},

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    },

    emit(event, data) {
        if (this._listeners[event]) {
            this._listeners[event].forEach(cb => cb(data));
        }
        this.closeAll();
    }
};

// Exposer globalement
window.BottomSheet = BottomSheet;