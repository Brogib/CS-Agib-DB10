const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const sessionChip = document.querySelector('#sessionChip');

const state = {
  token: localStorage.getItem('sbd_token') || '',
  user: readStoredUser(),
  items: [],
  itemsLoaded: false,
  query: '',
  sort: 'name-asc',
};

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('sbd_user') || 'null');
  } catch (error) {
    return null;
  }
}

function setSession(payload) {
  state.token = payload.token;
  state.user = payload.user;
  localStorage.setItem('sbd_token', payload.token);
  localStorage.setItem('sbd_user', JSON.stringify(payload.user));
}

function clearSession() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('sbd_token');
  localStorage.removeItem('sbd_user');
}

function routeName(pathname = window.location.pathname) {
  if (pathname === '/' || pathname === '/catalog') return 'catalog';
  if (/^\/catalog\/[^/]+$/.test(pathname)) return 'item-detail';
  if (pathname === '/reports') return 'reports';
  if (pathname === '/login') return 'login';
  if (pathname === '/register') return 'register';
  if (pathname === '/profile') return 'profile';
  return 'catalog';
}

function navigate(path) {
  window.history.pushState({}, '', path);
  render();
}

async function api(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
  };

  const response = await fetch(path, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
    body: options.body && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data?.payload ?? data;
}

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function itemInitials(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function itemIdFromPath() {
  const id = window.location.pathname.split('/').filter(Boolean).at(-1);
  return Number(id);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function updateChrome(activeRoute) {
  const navRoute = activeRoute === 'item-detail' ? 'catalog' : activeRoute;

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === navRoute);
  });

  sessionChip.textContent = state.user
    ? `${state.user.name || state.user.username} - ${money(state.user.balance)}`
    : 'Guest';
}

function authIntro(title, subtitle) {
  return `
    <section class="auth-intro">
      <div>
        <p class="kicker">SBD Store</p>
        <h1>${title}</h1>
        <p class="subtle">${subtitle}</p>
      </div>
      <div class="auth-stat-row" aria-label="Store summary">
        <div class="auth-stat"><strong>${state.items.length || '-'}</strong><span>Items</span></div>
        <div class="auth-stat"><strong>24h</strong><span>Token session</span></div>
        <div class="auth-stat"><strong>IDR</strong><span>Balance based</span></div>
      </div>
    </section>
  `;
}

function renderLogin() {
  app.innerHTML = `
    <div class="auth-layout">
      ${authIntro('Sign in to your store account', 'Use the account from the seeded database or one you created from the register page.')}
      <section class="auth-card" aria-labelledby="loginTitle">
        <p class="kicker">Login</p>
        <h2 id="loginTitle">Welcome back</h2>
        <p class="subtle">Access your balance and continue browsing available items.</p>

        <form class="form-grid" id="loginForm">
          <div class="field">
            <label for="loginEmail">Email</label>
            <input id="loginEmail" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="loginPassword">Password</label>
            <input id="loginPassword" name="password" type="password" autocomplete="current-password" required>
          </div>
          <p class="hint">Sample users are available from the seed data if the database has been seeded.</p>
          <div class="button-row">
            <button class="btn btn-primary" type="submit">Login</button>
            <a class="link-inline" href="/register" data-link>Create account</a>
          </div>
          <p class="error-text" id="loginError" hidden></p>
        </form>
      </section>
    </div>
  `;
}

function renderRegister() {
  app.innerHTML = `
    <div class="auth-layout">
      ${authIntro('Create a new buyer profile', 'Registration stores your account in PostgreSQL and keeps the catalog available after login.')}
      <section class="auth-card" aria-labelledby="registerTitle">
        <p class="kicker">Register</p>
        <h2 id="registerTitle">New account</h2>
        <p class="subtle">Use a unique username and email for a clean registration.</p>

        <form class="form-grid" id="registerForm">
          <div class="field">
            <label for="name">Full name</label>
            <input id="name" name="name" type="text" autocomplete="name" maxlength="100" required>
          </div>
          <div class="field">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" autocomplete="username" minlength="3" maxlength="20" pattern="[A-Za-z0-9_]{3,20}" required>
            <span class="hint">Letters, numbers, and underscores only.</span>
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="+62 812 0000 0000">
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="new-password" minlength="10" required>
            <span class="hint">At least 10 characters with uppercase, lowercase, number, and symbol.</span>
          </div>
          <div class="button-row">
            <button class="btn btn-primary" type="submit">Register</button>
            <a class="link-inline" href="/login" data-link>Already have an account</a>
          </div>
          <p class="error-text" id="registerError" hidden></p>
        </form>
      </section>
    </div>
  `;
}

