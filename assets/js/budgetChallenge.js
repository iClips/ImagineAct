// Variable Declarations
let selectedTemplate = '';
let budgetAmount = 0;
let categories = {};

// let initialBudget = 1000; // Starting budget
// let spendingGoal = 0.90; // Spend 90% of the budget
// let totalSpent = 0;
// let remainingBudget = initialBudget;
// let categoryLimits = {
//     Food: initialBudget * 0.40, // 40% limit for Food
//     Clothing: initialBudget * 0.30, // 30% limit for Clothing
//     Electronics: initialBudget * 0.20, // 20% limit for Electronics
//     Entertainment: initialBudget * 0.10 // 10% limit for Entertainment
// };
// let categoryTotals = {
//     Food: 0,
//     Clothing: 0,
//     Electronics: 0,
//     Entertainment: 0
// };

// const itemOptions = [
//     { name: "Pizza", price: 200, category: "Food" },
//     { name: "Jeans", price: 150, category: "Clothing" },
//     { name: "Headphones", price: 300, category: "Electronics" },
//     { name: "Movie Ticket", price: 100, category: "Entertainment" }
// ];


// // Function to create item buttons
// function createItemButtons(itemOptions) {
//     var buttonsHTML = itemOptions.map(function (item) {
//         return "<button class='item-button' onclick='selectItem(" + JSON.stringify(item) + ")'>" +
//             item.name + " - " + item.price +
//             "</button>";
//     }).join('');

//     return buttonsHTML;
// }
// function selectItem(item) {
//     const itemPrice = item.price;
//     const category = item.category;

//     // Check if adding this item exceeds category limits
//     if (categoryTotals[category] + itemPrice > categoryLimits[category]) {
//         notifyUser("Category limit exceeded");
//         return;
//     }

//     // Add item to totals
//     totalSpent += itemPrice;
//     categoryTotals[category] += itemPrice;
//     remainingBudget = initialBudget - totalSpent;

//     // Update UI
//     updateBudgetDisplay();

//     // Check for challenge completion
//     if (totalSpent / initialBudget >= spendingGoal) {
//         challengeComplete("Success");
//     }
// }

// function updateBudgetDisplay() {
//     document.getElementById('total-spent').innerText = totalSpent;
//     document.getElementById('remaining-budget').innerText = remainingBudget;
// }

// function notifyUser(message) {
//     document.getElementById('message').innerText = message;
// }

// function challengeComplete(result) {
//     const messageElement = document.getElementById('message');
//     if (result === "Success") {
//         messageElement.innerText = "Congratulations! You've successfully allocated your budget!";
//         initialBudget *= 2; // Reward by doubling the budget
//         resetChallenge(); // Reset for the next challenge
//     } else {
//         messageElement.innerText = "Challenge failed! Please try again.";
//     }
// }

// function resetChallenge() {
//     totalSpent = 0;
//     remainingBudget = initialBudget;
//     categoryTotals = {
//         Food: 0,
//         Clothing: 0,
//         Electronics: 0,
//         Entertainment: 0
//     };
//     updateBudgetDisplay();
// }


// function allocateFunds() {
//     let savingAmt = parseFloat(document.getElementById("savings").value);
//     let essentialAmt = parseFloat(document.getElementById("essentials").value);
//     let discretionaryAmt = parseFloat(document.getElementById("discretionary").value);
//     let investmentAmt = parseFloat(document.getElementById("investments").value);
//     let total = savingAmt + essentialAmt + discretionaryAmt + investmentAmt;
//     let feedback = document.getElementById("budgetFeedback");

//     if (total > initialBalance) {
//         feedback.innerHTML = `<p style="color: red;">You have exceeded your available balance! Please reallocate.</p>`;
//         return;
//     }

//     savings = savingAmt;
//     essentials = essentialAmt;
//     discretionary = discretionaryAmt;
//     investments = investmentAmt;

//     checkBudgetStatus();
// }

// function checkBudgetStatus() {
//     let feedback = document.getElementById("budgetFeedback");
//     feedback.innerHTML = "<h3>Budget Feedback:</h3>";

//     if (savings >= initialBalance * 0.2) {
//         feedback.innerHTML += `<p>You've saved 20% or more of your income. Great job!</p>`;
//     } else {
//         feedback.innerHTML += `<p>Try saving more of your income.</p>`;
//     }

