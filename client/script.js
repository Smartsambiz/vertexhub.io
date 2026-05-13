// ─────────────────────────────────────────────
//  VERTEXIA HUB — Core Engine
//  Handles: ticket generation, storage, status
// ─────────────────────────────────────────────



const DB_KEY = 'vertexia_tickets';

const STATUS = {
  SUBMITTED:   { label: 'Submitted',   color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
  IN_PROGRESS: { label: 'In Progress', color: '#3B82F6', bg: '#DBEAFE', icon: '🔄' },
  RESOLVED:    { label: 'Resolved',    color: '#10B981', bg: '#D1FAE5', icon: '✅' },
};

const STATUS_ORDER = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'];



function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidAmount(value) {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return cleaned.length > 0 && !Number.isNaN(Number(cleaned));
}

function markActiveNavLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === current);
  });
}

function clearFieldError(input) {
  if (!input) return;
  input.classList.remove('input-error');
  const error = document.getElementById(`${input.id}_err`);
  if (error) {
    error.style.display = 'none';
  }
}

function showFieldError(input, message) {
  if (!input) return;
  input.classList.add('input-error');
  const error = document.getElementById(`${input.id}_err`);
  if (error) {
    error.textContent = message;
    error.style.display = 'block';
  }
}

function resetErrors(form) {
  if (!form) return;
  form.querySelectorAll('.form-input').forEach((input) => clearFieldError(input));
}

function showSuccessModal(ticketId) {
  const modal = document.getElementById('successModal');
  const ticketEl = document.getElementById('generatedTicketID');
  if (!modal || !ticketEl) return;

  ticketEl.textContent = `#${ticketId}`;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = document.getElementById('successModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function copyTicketID() {
  const ticketEl = document.getElementById('generatedTicketID');
  if (!ticketEl || !navigator.clipboard) return;

  const ticketId = ticketEl.textContent.trim();
  navigator.clipboard.writeText(ticketId).then(() => {
    const button = document.getElementById('copyBtn');
    if (button) {
      button.textContent = 'Copied!';
      setTimeout(() => { button.textContent = 'Copy ID'; }, 2000);
    }
  });
}

function renderStatusCard(ticket) {
  const statusInfo = STATUS[ticket.status];
  const currentIndex = STATUS_ORDER.indexOf(ticket.status);

  const stepsHTML = STATUS_ORDER.map((key, index) => {
    const status = STATUS[key];
    const done = index <= currentIndex;
    const active = index === currentIndex;
    return `
      <div class="progress-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
        <div class="step-dot">${done ? '✓' : index + 1}</div>
        <span>${status.label}</span>
      </div>
      ${index < STATUS_ORDER.length - 1 ? `<div class="step-line ${index < currentIndex ? 'done' : ''}"></div>` : ''}`;
  }).join('');

  const amountValue = Number(ticket.amount.replace(/[^0-9.]/g, ''));
  const amountText = Number.isNaN(amountValue) ? ticket.amount : `₦${amountValue.toLocaleString()}`;
  const createdAt = new Date(ticket.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return `
    <div class="status-card">
      <div class="status-card-header">
        <div>
          <div class="ticket-id-label">Ticket ID</div>
          <div class="ticket-id-value">#${ticket._id || ticket.id}</div>
        </div>
        <span class="status-badge" style="color: ${statusInfo.color}; background: ${statusInfo.bg};">
          ${statusInfo.icon} ${statusInfo.label}
        </span>
      </div>

      <div class="progress-track">${stepsHTML}</div>

      <div class="ticket-details">
        <div class="detail-row"><span>Name</span><strong>${ticket.fullname}</strong></div>
        <div class="detail-row"><span>Transaction Type</span><strong>${ticket.txnType}</strong></div>
        <div class="detail-row"><span>Amount</span><strong>${amountText}</strong></div>
        <div class="detail-row"><span>Reference</span><strong>${ticket.txnRef}</strong></div>
        <div class="detail-row"><span>Filed On</span><strong>${createdAt}</strong></div>
        <div class="detail-row full"><span>Description</span><strong>${ticket.description}</strong></div>
      </div>

      <p class="status-note">Keep your ticket ID safe. Updates will reflect here automatically.</p>
    </div>
  `;
}

function showStatusError(message) {
  const resultBox = document.getElementById('statusResult');
  if (!resultBox) return;
  resultBox.innerHTML = `
    <div class="status-error">
      <span class="status-error-icon">⚠️</span>
      <p>${message}</p>
    </div>
  `;
}

function checkStatus() {
  const input = document.getElementById('ticketInput');
  const resultBox = document.getElementById('statusResult');
  if (!input || !resultBox) return;

  const rawId = input.value.trim();
  if (!rawId) {
    showFieldError(input, 'Please enter a ticket ID.');
    resultBox.innerHTML = '';
    return;
  }

  const normalizedId = rawId.toUpperCase().replace(/^#/, '');
  resultBox.innerHTML = '<p class="loading">Checking status...</p>';

  const ticket = await getTicket(normalizedId);
  if (!ticket) {
    showStatusError(`No ticket found with ID <strong>${normalizedId}</strong>. Please check and try again.`);
    return;
  }

  resultBox.innerHTML = renderStatusCard(ticket);
}

function handleReportSubmit(event) {
  event.preventDefault();
  const form = event.target;
  resetErrors(form);

  const values = {
    fullname: form.fullname.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    txnType: form.txnType.value.trim(),
    amount: form.amount.value.trim(),
    txnRef: form.txnRef.value.trim(),
    description: form.description.value.trim(),
  };

  let valid = true;

  Object.entries(values).forEach(([key, value]) => {
    const input = form[key];
    if (!value) {
      showFieldError(input, 'This field is required.');
      valid = false;
    }
  });

  if (values.email && !isValidEmail(values.email)) {
    showFieldError(form.email, 'Please enter a valid email address.');
    valid = false;
  }

  if (values.amount && !isValidAmount(values.amount)) {
    showFieldError(form.amount, 'Please enter a valid numeric amount.');
    valid = false;
  }

  if (!valid) return;

  const ticket = await createTicket(
    values.fullname,
    values.email,
    values.phone,
    values.txnType,
    values.amount,
    values.txnRef,
    values.description
  )

  if(result && result.success !== false) {
    form.reset();
    showSuccessModal(result.ticket._id || result.ticket.id);
  }else {
    alert(result.message || 'Failed to submit your ticket. Please try again.');
  }
}

function initReportPage() {
  const form = document.getElementById('reportForm');
  if (!form) return;

  form.addEventListener('submit', handleReportSubmit);

  document.getElementById('modal-close')?.addEventListener('click', () => {
    closeModal();
    window.location.href = 'status.html';
  });

  document.getElementById('modal-dismiss')?.addEventListener('click', closeModal);
  document.getElementById('copyBtn')?.addEventListener('click', copyTicketID);
  document.getElementById('successModal')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  });
}

function initStatusPage() {
  const form = document.getElementById('statusForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    checkStatus();
  });
}

function initInputListeners() {
  document.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => clearFieldError(input));
  });
}

function init() {
  markActiveNavLink();
  initReportPage();
  initStatusPage();
  initInputListeners();
}

document.addEventListener('DOMContentLoaded', init);
