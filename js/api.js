// const API_BASE = 'http://localhost:8000/api';
// const API_BASE = 'https://6rz9bsm8-8000.asse.devtunnels.ms/api';
const API_BASE = 'galaxy-backend-production-e2b4.up.railway.app/api';

const API = {
  getToken() { return localStorage.getItem('token'); },
  getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } },
  logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/index.html'; },

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers }; 
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    if (res.status === 401) { this.logout(); throw new Error('Sesi habis, silakan login kembali'); }
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Terjadi kesalahan');
    return data;
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body) { return this.request('PUT', path, body); },
  delete(path) { return this.request('DELETE', path); },

  login(username, password) { return this.post('/auth/login', { username, password }); },
  getDashboard() { return this.get('/dashboard'); },
  getCustomers() { return this.get('/customers/'); },
  createCustomer(d) { return this.post('/customers/', d); },
  updateCustomer(id, d) { return this.put(`/customers/${id}`, d); },
  deleteCustomer(id) { return this.delete(`/customers/${id}`); },
  getDestinations() { return this.get('/destinations/'); },
  createDestination(d) { return this.post('/destinations/', d); },
  updateDestination(id, d) { return this.put(`/destinations/${id}`, d); },
  deleteDestination(id) { return this.delete(`/destinations/${id}`); },
  getServices() { return this.get('/services/'); },
  createService(d) { return this.post('/services/', d); },
  updateService(id, d) { return this.put(`/services/${id}`, d); },
  deleteService(id) { return this.delete(`/services/${id}`); },
  getShipments() { return this.get('/shipments/'); },
  getShipment(id) { return this.get(`/shipments/${id}`); },
  createShipment(d) { return this.post('/shipments/', d); },
  updateShipment(id, d) { return this.put(`/shipments/${id}`, d); },
  deleteShipment(id) { return this.delete(`/shipments/${id}`); },
  getInvoices() { return this.get('/invoices/'); },
  getInvoice(id) { return this.get(`/invoices/${id}`); },
  createInvoice(d) { return this.post('/invoices/', d); },
  updateInvoice(id, d) { return this.put(`/invoices/${id}`, d); },
  deleteInvoice(id) { return this.delete(`/invoices/${id}`); },
  getShipmentReport(p = {}) { const q = new URLSearchParams(p).toString(); return this.get(`/reports/shipments${q ? '?' + q : ''}`); },
  getInvoiceReport(p = {}) { const q = new URLSearchParams(p).toString(); return this.get(`/reports/invoices${q ? '?' + q : ''}`); },
  getRevenueReport(p = {}) { const q = new URLSearchParams(p).toString(); return this.get(`/reports/revenue${q ? '?' + q : ''}`); },
  getUsers() { return this.get('/auth/users'); },
  createUser(d) { return this.post('/auth/users', d); },
  deleteUser(id) { return this.delete(`/auth/users/${id}`); },
};

// ── Role Permission System ────────────────────────────────────────────────────
const ROLES = {
  admin: { label: 'Admin', color: '#553C9A', bg: '#E9D8FD' },
  staff: { label: 'Staff', color: '#2C5282', bg: '#BEE3F8' },
  keuangan: { label: 'Keuangan', color: '#744210', bg: '#FEFCBF' },
};

const PERMISSIONS = {
  // Pengiriman
  'shipment.create': ['admin', 'staff'],
  'shipment.update': ['admin', 'staff'],
  'shipment.delete': ['admin'],
  // Invoice
  'invoice.view': ['admin', 'keuangan'],
  'invoice.create': ['admin', 'keuangan'],
  'invoice.update': ['admin', 'keuangan'],
  'invoice.delete': ['admin'],
  // Data Master
  'master.create': ['admin'],
  'master.update': ['admin'],
  'master.delete': ['admin'],
  // Laporan
  'report.shipment': ['admin', 'staff', 'keuangan'],
  'report.finance': ['admin', 'keuangan'],
  'report.export': ['admin', 'keuangan'],
  // User management
  'user.manage': ['admin'],
};

function can(permission) {
  const user = API.getUser();
  if (!user) return false;
  const allowed = PERMISSIONS[permission] || [];
  return allowed.includes(user.role);
}

function requireAuth() {
  if (!API.getToken()) { window.location.href = '/index.html'; return false; }
  return true;
}

// Redirect jika tidak punya akses ke halaman ini
function requirePermission(permission, redirectTo = 'dashboard.html') {
  if (!can(permission)) {
    showToast('Anda tidak memiliki akses ke halaman ini', 'error');
    setTimeout(() => window.location.href = redirectTo, 1200);
    return false;
  }
  return true;
}

