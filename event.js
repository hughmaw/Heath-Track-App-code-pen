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

// Voice note functionality with speech recognition
const voiceBtn = document.getElementById('voice-btn');
const voiceNoteBtn = document.getElementById('voice-note-btn');
let isRecording = false;
let recognition = null;
let transcript = '';

// Check if browser supports speech recognition
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
        
        // Update button with live transcript preview
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
            // Restart if still supposed to be recording
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
        console.log('Started recording...');
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
        console.log('Stopped recording. Transcript:', transcript);
    } else {
        voiceNoteBtn.textContent = 'Add a voice note';
        console.log('No transcript captured');
    }
}

voiceBtn.addEventListener('click', function() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
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
    
    // Add timestamp
    const now = new Date();
    eventData.timestamp = now.toISOString();
    
    // Format the data for the text file
    const textContent = `HEALTH EVENT LOG
==========================================
Date & Time: ${now.toLocaleString()}

AFFECTED AREA:
${eventData.affectedArea}

DISCOMFORT LEVEL: ${eventData.discomfortLevel}/5
${getDiscomfortEmoji(eventData.discomfortLevel)}

DISCOMFORT TYPE:
${eventData.discomfortType}
${getDiscomfortTypeLabel(eventData.discomfortType)}

VOICE NOTE:
${eventData.voiceNote || 'No voice note recorded'}

==========================================
Raw Data (JSON):
${JSON.stringify(eventData, null, 2)}
`;

    // Create a blob and download the file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-event-${now.toISOString().split('T')[0]}-${now.getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Log to console as well
    console.log('Saving event:', eventData);
    console.log('Voice transcript:', eventData.voiceNote);
    
    // Show success message
    const message = eventData.voiceNote ? 
        'Event saved with voice note! File downloaded.' : 
        'Event saved successfully! File downloaded.';
    alert(message);
    
    // Optionally redirect back to index
    // window.location.href = 'index.html';
});

// Helper function to get emoji for discomfort level
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

// Helper function to get label for discomfort type
function getDiscomfortTypeLabel(type) {
    const select = document.getElementById('discomfort-type-select');
    const option = select.querySelector(`option[value="${type}"]`);
    return option ? option.textContent : type;
}