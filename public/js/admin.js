// Admin Dashboard JavaScript
class AdminDashboard {
  constructor() {
    this.projects = [];
    this.users = [];
    this.stats = {};
    this.init();
  }

  async init() {
    this.checkAdminAuth();
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
      if (!session.isLoggedIn || session.user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
      }
    } catch (error) {
      console.error('Session error:', error);
      localStorage.removeItem('userSession');
      window.location.href = 'index.html';
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

    // Filters
    document.getElementById('statusFilter').addEventListener('change', () => {
      this.filterProjects();
    });

    document.getElementById('serviceFilter').addEventListener('change', () => {
      this.filterProjects();
    });

    document.getElementById('userSearch').addEventListener('input', () => {
      this.filterUsers();
    });

    document.getElementById('userStatusFilter').addEventListener('change', () => {
      this.filterUsers();
    });

    // Project update form
    document.getElementById('updateProjectForm').addEventListener('submit', (e) => {
      this.handleProjectUpdate(e);
    });

    // Progress slider
    document.getElementById('modalProgress').addEventListener('input', (e) => {
      document.getElementById('progressValue').textContent = e.target.value + '%';
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
      overview: 'Admin Dashboard',
      projects: 'All Projects',
      users: 'User Management',
      analytics: 'Analytics & Reports',
      settings: 'System Settings'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Admin Dashboard';

    // Load section-specific data
    if (sectionName === 'users') {
      this.loadUsers();
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
        this.loadStats(),
        this.loadProjects(),
        this.loadUsers()
      ]);
      this.updateRecentProjects();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showNotification('Error loading dashboard data', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async loadStats() {
    try {
      const response = await fetch('/api/projects/stats');
      if (response.ok) {
        this.stats = await response.json();
        this.updateStatsDisplay();
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  updateStatsDisplay() {
    document.getElementById('totalProjects').textContent = this.stats.totalProjects || 0;
    document.getElementById('totalUsers').textContent = this.stats.totalUsers || 0;
    document.getElementById('pendingProjects').textContent = this.stats.pendingProjects || 0;
    document.getElementById('completedProjects').textContent = this.stats.completedProjects || 0;
  }

  async loadProjects() {
    try {
      const response = await fetch('/api/projects/all');
      if (response.ok) {
        this.projects = await response.json();
        this.updateProjectsTable();
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  updateProjectsTable() {
    const tableBody = document.getElementById('projectsTableBody');
    if (!tableBody) return;

    if (this.projects.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-message">No projects found</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = this.projects.map(project => `
      <tr>
        <td>
          <div class="project-title-cell">${project.title}</div>
          <div class="project-description">${project.description.substring(0, 100)}...</div>
        </td>
        <td>
          <div class="client-info">
            <div class="client-name">${project.clientName}</div>
            <div class="client-email">${project.clientEmail}</div>
          </div>
        </td>
        <td>
          <span class="service-tag">${project.service}</span>
        </td>
        <td>
          <span class="project-status ${project.status}">${project.status.replace('-', ' ')}</span>
        </td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar-small">
              <div class="progress-fill-small" style="width: ${project.progress || 0}%"></div>
            </div>
            <span class="progress-text">${project.progress || 0}%</span>
          </div>
        </td>
        <td>
          <div class="deadline-cell ${this.isOverdue(project.deadlineTo) ? 'deadline-overdue' : ''}">
            ${project.deadlineTo ? this.formatDate(project.deadlineTo) : 'Not set'}
          </div>
        </td>
        <td>
          <div class="actions-cell">
            <button class="action-btn-small btn-edit" onclick="adminDashboard.openProjectModal('${project._id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn-small btn-delete" onclick="adminDashboard.deleteProject('${project._id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
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
      <div class="recent-project-item">
        <div>
          <div class="project-title">${project.title}</div>
          <div class="project-client">${project.clientName}</div>
        </div>
        <span class="project-status ${project.status}">${project.status.replace('-', ' ')}</span>
      </div>
    `).join('');
  }

  async loadUsers() {
    try {
      const response = await fetch('/api/users/all');
      if (response.ok) {
        this.users = await response.json();
        this.updateUsersGrid();
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  updateUsersGrid() {
    const usersGrid = document.getElementById('usersGrid');
    if (!usersGrid) return;

    if (this.users.length === 0) {
      usersGrid.innerHTML = '<p class="empty-message">No users found</p>';
      return;
    }

    usersGrid.innerHTML = this.users.map(user => {
      const userProjects = this.projects.filter(p => p.client === user._id);
      return `
        <div class="user-card">
          <div class="user-card-header">
            <div class="user-avatar-large">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-info-large">
              <h3>${user.username}</h3>
              <p>${user.email}</p>
            </div>
          </div>
          <div class="user-stats">
            <div class="user-stat">
              <div class="user-stat-value">${userProjects.length}</div>
              <div class="user-stat-label">Projects</div>
            </div>
            <div class="user-stat">
              <div class="user-stat-value">${userProjects.filter(p => p.status === 'completed').length}</div>
              <div class="user-stat-label">Completed</div>
            </div>
            <div class="user-stat">
              <div class="user-stat-value">${this.formatDate(user.createdAt)}</div>
              <div class="user-stat-label">Joined</div>
            </div>
          </div>
          <div class="user-actions">
            <span class="user-status ${user.isActive ? 'active' : 'inactive'}">
              ${user.isActive ? 'Active' : 'Inactive'}
            </span>
            <button class="action-btn-small ${user.isActive ? 'btn-delete' : 'btn-edit'}" 
                    onclick="adminDashboard.toggleUserStatus('${user._id}')">
              <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  filterProjects() {
    const statusFilter = document.getElementById('statusFilter').value;
    const serviceFilter = document.getElementById('serviceFilter').value;
    
    let filteredProjects = this.projects;

    if (statusFilter) {
      filteredProjects = filteredProjects.filter(project => project.status === statusFilter);
    }

    if (serviceFilter) {
      filteredProjects = filteredProjects.filter(project => project.service === serviceFilter);
    }

    // Update table with filtered projects
    const tableBody = document.getElementById('projectsTableBody');
    if (filteredProjects.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-message">No projects match the selected filters</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filteredProjects.map(project => `
      <tr>
        <td>
          <div class="project-title-cell">${project.title}</div>
          <div class="project-description">${project.description.substring(0, 100)}...</div>
        </td>
        <td>
          <div class="client-info">
            <div class="client-name">${project.clientName}</div>
            <div class="client-email">${project.clientEmail}</div>
          </div>
        </td>
        <td>
          <span class="service-tag">${project.service}</span>
        </td>
        <td>
          <span class="project-status ${project.status}">${project.status.replace('-', ' ')}</span>
        </td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar-small">
              <div class="progress-fill-small" style="width: ${project.progress || 0}%"></div>
            </div>
            <span class="progress-text">${project.progress || 0}%</span>
          </div>
        </td>
        <td>
          <div class="deadline-cell ${this.isOverdue(project.deadlineTo) ? 'deadline-overdue' : ''}">
            ${project.deadlineTo ? this.formatDate(project.deadlineTo) : 'Not set'}
          </div>
        </td>
        <td>
          <div class="actions-cell">
            <button class="action-btn-small btn-edit" onclick="adminDashboard.openProjectModal('${project._id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn-small btn-delete" onclick="adminDashboard.deleteProject('${project._id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const statusFilter = document.getElementById('userStatusFilter').value;
    
    let filteredUsers = this.users;

    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    if (statusFilter !== '') {
      const isActive = statusFilter === 'true';
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }

    // Update grid with filtered users
    const usersGrid = document.getElementById('usersGrid');
    if (filteredUsers.length === 0) {
      usersGrid.innerHTML = '<p class="empty-message">No users match the selected filters</p>';
      return;
    }

    usersGrid.innerHTML = filteredUsers.map(user => {
      const userProjects = this.projects.filter(p => p.client === user._id);
      return `
        <div class="user-card">
          <div class="user-card-header">
            <div class="user-avatar-large">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-info-large">
              <h3>${user.username}</h3>
              <p>${user.email}</p>
            </div>
          </div>
          <div class="user-stats">
            <div class="user-stat">
              <div class="user-stat-value">${userProjects.length}</div>
              <div class="user-stat-label">Projects</div>
            </div>
            <div class="user-stat">
              <div class="user-stat-value">${userProjects.filter(p => p.status === 'completed').length}</div>
              <div class="user-stat-label">Completed</div>
            </div>
            <div class="user-stat">
              <div class="user-stat-value">${this.formatDate(user.createdAt)}</div>
              <div class="user-stat-label">Joined</div>
            </div>
          </div>
          <div class="user-actions">
            <span class="user-status ${user.isActive ? 'active' : 'inactive'}">
              ${user.isActive ? 'Active' : 'Inactive'}
            </span>
            <button class="action-btn-small ${user.isActive ? 'btn-delete' : 'btn-edit'}" 
                    onclick="adminDashboard.toggleUserStatus('${user._id}')">
              <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  openProjectModal(projectId) {
    const project = this.projects.find(p => p._id === projectId);
    if (!project) return;

    document.getElementById('modalProjectId').value = projectId;
    document.getElementById('modalStatus').value = project.status;
    document.getElementById('modalProgress').value = project.progress || 0;
    document.getElementById('progressValue').textContent = (project.progress || 0) + '%';
    document.getElementById('modalNotes').value = '';

    document.getElementById('projectModal').classList.add('active');
  }

  closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
  }

  async handleProjectUpdate(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('modalProjectId').value;
    const updateData = {
      status: document.getElementById('modalStatus').value,
      progress: parseInt(document.getElementById('modalProgress').value),
      notes: document.getElementById('modalNotes').value
    };

    this.showLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        this.showNotification('Project updated successfully!', 'success');
        this.closeProjectModal();
        await this.loadProjects();
        await this.loadStats();
      } else {
        this.showNotification(data.msg || 'Error updating project', 'error');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      this.showNotification('Network error. Please try again.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    this.showLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        this.showNotification('Project deleted successfully!', 'success');
        await this.loadProjects();
        await this.loadStats();
      } else {
        this.showNotification(data.msg || 'Error deleting project', 'error');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      this.showNotification('Network error. Please try again.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async toggleUserStatus(userId) {
    const user = this.users.find(u => u._id === userId);
    if (!user) return;

    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    this.showLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/toggle-status`, {
        method: 'PUT'
      });

      const data = await response.json();

      if (response.ok) {
        this.showNotification(data.msg, 'success');
        await this.loadUsers();
      } else {
        this.showNotification(data.msg || 'Error updating user status', 'error');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      this.showNotification('Network error. Please try again.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  exportData() {
    const data = {
      projects: this.projects,
      users: this.users,
      stats: this.stats,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconworks-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification('Data exported successfully!', 'success');
  }

  isOverdue(dateString) {
    if (!dateString) return false;
    const deadline = new Date(dateString);
    const now = new Date();
    return deadline < now;
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

function showSection(sectionName) {
  adminDashboard.showSection(sectionName);
}

function closeProjectModal() {
  adminDashboard.closeProjectModal();
}

function exportData() {
  adminDashboard.exportData();
}

// Initialize admin dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
  adminDashboard = new AdminDashboard();
});