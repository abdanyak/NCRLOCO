/**
 * ============================================================================
 * QC PORTAL — MONITORING & HISTORY NCR
 * File: app.js (Audited & Fixed: IndexedDB, Sequential Image Processing,
 *       Custom Non-Blocking Dialogs/Toast, Re-Open Audit Trail, A11y, Security,
 *       Mutex Offline Queue Sync & Auto-Reopen on Missing GDrive Photos)
 * ============================================================================
 */

// KONFIGURASI API GOOGLE APPS SCRIPT
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzbZvfG8L7laLP74G76z_EFJfCokvxlTwjUBsAvHXNyAeMVDERNvA5Qa__YQAO3P8Ht/exec";

// KONSTANTA GAMBAR, STORAGE & PEMBATASAN UKURAN FILE
const IMAGE_MAX_WIDTH = 1600;
const IMAGE_JPEG_QUALITY = 0.85;
const LOCAL_STORAGE_KEY = 'qc_ncr_portal_prod_v1';
const OFFLINE_QUEUE_KEY = 'qc_ncr_offline_queue';
const OFFLINE_AUTH_CACHE_KEY = 'qc_ncr_offline_auth_v1';
const IDB_NAME = 'qc_ncr_idb_v1';
const IDB_VERSION = 1;
const IDB_STORE_STATE = 'portal_state';
const IDB_STORE_QUEUE = 'offline_queue';
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_QUEUE_RETRIES = 3;

const HEROICONS = {
  calendar: '<svg class="icon-sm" style="display:inline-block; vertical-align:text-bottom; margin-right:3px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>',
  wrench: '<svg class="icon-sm" style="display:inline-block; vertical-align:text-bottom; margin-right:2px; color:var(--indigo-600);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" /></svg>',
  pencil: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>',
  trash: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>',
  unlink: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.181 8.68a4.503 4.503 0 0 1 1.903 6.405m-9.768-2.782L3.56 14.06a4.5 4.5 0 0 0 6.364 6.365l3.129-3.129m5.614-5.615 1.757-1.757a4.5 4.5 0 0 0-6.364-6.365l-4.5 4.5c-.258.26-.479.541-.661.84m1.903 6.405a4.495 4.495 0 0 1-1.242-.88 4.483 4.483 0 0 1-1.062-1.683m6.587 2.345 5.907 5.907m-5.907-5.907L8.898 8.898M2.991 2.99 8.898 8.9" /></svg>',
  camera: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>',
  eye: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>',
  eyeSlash: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>',
  checkBadge: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>',
  arrowPath: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>',
  clockHistory: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>',
  archiveBox: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>',
  lockClosed: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>',
  lockOpen: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>',
  folderOpen: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>',
  docText: '<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>'
};

// STATE APLIKASI
let currentRole = null;
let currentUsername = '';
let currentToken = '';
let isSyncingOfflineQueue = false;
let isSyncingFromCloud = false;
let gdriveExternalOpenedAt = 0;
let cacheBustToken = Date.now();
const pendingAutoReopenKeys = new Set();

let tempImageList = [];
let tempMasterPhotosAdd = [];
let tempMasterPhotosEdit = [];
let tempMasterDocAdd = null;
let tempMasterDocEdit = null;

let activeLightboxPhotos = [];
let activeLightboxIndex = 0;
let activeLightboxContext = null; // { type: 'followup'|'master'|'audit', prodIdx, ncrId }
let lastFocusedElement = null;

let statusFilter = 'ALL';
let searchQuery = '';
let unitSortBy = 'DATE_DESC';

let historyFilter = 'ALL';
let historySearchQuery = '';
let historySortBy = 'DATE_DESC';

let products = [];
let selectedProduct = '';
let masterNcrList = [];
let productFollowUps = {};
let users = [];

// ================= 1. INDEXEDDB ENGINE (FIX #1: BATAS 5MB LOCALSTORAGE) =================
let idbPromise = null;

function openPortalIndexedDB() {
  if (idbPromise) return idbPromise;
  idbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung di browser ini.'));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = function(e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_STATE)) {
        db.createObjectStore(IDB_STORE_STATE);
      }
      if (!db.objectStoreNames.contains(IDB_STORE_QUEUE)) {
        db.createObjectStore(IDB_STORE_QUEUE, { keyPath: 'id' });
      }
    };
    req.onsuccess = function(e) {
      resolve(e.target.result);
    };
    req.onerror = function(e) {
      reject(e.target.error);
    };
  });
  return idbPromise;
}

async function idbSetState(key, value) {
  try {
    const db = await openPortalIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_STATE, 'readwrite');
      tx.objectStore(IDB_STORE_STATE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Fallback ke localStorage karena IndexedDB gagal:', err);
    return false;
  }
}

async function idbGetState(key) {
  try {
    const db = await openPortalIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_STATE, 'readonly');
      const req = tx.objectStore(IDB_STORE_STATE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return null;
  }
}

async function idbGetOfflineQueue() {
  try {
    const db = await openPortalIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_QUEUE, 'readonly');
      const req = tx.objectStore(IDB_STORE_QUEUE).getAll();
      req.onsuccess = () => {
        const list = Array.isArray(req.result) ? req.result : [];
        list.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }
}

async function idbReplaceOfflineQueue(items) {
  const safeItems = Array.isArray(items) ? items : [];
  try {
    const db = await openPortalIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_QUEUE, 'readwrite');
      const store = tx.objectStore(IDB_STORE_QUEUE);
      store.clear();
      safeItems.forEach(item => store.put(item));
      tx.oncomplete = () => {
        localStorage.setItem(OFFLINE_QUEUE_KEY + '_count', String(safeItems.length));
        updateNetworkStatusUI(navigator.onLine);
        resolve(true);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(safeItems));
      localStorage.setItem(OFFLINE_QUEUE_KEY + '_count', String(safeItems.length));
      updateNetworkStatusUI(navigator.onLine);
    } catch (e) {
      console.error('Gagal menyimpan antrean offline:', e);
    }
    return false;
  }
}

// ================= 2. SISTEM TOAST, CUSTOM DIALOG & STACKED PHOTO STYLES =================
function injectAuditEnhancementStyles() {
  if (document.getElementById('qc-audit-injected-styles')) return;
  const style = document.createElement('style');
  style.id = 'qc-audit-injected-styles';
  style.textContent = `
    /* Toast Container */
    .qc-toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: min(380px, calc(100vw - 32px));
      pointer-events: none;
    }
    .qc-toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 10px;
      background: #0f172a;
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.35);
      border-left: 4px solid #3b82f6;
      animation: qcToastIn 0.22s ease-out;
      line-height: 1.4;
      word-break: break-word;
    }
    .qc-toast.toast-success { border-left-color: #10b981; }
    .qc-toast.toast-error { border-left-color: #f43f5e; }
    .qc-toast.toast-warning { border-left-color: #f59e0b; }
    @keyframes qcToastIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Custom Confirm / Prompt Dialog */
    .qc-dialog-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(2px);
      z-index: 9500;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .qc-dialog-box {
      background: #ffffff;
      border-radius: 14px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid var(--slate-200);
      overflow: hidden;
      animation: qcToastIn 0.18s ease-out;
    }
    .qc-dialog-header {
      padding: 16px 18px 8px;
      font-size: 16px;
      font-weight: 800;
      color: var(--slate-900);
    }
    .qc-dialog-body {
      padding: 0 18px 16px;
      font-size: 13.5px;
      color: var(--slate-600);
      white-space: pre-line;
      line-height: 1.5;
    }
    .qc-dialog-input {
      margin-top: 10px;
      width: 100%;
      padding: 9px 12px;
      border: 1px solid var(--slate-300);
      border-radius: 8px;
      font-size: 16px !important;
    }
    .qc-dialog-footer {
      padding: 12px 18px;
      background: var(--slate-50);
      border-top: 1px solid var(--slate-200);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    /* Password Toggle Wrapper (Fix #10) */
    .password-field-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-field-wrap input {
      padding-right: 42px !important;
      width: 100%;
    }
    .password-toggle-btn {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--slate-500);
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .password-toggle-btn:hover {
      background: var(--slate-100);
      color: var(--slate-800);
    }

    /* Audit Trail Badge & Box (Fix #12) */
    .reopen-audit-box {
      margin-top: 6px;
      padding: 6px 9px;
      border-radius: 7px;
      background: var(--amber-50);
      border: 1px solid var(--amber-100);
      font-size: 11.5px;
      color: var(--amber-700);
    }
    .audit-history-btn {
      margin-top: 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 7px;
      border-radius: 5px;
      background: var(--slate-100);
      border: 1px solid var(--slate-300);
      font-size: 11px;
      font-weight: 700;
      color: var(--slate-700);
      cursor: pointer;
    }
    .audit-history-btn:hover {
      background: var(--slate-200);
    }
    .audit-log-item {
      padding: 10px 12px;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      background: var(--slate-50);
      margin-bottom: 8px;
      text-align: left;
    }

    /* Efek Tumpukan Kartu Foto (Stacked Cards) & Nama Produk Utuh */
    .stacked-thumb-container {
      position: relative;
      width: 54px;
      height: 54px;
      cursor: pointer;
      flex-shrink: 0;
      margin-right: 4px;
      margin-top: 4px;
    }
    .history-unit-card .stacked-thumb-container {
      margin-left: auto;
    }
    .thumb-card-main {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      border: 1.5px solid #ffffff;
      box-shadow: 0 3px 8px rgba(15, 23, 42, 0.18);
      background: #ffffff;
      z-index: 3;
      transition: transform 0.2s ease;
    }
    .stacked-thumb-container:hover .thumb-card-main {
      transform: translateY(-2px);
    }
    .thumb-card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      background: #cbd5e1;
      border: 1.5px solid #ffffff;
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);
    }
    .thumb-card-back-1 {
      top: -3px;
      right: -3px;
      z-index: 2;
      opacity: 0.85;
      transform: rotate(4deg);
    }
    .thumb-card-back-2 {
      top: -6px;
      right: -6px;
      z-index: 1;
      opacity: 0.55;
      transform: rotate(8deg);
    }
    .thumb-count-badge {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: var(--indigo-600, #4f46e5);
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 999px;
      z-index: 4;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.22);
    }
    .history-unit-card .unit-title-text {
      font-weight: 700;
      font-size: 13px;
      color: var(--slate-900);
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: clip !important;
      word-break: break-word;
      line-height: 1.35;
      margin-bottom: 2px;
      width: 100%;
    }

    /* Indikator Cloud/Lokal Responsif */
    .network-indicator-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: help;
    }

    /* Fix #4 & #5 & #8 (Mobile iOS Auto-Zoom, Safe Area Bottom Nav, Empty Cell, Mobile Network Dot) */
    @media (max-width: 768px) {
      input[type="text"], input[type="password"], input[type="url"], input[type="date"], select, textarea {
        font-size: 16px !important;
      }
      .mobile-bottom-nav {
        height: calc(60px + env(safe-area-inset-bottom, 0px)) !important;
        padding-bottom: env(safe-area-inset-bottom, 0px) !important;
      }
      .content-wrapper {
        padding-bottom: calc(82px + env(safe-area-inset-bottom, 0px)) !important;
      }
      table.mobile-card-table tbody td.empty-table-cell {
        text-align: center !important;
        padding: 24px 12px !important;
      }
      table.mobile-card-table tbody td.empty-table-cell::before {
        display: none !important;
      }
      .network-indicator-badge .network-text {
        display: none !important;
      }
      .network-indicator-badge {
        padding: 6px 8px !important;
        border-radius: 50% !important;
        min-width: 28px;
        height: 28px;
        justify-content: center;
      }
      .network-indicator-badge .dot {
        width: 9px !important;
        height: 9px !important;
        margin: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function getToastContainer() {
  let container = document.getElementById('qc-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'qc-toast-container';
    container.className = 'qc-toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info', duration = 3500) {
  injectAuditEnhancementStyles();
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `qc-toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s ease';
    setTimeout(() => toast.remove(), 220);
  }, duration);
}

