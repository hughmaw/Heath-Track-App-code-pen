document.addEventListener('DOMContentLoaded', function() {
    // Custom emoji SVG template
    const customEmojis = {
        headache: {
            name: 'Headache',
            svg: `<svg class="headache-emoji" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="url(#faceGradient)"/>
                <defs>
                    <radialGradient id="faceGradient">
                        <stop offset="0%" style="stop-color:#FFE5B4;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#FFCC80;stop-opacity:1" />
                    </radialGradient>
                </defs>
                <ellipse cx="35" cy="25" rx="15" ry="12" fill="#FF6B6B" opacity="0.6"/>
                <ellipse cx="20" cy="30" rx="12" ry="18" fill="#FFCC80" transform="rotate(-30 20 30)"/>
                <path d="M 30 45 Q 35 42 40 45" stroke="#8B4513" stroke-width="2" fill="none"/>
                <path d="M 60 45 Q 65 42 70 45" stroke="#8B4513" stroke-width="2" fill="none"/>
                <path d="M 40 65 L 45 63 L 50 64 L 55 63 L 60 65" stroke="#8B4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <line x1="42" y1="68" x2="48" y2="67" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="52" y1="67" x2="58" y2="68" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>`
        }
    };

    // Emoji database with categories
    const emojiDatabase = {
        pain: [
            { emoji: '\u{1F623}', name: 'Persevering', type: 'pain' },
            { emoji: '\u{1F616}', name: 'Confounded', type: 'pain' },
            { emoji: '\u{1F62B}', name: 'Tired', type: 'pain' },
            { emoji: '\u{1F915}', name: 'Injured', type: 'pain' },
            { emoji: '\u{1F629}', name: 'Weary', type: 'pain' },
            { emoji: '\u{1F630}', name: 'Anxious with sweat', type: 'pain' },
            { emoji: '\u{1F97A}', name: 'Pleading', type: 'pain' },
            { emoji: '\u{1F622}', name: 'Crying', type: 'pain' }
        ],
        digestive: [
            { emoji: '\u{1F922}', name: 'Nauseated', type: 'digestive' },
            { emoji: '\u{1F92E}', name: 'Vomiting', type: 'digestive' },
            { emoji: '\u{1F927}', name: 'Sneezing', type: 'digestive' },
            { emoji: '\u{1F637}', name: 'Medical mask', type: 'digestive' },
            { emoji: '\u{1F912}', name: 'Thermometer face', type: 'digestive' }
        ],
        mental: [
            { emoji: '\u{1F635}', name: 'Dizzy', type: 'mental' },
            { emoji: '\u{1F635}\u{200D}\u{1F4AB}', name: 'Dizzy spiral', type: 'mental' },
            { emoji: '\u{1F61F}', name: 'Worried', type: 'mental' },
            { emoji: '\u{1F61E}', name: 'Disappointed', type: 'mental' },
            { emoji: '\u{1F614}', name: 'Pensive', type: 'mental' },
            { emoji: '\u{1F613}', name: 'Downcast with sweat', type: 'mental' },
            { emoji: '\u{1F625}', name: 'Sad but relieved', type: 'mental' },
            { emoji: '\u{1F630}', name: 'Anxious', type: 'mental' },
            { emoji: '\u{1F628}', name: 'Fearful', type: 'mental' },
            { emoji: '\u{1F627}', name: 'Anguished', type: 'mental' },
            { emoji: '\u{1F971}', name: 'Yawning', type: 'mental' },
            { emoji: '\u{1F634}', name: 'Sleeping', type: 'mental' }
        ],
        respiratory: [
            { emoji: '\u{1F62E}\u{200D}\u{1F4A8}', name: 'Exhaling', type: 'respiratory' },
            { emoji: '\u{1F975}', name: 'Hot', type: 'respiratory' },
            { emoji: '\u{1F976}', name: 'Cold', type: 'respiratory' },
            { emoji: '\u{1F624}', name: 'Huffing', type: 'respiratory' },
            { emoji: '\u{1F62A}', name: 'Sleepy', type: 'respiratory' }
        ]
    };

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
    const selectTypeBtn = document.getElementById('select-type-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceNoteBtn = document.getElementById('voice-note-btn');
    const saveEventBtn = document.getElementById('save-event-btn');
    
    // New emoji picker elements
    const addEmojiBtn = document.getElementById('add-emoji-btn');
    const emojiModal = document.getElementById('emoji-modal');
    const closeModal = document.getElementById('close-modal');
    const emojiGrid = document.getElementById('emoji-grid');
    const selectedDiscomforts = document.getElementById('selected-discomforts');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const customEmojiItems = document.querySelectorAll('.custom-emoji-item');

    // Current category
    let currentCategory = 'all';

    // Handle custom emoji selection
    customEmojiItems.forEach(item => {
        item.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const customEmoji = {
                emoji: type,
                name: customEmojis[type].name,
                type: 'custom',
                isCustom: true,
                svg: customEmojis[type].svg
            };
            
            // Toggle selection
            this.classList.toggle('selected');
            
            const index = eventState.discomfortTypes.findIndex(d => d.emoji === type);
            if (index > -1) {
                eventState.discomfortTypes.splice(index, 1);
            } else {
                eventState.discomfortTypes.push(customEmoji);
            }
            
            updateSelectedDisplay();
            console.log('Custom emoji toggled:', customEmoji);
        });
    });

    // Initialize emoji grid
    function renderEmojiGrid(category = 'all') {
        emojiGrid.innerHTML = '';
        
        let emojisToShow = [];
        if (category === 'all') {
            Object.values(emojiDatabase).forEach(cat => {
                emojisToShow = emojisToShow.concat(cat);
            });
        } else {
            emojisToShow = emojiDatabase[category] || [];
        }

        emojisToShow.forEach(item => {
            const emojiDiv = document.createElement('div');
            emojiDiv.className = 'emoji-grid-item';
            emojiDiv.textContent = item.emoji;
            emojiDiv.title = item.name;
            emojiDiv.dataset.emoji = item.emoji;
            emojiDiv.dataset.name = item.name;
            
            // Check if already selected
            if (eventState.discomfortTypes.some(d => d.emoji === item.emoji)) {
                emojiDiv.classList.add('selected');
            }
            
            emojiDiv.addEventListener('click', () => toggleEmoji(item));
            emojiGrid.appendChild(emojiDiv);
        });
    }

    // Toggle emoji selection
    function toggleEmoji(item) {
        const index = eventState.discomfortTypes.findIndex(d => d.emoji === item.emoji);
        
        if (index > -1) {
            eventState.discomfortTypes.splice(index, 1);
        } else {
            eventState.discomfortTypes.push(item);
        }
        
        updateSelectedDisplay();
        renderEmojiGrid(currentCategory);
        console.log('Discomfort types:', eventState.discomfortTypes);
    }

    // Update selected emojis display
    function updateSelectedDisplay() {
        selectedDiscomforts.innerHTML = '';
        
        if (eventState.discomfortTypes.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder-text';
            placeholder.textContent = 'No discomfort types selected';
            selectedDiscomforts.appendChild(placeholder);
            return;
        }

        eventState.discomfortTypes.forEach(item => {
            const emojiItem = document.createElement('div');
            emojiItem.className = item.isCustom ? 'selected-emoji-item custom' : 'selected-emoji-item';
            emojiItem.title = item.name;
            
            if (item.isCustom) {
                emojiItem.innerHTML = `
                    ${item.svg}
                    <span class="remove-emoji">×</span>
                `;
            } else {
                emojiItem.innerHTML = `
                    ${item.emoji}
                    <span class="remove-emoji">×</span>
                `;
            }
            
            emojiItem.querySelector('.remove-emoji').addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.isCustom) {
                    // Remove custom emoji selection styling
                    const customItem = document.querySelector(`[data-type="${item.emoji}"]`);
                    if (customItem) customItem.classList.remove('selected');
                }
                toggleEmoji(item);
            });
            
            selectedDiscomforts.appendChild(emojiItem);
        });
    }

    // Category button handlers
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderEmojiGrid(currentCategory);
        });
    });

    // Show/hide emoji modal
    addEmojiBtn.addEventListener('click', () => {
        emojiModal.style.display = 'flex';
        renderEmojiGrid(currentCategory);
    });

    closeModal.addEventListener('click', () => {
        emojiModal.style.display = 'none';
    });

    emojiModal.addEventListener('click', (e) => {
        if (e.target === emojiModal) {
            emojiModal.style.display = 'none';
        }
    });

    // Body part selection
    bodyParts.forEach(part => {
        part.addEventListener('click', function() {
            bodyParts.forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            eventState.affectedArea = this.getAttribute('data-part');
            console.log('Selected area:', eventState.affectedArea);
        });
    });

    // Emoji selection for discomfort level
    emojiOptions.forEach(emoji => {
        emoji.addEventListener('click', function() {
            emojiOptions.forEach(e => e.classList.remove('selected'));
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

    // Voice recording
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];

    voiceBtn.addEventListener('click', async function() {
        if (!isRecording) {
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
        if (!eventState.affectedArea && 
            eventState.discomfortTypes.length === 0 && 
            !eventState.voiceNote) {
            alert('Please select at least one option before saving.');
            return;
        }

        eventState.timestamp = new Date().toISOString();
        let events = JSON.parse(localStorage.getItem('healthEvents')) || [];
        
        events.push({
            ...eventState,
            voiceNote: eventState.voiceNote ? 'recorded' : null
        });
        
        localStorage.setItem('healthEvents', JSON.stringify(events));
        console.log('Event saved:', eventState);
        showNotification('Event saved successfully!');
        
        setTimeout(() => {
            resetForm();
        }, 1500);
    });

    // Reset form
    function resetForm() {
        eventState.affectedArea = null;
        eventState.discomfortLevel = 3;
        eventState.discomfortTypes = [];
        eventState.voiceNote = null;
        
        bodyParts.forEach(p => p.classList.remove('selected'));
        emojiOptions.forEach(e => e.classList.remove('selected'));
        customEmojiItems.forEach(item => item.classList.remove('selected'));
        
        const defaultEmoji = document.querySelector('[data-level="3"]');
        if (defaultEmoji) {
            defaultEmoji.classList.add('selected');
        }
        discomfortSlider.value = 3;
        
        updateSelectedDisplay();
        
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

    // Initialize display
    updateSelectedDisplay();

    // Debug
    window.getEventState = () => {
        console.log('Current event state:', eventState);
        return eventState;
    };
});