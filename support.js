document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons on page load
  lucide.createIcons();
  
  const originalBox = document.getElementById('original-box');

  originalBox.addEventListener('click', function() {
    const newBox = document.createElement('div');
    newBox.className = 'box';

    // Add the circle-minus icon
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'circle-minus');
    icon.className = 'delete-icon';
    
    newBox.appendChild(icon);
    
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