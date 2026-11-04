/**
 * ============================================================================
 * KONFIGURASI API GOOGLE APPS SCRIPT (GOOGLE SHEETS & GOOGLE DRIVE)
 * ============================================================================
 */
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzbZvfG8L7laLP74G76z_EFJfCokvxlTwjUBsAvHXNyAeMVDERNvA5Qa__YQAO3P8Ht/exec";

const IMAGE_MAX_WIDTH = 1280;
const IMAGE_JPEG_QUALITY = 0.75;
const LOCAL_STORAGE_KEY = 'qc_ncr_portal_prod_v1';

const HEROICONS = {
  calendar: '<svg class="icon-sm" style="display:inline-block; vertical-align:text-bottom; margin-right:3px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>',
  wrench: '<svg class="icon-sm" style="display:inline-block; vertical-align:text-bottom; margin-right:2px; color:var(--indigo-600);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" /></svg>',
  pencil: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>',
  trash: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>',
  camera: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>',
  eye: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>',
  checkBadge: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>',
  arrowPath: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>',
  archiveBox: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>',
  lockClosed: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>',
  lockOpen: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>',
  folderOpen: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>',
  docText: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>'
};

let currentRole = null;
let currentUsername = '';

let tempImageList = [];
let tempMasterPhotosAdd = [];
let tempMasterPhotosEdit = [];
let tempMasterDocAdd = null;
let tempMasterDocEdit = null;

let activeLightboxPhotos = [];
let activeLightboxIndex = 0;

let statusFilter = 'ALL';
let searchQuery = '';
let historyFilter = 'ALL';
let historySearchQuery = '';

let products = [];
let selectedProduct = '';
let masterNcrList = [];
let productFollowUps = {};

let users = [
  { id: 1, username: 'admin', password: '123', role: 'admin' }
];

// ================= HELPER TANGGAL & DATA =================
function getTodayIsoDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return dateStr;
}

function normalizeNcrItem(item) {
  if (!item) return item;
  let platform = item.platform || '';
  let title = item.title || '';

  if (!platform && !title && item.part) {
    if (item.part.includes(' — ')) {
      const splitParts = item.part.split(' — ');
      platform = splitParts[0].trim();
      title = splitParts.slice(1).join(' — ').trim();
    } else {
      platform = item.part;
      title = item.part;
    }
  }

  return {
    ...item,
    rawDate: item.rawDate || '',
    date: item.date || formatDisplayDate(item.rawDate) || '-',
    platform: platform || '-',
    title: title || '-',
    part: item.part || (platform && title ? `${platform} — ${title}` : (platform || title || '-')),
    desc: item.desc || '-',
    gdriveLink: item.gdriveLink || '',
    gdriveFileName: item.gdriveFileName || '',
    gdriveFileData: item.gdriveFileData || '',
    masterPhotos: Array.isArray(item.masterPhotos) ? item.masterPhotos : [],
    assignedProducts: Array.isArray(item.assignedProducts) ? item.assignedProducts : []
  };
}

function normalizeAllMasterNcr() {
  masterNcrList = (masterNcrList || []).map(normalizeNcrItem);
}

// ================= SINKRONISASI CLOUD & LOKAL =================
function isCloudConfigured() {
  return Boolean(GAS_API_URL && GAS_API_URL.trim() !== "" && !GAS_API_URL.includes("TEMPEL_URL"));
}

function showCloudLoading(show, text) {
  const el = document.getElementById('cloud-loading');
  const txt = document.getElementById('cloud-loading-text');
  if (text) txt.textContent = text;
  if (show) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      products, users, masterNcrList, productFollowUps
    }));
  } catch (e) {
    console.warn('LocalStorage penuh:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.products)) products = parsed.products;
    if (Array.isArray(parsed.users) && parsed.users.length > 0) users = parsed.users;
    if (Array.isArray(parsed.masterNcrList)) {
      masterNcrList = parsed.masterNcrList;
      normalizeAllMasterNcr();
    }
    if (parsed.productFollowUps && typeof parsed.productFollowUps === 'object') {
      productFollowUps = parsed.productFollowUps;
    }
  } catch (e) {
    console.warn('Gagal membaca LocalStorage:', e);
  }
}

function mergeCloudMasterWithLocalExtras(cloudList, localList) {
  return (cloudList || []).map(cloudItem => {
    const localMatch = (localList || []).find(l => Number(l.id) === Number(cloudItem.id));
    if (localMatch) {
      return normalizeNcrItem({
        ...localMatch,
        ...cloudItem,
        rawDate: cloudItem.rawDate || localMatch.rawDate,
        platform: cloudItem.platform || localMatch.platform,
        title: cloudItem.title || localMatch.title,
        gdriveLink: cloudItem.gdriveLink || localMatch.gdriveLink,
        gdriveFileName: cloudItem.gdriveFileName || localMatch.gdriveFileName,
        gdriveFileData: cloudItem.gdriveFileData || localMatch.gdriveFileData,
        masterPhotos: (Array.isArray(cloudItem.masterPhotos) && cloudItem.masterPhotos.length > 0)
          ? cloudItem.masterPhotos
          : (localMatch.masterPhotos || [])
      });
    }
    return normalizeNcrItem(cloudItem);
  });
}

async function syncFromCloud() {
  const modeBadge = document.getElementById('storage-mode-badge');
  const btnRefresh = document.getElementById('btn-refresh-cloud');

  loadFromLocalStorage();
  const previousLocalMaster = [...masterNcrList];

  if (!isCloudConfigured()) {
    modeBadge.textContent = 'Lokal';
    modeBadge.className = 'badge badge-archived hide-on-small-mobile';
    btnRefresh.classList.add('hidden');
    return;
  }

  modeBadge.innerHTML = '<span class="dot"></span> Cloud';
  modeBadge.className = 'badge badge-closed hide-on-small-mobile';
  btnRefresh.classList.remove('hidden');

  showCloudLoading(true, 'Memuat data...');
  try {
    const res = await fetch(GAS_API_URL);
    const json = await res.json();
    if (json.status === 'success' && json.data) {
      products = json.data.products || [];
      users = (json.data.users && json.data.users.length > 0) ? json.data.users : users;
      masterNcrList = mergeCloudMasterWithLocalExtras(json.data.masterNcrList || [], previousLocalMaster);
      productFollowUps = json.data.productFollowUps || {};
      if (products.length > 0 && !products.some(p => p.name === selectedProduct)) {
        selectedProduct = products[products.length - 1].name;
      } else if (products.length === 0) {
        selectedProduct = '';
      }
      saveToLocalStorage();
      renderProductDropdown();
      renderAllViews();
    }
  } catch (err) {
    console.error('Gagal memuat dari Cloud:', err);
  } finally {
    showCloudLoading(false);
  }
}

async function sendActionToBackend(payload, loadingText) {
  saveToLocalStorage();
  if (!isCloudConfigured()) return;

  const previousLocalMaster = [...masterNcrList];
  showCloudLoading(true, loadingText || 'Menyimpan data...');
  try {
    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.status === 'success' && json.data) {
      products = json.data.products || [];
      users = (json.data.users && json.data.users.length > 0) ? json.data.users : users;
      masterNcrList = mergeCloudMasterWithLocalExtras(json.data.masterNcrList || [], previousLocalMaster);
      productFollowUps = json.data.productFollowUps || {};
      saveToLocalStorage();
      renderProductDropdown();
      renderAllViews();
    } else if (json.status === 'error') {
      alert('Error Server: ' + json.message);
    }
  } catch (err) {
    alert('Koneksi gagal. Data tersimpan di perangkat.');
  } finally {
    showCloudLoading(false);
  }
}

