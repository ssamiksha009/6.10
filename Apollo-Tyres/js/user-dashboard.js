// ============================================
// USER DASHBOARD - JavaScript
// ============================================

// Global Variables
let currentUser = null;
let allProjects = [];
let protocolChart = null;

// Protocol colors mapping
const PROTOCOL_COLORS = {
    'PCR': '#6366f1',
    'MF2': '#8b5cf6',
    'TBR': '#10b981',
    'Custom': '#f59e0b',
    'CDTire': '#ef4444'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard initializing...');
    
    // Check authentication
    await checkAuthentication();
    
    // Load user data
    await loadUserData();
    
    // Load dashboard data
    await loadDashboardData();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Start auto-refresh
    startAutoRefresh();
});

// ============================================
// AUTHENTICATION
// ============================================

async function checkAuthentication() {
    try {
        const userEmail = localStorage.getItem('userEmail');
        const authToken = localStorage.getItem('authToken');
        
        console.log('Checking auth - userEmail:', userEmail, 'token:', authToken ? 'exists' : 'missing');
        
        if (!userEmail && !authToken) {
            console.log('No user logged in, redirecting to login...');
            // Small delay to prevent immediate redirect
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 100);
            return;
        }
        
        console.log('User authenticated:', userEmail);
    } catch (error) {
        console.error('Authentication error:', error);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 100);
    }
}

// ============================================
// USER DATA LOADING
// ============================================

async function loadUserData() {
    try {
        const userEmail = localStorage.getItem('userEmail');
        
        // Fetch user data from API
        const response = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        currentUser = await response.json();
        
        // Update UI with user data
        updateUserUI();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        
        // Fallback to mock data
        currentUser = {
            name: 'User',
            email: localStorage.getItem('userEmail') || 'user@apollotyres.com',
            role: 'Engineer',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
        };
        
        updateUserUI();
    }
}

function updateUserUI() {
    // Update all user name elements
    const userNameElements = [
        document.getElementById('userName'),
        document.getElementById('topBarUserName'),
        document.getElementById('welcomeUserName')
    ];
    
    userNameElements.forEach(element => {
        if (element) {
            element.textContent = currentUser.name || 'User';
        }
    });
    
    // Update user role
    const userRoleElement = document.getElementById('userRole');
    if (userRoleElement) {
        userRoleElement.textContent = currentUser.role || 'User';
    }
    
    // Update user statistics
    updateUserStatistics();
}

function updateUserStatistics() {
    // Last login
    const lastLoginElement = document.getElementById('userLastLogin');
    if (lastLoginElement && currentUser.last_login) {
        lastLoginElement.textContent = formatRelativeTime(currentUser.last_login);
    }
    
    // Join date
    const joinDateElement = document.getElementById('userJoinDate');
    if (joinDateElement && currentUser.created_at) {
        joinDateElement.textContent = formatDate(currentUser.created_at);
    }
}

// ============================================
// DASHBOARD DATA LOADING
// ============================================

async function loadDashboardData() {
    try {
        // Fetch projects from API
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        
        allProjects = await response.json();
        
        // Process and display data
        updateStatistics();
        updateProtocolChart();
        updateRecentProjects();
        updateRegionDistribution();
        updateDepartmentDistribution();
        updateActivityTimeline();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Load mock data for demonstration
        loadMockData();
    }
}