// Terapkan visibilitas elemen berdasarkan role
function applyRoleUI() {
  const user = API.getUser();
  if (!user) return;

  if (user.role === 'staff') {
    document.querySelectorAll('[data-nav="invoices"]').forEach(el => { if (el) el.style.display = 'none'; });
    document.querySelectorAll('[data-nav="report-finance"]').forEach(el => { if (el) el.style.display = 'none'; });
    document.querySelectorAll('[data-nav="users"]').forEach(el => { if (el) el.style.display = 'none'; });
  }

  if (user.role === 'keuangan') {
    document.querySelectorAll('[data-nav="users"]').forEach(el => { if (el) el.style.display = 'none'; });
    document.querySelectorAll('[data-nav="report-shipments"]').forEach(el => { if (el) el.style.display = 'none'; });
  }

  if (user.role !== 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => { if (el) el.style.display = 'none'; });
  }

  const isRestrictedMaster = (user.role === 'keuangan' || user.role === 'staff');

  const permMap = {
    'data-perm-shipment-create': 'shipment.create',
    'data-perm-shipment-update': 'shipment.update',
    'data-perm-shipment-delete': 'shipment.delete',
    'data-perm-invoice-view': 'invoice.view',
    'data-perm-invoice-create': 'invoice.create',
    'data-perm-invoice-delete': 'invoice.delete',
    'data-perm-master-write': 'master.manage',
    'data-perm-report-finance': 'report.finance',
    'data-perm-user-manage': 'user.manage',
  };

  Object.entries(permMap).forEach(([attr, perm]) => {
    document.querySelectorAll(`[${attr}]`).forEach(el => {
      if (attr === 'data-perm-master-write' && isRestrictedMaster) {
        el.style.display = 'none';
      }
      else if (!can(perm)) {
        el.style.display = 'none';
      }
    });
  });

  const roleInfo = ROLES[user.role] || { label: 'Staff', color: '#2C5282', bg: '#BEE3F8' };
  const roleEl = document.getElementById('sidebarUserRole');
  if (roleEl) {
    roleEl.innerHTML = `<span style="background:${roleInfo.bg};color:${roleInfo.color};padding:.1rem .4rem;border-radius:4px;font-size:.7rem;font-weight:700">${roleInfo.label}</span>`;
  }
}

function initUserInfo() {
  const user = API.getUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebarUserName');
  const avatarEl = document.getElementById('sidebarUserAvatar');
  if (nameEl) nameEl.textContent = user.name;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  applyRoleUI();
}

// ── Utility functions ─────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  toast.innerHTML = `<span>${icons[type] || '●'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'fadeOut .3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 3500);
}

function formatRp(n) {
  if (!n && n !== 0) return '—';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

function confirmAction(msg) { return confirm(msg); }

const stylePageLoader = document.createElement('style');
stylePageLoader.innerHTML = `
  #top-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background-color: #0056b3;
    z-index: 99999;
    transition: width 0.4s ease, opacity 0.4s ease;
    box-shadow: 0 0 10px rgba(0, 86, 179, 0.7);
  }
  .page-dimmed {
    opacity: 0.6 !important;
    transition: opacity 0.4s ease;
  }
`;
document.head.appendChild(stylePageLoader);

const progressBar = document.createElement('div');
progressBar.id = 'top-progress-bar';
document.body.appendChild(progressBar);

function startPageLoading() {
  const content = document.querySelector('.main-content') || document.body;
  if (content) content.classList.add('page-dimmed');

  progressBar.style.opacity = '1';
  progressBar.style.width = '0%';

  setTimeout(() => { progressBar.style.width = '30%'; }, 50);
  setTimeout(() => { progressBar.style.width = '70%'; }, 200);
}

function stopPageLoading() {
  progressBar.style.width = '100%';
  setTimeout(() => {
    progressBar.style.opacity = '0';
    const content = document.querySelector('.main-content') || document.body;
    if (content) content.classList.remove('page-dimmed');
    setTimeout(() => { progressBar.style.width = '0%'; }, 400);
  }, 200);
}

document.addEventListener('DOMContentLoaded', () => {
  startPageLoading();
  setTimeout(stopPageLoading, 600);
});

window.addEventListener('beforeunload', () => {
  startPageLoading();
});

const originalFetch = window.fetch;
if (originalFetch) {
  window.fetch = async function (...args) {
    startPageLoading();
    try {
      const response = await originalFetch(...args);
      return response;
    } finally {
      stopPageLoading();
    }
  };
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('open');
}