syncFromCloud();
document.getElementById('btn-refresh-cloud').addEventListener('click', syncFromCloud);

function getPhotosArray(followUp) {
  if (!followUp) return [];
  if (Array.isArray(followUp.photos)) return followUp.photos;
  if (followUp.photo) return [followUp.photo];
  return [];
}

// ================= SIDEBAR & NAVIGASI =================
const appLayout = document.getElementById('app-view');
const btnHamburger = document.getElementById('btn-hamburger');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const btnCloseSidebarMobile = document.getElementById('btn-close-sidebar-mobile');

function toggleSidebar() {
  if (window.innerWidth <= 768) {
    appLayout.classList.toggle('mobile-sidebar-open');
  } else {
    appLayout.classList.toggle('sidebar-collapsed');
  }
}

function closeMobileSidebar() {
  appLayout.classList.remove('mobile-sidebar-open');
}

btnHamburger.addEventListener('click', toggleSidebar);
sidebarBackdrop.addEventListener('click', closeMobileSidebar);
btnCloseSidebarMobile.addEventListener('click', closeMobileSidebar);

document.getElementById('form-login').addEventListener('submit', function(e) {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const found = users.find(user => user.username === u && user.password === p);
  if (found) {
    document.getElementById('form-login').reset();
    enterApp(found.role, found.username);
  } else {
    alert('Username atau Password salah!');
  }
});

document.getElementById('btn-logout').addEventListener('click', function() {
  currentRole = null;
  sessionStorage.removeItem('qc_active_role');
  sessionStorage.removeItem('qc_active_user');
  closeMobileSidebar();
  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
});

['history', 'ncr', 'users'].forEach(tabName => {
  const sideBtn = document.getElementById('nav-' + tabName);
  const botBtn = document.getElementById('bnav-' + tabName);
  if (sideBtn) {
    sideBtn.addEventListener('click', function() {
      switchTab(tabName);
      closeMobileSidebar();
    });
  }
  if (botBtn) {
    botBtn.addEventListener('click', function() {
      switchTab(tabName);
      closeMobileSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

document.getElementById('product-select').addEventListener('change', function(e) {
  selectedProduct = e.target.value;
  updateProductStatusUI();
  renderNcrTable();
});

document.querySelectorAll('#unit-filter-pills .pill-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('#unit-filter-pills .pill-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    statusFilter = this.getAttribute('data-filter');
    renderNcrTable();
  });
});

document.getElementById('search-ncr').addEventListener('input', function(e) {
  searchQuery = e.target.value.toLowerCase().trim();
  renderNcrTable();
});

document.querySelectorAll('#history-filter-pills .pill-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('#history-filter-pills .pill-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    historyFilter = this.getAttribute('data-hfilter');
    renderHistoryView();
  });
});

document.getElementById('search-history').addEventListener('input', function(e) {
  historySearchQuery = e.target.value.toLowerCase().trim();
  renderHistoryView();
});

document.getElementById('btn-toggle-archive').addEventListener('click', toggleProductStatus);
document.getElementById('btn-delete-product').addEventListener('click', deleteSelectedProduct);
document.getElementById('btn-add-product').addEventListener('click', function() {
  toggleModal('modal-add-product', true);
});
document.getElementById('btn-add-ncr').addEventListener('click', openAddNcrModal);
document.getElementById('btn-add-ncr-history').addEventListener('click', openAddNcrModal);
document.getElementById('btn-open-add-user').addEventListener('click', function() {
  toggleModal('modal-add-user', true);
});
document.getElementById('btn-select-active').addEventListener('click', selectAllActiveProducts);
document.getElementById('btn-unselect-all').addEventListener('click', unselectAllProducts);

function enterApp(role, username) {
  currentRole = role;
  currentUsername = username || role;

  sessionStorage.setItem('qc_active_role', currentRole);
  sessionStorage.setItem('qc_active_user', currentUsername);

  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');

  const badge = document.getElementById('role-badge');
  const navUsers = document.getElementById('nav-users');
  const bnavUsers = document.getElementById('bnav-users');
  const btnAddNcr = document.getElementById('btn-add-ncr');
  const btnAddNcrHistory = document.getElementById('btn-add-ncr-history');
  const btnAddProduct = document.getElementById('btn-add-product');
  const btnToggleArchive = document.getElementById('btn-toggle-archive');
  const btnDeleteProduct = document.getElementById('btn-delete-product');

  document.getElementById('sidebar-username').textContent = currentUsername;
  document.getElementById('sidebar-avatar').textContent = currentUsername.substring(0, 2).toUpperCase();

  if (role === 'admin') {
    badge.innerHTML = '<span class="dot" style="background:var(--indigo-500)"></span> ADMIN';
    badge.className = 'badge badge-indigo';
    document.getElementById('sidebar-role-text').textContent = 'Admin QC';
    navUsers.classList.remove('hidden');
    bnavUsers.classList.remove('hidden');
    btnAddNcr.classList.remove('hidden');
    btnAddNcrHistory.classList.remove('hidden');
    btnAddProduct.classList.remove('hidden');
    btnToggleArchive.classList.remove('hidden');
    btnDeleteProduct.classList.remove('hidden');
  } else {
    badge.innerHTML = '<span class="dot" style="background:var(--emerald-500)"></span> INSPECTOR';
    badge.className = 'badge badge-closed';
    document.getElementById('sidebar-role-text').textContent = 'Inspector';
    navUsers.classList.add('hidden');
    bnavUsers.classList.add('hidden');
    btnAddNcr.classList.add('hidden');
    btnAddNcrHistory.classList.add('hidden');
    btnAddProduct.classList.add('hidden');
    btnToggleArchive.classList.add('hidden');
    btnDeleteProduct.classList.add('hidden');
  }

  switchTab('history');
  renderProductDropdown();
  renderAllViews();
}

function renderAllViews() {
  normalizeAllMasterNcr();
  renderHistoryView();
  renderNcrTable();
  renderUserTable();
  document.getElementById('nav-history-badge').textContent = masterNcrList.length;
  document.getElementById('bnav-history-badge').textContent = masterNcrList.length;
}

function renderProductDropdown() {
  const select = document.getElementById('product-select');
  select.innerHTML = '';

  if (products.length === 0) {
    selectedProduct = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- Belum Ada Unit --';
    select.appendChild(opt);
    select.disabled = true;
    updateProductStatusUI();
    return;
  }

  select.disabled = false;
  if (!selectedProduct || !products.some(p => p.name === selectedProduct)) {
    selectedProduct = products[products.length - 1].name;
  }

  products.forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod.name;
    opt.textContent = prod.status === 'archived'
      ? '[ARSIP] ' + prod.name
      : '[AKTIF] ' + prod.name;
    if (prod.name === selectedProduct) opt.selected = true;
    select.appendChild(opt);
  });
  updateProductStatusUI();
}