function loadMockData() {
    // Mock projects data based on the database schema
    allProjects = [
        {
            id: 1,
            project_name: 'demo1',
            region: 'EUROPE',
            department: 'PCI',
            tyre_size: 15,
            protocol: 'Custom',
            status: 'Not Started',
            created_at: '2025-10-03 09:23:05',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 2,
            project_name: 'demo2',
            region: 'APREA',
            department: 'PCR',
            tyre_size: 16,
            protocol: 'MF2',
            status: 'Completed',
            created_at: '2025-09-30 11:49:12',
            completed_at: '2025-09-30 11:50:53',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 3,
            project_name: 'demo3',
            region: 'AMEA',
            department: 'PCR',
            tyre_size: 21,
            protocol: 'MF2',
            status: 'Not Started',
            created_at: '2025-09-30 13:30:12',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 7,
            project_name: 'demo7',
            region: 'APREA',
            department: 'PCR',
            tyre_size: 24,
            protocol: 'MF2',
            status: 'Not Started',
            created_at: '2025-10-01 09:43:11',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 8,
            project_name: 'demo8',
            region: 'EUROPE',
            department: 'TBR',
            tyre_size: 31,
            protocol: 'Fire',
            status: 'Not Started',
            created_at: '2025-10-01 09:58:08',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 9,
            project_name: 'demo9',
            region: 'APREA',
            department: 'PCR',
            tyre_size: 24,
            protocol: 'MF2',
            status: 'Not Started',
            created_at: '2025-10-01 12:56:13',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 10,
            project_name: 'demo10',
            region: 'EUROPE',
            department: 'TBR',
            tyre_size: 62,
            protocol: 'MF2',
            status: 'In Progress',
            created_at: '2025-10-02 15:49:34',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 17,
            project_name: 'demo17',
            region: 'APREA',
            department: 'TBR',
            tyre_size: 31,
            protocol: 'CDTire',
            status: 'Not Started',
            created_at: '2025-10-03 13:43:40',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 18,
            project_name: 'demo18',
            region: 'EUROPE',
            department: 'TBR',
            tyre_size: 18,
            protocol: 'CDTire',
            status: 'Not Started',
            created_at: '2025-10-03 19:19:10',
            user_email: 'admin@apollotyres.com'
        },
        {
            id: 19,
            project_name: 'demo19',
            region: 'APREA',
            department: 'PCR',
            tyre_size: 22,
            protocol: 'MF2',
            status: 'In Progress',
            created_at: '2025-10-05 09:15:28',
            user_email: 'admin@apollotyres.com'
        }
    ];
    
    // Process and display mock data
    updateStatistics();
    updateProtocolChart();
    updateRecentProjects();
    updateRegionDistribution();
    updateDepartmentDistribution();
    updateActivityTimeline();
}

// ============================================
// STATISTICS UPDATE
// ============================================

function updateStatistics() {
    // Count projects by status
    const stats = {
        total: allProjects.length,
        completed: allProjects.filter(p => p.status === 'Completed').length,
        inProgress: allProjects.filter(p => p.status === 'In Progress').length,
        notStarted: allProjects.filter(p => p.status === 'Not Started').length
    };
    
    // Update stat cards
    document.getElementById('totalProjects').textContent = stats.total;
    document.getElementById('completedProjects').textContent = stats.completed;
    document.getElementById('inProgressProjects').textContent = stats.inProgress;
    document.getElementById('notStartedProjects').textContent = stats.notStarted;
    
    // Update user project count
    document.getElementById('userTotalProjects').textContent = stats.total;
    
    // Calculate completion rate
    const completionRate = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0;
    document.getElementById('userCompletionRate').textContent = completionRate + '%';
}

// ============================================
// PROTOCOL CHART
// ============================================

function updateProtocolChart() {
    // Count projects by protocol
    const protocolCounts = {};
    
    allProjects.forEach(project => {
        const protocol = project.protocol || 'Unknown';
        protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1;
    });
    
    // Prepare chart data
    const labels = Object.keys(protocolCounts);
    const data = Object.values(protocolCounts);
    const colors = labels.map(label => PROTOCOL_COLORS[label] || '#94a3b8');
    
    // Create chart
    const ctx = document.getElementById('protocolChart');
    
    if (protocolChart) {
        protocolChart.destroy();
    }
    
    protocolChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Update custom legend
    updateChartLegend(labels, data, colors);
}

function updateChartLegend(labels, data, colors) {
    const legendContainer = document.getElementById('protocolLegend');
    
    legendContainer.innerHTML = labels.map((label, index) => `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${colors[index]}"></div>
            <span class="legend-text">${label}</span>
            <span class="legend-value">${data[index]}</span>
        </div>
    `).join('');
}

// ============================================
// RECENT PROJECTS
// ============================================

