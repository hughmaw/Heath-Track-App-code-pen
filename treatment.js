document.addEventListener('DOMContentLoaded', function() {
    // Load treatments from localStorage or use defaults
    let treatments = JSON.parse(localStorage.getItem('treatments') || '[]');
    
    // If no treatments exist, add default ones
    if (treatments.length === 0) {
        treatments = [
            { id: 'treatment_1', name: "Vitamins", progress: 90, frequency: "Daily", length: "30 days", notes: "", reminders: true, caregiverNotif: false },
            { id: 'treatment_2', name: "Arm Exercises", progress: 94, frequency: "Daily", length: "60 days", notes: "", reminders: true, caregiverNotif: false }
        ];
        localStorage.setItem('treatments', JSON.stringify(treatments));
    }

    // DOM elements
    const treatmentsList = document.getElementById('treatments-list');
    const overallProgressTitle = document.getElementById('overall-progress-title');
    const addTreatmentBtn = document.getElementById('add-treatment-btn');
    const treatmentForm = document.getElementById('treatment-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');

    let editingTreatmentId = null;

    // Calculate overall progress
    function calculateOverallProgress() {
        if (treatments.length === 0) return 0;
        const total = treatments.reduce((sum, t) => sum + t.progress, 0);
        return Math.round(total / treatments.length);
    }

    // Render treatments
    function renderTreatments() {
        treatmentsList.innerHTML = '';
        
        if (treatments.length === 0) {
            overallProgressTitle.textContent = 'No active treatments yet!';
            return;
        }

        treatments.forEach(treatment => {
            const treatmentItem = document.createElement('div');
            treatmentItem.className = 'treatment-item';
            treatmentItem.innerHTML = `
                <div class="treatment-header">
                    <span class="treatment-name">${treatment.name}</span>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="treatment-percentage">${treatment.progress}%</span>
                        <button class="icon-btn edit-treatment-btn" data-id="${treatment.id}" title="Edit">
                            <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button class="icon-btn delete-treatment-btn" data-id="${treatment.id}" title="Delete" style="color: #ef4444;">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${treatment.progress}%"></div>
                </div>
                <div class="treatment-details" style="margin-top: 8px; font-size: 12px; color: #6b7280;">
                    <span>${treatment.frequency}</span> • <span>${treatment.length}</span>
                </div>
            `;
            treatmentsList.appendChild(treatmentItem);
        });

        // Update icons
        lucide.createIcons();

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-treatment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editTreatment(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.delete-treatment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteTreatment(this.getAttribute('data-id'));
            });
        });

        overallProgressTitle.textContent = `Your current treatment is ${calculateOverallProgress()}% complete overall!`;
    }

    // Show form
    function showForm() {
        addTreatmentBtn.style.display = 'none';
        treatmentForm.style.display = 'block';
        document.querySelector('.form-card .card-title').textContent = 'Add Treatment Plan';
    }

    // Hide form
    function hideForm() {
        addTreatmentBtn.style.display = 'inline-flex';
        treatmentForm.style.display = 'none';
        clearForm();
        editingTreatmentId = null;
    }

    // Clear form inputs
    function clearForm() {
        document.getElementById('treatment-type').value = '';
        document.getElementById('treatment-frequency').value = '';
        document.getElementById('treatment-length').value = '';
        document.getElementById('doctor-notes').value = '';
        document.getElementById('reminders-toggle').checked = false;
        document.getElementById('caregiver-toggle').checked = false;
        document.getElementById('treatment-progress').value = '0';
    }

    // Save treatment
    function saveTreatment() {
        const type = document.getElementById('treatment-type').value.trim();
        const frequency = document.getElementById('treatment-frequency').value.trim();
        const length = document.getElementById('treatment-length').value.trim();
        const notes = document.getElementById('doctor-notes').value.trim();
        const reminders = document.getElementById('reminders-toggle').checked;
        const caregiverNotif = document.getElementById('caregiver-toggle').checked;
        const progress = parseInt(document.getElementById('treatment-progress').value) || 0;

        if (!type) {
            alert('Please enter a treatment type');
            return;
        }

        if (editingTreatmentId) {
            // Update existing treatment
            const index = treatments.findIndex(t => t.id === editingTreatmentId);
            if (index !== -1) {
                treatments[index] = {
                    ...treatments[index],
                    name: type,
                    frequency: frequency || 'As needed',
                    length: length || 'Ongoing',
                    notes,
                    reminders,
                    caregiverNotif,
                    progress
                };
            }
        } else {
            // Add new treatment
            const newTreatment = {
                id: 'treatment_' + Date.now(),
                name: type,
                frequency: frequency || 'As needed',
                length: length || 'Ongoing',
                notes,
                reminders,
                caregiverNotif,
                progress: progress
            };
            treatments.push(newTreatment);
        }

        // Save to localStorage
        localStorage.setItem('treatments', JSON.stringify(treatments));
        
        renderTreatments();
        hideForm();
    }

    // Edit treatment
    function editTreatment(id) {
        const treatment = treatments.find(t => t.id === id);
        if (!treatment) return;

        editingTreatmentId = id;
        
        document.getElementById('treatment-type').value = treatment.name;
        document.getElementById('treatment-frequency').value = treatment.frequency;
        document.getElementById('treatment-length').value = treatment.length;
        document.getElementById('doctor-notes').value = treatment.notes;
        document.getElementById('reminders-toggle').checked = treatment.reminders;
        document.getElementById('caregiver-toggle').checked = treatment.caregiverNotif;
        document.getElementById('treatment-progress').value = treatment.progress;

        document.querySelector('.form-card .card-title').textContent = 'Edit Treatment Plan';
        addTreatmentBtn.style.display = 'none';
        treatmentForm.style.display = 'block';
    }

    // Delete treatment
    function deleteTreatment(id) {
        if (confirm('Are you sure you want to delete this treatment?')) {
            treatments = treatments.filter(t => t.id !== id);
            localStorage.setItem('treatments', JSON.stringify(treatments));
            renderTreatments();
        }
    }

    // Event listeners
    addTreatmentBtn.addEventListener('click', showForm);
    cancelBtn.addEventListener('click', hideForm);
    saveBtn.addEventListener('click', saveTreatment);

    // Initial render
    renderTreatments();
});