function stockClass(stock) {
  return Number(stock) <= 5 ? 'stock-low' : 'stock-ok';
}

function filteredItems() {
  const query = state.query.trim().toLowerCase();
  const rows = state.items.filter((item) => {
    if (!query) return true;
    return String(item.name).toLowerCase().includes(query);
  });

  const sorted = [...rows];
  sorted.sort((a, b) => {
    if (state.sort === 'price-asc') return Number(a.price) - Number(b.price);
    if (state.sort === 'price-desc') return Number(b.price) - Number(a.price);
    if (state.sort === 'stock-desc') return Number(b.stock) - Number(a.stock);
    return String(a.name).localeCompare(String(b.name));
  });
  return sorted;
}

function renderCatalogShell(content, meta = '') {
  app.innerHTML = `
    <section>
      <div class="section-head">
        <div>
          <p class="kicker">Catalog</p>
          <h1>Items for sale</h1>
          <p class="subtle">Live data from the backend item endpoint.</p>
        </div>
        <div class="catalog-meta">${meta}</div>
      </div>

      <div class="panel toolbar">
        <input id="searchInput" type="search" placeholder="Search item name" value="${escapeHtml(state.query)}" aria-label="Search item name">
        <select id="sortSelect" aria-label="Sort catalog">
          <option value="name-asc" ${state.sort === 'name-asc' ? 'selected' : ''}>Name</option>
          <option value="price-asc" ${state.sort === 'price-asc' ? 'selected' : ''}>Price: low to high</option>
          <option value="price-desc" ${state.sort === 'price-desc' ? 'selected' : ''}>Price: high to low</option>
          <option value="stock-desc" ${state.sort === 'stock-desc' ? 'selected' : ''}>Stock</option>
        </select>
        <button class="btn btn-secondary" type="button" id="refreshItems">Refresh</button>
      </div>

      ${content}
    </section>
  `;
}

async function loadItems(force = false) {
  if (state.itemsLoaded && !force) return;
  state.items = await api('/items');
  state.itemsLoaded = true;
}

async function renderCatalog(force = false) {
  if (!state.itemsLoaded || force) {
    renderCatalogShell('<div class="panel loading-block">Loading catalog...</div>');
    try {
      await loadItems(force);
    } catch (error) {
      renderCatalogShell(`
        <div class="panel empty-state">
          <h2>Catalog unavailable</h2>
          <p class="subtle">${escapeHtml(error.message)}</p>
        </div>
      `);
      return;
    }
  }

  const items = filteredItems();
  const meta = `
    <span class="badge">${items.length} shown</span>
    <span class="badge">${state.items.length} total</span>
  `;

  if (items.length === 0) {
    renderCatalogShell(`
      <div class="panel empty-state">
        <h2>No matching items</h2>
        <p class="subtle">Try another search term or refresh the catalog.</p>
      </div>
    `, meta);
    return;
  }

  const cards = items.map((item) => `
    <a class="item-card" href="/catalog/${Number(item.id)}" data-link aria-label="View ${escapeHtml(item.name)} details">
      <div class="item-art" aria-hidden="true">
        <span class="item-initials">${escapeHtml(itemInitials(item.name))}</span>
      </div>
      <div class="item-body">
        <h3 class="item-name">${escapeHtml(item.name)}</h3>
        <div class="price">${money(item.price)}</div>
        <div class="stock-row">
          <span class="badge ${stockClass(item.stock)}">${Number(item.stock)} in stock</span>
          <span class="badge">ID ${Number(item.id)}</span>
        </div>
      </div>
    </a>
  `).join('');

  renderCatalogShell(`<div class="grid">${cards}</div>`, meta);
}

function renderItemDetailShell(content) {
  app.innerHTML = `
    <section>
      <div class="section-head">
        <div>
          <p class="kicker">Item detail</p>
          <h1>Product view</h1>
          <p class="subtle">Single item data from the backend item endpoint.</p>
        </div>
        <a class="btn btn-secondary" href="/catalog" data-link>Back to catalog</a>
      </div>

      ${content}
    </section>
  `;
}