function updateRecentProjects() {
    const container = document.getElementById('recentProjectsList');
    
    // Sort projects by creation date (newest first) and take first 7
    const recentProjects = [...allProjects]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 7);
    
    if (recentProjects.length === 0) {
        container.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-folder-open"></i>
                <p>No projects found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentProjects.map(project => {
        const statusClass = getStatusClass(project.status);
        
        return `
            <div class="project-item" onclick="viewProject(${project.id})">
                <div class="project-header">
                    <div>
                        <div class="project-title">${escapeHtml(project.project_name)}</div>
                        <div class="project-id">#${project.id}</div>
                    </div>
                    <span class="project-status ${statusClass}">${project.status}</span>
                </div>
                <div class="project-meta">
                    <div class="project-meta-item">
                        <i class="fas fa-layer-group"></i>
                        <span>${project.protocol}</span>
                    </div>
                    <div class="project-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${project.region}</span>
                    </div>
                    <div class="project-meta-item">
                        <i class="fas fa-building"></i>
                        <span>${project.department}</span>
                    </div>
                    <div class="project-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatRelativeTime(project.created_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusClass(status) {
    const statusMap = {
        'Completed': 'status-completed',
        'In Progress': 'status-in-progress',
        'Not Started': 'status-not-started'
    };
    return statusMap[status] || 'status-not-started';
}

function viewProject(projectId) {
    // Navigate to project details or my-projects page
    window.location.href = `my-projects.html?id=${projectId}`;
}

// ============================================
// REGION DISTRIBUTION
// ============================================

function updateRegionDistribution() {
    const container = document.getElementById('regionGrid');
    
    // Count projects by region
    const regionCounts = {};
    
    allProjects.forEach(project => {
        const region = project.region || 'Unknown';
        regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    
    container.innerHTML = Object.entries(regionCounts).map(([region, count]) => `
        <div class="region-item">
            <div class="region-name">${region}</div>
            <div class="region-count">${count}</div>
        </div>
    `).join('');
}

// ============================================
// DEPARTMENT DISTRIBUTION
// ============================================

function updateDepartmentDistribution() {
    const container = document.getElementById('departmentBars');
    
    // Count projects by department
    const deptCounts = {};
    
    allProjects.forEach(project => {
        const dept = project.department || 'Unknown';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(deptCounts));
    
    container.innerHTML = Object.entries(deptCounts).map(([dept, count]) => {
        const percentage = (count / maxCount) * 100;
        
        return `
            <div class="department-item">
                <div class="department-label">${dept}</div>
                <div class="department-bar-container">
                    <div class="department-bar" style="width: ${percentage}%">
                        ${count}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// ACTIVITY TIMELINE
// ============================================

function updateActivityTimeline() {
    const container = document.getElementById('activityTimeline');
    
    // Create activity items from recent projects
    const activities = allProjects
        .slice(0, 5)
        .map(project => ({
            type: 'create',
            text: `Project <strong>${escapeHtml(project.project_name)}</strong> was created`,
            time: project.created_at,
            icon: 'create'
        }));
    
    // Add completed projects
    allProjects
        .filter(p => p.status === 'Completed' && p.completed_at)
        .slice(0, 3)
        .forEach(project => {
            activities.push({
                type: 'complete',
                text: `Project <strong>${escapeHtml(project.project_name)}</strong> was completed`,
                time: project.completed_at,
                icon: 'complete'
            });
        });
    
    // Sort by time (newest first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    container.innerHTML = activities.slice(0, 8).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.icon}">
                <i class="fas fa-${getActivityIcon(activity.icon)}"></i>
            </div>
            <div class="activity-content">
                <p class="activity-text">${activity.text}</p>
                <p class="activity-time">${formatRelativeTime(activity.time)}</p>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    const icons = {
        'create': 'plus',
        'update': 'edit',
        'complete': 'check'
    };
    return icons[type] || 'circle';
}

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotifications);
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        window.location.href = '/login.html';
    }
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (!query) {
        updateRecentProjects();
        return;
    }
    
    const filteredProjects = allProjects.filter(project => 
        project.project_name.toLowerCase().includes(query) ||
        project.protocol.toLowerCase().includes(query) ||
        project.region.toLowerCase().includes(query) ||
        project.department.toLowerCase().includes(query)
    );
    
    // Update the projects list with filtered results
    const container = document.getElementById('recentProjectsList');
    
    if (filteredProjects.length === 0) {
        container.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-search"></i>
                <p>No projects found matching "${escapeHtml(query)}"</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProjects.slice(0, 7).map(project => {
        const statusClass = getStatusClass(project.status);
        
        return `
            <div class="project-item" onclick="viewProject(${project.id})">
                <div class="project-header">
                    <div>
                        <div class="project-title">${escapeHtml(project.project_name)}</div>
                        <div class="project-id">#${project.id}</div>
                    </div>
                    <span class="project-status ${statusClass}">${project.status}</span>
                </div>
                <div class="project-meta">
                    <div class="project-meta-item">
                        <i class="fas fa-layer-group"></i>
                        <span>${project.protocol}</span>
                    </div>
                    <div class="project-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${project.region}</span>
                    </div>
                    <div class="project-meta-item">
                        <i class="fas fa-building"></i>
                        <span>${project.department}</span>
                    </div>
                    <div class="project-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatRelativeTime(project.created_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showNotifications() {
    alert('Notifications feature coming soon!\n\nYou have 3 new notifications:\n- New project assigned\n- Project completed\n- System update available');
}

// ============================================
// AUTO-REFRESH
// ============================================

function startAutoRefresh() {
    // Refresh dashboard data every 5 minutes
    setInterval(() => {
        console.log('Auto-refreshing dashboard data...');
        loadDashboardData();
    }, 5 * 60 * 1000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatRelativeTime(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// ADDITIONAL FEATURES
// ============================================

// Export dashboard data to CSV
function exportDashboardData() {
    let csv = 'Project ID,Project Name,Region,Department,Protocol,Tyre Size,Status,Created At,Completed At\n';
    
    allProjects.forEach(project => {
        csv += `${project.id},`;
        csv += `"${project.project_name}",`;
        csv += `${project.region},`;
        csv += `${project.department},`;
        csv += `${project.protocol},`;
        csv += `${project.tyre_size},`;
        csv += `${project.status},`;
        csv += `${project.created_at},`;
        csv += `${project.completed_at || ''}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Print dashboard
function printDashboard() {
    window.print();
}

// Filter projects by date range
function filterByDateRange(startDate, endDate) {
    const filtered = allProjects.filter(project => {
        const projectDate = new Date(project.created_at);
        return projectDate >= new Date(startDate) && projectDate <= new Date(endDate);
    });
    
    return filtered;
}

// Get project statistics by user
function getProjectStatsByUser(userEmail) {
    const userProjects = allProjects.filter(p => p.user_email === userEmail);
    
    return {
        total: userProjects.length,
        completed: userProjects.filter(p => p.status === 'Completed').length,
        inProgress: userProjects.filter(p => p.status === 'In Progress').length,
        notStarted: userProjects.filter(p => p.status === 'Not Started').length,
        byProtocol: userProjects.reduce((acc, p) => {
            acc[p.protocol] = (acc[p.protocol] || 0) + 1;
            return acc;
        }, {}),
        byRegion: userProjects.reduce((acc, p) => {
            acc[p.region] = (acc[p.region] || 0) + 1;
            return acc;
        }, {}),
        byDepartment: userProjects.reduce((acc, p) => {
            acc[p.department] = (acc[p.department] || 0) + 1;
            return acc;
        }, {})
    };
}

// Get trending protocols
function getTrendingProtocols() {
    const protocolsByMonth = {};
    
    allProjects.forEach(project => {
        const monthYear = new Date(project.created_at).toISOString().slice(0, 7);
        
        if (!protocolsByMonth[monthYear]) {
            protocolsByMonth[monthYear] = {};
        }
        
        const protocol = project.protocol;
        protocolsByMonth[monthYear][protocol] = (protocolsByMonth[monthYear][protocol] || 0) + 1;
    });
    
    return protocolsByMonth;
}

// Calculate productivity metrics
function calculateProductivityMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentProjects = allProjects.filter(p => 
        new Date(p.created_at) >= thirtyDaysAgo
    );
    
    const completedRecent = recentProjects.filter(p => p.status === 'Completed');
    
    return {
        projectsLast30Days: recentProjects.length,
        completedLast30Days: completedRecent.length,
        averageCompletionTime: calculateAverageCompletionTime(completedRecent),
        productivityScore: calculateProductivityScore(recentProjects, completedRecent)
    };
}

function calculateAverageCompletionTime(completedProjects) {
    if (completedProjects.length === 0) return 0;
    
    const totalTime = completedProjects.reduce((sum, project) => {
        if (project.completed_at && project.created_at) {
            const created = new Date(project.created_at);
            const completed = new Date(project.completed_at);
            return sum + (completed - created);
        }
        return sum;
    }, 0);
    
    const avgTimeMs = totalTime / completedProjects.length;
    const avgDays = Math.round(avgTimeMs / (1000 * 60 * 60 * 24));
    
    return avgDays;
}

function calculateProductivityScore(total, completed) {
    if (total.length === 0) return 0;
    
    const completionRate = (completed.length / total.length) * 100;
    return Math.round(completionRate);
}

// Get project insights
function getProjectInsights() {
    const insights = {
        mostUsedProtocol: getMostUsedProtocol(),
        mostActiveRegion: getMostActiveRegion(),
        mostActiveDepartment: getMostActiveDepartment(),
        averageTyreSize: getAverageTyreSize(),
        projectGrowth: getProjectGrowth()
    };
    
    return insights;
}

function getMostUsedProtocol() {
    const counts = {};
    allProjects.forEach(p => {
        counts[p.protocol] = (counts[p.protocol] || 0) + 1;
    });
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
}

function getMostActiveRegion() {
    const counts = {};
    allProjects.forEach(p => {
        counts[p.region] = (counts[p.region] || 0) + 1;
    });
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
}

function getMostActiveDepartment() {
    const counts = {};
    allProjects.forEach(p => {
        counts[p.department] = (counts[p.department] || 0) + 1;
    });
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
}

function getAverageTyreSize() {
    if (allProjects.length === 0) return 0;
    
    const totalSize = allProjects.reduce((sum, p) => sum + (p.tyre_size || 0), 0);
    return Math.round(totalSize / allProjects.length);
}

function getProjectGrowth() {
    const now = new Date();
    const currentMonth = allProjects.filter(p => {
        const date = new Date(p.created_at);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    const lastMonth = allProjects.filter(p => {
        const date = new Date(p.created_at);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === lastMonthDate.getMonth() && 
               date.getFullYear() === lastMonthDate.getFullYear();
    }).length;
    
    if (lastMonth === 0) return currentMonth > 0 ? 100 : 0;
    
    const growth = ((currentMonth - lastMonth) / lastMonth) * 100;
    return Math.round(growth);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K: Focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Ctrl/Cmd + N: New project
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        window.location.href = 'index.html';
    }
    
    // Ctrl/Cmd + P: Print dashboard
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        printDashboard();
    }
    
    // Ctrl/Cmd + E: Export data
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        exportDashboardData();
    }
});

// ============================================
// RESPONSIVE SIDEBAR TOGGLE
// ============================================

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Add hamburger menu for mobile
if (window.innerWidth <= 1024) {
    const topBar = document.querySelector('.top-bar');
    const menuButton = document.createElement('button');
    menuButton.className = 'btn-icon';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    menuButton.onclick = toggleSidebar;
    
    topBar.insertBefore(menuButton, topBar.firstChild);
}

// ============================================
// THEME TOGGLE (Optional Enhancement)
// ============================================

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// Call on page load
loadThemePreference();

// ============================================
// ADVANCED FILTERING & SORTING
// ============================================

let currentFilter = {
    status: 'all',
    protocol: 'all',
    region: 'all',
    department: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
};

function applyFilters() {
    let filtered = [...allProjects];
    
    // Apply status filter
    if (currentFilter.status !== 'all') {
        filtered = filtered.filter(p => p.status === currentFilter.status);
    }
    
    // Apply protocol filter
    if (currentFilter.protocol !== 'all') {
        filtered = filtered.filter(p => p.protocol === currentFilter.protocol);
    }
    
    // Apply region filter
    if (currentFilter.region !== 'all') {
        filtered = filtered.filter(p => p.region === currentFilter.region);
    }
    
    // Apply department filter
    if (currentFilter.department !== 'all') {
        filtered = filtered.filter(p => p.department === currentFilter.department);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        const aVal = a[currentFilter.sortBy];
        const bVal = b[currentFilter.sortBy];
        
        if (currentFilter.sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    return filtered;
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ============================================
// DATA REFRESH INDICATOR
// ============================================

function showRefreshIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'refresh-indicator';
    indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i> Refreshing data...';
    document.body.appendChild(indicator);
    
    return indicator;
}

function hideRefreshIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showToast('An error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An error occurred while loading data.', 'error');
});

// ============================================
// PERFORMANCE MONITORING
// ============================================

function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Dashboard loaded in ${loadTime}ms`);
    }
}

window.addEventListener('load', logPerformance);

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log('%c Welcome to Apollo Tyres Dashboard! ', 'background: #6366f1; color: white; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%c Keyboard shortcuts: ', 'font-weight: bold; font-size: 14px;');
console.log('  Ctrl/Cmd + K: Focus search');
console.log('  Ctrl/Cmd + N: New project');
console.log('  Ctrl/Cmd + P: Print dashboard');
console.log('  Ctrl/Cmd + E: Export data');

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ============================================

window.dashboardFunctions = {
    exportDashboardData,
    printDashboard,
    filterByDateRange,
    getProjectStatsByUser,
    getTrendingProtocols,
    calculateProductivityMetrics,
    getProjectInsights,
    applyFilters,
    toggleTheme,
    showToast
};

// ============================================
// END OF USER DASHBOARD JAVASCRIPT
// ============================================