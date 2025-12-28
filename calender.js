// Calendar state
let currentDate = new Date();
let selectedDate = new Date();
let deletedItems = []; // Stack for undo functionality
let undoTimeout = null;
let editingEventId = null;

// Helper function to format body part names
function formatBodyPart(part) {
    if (!part) return 'Unknown';
    return part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Format multiple affected areas
function formatAffectedAreas(event) {
    // Handle new multi-area format
    if (event.affectedAreas && Array.isArray(event.affectedAreas) && event.affectedAreas.length > 0) {
        const uniqueRegions = [...new Set(event.affectedAreas.map(a => a.region))];
        if (uniqueRegions.length === 1) {
            return formatBodyPart(uniqueRegions[0]);
        } else if (uniqueRegions.length <= 3) {
            return uniqueRegions.map(r => formatBodyPart(r)).join(', ');
        } else {
            return `${uniqueRegions.slice(0, 2).map(r => formatBodyPart(r)).join(', ')} +${uniqueRegions.length - 2} more`;
        }
    }
    // Fall back to old single-area format
    return formatBodyPart(event.affectedArea);
}

// Helper function to get discomfort level with emoji
function getDiscomfortLevelEmoji(level) {
    const emojis = {
        1: '😡 Very High (1/5)',
        2: '😠 High (2/5)',
        3: '😕 Moderate (3/5)',
        4: '🙂 Low (4/5)',
        5: '😊 Minimal (5/5)'
    };
    return emojis[level] || `${level}/5`;
}

// Get level label
function getLevelLabel(level) {
    const labels = {
        1: '1 - Very High',
        2: '2 - High',
        3: '3 - Moderate',
        4: '4 - Low',
        5: '5 - Minimal'
    };
    return labels[level] || `${level}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    loadScheduleForDate(selectedDate);
    loadRecentEvents();
    setupModal();
    setupEditEventModal();
    setupUndoNotification();
});

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayIndex = firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

    let calendarHTML = `
        <div class="calendar-container">
            <div class="calendar-nav">
                <button id="prev-month" class="cal-nav-btn">←</button>
                <h3 class="calendar-month">${monthNames[month]} ${year}</h3>
                <button id="next-month" class="cal-nav-btn">→</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-header-day">Sun</div>
                <div class="calendar-header-day">Mon</div>
                <div class="calendar-header-day">Tue</div>
                <div class="calendar-header-day">Wed</div>
                <div class="calendar-header-day">Thu</div>
                <div class="calendar-header-day">Fri</div>
                <div class="calendar-header-day">Sat</div>
    `;

    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
        calendarHTML += `<div class="calendar-day-inactive">${prevLastDayDate - i + 1}</div>`;
    }

    // Current month days
    for (let day = 1; day <= lastDayDate; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === new Date().toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const hasEvent = checkIfDateHasEvent(date);

        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' calendar-day-today';
        if (isSelected) dayClass += ' calendar-day-selected';

        calendarHTML += `<div class="${dayClass}" data-date="${date.toISOString()}">
            ${day}
            ${hasEvent ? '<div class="calendar-event-dot"></div>' : ''}
        </div>`;
    }

    calendarHTML += '</div></div>';

    document.getElementById('calendar-container').innerHTML = calendarHTML;

    // Add event listeners
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.querySelectorAll('.calendar-day').forEach(day => {
        day.addEventListener('click', function() {
            selectedDate = new Date(this.getAttribute('data-date'));
            renderCalendar();
            loadScheduleForDate(selectedDate);
        });
    });
}

// Check if date has events or appointments
function checkIfDateHasEvent(date) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const events = JSON.parse(localStorage.getItem('healthEvents') || '[]');

    const dateStr = date.toDateString();

    const hasAppointment = appointments.some(appt => {
        return new Date(appt.date).toDateString() === dateStr;
    });

    const hasEvent = events.some(event => {
        return new Date(event.timestamp).toDateString() === dateStr;
    });

    return hasAppointment || hasEvent;
}

// Load schedule for selected date
function loadScheduleForDate(date) {
    const dateStr = date.toDateString();
    const displayDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('selected-date-display').textContent = displayDate;

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const events = JSON.parse(localStorage.getItem('healthEvents') || '[]');

    const dayAppointments = appointments.filter(appt => {
        return new Date(appt.date).toDateString() === dateStr;
    }).sort((a, b) => a.time.localeCompare(b.time));

    const dayEvents = events.filter(event => {
        return new Date(event.timestamp).toDateString() === dateStr;
    });

    let scheduleHTML = '';

    if (dayAppointments.length === 0 && dayEvents.length === 0) {
        scheduleHTML = '<p class="empty-state">No appointments or events for this day</p>';
    } else {
        // Show appointments
        dayAppointments.forEach(appt => {
            scheduleHTML += `
                <div class="appointment">
                    <div class="appointment-header">
                        <div>
                            <span class="badge">${formatTime(appt.time)}</span>
                            <h3 class="appointment-title">${appt.title}</h3>
                        </div>
                        <div class="action-buttons">
                            <button class="notify-button delete-btn delete-appt-btn" data-id="${appt.id}" title="Delete">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                    <p class="notes">${appt.notes || 'No notes'}</p>
                </div>
            `;
        });

        // Show events with edit button
        dayEvents.forEach(event => {
            const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const displayType = event.discomfortTypeLabel || event.discomfortType;
            const areaFormatted = formatAffectedAreas(event);
            scheduleHTML += `
                <div class="appointment event-item">
                    <div class="appointment-header">
                        <div>
                            <span class="badge event-badge">${time}</span>
                            <h3 class="appointment-title">${displayType}</h3>
                        </div>
                        <div class="action-buttons">
                            <button class="notify-button edit-btn edit-event-btn" data-id="${event.id}" title="Edit">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button class="notify-button delete-btn delete-event-btn" data-id="${event.id}" title="Delete">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                    <p class="notes">
                        <span class="notes-label">Area:</span> ${areaFormatted}<br>
                        <span class="notes-label">Level:</span> ${getDiscomfortLevelEmoji(event.discomfortLevel)}<br>
                        ${event.voiceNote ? `<span class="notes-label">Note:</span> ${event.voiceNote}` : ''}
                    </p>
                </div>
            `;
        });
    }

    document.getElementById('schedule-list').innerHTML = scheduleHTML;
    lucide.createIcons();

    // Add delete event listeners
    document.querySelectorAll('.delete-appt-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteAppointment(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.delete-event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteEvent(this.getAttribute('data-id'));
        });
    });

    // Add edit event listeners
    document.querySelectorAll('.edit-event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openEditEventModal(this.getAttribute('data-id'));
        });
    });
}

// Load recent events
function loadRecentEvents() {
    const events = JSON.parse(localStorage.getItem('healthEvents') || '[]');

    if (events.length === 0) {
        document.getElementById('events-list').innerHTML = '<p class="empty-state">No events logged yet</p>';
        return;
    }

    const recentEvents = events.slice(-5).reverse();
    let eventsHTML = '';

    recentEvents.forEach(event => {
        const date = new Date(event.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const displayType = event.discomfortTypeLabel || event.discomfortType;
        const areaFormatted = formatAffectedAreas(event);

        eventsHTML += `
            <div class="appointment event-item">
                <div class="appointment-header">
                    <div>
                        <span class="badge event-badge">${dateStr} ${timeStr}</span>
                        <h3 class="appointment-title">${displayType}</h3>
                    </div>
                    <div class="action-buttons">
                        <button class="notify-button edit-btn edit-event-btn" data-id="${event.id}" title="Edit">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="notify-button delete-btn delete-event-btn" data-id="${event.id}" title="Delete">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <p class="notes">
                    <span class="notes-label">Area:</span> ${areaFormatted} |
                    <span class="notes-label">Level:</span> ${getDiscomfortLevelEmoji(event.discomfortLevel)}
                    ${event.voiceNote ? `<br><span class="notes-label">Note:</span> ${event.voiceNote.substring(0, 100)}${event.voiceNote.length > 100 ? '...' : ''}` : ''}
                </p>
            </div>
        `;
    });

    document.getElementById('events-list').innerHTML = eventsHTML;
    lucide.createIcons();

    // Add event listeners for recent events
    document.querySelectorAll('#events-list .edit-event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openEditEventModal(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('#events-list .delete-event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteEvent(this.getAttribute('data-id'));
        });
    });
}

// Format time for display
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Setup appointment modal
function setupModal() {
    const modal = document.getElementById('appointment-modal');
    const addBtn = document.getElementById('add-appointment-btn');
    const saveBtn = document.getElementById('save-appointment-btn');
    const cancelBtn = document.getElementById('cancel-appointment-btn');

    // Set default date to selected date
    addBtn.addEventListener('click', () => {
        document.getElementById('appt-date').value = selectedDate.toISOString().split('T')[0];
        modal.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        clearAppointmentForm();
    });

    saveBtn.addEventListener('click', () => {
        const date = document.getElementById('appt-date').value;
        const time = document.getElementById('appt-time').value;
        const title = document.getElementById('appt-title').value;
        const notes = document.getElementById('appt-notes').value;

        if (!date || !time || !title) {
            alert('Please fill in date, time, and title');
            return;
        }

        const appointment = {
            id: 'appt_' + Date.now(),
            date: date,
            time: time,
            title: title,
            notes: notes
        };

        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        modal.style.display = 'none';
        clearAppointmentForm();
        renderCalendar();
        loadScheduleForDate(selectedDate);
        alert('Appointment added successfully!');
    });
}

function clearAppointmentForm() {
    document.getElementById('appt-date').value = '';
    document.getElementById('appt-time').value = '';
    document.getElementById('appt-title').value = '';
    document.getElementById('appt-notes').value = '';
}

// Setup edit event modal
function setupEditEventModal() {
    const modal = document.getElementById('edit-event-modal');
    const saveBtn = document.getElementById('save-edit-event-btn');
    const cancelBtn = document.getElementById('cancel-edit-event-btn');
    const levelSlider = document.getElementById('edit-event-level');
    const levelDisplay = document.getElementById('edit-level-display');

    // Update level display when slider changes
    levelSlider.addEventListener('input', function() {
        levelDisplay.textContent = getLevelLabel(parseInt(this.value));
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        editingEventId = null;
    });

    saveBtn.addEventListener('click', () => {
        if (!editingEventId) return;

        let events = JSON.parse(localStorage.getItem('healthEvents') || '[]');
        const index = events.findIndex(e => e.id === editingEventId);

        if (index !== -1) {
            const dateValue = document.getElementById('edit-event-date').value;
            const timeValue = document.getElementById('edit-event-time').value;
            const newTimestamp = new Date(`${dateValue}T${timeValue}`).toISOString();

            events[index] = {
                ...events[index],
                timestamp: newTimestamp,
                affectedArea: document.getElementById('edit-event-area').value,
                discomfortLevel: parseInt(document.getElementById('edit-event-level').value),
                voiceNote: document.getElementById('edit-event-notes').value
            };

            localStorage.setItem('healthEvents', JSON.stringify(events));
            modal.style.display = 'none';
            editingEventId = null;
            renderCalendar();
            loadScheduleForDate(selectedDate);
            loadRecentEvents();
        }
    });
}

// Open edit event modal
function openEditEventModal(id) {
    const events = JSON.parse(localStorage.getItem('healthEvents') || '[]');
    const event = events.find(e => e.id === id);

    if (!event) return;

    editingEventId = id;
    const modal = document.getElementById('edit-event-modal');
    const eventDate = new Date(event.timestamp);

    // Populate form
    document.getElementById('edit-event-date').value = eventDate.toISOString().split('T')[0];
    document.getElementById('edit-event-time').value = eventDate.toTimeString().slice(0, 5);
    document.getElementById('edit-event-area').value = event.affectedArea;
    document.getElementById('edit-event-level').value = event.discomfortLevel;
    document.getElementById('edit-level-display').textContent = getLevelLabel(event.discomfortLevel);
    document.getElementById('edit-event-notes').value = event.voiceNote || '';

    modal.style.display = 'flex';
}

// Setup undo notification
function setupUndoNotification() {
    const undoBtn = document.getElementById('undo-btn');
    const dismissBtn = document.getElementById('dismiss-undo');

    undoBtn.addEventListener('click', performUndo);
    dismissBtn.addEventListener('click', hideUndoNotification);
}

// Show undo notification
function showUndoNotification(message) {
    const notification = document.getElementById('undo-notification');
    document.getElementById('undo-message').textContent = message;
    notification.classList.add('show');

    // Clear existing timeout
    if (undoTimeout) {
        clearTimeout(undoTimeout);
    }

    // Auto-hide after 5 seconds
    undoTimeout = setTimeout(() => {
        hideUndoNotification();
    }, 5000);
}

// Hide undo notification
function hideUndoNotification() {
    const notification = document.getElementById('undo-notification');
    notification.classList.remove('show');

    if (undoTimeout) {
        clearTimeout(undoTimeout);
        undoTimeout = null;
    }
}

// Perform undo
function performUndo() {
    if (deletedItems.length === 0) return;

    const lastDeleted = deletedItems.pop();

    if (lastDeleted.type === 'event') {
        let events = JSON.parse(localStorage.getItem('healthEvents') || '[]');
        events.push(lastDeleted.data);
        localStorage.setItem('healthEvents', JSON.stringify(events));
    } else if (lastDeleted.type === 'appointment') {
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(lastDeleted.data);
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }

    hideUndoNotification();
    renderCalendar();
    loadScheduleForDate(selectedDate);
    loadRecentEvents();
}

// Delete appointment with undo
function deleteAppointment(id) {
    let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const appointment = appointments.find(appt => appt.id === id);

    if (appointment) {
        // Store for undo
        deletedItems.push({ type: 'appointment', data: appointment });

        // Remove from storage
        appointments = appointments.filter(appt => appt.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Show undo notification
        showUndoNotification(`Appointment "${appointment.title}" deleted`);

        renderCalendar();
        loadScheduleForDate(selectedDate);
    }
}

// Delete event with undo
function deleteEvent(id) {
    let events = JSON.parse(localStorage.getItem('healthEvents') || '[]');
    const event = events.find(e => e.id === id);

    if (event) {
        // Store for undo
        deletedItems.push({ type: 'event', data: event });

        // Remove from storage
        events = events.filter(e => e.id !== id);
        localStorage.setItem('healthEvents', JSON.stringify(events));

        // Show undo notification
        const displayType = event.discomfortTypeLabel || event.discomfortType || 'Event';
        showUndoNotification(`${displayType} event deleted`);

        renderCalendar();
        loadScheduleForDate(selectedDate);
        loadRecentEvents();
    }
}
