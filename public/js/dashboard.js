// User Dashboard JavaScript
class UserDashboard {
  constructor() {
    this.currentUser = null;
    this.projects = [];
    this.init();
  }

  async init() {
    await this.checkAuth();
    this.setupEventListeners();
    await this.loadDashboardData();
  }

  checkAdminAuth() {
  const userSession = localStorage.getItem('userSession');
  if (!userSession) {
    window.location.href = 'index.html';
    return;
  }

    try {
      const session = JSON.parse(userSession);
      if (!session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
      }
      this.currentUser = session.user;
      this.updateUserInfo();
    } catch (error) {
      console.error('Session error:', error);
      localStorage.removeItem('userSession');
      window.location.href = 'index.html';
    }
  }

  updateUserInfo() {
    if (this.currentUser) {
      document.getElementById('userName').textContent = this.currentUser.username || 'User';
      document.getElementById('userEmail').textContent = this.currentUser.email || '';
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        this.showSection(section);
        this.setActiveNav(item);
      });
    });

    // Mobile menu
    document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.sidebar');
      const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
      
      if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });

    // Forms
    document.getElementById('newProjectForm').addEventListener('submit', (e) => {
      this.handleNewProject(e);
    });

    document.getElementById('profileForm').addEventListener('submit', (e) => {
      this.handleProfileUpdate(e);
    });

    // Filters
    document.getElementById('statusFilter').addEventListener('change', () => {
      this.filterProjects();
    });
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');

    // Update page title
    const titles = {
      overview: 'Dashboard Overview',
      projects: 'My Projects',
      'new-project': 'Create New Project',
      profile: 'My Profile'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';

    // Load section-specific data
    if (sectionName === 'profile') {
      this.loadProfile();
    } else if (sectionName === 'projects') {
      this.loadProjects();
    }
  }

  setActiveNav(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    activeItem.classList.add('active');
  }

  async loadDashboardData() {
    this.showLoading(true);
    try {
      await Promise.all([
        this.loadProjects(),
        this.loadStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showNotification('Error loading dashboard data', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async loadProjects() {
    try {
      const response = await fetch(`/api/projects/user/${this.currentUser.id}`);
      if (response.ok) {
        this.projects = await response.json();
        this.updateProjectsDisplay();
        this.updateRecentProjects();
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  async loadStats() {
    try {
      const userProjects = this.projects;
      const stats = {
        total: userProjects.length,
        pending: userProjects.filter(p => p.status === 'pending').length,
        inProgress: userProjects.filter(p => p.status === 'in-progress').length,
        completed: userProjects.filter(p => p.status === 'completed').length
      };

      document.getElementById('totalProjects').textContent = stats.total;
      document.getElementById('pendingProjects').textContent = stats.pending;
      document.getElementById('inProgressProjects').textContent = stats.inProgress;
      document.getElementById('completedProjects').textContent = stats.completed;
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  updateProjectsDisplay() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    if (this.projects.length === 0) {
      projectsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-project-diagram"></i>
          <h3>No Projects Yet</h3>
          <p>Create your first project to get started</p>
          <button class="submit-btn" onclick="dashboard.showSection('new-project')">
            <i class="fas fa-plus"></i>
            Create Project
          </button>
        </div>
      `;
      return;
    }

    projectsGrid.innerHTML = this.projects.map(project => `
      <div class="project-card">
        <div class="project-card-header">
          <h3>${project.title}</h3>
          <span class="project-status ${project.status}">${project.status.replace('-', ' ')}</span>
        </div>
        <p>${project.description}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
        </div>
        <div class="project-meta">
          <span><i class="fas fa-cog"></i> ${project.service}</span>
          <span><i class="fas fa-calendar"></i> ${this.formatDate(project.createdAt)}</span>
        </div>
        ${project.budget ? `<div class="project-budget">Budget: ₹${project.budget.toLocaleString()}</div>` : ''}
      </div>
    `).join('');
  }

  updateRecentProjects() {
    const recentProjectsList = document.getElementById('recentProjectsList');
    if (!recentProjectsList) return;

    const recentProjects = this.projects.slice(0, 5);
    
    if (recentProjects.length === 0) {
      recentProjectsList.innerHTML = '<p class="empty-message">No projects yet</p>';
      return;
    }

    recentProjectsList.innerHTML = recentProjects.map(project => `
      <div class="project-item">
        <div class="project-info">
          <h4>${project.title}</h4>
          <p>${project.service}</p>
        </div>
        <span class="project-status ${project.status}">${project.status.replace('-', ' ')}</span>
      </div>
    `).join('');
  }

  filterProjects() {
    const statusFilter = document.getElementById('statusFilter').value;
    let filteredProjects = this.projects;

    if (statusFilter) {
      filteredProjects = this.projects.filter(project => project.status === statusFilter);
    }

    // Update display with filtered projects
    const projectsGrid = document.getElementById('projectsGrid');
    if (filteredProjects.length === 0) {
      projectsGrid.innerHTML = '<p class="empty-message">No projects match the selected filter</p>';
      return;
    }

    projectsGrid.innerHTML = filteredProjects.map(project => `
      <div class="project-card">
        <div class="project-card-header">
          <h3>${project.title}</h3>
          <span class="project-status ${project.status}">${project.status.replace('-', ' ')}</span>
        </div>
        <p>${project.description}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
        </div>
        <div class="project-meta">
          <span><i class="fas fa-cog"></i> ${project.service}</span>
          <span><i class="fas fa-calendar"></i> ${this.formatDate(project.createdAt)}</span>
        </div>
        ${project.budget ? `<div class="project-budget">Budget: ₹${project.budget.toLocaleString()}</div>` : ''}
      </div>
    `).join('');
  }

  async handleNewProject(e) {
    e.preventDefault();
    
    const formData = {
      title: document.getElementById('projectTitle').value,
      description: document.getElementById('projectDescription').value,
      service: document.getElementById('projectService').value,
      budget: document.getElementById('projectBudget').value || null,
      deadlineFrom: document.getElementById('projectDeadlineFrom').value || null,
      deadlineTo: document.getElementById('projectDeadlineTo').value || null,
      clientId: this.currentUser.id,
      clientName: this.currentUser.username,
      clientEmail: this.currentUser.email
    };

    // Validation
    if (!formData.title || !formData.description || !formData.service) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }

    this.showLoading(true);
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        this.showNotification('Project created successfully!', 'success');
        document.getElementById('newProjectForm').reset();
        await this.loadProjects();
        this.showSection('projects');
      } else {
        this.showNotification(data.msg || 'Error creating project', 'error');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      this.showNotification('Network error. Please try again.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async loadProfile() {
    try {
      const response = await fetch(`/api/users/${this.currentUser.id}`);
      if (response.ok) {
        const userData = await response.json();
        this.populateProfileForm(userData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  populateProfileForm(userData) {
    document.getElementById('profileFirstName').value = userData.profile?.firstName || '';
    document.getElementById('profileLastName').value = userData.profile?.lastName || '';
    document.getElementById('profileEmail').value = userData.email || '';
    document.getElementById('profilePhone').value = userData.profile?.phone || '';
    document.getElementById('profileAddress').value = userData.profile?.address || '';
    document.getElementById('profileCity').value = userData.profile?.city || '';
    document.getElementById('profileState').value = userData.profile?.state || '';
    document.getElementById('profileZip').value = userData.profile?.zipCode || '';
  }

  async handleProfileUpdate(e) {
    e.preventDefault();
    
    const profileData = {
      profile: {
        firstName: document.getElementById('profileFirstName').value,
        lastName: document.getElementById('profileLastName').value,
        phone: document.getElementById('profilePhone').value,
        address: document.getElementById('profileAddress').value,
        city: document.getElementById('profileCity').value,
        state: document.getElementById('profileState').value,
        zipCode: document.getElementById('profileZip').value
      }
    };

    this.showLoading(true);
    try {
      const response = await fetch(`/api/users/${this.currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        this.showNotification('Profile updated successfully!', 'success');
        // Update current user data
        this.currentUser = { ...this.currentUser, ...data.user };
        this.updateUserInfo();
      } else {
        this.showNotification(data.msg || 'Error updating profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      this.showNotification('Network error. Please try again.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
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

// Global functions
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('userSession');
    window.location.href = 'index.html';
  }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new UserDashboard();
});

// Add empty state styles
const emptyStateStyles = `
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #718096;
  }
  
  .empty-state i {
    font-size: 4rem;
    margin-bottom: 20px;
    color: #cbd5e1;
  }
  
  .empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 12px;
    color: #4a5568;
  }
  
  .empty-state p {
    margin-bottom: 24px;
  }
  
  .empty-message {
    text-align: center;
    padding: 40px;
    color: #718096;
    font-style: italic;
  }
  
  .project-budget {
    margin-top: 12px;
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
  }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = emptyStateStyles;
document.head.appendChild(styleSheet);