// ==========================================
// ESTRA LINK - SYNCHRONISATION TEMPS RÉEL
// Version : 2.0.0 - Sans rechargement
// ==========================================

window.addEventListener('storage', function(e) {
  
  // ============ CHANGEMENT DE NOM ============
  if (e.key === 'estra_name_updated') {
    try {
      const data = JSON.parse(e.newValue || '{}');
      if (data.oldName && data.newName) {
        
        // Mettre à jour les posts dans localStorage
        const allPosts = JSON.parse(localStorage.getItem('estra_posts') || '[]');
        allPosts.forEach(p => {
          if (p.author === data.oldName || p.authorUsername === data.username) {
            p.author = data.newName;
          }
          if (p.comments) {
            p.comments.forEach(c => {
              if (c.author === data.oldName || c.author === data.username) {
                c.author = data.newName;
              }
            });
          }
        });
        localStorage.setItem('estra_posts', JSON.stringify(allPosts));
        if (typeof posts !== 'undefined') posts = allPosts;
        
        // Mettre à jour les cours
        const allCourses = JSON.parse(localStorage.getItem('estra_courses_v4') || '[]');
        allCourses.forEach(c => {
          if (c.author === data.oldName || c.author === data.username) {
            c.author = data.newName;
          }
        });
        localStorage.setItem('estra_courses_v4', JSON.stringify(allCourses));
        if (typeof courses !== 'undefined') courses = allCourses;
        
        // Mettre à jour les événements
        const allEvents = JSON.parse(localStorage.getItem('estra_events') || '[]');
        allEvents.forEach(e => {
          if (e.organizer === data.oldName || e.organizer === data.username) {
            e.organizer = data.newName;
          }
          if (e.author === data.oldName || e.author === data.username) {
            e.author = data.newName;
          }
        });
        localStorage.setItem('estra_events', JSON.stringify(allEvents));
        if (typeof eventsList !== 'undefined') eventsList = allEvents;
        
        // Mettre à jour les amis
        const allFriends = JSON.parse(localStorage.getItem('estra_friends') || '[]');
        allFriends.forEach(f => { if (f.name === data.oldName) f.name = data.newName; });
        localStorage.setItem('estra_friends', JSON.stringify(allFriends));
        
        // Mettre à jour les conversations
        const allConversations = JSON.parse(localStorage.getItem('estra_conversations') || '[]');
        allConversations.forEach(c => { if (c.name === data.oldName) c.name = data.newName; });
        localStorage.setItem('estra_conversations', JSON.stringify(allConversations));
        
        // Mettre à jour les signalements
        const allReports = JSON.parse(localStorage.getItem('estra_reports') || '[]');
        allReports.forEach(r => {
          if (r.targetAuthor === data.oldName) r.targetAuthor = data.newName;
          if (r.reportedBy === data.oldName) r.reportedBy = data.newName;
        });
        localStorage.setItem('estra_reports', JSON.stringify(allReports));
        
        // 🆕 Mise à jour du DOM sans rechargement
        updateDOMNames(data.oldName, data.newName);
        
        // 🆕 Rafraîchir l'affichage si fonction disponible
        if (typeof renderAllPosts === 'function') renderAllPosts();
        if (typeof renderCourses === 'function') renderCourses();
        if (typeof renderPosts === 'function') renderPosts();
        if (typeof renderConversations === 'function') renderConversations();
        if (typeof updateSidebar === 'function') updateSidebar();
      }
    } catch (err) {
      console.error('Erreur synchronisation nom:', err);
    }
  }
  
  // ============ CHANGEMENT D'AVATAR ============
  if (e.key === 'estra_avatar_updated') {
    try {
      const data = JSON.parse(e.newValue || '{}');
      if (data.username && data.avatar) {
        
        // Mettre à jour les posts
        const allPosts = JSON.parse(localStorage.getItem('estra_posts') || '[]');
        allPosts.forEach(p => {
          if (p.author === data.username || p.author === data.fullName || p.authorUsername === data.username) {
            p.authorAvatar = data.avatar;
          }
          if (p.comments) {
            p.comments.forEach(c => {
              if (c.author === data.username || c.author === data.fullName) {
                c.avatar = data.avatar;
              }
            });
          }
        });
        localStorage.setItem('estra_posts', JSON.stringify(allPosts));
        if (typeof posts !== 'undefined') posts = allPosts;
        
        // Mettre à jour les événements
        const allEvents = JSON.parse(localStorage.getItem('estra_events') || '[]');
        allEvents.forEach(e => {
          if (e.author === data.username || e.organizer === data.username || e.author === data.fullName) {
            e.authorAvatar = data.avatar;
          }
        });
        localStorage.setItem('estra_events', JSON.stringify(allEvents));
        if (typeof eventsList !== 'undefined') eventsList = allEvents;
        
        // Mettre à jour les cours
        const allCourses = JSON.parse(localStorage.getItem('estra_courses_v4') || '[]');
        allCourses.forEach(c => {
          if (c.author === data.username || c.author === data.fullName) {
            c.authorAvatar = data.avatar;
          }
        });
        localStorage.setItem('estra_courses_v4', JSON.stringify(allCourses));
        if (typeof courses !== 'undefined') courses = allCourses;
        
        // 🆕 Mise à jour du DOM sans rechargement
        updateDOMAvatars(data.username, data.avatar, data.fullName);
        
        // 🆕 Rafraîchir l'affichage
        if (typeof renderAllPosts === 'function') renderAllPosts();
        if (typeof renderCourses === 'function') renderCourses();
        if (typeof renderPosts === 'function') renderPosts();
        if (typeof updateSidebar === 'function') updateSidebar();
      }
    } catch (err) {
      console.error('Erreur synchronisation avatar:', err);
    }
  }
  
  // ============ NOUVEAU POST ============
  if (e.key === 'estra_post_trigger') {
    if (typeof posts !== 'undefined') {
      posts = JSON.parse(localStorage.getItem('estra_posts') || '[]');
      if (typeof window.estraPosts !== 'undefined') window.estraPosts = posts;
      if (typeof renderAllPosts === 'function') renderAllPosts();
    }
  }
});

