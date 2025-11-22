// Global variables
let allLeads = [];
let currentFilters = {
  search: '',
  status: '',
  source: ''
};

// Load leads on page load
document.addEventListener('DOMContentLoaded', () => {
  loadLeads();
});

// Load all leads
async function loadLeads() {
  try {
    const params = new URLSearchParams();
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.status) params.append('status', currentFilters.status);
    if (currentFilters.source) params.append('source', currentFilters.source);

    const response = await fetch(`${API_BASE_URL}/leads?${params}`);
    const data = await response.json();

    if (data.success) {
      allLeads = data.data;
      displayLeads(allLeads);
    } else {
      console.error('Failed to load leads:', data.message);
      showError('Failed to load leads');
    }
  } catch (error) {
    console.error('Error loading leads:', error);
    showError('Error loading leads');
  }
}

// Display leads in table
function displayLeads(leads) {
  const container = document.getElementById('leadsTableContainer');

  if (leads.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--color-text-secondary);">No leads found. Click "Add New Lead" to create one.</p>';
    return;
  }

  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Company</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Source</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${leads.map(lead => `
          <tr>
            <td data-label="Name">${lead.name}</td>
            <td data-label="Company">${lead.company || 'N/A'}</td>
            <td data-label="Email">${lead.email}</td>
            <td data-label="Phone">${lead.phone || 'N/A'}</td>
            <td data-label="Status"><span class="badge-status badge-${lead.status}">${lead.status}</span></td>
            <td data-label="Source">${lead.source || 'N/A'}</td>
            <td data-label="Actions">
              <div class="action-buttons">
                <button class="btn-icon" onclick="editLead(${lead.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="viewActivities(${lead.id}, '${lead.name}')" title="Activities"><i class="fas fa-list"></i></button>
                ${!lead.converted_to_client_id ? 
                  `<button class="btn-icon" onclick="convertLead(${lead.id})" title="Convert"><i class="fas fa-user-check"></i></button>` : 
                  '<span class="badge-status badge-qualified">Converted</span>'
                }
                <button class="btn-icon" onclick="deleteLead(${lead.id})" title="Delete"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Apply filters
function applyFilters() {
  currentFilters.search = document.getElementById('searchInput').value;
  currentFilters.status = document.getElementById('statusFilter').value;
  currentFilters.source = document.getElementById('sourceFilter').value;
  loadLeads();
}

// Open lead modal
function openLeadModal(leadId = null) {
  const modal = document.getElementById('leadModal');
  const modalTitle = document.getElementById('modalTitle');

  if (leadId) {
    modalTitle.textContent = 'Edit Lead';
    const lead = allLeads.find(l => l.id === leadId);
    if (lead) {
      document.getElementById('leadId').value = lead.id;
      document.getElementById('leadName').value = lead.name;
      document.getElementById('leadCompany').value = lead.company || '';
      document.getElementById('leadEmail').value = lead.email;
      document.getElementById('leadPhone').value = lead.phone || '';
      document.getElementById('leadStatus').value = lead.status;
      document.getElementById('leadSource').value = lead.source || '';
      document.getElementById('leadAssignedTo').value = lead.assigned_to || '';
    }
  } else {
    modalTitle.textContent = 'Add New Lead';
    document.getElementById('leadForm').reset();
    document.getElementById('leadId').value = '';
  }

  modal.classList.add('active');
}

// Close lead modal
function closeLeadModal() {
  document.getElementById('leadModal').classList.remove('active');
  document.getElementById('leadForm').reset();
}

// Save lead
async function saveLead() {
  const id = document.getElementById('leadId').value;
  const leadData = {
    name: document.getElementById('leadName').value,
    company: document.getElementById('leadCompany').value,
    email: document.getElementById('leadEmail').value,
    phone: document.getElementById('leadPhone').value,
    status: document.getElementById('leadStatus').value,
    source: document.getElementById('leadSource').value,
    assigned_to: document.getElementById('leadAssignedTo').value || null
  };

  // Debug logging
  console.log('Saving lead data:', leadData);
  console.log('Name field value:', document.getElementById('leadName').value);
  console.log('Company field value:', document.getElementById('leadCompany').value);

  if (!leadData.name || !leadData.email) {
    showToast('Name and email are required', 'error');
    return;
  }

  try {
    const url = id ? `${API_BASE_URL}/leads/${id}` : `${API_BASE_URL}/leads`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    });

    const data = await response.json();

    if (data.success) {
      showSuccess(id ? 'Lead updated successfully' : 'Lead created successfully');
      closeLeadModal();
      loadLeads();
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error saving lead:', error);
    showError('Error saving lead');
  }
}

// Edit lead
function editLead(id) {
  openLeadModal(id);
}

// Delete lead
async function deleteLead(id) {
  if (!confirm('Are you sure you want to delete this lead?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Lead deleted successfully');
      loadLeads();
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error deleting lead:', error);
    showError('Error deleting lead');
  }
}

// Convert lead to client
async function convertLead(id) {
  if (!confirm('Are you sure you want to convert this lead to a client?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/leads/${id}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      showError('Server error: Received invalid response format');
      return;
    }

    const data = await response.json();

    if (data.success) {
      showSuccess('Lead converted to client successfully');
      loadLeads();
    } else {
      showError('Error: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error converting lead:', error);
    showError('Error converting lead: ' + error.message);
  }
}

// View activities
function viewActivities(leadId, leadName) {
  document.getElementById('activityLeadId').value = leadId;
  document.getElementById('activityLeadName').textContent = leadName;
  document.getElementById('activityModal').classList.add('active');
  loadActivitiesForLead(leadId);
}

// Close activity modal
function closeActivityModal() {
  document.getElementById('activityModal').classList.remove('active');
  document.getElementById('activityForm').reset();
}

// Load activities for lead
async function loadActivitiesForLead(leadId) {
  const container = document.getElementById('activitiesContainer');
  container.innerHTML = '<p class="loading">Loading activities...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/activities?parent_type=lead&parent_id=${leadId}`);
    const data = await response.json();

    if (data.success) {
      displayActivitiesForLead(data.data);
    } else {
      container.innerHTML = '<p>Failed to load activities</p>';
    }
  } catch (error) {
    console.error('Error loading activities:', error);
    container.innerHTML = '<p>Error loading activities</p>';
  }
}

