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
