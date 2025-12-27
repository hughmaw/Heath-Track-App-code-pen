// Summary page functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const timeBtns = document.querySelectorAll('.time-btn');
    const customRange = document.getElementById('custom-range');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-btn');
    const selectionCard = document.getElementById('selection-card');
    const summaryCard = document.getElementById('summary-card');
    const noDataCard = document.getElementById('no-data-card');
    const downloadBtn = document.getElementById('download-btn');
    const newSummaryBtn = document.getElementById('new-summary-btn');

    let selectedDays = 7;
    let isCustomRange = false;

    // Initialize date inputs with defaults
    const today = new Date();
    endDateInput.value = today.toISOString().split('T')[0];
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    startDateInput.value = weekAgo.toISOString().split('T')[0];

    // Time frame button handlers
    timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const days = this.getAttribute('data-days');
            if (days === 'custom') {
                isCustomRange = true;
                customRange.style.display = 'block';
            } else {
                isCustomRange = false;
                selectedDays = parseInt(days);
                customRange.style.display = 'none';
            }
        });
    });

    // Generate summary
    generateBtn.addEventListener('click', function() {
        let startDate, endDate;

        if (isCustomRange) {
            startDate = new Date(startDateInput.value);
            endDate = new Date(endDateInput.value);
            endDate.setHours(23, 59, 59, 999);
        } else {
            endDate = new Date();
            startDate = new Date(endDate.getTime() - selectedDays * 24 * 60 * 60 * 1000);
        }

        const events = getEventsInRange(startDate, endDate);

        if (events.length === 0) {
            selectionCard.style.display = 'none';
            summaryCard.style.display = 'none';
            noDataCard.style.display = 'block';
            lucide.createIcons();
            return;
        }

        generateSummaryReport(events, startDate, endDate);
        selectionCard.style.display = 'none';
        noDataCard.style.display = 'none';
        summaryCard.style.display = 'block';
        lucide.createIcons();
    });

    // New summary button
    newSummaryBtn.addEventListener('click', function() {
        summaryCard.style.display = 'none';
        noDataCard.style.display = 'none';
        selectionCard.style.display = 'block';
        lucide.createIcons();
    });

    // Download report
    downloadBtn.addEventListener('click', function() {
        downloadReport();
    });
});

// Get events within date range
function getEventsInRange(startDate, endDate) {
    const events = JSON.parse(localStorage.getItem('healthEvents') || '[]');
    return events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= startDate && eventDate <= endDate;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Get events from previous period for comparison
function getPreviousPeriodEvents(startDate, endDate) {
    const duration = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - duration);
    return getEventsInRange(prevStartDate, prevEndDate);
}

// Category mapping
const categoryMap = {
    'sharp-pain': 'Pain',
    'dull-pain': 'Pain',
    'throbbing-pain': 'Pain',
    'burning-pain': 'Pain',
    'stabbing-pain': 'Pain',
    'radiating-pain': 'Pain',
    'muscle-soreness': 'Muscle & Fatigue',
    'muscle-fatigue': 'Muscle & Fatigue',
    'stiffness': 'Muscle & Fatigue',
    'cramping': 'Muscle & Fatigue',
    'weakness': 'Muscle & Fatigue',
    'tension': 'Muscle & Fatigue',
    'headache': 'Head & Neurological',
    'migraine': 'Head & Neurological',
    'dizziness': 'Head & Neurological',
    'tingling': 'Head & Neurological',
    'pressure-head': 'Head & Neurological',
    'nausea': 'Stomach & Digestive',
    'stomach-ache': 'Stomach & Digestive',
    'bloating': 'Stomach & Digestive',
    'indigestion': 'Stomach & Digestive',
    'cramps-stomach': 'Stomach & Digestive',
    'acid-reflux': 'Stomach & Digestive',
    'too-hot': 'Temperature',
    'too-cold': 'Temperature',
    'fever': 'Temperature',
    'sweating': 'Temperature',
    'itching': 'Skin & Irritation',
    'rash': 'Skin & Irritation',
    'irritation': 'Skin & Irritation',
    'swelling': 'Skin & Irritation',
    'dryness': 'Skin & Irritation',
    'bruising': 'Injury & Trauma',
    'cut-wound': 'Injury & Trauma',
    'sprain': 'Injury & Trauma',
    'impact-injury': 'Injury & Trauma',
    'shortness-breath': 'Respiratory',
    'chest-tightness': 'Respiratory',
    'coughing': 'Respiratory',
    'congestion': 'Respiratory',
    'fatigue-general': 'Other',
    'insomnia': 'Other',
    'anxiety': 'Other',
    'other': 'Other'
};