function updateProductStatusUI() {
  const prodObj = products.find(p => p.name === selectedProduct);
  const btnToggle = document.getElementById('btn-toggle-archive');
  const btnDelete = document.getElementById('btn-delete-product');
  const statName = document.getElementById('stat-product-name');
  const statState = document.getElementById('stat-product-state');

  if (!prodObj) {
    statName.textContent = 'Belum Ada';
    statState.innerHTML = '<span class="badge badge-archived">Kosong</span>';
    btnToggle.classList.add('hidden');
    btnDelete.classList.add('hidden');
    return;
  }

  statName.textContent = prodObj.name;

  if (prodObj.status === 'archived') {
    statState.innerHTML = '<span class="badge badge-archived">Arsip</span>';
    btnToggle.innerHTML = HEROICONS.lockOpen + ' <span>Aktifkan</span>';
    btnToggle.className = 'btn btn-outline';
  } else {
    statState.innerHTML = '<span class="badge badge-closed"><span class="dot"></span> Aktif</span>';
    btnToggle.innerHTML = HEROICONS.lockClosed + ' <span>Arsipkan</span>';
    btnToggle.className = 'btn btn-amber-soft';
  }

  if (currentRole === 'admin') {
    btnToggle.classList.remove('hidden');
    btnDelete.classList.remove('hidden');
  } else {
    btnToggle.classList.add('hidden');
    btnDelete.classList.add('hidden');
  }
}

async function toggleProductStatus() {
  const prodObj = products.find(p => p.name === selectedProduct);
  if (!prodObj) return;
  if (prodObj.status === 'active') {
    if (!confirm('Arsipkan unit "' + selectedProduct + '"?')) return;
    prodObj.status = 'archived';
  } else {
    prodObj.status = 'active';
  }
  renderProductDropdown();
  renderAllViews();

  await sendActionToBackend({
    action: 'TOGGLE_PRODUCT_STATUS',
    name: prodObj.name,
    status: prodObj.status
  }, 'Memperbarui status unit...');
}

async function deleteSelectedProduct() {
  const prodObj = products.find(p => p.name === selectedProduct);
  if (!prodObj) return;

  const targetName = prodObj.name;
  if (!confirm('Hapus unit "' + targetName + '"? Data Master NCR tetap aman.')) {
    return;
  }

  products = products.filter(p => p.name !== targetName);

  masterNcrList.forEach(ncr => {
    if (Array.isArray(ncr.assignedProducts)) {
      ncr.assignedProducts = ncr.assignedProducts.filter(pName => pName !== targetName);
    }
  });

  Object.keys(productFollowUps).forEach(key => {
    if (key.startsWith(targetName + '_')) {
      delete productFollowUps[key];
    }
  });

  selectedProduct = products.length > 0 ? products[products.length - 1].name : '';
  renderProductDropdown();
  renderAllViews();

  await sendActionToBackend({
    action: 'DELETE_PRODUCT',
    name: targetName
  }, 'Menghapus unit...');
}

document.getElementById('form-add-product').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('new-product-name').value.trim();
  const inherit = document.getElementById('inherit-ncr').checked;

  if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    alert('Nama unit sudah ada!');
    return;
  }

  if (name) {
    const lastActiveProd = [...products].reverse().find(p => p.status === 'active');
    const lastActiveName = lastActiveProd ? lastActiveProd.name : null;

    products.push({ name: name, status: 'active' });

    if (inherit) {
      masterNcrList.forEach(ncr => {
        if (lastActiveName) {
          if (ncr.assignedProducts.includes(lastActiveName) || ncr.assignedProducts.length === 0) {
            if (!ncr.assignedProducts.includes(name)) ncr.assignedProducts.push(name);
          }
        } else {
          if (!ncr.assignedProducts.includes(name)) {
            ncr.assignedProducts.push(name);
          }
        }
      });
    }

    selectedProduct = name;
    renderProductDropdown();
    renderAllViews();

    e.target.reset();
    document.getElementById('inherit-ncr').checked = true;
    toggleModal('modal-add-product', false);

    await sendActionToBackend({
      action: 'ADD_PRODUCT',
      name: name,
      inherit: inherit,
      lastActiveProd: lastActiveName
    }, 'Menambahkan unit...');
  }
});

function getProductIndex(prodName) {
  return products.findIndex(p => p.name === prodName);
}

function buildThumbnailsHtml(photos, prodIdx, ncrId) {
  if (!photos || photos.length === 0) return '';
  const maxVisible = 3;
  let html = '<div class="multi-thumb-group">';
  photos.slice(0, maxVisible).forEach((src, idx) => {
    html += '<img src="' + src + '" class="thumb-img" onclick="openLightboxByIndex(' + prodIdx + ', ' + ncrId + ', ' + idx + ')">';
  });
  if (photos.length > maxVisible) {
    const extra = photos.length - maxVisible;
    html += '<div class="thumb-more-badge" onclick="openLightboxByIndex(' + prodIdx + ', ' + ncrId + ', ' + maxVisible + ')">+' + extra + '</div>';
  }
  html += '</div>';
  return html;
}

function buildMasterPhotosHtml(ncr) {
  const photos = ncr.masterPhotos || [];
  if (photos.length === 0) return '';
  const maxVisible = 3;
  let html = '<div style="margin-top:6px;"><div style="font-size:11px; font-weight:700; color:var(--slate-400); margin-bottom:3px;">Foto NCR (' + photos.length + '):</div><div class="multi-thumb-group">';
  photos.slice(0, maxVisible).forEach((src, idx) => {
    html += '<img src="' + src + '" class="thumb-img" onclick="openMasterLightbox(' + ncr.id + ', ' + idx + ')">';
  });
  if (photos.length > maxVisible) {
    const extra = photos.length - maxVisible;
    html += '<div class="thumb-more-badge" onclick="openMasterLightbox(' + ncr.id + ', ' + maxVisible + ')">+' + extra + '</div>';
  }
  html += '</div></div>';
  return html;
}

function buildGdriveDocHtml(ncr) {
  if (ncr.gdriveLink) {
    return '<div><a href="' + ncr.gdriveLink + '" target="_blank" rel="noopener" class="gdrive-folder-link">' +
      HEROICONS.docText + ' <span>File GDrive</span></a></div>';
  }
  if (ncr.gdriveFileData) {
    const fileName = ncr.gdriveFileName || 'File_NCR';
    return '<div><a href="' + ncr.gdriveFileData + '" download="' + fileName + '" class="gdrive-folder-link">' +
      HEROICONS.docText + ' <span>Unduh File</span></a></div>';
  }
  return '';
}

