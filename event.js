document.addEventListener('DOMContentLoaded', function() {
    // State management
    const eventState = {
        affectedArea: null,
        discomfortLevel: 3,
        discomfortTypes: [],
        voiceNote: null,
        timestamp: null
    };

    // DOM elements
    const bodyParts = document.querySelectorAll('.body-part');
    const selectAreaBtn = document.getElementById('select-area-btn');
    const emojiOptions = document.querySelectorAll('.emoji-option');
    const discomfortSlider = document.getElementById('discomfort-slider');
    const selectDiscomfortBtn = document.getElementById('select-discomfort-btn');
    const discomfortEmojis = document.querySelectorAll('.discomfort-emoji');
    const selectTypeBtn = document.getElementById('select-type-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceNoteBtn = document.getElementById('voice-note-btn');
    const saveEventBtn = document.getElementById('save-event-btn');

    // Body part selection
    bodyParts.forEach(part => {
        part.addEventListener('click', function() {
            // Remove previous selection
            bodyParts.forEach(p => p.classList.remove('selected'));
            
            // Add selection to clicked part
            this.classList.add('selected');
            eventState.affectedArea = this.getAttribute('data-part');
            
            console.log('Selected area:', eventState.affectedArea);
        });
    });

    // Emoji selection for discomfort level
    emojiOptions.forEach(emoji => {
        emoji.addEventListener('click', function() {
            // Remove previous selection
            emojiOptions.forEach(e => e.classList.remove('selected'));
            
            // Add selection
            this.classList.add('selected');
            const level = parseInt(this.getAttribute('data-level'));
            eventState.discomfortLevel = level;
            discomfortSlider.value = level;
            
            console.log('Discomfort level:', eventState.discomfortLevel);
        });
    });

    // Slider sync with emojis
    discomfortSlider.addEventListener('input', function() {
        const level = parseInt(this.value);
        eventState.discomfortLevel = level;
        
        // Update emoji selection
        emojiOptions.forEach(e => e.classList.remove('selected'));
        const selectedEmoji = document.querySelector(`[data-level="${level}"]`);
        if (selectedEmoji) {
            selectedEmoji.classList.add('selected');
        }
        
        console.log('Discomfort level (slider):', eventState.discomfortLevel);
    });

    // Initialize default emoji selection
    const defaultEmoji = document.querySelector('[data-level="3"]');
    if (defaultEmoji) {
        defaultEmoji.classList.add('selected');
    }

    // Discomfort type selection (multiple selection allowed)
    discomfortEmojis.forEach(emoji => {
        emoji.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // Toggle selection
            this.classList.toggle('selected');
            
            if (this.classList.contains('selected')) {
                if (!eventState.discomfortTypes.includes(type)) {
                    eventState.discomfortTypes.push(type);
                }
            } else {
                eventState.discomfortTypes = eventState.discomfortTypes.filter(t => t !== type);
            }
            
            console.log('Discomfort types:', eventState.discomfortTypes);
        });
    });

    // Voice recording
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];

    voiceBtn.addEventListener('click', async function() {
        if (!isRecording) {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    eventState.voiceNote = audioBlob;
                    audioChunks = [];
                    console.log('Voice note recorded');
                    showNotification('Voice note recorded successfully!');
                    voiceNoteBtn.textContent = 'Voice note added ✓';
                    voiceNoteBtn.style.background = 'linear-gradient(135deg, #44DD88, #66EE99)';
                };
                
                mediaRecorder.start();
                isRecording = true;
                this.classList.add('recording');
                voiceNoteBtn.textContent = 'Recording... (click to stop)';
                
            } catch (error) {
                console.error('Error accessing microphone:', error);
                alert('Could not access microphone. Please check your permissions.');
            }
        } else {
            // Stop recording
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
                isRecording = false;
                this.classList.remove('recording');
            }
        }
    });

    // Save event
    saveEventBtn.addEventListener('click', function() {
        // Validate that at least one field is filled
        if (!eventState.affectedArea && 
            eventState.discomfortTypes.length === 0 && 
            !eventState.voiceNote) {
            alert('Please select at least one option before saving.');
            return;
        }

        // Add timestamp
        eventState.timestamp = new Date().toISOString();

        // Get existing events or initialize empty array
        let events = JSON.parse(localStorage.getItem('healthEvents')) || [];
        
        // Add new event
        events.push({
            ...eventState,
            voiceNote: eventState.voiceNote ? 'recorded' : null // Can't store blob in localStorage
        });
        
        // Save to localStorage
        localStorage.setItem('healthEvents', JSON.stringify(events));
        
        console.log('Event saved:', eventState);
        showNotification('Event saved successfully!');
        
        // Reset form after short delay
        setTimeout(() => {
            resetForm();
        }, 1500);
    });

    // Reset form
    function resetForm() {
        // Reset state
        eventState.affectedArea = null;
        eventState.discomfortLevel = 3;
        eventState.discomfortTypes = [];
        eventState.voiceNote = null;
        
        // Reset UI
        bodyParts.forEach(p => p.classList.remove('selected'));
        emojiOptions.forEach(e => e.classList.remove('selected'));
        discomfortEmojis.forEach(e => e.classList.remove('selected'));
        
        // Reset to default
        const defaultEmoji = document.querySelector('[data-level="3"]');
        if (defaultEmoji) {
            defaultEmoji.classList.add('selected');
        }
        discomfortSlider.value = 3;
        
        voiceNoteBtn.textContent = 'Add a voice note';
        voiceNoteBtn.style.background = 'linear-gradient(135deg, #6B5B95, #8B7BA8)';
        
        console.log('Form reset');
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Debug: Log current state
    window.getEventState = () => {
        console.log('Current event state:', eventState);
        return eventState;
    };
});