// Event data storage
let eventData = {
    affectedArea: null,
    discomfortLevel: 3,
    discomfortType: '',
    discomfortTypeLabel: '',
    voiceNote: null
};

// Initialize date and time fields with current values
const eventDateInput = document.getElementById('event-date');
const eventTimeInput = document.getElementById('event-time');

function initializeDateTimeFields() {
    const now = new Date();
    // Set date (YYYY-MM-DD format)
    eventDateInput.value = now.toISOString().split('T')[0];
    // Set time (HH:MM format)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    eventTimeInput.value = `${hours}:${minutes}`;
}

initializeDateTimeFields();

// Body diagram interaction
const bodyParts = document.querySelectorAll('.body-part');
const selectAreaBtn = document.getElementById('select-area-btn');

bodyParts.forEach(part => {
    part.addEventListener('click', function() {
        bodyParts.forEach(p => p.classList.remove('selected'));
        this.classList.add('selected');
        eventData.affectedArea = this.getAttribute('data-part');
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
        // Save the readable label (with emoji) for display on calendar
        const selectedOption = this.options[this.selectedIndex];
        eventData.discomfortTypeLabel = selectedOption.textContent;
        selectTypeBtn.classList.add('selected');
        selectTypeBtn.textContent = 'Type selected ✓';
    } else {
        eventData.discomfortType = '';
        eventData.discomfortTypeLabel = '';
        selectTypeBtn.classList.remove('selected');
        selectTypeBtn.textContent = 'Type of discomfort';
    }
});

// Voice note functionality
const voiceBtn = document.getElementById('voice-btn');
const voiceNoteBtn = document.getElementById('voice-note-btn');
let isRecording = false;
let recognition = null;
let transcript = '';

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcriptPiece + ' ';
            } else {
                interimTranscript += transcriptPiece;
            }
        }
        
        transcript = finalTranscript || interimTranscript;
        
        if (transcript) {
            voiceNoteBtn.textContent = `Recording: "${transcript.substring(0, 30)}${transcript.length > 30 ? '...' : ''}"`;
        }
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            voiceNoteBtn.textContent = 'No speech detected, try again';
        } else if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else {
            voiceNoteBtn.textContent = 'Error occurred, try again';
        }
        stopRecording();
    };
    
    recognition.onend = function() {
        if (isRecording) {
            recognition.start();
        }
    };
}

function startRecording() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
    }
    
    isRecording = true;
    transcript = '';
    voiceBtn.classList.add('recording');
    voiceNoteBtn.classList.add('recording');
    voiceNoteBtn.textContent = 'Listening... (tap to stop)';
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting recognition:', error);
    }
}

function stopRecording() {
    isRecording = false;
    voiceBtn.classList.remove('recording');
    voiceNoteBtn.classList.remove('recording');
    
    if (recognition) {
        recognition.stop();
    }
    
    if (transcript && transcript.trim()) {
        voiceNoteBtn.classList.add('selected');
        voiceNoteBtn.textContent = `Voice note: "${transcript.substring(0, 40)}${transcript.length > 40 ? '...' : ''}"`;
        eventData.voiceNote = transcript;
    } else {
        voiceNoteBtn.textContent = 'Add a voice note';
    }
}

voiceBtn.addEventListener('click', function() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

// Save event - MODIFIED TO SAVE TO LOCALSTORAGE
const saveEventBtn = document.getElementById('save-event-btn');

saveEventBtn.addEventListener('click', function() {
    if (!eventData.affectedArea) {
        alert('Please select an affected area');
        return;
    }

    if (!eventData.discomfortType) {
        alert('Please select a discomfort type');
        return;
    }

    // Get user-selected date and time
    const selectedDate = eventDateInput.value;
    const selectedTime = eventTimeInput.value;

    if (!selectedDate || !selectedTime) {
        alert('Please select a date and time');
        return;
    }

    // Create timestamp from user-selected date/time
    const eventDateTime = new Date(`${selectedDate}T${selectedTime}`);
    eventData.timestamp = eventDateTime.toISOString();
    eventData.id = 'event_' + Date.now();

    // Save to localStorage
    let events = JSON.parse(localStorage.getItem('healthEvents') || '[]');
    events.push(eventData);
    localStorage.setItem('healthEvents', JSON.stringify(events));
    
    // Still create the text file
    const textContent = `HEALTH EVENT LOG
==========================================
Date & Time: ${eventDateTime.toLocaleString()}

AFFECTED AREA:
${eventData.affectedArea}

DISCOMFORT LEVEL: ${eventData.discomfortLevel}/5
${getDiscomfortEmoji(eventData.discomfortLevel)}

DISCOMFORT TYPE:
${eventData.discomfortTypeLabel || eventData.discomfortType}

VOICE NOTE:
${eventData.voiceNote || 'No voice note recorded'}

==========================================
Raw Data (JSON):
${JSON.stringify(eventData, null, 2)}
`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-event-${selectedDate}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Event saved successfully! File downloaded and added to calendar.');
    window.location.href = 'index.html';
});

function getDiscomfortEmoji(level) {
    const emojis = {
        1: '😡 (Very High Discomfort)',
        2: '😠 (High Discomfort)',
        3: '😕 (Moderate Discomfort)',
        4: '🙂 (Low Discomfort)',
        5: '😊 (Minimal Discomfort)'
    };
    return emojis[level] || '';
}

function getDiscomfortTypeLabel(type) {
    const select = document.getElementById('discomfort-type-select');
    const option = select.querySelector(`option[value="${type}"]`);
    return option ? option.textContent : type;
}