// ================= RENDER HISTORY NCR =================
function renderHistoryView() {
  const tbody = document.getElementById('history-table-body');
  tbody.innerHTML = '';

  let totalMaster = masterNcrList.length;
  let totalInstances = 0;
  let totalClosedInstances = 0;

  masterNcrList.forEach(item => {
    item.assignedProducts.forEach(prodName => {
      totalInstances++;
      const key = prodName + '_' + item.id;
      if (productFollowUps[key] && productFollowUps[key].status === 'CLOSED') {
        totalClosedInstances++;
      }
    });
  });

  let totalOpenInstances = totalInstances - totalClosedInstances;
  let globalRate = totalInstances > 0 ? Math.round((totalClosedInstances / totalInstances) * 100) : 0;

  document.getElementById('hist-stat-master').textContent = totalMaster;
  document.getElementById('hist-stat-instances').textContent = totalInstances;
  document.getElementById('hist-stat-open').textContent = totalOpenInstances;
  document.getElementById('hist-stat-closed').textContent = totalClosedInstances;
  document.getElementById('hist-stat-rate').textContent = globalRate + '% Selesai';

  if (masterNcrList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px; color: var(--slate-400);">Belum ada Master NCR.</td></tr>';
    return;
  }

  const filteredHistory = masterNcrList.filter(item => {
    let closedUnits = 0;
    item.assignedProducts.forEach(pName => {
      const k = pName + '_' + item.id;
      if (productFollowUps[k] && productFollowUps[k].status === 'CLOSED') closedUnits++;
    });
    const isComplete = (item.assignedProducts.length > 0) && (closedUnits === item.assignedProducts.length);

    const matchFilter =
      (historyFilter === 'ALL') ||
      (historyFilter === 'COMPLETE' && isComplete) ||
      (historyFilter === 'INCOMPLETE' && !isComplete);

    const matchSearch = !historySearchQuery ||
      item.no.toLowerCase().includes(historySearchQuery) ||
      item.platform.toLowerCase().includes(historySearchQuery) ||
      item.title.toLowerCase().includes(historySearchQuery) ||
      item.desc.toLowerCase().includes(historySearchQuery) ||
      item.assignedProducts.some(p => {
        const k = p + '_' + item.id;
        const noteText = (productFollowUps[k] && productFollowUps[k].note) ? productFollowUps[k].note.toLowerCase() : '';
        return p.toLowerCase().includes(historySearchQuery) || noteText.includes(historySearchQuery);
      });

    return matchFilter && matchSearch;
  });

  if (filteredHistory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 28px; color: var(--slate-400);">Data tidak ditemukan.</td></tr>';
    return;
  }

  filteredHistory.forEach((item, index) => {
    let closedCount = 0;
    let unitCardsHtml = '';

    if (item.assignedProducts.length === 0) {
      unitCardsHtml =
        '<div style="padding:10px; border-radius:8px; border:1px dashed var(--slate-300); background:var(--slate-50); color:var(--slate-500); font-size:12.5px;">' +
          'Belum ada unit. ' +
          (currentRole === 'admin' ? '<button type="button" class="link-action-btn" onclick="openEditNcrModal(' + item.id + ')">Pilih Unit &rarr;</button>' : '') +
        '</div>';
    } else {
      unitCardsHtml = '<div class="history-unit-list">';
      item.assignedProducts.forEach(prodName => {
        const prodIdx = getProductIndex(prodName);
        const prodObj = products[prodIdx];
        const prodStateBadge = (prodObj && prodObj.status === 'archived')
          ? '<span style="font-size:10px; color:var(--slate-500); background:var(--slate-200); padding:1px 5px; border-radius:4px;">Arsip</span>'
          : '';

        const key = prodName + '_' + item.id;
        const followUp = productFollowUps[key] || { status: 'OPEN', photos: [], note: '', folderUrl: '' };
        const photos = getPhotosArray(followUp);

        if (followUp.status === 'CLOSED') {
          closedCount++;
          const driveLinkHtml = followUp.folderUrl
            ? '<a href="' + followUp.folderUrl + '" target="_blank" rel="noopener" class="gdrive-folder-link">' + HEROICONS.folderOpen + ' <span>GDrive</span></a>'
            : '';

          unitCardsHtml +=
            '<div class="history-unit-card is-closed">' +
              '<div style="min-width:0; flex:1;">' +
                '<div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">' +
                  '<span style="font-weight:700; font-size:13px; color:var(--slate-900);">' + prodName + '</span>' +
                  prodStateBadge +
                  '<span class="badge badge-closed" style="padding:1px 6px; font-size:10.5px;">CLOSED (' + photos.length + ')</span>' +
                '</div>' +
                '<div style="font-size:12px; color:var(--slate-600); margin-top:3px;">' +
                  (followUp.note || 'OK') +
                '</div>' +
                driveLinkHtml +
              '</div>' +
              buildThumbnailsHtml(photos, prodIdx, item.id) +
            '</div>';
        } else {
          unitCardsHtml +=
            '<div class="history-unit-card is-open">' +
              '<div style="min-width:0; flex:1;">' +
                '<div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">' +
                  '<span style="font-weight:700; font-size:13px; color:var(--slate-900);">' + prodName + '</span>' +
                  prodStateBadge +
                  '<span class="badge badge-open" style="padding:1px 6px; font-size:10.5px;">OPEN</span>' +
                '</div>' +
                '<div style="font-size:11.5px; color:var(--rose-600); margin-top:2px;">Belum dicek</div>' +
              '</div>' +
            '</div>';
        }
      });
      unitCardsHtml += '</div>';
    }

    const totalAssigned = item.assignedProducts.length;
    const openAssigned = totalAssigned - closedCount;
    const pct = totalAssigned > 0 ? Math.round((closedCount / totalAssigned) * 100) : 0;
    const barColor = totalAssigned === 0 ? 'var(--slate-300)' : (pct === 100 ? 'var(--emerald-500)' : (pct > 0 ? 'var(--indigo-500)' : 'var(--rose-500)'));

    let globalStatusBadge = '';
    if (totalAssigned === 0) {
      globalStatusBadge = '<span class="badge badge-archived">Tanpa Unit</span>';
    } else if (pct === 100) {
      globalStatusBadge = '<span class="badge badge-closed">CLOSED</span>';
    } else {
      globalStatusBadge = '<span class="badge badge-open">OPEN (' + openAssigned + ')</span>';
    }

    const adminQuickEditHtml = currentRole === 'admin'
      ? '<div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-outline btn-sm" onclick="openEditNcrModal(' + item.id + ')">' + HEROICONS.pencil + ' <span>Edit</span></button>' +
          '<button type="button" class="btn btn-rose-soft btn-sm" onclick="deleteNcr(' + item.id + ')">' + HEROICONS.trash + ' <span>Hapus</span></button>' +
        '</div>'
      : '';

    const progressHtml =
      '<div class="progress-wrap">' +
        '<div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:var(--slate-800);">' +
          '<span>' + closedCount + '/' + totalAssigned + ' Unit</span>' +
          '<span>' + pct + '%</span>' +
        '</div>' +
        '<div class="progress-bar-bg">' +
          '<div class="progress-bar-fill" style="width:' + pct + '%; background:' + barColor + ';"></div>' +
        '</div>' +
      '</div>';

    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' +
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap; margin-bottom:4px;">' +
          '<span style="font-size:10.5px; font-weight:800; color:var(--indigo-600); background:var(--indigo-50); padding:2px 6px; border-radius:4px;">#' + (masterNcrList.length - index) + '</span>' +
          globalStatusBadge +
        '</div>' +
        '<div style="font-weight:800; font-size:14.5px; color:var(--slate-900);">' + item.no + '</div>' +
        '<div style="font-size:12px; color:var(--slate-500); margin-top:2px;">' + HEROICONS.calendar + item.date + '</div>' +
        buildGdriveDocHtml(item) +
        adminQuickEditHtml +
      '</td>' +
      '<td data-label="Platform, Title & Deskripsi">' +
        '<div class="platform-tag">' + HEROICONS.wrench + ' <span>' + item.platform + '</span></div>' +
        '<div class="issue-title-text">' + item.title + '</div>' +
        '<div class="issue-desc-text">' + item.desc + '</div>' +
        buildMasterPhotosHtml(item) +
      '</td>' +
      '<td data-label="Progress Unit">' + progressHtml + '</td>' +
      '<td data-label="Status per Unit">' + unitCardsHtml + '</td>';
    tbody.appendChild(tr);
  });
}

