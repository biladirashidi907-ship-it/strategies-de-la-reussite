// ============================================
// data.js – Centralisation des données avec isolation utilisateur
// ============================================

// ---------- CONSTANTES ----------
const STORAGE_KEYS = {
  PROFILE: 'estra_profile',
  ALL_USERS: 'estra_all_users',
  BADGES: 'estra_badges',
};

// ---------- UTILISATEUR COURANT ----------
function getCurrentUser() {
  const profile = JSON.parse(localStorage.getItem('estra_profile') || '{}');
  if (profile.username) {
    return {
      username: profile.username,
      name: profile.fullName || profile.username,
      avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username)}&background=38bdf8&color=fff&size=80`,
      accountType: profile.accountType || 'student',
      email: profile.email || '',
      badges: profile.badges || []
    };
  }
  const currentUser = JSON.parse(localStorage.getItem('estra_current_user') || '{}');
  if (currentUser.username) {
    return {
      username: currentUser.username,
      name: currentUser.fullName || currentUser.username,
      avatar: currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || currentUser.username)}&background=38bdf8&color=fff&size=80`,
      accountType: currentUser.accountType || 'student',
      email: currentUser.email || '',
      badges: currentUser.badges || []
    };
  }
  return { username: null, name: 'Utilisateur', avatar: 'https://ui-avatars.com/api/?background=38bdf8&color=fff&name=User&size=80', accountType: 'student', email: '', badges: [] };
}

// ---------- PRÉFIXE POUR DONNÉES UTILISATEUR ----------
function getUserPrefix() {
  const user = getCurrentUser();
  return user.username ? `estra_${user.username}_` : 'estra_anon_';
}

