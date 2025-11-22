// Dashboard functionality
// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
            sidebar.classList.remove('open');
            hamburger.classList.remove('active');
        }
    }
});

// Dashboard Data Loading
async function loadDashboard() {
    // Check if we're on the dashboard page
    if (!document.getElementById('totalLeads')) {
        return; // Not on dashboard page, skip loading
    }
    
    try {
        // Fetch leads
        const leadsRes = await fetch(`${API_BASE_URL}/leads`);
        const leadsData = await leadsRes.json();
        const leads = leadsData.data || [];
        const totalLeadsEl = document.getElementById('totalLeads');
        if (totalLeadsEl) totalLeadsEl.textContent = leads.length;

        // Fetch clients
        const clientsRes = await fetch(`${API_BASE_URL}/clients`);
        const clientsData = await clientsRes.json();
        const clients = clientsData.data || [];
        const totalClientsEl = document.getElementById('totalClients');
        if (totalClientsEl) totalClientsEl.textContent = clients.length;

        // Fetch workflows
        const workflowsRes = await fetch(`${API_BASE_URL}/workflows`);
        const workflowsData = await workflowsRes.json();
        const workflows = workflowsData.data || [];
        const activeWorkflows = workflows.filter(w => w.is_active);
        const activeWorkflowsEl = document.getElementById('activeWorkflows');
        if (activeWorkflowsEl) activeWorkflowsEl.textContent = activeWorkflows.length;

        // Fetch activities
        const activitiesRes = await fetch(`${API_BASE_URL}/activities`);
        const activitiesData = await activitiesRes.json();
        const activities = activitiesData.data || [];
        const recentActivitiesEl = document.getElementById('recentActivities');
        if (recentActivitiesEl) recentActivitiesEl.textContent = activities.length;

        // Display recent leads (last 5)
        displayRecentLeads(leads.slice(0, 5));

        // Display status distribution
        displayStatusDistribution(leads);

        // Draw mini trend charts
        drawMiniChart('leadsTrend', [3, 5, 4, 7, 6, 8, leads.length], '#fff');
        drawMiniChart('clientsTrend', [2, 3, 4, 5, 6, clients.length], '#fff');
        drawMiniChart('workflowsTrend', [1, 2, 2, 3, activeWorkflows.length], '#fff');
        drawMiniChart('activitiesTrend', [5, 8, 12, 15, 18, activities.length], '#fff');

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

function displayRecentLeads(leads) {
    const container = document.getElementById('recentLeadsTable');
    
    if (leads.length === 0) {
        container.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--color-text-secondary);">No leads found</td></tr>';
        return;
    }

    const html = leads.map(lead => `
        <tr>
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td><span class="badge-status badge-${lead.status}">${lead.status}</span></td>
            <td>${lead.source || 'N/A'}</td>
        </tr>
    `).join('');
    
    container.innerHTML = html;
}

function displayStatusDistribution(leads) {
    const container = document.getElementById('statusDistribution');
    
    if (leads.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--color-text-secondary);">No data available</p>';
        return;
    }

    // Count leads by status
    const statusCounts = {};
    leads.forEach(lead => {
        statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });

    const html = `
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            ${Object.entries(statusCounts).map(([status, count]) => {
                const percentage = ((count / leads.length) * 100).toFixed(1);
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); font-size: var(--font-size-sm);">
                            <span style="color: var(--color-text-primary); text-transform: capitalize; font-weight: 600;">${status}</span>
                            <span style="color: var(--color-text-secondary);">${count} (${percentage}%)</span>
                        </div>
                        <div style="height: 8px; background-color: var(--color-bg-tertiary); border-radius: var(--radius-sm); overflow: hidden;">
                            <div style="height: 100%; width: ${percentage}%; background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light)); border-radius: var(--radius-sm); transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Draw mini sparkline chart
function drawMiniChart(canvasId, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate points
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - ((value - min) / range) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw fill
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = `${color}33`; // 20% opacity
    ctx.fill();
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);
