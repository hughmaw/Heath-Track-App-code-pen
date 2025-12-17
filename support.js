document.addEventListener('click', function(e) {
  if (e.target.classList.contains('box')) {
    // Create a new box element
    const newBox = document.createElement('div');
    newBox.className = 'box';  // Copy the class
    
    // Copy all inline styles if any exist
    newBox.style.cssText = e.target.style.cssText;
    
    // Insert it right after the clicked box
    e.target.parentNode.insertBefore(newBox, e.target.nextSibling);
  }
});