async function renderItemDetail() {
  const id = itemIdFromPath();

  if (!Number.isInteger(id) || id < 1) {
    renderItemDetailShell(`
      <div class="panel empty-state">
        <h2>Item not found</h2>
        <p class="subtle">Open an item from the catalog to see its details.</p>
      </div>
    `);
    return;
  }

  renderItemDetailShell('<div class="panel loading-block">Loading item...</div>');

  try {
    const item = await api(`/items/${id}`);
    const createdDate = item.created_at
      ? new Date(item.created_at).toLocaleDateString('id-ID')
      : '-';

    renderItemDetailShell(`
      <div class="detail-layout">
        <section class="panel item-detail-hero">
          <div class="item-art detail-art" aria-hidden="true">
            <span class="item-initials">${escapeHtml(itemInitials(item.name))}</span>
          </div>
          <div>
            <p class="kicker">ID ${Number(item.id)}</p>
            <h1>${escapeHtml(item.name)}</h1>
            <p class="price detail-price">${money(item.price)}</p>
            <div class="stock-row">
              <span class="badge ${stockClass(item.stock)}">${Number(item.stock)} in stock</span>
              <span class="badge">Created ${escapeHtml(createdDate)}</span>
            </div>
          </div>
        </section>

        <aside class="panel profile-card">
          <h2>Inventory summary</h2>
          <div class="details-list">
            <div class="detail"><span>Item ID</span><span>${Number(item.id)}</span></div>
            <div class="detail"><span>Unit price</span><span>${money(item.price)}</span></div>
            <div class="detail"><span>Available stock</span><span>${Number(item.stock)}</span></div>
            <div class="detail"><span>Stock value</span><span>${money(Number(item.price) * Number(item.stock))}</span></div>
          </div>
        </aside>
      </div>
    `);
  } catch (error) {
    renderItemDetailShell(`
      <div class="panel empty-state">
        <h2>Item unavailable</h2>
        <p class="subtle">${escapeHtml(error.message)}</p>
      </div>
    `);
  }
}

function numberValue(value) {
  return Number(value || 0);
}

function compactDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function renderReportsShell(content) {
  app.innerHTML = `
    <section>
      <div class="section-head">
        <div>
          <p class="kicker">Reports</p>
          <h1>Store reports</h1>
          <p class="subtle">Sales summaries from the backend report endpoints.</p>
        </div>
        <button class="btn btn-secondary" type="button" id="refreshReports">Refresh</button>
      </div>

      ${content}
    </section>
  `;
}

function rowList(rows) {
  return rows.join('') || '<p class="subtle">No data yet.</p>';
}

async function renderReports() {
  renderReportsShell('<div class="panel loading-block">Loading reports...</div>');

  try {
    const [topUsers, itemsSold, monthlySales] = await Promise.all([
      api('/reports/top-users'),
      api('/reports/items-sold'),
      api('/reports/monthly-sales'),
    ]);

    const totalRevenue = itemsSold.reduce((sum, item) => sum + numberValue(item.total_revenue), 0);
    const totalSold = itemsSold.reduce((sum, item) => sum + numberValue(item.total_quantity_sold), 0);
    const paidTransactions = monthlySales.reduce((sum, row) => sum + numberValue(row.transaction_count), 0);
    const maxRevenue = Math.max(...itemsSold.map((item) => numberValue(item.total_revenue)), 1);

    const topUserRows = topUsers.slice(0, 5).map((user) => `
      <div class="report-row">
        <span>#${Number(user.rank)} ${escapeHtml(user.name)}</span>
        <strong>${money(user.total_spent)}</strong>
      </div>
    `);

    const itemRows = itemsSold.map((item) => {
      const width = Math.max(6, Math.round((numberValue(item.total_revenue) / maxRevenue) * 100));
      return `
        <div class="report-item">
          <div class="report-row">
            <span>${escapeHtml(item.name)}</span>
            <strong>${money(item.total_revenue)}</strong>
          </div>
          <div class="report-bar" aria-hidden="true"><span style="width:${width}%"></span></div>
          <p class="hint">${numberValue(item.total_quantity_sold)} sold - ${numberValue(item.stock)} left</p>
        </div>
      `;
    });

    const monthRows = monthlySales.map((row) => `
      <div class="report-row">
        <span>${compactDate(row.month)}</span>
        <strong>${money(row.total_revenue)}</strong>
      </div>
    `);

    renderReportsShell(`
      <div class="metric-grid">
        <section class="panel metric-card">
          <span>Total revenue</span>
          <strong>${money(totalRevenue)}</strong>
        </section>
        <section class="panel metric-card">
          <span>Items sold</span>
          <strong>${totalSold}</strong>
        </section>
        <section class="panel metric-card">
          <span>Paid transactions</span>
          <strong>${paidTransactions}</strong>
        </section>
      </div>

      <div class="reports-grid">
        <section class="panel report-card">
          <h2>Top users</h2>
          ${rowList(topUserRows)}
        </section>
        <section class="panel report-card report-card-wide">
          <h2>Items sold</h2>
          ${rowList(itemRows)}
        </section>
        <section class="panel report-card">
          <h2>Monthly sales</h2>
          ${rowList(monthRows)}
        </section>
      </div>
    `);
  } catch (error) {
    renderReportsShell(`
      <div class="panel empty-state">
        <h2>Reports unavailable</h2>
        <p class="subtle">${escapeHtml(error.message)}</p>
      </div>
    `);
  }
}

