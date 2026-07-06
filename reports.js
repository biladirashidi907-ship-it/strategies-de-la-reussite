// ==========================================
// ESTRA LINK - SYSTÈME DE SIGNALEMENT
// Version : 2.2.0 - Correction scroll définitive
// ==========================================

const REPORT_TYPES = [
  { id: 'spam', icon: '📢', label: 'Spam ou publicité non désirée' },
  { id: 'harassment', icon: '😠', label: 'Harcèlement ou intimidation' },
  { id: 'inappropriate', icon: '🔞', label: 'Contenu choquant ou inapproprié' },
  { id: 'fake_news', icon: '📰', label: 'Fausse information' },
  { id: 'violence', icon: '⚠️', label: 'Violence ou discours haineux' },
  { id: 'plagiarism', icon: '📋', label: 'Plagiat ou copie non autorisée' },
  { id: 'other', icon: '❓', label: 'Autre problème' }
]; 

let savedScrollY = 0;

function closeReportModal() {
  const modal = document.getElementById('reportModal');
  if (modal) modal.remove();
  
  // Restaurer le scroll
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  
  // Revenir à la position sauvegardée
  setTimeout(() => {
    window.scrollTo(0, savedScrollY);
  }, 10);
}

function reportContent(targetType, targetId, targetContent, targetAuthor) {
  if (typeof closePostMenu === 'function') closePostMenu();
  if (typeof activePostMenu !== 'undefined' && activePostMenu) {
    activePostMenu.remove();
    activePostMenu = null;
  }
  
  closeReportModal();
  
  // Sauvegarder la position actuelle
  savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
  
  // Bloquer le scroll sur html ET body
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  
  const typeLabels = { post: 'publication', comment: 'commentaire', course: 'cours', event: 'événement' };
  
  const modalHTML = `
    <div id="reportModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;" onclick="closeReportModal()">
        <div style="background:#ffffff;width:100%;max-width:450px;max-height:85vh;overflow-y:auto;border-radius:20px;padding:24px;border:1px solid rgba(0,0,0,0.1);box-shadow:0 20px 60px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="font-size:1.1rem;color:#dc2626;display:flex;align-items:center;gap:8px;margin:0;font-weight:700;">
                    <i class="fas fa-flag"></i> Signaler un ${typeLabels[targetType] || 'contenu'}
                </h3>
                <button type="button" onclick="closeReportModal()" style="background:none;border:none;color:#64748b;font-size:28px;cursor:pointer;line-height:1;padding:4px;">&times;</button>
            </div>
            
            <div style="margin-bottom:16px;padding:12px;background:#f1f5f9;border-radius:10px;font-size:0.85rem;color:#475569;max-height:80px;overflow:hidden;">
                <strong style="color:#0f172a;">${escapeHtml(targetAuthor || 'Inconnu')}</strong>
                <p style="margin-top:4px;">${escapeHtml((targetContent || '').substring(0, 150))}...</p>
            </div>
            
            <p style="font-weight:600;margin-bottom:10px;font-size:0.9rem;color:#0f172a;">Pourquoi signalez-vous ce contenu ?</p>
            
            <div style="display:grid;gap:6px;margin-bottom:16px;">
                ${REPORT_TYPES.map(rt => `
                    <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f1f5f9;border-radius:10px;cursor:pointer;border:1px solid #e2e8f0;transition:all 0.2s ease;font-size:0.85rem;color:#0f172a;"
                        onmouseover="this.style.borderColor='#0284c7'" 
                        onmouseout="this.style.borderColor='#e2e8f0'">
                        <input type="radio" name="reportReason" value="${rt.id}" style="accent-color:#0284c7;width:18px;height:18px;cursor:pointer;">
                        <span>${rt.icon} ${rt.label}</span>
                    </label>
                `).join('')}
            </div>
            
            <div style="margin-bottom:16px;">
                <label style="font-weight:600;font-size:0.85rem;color:#0f172a;display:block;margin-bottom:6px;">Détails supplémentaires (optionnel)</label>
                <textarea id="reportDetails" rows="2" placeholder="Décrivez le problème..." 
                    style="width:100%;padding:10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;color:#0f172a;font-size:0.85rem;resize:vertical;font-family:inherit;outline:none;"></textarea>
            </div>
            
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button type="button" onclick="closeReportModal()" 
                    style="background:#f1f5f9;border:1px solid #e2e8f0;color:#475569;padding:10px 20px;border-radius:25px;cursor:pointer;font-weight:600;font-family:inherit;font-size:0.85rem;">
                    Annuler
                </button>
                <button type="button" onclick="submitReport('${targetType}', ${targetId}, '${escapeHtml(targetAuthor || '')}', '${escapeHtml((targetContent || '').substring(0, 100))}')" 
                    style="background:#dc2626;color:#fff;border:none;padding:10px 20px;border-radius:25px;cursor:pointer;font-weight:600;font-family:inherit;font-size:0.85rem;">
                    <i class="fas fa-paper-plane"></i> Envoyer le signalement
                </button>
            </div>
        </div>
    </div>`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function submitReport(targetType, targetId, targetAuthor, targetContent) {
  const selectedReason = document.querySelector('input[name="reportReason"]:checked');
  if (!selectedReason) {
    if (typeof showToast === 'function') showToast('❌ Veuillez sélectionner un motif', true);
    return;
  }
  
  const details = document.getElementById('reportDetails')?.value?.trim() || '';
  const reasonType = REPORT_TYPES.find(rt => rt.id === selectedReason.value);
  
  const newReport = {
    id: 'rep_' + Date.now(),
    type: selectedReason.value,
    typeLabel: reasonType ? reasonType.label : selectedReason.value,
    targetType: targetType,
    targetId: targetId,
    targetContent: targetContent,
    targetAuthor: targetAuthor,
    reportedBy: (typeof currentUser !== 'undefined' ? currentUser.name : 'Utilisateur'),
    reportedByUsername: (typeof currentUser !== 'undefined' ? currentUser.username : ''),
    details: details,
    status: 'pending',
    timestamp: Date.now()
  };
  
  try {
    const reports = JSON.parse(localStorage.getItem('estra_reports') || '[]');
    reports.unshift(newReport);
    localStorage.setItem('estra_reports', JSON.stringify(reports));
  } catch (e) {}
  
  try {
    const notifications = JSON.parse(localStorage.getItem('estra_notifications') || '[]');
    notifications.unshift({
      id: Date.now() + 2, type: 'report', title: '🚩 Nouveau signalement',
      message: `${newReport.reportedBy} a signalé un ${targetType} de ${targetAuthor}`,
      read: false, timestamp: Date.now(), metadata: { reportId: newReport.id }
    });
    if (notifications.length > 50) notifications.length = 50;
    localStorage.setItem('estra_notifications', JSON.stringify(notifications));
    localStorage.setItem('estra_notification_trigger', Date.now().toString());
  } catch (e) {}
  
  closeReportModal();
  if (typeof showToast === 'function') showToast('✅ Signalement envoyé. Merci !');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function reportPostFromMenu(postId, type) {
  if (typeof activePostMenu !== 'undefined' && activePostMenu) { activePostMenu.remove(); activePostMenu = null; }
  let item;
  if (typeof eventsList !== 'undefined' && type === 'event') item = eventsList.find(e => e.id === postId);
  else if (typeof posts !== 'undefined') item = posts.find(p => p.id === postId);
  if (item) {
    reportContent(type === 'event' ? 'event' : 'post', postId, 
      item.content || item.eventData?.title || '', 
      item.author || item.organizer || 'Inconnu');
  }
}

window.REPORT_TYPES = REPORT_TYPES;
window.reportContent = reportContent;
window.submitReport = submitReport;
window.closeReportModal = closeReportModal;
window.reportPostFromMenu = reportPostFromMenu;