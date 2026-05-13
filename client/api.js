const API_BASE = 'https://vertexhub-io.vercel.app/api';

function getToken() {
  return localStorage.getItem('authToken');
}

function setToken(token) {
  localStorage.setItem('authToken', token);
}

function clearToken() {
  localStorage.removeItem('authToken');
}

function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem('user');
}

function isAuthenticated() {
  return getToken() !== null;
}

async function register(fullname, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullname, email, password }),
  });

  const data = await res.json();
  if (data.success) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
}

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (data.success) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
}

function logout() {
  clearToken();
  clearUser();
  window.location.href = 'index.html';
}

async function createTicket(fullname, email, phone, txnType, amount, txnRef, description) {
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Not authenticated' };
  }

  const res = await fetch(`${API_BASE}/tickets/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ fullname, email, phone, txnType, amount, txnRef, description }),
  });
  
  return await res.json();
}

async function getTicket(ticketId) {
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Not authenticated' };
  }

  const cleanId = String(ticketId || '').trim().replace(/^#/, '');
  if (!cleanId) {
    return { success: false, message: 'Please provide a valid ticket ID.' };
  }

  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(cleanId)}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    return { success: false, message: `Unexpected API response (${res.status}): ${text}` };
  }
}
