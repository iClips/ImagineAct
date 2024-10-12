function getBudgetChallenge() {
    var budgetChallengeHTML = "<h2>Budget Challenge<span class='info-icon' title='Select items to add to your budget. Spend your budget wisely!'>&#9432; </span></h2>" +
        "<p>Your starting budget is: <span id='budget-display'>" + initialBudget + "</span></p>" +
        "<div id='item-options'>" +
            "<h3>Select Items:</h3>" +
            createItemButtons(itemOptions) +
        "</div>" +
        "<div id='budget-status'>" +
            "<h3>Status:</h3>" +
            "<p>Total Spent: <span id='total-spent'>0</span></p>" +
            "<p>Remaining Budget: <span id='remaining-budget'>" + remainingBudget + "</span></p>" +
        "</div>" +
        "<div id='message'></div>";

    return budgetChallengeHTML;
}

function get3DSphere() {
    return 
        `<style>
            body { margin: 0; }
            canvas { display: block; }
        </style>
        <div id="earth-container"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
        <script src="assets/js/3DSphere.js"></script>`;
}
