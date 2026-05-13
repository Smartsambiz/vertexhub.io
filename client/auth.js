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

function isValidPassword(value) {
  return value.length >= 6;
}

// Register Page
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    resetErrors(e.target);

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    let valid = true;

    if (!fullname) {
      showFieldError(document.getElementById('fullname'), 'Please enter your full name.');
      valid = false;
    }

    if (!email || !isValidEmail(email)) {
      showFieldError(document.getElementById('email'), 'Please enter a valid email address.');
      valid = false;
    }

    if (!isValidPassword(password)) {
      showFieldError(document.getElementById('password'), 'Password must be at least 6 characters.');
      valid = false;
    }

    if (!valid) return;

    const result = await register(fullname, email, password);
    if (result.success) {
      window.location.href = 'report.html';
    } else {
      alert(result.message);
    }
  });

  document.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => clearFieldError(input));
  });
}

// Login Page
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    resetErrors(e.target);

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    let valid = true;

    if (!email || !isValidEmail(email)) {
      showFieldError(document.getElementById('email'), 'Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      showFieldError(document.getElementById('password'), 'Please enter your password.');
      valid = false;
    }

    if (!valid) return;

    const result = await login(email, password);
    if (result.success) {
      window.location.href = 'report.html';
    } else {
      alert(result.message);
    }
  });

  document.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => clearFieldError(input));
  });
}