// ---------- FONCTIONS D'ACCÈS AUX DONNÉES UTILISATEUR ----------
function getUserData(key, defaultValue = null) {
  const prefix = getUserPrefix();
  const fullKey = prefix + key;
  const value = localStorage.getItem(fullKey);
  if (value === null) {
    if (defaultValue !== null) {
      localStorage.setItem(fullKey, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

function setUserData(key, value) {
  const prefix = getUserPrefix();
  const fullKey = prefix + key;
  localStorage.setItem(fullKey, JSON.stringify(value));
  return value;
}

// ---------- INITIALISATION DES DONNÉES UTILISATEUR À LA CRÉATION ----------
function initializeUserData(username) {
  const tempPrefix = `estra_${username}_`;
  const emptyData = {
    posts: [],
    friends: [],
    groups: [],
    group_posts: {},
    group_likes: {},
    conversations: [],
    notifications: [],
    saved_posts: [],
    saved_courses: [],
    saved_events: [],
    user_groups: []
  };
  Object.keys(emptyData).forEach(key => {
    const fullKey = tempPrefix + key;
    if (!localStorage.getItem(fullKey)) {
      localStorage.setItem(fullKey, JSON.stringify(emptyData[key]));
    }
  });
  console.log('✅ Données initialisées pour :', username);
}

// ---------- FONCTIONS PUBLIQUES ----------
function getAllPosts() {
  return getUserData('posts', []);
}

function setAllPosts(posts) {
  return setUserData('posts', posts);
}

function getAllFriends() {
  return getUserData('friends', []);
}

function setAllFriends(friends) {
  return setUserData('friends', friends);
}

function getAllGroups() {
  return getUserData('groups', []);
}

function setAllGroups(groups) {
  return setUserData('groups', groups);
}

function getUserGroups() {
  return getUserData('user_groups', []);
}

function setUserGroups(groups) {
  return setUserData('user_groups', groups);
}

function getGroupPosts(groupId) {
  const all = getUserData('group_posts', {});
  return all[groupId] || [];
}

function setGroupPosts(groupId, posts) {
  const all = getUserData('group_posts', {});
  all[groupId] = posts;
  return setUserData('group_posts', all);
}

function getGroupLikes() {
  return getUserData('group_likes', {});
}

function setGroupLikes(likes) {
  return setUserData('group_likes', likes);
}

function getConversations() {
  return getUserData('conversations', []);
}

function setConversations(convs) {
  return setUserData('conversations', convs);
}

function getNotifications() {
  return getUserData('notifications', []);
}

function setNotifications(notifs) {
  return setUserData('notifications', notifs);
}

function getSavedPosts() {
  return getUserData('saved_posts', []);
}

function setSavedPosts(posts) {
  return setUserData('saved_posts', posts);
}

function getSavedCourses() {
  return getUserData('saved_courses', []);
}

function setSavedCourses(courses) {
  return setUserData('saved_courses', courses);
}

function getSavedEvents() {
  return getUserData('saved_events', []);
}

function setSavedEvents(events) {
  return setUserData('saved_events', events);
}

// ---------- SYSTÈME DE BADGES (commun à tous) ----------
function getAllBadges() {
  return JSON.parse(localStorage.getItem('estra_badges') || '[]');
}

function getAllUsers() {
  return JSON.parse(localStorage.getItem('estra_all_users') || '[]');
}

function getUserBadges(username) {
  if (!username) return [];
  const users = getAllUsers();
  const user = users.find(u => u.username === username || u.fullName === username);
  return user?.badges || [];
}

function renderUserBadges(badges) {
  if (!badges || badges.length === 0) return '';
  const allBadges = getAllBadges();
  const badgesWithStyle = ['sponsor', 'partner', 'mentor', 'premium', 'teacher', 'recruiter'];
  const withLabel = [];
  const withoutLabel = [];
  badges.forEach(badgeId => {
    const b = allBadges.find(item => item.id === badgeId);
    if (!b) return;
    if (badgesWithStyle.includes(b.id) && b.display !== 'icon') {
      withLabel.push(b);
    } else {
      withoutLabel.push(b);
    }
  });
  const priority = { sponsor: 1, partner: 2, mentor: 3, premium: 4, teacher: 5, recruiter: 6 };
  withLabel.sort((a, b) => (priority[a.id] || 99) - (priority[b.id] || 99));
  const mainBadge = withLabel.length > 0 ? withLabel[0] : null;
  let html = '';
  if (mainBadge) {
    const style = `color:${mainBadge.color}; background:${mainBadge.color}20; border:1px solid ${mainBadge.color}40; padding:3px 10px; border-radius:15px; font-size:0.65rem; font-weight:700; display:inline-flex; align-items:center; gap:4px; margin:0 2px;`;
    html += `<span class="badge-pill" style="${style}"><i class="fas ${mainBadge.icon}"></i> ${mainBadge.name}</span>`;
  }
  withoutLabel.forEach(b => {
    html += `<span class="badge-pill icon-only" style="color:${b.color}; font-size:0.8rem; margin:0 2px; display:inline-flex; align-items:center; gap:3px;" title="${b.desc || b.name}"><i class="fas ${b.icon}"></i></span>`;
  });
  return html;
}

// ---------- SYNCHRONISATION BROADCASTCHANNEL ----------
function estraEmit(type, data = {}) {
  try {
    const channel = new BroadcastChannel('estra_network');
    channel.postMessage({ type, data, timestamp: Date.now() });
  } catch (e) { /* fallback silencieux */ }
}

// ---------- EXPOSITION GLOBALE ----------
window.getCurrentUser = getCurrentUser;
window.getAllPosts = getAllPosts;
window.setAllPosts = setAllPosts;
window.getAllFriends = getAllFriends;
window.setAllFriends = setAllFriends;
window.getAllGroups = getAllGroups;
window.setAllGroups = setAllGroups;
window.getUserGroups = getUserGroups;
window.setUserGroups = setUserGroups;
window.getGroupPosts = getGroupPosts;
window.setGroupPosts = setGroupPosts;
window.getGroupLikes = getGroupLikes;
window.setGroupLikes = setGroupLikes;
window.getConversations = getConversations;
window.setConversations = setConversations;
window.getNotifications = getNotifications;
window.setNotifications = setNotifications;
window.getSavedPosts = getSavedPosts;
window.setSavedPosts = setSavedPosts;
window.getSavedCourses = getSavedCourses;
window.setSavedCourses = setSavedCourses;
window.getSavedEvents = getSavedEvents;
window.setSavedEvents = setSavedEvents;
window.getAllBadges = getAllBadges;
window.getAllUsers = getAllUsers;
window.getUserBadges = getUserBadges;
window.renderUserBadges = renderUserBadges;
window.initializeUserData = initializeUserData;
window.estraEmit = estraEmit;

console.log('✅ data.js (partitionnée par utilisateur) chargée');