document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons on page load
    lucide.createIcons();

    const container = document.querySelector('.container');
    const originalBox = document.getElementById('original-box');

    // Load saved contacts from localStorage
    loadContacts();

    // Add new contact when clicking the add button
    originalBox.addEventListener('click', function() {
        // Prompt for information
        const name = prompt("Enter name:");
        if (name === null || name.trim() === '') return;

        const relationship = prompt("Enter relationship (e.g., Doctor, Family, Caregiver):");
        if (relationship === null) return;

        const phone = prompt("Enter phone number:");
        if (phone === null) return;

        const email = prompt("Enter email (optional):");

        // Create contact object
        const contact = {
            id: 'contact_' + Date.now(),
            name: name.trim(),
            relationship: relationship.trim() || 'Contact',
            phone: phone.trim(),
            email: email ? email.trim() : ''
        };

        // Save to localStorage
        saveContact(contact);

        // Create the contact box
        createContactBox(contact);
    });

    // Save contact to localStorage
    function saveContact(contact) {
        const contacts = JSON.parse(localStorage.getItem('supportContacts') || '[]');
        contacts.push(contact);
        localStorage.setItem('supportContacts', JSON.stringify(contacts));
    }

    // Remove contact from localStorage
    function removeContact(contactId) {
        let contacts = JSON.parse(localStorage.getItem('supportContacts') || '[]');
        contacts = contacts.filter(c => c.id !== contactId);
        localStorage.setItem('supportContacts', JSON.stringify(contacts));
    }

    // Load contacts from localStorage
    function loadContacts() {
        const contacts = JSON.parse(localStorage.getItem('supportContacts') || '[]');
        contacts.forEach(contact => {
            createContactBox(contact);
        });
    }

    // Create a contact box element
    function createContactBox(contact) {
        const newBox = document.createElement('div');
        newBox.className = 'box contact-box';
        newBox.setAttribute('data-contact-id', contact.id);

        // Add the delete icon
        const deleteIcon = document.createElement('i');
        deleteIcon.setAttribute('data-lucide', 'circle-minus');
        deleteIcon.className = 'delete-icon';
        newBox.appendChild(deleteIcon);

        // Add relationship badge
        const badge = document.createElement('div');
        badge.className = 'relationship-badge';
        badge.textContent = contact.relationship;
        newBox.appendChild(badge);

        // Add the user profile icon
        const userIcon = document.createElement('i');
        userIcon.setAttribute('data-lucide', 'circle-user-round');
        userIcon.className = 'user-icon';
        newBox.appendChild(userIcon);

        // Add the contact information
        const infoDiv = document.createElement('div');
        infoDiv.className = 'contact-info';

        let infoHTML = `<div class="contact-name">${contact.name}</div>`;

        if (contact.phone) {
            infoHTML += `<div class="contact-detail"><i data-lucide="phone" class="detail-icon"></i> ${contact.phone}</div>`;
        }

        if (contact.email) {
            infoHTML += `<div class="contact-detail"><i data-lucide="mail" class="detail-icon"></i> ${contact.email}</div>`;
        }

        infoDiv.innerHTML = infoHTML;
        newBox.appendChild(infoDiv);

        // Add action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'contact-actions';

        if (contact.phone) {
            const callBtn = document.createElement('a');
            callBtn.href = `tel:${contact.phone}`;
            callBtn.className = 'action-btn call-btn';
            callBtn.innerHTML = '<i data-lucide="phone-call"></i>';
            callBtn.title = 'Call';
            actionsDiv.appendChild(callBtn);
        }

        if (contact.email) {
            const emailBtn = document.createElement('a');
            emailBtn.href = `mailto:${contact.email}`;
            emailBtn.className = 'action-btn email-btn';
            emailBtn.innerHTML = '<i data-lucide="mail"></i>';
            emailBtn.title = 'Email';
            actionsDiv.appendChild(emailBtn);
        }

        newBox.appendChild(actionsDiv);

        // Insert after the original box
        originalBox.parentNode.insertBefore(newBox, originalBox.nextSibling);

        // Initialize icons
        lucide.createIcons();

        // Add delete handler
        newBox.addEventListener('click', function(e) {
            if (e.target.closest('.delete-icon')) {
                e.stopPropagation();
                if (confirm(`Remove ${contact.name} from your support network?`)) {
                    removeContact(contact.id);
                    newBox.remove();
                }
            }
        });

        // Prevent action buttons from triggering box click
        actionsDiv.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});