const categoryEmojis = {
    'Pain': '🔥',
    'Muscle & Fatigue': '💪',
    'Head & Neurological': '🤕',
    'Stomach & Digestive': '🤢',
    'Temperature': '🌡️',
    'Skin & Irritation': '🦟',
    'Injury & Trauma': '🩸',
    'Respiratory': '😮‍💨',
    'Other': '📋'
};

// Format body part name
function formatBodyPart(part) {
    if (!part) return 'Unknown';
    return part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Get severity label
function getSeverityLabel(level) {
    const labels = {
        1: 'Very High',
        2: 'High',
        3: 'Moderate',
        4: 'Low',
        5: 'Minimal'
    };
    return labels[level] || 'Unknown';
}

// Calculate statistics
function calculateStats(events, previousEvents) {
    const stats = {
        totalEvents: events.length,
        avgSeverity: 0,
        mostCommonType: '',
        mostAffectedArea: '',
        categoryCounts: {},
        areaCounts: {},
        typeCounts: {},
        severityCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        trends: []
    };

    if (events.length === 0) return stats;

    // Calculate counts
    let totalSeverity = 0;
    events.forEach(event => {
        totalSeverity += event.discomfortLevel;

        // Category counts
        const category = categoryMap[event.discomfortType] || 'Other';
        stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;

        // Area counts
        const area = formatBodyPart(event.affectedArea);
        stats.areaCounts[area] = (stats.areaCounts[area] || 0) + 1;

        // Type counts
        const type = event.discomfortTypeLabel || event.discomfortType;
        stats.typeCounts[type] = (stats.typeCounts[type] || 0) + 1;

        // Severity counts
        stats.severityCounts[event.discomfortLevel]++;
    });

    stats.avgSeverity = (totalSeverity / events.length).toFixed(1);

    // Find most common
    stats.mostCommonType = Object.entries(stats.typeCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    stats.mostAffectedArea = Object.entries(stats.areaCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Calculate trends (comparison with previous period)
    if (previousEvents.length > 0) {
        const prevCategoryCounts = {};
        previousEvents.forEach(event => {
            const category = categoryMap[event.discomfortType] || 'Other';
            prevCategoryCounts[category] = (prevCategoryCounts[category] || 0) + 1;
        });

        // Calculate percentage changes
        Object.keys(stats.categoryCounts).forEach(category => {
            const current = stats.categoryCounts[category];
            const previous = prevCategoryCounts[category] || 0;

            if (previous > 0) {
                const change = ((current - previous) / previous) * 100;
                stats.trends.push({
                    category,
                    current,
                    previous,
                    change: change.toFixed(0),
                    direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'same'
                });
            } else if (current > 0) {
                stats.trends.push({
                    category,
                    current,
                    previous: 0,
                    change: 'new',
                    direction: 'new'
                });
            }
        });

        // Check for categories that decreased to zero
        Object.keys(prevCategoryCounts).forEach(category => {
            if (!stats.categoryCounts[category] && prevCategoryCounts[category] > 0) {
                stats.trends.push({
                    category,
                    current: 0,
                    previous: prevCategoryCounts[category],
                    change: -100,
                    direction: 'decrease'
                });
            }
        });
    }

    return stats;
}

// Generate the summary report
function generateSummaryReport(events, startDate, endDate) {
    const previousEvents = getPreviousPeriodEvents(startDate, endDate);
    const stats = calculateStats(events, previousEvents);

    // Report date info
    document.getElementById('report-date-range').textContent =
        `Period: ${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    document.getElementById('report-generated-date').textContent =
        `Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}`;

    // Overview stats
    document.getElementById('stats-overview').innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.totalEvents}</div>
            <div class="stat-label">Total Events</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgSeverity}</div>
            <div class="stat-label">Avg Severity (1-5)</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Object.keys(stats.categoryCounts).length}</div>
            <div class="stat-label">Categories Affected</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Object.keys(stats.areaCounts).length}</div>
            <div class="stat-label">Body Areas</div>
        </div>
    `;

    // Trend analysis
    let trendsHTML = '';
    if (stats.trends.length > 0) {
        stats.trends.sort((a, b) => {
            if (a.direction === 'decrease') return -1;
            if (b.direction === 'decrease') return 1;
            return 0;
        });

        stats.trends.forEach(trend => {
            const emoji = categoryEmojis[trend.category] || '📊';
            let trendIcon, trendClass, trendText;

            if (trend.direction === 'decrease') {
                trendIcon = '↓';
                trendClass = 'trend-down';
                trendText = `${Math.abs(trend.change)}% decrease`;
            } else if (trend.direction === 'increase') {
                trendIcon = '↑';
                trendClass = 'trend-up';
                trendText = `${trend.change}% increase`;
            } else if (trend.direction === 'new') {
                trendIcon = '●';
                trendClass = 'trend-new';
                trendText = 'New this period';
            } else {
                trendIcon = '→';
                trendClass = 'trend-same';
                trendText = 'No change';
            }

            trendsHTML += `
                <div class="trend-item ${trendClass}">
                    <span class="trend-emoji">${emoji}</span>
                    <span class="trend-category">${trend.category}</span>
                    <span class="trend-change">
                        <span class="trend-icon">${trendIcon}</span>
                        ${trendText}
                    </span>
                    <span class="trend-counts">${trend.previous} → ${trend.current} events</span>
                </div>
            `;
        });
    } else {
        trendsHTML = '<p class="no-comparison">No previous period data available for comparison.</p>';
    }
    document.getElementById('trends-container').innerHTML = trendsHTML;

    // Category breakdown
    let categoryHTML = '';
    const sortedCategories = Object.entries(stats.categoryCounts)
        .sort((a, b) => b[1] - a[1]);

    sortedCategories.forEach(([category, count]) => {
        const percentage = ((count / stats.totalEvents) * 100).toFixed(0);
        const emoji = categoryEmojis[category] || '📊';

        categoryHTML += `
            <div class="category-item">
                <div class="category-header">
                    <span class="category-emoji">${emoji}</span>
                    <span class="category-name">${category}</span>
                    <span class="category-count">${count} events (${percentage}%)</span>
                </div>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    document.getElementById('category-breakdown').innerHTML = categoryHTML;

    // Body areas
    let areasHTML = '';
    const sortedAreas = Object.entries(stats.areaCounts)
        .sort((a, b) => b[1] - a[1]);

    sortedAreas.forEach(([area, count]) => {
        areasHTML += `
            <div class="area-item">
                <span class="area-name">${area}</span>
                <span class="area-count">${count} events</span>
            </div>
        `;
    });
    document.getElementById('body-areas-list').innerHTML = areasHTML;

    // Severity distribution
    const severityLabels = {
        1: { label: 'Very High', emoji: '😡', color: '#ef4444' },
        2: { label: 'High', emoji: '😠', color: '#f97316' },
        3: { label: 'Moderate', emoji: '😕', color: '#eab308' },
        4: { label: 'Low', emoji: '🙂', color: '#84cc16' },
        5: { label: 'Minimal', emoji: '😊', color: '#22c55e' }
    };

    let severityHTML = '';
    for (let level = 1; level <= 5; level++) {
        const count = stats.severityCounts[level];
        const percentage = stats.totalEvents > 0 ? ((count / stats.totalEvents) * 100).toFixed(0) : 0;
        const info = severityLabels[level];

        severityHTML += `
            <div class="severity-row">
                <span class="severity-emoji">${info.emoji}</span>
                <span class="severity-label">${info.label}</span>
                <div class="severity-bar-container">
                    <div class="severity-bar" style="width: ${percentage}%; background-color: ${info.color}"></div>
                </div>
                <span class="severity-count">${count} (${percentage}%)</span>
            </div>
        `;
    }
    document.getElementById('severity-chart').innerHTML = severityHTML;

    // Event log
    let eventLogHTML = '<table class="event-table"><thead><tr><th>Date & Time</th><th>Type</th><th>Area</th><th>Severity</th><th>Notes</th></tr></thead><tbody>';

    events.forEach(event => {
        const date = new Date(event.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const type = event.discomfortTypeLabel || event.discomfortType;
        const area = formatBodyPart(event.affectedArea);
        const severity = `${getSeverityLabel(event.discomfortLevel)} (${event.discomfortLevel}/5)`;
        const notes = event.voiceNote ? event.voiceNote.substring(0, 50) + (event.voiceNote.length > 50 ? '...' : '') : '-';

        eventLogHTML += `
            <tr>
                <td>${dateStr}<br><small>${timeStr}</small></td>
                <td>${type}</td>
                <td>${area}</td>
                <td>${severity}</td>
                <td>${notes}</td>
            </tr>
        `;
    });

    eventLogHTML += '</tbody></table>';
    document.getElementById('event-log').innerHTML = eventLogHTML;

    // Clinical notes
    let clinicalHTML = '<ul class="clinical-list">';

    // Most frequent issues
    clinicalHTML += `<li><strong>Primary Complaint:</strong> ${stats.mostCommonType} affecting ${stats.mostAffectedArea}</li>`;

    // Frequency observation
    const daysInPeriod = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const eventsPerDay = (stats.totalEvents / daysInPeriod).toFixed(1);
    clinicalHTML += `<li><strong>Frequency:</strong> Average of ${eventsPerDay} events per day over ${daysInPeriod} days</li>`;

    // Severity observation
    if (parseFloat(stats.avgSeverity) <= 2) {
        clinicalHTML += `<li><strong>Severity Assessment:</strong> Patient reports predominantly high severity symptoms (avg ${stats.avgSeverity}/5). Further investigation recommended.</li>`;
    } else if (parseFloat(stats.avgSeverity) <= 3) {
        clinicalHTML += `<li><strong>Severity Assessment:</strong> Patient reports moderate severity symptoms (avg ${stats.avgSeverity}/5).</li>`;
    } else {
        clinicalHTML += `<li><strong>Severity Assessment:</strong> Patient reports predominantly low severity symptoms (avg ${stats.avgSeverity}/5).</li>`;
    }

    // Trend observations
    const improvements = stats.trends.filter(t => t.direction === 'decrease');
    const worsening = stats.trends.filter(t => t.direction === 'increase');

    if (improvements.length > 0) {
        clinicalHTML += `<li><strong>Improvements Noted:</strong> ${improvements.map(t => `${t.category} (↓${Math.abs(t.change)}%)`).join(', ')}</li>`;
    }

    if (worsening.length > 0) {
        clinicalHTML += `<li><strong>Areas of Concern:</strong> ${worsening.map(t => `${t.category} (↑${t.change}%)`).join(', ')}</li>`;
    }

    // Pattern observation
    if (sortedCategories.length > 0) {
        const topCategories = sortedCategories.slice(0, 3).map(([cat]) => cat).join(', ');
        clinicalHTML += `<li><strong>Symptom Categories:</strong> Primary categories reported include ${topCategories}</li>`;
    }

    clinicalHTML += '</ul>';
    document.getElementById('clinical-notes').innerHTML = clinicalHTML;
}

// Download report as text file (PDF would require a library)
function downloadReport() {
    const reportDateRange = document.getElementById('report-date-range').textContent;
    const reportGenerated = document.getElementById('report-generated-date').textContent;

    // Get all the data from the page
    const statsCards = document.querySelectorAll('.stat-card');
    const trendItems = document.querySelectorAll('.trend-item');
    const categoryItems = document.querySelectorAll('.category-item');
    const areaItems = document.querySelectorAll('.area-item');
    const severityRows = document.querySelectorAll('.severity-row');
    const eventRows = document.querySelectorAll('.event-table tbody tr');
    const clinicalList = document.querySelectorAll('.clinical-list li');

    let report = `
================================================================================
                         HEATH TRACK - PATIENT HEALTH SUMMARY REPORT
================================================================================

${reportDateRange}
${reportGenerated}

================================================================================
                                    OVERVIEW
================================================================================
`;

    statsCards.forEach(card => {
        const value = card.querySelector('.stat-value').textContent;
        const label = card.querySelector('.stat-label').textContent;
        report += `${label}: ${value}\n`;
    });

    report += `
================================================================================
                                TREND ANALYSIS
================================================================================
`;

    if (trendItems.length > 0) {
        trendItems.forEach(item => {
            const category = item.querySelector('.trend-category').textContent;
            const change = item.querySelector('.trend-change').textContent.trim();
            const counts = item.querySelector('.trend-counts').textContent;
            report += `${category}: ${change} (${counts})\n`;
        });
    } else {
        report += `No previous period data available for comparison.\n`;
    }

    report += `
================================================================================
                              EVENTS BY CATEGORY
================================================================================
`;

    categoryItems.forEach(item => {
        const name = item.querySelector('.category-name').textContent;
        const count = item.querySelector('.category-count').textContent;
        report += `${name}: ${count}\n`;
    });

    report += `
================================================================================
                             AFFECTED BODY AREAS
================================================================================
`;

    areaItems.forEach(item => {
        const name = item.querySelector('.area-name').textContent;
        const count = item.querySelector('.area-count').textContent;
        report += `${name}: ${count}\n`;
    });

    report += `
================================================================================
                         DISCOMFORT SEVERITY DISTRIBUTION
================================================================================
`;

    severityRows.forEach(row => {
        const label = row.querySelector('.severity-label').textContent;
        const count = row.querySelector('.severity-count').textContent;
        report += `${label}: ${count}\n`;
    });

    report += `
================================================================================
                              DETAILED EVENT LOG
================================================================================
`;

    report += `Date/Time          | Type                    | Area              | Severity        | Notes\n`;
    report += `-------------------|-------------------------|-------------------|-----------------|------------------\n`;

    eventRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const date = cells[0].textContent.replace(/\s+/g, ' ').trim();
        const type = cells[1].textContent.trim().substring(0, 23).padEnd(23);
        const area = cells[2].textContent.trim().substring(0, 17).padEnd(17);
        const severity = cells[3].textContent.trim().substring(0, 15).padEnd(15);
        const notes = cells[4].textContent.trim().substring(0, 16);
        report += `${date.padEnd(18)} | ${type} | ${area} | ${severity} | ${notes}\n`;
    });

    report += `
================================================================================
                         NOTES FOR HEALTHCARE PROVIDER
================================================================================
`;

    clinicalList.forEach(item => {
        report += `• ${item.textContent}\n`;
    });

    report += `
================================================================================
                                   DISCLAIMER
================================================================================
This report was generated by Heath Track App for informational purposes.
Please consult with a healthcare professional for medical advice.

================================================================================
`;

    // Create and download the file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
