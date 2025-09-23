// Professional Authentication Script
class AuthManager {
  constructor() {
    this.initializeEventListeners();
    this.setupFormValidation();
  }

  initializeEventListeners() {
    // Form toggle functions
    window.showSignup = () => this.showSignup();
    window.showLogin = () => this.showLogin();

    // Form submissions
    document.getElementById("loginForm").addEventListener("submit", (e) => this.handleLogin(e));
    document.getElementById("signupForm").addEventListener("submit", (e) => this.handleSignup(e));

    // Real-time validation
    this.setupRealTimeValidation();
  }

  setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(input) {
    const inputBox = input.parentElement;
    inputBox.classList.remove('error');

    if (!input.validity.valid) {
      inputBox.classList.add('error');
      return false;
    }
    return true;
  }

  clearFieldError(input) {
    const inputBox = input.parentElement;
    inputBox.classList.remove('error');
  }

  setupFormValidation() {
    // Add custom validation styles
    const style = document.createElement('style');
    style.textContent = `
      .input-box.error input {
        border-color: #e53e3e !important;
        background-color: #fed7d7 !important;
      }
      .input-box.error i {
        color: #e53e3e !important;
      }
    `;
    document.head.appendChild(style);
  }

  showMessage(elementId, message, type = 'error') {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 5000);
    }
  }

  hideMessage(elementId) {
    const messageEl = document.getElementById(elementId);
    messageEl.style.display = 'none';
  }

  setButtonLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  showSignup() {
    document.getElementById("login-box").classList.add("hidden");
    document.getElementById("signup-box").classList.remove("hidden");
    this.hideMessage('login-message');
    this.clearForm('loginForm');
  }

  showLogin() {
    document.getElementById("signup-box").classList.add("hidden");
    document.getElementById("login-box").classList.remove("hidden");
    this.hideMessage('signup-message');
    this.clearForm('signupForm');
  }

  clearForm(formId) {
    const form = document.getElementById(formId);
    form.reset();
    
    // Clear any error states
    const inputBoxes = form.querySelectorAll('.input-box');
    inputBoxes.forEach(box => box.classList.remove('error'));
  }

  validateForm(formData, isSignup = false) {
    const errors = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Username validation for signup
    if (isSignup) {
      if (formData.username.length < 5) {
        errors.push('Full name must be at least 5 characters long');
      }
      
      if (!/^[a-zA-Z\s]+$/.test(formData.username)) {
        errors.push('Full name should only contain letters and spaces');
      }
    }

    return errors;
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // Client-side validation
    const errors = this.validateForm({ email, password });
    if (errors.length > 0) {
      this.showMessage('login-message', errors[0], 'error');
      return;
    }

    this.setButtonLoading('loginBtn', true);
    this.hideMessage('login-message');

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.showMessage('login-message', 'Login successful! Redirecting...', 'success');
        
        // Store user session
        localStorage.setItem('userSession', JSON.stringify({
          isLoggedIn: true,
          user: data.user,
          loginTime: new Date().toISOString()
        }));

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = "main.html";
        }, 1500);
      } else {
        this.showMessage('login-message', data.msg || 'Login failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('login-message', 'Network error. Please check your connection and try again.', 'error');
    } finally {
      this.setButtonLoading('loginBtn', false);
    }
  }

  async handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    // Client-side validation
    const errors = this.validateForm({ username, email, password }, true);
    if (errors.length > 0) {
      this.showMessage('signup-message', errors[0], 'error');
      return;
    }

    this.setButtonLoading('signupBtn', true);
    this.hideMessage('signup-message');

    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.showMessage('signup-message', 'Account created successfully! Please sign in.', 'success');
        
        // Auto-switch to login after success
        setTimeout(() => {
          this.showLogin();
          // Pre-fill email in login form
          document.getElementById('loginEmail').value = email;
        }, 2000);
      } else {
        this.showMessage('signup-message', data.msg || 'Registration failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      this.showMessage('signup-message', 'Network error. Please check your connection and try again.', 'error');
    } finally {
      this.setButtonLoading('signupBtn', false);
    }
  }
}

// Initialize the authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  const userSession = localStorage.getItem('userSession');
  if (userSession) {
    try {
      const session = JSON.parse(userSession);
      if (session.isLoggedIn) {
        // Check if session is still valid (optional: implement session timeout)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        // Auto-logout after 24 hours
        if (hoursSinceLogin < 24) {
          window.location.href = "main.html";
        } else {
          localStorage.removeItem('userSession');
        }
      }
    } catch (error) {
      console.error('Session parsing error:', error);
      localStorage.removeItem('userSession');
    }
  }
});