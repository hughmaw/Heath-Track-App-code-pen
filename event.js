// Event data storage
let eventData = {
    affectedAreas: [], // Changed to array for multiple areas
    discomfortLevel: 3,
    discomfortType: '',
    discomfortTypeLabel: '',
    voiceNote: null
};

// Store placed dots
let placedDots = {
    front: [],
    back: []
};

let dotIdCounter = 0;

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

// Body diagram tab switching
const bodyTabs = document.querySelectorAll('.body-tab');
const bodyFront = document.getElementById('body-front');
const bodyBack = document.getElementById('body-back');

bodyTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const view = this.getAttribute('data-view');

        // Update tab styles
        bodyTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Show/hide body views
        if (view === 'front') {
            bodyFront.classList.remove('hidden');
            bodyBack.classList.add('hidden');
        } else {
            bodyFront.classList.add('hidden');
            bodyBack.classList.remove('hidden');
        }
    });
});

// Click to place dots on body diagram
const bodyDiagrams = document.querySelectorAll('.body-diagram');
const selectAreaBtn = document.getElementById('select-area-btn');
const areasCountDisplay = document.getElementById('areas-count');
const clearDotsBtn = document.getElementById('clear-dots-btn');

bodyDiagrams.forEach(diagram => {
    diagram.addEventListener('click', function(e) {
        // Don't place dot if clicking on existing dot
        if (e.target.classList.contains('pain-dot')) return;

        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage position for responsive positioning
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        const view = this.getAttribute('data-view');
        const dotsContainer = document.getElementById(`dots-${view}`);

        // Create dot element
        const dot = document.createElement('div');
        dot.className = 'pain-dot';
        dot.style.left = `${xPercent}%`;
        dot.style.top = `${yPercent}%`;
        dot.setAttribute('data-dot-id', dotIdCounter);

        // Store dot data
        const dotData = {
            id: dotIdCounter,
            x: xPercent,
            y: yPercent,
            view: view,
            bodyRegion: getBodyRegion(xPercent, yPercent, view)
        };
        placedDots[view].push(dotData);
        dotIdCounter++;

        // Click on dot to remove it
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            const dotId = parseInt(this.getAttribute('data-dot-id'));
            removeDot(dotId, view);
            this.remove();
        });

        dotsContainer.appendChild(dot);
        updateAreasDisplay();
    });
});

// Get body region based on position
function getBodyRegion(x, y, view) {
    // Map x,y percentages to body regions
    const prefix = view === 'back' ? 'back-' : '';

    // Head region (top center)
    if (y < 18 && x > 35 && x < 65) {
        return prefix + 'head';
    }
    // Neck region
    if (y >= 18 && y < 24 && x > 40 && x < 60) {
        return prefix + 'neck';
    }
    // Left arm
    if (x < 30) {
        if (y < 35) return 'left-shoulder';
        if (y < 45) return 'left-upper-arm';
        if (y < 55) return 'left-forearm';
        return 'left-hand';
    }
    // Right arm
    if (x > 70) {
        if (y < 35) return 'right-shoulder';
        if (y < 45) return 'right-upper-arm';
        if (y < 55) return 'right-forearm';
        return 'right-hand';
    }
    // Torso
    if (y >= 24 && y < 40 && x >= 30 && x <= 70) {
        return prefix + 'chest';
    }
    if (y >= 40 && y < 58 && x >= 30 && x <= 70) {
        return prefix + 'abdomen';
    }
    // Left leg
    if (x >= 30 && x < 50) {
        if (y >= 58 && y < 75) return 'left-thigh';
        if (y >= 75 && y < 90) return 'left-calf';
        return 'left-foot';
    }
    // Right leg
    if (x >= 50 && x <= 70) {
        if (y >= 58 && y < 75) return 'right-thigh';
        if (y >= 75 && y < 90) return 'right-calf';
        return 'right-foot';
    }

    return prefix + 'general';
}

// Remove dot by ID
function removeDot(dotId, view) {
    placedDots[view] = placedDots[view].filter(d => d.id !== dotId);
    updateAreasDisplay();
}

// Clear all dots
clearDotsBtn.addEventListener('click', function() {
    placedDots.front = [];
    placedDots.back = [];
    document.getElementById('dots-front').innerHTML = '';
    document.getElementById('dots-back').innerHTML = '';
    updateAreasDisplay();
});

// Update the areas count display
function updateAreasDisplay() {
    const totalDots = placedDots.front.length + placedDots.back.length;

    if (totalDots === 0) {
        areasCountDisplay.textContent = 'None';
        selectAreaBtn.classList.remove('selected');
        selectAreaBtn.textContent = 'Confirm affected areas';
    } else {
        // Get unique body regions
        const allDots = [...placedDots.front, ...placedDots.back];
        const uniqueRegions = [...new Set(allDots.map(d => d.bodyRegion))];
        areasCountDisplay.textContent = `${totalDots} marker${totalDots > 1 ? 's' : ''} (${uniqueRegions.length} area${uniqueRegions.length > 1 ? 's' : ''})`;

        // Update eventData
        eventData.affectedAreas = allDots.map(d => ({
            region: d.bodyRegion,
            view: d.view,
            x: d.x,
            y: d.y
        }));

        selectAreaBtn.classList.add('selected');
        selectAreaBtn.textContent = `${totalDots} area${totalDots > 1 ? 's' : ''} marked ✓`;
    }
}

// Confirm areas button
selectAreaBtn.addEventListener('click', function() {
    const totalDots = placedDots.front.length + placedDots.back.length;
    if (totalDots === 0) {
        alert('Please tap on the body diagram to mark affected areas');
    }
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
    if (!eventData.affectedAreas || eventData.affectedAreas.length === 0) {
        alert('Please mark at least one affected area on the body diagram');
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

    // Create a summary of affected areas for backward compatibility
    const uniqueRegions = [...new Set(eventData.affectedAreas.map(a => a.region))];
    eventData.affectedArea = uniqueRegions.join(', '); // For backward compatibility

    // Save to localStorage
    let events = JSON.parse(localStorage.getItem('healthEvents') || '[]');
    events.push(eventData);
    localStorage.setItem('healthEvents', JSON.stringify(events));

    // Format affected areas for text file
    const areasText = eventData.affectedAreas.map(a =>
        `  - ${formatBodyPartName(a.region)} (${a.view} view)`
    ).join('\n');

    // Still create the text file
    const textContent = `HEALTH EVENT LOG
==========================================
Date & Time: ${eventDateTime.toLocaleString()}

AFFECTED AREAS (${eventData.affectedAreas.length} markers):
${areasText}

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

// Format body part name for display
function formatBodyPartName(part) {
    if (!part) return 'Unknown';
    return part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

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