//     if (discretionary <= initialBalance * 0.3) {
//         feedback.innerHTML += `<p>Your discretionary spending is within a reasonable limit.</p>`;
//     } else {
//         feedback.innerHTML += `<p>Your discretionary spending is too high.</p>`;
//     }

//     handleUnexpectedEvents();
// }

// function handleUnexpectedEvents() {
//     let unexpectedExpense = 200;
//     let remainingBalance = initialBalance - (savings + essentials + discretionary + investments);
//     let feedback = document.getElementById("budgetFeedback");

//     if (remainingBalance < unexpectedExpense) {
//         feedback.innerHTML += `<p style="color: red;">You don't have enough funds to cover an unexpected expense! Reallocate your budget.</p>`;
//     } else {
//         feedback.innerHTML += `<p>An unexpected expense of $200 occurred. You have enough funds left.</p>`;
//     }
// }


// Event Listeners
document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        selectedTemplate = this.dataset.template;
        document.getElementById('selectedTemplate').textContent = selectedTemplate;
        toggleStep(1, 2);
    });
});

document.querySelector('.next-btn').addEventListener('click', function () {
    budgetAmount = parseFloat(document.getElementById('budgetAmount').value);
    if (budgetAmount > 0) {
        loadCategories(selectedTemplate, budgetAmount);
        toggleStep(2, 3);
    } else {
        alert('Please enter a valid budget amount.');
    }
});

document.querySelector('.generate-btn').addEventListener('click', function () {
    generateSuggestedBudget();
    toggleStep(3, 4);
});

document.querySelector('.save-btn').addEventListener('click', function () {
    saveBudgetToLocalStorage();
    alert('Budget saved successfully!');
});

document.querySelector('.back-btn').addEventListener('click', function () {
    toggleStep(4, 3);
});

document.querySelector('.add-category-btn').addEventListener('click', function () {
    addCustomCategory();
});

// Functions
function toggleStep(currentStep, nextStep) {
    document.querySelector(`.step-${currentStep}`).classList.add('hidden');
    document.querySelector(`.step-${nextStep}`).classList.remove('hidden');
    document.querySelector(`.step-${nextStep}`).classList.add('active');
}

function loadCategories(template, budget) {
    const categoriesDiv = document.getElementById('categories');
    categoriesDiv.innerHTML = ''; // Clear previous

    if (template === '50-20-30') {
        categories = { Essentials: 50, Savings: 20, Wants: 30 };
    } else if (template === 'zero-based') {
        categories = { Housing: 30, Food: 20, Transportation: 15, Other: 35 };
    } else if (template === 'envelope-system') {
        categories = { Rent: 25, Groceries: 25, Utilities: 20, Fun: 10, Savings: 20 };
    }

    Object.keys(categories).forEach(category => {
        const percentage = categories[category];
        const inputHTML = `<label>${category} (${percentage}%):</label><input type="number" class="category-input" data-category="${category}" value="${(budget * percentage / 100).toFixed(2)}"><br>`;
        categoriesDiv.innerHTML += inputHTML;
    });
}

function generateSuggestedBudget() {
    const categoryInputs = document.querySelectorAll('.category-input');
    let suggestedBudget = '';

    categoryInputs.forEach(input => {
        const category = input.dataset.category;
        const amount = parseFloat(input.value);
        suggestedBudget += `<p>${category}: ${amount.toFixed(2)}</p>`;
    });

    document.getElementById('suggestedBudget').innerHTML = suggestedBudget;
}

function saveBudgetToLocalStorage() {
    const budgetData = {
        template: selectedTemplate,
        budget: budgetAmount,
        categories: {}
    };

    document.querySelectorAll('.category-input').forEach(input => {
        budgetData.categories[input.dataset.category] = parseFloat(input.value);
    });

    const budgetHistory = JSON.parse(localStorage.getItem('budgetHistory')) || [];
    budgetHistory.push(budgetData);
    localStorage.setItem('budgetHistory', JSON.stringify(budgetHistory));
}

function addCustomCategory() {
    const newCategory = prompt("Enter the new category name:");
    const newPercentage = parseFloat(prompt("Enter the percentage for this category:"));

    if (newCategory && newPercentage > 0 && newPercentage <= 100) {
        categories[newCategory] = newPercentage;
        loadCategories(selectedTemplate, budgetAmount); // Reload categories
    } else {
        alert("Invalid category or percentage.");
    }
}
