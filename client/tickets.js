function checkAuth() {
  const token = getToken();
  const registerNav = document.getElementById('registerNav');
  const loginNav = document.getElementById('loginNav');
  const logoutBtn = document.getElementById('logoutBtn');

  if (token) {
    if (registerNav) registerNav.style.display = 'none';
    if (loginNav) loginNav.style.display = 'none';
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    if (registerNav) registerNav.style.display = 'block';
    if (loginNav) loginNav.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';

    const currentPage = document.body.getAttribute('data-page');
    if (currentPage === 'report' || currentPage === 'status') {
      window.location.href = 'register.html';
    }
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

function clearFieldError(input) {
  if (!input) return;
  input.classList.remove('input-error');
  const error = document.getElementById(`${input.id}_err`);
  if (error) {
    error.style.display = 'none';
  }
}

function resetErrors(form) {
  if (!form) return;
  form.querySelectorAll('.form-input').forEach((input) => clearFieldError(input));
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidAmount(value) {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return cleaned.length > 0 && !Number.isNaN(Number(cleaned));
}

// Report Page
if (document.getElementById('reportForm')) {
  document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    resetErrors(e.target);

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const txnType = document.getElementById('txnType').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const txnRef = document.getElementById('txnRef').value.trim();
    const description = document.getElementById('description').value.trim();

    let valid = true;

    if (!fullname) {
      showFieldError(document.getElementById('fullname'), 'Please enter your full name.');
      valid = false;
    }

    if (!email || !isValidEmail(email)) {
      showFieldError(document.getElementById('email'), 'Please enter a valid email address.');
      valid = false;
    }

    if (!phone) {
      showFieldError(document.getElementById('phone'), 'Please enter a phone number.');
      valid = false;
    }

    if (!txnType) {
      showFieldError(document.getElementById('txnType'), 'Please enter the transaction type.');
      valid = false;
    }

    if (!amount || !isValidAmount(amount)) {
      showFieldError(document.getElementById('amount'), 'Please enter a valid numeric amount.');
      valid = false;
    }

    if (!txnRef) {
      showFieldError(document.getElementById('txnRef'), 'Please enter your transaction reference.');
      valid = false;
    }

    if (!description) {
      showFieldError(document.getElementById('description'), 'Please provide a description.');
      valid = false;
    }

    if (!valid) return;

    const result = await createTicket(fullname, email, phone, txnType, amount, txnRef, description);

    if (result.success) {
      const ticketId = result.ticket.ticketId;
      const modal = document.getElementById('successModal');
      const ticketEl = document.getElementById('generatedTicketID');
      if (modal && ticketEl) {
        ticketEl.textContent = `#${ticketId}`;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
      }
      e.target.reset();
    } else {
      alert(result.message);
    }
  });

  document.getElementById('modal-close')?.addEventListener('click', () => {
    const modal = document.getElementById('successModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
    window.location.href = 'status.html';
  });

  document.getElementById('modal-dismiss')?.addEventListener('click', () => {
    const modal = document.getElementById('successModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  document.getElementById('copyBtn')?.addEventListener('click', () => {
    const ticketEl = document.getElementById('generatedTicketID');
    if (ticketEl && navigator.clipboard) {
      const ticketId = ticketEl.textContent.trim();
      navigator.clipboard.writeText(ticketId).then(() => {
        const btn = document.getElementById('copyBtn');
        if (btn) {
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy ID'; }, 2000);
        }
      });
    }
  });

  document.getElementById('successModal')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.classList.remove('show');
      event.currentTarget.setAttribute('aria-hidden', 'true');
    }
  });

  document.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => clearFieldError(input));
  });
}

// Status Page
if (document.getElementById('statusForm')) {
  async function checkStatus() {
    const input = document.getElementById('ticketInput');
    const resultBox = document.getElementById('statusResult');
    if (!input || !resultBox) return;

    const rawId = input.value.trim();
    if (!rawId) {
      showFieldError(input, 'Please enter a ticket ID.');
      resultBox.innerHTML = '';
      return;
    }

    const result = await getTicket(rawId);
    
    if (!result.success) {
      resultBox.innerHTML = `
        <div class="status-error">
          <span class="status-error-icon">⚠️</span>
          <p>${result.message}</p>
        </div>
      `;
      clearFieldError(input);
      return;
    }

    const ticket = result.ticket;
    const STATUS = {
      SUBMITTED:   { label: 'Submitted',   color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
      IN_PROGRESS: { label: 'In Progress', color: '#3B82F6', bg: '#DBEAFE', icon: '🔄' },
      RESOLVED:    { label: 'Resolved',    color: '#10B981', bg: '#D1FAE5', icon: '✅' },
    };

    const STATUS_ORDER = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'];
    const currentIndex = STATUS_ORDER.indexOf(ticket.status);
    const statusInfo = STATUS[ticket.status];

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
    const createdAt = new Date(ticket.submittedAt).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    resultBox.innerHTML = `
      <div class="status-card">
        <div class="status-card-header">
          <div>
            <div class="ticket-id-label">Ticket ID</div>
            <div class="ticket-id-value">#${ticket.ticketId}</div>
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
    clearFieldError(input);
  }

  document.getElementById('statusForm').addEventListener('submit', (e) => {
    e.preventDefault();
    checkStatus();
  });

  document.getElementById('ticketInput')?.addEventListener('input', () => {
    clearFieldError(document.getElementById('ticketInput'));
  });
}

document.addEventListener('DOMContentLoaded', checkAuth);
