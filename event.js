// Event data storage
let eventData = {
    affectedArea: null,
    discomfortLevel: 3,
    discomfortType: '',
    voiceNote: null
};

// Body diagram interaction
const bodyParts = document.querySelectorAll('.body-part');
const selectAreaBtn = document.getElementById('select-area-btn');

bodyParts.forEach(part => {
    part.addEventListener('click', function() {
        // Remove previous selection
        bodyParts.forEach(p => p.classList.remove('selected'));
        
        // Add selection to clicked part
        this.classList.add('selected');
        
        // Store the affected area
        eventData.affectedArea = this.getAttribute('data-part');
        
        // Update button state
        selectAreaBtn.classList.add('selected');
        selectAreaBtn.textContent = 'Area selected ✓';
    });
});

// Discomfort level slider
const discomfortSlider = document.getElementById('discomfort-slider');
const emojiOptions = document.querySelectorAll('.emoji-option');
const selectDiscomfortBtn = document.getElementById('select-discomfort-btn');

function updateEmojiSelection(level) {
    emojiOptions.forEach(option => {
        option.classList.remove('selected');
        if (parseInt(option.getAttribute('data-level')) === level) {
            option.classList.add('selected');
        }
    });
    eventData.discomfortLevel = level;
}

discomfortSlider.addEventListener('input', function() {
    updateEmojiSelection(parseInt(this.value));
});

emojiOptions.forEach(option => {
    option.addEventListener('click', function() {
        const level = parseInt(this.getAttribute('data-level'));
        discomfortSlider.value = level;
        updateEmojiSelection(level);
    });
});

// Initialize with default value
updateEmojiSelection(3);

selectDiscomfortBtn.addEventListener('click', function() {
    this.classList.add('selected');
    this.textContent = `Level ${eventData.discomfortLevel} selected ✓`;
});

// Discomfort type dropdown
const discomfortTypeSelect = document.getElementById('discomfort-type-select');
const selectTypeBtn = document.getElementById('select-type-btn');

discomfortTypeSelect.addEventListener('change', function() {
    if (this.value) {
        eventData.discomfortType = this.value;
        selectTypeBtn.classList.add('selected');
        selectTypeBtn.textContent = 'Type selected ✓';
    } else {
        eventData.discomfortType = '';
        selectTypeBtn.classList.remove('selected');
        selectTypeBtn.textContent = 'Type of discomfort';
    }
});

// Voice note functionality
const voiceBtn = document.getElementById('voice-btn');
const voiceNoteBtn = document.getElementById('voice-note-btn');
let isRecording = false;

voiceBtn.addEventListener('click', function() {
    isRecording = !isRecording;
    
    if (isRecording) {
        this.classList.add('recording');
        voiceNoteBtn.classList.add('recording');
        voiceNoteBtn.textContent = 'Recording... (tap to stop)';
        
        // Here you would implement actual voice recording
        console.log('Started recording...');
    } else {
        this.classList.remove('recording');
        voiceNoteBtn.classList.remove('recording');
        voiceNoteBtn.classList.add('selected');
        voiceNoteBtn.textContent = 'Voice note recorded ✓';
        
        eventData.voiceNote = 'recorded'; // Placeholder
        console.log('Stopped recording');
    }
});

// Save event
const saveEventBtn = document.getElementById('save-event-btn');

saveEventBtn.addEventListener('click', function() {
    // Validate required fields
    if (!eventData.affectedArea) {
        alert('Please select an affected area');
        return;
    }
    
    if (!eventData.discomfortType) {
        alert('Please select a discomfort type');
        return;
    }
    
    // Save the event data
    console.log('Saving event:', eventData);
    
    // Here you would typically send this data to a server or save to local storage
    // For now, we'll just show a success message
    alert('Event saved successfully!');
    
    // Optionally redirect back to index
    // window.location.href = 'index.html';
});