// ================= RENDER MONITORING PER UNIT =================
function renderNcrTable() {
  const tbody = document.getElementById('ncr-table-body');
  tbody.innerHTML = '';

  if (products.length === 0 || !selectedProduct) {
    document.getElementById('stat-total-ncr').textContent = 0;
    document.getElementById('stat-open-ncr').textContent = 0;
    document.getElementById('stat-closed-ncr').textContent = 0;
    document.getElementById('stat-progress-pct').textContent = '0% Selesai';
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--slate-500);">' +
        'Belum ada unit dipilih. Anda tetap bisa langsung klik <b>Tambah Master NCR</b> atau buat <b>Unit Baru</b>.' +
      '</td></tr>';
    return;
  }

  const allProductNcr = masterNcrList.filter(item => item.assignedProducts.includes(selectedProduct));
  let totalCount = allProductNcr.length;
  let closedCount = 0;

  allProductNcr.forEach(item => {
    const key = selectedProduct + '_' + item.id;
    const followUp = productFollowUps[key];
    if (followUp && followUp.status === 'CLOSED') closedCount++;
  });

  let openCount = totalCount - closedCount;
  let pct = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0;

  document.getElementById('stat-total-ncr').textContent = totalCount;
  document.getElementById('stat-open-ncr').textContent = openCount;
  document.getElementById('stat-closed-ncr').textContent = closedCount;
  document.getElementById('stat-progress-pct').textContent = pct + '% Selesai';

  const displayedNcr = allProductNcr.filter(item => {
    const key = selectedProduct + '_' + item.id;
    const followUp = productFollowUps[key] || { status: 'OPEN', photos: [], note: '' };
    const matchStatus = (statusFilter === 'ALL') || (followUp.status === statusFilter);
    const matchSearch = !searchQuery ||
      item.no.toLowerCase().includes(searchQuery) ||
      item.platform.toLowerCase().includes(searchQuery) ||
      item.title.toLowerCase().includes(searchQuery) ||
      item.desc.toLowerCase().includes(searchQuery);
    return matchStatus && matchSearch;
  });

  if (displayedNcr.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 28px; color: var(--slate-400);">Tidak ada NCR pada unit <b>' + selectedProduct + '</b>.</td></tr>';
    return;
  }

  const currentProdIdx = getProductIndex(selectedProduct);

  displayedNcr.forEach(item => {
    const key = selectedProduct + '_' + item.id;
    const followUp = productFollowUps[key] || { status: 'OPEN', photos: [], note: '', folderUrl: '' };
    const photos = getPhotosArray(followUp);
    const isClosed = followUp.status === 'CLOSED';

    const statusBadge = !isClosed
      ? '<span class="badge badge-open"><span class="dot"></span> OPEN</span>'
      : '<span class="badge badge-closed"><span class="dot"></span> CLOSED (' + photos.length + ')</span>' +
        (followUp.updatedAt ? '<div style="font-size:11px; color:var(--slate-400); margin-top:3px;">' + followUp.updatedAt + '</div>' : '');

    const driveFolderBtn = followUp.folderUrl
      ? '<div><a href="' + followUp.folderUrl + '" target="_blank" rel="noopener" class="gdrive-folder-link">' + HEROICONS.folderOpen + ' <span>GDrive</span></a></div>'
      : '';

    const photoCell = photos.length > 0
      ? '<div class="thumb-wrapper">' +
          buildThumbnailsHtml(photos, currentProdIdx, item.id) +
          '<div style="flex:1; min-width:110px;">' +
            '<div style="font-size:12.5px; color:var(--slate-700); font-weight:600;">' + followUp.note + '</div>' +
            '<div style="font-size:11.5px; color:var(--indigo-600); cursor:pointer; font-weight:700; margin-top:3px;" onclick="openLightboxByIndex(' + currentProdIdx + ', ' + item.id + ', 0)">Galeri (' + photos.length + ') &rarr;</div>' +
            driveFolderBtn +
          '</div>' +
        '</div>'
      : '<span style="font-size:12px; color:var(--slate-400);">Belum ada foto</span>';

    const targetBadgeHtml = '<span class="badge badge-indigo">' + item.assignedProducts.length + ' Unit</span>';

    let actionBtn = '';
    if (currentRole === 'admin') {
      actionBtn =
        '<div class="mobile-action-group" style="display:inline-flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">' +
          (isClosed
            ? '<button type="button" class="btn btn-emerald-soft btn-sm" onclick="openLightboxByIndex(' + currentProdIdx + ', ' + item.id + ', 0)">' + HEROICONS.eye + ' <span>Bukti</span></button>' +
              '<button type="button" class="btn btn-amber-soft btn-sm" onclick="reopenUnitNcr(' + item.id + ')">' + HEROICONS.arrowPath + ' <span>Re-Open</span></button>'
            : '') +
          '<button type="button" class="btn btn-outline btn-sm" onclick="openEditNcrModal(' + item.id + ')">' + HEROICONS.pencil + ' <span>Edit</span></button>' +
          '<button type="button" class="btn btn-rose-soft btn-sm" onclick="deleteNcr(' + item.id + ')">' + HEROICONS.trash + ' <span>Hapus</span></button>' +
        '</div>';
    } else {
      if (!isClosed) {
        actionBtn =
          '<div class="mobile-action-group" style="display:inline-flex; justify-content:flex-end;">' +
            '<button type="button" class="btn btn-emerald btn-sm" onclick="openUploadModal(' + item.id + ')">' +
              HEROICONS.camera + ' <span>Upload Foto</span>' +
            '</button>' +
          '</div>';
      } else {
        actionBtn =
          '<div class="mobile-action-group" style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">' +
            '<button type="button" class="btn btn-outline btn-sm" onclick="openLightboxByIndex(' + currentProdIdx + ', ' + item.id + ', 0)">' +
              HEROICONS.eye + ' <span>Lihat Foto (' + photos.length + ')</span>' +
            '</button>' +
          '</div>';
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' +
        '<div style="font-weight:800; font-size:14.5px; color:var(--slate-900);">' + item.no + '</div>' +
        '<div style="font-size:12px; color:var(--slate-500); margin-top:2px;">' + HEROICONS.calendar + item.date + '</div>' +
        buildGdriveDocHtml(item) +
      '</td>' +
      '<td data-label="Platform & Title">' +
        '<div class="platform-tag">' + HEROICONS.wrench + ' <span>' + item.platform + '</span></div>' +
        '<div class="issue-title-text">' + item.title + '</div>' +
      '</td>' +
      '<td data-label="Deskripsi & Foto NCR">' +
        '<div class="issue-desc-text">' + item.desc + '</div>' +
        buildMasterPhotosHtml(item) +
      '</td>' +
      '<td data-label="Cakupan">' + targetBadgeHtml + '</td>' +
      '<td data-label="Status">' + statusBadge + '</td>' +
      '<td data-label="Bukti Inspector">' + photoCell + '</td>' +
      '<td class="text-right">' + actionBtn + '</td>';
    tbody.appendChild(tr);
  });
}

window.reopenUnitNcr = async function(ncrId) {
  if (confirm('Ubah status kembali menjadi OPEN pada "' + selectedProduct + '"?')) {
    const key = selectedProduct + '_' + ncrId;
    delete productFollowUps[key];
    renderAllViews();

    await sendActionToBackend({
      action: 'REOPEN_NCR',
      productName: selectedProduct,
      ncrId: ncrId
    }, 'Mereset status...');
  }
};

// ================= LIGHTBOX GALERI FOTO =================
window.openLightboxByIndex = function(prodIdx, ncrId, startPhotoIndex) {
  const prodObj = products[prodIdx];
  if (!prodObj) return;
  const prodName = prodObj.name;
  const ncr = masterNcrList.find(i => i.id === ncrId);
  const key = prodName + '_' + ncrId;
  const followUp = productFollowUps[key];
  const photos = getPhotosArray(followUp);
  if (photos.length === 0) return;

  activeLightboxPhotos = photos;
  activeLightboxIndex = startPhotoIndex || 0;

  document.getElementById('lightbox-title').textContent = (ncr ? ncr.no : '') + ' — ' + prodName;
  document.getElementById('lightbox-note').textContent = 'Catatan: "' + (followUp.note || '-') + '"';
  document.getElementById('lightbox-meta').textContent =
    (followUp.inspector ? 'Inspector: ' + followUp.inspector : '') +
    (followUp.updatedAt ? ' • ' + followUp.updatedAt : '');

  updateLightboxSlide();
  toggleModal('modal-lightbox', true);
};

window.openMasterLightbox = function(ncrId, startPhotoIndex) {
  const ncr = masterNcrList.find(i => i.id === ncrId);
  if (!ncr || !ncr.masterPhotos || ncr.masterPhotos.length === 0) return;

  activeLightboxPhotos = ncr.masterPhotos;
  activeLightboxIndex = startPhotoIndex || 0;

  document.getElementById('lightbox-title').textContent = 'Foto NCR — ' + ncr.no;
  document.getElementById('lightbox-note').textContent = ncr.platform + ' • ' + ncr.title;
  document.getElementById('lightbox-meta').textContent = ncr.desc;

  updateLightboxSlide();
  toggleModal('modal-lightbox', true);
};

window.stepLightbox = function(dir) {
  if (activeLightboxPhotos.length <= 1) return;
  activeLightboxIndex = (activeLightboxIndex + dir + activeLightboxPhotos.length) % activeLightboxPhotos.length;
  updateLightboxSlide();
};

window.selectLightboxSlide = function(idx) {
  activeLightboxIndex = idx;
  updateLightboxSlide();
};

function updateLightboxSlide() {
  const total = activeLightboxPhotos.length;
  document.getElementById('lightbox-img').src = activeLightboxPhotos[activeLightboxIndex];
  document.getElementById('lightbox-counter').textContent = 'Foto ' + (activeLightboxIndex + 1) + ' / ' + total;

  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');
  if (total > 1) {
    btnPrev.classList.remove('hidden');
    btnNext.classList.remove('hidden');
  } else {
    btnPrev.classList.add('hidden');
    btnNext.classList.add('hidden');
  }

  const thumbsContainer = document.getElementById('lightbox-thumbs');
  thumbsContainer.innerHTML = '';
  if (total > 1) {
    activeLightboxPhotos.forEach((src, idx) => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'lightbox-thumb-item' + (idx === activeLightboxIndex ? ' active' : '');
      img.onclick = function() { selectLightboxSlide(idx); };
      thumbsContainer.appendChild(img);
    });
  }
}

