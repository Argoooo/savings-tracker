// Tracker Manager - Handles multi-tracker functionality
// Loads, creates, switches between trackers

class TrackerManager {
  constructor(api) {
    this.api = api;
    this.trackers = [];
    this.currentTrackerId = null;
  }

  // Initialize tracker manager
  async initialize() {
    try {
      // Load all user's trackers
      this.trackers = await this.api.getTrackers();

      // Restore last used tracker or use first one
      const savedTrackerId = localStorage.getItem('currentTrackerId');
      
      if (savedTrackerId && this.trackers.find(t => t.id === savedTrackerId)) {
        this.currentTrackerId = savedTrackerId;
      } else if (this.trackers.length > 0) {
        this.currentTrackerId = this.trackers[0].id;
      } else {
        // Create first tracker automatically
        const newTracker = await this.createTracker('My Savings Tracker', '');
        this.currentTrackerId = newTracker.id;
      }

      // Save to localStorage
      localStorage.setItem('currentTrackerId', this.currentTrackerId);

      return this.currentTrackerId;
    } catch (error) {
      console.error('Error initializing tracker manager:', error);
      throw error;
    }
  }

  // Get current tracker
  getCurrentTracker() {
    return this.trackers.find(t => t.id === this.currentTrackerId);
  }

  // Switch to a different tracker
  async switchTracker(trackerId) {
    if (!this.trackers.find(t => t.id === trackerId)) {
      throw new Error('Tracker not found');
    }

    this.currentTrackerId = trackerId;
    localStorage.setItem('currentTrackerId', trackerId);
    
    // Reinitialize API with new tracker
    this.api = new SavingsAPI(auth, trackerId);

    // Dispatch event for UI to react
    window.dispatchEvent(new CustomEvent('tracker-changed', {
      detail: { trackerId, tracker: this.getCurrentTracker() }
    }));

    return trackerId;
  }

  // Create a new tracker
  async createTracker(name, description = '') {
    try {
      const result = await this.api.createTracker(name, description);
      
      // Reload trackers list
      this.trackers = await this.api.getTrackers();
      
      // Switch to new tracker
      await this.switchTracker(result.id);
      
      return result;
    } catch (error) {
      console.error('Error creating tracker:', error);
      throw error;
    }
  }

