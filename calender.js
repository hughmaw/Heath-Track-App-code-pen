// Calendar state
let currentDate = new Date();
let selectedDate = new Date();

// Helper function to format body part names
function formatBodyPart(part) {
    if (!part) return 'Unknown';
    return part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    loadScheduleForDate(selectedDate);
    loadRecentEvents();
    setupModal();
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
                        <button class="notify-button delete-btn delete-appt-btn" data-id="${appt.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                    <p class="notes">${appt.notes || 'No notes'}</p>
                </div>
            `;
        });

        // Show events
        dayEvents.forEach(event => {
            const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const displayType = event.discomfortTypeLabel || event.discomfortType;
            const areaFormatted = formatBodyPart(event.affectedArea);
            scheduleHTML += `
                <div class="appointment event-item">
                    <div class="appointment-header">
                        <div>
                            <span class="badge event-badge">${time}</span>
                            <h3 class="appointment-title">${displayType}</h3>
                        </div>
                        <button class="notify-button delete-btn delete-event-btn" data-id="${event.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
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
        const areaFormatted = formatBodyPart(event.affectedArea);

        eventsHTML += `
            <div class="appointment event-item">
                <div class="appointment-header">
                    <div>
                        <span class="badge event-badge">${dateStr} ${timeStr}</span>
                        <h3 class="appointment-title">${displayType}</h3>
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
        clearForm();
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
        clearForm();
        renderCalendar();
        loadScheduleForDate(selectedDate);
        alert('Appointment added successfully!');
    });
}

function clearForm() {
    document.getElementById('appt-date').value = '';
    document.getElementById('appt-time').value = '';
    document.getElementById('appt-title').value = '';
    document.getElementById('appt-notes').value = '';
}

function deleteAppointment(id) {
    if (confirm('Delete this appointment?')) {
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments = appointments.filter(appt => appt.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        renderCalendar();
        loadScheduleForDate(selectedDate);
    }
}

function deleteEvent(id) {
    if (confirm('Delete this health event?')) {
        let events = JSON.parse(localStorage.getItem('healthEvents') || '[]');
        events = events.filter(event => event.id !== id);
        localStorage.setItem('healthEvents', JSON.stringify(events));
        renderCalendar();
        loadScheduleForDate(selectedDate);
        loadRecentEvents();
    }
}
