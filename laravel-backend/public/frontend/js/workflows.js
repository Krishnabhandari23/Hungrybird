// Global variables
console.log('Workflows.js loaded - Version 2.0 - Fixed JSON parsing');
let allWorkflows = [];
let editingWorkflowId = null;

// Load workflows on page load
document.addEventListener('DOMContentLoaded', () => {
  loadWorkflows();
});

// Load all workflows
async function loadWorkflows() {
  const container = document.getElementById('workflowsTableContainer');
  
  // Show loading state
  if (typeof showLoading === 'function') {
    showLoading(container);
  } else {
    container.innerHTML = '<p class="loading">Loading workflows...</p>';
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/workflows`);
    const data = await response.json();

    if (data.success) {
      allWorkflows = data.data;
      
      // Use requestAnimationFrame for smoother rendering
      requestAnimationFrame(() => {
        displayWorkflows(allWorkflows);
      });
    } else {
      console.error('Failed to load workflows:', data.message);
      showError('Failed to load workflows');
    }
  } catch (error) {
    console.error('Error loading workflows:', error);
    showError('Error loading workflows');
  }
}

// Display workflows in table
function displayWorkflows(workflows) {
  const container = document.getElementById('workflowsTableContainer');

  if (workflows.length === 0) {
    container.innerHTML = '<p class="empty-state">No workflows found. Click "Create New Workflow" to add one.</p>';
    return;
  }

  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Trigger</th>
          <th>Description</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${workflows.map(workflow => {
          const description = generateWorkflowDescription(workflow);
          return `
            <tr>
              <td data-label="Name"><strong>${workflow.name || 'Unnamed Workflow'}</strong></td>
              <td data-label="Trigger">${formatTrigger(workflow.trigger_event)}</td>
              <td data-label="Description">${description}</td>
              <td data-label="Status">
                <span class="badge-status ${workflow.is_active ? 'badge-qualified' : 'badge-lost'}">
                  ${workflow.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td data-label="Actions">
                <div class="action-buttons">
                  <button class="btn-icon" onclick="viewWorkflow(${workflow.id})" title="View"><i class="fas fa-eye"></i></button>
                  <button class="btn-icon" onclick="editWorkflow(${workflow.id})" title="Edit"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon ${workflow.is_active ? 'btn-warning' : 'btn-success'}" 
                          onclick="toggleWorkflow(${workflow.id}, ${!workflow.is_active})"
                          title="${workflow.is_active ? 'Deactivate' : 'Activate'}">
                    <i class="fas fa-${workflow.is_active ? 'pause' : 'play'}"></i>
                  </button>
                  <button class="btn-icon" onclick="deleteWorkflow(${workflow.id})" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Format trigger for display
function formatTrigger(trigger) {
  const triggers = {
    'lead_created': 'Lead Created',
    'status_updated': 'Status Updated',
    'lead_converted': 'Lead Converted',
    'no_activity_7_days': 'Inactive 7 Days'
  };
  return triggers[trigger] || trigger;
}

// Generate human-readable workflow description
function generateWorkflowDescription(workflow) {
  try {
    const actions = workflow.actions;
    const conditions = workflow.conditions || null;
    
    let description = '';
    
    // Add conditions
    if (conditions && conditions.length > 0) {
      description += 'When ';
      description += conditions.map(c => {
        return `${c.field} ${c.operator.replace('_', ' ')} ${c.value}`;
      }).join(' AND ');
      description += ', then ';
    }
    
    // Add actions
    const actionsList = actions.map((action, index) => {
      let actionText = '';
      switch (action.type) {
        case 'update_status':
          actionText = `set status to ${action.status}`;
          break;
        case 'assign_user':
          actionText = `assign to user #${action.user_id}`;
          break;
        case 'create_activity':
          actionText = `create ${action.activity_type} activity`;
          break;
        case 'auto_convert':
          actionText = 'convert to client';
          break;
        case 'send_notification':
          actionText = 'send notification';
          break;
        default:
          actionText = action.type;
      }
      return actionText;
    });
    
    if (actionsList.length === 1) {
      description += actionsList[0];
    } else if (actionsList.length === 2) {
      description += actionsList.join(' and ');
    } else {
      description += actionsList.slice(0, -1).join(', ') + ', and ' + actionsList[actionsList.length - 1];
    }
    
    return description;
  } catch (e) {
    return 'View workflow for details';
  }
}

// Open workflow modal
function openWorkflowModal() {
  editingWorkflowId = null;
  document.getElementById('modalTitle').textContent = 'Create New Workflow';
  document.getElementById('workflowForm').reset();
  document.getElementById('workflowId').value = '';
  document.getElementById('workflowActive').checked = true;
  
  // Clear conditions and actions
  document.getElementById('conditionsContainer').innerHTML = '';
  document.getElementById('actionsContainer').innerHTML = '';
  
  document.getElementById('workflowModal').classList.add('active');
}

// Update trigger description
function updateTriggerDescription() {
  const trigger = document.getElementById('triggerEvent').value;
  const descriptions = {
    'lead_created': 'This workflow runs immediately when a new lead is added to the system.',
    'status_updated': 'This workflow runs whenever a lead\'s status is changed.',
    'lead_converted': 'This workflow runs when a lead is successfully converted to a client.',
    'no_activity_7_days': 'This workflow runs for leads with no activity in 7 days (requires scheduled task).'
  };
  
  document.getElementById('triggerDescription').textContent = descriptions[trigger] || '';
}

// Add condition
function addCondition() {
  const container = document.getElementById('conditionsContainer');
  const template = document.getElementById('conditionTemplate');
  
  if (!template) {
    console.error('Condition template not found');
    return;
  }
  
  const newCondition = template.cloneNode(true);
  newCondition.id = ''; // Remove the ID to avoid duplicates
  newCondition.style.display = 'flex';
  newCondition.removeAttribute('id'); // Ensure ID is completely removed
  
  container.appendChild(newCondition);
  
  console.log('Condition added successfully');
}

// Remove condition
function removeCondition(button) {
  button.closest('.condition-item').remove();
}

// Update condition operators based on field
function updateConditionOperators(selectElement) {
  const field = selectElement.value;
  const operatorSelect = selectElement.parentElement.querySelector('.condition-operator');
  
  if (field === 'assigned_to') {
    operatorSelect.innerHTML = `
      <option value="equals">equals</option>
      <option value="not_equals">does not equal</option>
      <option value="greater_than">is greater than</option>
      <option value="less_than">is less than</option>
    `;
  } else {
    operatorSelect.innerHTML = `
      <option value="equals">equals</option>
      <option value="not_equals">does not equal</option>
      <option value="contains">contains</option>
    `;
  }
}

// Add action
function addAction() {
  const container = document.getElementById('actionsContainer');
  
  if (!container) {
    console.error('Actions container not found');
    return;
  }
  
  const actionDiv = document.createElement('div');
  actionDiv.className = 'action-item';
  actionDiv.innerHTML = `
    <select class="action-type" onchange="updateActionInputs(this)">
      <option value="">-- Select Action --</option>
      <option value="update_status">Update Status</option>
      <option value="assign_user">Assign to User</option>
      <option value="create_activity">Create Activity</option>
      <option value="auto_convert">Convert to Client</option>
      <option value="send_notification">Send Notification</option>
    </select>
    <div class="action-inputs" style="display: flex; flex: 2; gap: 0.75rem;">
      <!-- Inputs will be added dynamically -->
    </div>
    <button type="button" class="btn btn-danger btn-sm" onclick="removeAction(this)"><i class="fas fa-trash"></i> Remove</button>
  `;
  container.appendChild(actionDiv);
  
  console.log('Action added successfully');
}

// Remove action
function removeAction(button) {
  button.closest('.action-item').remove();
}

// Update action inputs based on type
function updateActionInputs(selectElement) {
  const actionType = selectElement.value;
  const inputsContainer = selectElement.parentElement.querySelector('.action-inputs');
  
  switch (actionType) {
    case 'update_status':
      inputsContainer.innerHTML = `
        <select class="action-input" data-field="status">
          <option value="">Select Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      `;
      break;
      
    case 'assign_user':
      inputsContainer.innerHTML = `
        <input type="number" class="action-input" data-field="user_id" 
               placeholder="Enter User ID" min="1">
      `;
      break;
      
    case 'create_activity':
      inputsContainer.innerHTML = `
        <select class="action-input" data-field="activity_type">
          <option value="">Activity Type</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="note">Note</option>
        </select>
        <input type="text" class="action-input" data-field="summary" 
               placeholder="Activity summary (optional)">
      `;
      break;
      
    case 'auto_convert':
      inputsContainer.innerHTML = `
        <span style="padding: 0.6rem; color: #6c757d;">No additional settings needed</span>
      `;
      break;
      
    case 'send_notification':
      inputsContainer.innerHTML = `
        <input type="text" class="action-input" data-field="message" 
               placeholder="Notification message">
      `;
      break;
      
    default:
      inputsContainer.innerHTML = '';
  }
}

// Close workflow modal
function closeWorkflowModal() {
  document.getElementById('workflowModal').classList.remove('active');
  document.getElementById('workflowForm').reset();
}

// Save workflow
async function saveWorkflow() {
  const workflowName = document.getElementById('workflowName').value;
  const triggerEvent = document.getElementById('triggerEvent').value;
  const isActive = document.getElementById('workflowActive').checked;
  
  if (!workflowName) {
    showToast('Please enter a workflow name', 'error');
    return;
  }
  
  if (!triggerEvent) {
    showToast('Please select a trigger event', 'error');
    return;
  }
  
  // Build conditions array
  const conditionsArray = [];
  const conditionItems = document.querySelectorAll('#conditionsContainer .condition-item');
  conditionItems.forEach(item => {
    const field = item.querySelector('.condition-field').value;
    const operator = item.querySelector('.condition-operator').value;
    const value = item.querySelector('.condition-value').value;
    
    if (field && value) {
      conditionsArray.push({ field, operator, value });
    }
  });
  
  // Build actions array
  const actionsArray = [];
  const actionItems = document.querySelectorAll('#actionsContainer .action-item');
  actionItems.forEach(item => {
    const actionType = item.querySelector('.action-type').value;
    if (!actionType) return;
    
    const action = { type: actionType };
    const inputs = item.querySelectorAll('.action-input[data-field]');
    
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      if (input.value) {
        action[field] = input.value;
      }
    });
    
    actionsArray.push(action);
  });
  
  if (actionsArray.length === 0) {
    showToast('Please add at least one action', 'error');
    return;
  }
  
  const workflowData = {
    name: workflowName,
    trigger_event: triggerEvent,
    conditions: conditionsArray.length > 0 ? conditionsArray : null,
    actions: actionsArray,
    is_active: isActive
  };
  
  try {
    const id = document.getElementById('workflowId').value;
    const url = id ? `${API_BASE_URL}/workflows/${id}` : `${API_BASE_URL}/workflows`;
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess(id ? 'Workflow updated successfully' : 'Workflow created successfully');
      closeWorkflowModal();
      loadWorkflows();
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error saving workflow:', error);
    showError('Error saving workflow');
  }
}

// View workflow details
function viewWorkflow(id) {
  const workflow = allWorkflows.find(w => w.id === id);
  if (!workflow) return;
  
  const actions = workflow.actions;
  const conditions = workflow.conditions || null;
  
  let details = `
    <div class="workflow-view-content">
      <div class="workflow-view-header">
        <div class="workflow-view-title">
          <i class="fas fa-project-diagram"></i>
          <h3>${formatTrigger(workflow.trigger_event)}</h3>
        </div>
        <span class="badge ${workflow.is_active ? 'badge-qualified' : 'badge-lost'}">
          <i class="fas fa-${workflow.is_active ? 'check-circle' : 'pause-circle'}"></i>
          ${workflow.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div class="workflow-view-section">
        <div class="workflow-view-section-title">
          <i class="fas fa-bolt"></i>
          <h4>Trigger Event</h4>
        </div>
        <div class="workflow-view-info">
          <p>${formatTrigger(workflow.trigger_event)}</p>
          <small class="text-muted">${getTriggerDescription(workflow.trigger_event)}</small>
        </div>
      </div>
  `;
  
  if (conditions && conditions.length > 0) {
    details += `
      <div class="workflow-view-section">
        <div class="workflow-view-section-title">
          <i class="fas fa-filter"></i>
          <h4>Conditions</h4>
        </div>
        <div class="workflow-view-list">
    `;
    conditions.forEach((c, index) => {
      details += `
        <div class="workflow-view-item">
          <span class="workflow-item-number">${index + 1}</span>
          <div class="workflow-item-content">
            <strong>${c.field}</strong> ${c.operator.replace('_', ' ')} <code>${c.value}</code>
          </div>
        </div>
      `;
    });
    details += `</div></div>`;
  } else {
    details += `
      <div class="workflow-view-section">
        <div class="workflow-view-section-title">
          <i class="fas fa-filter"></i>
          <h4>Conditions</h4>
        </div>
        <div class="workflow-view-info">
          <p class="text-muted"><i class="fas fa-info-circle"></i> No conditions - applies to all leads</p>
        </div>
      </div>
    `;
  }
  
  details += `
    <div class="workflow-view-section">
      <div class="workflow-view-section-title">
        <i class="fas fa-tasks"></i>
        <h4>Actions</h4>
      </div>
      <div class="workflow-view-list">
  `;
  
  actions.forEach((action, index) => {
    let actionIcon = '';
    let actionText = '';
    let actionDetails = '';
    
    switch (action.type) {
      case 'update_status':
        actionIcon = 'fas fa-flag';
        actionText = 'Update Status';
        actionDetails = `Change status to <code>${action.status}</code>`;
        break;
      case 'assign_user':
        actionIcon = 'fas fa-user-tag';
        actionText = 'Assign User';
        actionDetails = `Assign to user ID: <code>${action.user_id}</code>`;
        break;
      case 'create_activity':
        actionIcon = 'fas fa-calendar-plus';
        actionText = 'Create Activity';
        actionDetails = `Create <code>${action.activity_type}</code> activity`;
        if (action.summary) actionDetails += ` - "${action.summary}"`;
        break;
      case 'auto_convert':
        actionIcon = 'fas fa-sync-alt';
        actionText = 'Auto Convert';
        actionDetails = 'Automatically convert lead to client';
        break;
      case 'send_notification':
        actionIcon = 'fas fa-bell';
        actionText = 'Send Notification';
        actionDetails = action.message;
        break;
    }
    
    details += `
      <div class="workflow-view-item">
        <span class="workflow-item-number">${index + 1}</span>
        <div class="workflow-item-content">
          <div class="workflow-item-title">
            <i class="${actionIcon}"></i>
            <strong>${actionText}</strong>
          </div>
          <div class="workflow-item-details">${actionDetails}</div>
        </div>
      </div>
    `;
  });
  
  details += `
      </div>
    </div>
    <div class="workflow-view-footer">
      <button class="btn btn-secondary" onclick="closeViewModal()">
        <i class="fas fa-times"></i> Close
      </button>
      <button class="btn btn-primary" onclick="closeViewModal(); editWorkflow(${workflow.id})">
        <i class="fas fa-edit"></i> Edit Workflow
      </button>
    </div>
    </div>
  `;
  
  document.getElementById('viewModalContent').innerHTML = details;
  document.getElementById('viewModal').classList.add('active');
}

// Edit workflow
function editWorkflow(id) {
  const workflow = allWorkflows.find(w => w.id === id);
  if (!workflow) return;
  
  editingWorkflowId = id;
  document.getElementById('modalTitle').textContent = 'Edit Workflow';
  document.getElementById('workflowId').value = id;
  document.getElementById('workflowName').value = workflow.name || '';
  document.getElementById('triggerEvent').value = workflow.trigger_event;
  document.getElementById('workflowActive').checked = workflow.is_active;
  
  updateTriggerDescription();
  
  // Clear and populate conditions
  const conditionsContainer = document.getElementById('conditionsContainer');
  conditionsContainer.innerHTML = '';
  
  const conditions = workflow.conditions || [];
  conditions.forEach(condition => {
    const newCondition = document.createElement('div');
    newCondition.className = 'condition-item';
    newCondition.style.display = 'flex';
    newCondition.innerHTML = `
      <select class="condition-field" onchange="updateConditionOperators(this)">
        <option value="">Select Field</option>
        <option value="status">Status</option>
        <option value="source">Source</option>
        <option value="email">Email</option>
        <option value="assigned_to">Assigned To</option>
      </select>
      
      <select class="condition-operator">
        <option value="equals">equals</option>
        <option value="not_equals">does not equal</option>
        <option value="contains">contains</option>
        <option value="greater_than">is greater than</option>
        <option value="less_than">is less than</option>
      </select>
      
      <input type="text" class="condition-value" placeholder="Enter value">
      
      <button type="button" class="btn btn-danger btn-sm" onclick="removeCondition(this)"><i class="fas fa-trash"></i> Remove</button>
    `;
    
    newCondition.querySelector('.condition-field').value = condition.field;
    updateConditionOperators(newCondition.querySelector('.condition-field'));
    newCondition.querySelector('.condition-operator').value = condition.operator;
    newCondition.querySelector('.condition-value').value = condition.value;
    
    conditionsContainer.appendChild(newCondition);
  });
  
  // Clear and populate actions
  const actionsContainer = document.getElementById('actionsContainer');
  actionsContainer.innerHTML = '';
  
  const actions = workflow.actions;
  actions.forEach(action => {
    const actionDiv = document.createElement('div');
    actionDiv.className = 'action-item';
    actionDiv.innerHTML = `
      <select class="action-type" onchange="updateActionInputs(this)">
        <option value="">-- Select Action --</option>
        <option value="update_status">Update Status</option>
        <option value="assign_user">Assign to User</option>
        <option value="create_activity">Create Activity</option>
        <option value="auto_convert">Convert to Client</option>
        <option value="send_notification">Send Notification</option>
      </select>
      <div class="action-inputs" style="display: flex; flex: 2; gap: 0.75rem;">
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeAction(this)">Remove</button>
    `;
    actionsContainer.appendChild(actionDiv);
    
    // Set action type and populate inputs
    actionDiv.querySelector('.action-type').value = action.type;
    updateActionInputs(actionDiv.querySelector('.action-type'));
    
    // Populate action-specific fields
    const inputs = actionDiv.querySelectorAll('.action-input[data-field]');
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      if (action[field]) {
        input.value = action[field];
      }
    });
  });
  
  document.getElementById('workflowModal').classList.add('active');
}