// ============ FONCTIONS DE MISE À JOUR DU DOM ============

function updateDOMNames(oldName, newName) {
  // Posts (home.html, profile.html, group-detail.html, saved.html)
  document.querySelectorAll('.post-author-name').forEach(el => {
    if (el.textContent.trim() === oldName) el.textContent = newName;
  });
  
  // Cours (courses.html)
  document.querySelectorAll('.course-post-name').forEach(el => {
    if (el.textContent.trim().includes(oldName)) {
      el.textContent = el.textContent.replace(oldName, newName);
    }
  });
  
  // Commentaires
  document.querySelectorAll('.comment-author').forEach(el => {
    if (el.textContent.trim() === oldName) el.textContent = newName;
  });
  
  // Sidebar
  const sidebarName = document.getElementById('sidebarName');
  if (sidebarName && sidebarName.textContent.trim() === oldName) {
    sidebarName.textContent = newName;
  }
  
  // Profil
  const profileName = document.getElementById('profileName');
  if (profileName && profileName.textContent.trim() === oldName) {
    profileName.textContent = newName;
  }
  
  // Lightbox
  const lbHeader = document.getElementById('lbHeader');
  if (lbHeader) {
    lbHeader.innerHTML = lbHeader.innerHTML.replace(new RegExp(oldName, 'g'), newName);
  }
  
  // Chat header
  const chatName = document.getElementById('chatName');
  if (chatName && chatName.textContent.trim() === oldName) {
    chatName.textContent = newName;
  }
  
  // Conversations
  document.querySelectorAll('.conv-name').forEach(el => {
    if (el.textContent.trim() === oldName) el.textContent = newName;
  });
  
  // Notifications
  document.querySelectorAll('.notification-text strong').forEach(el => {
    if (el.textContent.trim() === oldName) el.textContent = newName;
  });
  
  // Mentions dans le texte
  document.querySelectorAll('.post-text, .course-post-card').forEach(el => {
    if (el.innerHTML.includes(`Par ${oldName}`)) {
      el.innerHTML = el.innerHTML.replace(`Par ${oldName}`, `Par ${newName}`);
    }
  });
}

function updateDOMAvatars(username, newAvatar, fullName) {
  // Posts
  document.querySelectorAll('.post-avatar').forEach(img => {
    const card = img.closest('.post-card');
    if (card) {
      const nameEl = card.querySelector('.post-author-name');
      if (nameEl && (nameEl.textContent.trim() === username || nameEl.textContent.trim() === fullName)) {
        img.src = newAvatar;
      }
    }
  });
  
  // Cours
  document.querySelectorAll('.course-post-avatar').forEach(img => {
    const card = img.closest('.course-post-card');
    if (card) {
      const nameEl = card.querySelector('.course-post-name');
      if (nameEl && (nameEl.textContent.trim().includes(username) || nameEl.textContent.trim().includes(fullName || ''))) {
        img.src = newAvatar;
      }
    }
  });
  
  // Commentaires
  document.querySelectorAll('.comment-avatar').forEach(img => {
    const item = img.closest('.comment-item');
    if (item) {
      const nameEl = item.querySelector('.comment-author');
      if (nameEl && (nameEl.textContent.trim() === username || nameEl.textContent.trim() === fullName)) {
        img.src = newAvatar;
      }
    }
  });
  
  // Sidebar
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  if (sidebarAvatar) sidebarAvatar.src = newAvatar;
  
  // Navbar
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) navAvatar.src = newAvatar;
  
  // Chat
  const chatAvatar = document.getElementById('chatAvatar');
  if (chatAvatar) chatAvatar.style.backgroundImage = `url('${newAvatar}')`;
  
  // Conversations
  document.querySelectorAll('.conv-avatar').forEach(el => {
    const convItem = el.closest('.conv-item');
    if (convItem) {
      const nameEl = convItem.querySelector('.conv-name');
      if (nameEl && (nameEl.textContent.trim() === username || nameEl.textContent.trim() === fullName)) {
        el.style.backgroundImage = `url('${newAvatar}')`;
      }
    }
  });
  
  // Lightbox
  const lbHeader = document.getElementById('lbHeader');
  if (lbHeader) {
    const lbImg = lbHeader.querySelector('img');
    if (lbImg && (lbHeader.textContent.includes(username) || lbHeader.textContent.includes(fullName || ''))) {
      lbImg.src = newAvatar;
    }
  }
  
  // Créateur de post
  const createPostAvatar = document.getElementById('createPostAvatar');
  if (createPostAvatar) createPostAvatar.src = newAvatar;
}