// Professional Website JavaScript
class WebsiteManager {
  constructor() {
    this.initializeNavigation();
    this.initializeModals();
    this.initializeAuth();
    this.initializeSmoothScrolling();
    this.initializeAnimations();
  }

  project() {
    const el = document.getElementById("project");
    if (!el) return; // guard to avoid runtime error
    el.scrollIntoView({ behavior: 'smooth' });
  }

  contact() {
    const el = document.getElementById("contact");
    if (!el) return; // guard to avoid runtime error
    el.scrollIntoView({ behavior: 'smooth' });
  }

  initializeNavigation() {
    // Navbar scroll effect
    window.addEventListener("scroll", () => {
      const navbar = document.getElementById("navbar");
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });

    // Mobile menu toggle
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");

    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        hamburger.classList.toggle("open");
      });

      // Close menu when clicking a link
      document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
          navLinks.classList.remove("active");
          hamburger.classList.remove("open");
        });
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
          navLinks.classList.remove("active");
          hamburger.classList.remove("open");
        }
      });
    }
  }

  initializeModals() {
    // Modal functions
    window.openModal = () => {
      const modal = document.getElementById("consultationModal");
      if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    };

    window.closeModal = () => {
      const modal = document.getElementById("consultationModal");
      if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    };

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      const modal = document.getElementById("consultationModal");
      if (e.target === modal) {
        window.closeModal();
      }
    });

    // Handle consultation form submission
    const consultationForm = document.querySelector("#consultationModal form");
    if (consultationForm) {
      consultationForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleConsultationSubmission(consultationForm);
      });
    }

    // Handle contact form submission
    const contactForm = document.querySelector(".get-in-touch-section form");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleContactSubmission(contactForm);
      });
    }
  }

  initializeAuth() {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Check authentication and update UI
    this.checkAuthAndUpdateUI();

    // Logout functionality
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.handleLogout();
      });
    }
  }

  updateAuthUI(isLoggedIn, user = null) {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const dashboardLink = document.getElementById("dashboardLink");

    if (isLoggedIn && user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (dashboardLink) dashboardLink.style.display = "inline-block";
      if (logoutBtn) {
        // Set dashboard link text and action based on role
        if (user.role === 'admin') {
          dashboardLink.innerHTML = '<i class="fas fa-shield-alt"></i> Admin Panel';
        } else {
          dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
        }
        logoutBtn.style.display = "inline-block";
        logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout (${user.username || user.email})`;
      }
    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (dashboardLink) dashboardLink.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }

  handleLogout() {
    // Show confirmation
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("userSession");
      this.updateAuthUI(false);
      
      // Show success message
      this.showNotification("Logged out successfully!", "success");
      
      // Redirect to login page after delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  }

  // Add method to redirect to dashboard
  redirectToDashboard() {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      try {
        const session = JSON.parse(userSession);
        if (session.isLoggedIn && session.user) {
          // Check if user is admin
          if (session.user.role === 'admin') {
            window.location.href = "admin.html";
          } else {
            window.location.href = "dashboard.html";
          }
        }
      } catch (error) {
        console.error('Session parsing error:', error);
        localStorage.removeItem('userSession');
        window.location.href = "index.html";
      }
    }
  }

  // Check authentication and update UI
  checkAuthAndUpdateUI() {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      try {
        const session = JSON.parse(userSession);
        if (session.isLoggedIn && session.user) {
          this.updateAuthUI(true, session.user);
          
          // Update dashboard link based on role
          const dashboardLink = document.getElementById("dashboardLink");
          if (dashboardLink) {
            if (session.user.role === 'admin') {
              dashboardLink.textContent = 'Admin Panel';
              dashboardLink.onclick = () => window.location.href = 'admin.html';
            } else {
              dashboardLink.textContent = 'Dashboard';
              dashboardLink.onclick = () => window.location.href = 'dashboard.html';
            }
          }
        }
      } catch (error) {
        console.error('Session parsing error:', error);
        localStorage.removeItem('userSession');
      }
    }
  }

  initializeSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for fixed navbar
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  initializeAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .fp-card, .choose-card, .testimonial-card, .contact-card');
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  async handleConsultationSubmission(form) {
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') || form.querySelector('input[type="text"]').value,
      email: formData.get('email') || form.querySelector('input[type="email"]').value,
      message: formData.get('message') || form.querySelector('textarea').value,
      type: 'consultation'
    };

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      this.showNotification("Please fill in all fields.", "error");
      return;
    }

    if (!this.isValidEmail(data.email)) {
      this.showNotification("Please enter a valid email address.", "error");
      return;
    }

    try {
      // Simulate API call (replace with actual endpoint)
      await this.simulateAPICall(data);
      
      this.showNotification("Thank you! We'll contact you within 24 hours.", "success");
      form.reset();
      window.closeModal();
    } catch (error) {
      console.error('Consultation submission error:', error);
      this.showNotification("Sorry, there was an error. Please try again.", "error");
    }
  }

  async handleContactSubmission(form) {
    const formData = new FormData(form);
    const data = {
      firstName: formData.get('firstName') || form.querySelector('#fullName').value,
      lastName: formData.get('lastName') || form.querySelector('#phoneNumber').value,
      phone: form.querySelector('#phoneNumber').value,
      email: form.querySelector('#emailAddress').value,
      service: form.querySelector('#service').value,
      message: form.querySelector('#projectDetails').value,
      type: 'contact'
    };

    // Validation
    const requiredFields = ['firstName', 'email', 'service'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      this.showNotification("Please fill in all required fields.", "error");
      return;
    }

    if (!this.isValidEmail(data.email)) {
      this.showNotification("Please enter a valid email address.", "error");
      return;
    }

    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.innerHTML;
    
    try {
      // Show loading state
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitButton.disabled = true;

      // Simulate API call (replace with actual endpoint)
      await this.simulateAPICall(data);
      
      this.showNotification("Message sent successfully! We'll get back to you soon.", "success");
      form.reset();
    } catch (error) {
      console.error('Contact submission error:', error);
      this.showNotification("Sorry, there was an error. Please try again.", "error");
    } finally {
      // Reset button state
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  }

  async simulateAPICall(data) {
    // Simulate network delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          console.log('Form submission data:', data);
          resolve({ success: true });
        } else {
          reject(new Error('Simulated network error'));
        }
      }, 1500);
    });
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification {
          position: fixed;
          top: 100px;
          right: 20px;
          z-index: 3000;
          max-width: 400px;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
          animation: slideInRight 0.3s ease;
        }
        .notification-success {
          background: rgba(72, 187, 120, 0.95);
          color: white;
          border-left: 4px solid #38a169;
        }
        .notification-error {
          background: rgba(229, 62, 62, 0.95);
          color: white;
          border-left: 4px solid #e53e3e;
        }
        .notification-info {
          background: rgba(102, 126, 234, 0.95);
          color: white;
          border-left: 4px solid #667eea;
        }
        .notification-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .notification-content i {
          font-size: 1.2rem;
        }
        .notification-close {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.5rem;
          cursor: pointer;
          margin-left: auto;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .notification-close:hover {
          opacity: 1;
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        this.removeNotification(notification);
      }
    }, 5000);
  }

  removeNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }
}

// Initialize the website manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WebsiteManager();
});

// Add loading screen functionality
window.addEventListener('load', () => {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
});

// Add scroll-to-top functionality
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
  z-index: 1000;
`;

document.body.appendChild(scrollToTopBtn);

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollToTopBtn.style.opacity = '1';
    scrollToTopBtn.style.visibility = 'visible';
  } else {
    scrollToTopBtn.style.opacity = '0';
    scrollToTopBtn.style.visibility = 'hidden';
  }
});

// Scroll to top functionality
scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

scrollToTopBtn.addEventListener('mouseenter', () => {
  scrollToTopBtn.style.transform = 'translateY(-3px) scale(1.1)';
});

scrollToTopBtn.addEventListener('mouseleave', () => {
  scrollToTopBtn.style.transform = 'translateY(0) scale(1)';
});

// Global function for dashboard redirect
function redirectToDashboard() {
  const userSession = localStorage.getItem("userSession");
  if (userSession) {
    try {
      const session = JSON.parse(userSession);
      if (session.isLoggedIn && session.user) {
        // Check if user is admin
        if (session.user.role === 'admin') {
          window.location.href = "admin.html";
        } else {
          window.location.href = "dashboard.html";
        }
      }
    } catch (error) {
      console.error('Session parsing error:', error);
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "index.html";
  }
}