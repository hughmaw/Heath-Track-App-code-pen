document.addEventListener('DOMContentLoaded', function() {
    // Treatment data
    const treatments = [
        { name: "Vitamins", progress: 90 },
        { name: "Arm Exercises", progress: 94 }
    ];

    // DOM elements
    const treatmentsList = document.getElementById('treatments-list');
    const overallProgressTitle = document.getElementById('overall-progress-title');
    const addTreatmentBtn = document.getElementById('add-treatment-btn');
    const treatmentForm = document.getElementById('treatment-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');

    // Calculate overall progress
    function calculateOverallProgress() {
        const total = treatments.reduce((sum, t) => sum + t.progress, 0);
        return Math.round(total / treatments.length);
    }

    // Render treatments
    function renderTreatments() {
        treatmentsList.innerHTML = '';
        
        treatments.forEach(treatment => {
            const treatmentItem = document.createElement('div');
            treatmentItem.className = 'treatment-item';
            treatmentItem.innerHTML = `
                <div class="treatment-header">
                    <span class="treatment-name">${treatment.name}</span>
                    <span class="treatment-percentage">${treatment.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${treatment.progress}%"></div>
                </div>
            `;
            treatmentsList.appendChild(treatmentItem);
        });

        overallProgressTitle.textContent = `Your current treatment is ${calculateOverallProgress()}% complete overall!`;
    }

    // Show form
    function showForm() {
        addTreatmentBtn.style.display = 'none';
        treatmentForm.style.display = 'block';
    }

    // Hide form
    function hideForm() {
        addTreatmentBtn.style.display = 'inline-flex';
        treatmentForm.style.display = 'none';
        clearForm();
    }

    // Clear form inputs
    function clearForm() {
        document.getElementById('treatment-type').value = '';
        document.getElementById('treatment-frequency').value = '';
        document.getElementById('treatment-length').value = '';
        document.getElementById('doctor-notes').value = '';
        document.getElementById('reminders-toggle').checked = false;
        document.getElementById('caregiver-toggle').checked = false;
    }

    // Save treatment (for demo purposes, just hides form)
    function saveTreatment() {
        const type = document.getElementById('treatment-type').value;
        if (type) {
            treatments.push({ name: type, progress: 0 });
            renderTreatments();
        }
        hideForm();
    }

    // Event listeners
    addTreatmentBtn.addEventListener('click', showForm);
    cancelBtn.addEventListener('click', hideForm);
    saveBtn.addEventListener('click', saveTreatment);

    // Initial render
    renderTreatments();
});