// Display activities
function displayActivitiesForLead(activities) {
  const container = document.getElementById('activitiesContainer');

  if (activities.length === 0) {
    container.innerHTML = '<p>No activities found</p>';
    return;
  }

  const html = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-info">
        <h5>${activity.type}</h5>
        <p>${activity.summary || 'No summary'}</p>
        <p class="activity-date">${activity.date || new Date(activity.created_at).toLocaleDateString()}</p>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteActivity(${activity.id})">Delete</button>
    </div>
  `).join('');

  container.innerHTML = html;
}

// Add activity
async function addActivity() {
  const activityData = {
    parent_type: 'lead',
    parent_id: document.getElementById('activityLeadId').value,
    type: document.getElementById('activityType').value,
    summary: document.getElementById('activitySummary').value,
    date: document.getElementById('activityDate').value
  };

  if (!activityData.type) {
    showToast('Activity type is required', 'error'); return;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activityData)
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Activity added successfully');
      document.getElementById('activityForm').reset();
      loadActivitiesForLead(activityData.parent_id);
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error adding activity:', error);
    showError('Error adding activity');
  }
}

// Delete activity
async function deleteActivity(id) {
  if (!confirm('Are you sure you want to delete this activity?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Activity deleted successfully');
      const leadId = document.getElementById('activityLeadId').value;
      loadActivitiesForLead(leadId);
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error deleting activity:', error);
    showError('Error deleting activity');
  }
}

// Show error message
function showError(message) {
  showToast(message, 'error');
}

function showSuccess(message) {
  showToast(message, 'success');
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">Ã—</button>
  `;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