// Helper function to get trigger description
function getTriggerDescription(trigger) {
  const descriptions = {
    'lead_created': 'Runs immediately when a new lead is added to the system',
    'status_updated': 'Runs whenever a lead\'s status is changed',
    'lead_converted': 'Runs when a lead is successfully converted to a client',
    'no_activity_7_days': 'Runs for leads with no activity in 7 days (requires scheduled task)'
  };
  return descriptions[trigger] || '';
}

// Close view modal
function closeViewModal() {
  document.getElementById('viewModal').classList.remove('active');
}

// Toggle workflow active status
async function toggleWorkflow(id, isActive) {
  const workflow = allWorkflows.find(w => w.id === id);
  if (!workflow) return;

  try {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trigger_event: workflow.trigger_event,
        conditions: workflow.conditions || null,
        actions: workflow.actions,
        is_active: isActive
      })
    });

    const data = await response.json();

    if (data.success) {
      showSuccess(`Workflow ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadWorkflows();
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error toggling workflow:', error);
    showError('Error toggling workflow');
  }
}

// Delete workflow
async function deleteWorkflow(id) {
  if (!confirm('Are you sure you want to delete this workflow?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Workflow deleted successfully');
      loadWorkflows();
    } else {
      showError('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error deleting workflow:', error);
    showError('Error deleting workflow');
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
  const workflowModal = document.getElementById('workflowModal');
  const viewModal = document.getElementById('viewModal');
  
  if (event.target === workflowModal) {
    closeWorkflowModal();
  }
  
  if (event.target === viewModal) {
    closeViewModal();
  }
};