  // Update tracker (name, description)
  async updateTracker(trackerId, name, description) {
    try {
      await this.api.updateTracker(trackerId, name, description);
      
      // Reload trackers list
      this.trackers = await this.api.getTrackers();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('tracker-updated', {
        detail: { trackerId }
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating tracker:', error);
      throw error;
    }
  }

  // Delete a tracker
  async deleteTracker(trackerId) {
    try {
      await this.api.deleteTracker(trackerId);
      
      // Remove from local list
      this.trackers = this.trackers.filter(t => t.id !== trackerId);
      
      // If deleted tracker was current, switch to another
      if (this.currentTrackerId === trackerId) {
        if (this.trackers.length > 0) {
          await this.switchTracker(this.trackers[0].id);
        } else {
          // Create a new default tracker
          const newTracker = await this.createTracker('My Savings Tracker', '');
        }
      }
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('tracker-deleted', {
        detail: { trackerId }
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting tracker:', error);
      throw error;
    }
  }

  // Transfer tracker ownership
  async transferOwnership(trackerId, newOwnerId, newOwnerEmail) {
    try {
      await this.api.transferTrackerOwnership(trackerId, newOwnerId, newOwnerEmail);
      
      // Reload trackers list to reflect ownership change
      this.trackers = await this.api.getTrackers();
      
      // If transferred tracker was current, we might lose access
      const currentTracker = this.trackers.find(t => t.id === trackerId);
      if (!currentTracker || !currentTracker.isOwner) {
        // Switch to first owned tracker or create new one
        const ownedTracker = this.trackers.find(t => t.isOwner);
        if (ownedTracker) {
          await this.switchTracker(ownedTracker.id);
        } else {
          const newTracker = await this.createTracker('My Savings Tracker', '');
        }
      }
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('tracker-ownership-transferred', {
        detail: { trackerId }
      }));
      
      return true;
    } catch (error) {
      console.error('Error transferring tracker ownership:', error);
      throw error;
    }
  }
}

// UI Helper Functions

// Render tracker selector dropdown
function renderTrackerSelector(trackerManager) {
  const selector = document.getElementById('tracker-select');
  if (!selector) return;

  selector.innerHTML = '';
  
  trackerManager.trackers.forEach(tracker => {
    const option = document.createElement('option');
    option.value = tracker.id;
    option.textContent = tracker.name;
    option.selected = tracker.id === trackerManager.currentTrackerId;
    selector.appendChild(option);
  });
}

// Show create tracker modal
function showCreateTrackerModal() {
  const modal = document.getElementById('create-tracker-modal');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('new-tracker-name').focus();
  }
}

// Hide create tracker modal
function hideCreateTrackerModal() {
  const modal = document.getElementById('create-tracker-modal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('new-tracker-name').value = '';
    document.getElementById('new-tracker-desc').value = '';
  }
}

// Handle tracker selection change
async function handleTrackerChange(trackerManager, event) {
  const trackerId = event.target.value;
  
  try {
    await trackerManager.switchTracker(trackerId);
    
    // Reload all data for new tracker
    if (typeof loadAllData === 'function') {
      await loadAllData();
    }
    if (typeof renderAll === 'function') {
      renderAll();
    }
    
    showAlert('Switched to tracker: ' + trackerManager.getCurrentTracker().name, 'success');
  } catch (error) {
    showAlert('Failed to switch tracker: ' + error.message, 'danger');
  }
}

// Handle create tracker
async function handleCreateTracker(trackerManager) {
  const name = document.getElementById('new-tracker-name').value.trim();
  const description = document.getElementById('new-tracker-desc').value.trim();

  if (!name) {
    showAlert('Please enter a tracker name', 'danger');
    return;
  }

  try {
    await trackerManager.createTracker(name, description);
    
    // Update UI
    renderTrackerSelector(trackerManager);
    
    // Reload all data
    if (typeof loadAllData === 'function') {
      await loadAllData();
    }
    if (typeof renderAll === 'function') {
      renderAll();
    }
    
    hideCreateTrackerModal();
    showAlert('Tracker created successfully!', 'success');
  } catch (error) {
    showAlert('Failed to create tracker: ' + error.message, 'danger');
  }
}

// Initialize tracker UI
function initializeTrackerUI(trackerManager) {
  // Render selector
  renderTrackerSelector(trackerManager);

  // Add event listeners
  const selector = document.getElementById('tracker-select');
  if (selector) {
    selector.addEventListener('change', (e) => handleTrackerChange(trackerManager, e));
  }

  const createBtn = document.getElementById('btn-new-tracker');
  if (createBtn) {
    createBtn.addEventListener('click', showCreateTrackerModal);
  }

  const createModalBtn = document.getElementById('btn-create-tracker');
  if (createModalBtn) {
    createModalBtn.addEventListener('click', () => handleCreateTracker(trackerManager));
  }

  const cancelBtn = document.getElementById('btn-cancel-tracker');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideCreateTrackerModal);
  }

  // Close modal on outside click
  const modal = document.getElementById('create-tracker-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideCreateTrackerModal();
      }
    });
  }

  // Listen for tracker changes and update UI
  window.addEventListener('tracker-changed', () => {
    renderTrackerSelector(trackerManager);
  });

  window.addEventListener('tracker-deleted', () => {
    renderTrackerSelector(trackerManager);
  });
}

// Export for use in other modules (Browser)
if (typeof window !== 'undefined') {
  window.TrackerManager = TrackerManager;
  window.renderTrackerSelector = renderTrackerSelector;
  window.showCreateTrackerModal = showCreateTrackerModal;
  window.hideCreateTrackerModal = hideCreateTrackerModal;
  window.handleCreateTracker = handleCreateTracker;
  window.initializeTrackerUI = initializeTrackerUI;
  console.log('✅ tracker-manager.js: TrackerManager exported to window');
}

// Export for Node.js modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    TrackerManager, 
    renderTrackerSelector, 
    showCreateTrackerModal, 
    hideCreateTrackerModal, 
    handleCreateTracker, 
    initializeTrackerUI 
  };
}

