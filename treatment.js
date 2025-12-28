document.addEventListener('DOMContentLoaded', function() {
    // Load treatments from localStorage or use defaults
    let treatments = JSON.parse(localStorage.getItem('treatments') || '[]');

    // Migrate old treatments to new format if needed
    treatments = migrateTreatments(treatments);

    // If no treatments exist, add default ones
    if (treatments.length === 0) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 27);
        const thirtyDaysFromStart = new Date(thirtyDaysAgo);
        thirtyDaysFromStart.setDate(thirtyDaysFromStart.getDate() + 30);

        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 56);
        const sixtyDaysFromStart = new Date(sixtyDaysAgo);
        sixtyDaysFromStart.setDate(sixtyDaysFromStart.getDate() + 60);

        treatments = [
            {
                id: 'treatment_1',
                name: "Vitamins",
                frequency: "Daily",
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: thirtyDaysFromStart.toISOString().split('T')[0],
                notes: "Take with breakfast",
                reminders: true,
                caregiverNotif: false,
                manualProgress: null
            },
            {
                id: 'treatment_2',
                name: "Arm Exercises",
                frequency: "Daily",
                startDate: sixtyDaysAgo.toISOString().split('T')[0],
                endDate: sixtyDaysFromStart.toISOString().split('T')[0],
                notes: "15 minutes morning and evening",
                reminders: true,
                caregiverNotif: false,
                manualProgress: null
            }
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
    const startDateInput = document.getElementById('treatment-start-date');
    const endDateInput = document.getElementById('treatment-end-date');
    const progressFillPreview = document.getElementById('progress-fill-preview');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressHint = document.getElementById('progress-hint');

    let editingTreatmentId = null;

    // Migrate old treatment format to new format
    function migrateTreatments(treatments) {
        return treatments.map(t => {
            // If treatment has old format (progress and length as text), migrate it
            if (t.length && !t.startDate) {
                const today = new Date();
                // Parse length like "30 days" to get number of days
                const daysMatch = t.length.match(/(\d+)/);
                const totalDays = daysMatch ? parseInt(daysMatch[1]) : 30;

                // Calculate start date based on progress
                const progressPercent = t.progress || 0;
                const daysElapsed = Math.round((progressPercent / 100) * totalDays);
                const startDate = new Date(today);
                startDate.setDate(startDate.getDate() - daysElapsed);

                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + totalDays);

                return {
                    ...t,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    manualProgress: null
                };
            }
            return t;
        });
    }

    // Calculate progress based on dates
    function calculateDateProgress(startDate, endDate) {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        // Reset time portions for accurate day calculation
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const totalDuration = end - start;
        const elapsed = today - start;

        if (elapsed <= 0) return 0;
        if (elapsed >= totalDuration) return 100;

        return Math.round((elapsed / totalDuration) * 100);
    }

    // Get treatment progress (either manual override or calculated)
    function getTreatmentProgress(treatment) {
        if (treatment.manualProgress !== null && treatment.manualProgress !== undefined && treatment.manualProgress !== '') {
            return parseInt(treatment.manualProgress);
        }
        return calculateDateProgress(treatment.startDate, treatment.endDate);
    }

    // Format date for display
    function formatDate(dateStr) {
        if (!dateStr) return 'Not set';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Calculate days remaining
    function getDaysRemaining(endDate) {
        if (!endDate) return null;
        const end = new Date(endDate);
        const today = new Date();
        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return diff;
    }

    // Calculate overall progress
    function calculateOverallProgress() {
        if (treatments.length === 0) return 0;
        const total = treatments.reduce((sum, t) => sum + getTreatmentProgress(t), 0);
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
            const progress = getTreatmentProgress(treatment);
            const daysRemaining = getDaysRemaining(treatment.endDate);
            let statusText = '';

            if (daysRemaining !== null) {
                if (daysRemaining < 0) {
                    statusText = `Completed ${Math.abs(daysRemaining)} days ago`;
                } else if (daysRemaining === 0) {
                    statusText = 'Ends today';
                } else {
                    statusText = `${daysRemaining} days remaining`;
                }
            }

            const treatmentItem = document.createElement('div');
            treatmentItem.className = 'treatment-item';
            treatmentItem.innerHTML = `
                <div class="treatment-header">
                    <span class="treatment-name">${treatment.name}</span>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="treatment-percentage">${progress}%</span>
                        <button class="icon-btn edit-treatment-btn" data-id="${treatment.id}" title="Edit">
                            <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button class="icon-btn delete-treatment-btn" data-id="${treatment.id}" title="Delete" style="color: #ef4444;">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="treatment-details">
                    <span>${treatment.frequency || 'As needed'}</span> • <span>${statusText}</span>
                </div>
                <div class="treatment-dates">
                    ${formatDate(treatment.startDate)} → ${formatDate(treatment.endDate)}
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

        // Save updated treatments (in case progress was recalculated)
        localStorage.setItem('treatments', JSON.stringify(treatments));
    }

    // Update progress preview in form
    function updateProgressPreview() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const manualProgress = document.getElementById('treatment-progress').value;

        let progress;
        if (manualProgress !== '' && manualProgress !== null) {
            progress = parseInt(manualProgress);
            progressHint.textContent = 'Using manual override';
        } else if (startDate && endDate) {
            progress = calculateDateProgress(startDate, endDate);
            const daysRemaining = getDaysRemaining(endDate);
            if (daysRemaining !== null) {
                if (daysRemaining < 0) {
                    progressHint.textContent = `Treatment completed ${Math.abs(daysRemaining)} days ago`;
                } else if (daysRemaining === 0) {
                    progressHint.textContent = 'Treatment ends today';
                } else {
                    progressHint.textContent = `${daysRemaining} days remaining`;
                }
            }
        } else {
            progress = 0;
            progressHint.textContent = 'Set start and end dates to auto-calculate progress';
        }

        progressFillPreview.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress}%`;
    }

    // Show form
    function showForm() {
        addTreatmentBtn.style.display = 'none';
        treatmentForm.style.display = 'block';
        document.querySelector('.form-card .card-title').textContent = 'Add Treatment Plan';

        // Set default dates
        const today = new Date();
        startDateInput.value = today.toISOString().split('T')[0];
        const defaultEnd = new Date(today);
        defaultEnd.setDate(defaultEnd.getDate() + 30);
        endDateInput.value = defaultEnd.toISOString().split('T')[0];

        updateProgressPreview();
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
        document.getElementById('treatment-start-date').value = '';
        document.getElementById('treatment-end-date').value = '';
        document.getElementById('doctor-notes').value = '';
        document.getElementById('reminders-toggle').checked = false;
        document.getElementById('caregiver-toggle').checked = false;
        document.getElementById('treatment-progress').value = '';
        updateProgressPreview();
    }

    // Save treatment
    function saveTreatment() {
        const type = document.getElementById('treatment-type').value.trim();
        const frequency = document.getElementById('treatment-frequency').value.trim();
        const startDate = document.getElementById('treatment-start-date').value;
        const endDate = document.getElementById('treatment-end-date').value;
        const notes = document.getElementById('doctor-notes').value.trim();
        const reminders = document.getElementById('reminders-toggle').checked;
        const caregiverNotif = document.getElementById('caregiver-toggle').checked;
        const manualProgressValue = document.getElementById('treatment-progress').value;
        const manualProgress = manualProgressValue !== '' ? parseInt(manualProgressValue) : null;

        if (!type) {
            alert('Please enter a treatment type');
            return;
        }

        if (!startDate || !endDate) {
            alert('Please set start and end dates');
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            alert('End date must be after start date');
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
                    startDate,
                    endDate,
                    notes,
                    reminders,
                    caregiverNotif,
                    manualProgress
                };
            }
        } else {
            // Add new treatment
            const newTreatment = {
                id: 'treatment_' + Date.now(),
                name: type,
                frequency: frequency || 'As needed',
                startDate,
                endDate,
                notes,
                reminders,
                caregiverNotif,
                manualProgress
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
        document.getElementById('treatment-start-date').value = treatment.startDate || '';
        document.getElementById('treatment-end-date').value = treatment.endDate || '';
        document.getElementById('doctor-notes').value = treatment.notes || '';
        document.getElementById('reminders-toggle').checked = treatment.reminders;
        document.getElementById('caregiver-toggle').checked = treatment.caregiverNotif;
        document.getElementById('treatment-progress').value = treatment.manualProgress !== null ? treatment.manualProgress : '';

        document.querySelector('.form-card .card-title').textContent = 'Edit Treatment Plan';
        addTreatmentBtn.style.display = 'none';
        treatmentForm.style.display = 'block';

        updateProgressPreview();
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

    // Update progress preview when dates or manual progress change
    startDateInput.addEventListener('change', updateProgressPreview);
    endDateInput.addEventListener('change', updateProgressPreview);
    document.getElementById('treatment-progress').addEventListener('input', updateProgressPreview);

    // Initial render
    renderTreatments();
});