function showDialogModal({
  title = 'Konfirmasi',
  message = '',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  showCancel = true,
  variant = 'indigo',
  showInput = false,
  inputPlaceholder = ''
}) {
  injectAuditEnhancementStyles();
  return new Promise(resolve => {
    const prevFocus = document.activeElement;
    const backdrop = document.createElement('div');
    backdrop.className = 'qc-dialog-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    const btnClass = variant === 'rose' ? 'btn-rose-soft' : (variant === 'amber' ? 'btn-amber-soft' : 'btn-indigo');

    backdrop.innerHTML = `
      <div class="qc-dialog-box" onclick="event.stopPropagation()">
        <div class="qc-dialog-header">${escapeHtml(title)}</div>
        <div class="qc-dialog-body">
          <div>${escapeHtml(message)}</div>
          ${showInput ? `<input type="text" id="qc-dialog-prompt-input" class="qc-dialog-input" placeholder="${escapeHtml(inputPlaceholder)}">` : ''}
        </div>
        <div class="qc-dialog-footer">
          ${showCancel ? `<button type="button" id="qc-dialog-cancel" class="btn btn-outline">${escapeHtml(cancelText)}</button>` : ''}
          <button type="button" id="qc-dialog-confirm" class="btn ${btnClass}">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const inputEl = backdrop.querySelector('#qc-dialog-prompt-input');
    const confirmBtn = backdrop.querySelector('#qc-dialog-confirm');
    const cancelBtn = backdrop.querySelector('#qc-dialog-cancel');

    function cleanup(result) {
      document.removeEventListener('keydown', onKeyDown, true);
      backdrop.remove();
      if (prevFocus && typeof prevFocus.focus === 'function') {
        prevFocus.focus();
      }
      resolve(result);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cleanup(showInput ? null : false);
      } else if (e.key === 'Enter' && (!showInput || document.activeElement === inputEl)) {
        e.preventDefault();
        e.stopPropagation();
        cleanup(showInput ? (inputEl ? inputEl.value.trim() : '') : true);
      }
    }

    document.addEventListener('keydown', onKeyDown, true);

    confirmBtn.addEventListener('click', () => {
      cleanup(showInput ? (inputEl ? inputEl.value.trim() : '') : true);
    });
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => cleanup(showInput ? null : false));
    }
    backdrop.addEventListener('click', () => {
      if (showCancel) cleanup(showInput ? null : false);
    });

    setTimeout(() => {
      if (inputEl) inputEl.focus();
      else confirmBtn.focus();
    }, 20);
  });
}

function showConfirm(message, title = 'Konfirmasi Tindakan', variant = 'indigo', confirmText = 'Ya, Lanjutkan') {
  return showDialogModal({
    title,
    message,
    confirmText,
    cancelText: 'Batal',
    showCancel: true,
    variant,
    showInput: false
  });
}

function showAlert(message, title = 'Informasi Sistem') {
  return showDialogModal({
    title,
    message,
    confirmText: 'Mengerti',
    showCancel: false,
    variant: 'indigo',
    showInput: false
  });
}

// ================= 3. FITUR TOGGLE PASSWORD (FIX #10) =================
function initPasswordToggles() {
  injectAuditEnhancementStyles();
  ['password', 'new-password'].forEach(inputId => {
    const input = document.getElementById(inputId);
    if (!input || input.parentElement.classList.contains('password-field-wrap')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'password-field-wrap';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Tampilkan atau sembunyikan password');
    toggleBtn.title = 'Lihat / Sembunyikan Password';
    toggleBtn.innerHTML = HEROICONS.eye;

    toggleBtn.addEventListener('click', function() {
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      toggleBtn.innerHTML = isPass ? HEROICONS.eyeSlash : HEROICONS.eye;
      input.focus();
    });

    wrapper.appendChild(toggleBtn);
  });
}

// ================= 4. HELPER KEAMANAN (ANTI-XSS, HASH SHA-256), DEBOUNCE & SORTING =================
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getDriveImageSrc(rawUrl) {
  const str = String(rawUrl || '');
  if (!str) return '';
  if (str.startsWith('data:')) return str;
  if (str.includes('drive.google.com/thumbnail')) {
    return `${str}${str.includes('?') ? '&' : '?'}cb=${cacheBustToken}`;
  }
  return str;
}

async function computeSha256Hex(text) {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash);
}

async function cacheAuthorizedCredentialHash(username, password, role, token) {
  try {
    const hash = await computeSha256Hex(`${username.toLowerCase()}::${password}`);
    const cacheMap = JSON.parse(localStorage.getItem(OFFLINE_AUTH_CACHE_KEY) || '{}');
    cacheMap[username.toLowerCase()] = {
      hash,
      username,
      role,
      token,
      updatedAt: Date.now()
    };
    localStorage.setItem(OFFLINE_AUTH_CACHE_KEY, JSON.stringify(cacheMap));
  } catch (e) {
    console.warn('Gagal menyimpan cache otentikasi offline:', e);
  }
}

async function verifyOfflineCredentialHash(username, password) {
  try {
    const cacheMap = JSON.parse(localStorage.getItem(OFFLINE_AUTH_CACHE_KEY) || '{}');
    const entry = cacheMap[username.toLowerCase()];
    if (!entry) return null;
    const candidateHash = await computeSha256Hex(`${username.toLowerCase()}::${password}`);
    if (candidateHash === entry.hash) {
      return entry;
    }
  } catch (e) {}
  return null;
}

function sanitizeUsersList(rawUsers) {
  if (!Array.isArray(rawUsers)) return [];
  return rawUsers.map(u => ({
    id: Number(u.id),
    username: String(u.username || '').trim(),
    role: String(u.role || 'inspector').trim()
  }));
}

function debounce(fn, delay = 250) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

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
  const cleanStr = String(dateStr).split(' 00:00:00')[0].split(' GMT')[0];
  if (cleanStr && cleanStr !== 'Invalid Date' && cleanStr !== '-') {
    return cleanStr;
  }
  return dateStr;
}

function sortNcrItems(list, sortMode) {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sortMode === 'DATE_DESC') {
      const cmp = String(b.rawDate || '').localeCompare(String(a.rawDate || ''));
      return cmp !== 0 ? cmp : (Number(b.id) - Number(a.id));
    }
    if (sortMode === 'DATE_ASC') {
      const cmp = String(a.rawDate || '').localeCompare(String(b.rawDate || ''));
      return cmp !== 0 ? cmp : (Number(a.id) - Number(b.id));
    }
    if (sortMode === 'PLATFORM_ASC') {
      const cmp = String(a.platform || '').localeCompare(String(b.platform || ''), 'id', { numeric: true, sensitivity: 'base' });
      return cmp !== 0 ? cmp : String(a.title || '').localeCompare(String(b.title || ''), 'id', { numeric: true, sensitivity: 'base' });
    }
    if (sortMode === 'PLATFORM_DESC') {
      const cmp = String(b.platform || '').localeCompare(String(a.platform || ''), 'id', { numeric: true, sensitivity: 'base' });
      return cmp !== 0 ? cmp : String(b.title || '').localeCompare(String(a.title || ''), 'id', { numeric: true, sensitivity: 'base' });
    }
    if (sortMode === 'NO_ASC') {
      return String(a.no || '').localeCompare(String(b.no || ''), 'id', { numeric: true, sensitivity: 'base' });
    }
    if (sortMode === 'NO_DESC') {
      return String(b.no || '').localeCompare(String(a.no || ''), 'id', { numeric: true, sensitivity: 'base' });
    }
    return 0;
  });
  return copy;
}

function updateSortIndicatorsUI() {
  const histDateInd = document.getElementById('sort-ind-hist-date');
  const histPlatInd = document.getElementById('sort-ind-hist-platform');
  const unitDateInd = document.getElementById('sort-ind-unit-date');
  const unitPlatInd = document.getElementById('sort-ind-unit-platform');

  if (histDateInd && histPlatInd) {
    histDateInd.className = 'sort-indicator';
    histPlatInd.className = 'sort-indicator';
    histDateInd.textContent = '↕';
    histPlatInd.textContent = '↕';

    if (historySortBy === 'DATE_DESC') { histDateInd.textContent = '↓'; histDateInd.classList.add('active'); }
    else if (historySortBy === 'DATE_ASC') { histDateInd.textContent = '↑'; histDateInd.classList.add('active'); }
    else if (historySortBy === 'NO_ASC') { histDateInd.textContent = 'A-Z'; histDateInd.classList.add('active'); }
    else if (historySortBy === 'NO_DESC') { histDateInd.textContent = 'Z-A'; histDateInd.classList.add('active'); }
    else if (historySortBy === 'PLATFORM_ASC') { histPlatInd.textContent = 'A-Z ↑'; histPlatInd.classList.add('active'); }
    else if (historySortBy === 'PLATFORM_DESC') { histPlatInd.textContent = 'Z-A ↓'; histPlatInd.classList.add('active'); }
  }

  if (unitDateInd && unitPlatInd) {
    unitDateInd.className = 'sort-indicator';
    unitPlatInd.className = 'sort-indicator';
    unitDateInd.textContent = '↕';
    unitPlatInd.textContent = '↕';

    if (unitSortBy === 'DATE_DESC') { unitDateInd.textContent = '↓'; unitDateInd.classList.add('active'); }
    else if (unitSortBy === 'DATE_ASC') { unitDateInd.textContent = '↑'; unitDateInd.classList.add('active'); }
    else if (unitSortBy === 'NO_ASC') { unitDateInd.textContent = 'A-Z'; unitDateInd.classList.add('active'); }
    else if (unitSortBy === 'NO_DESC') { unitDateInd.textContent = 'Z-A'; unitDateInd.classList.add('active'); }
    else if (unitSortBy === 'PLATFORM_ASC') { unitPlatInd.textContent = 'A-Z ↑'; unitPlatInd.classList.add('active'); }
    else if (unitSortBy === 'PLATFORM_DESC') { unitPlatInd.textContent = 'Z-A ↓'; unitPlatInd.classList.add('active'); }
  }
}

window.toggleTableSort = function(view, column) {
  if (view === 'history') {
    if (column === 'DATE') {
      historySortBy = (historySortBy === 'DATE_DESC') ? 'DATE_ASC' : 'DATE_DESC';
    } else if (column === 'PLATFORM') {
      historySortBy = (historySortBy === 'PLATFORM_ASC') ? 'PLATFORM_DESC' : 'PLATFORM_ASC';
    }
    const sel = document.getElementById('sort-history');
    if (sel) sel.value = historySortBy;
    renderHistoryView();
  } else if (view === 'unit') {
    if (column === 'DATE') {
      unitSortBy = (unitSortBy === 'DATE_DESC') ? 'DATE_ASC' : 'DATE_DESC';
    } else if (column === 'PLATFORM') {
      unitSortBy = (unitSortBy === 'PLATFORM_ASC') ? 'PLATFORM_DESC' : 'PLATFORM_ASC';
    }
    const sel = document.getElementById('sort-unit');
    if (sel) sel.value = unitSortBy;
    renderNcrTable();
  }
};

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

  let rawDate = item.rawDate || '';
  if (!rawDate && item.date) {
    const match = String(item.date).match(/\d{4}-\d{2}-\d{2}/);
    if (match) rawDate = match[0];
  }
  if (!rawDate) rawDate = getTodayIsoDate();

  const gdriveLink = item.gdriveLink || '';
  const gdriveFileData = gdriveLink ? '' : (item.gdriveFileData || '');

  return {
    ...item,
    rawDate: rawDate,
    date: formatDisplayDate(rawDate),
    platform: platform || '-',
    title: title || '-',
    part: item.part || (platform && title ? `${platform} — ${title}` : (platform || title || '-')),
    desc: item.desc || '-',
    gdriveLink: gdriveLink,
    gdriveFileName: item.gdriveFileName || '',
    gdriveFileData: gdriveFileData,
    masterPhotos: Array.isArray(item.masterPhotos) ? item.masterPhotos.filter(Boolean) : [],
    assignedProducts: Array.isArray(item.assignedProducts) ? item.assignedProducts : []
  };
}

function normalizeAllMasterNcr() {
  masterNcrList = (masterNcrList || []).map(normalizeNcrItem);
}

// ================= 5. DETEKSI FOTO GDRIVE HILANG & AUTO RE-OPEN KE MERAH (OPEN) =================
function normalizeFollowUpRecord(entry, fallbackPrev) {
  if (!entry) return null;
  const photos = getPhotosArray(entry).filter(Boolean);
  const history = Array.isArray(entry.history)
    ? entry.history
    : (fallbackPrev && Array.isArray(fallbackPrev.history) ? fallbackPrev.history : []);

  // KRITIS: Jika status tercatat CLOSED namun tidak ada foto bukti sama sekali, paksa kembali ke OPEN (Merah)
  const hasValidPhotos = photos.length > 0;
  const effectiveStatus = (entry.status === 'CLOSED' && hasValidPhotos) ? 'CLOSED' : 'OPEN';
  const reopenReason = effectiveStatus === 'OPEN'
    ? (entry.reopenReason || (fallbackPrev ? fallbackPrev.reopenReason : '') || (entry.status === 'CLOSED' ? 'Otomatis OPEN: Bukti foto di Google Drive telah dihapus / tidak ditemukan' : ''))
    : '';

  return {
    ...entry,
    status: effectiveStatus,
    photos: photos,
    history: history,
    reopenedBy: entry.reopenedBy || (fallbackPrev ? fallbackPrev.reopenedBy : '') || (effectiveStatus === 'OPEN' && entry.status === 'CLOSED' ? 'Sistem Otomatis' : ''),
    reopenedAt: entry.reopenedAt || (fallbackPrev ? fallbackPrev.reopenedAt : ''),
    reopenReason: reopenReason
  };
}

async function autoReopenMissingDrivePhoto(prodName, ncrId) {
  const key = `${prodName}_${ncrId}`;
  if (pendingAutoReopenKeys.has(key)) return;

  const followUp = productFollowUps[key];
  if (!followUp) return;

  pendingAutoReopenKeys.add(key);
  try {
    const now = new Date();
    const timeStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const autoReason = 'Otomatis OPEN: Bukti foto di Google Drive telah dihapus / tidak ditemukan';

    const prevHistory = Array.isArray(followUp.history) ? [...followUp.history] : [];
    if (followUp.note || followUp.inspector) {
      prevHistory.push({
        status: 'CLOSED',
        photos: [],
        note: followUp.note || '-',
        inspector: followUp.inspector || '-',
        updatedAt: followUp.updatedAt || '-',
        folderUrl: followUp.folderUrl || '',
        reopenedBy: 'Sistem Otomatis (GDrive Sync)',
        reopenedAt: timeStr,
        reopenReason: autoReason
      });
    }

    productFollowUps[key] = {
      status: 'OPEN',
      photos: [],
      note: '',
      inspector: '',
      updatedAt: timeStr,
      reopenedBy: 'Sistem Otomatis',
      reopenedAt: timeStr,
      reopenReason: autoReason,
      folderUrl: followUp.folderUrl || '',
      history: prevHistory
    };

    await saveToLocalStorage();
    renderAllViews();

    const ncrObj = masterNcrList.find(n => Number(n.id) === Number(ncrId));
    const ncrLabel = ncrObj ? ncrObj.no : `NCR-${ncrId}`;
    showToast(`Foto bukti ${ncrLabel} pada unit "${prodName}" tidak ditemukan di Google Drive. Status dikembalikan ke OPEN!`, 'error', 5500);

    // Tutup lightbox jika sedang menampilkan foto unit yang baru saja di-reset
    const lightboxModal = document.getElementById('modal-lightbox');
    if (lightboxModal && !lightboxModal.classList.contains('hidden')) {
      toggleModal('modal-lightbox', false);
    }

    // Kirim pembaruan status OPEN ke backend Google Sheets
    if (isCloudConfigured() && navigator.onLine && currentToken) {
      await sendActionToBackend({
        action: 'REOPEN_NCR',
        productName: prodName,
        ncrId: Number(ncrId),
        reopenReason: autoReason,
        reopenedBy: currentUsername || 'Sistem Otomatis',
        reopenedAt: timeStr,
        history: prevHistory
      }, 'Mengembalikan status ke OPEN karena foto GDrive terhapus...');
    }
  } finally {
    setTimeout(() => pendingAutoReopenKeys.delete(key), 3000);
  }
}

window.handleFollowUpPhotoError = function(prodIdx, ncrId, brokenPhotoIdx) {
  // Jangan ubah status jika pengguna hanya sedang kehilangan koneksi internet
  if (!navigator.onLine) return;

  const prodObj = products[prodIdx];
  if (!prodObj) return;
  const prodName = prodObj.name;
  const key = `${prodName}_${ncrId}`;
  const followUp = productFollowUps[key];
  if (!followUp) return;

  const currentPhotos = getPhotosArray(followUp);
  if (brokenPhotoIdx >= 0 && brokenPhotoIdx < currentPhotos.length) {
    currentPhotos.splice(brokenPhotoIdx, 1);
    followUp.photos = currentPhotos;
  }

  if (currentPhotos.length === 0) {
    autoReopenMissingDrivePhoto(prodName, ncrId);
  } else {
    saveToLocalStorage();
    renderAllViews();
  }
};

window.handleMasterPhotoError = function(ncrId, brokenPhotoIdx) {
  if (!navigator.onLine) return;
  const ncr = masterNcrList.find(item => Number(item.id) === Number(ncrId));
  if (!ncr || !Array.isArray(ncr.masterPhotos)) return;

  if (brokenPhotoIdx >= 0 && brokenPhotoIdx < ncr.masterPhotos.length) {
    ncr.masterPhotos.splice(brokenPhotoIdx, 1);
    saveToLocalStorage();
    renderAllViews();
  }
};

// ================= STATUS JARINGAN REAL-TIME & INDIKATOR ANTREAN =================
function updateNetworkStatusUI(isOnline) {
  const modeBadge = document.getElementById('storage-mode-badge');
  const btnRefresh = document.getElementById('btn-refresh-cloud');
  if (!modeBadge) return;

  const pendingCount = Number(localStorage.getItem(OFFLINE_QUEUE_KEY + '_count') || '0');
  const pendingSuffix = pendingCount > 0 ? ` (${pendingCount})` : '';

  if (!isCloudConfigured() || !isOnline) {
    modeBadge.innerHTML = `<span class="dot" style="background:var(--slate-400)"></span><span class="network-text">Offline${pendingSuffix}</span>`;
    modeBadge.className = 'badge badge-archived network-indicator-badge';
    modeBadge.title = `Status: Offline${pendingCount > 0 ? ' • ' + pendingCount + ' antrean tertunda' : ''}`;
  } else {
    modeBadge.innerHTML = `<span class="dot" style="background:var(--emerald-500)"></span><span class="network-text">Cloud${pendingSuffix}</span>`;
    modeBadge.className = 'badge badge-closed network-indicator-badge';
    modeBadge.title = `Status: Terhubung ke Cloud${pendingCount > 0 ? ' • ' + pendingCount + ' antrean' : ''}`;
    if (btnRefresh) btnRefresh.classList.remove('hidden');
  }
}

window.addEventListener('offline', function() {
  updateNetworkStatusUI(false);
  showToast('Koneksi terputus. Beralih ke penyimpanan Offline (IndexedDB).', 'warning');
});

window.addEventListener('online', function() {
  updateNetworkStatusUI(true);
  showToast('Koneksi kembali terhubung. Menyinkronkan data...', 'info');
  syncFromCloud(true);
});

// Deteksi ketika pengguna mengeklik link folder/file GDrive lalu kembali ke tab aplikasi
document.addEventListener('click', function(e) {
  const gdriveAnchor = e.target.closest('.gdrive-folder-link');
  if (gdriveAnchor) {
    gdriveExternalOpenedAt = Date.now();
  }
});

window.addEventListener('focus', function() {
  if (!currentToken || !navigator.onLine || !isCloudConfigured()) return;
  if (gdriveExternalOpenedAt > 0 || document.visibilityState === 'visible') {
    const elapsed = Date.now() - gdriveExternalOpenedAt;
    if (gdriveExternalOpenedAt > 0 && elapsed > 800) {
      gdriveExternalOpenedAt = 0;
      cacheBustToken = Date.now();
      syncFromCloud(true);
    }
  }
});

// ================= SINKRONISASI CLOUD, INDEXEDDB & ANTREAN OFFLINE =================
function isCloudConfigured() {
  return Boolean(GAS_API_URL && GAS_API_URL.trim() !== "" && !GAS_API_URL.includes("TEMPEL_URL"));
}

function showCloudLoading(show, text) {
  const el = document.getElementById('cloud-loading');
  const txt = document.getElementById('cloud-loading-text');
  if (text && txt) txt.textContent = text;
  if (!el) return;
  if (show) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

async function saveToLocalStorage() {
  users = sanitizeUsersList(users);

  // 1. Simpan state penuh (termasuk foto Base64 offline) ke IndexedDB (Tanpa limit 5MB)
  await idbSetState(LOCAL_STORAGE_KEY, {
    products,
    users,
    masterNcrList,
    productFollowUps
  });

  // 2. Simpan versi ringan (tanpa Base64 berat) ke localStorage sebagai cadangan cepat
  try {
    const lightMasterList = (masterNcrList || []).map(item => ({
      ...item,
      gdriveFileData: '',
      masterPhotos: (item.masterPhotos || []).filter(p => !String(p).startsWith('data:'))
    }));
    const lightFollowUps = {};
    Object.keys(productFollowUps || {}).forEach(k => {
      const f = productFollowUps[k];
      if (!f) return;
      lightFollowUps[k] = {
        ...f,
        photos: (f.photos || []).filter(p => !String(p).startsWith('data:'))
      };
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      products,
      users,
      masterNcrList: lightMasterList,
      productFollowUps: lightFollowUps
    }));
  } catch (e) {
    console.warn('Cache metadata localStorage penuh, data utama tetap aman di IndexedDB:', e);
  }
}

async function loadFromLocalStorage() {
  // Prioritaskan membaca dari IndexedDB
  const idbData = await idbGetState(LOCAL_STORAGE_KEY);
  if (idbData && typeof idbData === 'object') {
    if (Array.isArray(idbData.products)) products = idbData.products;
    if (Array.isArray(idbData.users) && idbData.users.length > 0) users = sanitizeUsersList(idbData.users);
    if (Array.isArray(idbData.masterNcrList)) {
      masterNcrList = idbData.masterNcrList;
      normalizeAllMasterNcr();
    }
    if (idbData.productFollowUps && typeof idbData.productFollowUps === 'object') {
      const normalizedMap = {};
      Object.keys(idbData.productFollowUps).forEach(k => {
        normalizedMap[k] = normalizeFollowUpRecord(idbData.productFollowUps[k], null);
      });
      productFollowUps = normalizedMap;
    }
    return;
  }

  // Fallback ke localStorage jika IndexedDB kosong
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.products)) products = parsed.products;
    if (Array.isArray(parsed.users) && parsed.users.length > 0) users = sanitizeUsersList(parsed.users);
    if (Array.isArray(parsed.masterNcrList)) {
      masterNcrList = parsed.masterNcrList;
      normalizeAllMasterNcr();
    }
    if (parsed.productFollowUps && typeof parsed.productFollowUps === 'object') {
      const normalizedMap = {};
      Object.keys(parsed.productFollowUps).forEach(k => {
        normalizedMap[k] = normalizeFollowUpRecord(parsed.productFollowUps[k], null);
      });
      productFollowUps = normalizedMap;
    }
  } catch (e) {
    console.warn('Gagal membaca LocalStorage:', e);
  }
}

async function saveToOfflineQueue(payload) {
  const queue = await idbGetOfflineQueue();
  const cleanPayload = { ...payload };
  delete cleanPayload.actorToken;

  const existingIdx = queue.findIndex(item => {
    const p = item.payload;
    if (!p) return false;
    if (cleanPayload.action === 'TOGGLE_PRODUCT_STATUS' && p.action === 'TOGGLE_PRODUCT_STATUS') {
      return p.name === cleanPayload.name;
    }
    if (cleanPayload.action === 'EDIT_NCR' && (p.action === 'EDIT_NCR' || p.action === 'ADD_NCR')) {
      return Number(p.id) === Number(cleanPayload.id);
    }
    if (cleanPayload.action === 'UPLOAD_FOLLOWUP' && p.action === 'UPLOAD_FOLLOWUP') {
      return p.productName === cleanPayload.productName && Number(p.ncrId) === Number(cleanPayload.ncrId);
    }
    if (cleanPayload.action === 'REOPEN_NCR' && p.action === 'REOPEN_NCR') {
      return p.productName === cleanPayload.productName && Number(p.ncrId) === Number(cleanPayload.ncrId);
    }
    return false;
  });

  if (existingIdx !== -1) {
    const prevAction = queue[existingIdx].payload.action;
    queue[existingIdx].payload = {
      ...queue[existingIdx].payload,
      ...cleanPayload,
      action: prevAction === 'ADD_NCR' ? 'ADD_NCR' : cleanPayload.action
    };
    queue[existingIdx].timestamp = new Date().toISOString();
  } else {
    const queueId = Date.now() + Math.floor(Math.random() * 1000);
    cleanPayload.clientMutationId = `mut_${queueId}`;
    queue.push({
      id: queueId,
      payload: cleanPayload,
      retryCount: 0,
      timestamp: new Date().toISOString()
    });
  }

  await idbReplaceOfflineQueue(queue);
}

async function processOfflineQueue() {
  if (!isCloudConfigured() || !navigator.onLine || isSyncingOfflineQueue) return false;

  const queue = await idbGetOfflineQueue();
  if (!queue || queue.length === 0) return false;

  isSyncingOfflineQueue = true;
  const initialCount = queue.length;
  let syncedCount = 0;
  let latestServerData = null;
  let remainingQueue = [...queue];

  showCloudLoading(true, `Menyinkronkan ${initialCount} data tertunda...`);

  try {
    while (remainingQueue.length > 0) {
      const item = remainingQueue[0];
      showCloudLoading(true, `Menyinkronkan (${syncedCount + 1}/${initialCount})...`);

      try {
        const requestPayload = {
          ...item.payload,
          actorUser: currentUsername || item.payload.actorUser,
          actorRole: currentRole || item.payload.actorRole,
          actorToken: currentToken
        };

        const res = await fetch(GAS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(requestPayload)
        });

        const json = await res.json();

        if (!res.ok || json.status === 'offline') {
          throw new Error('NETWORK_OFFLINE');
        }

        if (json.status === 'success') {
          syncedCount++;
          if (json.data) latestServerData = json.data;
          remainingQueue.shift();
          await idbReplaceOfflineQueue(remainingQueue);
        } else if (json.status === 'auth_error') {
          showToast(json.message || 'Sesi berakhir. Silakan login kembali untuk melanjutkan sinkronisasi.', 'error');
          document.getElementById('btn-logout').click();
          break;
        } else {
          item.retryCount = (item.retryCount || 0) + 1;
          if (item.retryCount >= MAX_QUEUE_RETRIES) {
            console.error('Melewati item antrean karena gagal berulang kali:', item, json.message);
            showToast(`1 item antrean (${item.payload.action}) dilewati: ${json.message || 'Error Server'}`, 'error', 5000);
            remainingQueue.shift();
          } else {
            remainingQueue.push(remainingQueue.shift());
          }
          await idbReplaceOfflineQueue(remainingQueue);
          if (remainingQueue.every(q => (q.retryCount || 0) > 0)) break;
        }
      } catch (networkErr) {
        updateNetworkStatusUI(false);
        break;
      }
    }

    if (latestServerData) {
      cacheBustToken = Date.now();
      updateNetworkStatusUI(true);
      products = latestServerData.products || [];
      users = (latestServerData.users && latestServerData.users.length > 0)
        ? sanitizeUsersList(latestServerData.users)
        : users;
      masterNcrList = mergeCloudMasterWithLocalExtras(latestServerData.masterNcrList || []);
      productFollowUps = mergeCloudFollowUpsWithLocalAudit(latestServerData.productFollowUps || {});

      if (products.length > 0 && !products.some(p => p.name === selectedProduct)) {
        selectedProduct = products[products.length - 1].name;
      } else if (products.length === 0) {
        selectedProduct = '';
      }

      await saveToLocalStorage();
      renderProductDropdown();
      renderAllViews();
    }

    if (syncedCount > 0 && remainingQueue.length === 0) {
      showToast(`${syncedCount} data offline berhasil disinkronkan ke Cloud.`, 'success');
    } else if (syncedCount > 0 && remainingQueue.length > 0) {
      showToast(`${syncedCount} data tersinkron, ${remainingQueue.length} masih tertunda.`, 'warning');
    }

    return latestServerData !== null;
  } finally {
    isSyncingOfflineQueue = false;
    showCloudLoading(false);
  }
}

function mergeCloudMasterWithLocalExtras(cloudList) {
  return (cloudList || []).map(cloudItem => normalizeNcrItem({
    ...cloudItem,
    gdriveFileData: ''
  }));
}

function mergeCloudFollowUpsWithLocalAudit(cloudFollowUps) {
  const merged = {};
  const source = cloudFollowUps || {};
  Object.keys(source).forEach(key => {
    const localPrev = productFollowUps[key];
    const cloudEntry = source[key];
    merged[key] = normalizeFollowUpRecord(cloudEntry, localPrev);
  });

  Object.keys(productFollowUps || {}).forEach(key => {
    if (!merged[key] && productFollowUps[key] && Array.isArray(productFollowUps[key].history) && productFollowUps[key].history.length > 0) {
      merged[key] = normalizeFollowUpRecord(productFollowUps[key], null);
    }
  });
  return merged;
}

async function syncFromCloud(silent = false) {
  if (isSyncingFromCloud) return;
  await loadFromLocalStorage();

  if (!isCloudConfigured() || !navigator.onLine) {
    updateNetworkStatusUI(false);
    return;
  }

  const alreadyUpdatedFromQueue = await processOfflineQueue();
  if (alreadyUpdatedFromQueue) return;

  isSyncingFromCloud = true;

  // HANYA MUNCULKAN LOADING JIKA TIDAK SILENT (misal saat manual klik tombol Sync)
  if (!silent) showCloudLoading(true, 'Memuat & memverifikasi data Cloud...');

  try {
    const res = await fetch(`${GAS_API_URL}?t=${Date.now()}`);
    const json = await res.json();

    if (!res.ok || json.status === 'offline') {
      throw new Error('NETWORK_OFFLINE');
    }

    if (json.status === 'success' && json.data) {
      cacheBustToken = Date.now();
      updateNetworkStatusUI(true);
      products = json.data.products || [];
      users = (json.data.users && json.data.users.length > 0) ? sanitizeUsersList(json.data.users) : users;
      masterNcrList = mergeCloudMasterWithLocalExtras(json.data.masterNcrList || []);
      productFollowUps = mergeCloudFollowUpsWithLocalAudit(json.data.productFollowUps || {});

      if (products.length > 0 && !products.some(p => p.name === selectedProduct)) {
        selectedProduct = products[products.length - 1].name;
      } else if (products.length === 0) {
        selectedProduct = '';
      }
      await saveToLocalStorage();
      renderProductDropdown();
      renderAllViews();
    }
  } catch (err) {
    console.error('Gagal memuat dari Cloud:', err);
    updateNetworkStatusUI(false);
  } finally {
    isSyncingFromCloud = false;
    if (!silent) showCloudLoading(false);
  }
}

async function sendActionToBackend(payload, loadingText) {
  await saveToLocalStorage();
  if (!isCloudConfigured()) return;

  const fullPayload = {
    ...payload,
    actorRole: currentRole,
    actorUser: currentUsername,
    actorToken: currentToken
  };

  if (!navigator.onLine) {
    updateNetworkStatusUI(false);
    await saveToOfflineQueue(fullPayload);
    showToast('Mode Offline: Data disimpan di perangkat & akan disinkronkan otomatis saat online.', 'warning', 4000);
    return;
  }

  showCloudLoading(true, loadingText || 'Menyimpan data...');
  try {
    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(fullPayload)
    });
    const json = await res.json();

    if (!res.ok || json.status === 'offline') {
      throw new Error('NETWORK_OFFLINE');
    }

    if (json.status === 'success' && json.data) {
      cacheBustToken = Date.now();
      updateNetworkStatusUI(true);
      products = json.data.products || [];
      users = (json.data.users && json.data.users.length > 0) ? sanitizeUsersList(json.data.users) : users;
      masterNcrList = mergeCloudMasterWithLocalExtras(json.data.masterNcrList || []);
      productFollowUps = mergeCloudFollowUpsWithLocalAudit(json.data.productFollowUps || {});
      await saveToLocalStorage();
      renderProductDropdown();
      renderAllViews();

      showToast('Data berhasil disimpan ke Cloud.', 'success');
      await processOfflineQueue();
    } else if (json.status === 'auth_error') {
      showToast(json.message || 'Sesi Anda telah berakhir. Silakan login kembali.', 'error');
      document.getElementById('btn-logout').click();
    } else if (json.status === 'error') {
      await showAlert('Error Server: ' + json.message, 'Gagal Menyimpan');
      await syncFromCloud(true);
    }
  } catch (err) {
    updateNetworkStatusUI(false);
    await saveToOfflineQueue(fullPayload);
    showToast('Jaringan terputus. Data disimpan di IndexedDB perangkat & akan disinkronkan saat online.', 'warning', 4500);
  } finally {
    showCloudLoading(false);
  }
}

// Inisialisasi Tombol Refresh Cloud
document.getElementById('btn-refresh-cloud').addEventListener('click', () => {
  cacheBustToken = Date.now();
  syncFromCloud(false);
});

function getPhotosArray(followUp) {
  if (!followUp) return [];
  if (Array.isArray(followUp.photos)) return followUp.photos.filter(Boolean);
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

// ================= FUNGSI LOGIN (FIX #3: TANPA HARDCODED BACKDOOR & DETEKSI SW OFFLINE) =================
document.getElementById('form-login').addEventListener('submit', async function(e) {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();

  if (!isCloudConfigured()) {
    await showAlert('URL Server Cloud belum dikonfigurasi.', 'Konfigurasi Server');
    return;
  }

  showCloudLoading(true, 'Memverifikasi akun...');
  try {
    if (!navigator.onLine) {
      throw new Error('NETWORK_OFFLINE');
    }

    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'LOGIN',
        username: u,
        password: p
      })
    });
    const json = await res.json();

    if (!res.ok || json.status === 'offline') {
      throw new Error('NETWORK_OFFLINE');
    }

    if (json.status === 'success' && !json.user) {
      await showAlert(
        "Google Apps Script belum diperbarui (Masih menggunakan versi lama).\n\nSolusi: Buka Apps Script > klik 'Deploy' > 'Manage deployments' > Edit (ikon pensil) > ubah Version menjadi 'New version' > klik Deploy.",
        "Info Sistem Deployment"
      );
      showCloudLoading(false);
      return;
    }

    if (json.status === 'success' && json.user) {
      if (json.data) {
        cacheBustToken = Date.now();
        products = json.data.products || [];
        users = sanitizeUsersList(json.data.users || []);
        masterNcrList = mergeCloudMasterWithLocalExtras(json.data.masterNcrList || []);
        productFollowUps = mergeCloudFollowUpsWithLocalAudit(json.data.productFollowUps || {});
        await saveToLocalStorage();
      }
      await cacheAuthorizedCredentialHash(json.user.username, p, json.user.role, json.user.token);

      document.getElementById('form-login').reset();
      showToast(`Selamat datang, ${json.user.username}!`, 'success');
      enterApp(json.user.role, json.user.username, json.user.token);
    } else {
      showToast(json.message || 'Username atau Password salah!', 'error');
    }
  } catch (err) {
    console.warn("Koneksi ke server terputus. Memeriksa cache kredensial offline...", err);

    const cachedAuth = await verifyOfflineCredentialHash(u, p);
    if (cachedAuth) {
      showToast('Server tidak terjangkau. Masuk ke Mode Offline menggunakan sesi terenkripsi terakhir.', 'warning', 4500);
      document.getElementById('form-login').reset();
      enterApp(cachedAuth.role, cachedAuth.username, cachedAuth.token);
    } else {
      await showAlert(
        "Tidak dapat terhubung ke server dan akun belum pernah terverifikasi di perangkat ini.\n\nPastikan koneksi internet aktif dan buka aplikasi melalui HTTP/HTTPS Server (bukan klik 2x file:/// secara langsung).",
        "Gagal Terhubung ke Server"
      );
    }
  } finally {
    showCloudLoading(false);
  }
});

// LOGOUT: BERSIHKAN SESI AKTIF
document.getElementById('btn-logout').addEventListener('click', function() {
  currentRole = null;
  currentUsername = '';
  currentToken = '';

  localStorage.removeItem('qc_active_role');
  localStorage.removeItem('qc_active_user');
  localStorage.removeItem('qc_active_token');

  closeMobileSidebar();
  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
  showToast('Anda telah keluar dari sesi.', 'info');
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

document.getElementById('sort-unit').addEventListener('change', function(e) {
  unitSortBy = e.target.value;
  renderNcrTable();
});

document.getElementById('search-ncr').addEventListener('input', debounce(function(e) {
  searchQuery = e.target.value.toLowerCase().trim();
  renderNcrTable();
}, 250));

document.querySelectorAll('#history-filter-pills .pill-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('#history-filter-pills .pill-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    historyFilter = this.getAttribute('data-hfilter');
    renderHistoryView();
  });
});

document.getElementById('sort-history').addEventListener('change', function(e) {
  historySortBy = e.target.value;
  renderHistoryView();
});

document.getElementById('search-history').addEventListener('input', debounce(function(e) {
  historySearchQuery = e.target.value.toLowerCase().trim();
  renderHistoryView();
}, 250));

document.getElementById('btn-toggle-archive').addEventListener('click', toggleProductStatus);
document.getElementById('btn-delete-product').addEventListener('click', deleteSelectedProduct);
document.getElementById('btn-add-product').addEventListener('click', function() {
  toggleModal('modal-add-product', true);
});
document.getElementById('btn-add-ncr').addEventListener('click', openAddNcrModal);
document.getElementById('btn-open-add-user').addEventListener('click', function() {
  toggleModal('modal-add-user', true);
});

document.getElementById('btn-select-all').addEventListener('click', () => setProductChecklist('ncr-target-prod', 'ALL'));
document.getElementById('btn-select-active').addEventListener('click', () => setProductChecklist('ncr-target-prod', 'ACTIVE'));
document.getElementById('btn-unselect-all').addEventListener('click', () => setProductChecklist('ncr-target-prod', 'NONE'));

document.getElementById('btn-edit-select-all').addEventListener('click', () => setProductChecklist('edit-target-prod', 'ALL'));
document.getElementById('btn-edit-select-active').addEventListener('click', () => setProductChecklist('edit-target-prod', 'ACTIVE'));
document.getElementById('btn-edit-unselect-all').addEventListener('click', () => setProductChecklist('edit-target-prod', 'NONE'));

// LOGIN MASUK: SIMPAN KE LOCALSTORAGE (PERSISTEN LINTAS TAB)
function enterApp(role, username, token) {
  currentRole = role;
  currentUsername = username || role;
  currentToken = token || '';

  localStorage.setItem('qc_active_role', currentRole);
  localStorage.setItem('qc_active_user', currentUsername);
  localStorage.setItem('qc_active_token', currentToken);

  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');

  const badge = document.getElementById('role-badge');
  const navUsers = document.getElementById('nav-users');
  const bnavUsers = document.getElementById('bnav-users');
  const btnAddNcr = document.getElementById('btn-add-ncr');
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
    btnAddProduct.classList.add('hidden');
    btnToggleArchive.classList.add('hidden');
    btnDeleteProduct.classList.add('hidden');
  }

  switchTab('history');
  renderProductDropdown();
  renderAllViews();

  syncFromCloud(true);
}

function renderAllViews() {
  normalizeAllMasterNcr();
  renderHistoryView();
  renderNcrTable();
  renderUserTable();
  document.getElementById('nav-history-badge').textContent = masterNcrList.length;
  document.getElementById('bnav-history-badge').textContent = masterNcrList.length;
}

// RENDER DROPDOWN PRODUK DENGAN URUTAN A-Z (NATURAL ALPHANUMERIC)
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

  const sortedProducts = [...products].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    return String(a.name || '').localeCompare(String(b.name || ''), undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  });

  sortedProducts.forEach(prod => {
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
    const ok = await showConfirm(`Arsipkan unit "${selectedProduct}"?`, 'Arsipkan Unit', 'amber', 'Ya, Arsipkan');
    if (!ok) return;
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
  const ok = await showConfirm(
    `Hapus unit "${targetName}" beserta status pengecekannya?\nMaster NCR pada unit lain tetap aman.`,
    'Hapus Unit Produk',
    'rose',
    'Ya, Hapus Unit'
  );
  if (!ok) return;

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
  const name = document.getElementById('new-product-name').value.replace(/,/g, ' ').trim();
  const inherit = document.getElementById('inherit-ncr').checked;

  if (!name) return;

  if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    showToast('Nama unit sudah terdaftar!', 'error');
    return;
  }

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
});

function getProductIndex(prodName) {
  return products.findIndex(p => p.name === prodName);
}

// THUMBNAIL TUMPUKAN KARTU (STACKED CARDS) DENGAN DUKUNGAN KEYBOARD ACCESSIBILITY & DETEKSI FOTO GDRIVE
function buildThumbnailsHtml(photos, prodIdx, ncrId) {
  if (!photos || photos.length === 0) return '';
  const displaySrc = getDriveImageSrc(photos[0]);
  const totalPhotos = photos.length;

  let html = '<div class="stacked-thumb-container" role="button" tabindex="0" onclick="openLightboxByIndex(' + prodIdx + ', ' + ncrId + ', 0)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openLightboxByIndex(' + prodIdx + ', ' + ncrId + ', 0);}">';

  // Efek tumpukan kartu di belakang jika foto lebih dari 1
  if (totalPhotos > 1) {
    html += '<div class="thumb-card-back thumb-card-back-2"></div>';
    html += '<div class="thumb-card-back thumb-card-back-1"></div>';
  }

  // Foto utama paling depan
  html += '<img src="' + escapeHtml(displaySrc) + '" class="thumb-card-main" alt="Bukti Foto" onerror="handleFollowUpPhotoError(' + prodIdx + ', ' + ncrId + ', 0)">';

  // Badge jumlah total foto di sudut kanan bawah
  html += '<span class="thumb-count-badge">' + totalPhotos + '</span>';

  html += '</div>';
  return html;
}

function buildMasterPhotosHtml(ncr) {
  const photos = ncr.masterPhotos || [];
  if (photos.length === 0) return '';
  const maxVisible = 3;
  let html = '<div style="margin-top:6px;"><div style="font-size:11px; font-weight:700; color:var(--slate-400); margin-bottom:3px;">Foto NCR (' + photos.length + '):</div><div class="multi-thumb-group">';
  photos.slice(0, maxVisible).forEach((src, idx) => {
    const displaySrc = getDriveImageSrc(src);
    html += `<img src="${escapeHtml(displaySrc)}" class="thumb-img" role="button" tabindex="0" alt="Foto Master ${idx + 1}" onclick="openMasterLightbox(${ncr.id}, ${idx})" onerror="handleMasterPhotoError(${ncr.id}, ${idx})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openMasterLightbox(${ncr.id}, ${idx});}">`;
  });
  if (photos.length > maxVisible) {
    const extra = photos.length - maxVisible;
    html += `<div class="thumb-more-badge" role="button" tabindex="0" onclick="openMasterLightbox(${ncr.id}, ${maxVisible})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openMasterLightbox(${ncr.id}, ${maxVisible});}">+${extra}</div>`;
  }
  html += '</div></div>';
  return html;
}

function buildGdriveDocHtml(ncr) {
  if (ncr.gdriveLink) {
    return '<div><a href="' + escapeHtml(ncr.gdriveLink) + '" target="_blank" rel="noopener" class="gdrive-folder-link">' +
      HEROICONS.docText + ' <span>File GDrive</span></a></div>';
  }
  if (ncr.gdriveFileData) {
    const fileName = ncr.gdriveFileName || 'File_NCR';
    return '<div><a href="' + escapeHtml(ncr.gdriveFileData) + '" download="' + escapeHtml(fileName) + '" class="gdrive-folder-link">' +
      HEROICONS.docText + ' <span>Unduh File</span></a></div>';
  }
  return '';
}

// HELPER AUDIT TRAIL RE-OPEN (FIX #12)
function buildAuditHistoryButtonHtml(prodIdx, ncrId, followUp) {
  const historyList = (followUp && Array.isArray(followUp.history)) ? followUp.history : [];
  if (historyList.length === 0) return '';
  return `<button type="button" class="audit-history-btn" onclick="openAuditHistoryModal(${prodIdx}, ${ncrId})">${HEROICONS.clockHistory} <span>Riwayat Re-Open (${historyList.length}x)</span></button>`;
}

window.openAuditHistoryModal = function(prodIdx, ncrId) {
  injectAuditEnhancementStyles();
  const prodObj = products[prodIdx];
  if (!prodObj) return;
  const prodName = prodObj.name;
  const ncr = masterNcrList.find(i => i.id === ncrId);
  const key = prodName + '_' + ncrId;
  const followUp = productFollowUps[key];
  const historyList = (followUp && Array.isArray(followUp.history)) ? followUp.history : [];
  if (historyList.length === 0) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'qc-dialog-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');

  let itemsHtml = '';
  historyList.slice().reverse().forEach((entry, idx) => {
    const entryNum = historyList.length - idx;
    const photoCount = Array.isArray(entry.photos) ? entry.photos.length : 0;
    itemsHtml += `
      <div class="audit-log-item">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
          <span class="badge badge-indigo">Verifikasi #${entryNum}</span>
          <span style="font-size:11px; color:var(--slate-500);">${escapeHtml(entry.updatedAt || '-')}</span>
        </div>
        <div style="font-size:12.5px; color:var(--slate-800); margin-top:5px;">
          <b>Inspector:</b> ${escapeHtml(entry.inspector || '-')} • <b>Catatan:</b> "${escapeHtml(entry.note || '-')}"
        </div>
        <div style="font-size:11.5px; color:var(--amber-700); margin-top:4px; background:var(--amber-50); padding:4px 7px; border-radius:5px;">
          <b>Di-Reopen oleh:</b> ${escapeHtml(entry.reopenedBy || 'Admin')} (${escapeHtml(entry.reopenedAt || '-')})<br>
          <b>Alasan:</b> ${escapeHtml(entry.reopenReason || 'Verifikasi ulang')}
        </div>
        ${photoCount > 0 ? `<div style="margin-top:6px;"><button type="button" class="btn btn-outline btn-sm" onclick="openAuditPhotosLightbox(${prodIdx}, ${ncrId}, ${historyList.length - 1 - idx})">${HEROICONS.eye} <span>Lihat ${photoCount} Foto Bukti Lama</span></button></div>` : ''}
      </div>
    `;
  });

  backdrop.innerHTML = `
    <div class="qc-dialog-box" style="max-width:480px;" onclick="event.stopPropagation()">
      <div class="qc-dialog-header">Riwayat Audit & Re-Open — ${escapeHtml(prodName)}</div>
      <div class="qc-dialog-body" style="max-height:65vh; overflow-y:auto;">
        <div style="font-size:12px; color:var(--slate-500); margin-bottom:8px;">${escapeHtml(ncr ? ncr.no + ' — ' + ncr.title : '')}</div>
        ${itemsHtml}
      </div>
      <div class="qc-dialog-footer">
        <button type="button" id="qc-audit-close" class="btn btn-indigo">Tutup</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  const closeBtn = backdrop.querySelector('#qc-audit-close');
  closeBtn.addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', () => backdrop.remove());
  closeBtn.focus();
};

window.openAuditPhotosLightbox = function(prodIdx, ncrId, historyIdx) {
  const prodObj = products[prodIdx];
  if (!prodObj) return;
  const key = prodObj.name + '_' + ncrId;
  const followUp = productFollowUps[key];
  if (!followUp || !Array.isArray(followUp.history) || !followUp.history[historyIdx]) return;
  const entry = followUp.history[historyIdx];
  const photos = Array.isArray(entry.photos) ? entry.photos : [];
  if (photos.length === 0) return;

  activeLightboxPhotos = photos;
  activeLightboxIndex = 0;
  activeLightboxContext = { type: 'audit', prodIdx, ncrId };

  document.getElementById('lightbox-title').textContent = `[ARSIP RE-OPEN] ${prodObj.name}`;
  document.getElementById('lightbox-note').textContent = `Catatan Lama: "${entry.note || '-'}" (Alasan Re-Open: ${entry.reopenReason || '-'})`;
  document.getElementById('lightbox-meta').textContent = `Inspector: ${entry.inspector || '-'} • ${entry.updatedAt || '-'}`;

  updateLightboxSlide();
  toggleModal('modal-lightbox', true);
};

// ================= RENDER HISTORY NCR (DENGAN STACKED PHOTO & NAMA UNIT UTUH .unit-title-text) =================
function renderHistoryView() {
  const tbody = document.getElementById('history-table-body');
  tbody.innerHTML = '';
  updateSortIndicatorsUI();

  let totalMaster = masterNcrList.length;
  let totalInstances = 0;
  let totalClosedInstances = 0;

  masterNcrList.forEach(item => {
    item.assignedProducts.forEach(prodName => {
      totalInstances++;
      const key = prodName + '_' + item.id;
      const followUp = productFollowUps[key];
      const photos = getPhotosArray(followUp);
      if (followUp && followUp.status === 'CLOSED' && photos.length > 0) {
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
    tbody.innerHTML = '<tr><td colspan="4" class="empty-table-cell" style="text-align:center; padding: 30px; color: var(--slate-400);">Belum ada data NCR.</td></tr>';
    return;
  }

  const filteredHistory = masterNcrList.filter(item => {
    let closedUnits = 0;
    item.assignedProducts.forEach(pName => {
      const k = pName + '_' + item.id;
      const f = productFollowUps[k];
      if (f && f.status === 'CLOSED' && getPhotosArray(f).length > 0) closedUnits++;
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

  const sortedHistory = sortNcrItems(filteredHistory, historySortBy);

  if (sortedHistory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-table-cell" style="text-align:center; padding: 28px; color: var(--slate-400);">Data tidak ditemukan.</td></tr>';
    return;
  }

  sortedHistory.forEach(item => {
    const trueIndex = masterNcrList.indexOf(item);
    const displayOrderNum = trueIndex !== -1 ? (masterNcrList.length - trueIndex) : '-';

    let closedCount = 0;
    let unitCardsHtml = '';

    if (item.assignedProducts.length === 0) {
      unitCardsHtml =
        '<div style="padding:10px; border-radius:8px; border:1px dashed var(--slate-300); background:var(--slate-50); color:var(--slate-500); font-size:12.5px;">' +
          'Belum ada unit. ' +
          (currentRole === 'admin' ? '<button type="button" class="link-action-btn" onclick="openEditNcrModal(' + item.id + ')">Pilih Unit &rarr;</button>' : '') +
        '</div>';
    } else {
      unitCardsHtml = '<div class="history-unit-scroll-box"><div class="history-unit-list">';

      // Diurutkan secara natural alphanumeric (022, 023, 024, dst)
      const sortedAssignedProds = [...item.assignedProducts].sort((a, b) =>
        String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
      );

      sortedAssignedProds.forEach(prodName => {
        const prodIdx = getProductIndex(prodName);
        const prodObj = products[prodIdx];
        const prodStateBadge = (prodObj && prodObj.status === 'archived')
          ? '<span style="font-size:10px; color:var(--slate-500); background:var(--slate-200); padding:1px 5px; border-radius:4px;">Arsip</span>'
          : '';

        const key = prodName + '_' + item.id;
        const followUp = productFollowUps[key] || { status: 'OPEN', photos: [], note: '', folderUrl: '', history: [] };
        const photos = getPhotosArray(followUp);
        const isTrulyClosed = followUp.status === 'CLOSED' && photos.length > 0;
        const auditBtnHtml = buildAuditHistoryButtonHtml(prodIdx, item.id, followUp);

        if (isTrulyClosed) {
          closedCount++;
          const driveLinkHtml = followUp.folderUrl
            ? '<a href="' + escapeHtml(followUp.folderUrl) + '" target="_blank" rel="noopener" class="gdrive-folder-link">' + HEROICONS.folderOpen + ' <span>GDrive</span></a>'
            : '';

          unitCardsHtml +=
            '<div class="history-unit-card is-closed" style="display:flex; flex-direction:column; align-items:stretch; gap:6px;">' +
              '<div class="unit-title-text">' +
                escapeHtml(prodName) + ' ' + prodStateBadge +
              '</div>' +
              '<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%;">' +
                '<div style="display:flex; flex-direction:column; align-items:flex-start; gap:4px; min-width:0;">' +
                  '<span class="badge badge-closed">CLOSED (' + photos.length + ')</span>' +
                  driveLinkHtml +
                  (auditBtnHtml ? `<div>${auditBtnHtml}</div>` : '') +
                '</div>' +
                buildThumbnailsHtml(photos, prodIdx, item.id) +
              '</div>' +
            '</div>';
        } else {
          const reopenNotice = followUp.reopenReason
            ? `<div class="reopen-audit-box"><b>Re-Open:</b> ${escapeHtml(followUp.reopenReason)}</div>`
            : '<div style="font-size:11.5px; color:var(--rose-600); margin-top:2px;">Belum dicek</div>';

          unitCardsHtml +=
            '<div class="history-unit-card is-open" style="display:flex; flex-direction:column; align-items:stretch; gap:4px;">' +
              '<div class="unit-title-text">' +
                escapeHtml(prodName) + ' ' + prodStateBadge +
              '</div>' +
              '<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">' +
                '<span class="badge badge-open">OPEN</span>' +
              '</div>' +
              reopenNotice +
              (auditBtnHtml ? `<div style="margin-top:4px;">${auditBtnHtml}</div>` : '') +
            '</div>';
        }
      });
      unitCardsHtml += '</div></div>';
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
          '<button type="button" class="btn btn-rose-soft btn-sm" onclick="deleteNcr(' + item.id + ')">' + HEROICONS.trash + ' <span>Hapus Master</span></button>' +
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
      '<td data-label="No. NCR & Tanggal">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap; margin-bottom:4px;">' +
          '<span style="font-size:10.5px; font-weight:800; color:var(--indigo-600); background:var(--indigo-50); padding:2px 6px; border-radius:4px;">#' + displayOrderNum + '</span>' +
          globalStatusBadge +
        '</div>' +
        '<div style="font-weight:800; font-size:14.5px; color:var(--slate-900);">' + escapeHtml(item.no) + '</div>' +
        '<div style="font-size:12px; color:var(--slate-500); margin-top:2px;">' + HEROICONS.calendar + escapeHtml(item.date) + '</div>' +
        buildGdriveDocHtml(item) +
        adminQuickEditHtml +
      '</td>' +
      '<td data-label="Platform, Title & Deskripsi">' +
        '<div class="platform-tag">' + HEROICONS.wrench + ' <span>' + escapeHtml(item.platform) + '</span></div>' +
        '<div class="issue-title-text">' + escapeHtml(item.title) + '</div>' +
        '<div class="issue-desc-text">' + escapeHtml(item.desc) + '</div>' +
        buildMasterPhotosHtml(item) +
      '</td>' +
      '<td data-label="Progress Unit">' + progressHtml + '</td>' +
      '<td data-label="Status per Unit">' + unitCardsHtml + '</td>';
    tbody.appendChild(tr);
  });
}

// ================= RENDER MONITORING PER UNIT (FIX #8, #11, #12 & VALIDASI FOTO GDRIVE) =================
function renderNcrTable() {
  const tbody = document.getElementById('ncr-table-body');
  tbody.innerHTML = '';
  updateSortIndicatorsUI();

  if (products.length === 0 || !selectedProduct) {
    document.getElementById('stat-total-ncr').textContent = 0;
    document.getElementById('stat-open-ncr').textContent = 0;
    document.getElementById('stat-closed-ncr').textContent = 0;
    document.getElementById('stat-progress-pct').textContent = '0% Selesai';
    tbody.innerHTML =
      '<tr><td colspan="7" class="empty-table-cell" style="text-align:center; padding: 30px; color: var(--slate-500);">' +
        'Belum ada unit dipilih. Anda tetap bisa langsung klik <b>Tambah NCR</b> atau buat <b>Unit Baru</b>.' +
      '</td></tr>';
    return;
  }

  const allProductNcr = masterNcrList.filter(item => item.assignedProducts.includes(selectedProduct));
  let totalCount = allProductNcr.length;
  let closedCount = 0;

  allProductNcr.forEach(item => {
    const key = selectedProduct + '_' + item.id;
    const followUp = productFollowUps[key];
    if (followUp && followUp.status === 'CLOSED' && getPhotosArray(followUp).length > 0) {
      closedCount++;
    }
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
    const effectiveStatus = (followUp.status === 'CLOSED' && getPhotosArray(followUp).length > 0) ? 'CLOSED' : 'OPEN';
    const matchStatus = (statusFilter === 'ALL') || (effectiveStatus === statusFilter);
    const matchSearch = !searchQuery ||
      item.no.toLowerCase().includes(searchQuery) ||
      item.platform.toLowerCase().includes(searchQuery) ||
      item.title.toLowerCase().includes(searchQuery) ||
      item.desc.toLowerCase().includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const sortedNcr = sortNcrItems(displayedNcr, unitSortBy);

  if (sortedNcr.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-table-cell" style="text-align:center; padding: 28px; color: var(--slate-400);">Tidak ada NCR pada unit <b>' + escapeHtml(selectedProduct) + '</b>.</td></tr>';
    return;
  }

  const currentProdIdx = getProductIndex(selectedProduct);

  sortedNcr.forEach(item => {
    const key = selectedProduct + '_' + item.id;
    const followUp = productFollowUps[key] || { status: 'OPEN', photos: [], note: '', folderUrl: '', history: [] };
    const photos = getPhotosArray(followUp);
    const isClosed = followUp.status === 'CLOSED' && photos.length > 0;
    const auditBtnHtml = buildAuditHistoryButtonHtml(currentProdIdx, item.id, followUp);

    const reopenInfoHtml = (!isClosed && followUp.reopenReason)
      ? `<div class="reopen-audit-box"><b>Di-Reopen:</b> ${escapeHtml(followUp.reopenReason)}</div>`
      : '';

    const statusBadge = !isClosed
      ? '<span class="badge badge-open">OPEN</span>' + reopenInfoHtml + (auditBtnHtml ? `<div>${auditBtnHtml}</div>` : '')
      : '<span class="badge badge-closed">CLOSED (' + photos.length + ')</span>' +
        (followUp.updatedAt ? '<div style="font-size:11px; color:var(--slate-400); margin-top:3px;">' + escapeHtml(followUp.updatedAt) + '</div>' : '') +
        (auditBtnHtml ? `<div>${auditBtnHtml}</div>` : '');

    const driveFolderBtn = (isClosed && followUp.folderUrl)
      ? '<div><a href="' + escapeHtml(followUp.folderUrl) + '" target="_blank" rel="noopener" class="gdrive-folder-link">' + HEROICONS.folderOpen + ' <span>GDrive</span></a></div>'
      : '';

    const photoCell = isClosed
      ? '<div class="thumb-wrapper">' +
          buildThumbnailsHtml(photos, currentProdIdx, item.id) +
          '<div style="flex:1; min-width:110px;">' +
            '<div style="font-size:12.5px; color:var(--slate-700); font-weight:600;">' + escapeHtml(followUp.note) + '</div>' +
            '<div style="font-size:11.5px; color:var(--indigo-600); cursor:pointer; font-weight:700; margin-top:3px;" role="button" tabindex="0" onclick="openLightboxByIndex(' + currentProdIdx + ', ' + item.id + ', 0)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openLightboxByIndex(' + currentProdIdx + ', ' + item.id + ', 0);}">Galeri (' + photos.length + ') &rarr;</div>' +
            driveFolderBtn +
          '</div>' +
        '</div>'
      : '<span style="font-size:12px; color:var(--slate-400);">Belum ada foto</span>';

    const targetBadgeHtml = '<span class="badge badge-indigo">' + item.assignedProducts.length + ' Unit</span>';

    let actionBtn = '';
    if (currentRole === 'admin') {
      actionBtn =
        '<div class="unit-action-group mobile-action-group">' +
          (isClosed
            ? '<button type="button" class="btn btn-amber-soft btn-sm" onclick="reopenUnitNcr(' + item.id + ')" title="Kembalikan ke status OPEN">' + HEROICONS.arrowPath + ' <span>Re-Open</span></button>'
            : '') +
          '<button type="button" class="btn btn-outline btn-sm" onclick="openEditNcrModal(' + item.id + ')" title="Edit Master NCR">' + HEROICONS.pencil + ' <span>Edit</span></button>' +
          '<button type="button" class="btn btn-rose-soft btn-sm" onclick="unassignNcrFromUnit(' + item.id + ')" title="Lepas NCR hanya dari unit ini">' + HEROICONS.unlink + ' <span>Lepas Unit</span></button>' +
        '</div>';
    } else {
      if (!isClosed) {
        actionBtn =
          '<div class="unit-action-group mobile-action-group">' +
            '<button type="button" class="btn btn-emerald btn-sm" onclick="openUploadModal(' + item.id + ')">' +
              HEROICONS.camera + ' <span>Verifikasi</span>' +
            '</button>' +
          '</div>';
      } else {
        actionBtn =
          '<div class="unit-action-group mobile-action-group">' +
            '<button type="button" class="btn btn-outline btn-sm" onclick="openLightboxByIndex(' + currentProdIdx + ', ' + item.id + ', 0)">' +
              HEROICONS.eye + ' <span>Lihat Foto (' + photos.length + ')</span>' +
            '</button>' +
          '</div>';
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td data-label="No. NCR & Tanggal">' +
        '<div style="font-weight:800; font-size:14.5px; color:var(--slate-900);">' + escapeHtml(item.no) + '</div>' +
        '<div style="font-size:12px; color:var(--slate-500); margin-top:2px;">' + HEROICONS.calendar + escapeHtml(item.date) + '</div>' +
        buildGdriveDocHtml(item) +
      '</td>' +
      '<td data-label="Platform & Title">' +
        '<div class="platform-tag">' + HEROICONS.wrench + ' <span>' + escapeHtml(item.platform) + '</span></div>' +
        '<div class="issue-title-text">' + escapeHtml(item.title) + '</div>' +
      '</td>' +
      '<td data-label="Deskripsi & Foto NCR">' +
        '<div class="issue-desc-text">' + escapeHtml(item.desc) + '</div>'
