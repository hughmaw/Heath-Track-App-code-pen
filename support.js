document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons on page load
  lucide.createIcons();
  
  const originalBox = document.getElementById('original-box');

originalBox.addEventListener('click', function() {
  const newBox = document.createElement('div');
  newBox.className = 'box';
  
  // Insert it right after the original box
  originalBox.parentNode.insertBefore(newBox, originalBox.nextSibling);
});
});