function renderProfile() {
  if (!state.user) {
    app.innerHTML = `
      <section class="panel empty-state">
        <p class="kicker">Account</p>
        <h1>Login required</h1>
        <p class="subtle">Sign in to view your account data from the current session.</p>
        <div class="button-row centered">
          <a class="btn btn-primary" href="/login" data-link>Login</a>
          <a class="btn btn-secondary" href="/register" data-link>Register</a>
        </div>
      </section>
    `;
    return;
  }

  app.innerHTML = `
    <section>
      <div class="section-head">
        <div>
          <p class="kicker">Account</p>
          <h1>${escapeHtml(state.user.name || state.user.username)}</h1>
          <p class="subtle">Current authenticated user stored by the browser session.</p>
        </div>
      </div>

      <div class="profile-grid">
        <section class="panel profile-card" aria-labelledby="profileDetails">
          <h2 id="profileDetails">Profile details</h2>
          <div class="details-list">
            <div class="detail"><span>Username</span><span>${escapeHtml(state.user.username)}</span></div>
            <div class="detail"><span>Email</span><span>${escapeHtml(state.user.email)}</span></div>
            <div class="detail"><span>Phone</span><span>${escapeHtml(state.user.phone || '-')}</span></div>
            <div class="detail"><span>Balance</span><span>${money(state.user.balance)}</span></div>
          </div>
          <div class="button-row">
            <a class="btn btn-primary" href="/catalog" data-link>Open catalog</a>
            <button class="btn btn-secondary" type="button" id="logoutButton">Logout</button>
          </div>
        </section>

        <aside class="panel profile-card">
          <h2>Session</h2>
          <p class="subtle">JWT authentication is active for protected requests until the backend token expires or you log out.</p>
          <p class="notice">The catalog remains public, so item browsing still works without a login.</p>
        </aside>
      </div>
    </section>
  `;
}

async function render() {
  const active = routeName();
  updateChrome(active);

  if (active === 'login') renderLogin();
  if (active === 'register') renderRegister();
  if (active === 'reports') await renderReports();
  if (active === 'item-detail') await renderItemDetail();
  if (active === 'profile') renderProfile();
  if (active === 'catalog') await renderCatalog();

  app.focus({ preventScroll: true });
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-link]');
  if (link) {
    event.preventDefault();
    navigate(link.getAttribute('href'));
    return;
  }

  if (event.target.id === 'refreshItems') {
    renderCatalog(true);
    return;
  }

  if (event.target.id === 'refreshReports') {
    renderReports();
    return;
  }

  if (event.target.id === 'logoutButton') {
    clearSession();
    showToast('Logged out');
    navigate('/login');
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'searchInput') {
    state.query = event.target.value;
    renderCatalog();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'sortSelect') {
    state.sort = event.target.value;
    renderCatalog();
  }
});

document.addEventListener('submit', async (event) => {
  if (event.target.id === 'loginForm') {
    event.preventDefault();
    const form = event.target;
    const error = document.querySelector('#loginError');
    const button = form.querySelector('button[type="submit"]');
    error.hidden = true;
    button.disabled = true;

    try {
      const payload = await api('/auth/login', {
        method: 'POST',
        body: formData(form),
      });
      setSession(payload);
      showToast('Login successful');
      navigate('/catalog');
    } catch (requestError) {
      error.textContent = requestError.message;
      error.hidden = false;
    } finally {
      button.disabled = false;
      updateChrome(routeName());
    }
  }

  if (event.target.id === 'registerForm') {
    event.preventDefault();
    const form = event.target;
    const error = document.querySelector('#registerError');
    const button = form.querySelector('button[type="submit"]');
    error.hidden = true;
    button.disabled = true;

    try {
      await api('/user/register', {
        method: 'POST',
        body: formData(form),
      });
      showToast('Account created');
      navigate('/login');
    } catch (requestError) {
      error.textContent = requestError.message;
      error.hidden = false;
    } finally {
      button.disabled = false;
    }
  }
});

window.addEventListener('popstate', render);
render();
