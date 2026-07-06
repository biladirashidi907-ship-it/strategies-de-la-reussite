// ============ ESTRA STATS (Compteurs centralisés pour toutes les pages) ============

/**
 * Retourne le nombre total d'amis
 */
function getFriendsCount() {
  const friends = JSON.parse(localStorage.getItem('estra_friends') || '[]');
  return friends.length;
}

/**
 * Retourne le nombre total de binômes
 */
function getBinomesCount() {
  const binomes = JSON.parse(localStorage.getItem('estra_binomes') || '[]');
  return binomes.length;
}

/**
 * Retourne le nombre total de mentors
 */
function getMentorsCount() {
  const mentors = JSON.parse(localStorage.getItem('estra_mentors') || '[]');
  return mentors.length;
}

/**
 * Retourne le nombre total de groupes (userGroups + mentors)
 */
function getGroupsCount() {
  const userGroups = JSON.parse(localStorage.getItem('estra_userGroups') || '[]');
  const mentors = JSON.parse(localStorage.getItem('estra_mentors') || '[]');
  return userGroups.length + mentors.length;
}

/**
 * Retourne le nombre total de posts d'un utilisateur
 * @param {string} authorName - Le nom de l'auteur
 */
function getPostsCount(authorName) {
  const posts = JSON.parse(localStorage.getItem('estra_posts') || '[]');
  const jobs = JSON.parse(localStorage.getItem('estra_jobs') || '[]');
  return posts.filter(p => p.author === authorName).length +
    jobs.filter(j => j.author === authorName).length;
}

/**
 * Met à jour TOUTE la sidebar avec les vrais compteurs
 * @param {object} currentUser - { name, avatar }
 */
function updateSidebarStats(currentUser) {
  // Nom et avatar
  const sidebarName = document.getElementById('sidebarName');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const navAvatar = document.getElementById('navAvatar');
  
  if (sidebarName) sidebarName.textContent = currentUser.name || 'Utilisateur';
  if (sidebarAvatar) sidebarAvatar.src = currentUser.avatar || '';
  if (navAvatar) navAvatar.src = currentUser.avatar || '';
  
  // Compteurs
  const sidebarPosts = document.getElementById('sidebarPosts');
  const sidebarFriends = document.getElementById('sidebarFriends');
  const sidebarGroups = document.getElementById('sidebarGroups');
  
  if (sidebarPosts) sidebarPosts.textContent = getPostsCount(currentUser.name || '');
  if (sidebarFriends) sidebarFriends.textContent = getFriendsCount();
  if (sidebarGroups) sidebarGroups.textContent = getGroupsCount();
}

// Exporter pour usage global
window.getFriendsCount = getFriendsCount;
window.getBinomesCount = getBinomesCount;
window.getMentorsCount = getMentorsCount;
window.getGroupsCount = getGroupsCount;
window.getPostsCount = getPostsCount;
window.updateSidebarStats = updateSidebarStats;

console.log('✅ ESTRA Stats - Compteurs centralisés chargés');