let touchStartX = 0;
const lightboxStageEl = document.getElementById('lightbox-stage');
if (lightboxStageEl) {
  lightboxStageEl.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxStageEl.addEventListener('touchend', function(e) {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) stepLightbox(1);
      else stepLightbox(-1);
    }
  }, { passive: true });
}

// ================= MODAL TAMBAH & EDIT MASTER NCR =================
function renderProductChecklistHtml(containerId, inputName, selectedProdArray) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML =
      '<div style="padding:8px; font-size:12.5px; color:var(--slate-500);">' +
        'Belum ada unit produk. Anda tetap bisa langsung klik <b>Simpan Master NCR</b>.' +
      '</div>';
    return;
  }

  products.forEach(prod => {
    const isChecked = selectedProdArray.includes(prod.name) ? 'checked' : '';
    const badgeHtml = prod.status === 'archived'
      ? '<span class="badge badge-archived">Arsip</span>'
      : '<span class="badge badge-closed">Aktif</span>';

    const label = document.createElement('label');
    label.className = 'checklist-row';
    label.innerHTML =
      '<div style="display:flex; align-items:center; gap:8px; min-width:0;">' +
        '<input type="checkbox" name="' + inputName + '" value="' + prod.name + '" ' + isChecked + ' style="width:17px; height:17px; flex-shrink:0;"> ' +
        '<span style="font-size:13px; font-weight:600; color:var(--slate-800); word-break:break-word;">' + prod.name + '</span>' +
      '</div>' +
      badgeHtml;
    container.appendChild(label);
  });
}

function openAddNcrModal() {
  document.getElementById('form-add-ncr').reset();
  document.getElementById('ncr-date').value = getTodayIsoDate();

  tempMasterPhotosAdd = [];
  tempMasterDocAdd = null;
  document.getElementById('ncr-gdrive-file-info').textContent = 'Belum ada file';
  document.getElementById('btn-clear-ncr-file').classList.add('hidden');
  renderMasterPhotoPreview('add');

  const defaultActiveProds = products.filter(p => p.status === 'active').map(p => p.name);
  renderProductChecklistHtml('ncr-product-checklist', 'ncr-target-prod', defaultActiveProds);

  toggleModal('modal-add-ncr', true);
}

function selectAllActiveProducts() {
  const checkboxes = document.querySelectorAll('input[name="ncr-target-prod"]');
  checkboxes.forEach(cb => {
    const prodObj = products.find(p => p.name === cb.value);
    cb.checked = Boolean(prodObj && prodObj.status === 'active');
  });
}

function unselectAllProducts() {
  const checkboxes = document.querySelectorAll('input[name="ncr-target-prod"]');
  checkboxes.forEach(cb => { cb.checked = false; });
}

function readDocFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve({ name: file.name, dataUrl: e.target.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('ncr-gdrive-file').addEventListener('change', async function() {
  if (!this.files || !this.files[0]) return;
  const file = this.files[0];
  try {
    tempMasterDocAdd = await readDocFileAsDataUrl(file);
    document.getElementById('ncr-gdrive-file-info').textContent = file.name;
    document.getElementById('btn-clear-ncr-file').classList.remove('hidden');
  } catch (err) {
    alert('Gagal membaca file.');
  }
});

document.getElementById('btn-clear-ncr-file').addEventListener('click', function() {
  tempMasterDocAdd = null;
  document.getElementById('ncr-gdrive-file').value = '';
  document.getElementById('ncr-gdrive-file-info').textContent = 'Belum ada file';
  this.classList.add('hidden');
});

document.getElementById('edit-ncr-gdrive-file').addEventListener('change', async function() {
  if (!this.files || !this.files[0]) return;
  const file = this.files[0];
  try {
    tempMasterDocEdit = await readDocFileAsDataUrl(file);
    document.getElementById('edit-ncr-gdrive-file-info').textContent = file.name;
    document.getElementById('btn-clear-edit-ncr-file').classList.remove('hidden');
  } catch (err) {
    alert('Gagal membaca file.');
  }
});

document.getElementById('btn-clear-edit-ncr-file').addEventListener('click', function() {
  tempMasterDocEdit = null;
  document.getElementById('edit-ncr-gdrive-file').value = '';
  document.getElementById('edit-ncr-gdrive-file-info').textContent = 'Belum ada file';
  this.classList.add('hidden');
});

async function handleMasterPhotoSelection(fileInputEl, mode) {
  const files = Array.from(fileInputEl.files || []);
  if (!files.length) return;
  try {
    const compressedList = await Promise.all(files.map(f => compressAndResizeImage(f)));
    compressedList.forEach(item => {
      if (mode === 'add') tempMasterPhotosAdd.push(item.dataUrl);
      else tempMasterPhotosEdit.push(item.dataUrl);
    });
    renderMasterPhotoPreview(mode);
  } catch (err) {
    alert('Gagal memproses foto.');
  }
  fileInputEl.value = '';
}

document.getElementById('master-foto-camera').addEventListener('change', function() {
  handleMasterPhotoSelection(this, 'add');
});
document.getElementById('master-foto-gallery').addEventListener('change', function() {
  handleMasterPhotoSelection(this, 'add');
});
document.getElementById('edit-master-foto-camera').addEventListener('change', function() {
  handleMasterPhotoSelection(this, 'edit');
});
document.getElementById('edit-master-foto-gallery').addEventListener('change', function() {
  handleMasterPhotoSelection(this, 'edit');
});

window.removeMasterTempPhoto = function(mode, idx) {
  if (mode === 'add') tempMasterPhotosAdd.splice(idx, 1);
  else tempMasterPhotosEdit.splice(idx, 1);
  renderMasterPhotoPreview(mode);
};

function renderMasterPhotoPreview(mode) {
  const list = mode === 'add' ? tempMasterPhotosAdd : tempMasterPhotosEdit;
  const grid = document.getElementById(mode === 'add' ? 'master-foto-preview-grid' : 'edit-master-foto-preview-grid');
  const counter = document.getElementById(mode === 'add' ? 'master-photo-counter' : 'edit-master-photo-counter');

  counter.textContent = list.length + ' Foto';

  if (list.length === 0) {
    grid.classList.add('hidden');
    grid.innerHTML = '';
    return;
  }

  grid.classList.remove('hidden');
  grid.innerHTML = '';
  list.forEach((src, idx) => {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML =
      '<img src="' + src + '" alt="Foto ' + (idx + 1) + '">' +
      '<button type="button" class="preview-remove-btn" onclick="removeMasterTempPhoto(\'' + mode + '\', ' + idx + ')">✕</button>';
    grid.appendChild(div);
  });
}

document.getElementById('form-add-ncr').addEventListener('submit', async function(e) {
  e.preventDefault();
  const checkedProds = Array.from(document.querySelectorAll('input[name="ncr-target-prod"]:checked')).map(cb => cb.value);

  const rawDate = document.getElementById('ncr-date').value || getTodayIsoDate();
  const platform = document.getElementById('ncr-platform').value.trim();
  const title = document.getElementById('ncr-title').value.trim();
  const desc = document.getElementById('ncr-desc').value.trim();
  const gdriveLink = document.getElementById('ncr-gdrive-link').value.trim();

  const newNcr = normalizeNcrItem({
    id: Date.now(),
    no: document.getElementById('ncr-no').value.trim(),
    rawDate: rawDate,
    date: formatDisplayDate(rawDate),
    platform: platform,
    title: title,
    part: `${platform} — ${title}`,
    desc: desc,
    gdriveLink: gdriveLink,
    gdriveFileName: tempMasterDocAdd ? tempMasterDocAdd.name : '',
    gdriveFileData: tempMasterDocAdd ? tempMasterDocAdd.dataUrl : '',
    masterPhotos: [...tempMasterPhotosAdd],
    assignedProducts: checkedProds
  });

  masterNcrList.unshift(newNcr);
  e.target.reset();
  toggleModal('modal-add-ncr', false);
  renderAllViews();

  await sendActionToBackend({
    action: 'ADD_NCR',
    ...newNcr
  }, 'Menyimpan Master NCR...');
});

window.openEditNcrModal = function(ncrId) {
  const ncr = masterNcrList.find(item => item.id === ncrId);
  if (!ncr) return;

  document.getElementById('edit-ncr-id').value = ncrId;
  document.getElementById('edit-ncr-no').value = ncr.no;
  document.getElementById('edit-ncr-date').value = ncr.rawDate || getTodayIsoDate();
  document.getElementById('edit-ncr-gdrive-link').value = ncr.gdriveLink || '';
  document.getElementById('edit-ncr-platform').value = ncr.platform || '';
  document.getElementById('edit-ncr-title').value = ncr.title || '';
  document.getElementById('edit-ncr-desc').value = ncr.desc || '';

  if (ncr.gdriveFileName && ncr.gdriveFileData) {
    tempMasterDocEdit = { name: ncr.gdriveFileName, dataUrl: ncr.gdriveFileData };
    document.getElementById('edit-ncr-gdrive-file-info').textContent = ncr.gdriveFileName;
    document.getElementById('btn-clear-edit-ncr-file').classList.remove('hidden');
  } else {
    tempMasterDocEdit = null;
    document.getElementById('edit-ncr-gdrive-file-info').textContent = 'Belum ada file';
    document.getElementById('btn-clear-edit-ncr-file').classList.add('hidden');
  }

  tempMasterPhotosEdit = Array.isArray(ncr.masterPhotos) ? [...ncr.masterPhotos] : [];
  renderMasterPhotoPreview('edit');

  renderProductChecklistHtml('edit-product-checklist', 'edit-target-prod', ncr.assignedProducts || []);

  toggleModal('modal-edit-ncr', true);
};

document.getElementById('form-edit-ncr').addEventListener('submit', async function(e) {
  e.preventDefault();
  const ncrId = Number(document.getElementById('edit-ncr-id').value);
  const ncr = masterNcrList.find(item => item.id === ncrId);
  const checkedProds = Array.from(document.querySelectorAll('input[name="edit-target-prod"]:checked')).map(cb => cb.value);

  if (ncr) {
    const rawDate = document.getElementById('edit-ncr-date').value || getTodayIsoDate();
    const platform = document.getElementById('edit-ncr-platform').value.trim();
    const title = document.getElementById('edit-ncr-title').value.trim();

    ncr.no = document.getElementById('edit-ncr-no').value.trim();
    ncr.rawDate = rawDate;
    ncr.date = formatDisplayDate(rawDate);
    ncr.gdriveLink = document.getElementById('edit-ncr-gdrive-link').value.trim();
    ncr.gdriveFileName = tempMasterDocEdit ? tempMasterDocEdit.name : '';
    ncr.gdriveFileData = tempMasterDocEdit ? tempMasterDocEdit.dataUrl : '';
    ncr.platform = platform;
    ncr.title = title;
    ncr.part = `${platform} — ${title}`;
    ncr.desc = document.getElementById('edit-ncr-desc').value.trim();
    ncr.masterPhotos = [...tempMasterPhotosEdit];
    ncr.assignedProducts = checkedProds;
  }

  toggleModal('modal-edit-ncr', false);
  renderAllViews();

  if (ncr) {
    await sendActionToBackend({
      action: 'EDIT_NCR',
      ...ncr
    }, 'Memperbarui NCR...');
  }
});

window.deleteNcr = async function(id) {
  if (confirm('Hapus Master NCR ini?')) {
    masterNcrList = masterNcrList.filter(item => item.id !== id);
    renderAllViews();

    await sendActionToBackend({
      action: 'DELETE_NCR',
      id: id
    }, 'Menghapus NCR...');
  }
};

function switchTab(tab) {
  const secHistory = document.getElementById('section-history');
  const secNcr = document.getElementById('section-ncr');
  const secUsers = document.getElementById('section-users');

  const navHistory = document.getElementById('nav-history');
  const navNcr = document.getElementById('nav-ncr');
  const navUsers = document.getElementById('nav-users');

  const bnavHistory = document.getElementById('bnav-history');
  const bnavNcr = document.getElementById('bnav-ncr');
  const bnavUsers = document.getElementById('bnav-users');

  const pageTitle = document.getElementById('page-title');

  secHistory.classList.add('hidden');
  secNcr.classList.add('hidden');
  secUsers.classList.add('hidden');

  navHistory.classList.remove('active');
  navNcr.classList.remove('active');
  navUsers.classList.remove('active');

  if (bnavHistory) bnavHistory.classList.remove('active');
  if (bnavNcr) bnavNcr.classList.remove('active');
  if (bnavUsers) bnavUsers.classList.remove('active');

  if (tab === 'history') {
    secHistory.classList.remove('hidden');
    navHistory.classList.add('active');
    if (bnavHistory) bnavHistory.classList.add('active');
    pageTitle.textContent = 'History NCR';
    renderHistoryView();
  } else if (tab === 'ncr') {
    secNcr.classList.remove('hidden');
    navNcr.classList.add('active');
    if (bnavNcr) bnavNcr.classList.add('active');
    pageTitle.textContent = 'Monitoring Unit';
    renderNcrTable();
  } else {
    secUsers.classList.remove('hidden');
    navUsers.classList.add('active');
    if (bnavUsers) bnavUsers.classList.add('active');
    pageTitle.textContent = 'Kelola User';
  }
}

// ================= UPLOAD BUKTI INSPECTOR =================
function compressAndResizeImage(file, maxWidth = IMAGE_MAX_WIDTH, quality = IMAGE_JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Length = compressedDataUrl.split(',')[1].length;
        const sizeInKb = Math.round((base64Length * 3) / 4 / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          sizeKb: sizeInKb,
          originalName: file.name
        });
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

window.openUploadModal = function(id) {
  const ncr = masterNcrList.find(item => item.id === id);
  document.getElementById('upload-ncr-id').value = id;
  document.getElementById('upload-ncr-title').textContent = selectedProduct + ' — ' + (ncr ? ncr.no + ' (' + ncr.title + ')' : '');
  document.getElementById('foto-input-camera').value = '';
  document.getElementById('foto-input-gallery').value = '';
  document.getElementById('foto-note').value = '';
  tempImageList = [];
  renderUploadPreviewGrid();
  toggleModal('modal-upload-foto', true);
};

async function handleSelectedFiles(fileListElement) {
  const files = Array.from(fileListElement.files);
  if (!files.length) return;

  const counter = document.getElementById('upload-photo-counter');
  counter.textContent = 'Memproses...';

  try {
    const compressedResults = await Promise.all(
      files.map(file => compressAndResizeImage(file))
    );
    compressedResults.forEach(item => {
      tempImageList.push(item);
    });
    renderUploadPreviewGrid();
  } catch (err) {
    alert('Gagal memproses gambar.');
  }

  fileListElement.value = '';
}

document.getElementById('foto-input-camera').addEventListener('change', function() {
  handleSelectedFiles(this);
});

document.getElementById('foto-input-gallery').addEventListener('change', function() {
  handleSelectedFiles(this);
});

window.removeTempPhoto = function(idx) {
  tempImageList.splice(idx, 1);
  renderUploadPreviewGrid();
};

function renderUploadPreviewGrid() {
  const grid = document.getElementById('foto-preview-grid');
  const counter = document.getElementById('upload-photo-counter');

  const totalKb = tempImageList.reduce((sum, item) => sum + (item.sizeKb || 0), 0);
  counter.textContent = tempImageList.length + ' Foto (' + totalKb + ' KB)';

  if (tempImageList.length === 0) {
    grid.classList.add('hidden');
    grid.innerHTML = '';
    return;
  }

  grid.classList.remove('hidden');
  grid.innerHTML = '';
  tempImageList.forEach((item, idx) => {
    const src = typeof item === 'string' ? item : item.dataUrl;
    const kbText = item.sizeKb ? item.sizeKb + ' KB' : 'OK';

    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML =
      '<img src="' + src + '" alt="Preview">' +
      '<span class="preview-kb-badge">' + kbText + '</span>' +
      '<button type="button" class="preview-remove-btn" onclick="removeTempPhoto(' + idx + ')">✕</button>';
    grid.appendChild(div);
  });
}

document.getElementById('form-upload-foto').addEventListener('submit', async function(e) {
  e.preventDefault();
  if (tempImageList.length === 0) {
    alert('Pilih minimal 1 foto bukti!');
    return;
  }

  const id = Number(document.getElementById('upload-ncr-id').value);
  const ncr = masterNcrList.find(item => item.id === id);
  const note = document.getElementById('foto-note').value.trim();
  const key = selectedProduct + '_' + id;

  const now = new Date();
  const timeStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const compressedDataUrls = tempImageList.map(item => typeof item === 'string' ? item : item.dataUrl);

  productFollowUps[key] = {
    status: 'CLOSED',
    photos: compressedDataUrls,
    note: note,
    inspector: currentUsername,
    updatedAt: timeStr,
    folderUrl: ''
  };

  toggleModal('modal-upload-foto', false);
  renderAllViews();

  await sendActionToBackend({
    action: 'UPLOAD_FOLLOWUP',
    productName: selectedProduct,
    ncrId: id,
    ncrNo: ncr ? ncr.no : ('NCR-' + id),
    note: note,
    inspector: currentUsername,
    photos: compressedDataUrls
  }, 'Mengunggah ' + compressedDataUrls.length + ' foto...');
});

// ================= KELOLA USER =================
function renderUserTable() {
  const tbody = document.getElementById('user-table-body');
  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td data-label="Username" style="font-weight:800; color:var(--slate-900);">' + u.username + '</td>' +
      '<td data-label="Password" style="font-family:monospace; color:var(--slate-600);">' + u.password + '</td>' +
      '<td data-label="Role"><span class="badge ' + (u.role === 'admin' ? 'badge-indigo' : 'badge-closed') + '">' + u.role.toUpperCase() + '</span></td>' +
      '<td class="text-right"><div class="mobile-action-group" style="display:inline-flex; justify-content:flex-end;"><button type="button" class="btn btn-rose-soft btn-sm" onclick="deleteUser(' + u.id + ')">' + HEROICONS.trash + ' <span>Hapus</span></button></div></td>';
    tbody.appendChild(tr);
  });
}

