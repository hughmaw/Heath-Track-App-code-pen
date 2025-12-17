document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons on page load
  lucide.createIcons();
  
  const originalBox = document.getElementById('original-box');

  originalBox.addEventListener('click', function() {
    // Prompt for information
    const name = prompt("Enter name:");
    if (name === null) return; // User cancelled
    
    const email = prompt("Enter email:");
    if (email === null) return; // User cancelled
    
    const phone = prompt("Enter phone number:");
    if (phone === null) return; // User cancelled
    
    const newBox = document.createElement('div');
    newBox.className = 'box';

    // Add the circle-minus icon
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'circle-minus');
    icon.className = 'delete-icon';
    
    newBox.appendChild(icon);
    
    // Add the contact information
    const infoDiv = document.createElement('div');
    infoDiv.className = 'contact-info';
    infoDiv.innerHTML = `
      <div><strong>Name:</strong> ${name}</div>
      <div><strong>Email:</strong> ${email}</div>
      <div><strong>Phone:</strong> ${phone}</div>
    `;
    
    newBox.appendChild(infoDiv);
    
    // Insert it right after the original box
    originalBox.parentNode.insertBefore(newBox, originalBox.nextSibling);
    
    // Initialize the new icon
    lucide.createIcons();

    // Add click event to the newBox itself
    newBox.addEventListener('click', function(e) {
      // Check if the clicked element is the delete icon or its SVG child
      if (e.target.closest('.delete-icon')) {
        e.stopPropagation();
        newBox.remove();
      }
    });
  });
});