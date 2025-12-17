document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons on page load
  lucide.createIcons();
  
  // Add click event listener
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('box') || e.target.closest('.box')) {
      const clickedBox = e.target.classList.contains('box') ? e.target : e.target.closest('.box');
      
      // Create a new box element
      const newBox = document.createElement('div');
      newBox.className = 'box';
      
      // Add the circle icon to the new box
      newBox.innerHTML = `
        <div class="circle-icon">
          <i data-lucide="circle-plus"></i>
        </div>
      `;
      
      // Insert it right after the clicked box
      clickedBox.parentNode.insertBefore(newBox, clickedBox.nextSibling);
      
      // Reinitialize Lucide icons for the new element
      lucide.createIcons();
    }
  });
});