document.getElementById('form-add-user').addEventListener('submit', async function(e) {
  e.preventDefault();
  const uname = document.getElementById('new-username').value.trim();
  if (users.some(u => u.username.toLowerCase() === uname.toLowerCase())) {
    alert('Username sudah dipakai!');
    return;
  }

  const newUser = {
    id: Date.now(),
    username: uname,
    password: document.getElementById('new-password').value.trim(),
    role: document.getElementById('new-role').value
  };
  users.push(newUser);
  e.target.reset();
  toggleModal('modal-add-user', false);
  renderUserTable();

  await sendActionToBackend({
    action: 'ADD_USER',
    ...newUser
  }, 'Menyimpan user...');
});

window.deleteUser = async function(id) {
  const targetUser = users.find(u => u.id === id);
  if (!targetUser) return;

  const adminCount = users.filter(u => u.role === 'admin').length;
  if (targetUser.role === 'admin' && adminCount <= 1) {
    alert('Admin utama tidak boleh dihapus!');
    return;
  }

  if (!confirm('Hapus user "' + targetUser.username + '"?')) return;

  users = users.filter(u => u.id !== id);
  renderUserTable();

  await sendActionToBackend({
    action: 'DELETE_USER',
    id: id
  }, 'Menghapus user...');
};

window.toggleModal = function(modalId, show) {
  const el = document.getElementById(modalId);
  if (show) el.classList.remove('hidden');
  else el.classList.add('hidden');
};

window.addEventListener('DOMContentLoaded', function() {
  const savedRole = sessionStorage.getItem('qc_active_role');
  const savedUser = sessionStorage.getItem('qc_active_user');

  if (savedRole) {
    enterApp(savedRole, savedUser);
  }
});
