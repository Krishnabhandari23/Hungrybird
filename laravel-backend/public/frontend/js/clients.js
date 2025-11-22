// Global variables
let allClients = [];
let currentSearchTerm = '';

// Load clients on page load
document.addEventListener('DOMContentLoaded', () => {
  loadClients();
});

// Load all clients
async function loadClients() {
  try {
    const params = new URLSearchParams();
    if (currentSearchTerm) params.append('search', currentSearchTerm);

    const response = await fetch(`${API_BASE_URL}/clients?${params}`);
    const data = await response.json();

    if (data.success) {
      allClients = data.data;
      displayClients(allClients);
    } else {
      console.error('Failed to load clients:', data.message);
      showError('Failed to load clients');
    }
  } catch (error) {
    console.error('Error loading clients:', error);
    showError('Error loading clients');
  }
}

// Display clients in table
function displayClients(clients) {
  const container = document.getElementById('clientsTableContainer');

  if (clients.length === 0) {
    container.innerHTML = '<p class="empty-state">No clients found. Click "Add New Client" to create one.</p>';
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
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${clients.map(client => `
          <tr>
            <td data-label="Name">${client.name}</td>
            <td data-label="Company">${client.company || 'N/A'}</td>
            <td data-label="Email">${client.email}</td>
            <td data-label="Phone">${client.phone || 'N/A'}</td>
            <td data-label="Created At">${new Date(client.created_at).toLocaleDateString()}</td>
            <td data-label="Actions">
              <div class="action-buttons">
                <button class="btn-icon" onclick="editClient(${client.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="deleteClient(${client.id})" title="Delete"><i class="fas fa-trash"></i></button>
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
  currentSearchTerm = document.getElementById('searchInput').value;
  loadClients();
}

// Open client modal
function openClientModal(clientId = null) {
  const modal = document.getElementById('clientModal');
  const modalTitle = document.getElementById('modalTitle');

  if (clientId) {
    modalTitle.textContent = 'Edit Client';
    const client = allClients.find(c => c.id === clientId);
    if (client) {
      document.getElementById('clientId').value = client.id;
      document.getElementById('clientName').value = client.name;
      document.getElementById('clientCompany').value = client.company || '';
      document.getElementById('clientEmail').value = client.email;
      document.getElementById('clientPhone').value = client.phone || '';
    }
  } else {
    modalTitle.textContent = 'Add New Client';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
  }

  modal.classList.add('active');
}

// Close client modal
function closeClientModal() {
  document.getElementById('clientModal').classList.remove('active');
  document.getElementById('clientForm').reset();
}

// Save client
async function saveClient() {
  const id = document.getElementById('clientId').value;
  const clientData = {
    name: document.getElementById('clientName').value,
    company: document.getElementById('clientCompany').value,
    email: document.getElementById('clientEmail').value,
    phone: document.getElementById('clientPhone').value
  };

  // Debug logging
  console.log('Saving client data:', clientData);
  console.log('Name field value:', document.getElementById('clientName').value);
  console.log('Company field value:', document.getElementById('clientCompany').value);

  if (!clientData.name || !clientData.email) {
    showToast('Name and email are required', 'error');
    return;
  }

  try {
    const url = id ? `${API_BASE_URL}/clients/${id}` : `${API_BASE_URL}/clients`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    });

    const data = await response.json();

    if (data.success) {
      showSuccess(id ? 'Client updated successfully' : 'Client created successfully');
      closeClientModal();
      loadClients();
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error saving client:', error);
    showError('Error saving client');
  }
}

// Edit client
function editClient(id) {
  openClientModal(id);
}

// Delete client
async function deleteClient(id) {
  if (!confirm('Are you sure you want to delete this client?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Client deleted successfully');
      loadClients();
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error deleting client:', error);
    alert('Error deleting client');
  }
}

// View client activities
function viewClientActivities(clientId, clientName) {
  document.getElementById('activityClientId').value = clientId;
  document.getElementById('activityClientName').textContent = clientName;
  document.getElementById('clientActivityModal').style.display = 'block';
  loadActivitiesForClient(clientId);
}

// Close client activity modal
function closeClientActivityModal() {
  document.getElementById('clientActivityModal').style.display = 'none';
  document.getElementById('clientActivityForm').reset();
}

// Load activities for client
async function loadActivitiesForClient(clientId) {
  const container = document.getElementById('clientActivitiesContainer');
  container.innerHTML = '<p class="loading">Loading activities...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/activities?parent_type=client&parent_id=${clientId}`);
    const data = await response.json();

    if (data.success) {
      displayActivitiesForClient(data.data);
    } else {
      container.innerHTML = '<p>Failed to load activities</p>';
    }
  } catch (error) {
    console.error('Error loading activities:', error);
    container.innerHTML = '<p>Error loading activities</p>';
  }
}

// Display activities for client
function displayActivitiesForClient(activities) {
  const container = document.getElementById('clientActivitiesContainer');

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
      <button class="btn btn-danger btn-sm" onclick="deleteClientActivity(${activity.id})">Delete</button>
    </div>
  `).join('');

  container.innerHTML = html;
}

// Add client activity
async function addClientActivity() {
  const activityData = {
    parent_type: 'client',
    parent_id: document.getElementById('activityClientId').value,
    type: document.getElementById('clientActivityType').value,
    summary: document.getElementById('clientActivitySummary').value,
    date: document.getElementById('clientActivityDate').value
  };

  if (!activityData.type) {
    showToast('Activity type is required', 'error');
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
      document.getElementById('clientActivityForm').reset();
      loadActivitiesForClient(activityData.parent_id);
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error adding activity:', error);
    showError('Error adding activity');
  }
}

// Delete client activity
async function deleteClientActivity(id) {
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
      const clientId = document.getElementById('activityClientId').value;
      loadActivitiesForClient(clientId);
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

// Show success message
function showSuccess(message) {
  showToast(message, 'success');
}

// Show toast notification
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  
  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
  const clientModal = document.getElementById('clientModal');
  const activityModal = document.getElementById('clientActivityModal');
  
  if (event.target === clientModal) {
    closeClientModal();
  }
  if (event.target === activityModal) {
    closeClientActivityModal();
  }
};

