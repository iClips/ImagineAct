// script.js

function toggleContent(event) {
    const item = event.currentTarget;
    const content = item.querySelector('.item-content');

    // Toggle the active class to show/hide content
    item.classList.toggle('active');

    // If the content is visible, smooth transition to hide it
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}

// Select elements you want to target
const elements = document.querySelectorAll('.target-elements');

// Add the bound style to all selected elements
elements.forEach(element => element.classList.add('bound-style'));

// Or, toggle it on click or another event:
elements.forEach(element => {
    element.addEventListener('click', () => {
        element.classList.toggle('bound-style');
    });
});