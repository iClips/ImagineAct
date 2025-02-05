let balance;
let recognitionActive;
let initialDeposit;
let selectedCurrency;
let currentPurchase;
let recognition;
let repeatCount;
let targetRepeatMantraCount;

let resetGameLink;
let resetLevelLink;

let loginScreen;
let loginButton;

let gameScreen;
let starting_balance;
let total_purchases;
let balanceAmount;      
let purchaseList;

let dropdown_menu;
let btn_menu;
let aboutLink;
let aboutPopup;
let popupClose;
let soundBars;

let controlSpeechButton;
let recognizedTextLabel;
let languageSelect;
let themeSelect;
let SpeechRecognition;

let selectedCurrencyName;
let displayName;


let isShopsInit = false, isVoiceInit = false;

document.addEventListener('DOMContentLoaded', () => {    
    const theme = localStorage.getItem('theme');
    if (theme) {
        themeSelect = document.getElementById('theme');
        themeSelect.value = theme;
        setTheme(theme);
    }
    popupClose = document.getElementById('closePopup');
    if (popupClose) {
        popupClose.addEventListener('click', () => {
            aboutPopup.style.display = 'none';
        });
    }

    authUser();
});

function initVCPurchases() {
    initGlobalVars();
    registerEventListeners();        
}

async function initGlobalVars() {
    balance = 0;
    recognitionActive = false;
    initialDeposit = 0;
    selectedCurrency = {};
    currentPurchase = '';
    recognition;
    repeatCount = 0;
    targetRepeatMantraCount = 10;

    resetGameLink = document.getElementById('resetGame');
    resetLevelLink = document.getElementById('resetLevel');
    
    recognizedTextLabel = document.getElementById('recognizedText');
    languageSelect = document.getElementById('language');
    if (!themeSelect) {
        themeSelect = document.getElementById('theme');
    }
    
    dropdown_menu = document.getElementById('dropdown_menu');
    btn_menu = document.getElementById('btn_menu');
    
    aboutLink = document.getElementById('aboutLink');
    const response = await fetch('../../inc/about-content.html');
    if (!response.ok) throw new Error(`HTTP error! About Content Error.  Status: ${response.status}`);
    
    const markup = await response.text();
    aboutPopup = document.getElementById('aboutPopup');
    if (!aboutPopup) {
        
    }    
    aboutPopup.innerHTML = markup;
    
    
    
    soundBars = document.querySelectorAll('.sound-bar');    
}
// Array of mantras for I.Act
const mantras = [
    "I am the spark that ignites dreams.",
    "With each step, I create my reality.",
    "I attract abundance with ease.",
    "I am in control, building my path.",
    "Each move takes me higher and higher.",
    "The world is mine to shape and design.",
    "I am empowered, unstoppable, inspired.",
    "Every command brings my vision to life.",
    "I receive what I desire, effortlessly.",
    "I am the key to limitless potential."
  ];
  
  // Function to animate mantra
  function showMantra() {
    // Randomly select a mantra from the array
    const mantraText = mantras[Math.floor(Math.random() * mantras.length)];
  
    // Create a new mantra element
    const mantraElement = document.createElement("div");
    mantraElement.classList.add("mantra");
    mantraElement.textContent = mantraText;
    gameScreen.appendChild(mantraElement); // Add to the game screen container
  
    // Randomize initial position and scaling
    const initialScale = Math.random() * 0.5 + 0.75; // Scale between 0.75 and 1.25
    mantraElement.style.transform = `scale(${initialScale})`;
    mantraElement.style.left = `${Math.random() * 50}vw`;
    mantraElement.style.top = `${Math.random() * 50}vh`;
  
    // Animate to random position with varying scale
    const finalScale = Math.random() * 1.5 + 0.5; // Scale between 0.5 and 2
    mantraElement.animate(
      [
        {
          transform: `scale(${initialScale}) translate(0, 0)`,
          opacity: 1,
        },
        {
          transform: `scale(${finalScale}) translate(${Math.random() * 100 - 50}vw, ${Math.random() * 100 - 50}vh)`,
          opacity: 0,
        },
      ],
      {
        duration: 3000, // Animation duration
        easing: "ease-in-out",
        fill: "forwards",
      }
    );
  
    // Remove the mantra element after animation completes
    setTimeout(() => {
      mantraElement.remove();
    }, 3000);
}
  
  
async function authUser() {
    try {
        const response = await fetch('inc/loginScreen.html');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const markup = await response.text();
        const container = document.getElementById('loginContainer');
        if (!container) {
            showNote('error', 'Login container not found.');
            return;
        }
        
        container.innerHTML = markup;
        
        loginScreen = document.getElementById('loginScreen');
        loginButton = document.getElementById('loginButton');
        gameScreen = document.getElementById('gameScreen');

        const storedUsername = localStorage.getItem('username');
        initialDeposit = parseFloat(localStorage.getItem('initialDeposit'));
        
        if (storedUsername && !isNaN(initialDeposit)) {
            loginScreen.style.display = 'none';
            gameScreen.style.display = 'block';
        } else {
            loginScreen.style.display = 'block';
            gameScreen.style.display = 'none';
        }

        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        } else {
            console.error('Login button not found.');
            showNote('error', 'Login button not found.');
        }
        
    } catch (error) {
        console.error('Error loading Login Screen:', error);
        showNote('Error', `Error loading Login Screen: ${error}`);
    }
}

function handleLogin() {
    const username = document.getElementById('username').value;
    initialDeposit = parseFloat(document.getElementById('initialDeposit').value);
    
    const currencyInput = document.getElementById('currency');
    const selectedCurrencySymbol = currencyInput.value;
    let selectedCurrencyObj = null;
    
    const datalistOptions = document.querySelectorAll('#currencies option');
    
    datalistOptions.forEach(option => {
        if (option.value === selectedCurrencySymbol) {
            const currencyName = option.textContent.split(' - ')[1];
            selectedCurrencyObj = {
                name: currencyName,
                symbol: selectedCurrencySymbol
            };
        }
    });

    if (!selectedCurrencyObj) {
        alert('Please select a valid currency.');
        return;
    }
    
    if (!initialDeposit || initialDeposit <= 0) {
        alert('You have to start with an initial balance.');
        return;
    }
    
    if (!username) {
        alert('Please enter your username.');
        return;
    }
    
    localStorage.setItem('username', username);
    localStorage.setItem('balance', initialDeposit.toFixed(2));
    localStorage.setItem('initialDeposit', initialDeposit.toFixed(2));        
    localStorage.setItem('currency', JSON.stringify(selectedCurrencyObj));
    localStorage.setItem('purchases', JSON.stringify([]));

    loginScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    showNote('message', "Welcome to Imagine Act, or I Act.");
    
}

window.onclick = (event) => {
    if (event.target === aboutPopup) {
        aboutPopup.style.display = 'none';
    }
    if (!btn_menu.contains(event.target) && !dropdown_menu.contains(event.target)) {
        dropdown_menu.style.display = 'none';
    }
};

function registerEventListeners() {
    languageSelect.addEventListener('change', () => {
        recognitionLang = languageSelect.value;
        recognition.lang = recognitionLang;
        if (recognitionActive) {
            stopVoiceRecognition();
            recognition.onend = () => { 
                startVoiceRecognition();
                if (recognizedTextLabel) {
                    recognizedTextLabel.textContent = "Listening";
                }
            };
        }
    });
    themeSelect.addEventListener('change', () => {
        setTheme(themeSelect.value);
    });
    
    if (resetGameLink) {
        resetGameLink.addEventListener('click', () => {
            resetGame();
        });
    }
    if (resetLevelLink) {
        resetLevelLink.addEventListener('click', () => {
            resetLevel();
        });
    }
    
    if (aboutLink) {
        aboutLink.addEventListener('click', () => {
            dropdown_content.style.display = 'none';
            aboutPopup.style.display = 'block';
        });
    }

    if (btn_menu) {
        btn_menu.addEventListener('click', () => {
            toggleMenuPopup();
        });
    }

    window.onclick = (event) => {
        if (event.target === aboutPopup) {
            aboutPopup.style.display = 'none';
        }
        if (!btn_menu.contains(event.target) && !dropdown_menu.contains(event.target)) {
            dropdown_menu.style.display = 'none';
        }
    };
    controlSpeechButton = document.getElementById('controlSpeechButton');
    if (!controlSpeechButton) {
        showNote('error', 'Control Speech Button not found.');
        return;
    }
    controlSpeechButton.addEventListener('click', () => {
        if (!SpeechRecognition) {
            initSpeechRecognition();
        }
        if (recognitionActive) {
            stopVoiceRecognition();                            
        } else {
            startVoiceRecognition();            
        }
    });
}

function showNote(type, message) {
     const validTypes = ['error', 'warning', 'message'];
    if (!validTypes.includes(type)) {
        showNote("error", 'Invalid notification type.');
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <button onclick="this.parentElement.remove()">X</button>
        ${message}
    `;

    const notificationContainer = document.getElementById('error-container');
    notificationContainer.appendChild(notification);

     setTimeout(() => {
        notification.classList.add('show');
    }, 10); 

    setTimeout(() => {
        notification.classList.remove('show'); 
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 500);
    }, 5000);
}

function extractVoicePurchaseDetails(text) {
    console.log('Command text before regex process: ' + text);
    // Enhanced itemRegex to support "I get 3,000 Rand worth of groceries"
let itemRegex = /(?:I\s(?:buy|purchase|get|pay\sfor|pay|acquire|order|spent|obtain|grab|pick\s*up|snag|give\s*away|take\s*out))\s+(?:(?:\d+(?:,\d{3})*(?:\.\d{2})?\s+(?:R|Rand|USD|Dollar|Euro|Pound|¥|₹|CHF|AUD|CAD|Franc|Yen|Rupee|ZAR|South\sAfrican\sRand)\s*(?:worth\s*of)?)\s+)?(?:a|an|the|that|at|of\s+|[ ])?(.*?)(?:(?:\s+for)?\s+\d+(?:,\d{3})*(?:\.\d{2})?\s+(?:R|Rand|USD|Dollar|Euro|Pound|¥|₹|CHF|AUD|CAD|Franc|Yen|Rupee|ZAR|South\sAfrican\sRand))?/i;

if (!itemRegex) {
    itemRegex = /(?:I\s(?:buy|purchase|get|pay\sfor|pay|acquire|order|spent|obtain|grab|pick\s*up|snag|give\s*away|take\s*out))\s+(?:(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(R|Rand|USD|Dollar|Euro|Pound|¥|₹|CHF|AUD|CAD|Franc|Yen|Rupee|ZAR|South\sAfrican\sRand)\s*(?:worth\s*of)?)?\s*(?:a|an|the|that|at|of\s+|[ ])?(.*)/i;
}

// Enhanced amountRegex for numbers and word-based amounts
const amountRegex = /\b(\d+(?:,\d{3})*(?:\.\d{2})?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b/i;

// Check if command is matched and define specific itemRegex variants
if (itemRegex) {
    const itemBeforeAmountRegex = /(?:I\s(?:buy|purchase|get|pay\sfor|pay|acquire|order|spent|obtain|grab|pick\s*up|snag|give\s*away|take\s*out))\s+(?:a|an|the|that|at|[ ])?(.*?)(?:\sfor|\swith|\sat)?\s+\d+(?:,\d{3})*(?:\.\d{2})?\s+(?:R|Rand|USD|Dollar|Euro|Pound|¥|₹|CHF|AUD|CAD|Franc|Yen|Rupee|ZAR|South\sAfrican\sRand)?/i;
    
    const itemAfterAmountRegex = /(?:I\s(?:buy|purchase|get|pay\sfor|pay|acquire|order|spent|obtain|grab|pick\s*up|snag|give\s*away|take\s*out))\s+\d+(?:,\d{3})*(?:\.\d{2})?\s+(?:R|Rand|USD|Dollar|Euro|Pound|¥|₹|CHF|AUD|CAD|Franc|Yen|Rupee|ZAR|South\sAfrican\sRand)\s*(?:worth\s*of)?\s+(.*)/i;

    // Set itemRegex based on detected phrase structure
    if (itemAfterAmountRegex) {
        itemRegex = itemAfterAmountRegex;
    }
    if (itemBeforeAmountRegex) {
        itemRegex = itemBeforeAmountRegex;
    }
}

// Enhanced currencyRegex to capture various currency formats
const currencyRegex = /\b(R|Rand|USD|Dollar|US\sDollar|CAD|Canadian\sDollar|AUD|Australian\sDollar|EUR|Euro|GBP|British\sPound|Pound|JPY|Japanese\sYen|Yen|CHF|Swiss\sFranc|Franc|CNY|Chinese\sYuan|Yuan|₹|INR|Indian\sRupee|Rupee|ZAR|South\sAfrican\sRand)\b/i;

// Extract matches for item, amount, and currency
const itemMatch = text.match(itemRegex);
const amountMatch = text.match(amountRegex);
const currencyMatch = text.match(currencyRegex);

const item = itemMatch ? itemMatch[1].trim() : null;
const amount = amountMatch ? amountMatch[1].trim() : null;
const currency = currencyMatch ? currencyMatch[1].trim() : null;


    console.log("Item:", item);
    console.log("Amount:", amount);
    console.log("Currency:", currency);

    return {
        item,
        amount,
        currency
    };
}

function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showPopup() {
    const popup = document.querySelector('.popup');
    popup.classList.add('show');
}

function hidePopup() {
    const popup = document.querySelector('.popup');
    popup.classList.remove('show');
    popup.classList.add('hide');
}

function setTheme(theme) {
    try {
        if (!theme) {
            theme = 'retro-theme';
        }
        document.body.classList.remove('dark-theme', 'light-theme', 'retro-theme');
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
    } catch (ex) {
        showNote('warning', 'Theme set exception: ' + ex.message + ' theme=' + theme);
    }
}

function initSpeechRecognition() {    
    SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    
    if (!SpeechRecognition || !controlSpeechButton) {
        alert('Speech Recognition API is not supported in this browser. Or speech button error.');
        return;
    }

    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = false;
        showNote('message', "Speech Recognition is Initialized");
    } else {
        alert('Speech Recognition API is not supported in this browser.');
        return;
    }

    recognition.addEventListener('result', (event) => {
        const speechResult = event.results[event.resultIndex][0].transcript.trim();
        const capturedText = `You said: "${speechResult}"`;
        recognizedTextLabel.textContent = capturedText;
        const accuracy = processVoiceCommand(speechResult);
        
        if (accuracy && accuracy >= 0) {
            updateSoundBars(accuracy);
        }
    });

    recognition.onend = () => { 
        if (recognitionActive) {
            startVoiceRecognition();
        }
    };
    recognition.onerror = function(event) {
        stopVoiceRecognition();
        showNote('error', 'Speech recognition error detected: ' + event.error ? event.error : 'unknown');
    };    

    startAudioVisuals();
}

function startVoiceRecognition() {
    recognition.start();
    
    enableRecognition();

    if (recognizedTextLabel) {
        recognizedTextLabel.textContent = "Listening";
    }
}

function enableRecognition() {
    recognitionActive = true;
    if (controlSpeechButton) {
        controlSpeechButton.classList.add('active-control');
        controlSpeechButton.classList.add('active');
    } else {
        showNote("error", "Element with ID 'speechContainer' not found in the DOM.");
    }
}

function stopVoiceRecognition() {
    recognition.stop();
    
    disableRecognition();

    if (recognizedTextLabel) {
        recognizedTextLabel.textContent = "Sleeping. Tap the Speech button to active speech purchases.";
    }
}

function disableRecognition() {
    recognitionActive = false;
    if (controlSpeechButton) {
       controlSpeechButton.classList.remove('active-control');
       controlSpeechButton.classList.remove('active');
    } else {
        showNote("error", "Element with ID 'controlSpeechButton' not found in the DOM.");
    }
}

function setDefaultCurrency() {
    selectedCurrency = { name: 'ZAR - South African Rand', symbol: 'R' };
    localStorage.setItem('currency', JSON.stringify(selectedCurrency));
    recognizedTextLabel.textContent = 'The currency is set to the default - Rand.';
    showNote('message', 'The currency is set to the default - Rand.');
}

function resetGame() {
    // localStorage.removeItem('username');
    localStorage.removeItem('balance');
    localStorage.removeItem('purchases');
    localStorage.removeItem('currency');
    localStorage.removeItem('initialDeposit');
    location.reload();
}

function resetLevel() {
    localStorage.removeItem('balance');
    localStorage.setItem('balance', initialDeposit.toFixed(2));
    localStorage.removeItem('purchases');
    location.reload();
}

function toggleMenuPopup() {
    if (dropdown_menu.style.display === 'none' || dropdown_menu.style.display === '') {
        dropdown_menu.style.display = 'block';
    } else {
        dropdown_menu.style.display = 'none';
    }
}

function processVoiceCommand(text) {
    recognizedTextLabel.textContent = text;
    if (text.toLowerCase() === 'stop listening') {
        stopVoiceRecognition();
        if (recognizedTextLabel) {
            recognizedTextLabel.textContent = "Sleeping. Tap the Speech button to active speech purchases.";
        }
        return 100; // a accuracy needed for stopping
    }
    
    const removeRegex = /(?<=\b(remove|delete|drop|cancel|discard|erase|eliminate|clear|take\sout)\s)(.*)/i;
    const removeMatch = text.match(removeRegex);
    
    if (removeMatch) {
        const item = removeMatch[2].trim();
        
        if (removeItemFromPurchaseList(item)) {
            recognizedTextLabel.textContent = `${item} removed`;
            
            loadPurchases();
        
            return 100;
        } else {
            recognizedTextLabel.textContent = `Item [${item}] is not found in purchases`;
            
            return 40; 
        }
    } 
    
    if (!text.match(/\bI\b/i)) {
        return 20;
    }

    const captureResult = extractVoicePurchaseDetails(text);
    showNote('message', `Item: ${captureResult.item}, Amount: ${captureResult.amount}, Currency: ${captureResult.currency}`);
    const nonNullCount = Object.values(captureResult).filter(value => value !== null).length;
    
    
    if (captureResult.currency !== selectedCurrencyName) {
        showNote('warning', 'Invalid currency. value: ' + captureResult.currency);
        
        return (nonNullCount + 1) * 20;
    } else if (nonNullCount < 3) {
        showNote('warning', `Missing information in your purchase. Item: ${captureResult.item}, Amount: ${captureResult.amount}, Currency: ${captureResult.currency}`);
        return (nonNullCount + 1) * 20;
    } else if (nonNullCount === 3) {
        
        const item = captureResult.item.replace(selectedCurrency.symbol, '');
        const amountText = captureResult.amount;
        let amount;

        if (/^\d/.test(amountText)) {
            amount = parseFloat(amountText.replace(/,/g, ''));
        } else {
            amount = wordsToNumbers(amountText.toLowerCase());
        }
        
        
        if (isNaN(amount)) {
            showNote('warning', 'Invalid amount. value: ' + amount);
            
            return 60; // Partial accuracy for invalid amount
        else if (amount <= balance) {
            balance -= amount;
            balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;
            localStorage.setItem('balance', balance.toFixed(2));
            addItemToPurchaseList(item, amount);
            
            showMantra();
        
            if (balance === 0) {  
                handleZeroBalance(); // Move to next level
            }
        
            return 100;
        }

    }

    showNote('warning', 'Insufficient balance');
    return 20;
    
}

function isNumber(value) {
    return !isNaN(Number(value));
}
function handleZeroBalance() {
    console.log('Balance is 0. Proceeding to next level.');
    showNote('message', 'Level completed. Doubling your balance...');
    
    localStorage.removeItem('purchases');
    
    doubleBalanceAndProceed();
    
    purchaseList.innerHTML = '';
}

function addItemToPurchaseList(item, amount) {
    if ((!amount || amount <= 0)) {
        showNote('warning', "Invalid item amount.");
        return false;
    }
    if (!item) {
        showNote('warning', "Invalid item name.");
        return false;
    }
    
    const li = document.createElement('li');
    li.textContent = `${capFirstLetter(item)} - ${selectedCurrency.symbol}${amount.toFixed(2)}`;
    const removeButton = document.createElement('button');
    removeButton.classList.add('btn-remove');
    removeButton.textContent = "x";
    removeButton.addEventListener('click', () => {
        removePurchase(item, amount);
        
        
        loadPurchases();
    });
    li.appendChild(removeButton);
    purchaseList.appendChild(li);
    const lastItem = purchaseList.lastElementChild;
    if (lastItem) {
        lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    savePurchasesToLocalStorage();
    
    return true
}
function isItemInPurchaseList(itemToFind, amountToFind) {
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    const index = purchases.findIndex(
        (element) => element.item === itemToFind && element.amount === amountToFind
    );
    
    // If index is not found, return false
    if (index === -1) {
        return false;
    } 
    
    return true;
}

function removeItemFromPurchaseList(itemToRemove) {
    // Retrieve the current list of purchases from localStorage
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    
    // Find the index of the item to remove
    const index = purchases.findIndex((element) => element.item.toLowerCase() === itemToRemove.toLowerCase());
    
    // If the item is found (index is not -1), remove it from the array
    if (index !== -1) {
        purchases.splice(index, 1);
        
        // Update localStorage with the new list
        localStorage.setItem('purchases', JSON.stringify(purchases));
        
        return true; // Indicate that the item was removed
    }
    
    return false; // Indicate that the item was not found
}

function loadPurchases() {
    purchaseList.innerHTML = '';
    
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    let tally = 0;
    purchases.forEach(purchase => {
        tally += purchase.amount;
        addItemToPurchaseList(purchase.item, purchase.amount);
    });
    
    total_purchases.textContent = `Total Purchases: ${selectedCurrency.symbol}${tally.toFixed(2)}`;
}

function savePurchasesToLocalStorage() {
    let purchases = [];
    
    let tally = 0;
    // Read each item from the purchase list
    purchaseList.querySelectorAll('li').forEach(li => {
        // Get the item and amount from the text content
        const itemText = li.textContent.replace("Remove", "").trim();
        const [item, amountText] = itemText.split(` - ${selectedCurrency.symbol}`);
        const amount = parseFloat(amountText);
        tally += amount;
        // Add the item and amount to the purchases array
        purchases.push({ item: item.trim(), amount: amount });
    });

    total_purchases.textContent = `Total Purchases: ${selectedCurrency.symbol}${tally.toFixed(2)}`;
    // Save the purchases array to local storage
    localStorage.setItem('purchases', JSON.stringify(purchases));
}

function removePurchase(itemToRemove, amountToRemove) { [];
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    if (purchases.length > 0) {
        const index = purchases.findIndex(
            (element) => element.item.toLowerCase() === itemToRemove.toLowerCase() && element.amount === amountToRemove
        );
        
        // If index is not found, return false
        if (index === -1) {
            recognizedTextLabel.textContent = `The item to remove was not found in the purchase list. Item: ${itemToRemove} Amount: ${amountToRemove}`;
            return false;
        }
        
        // Remove the item from the purchases
        purchases.splice(index, 1);
        
        localStorage.setItem('purchases', JSON.stringify(purchases));
        balance += amountToRemove;
        balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;
        localStorage.setItem('balance', balance.toFixed(2));
        recognizedTextLabel.textContent = `Item ${itemToRemove} removed.`;
        
        return true;
    } else {
        recognizedTextLabel.textContent = `${itemToRemove} was not removed. Purchase list is empty.`;
    }
    
    return false;
}

function doubleBalanceAndProceed() {
    initialDeposit *= 2;
    balance = initialDeposit;
    balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;
    
    recognizedTextLabel.textContent = `Congratulations! Your balance has doubled to ${selectedCurrency.symbol}${balance.toFixed(2)}.`;
    
    localStorage.setItem('balance', balance.toFixed(2));
    localStorage.setItem('initialDeposit', initialDeposit.toFixed(2));
}
  
window.removeItem = function (button) {
    console.log('window.removeItem = function (button) {');
    const li = button.parentElement;
    const item = li.querySelector('input').value;
    const amount = parseFloat(li.querySelector('button').previousSibling.textContent.replace('R', '').trim());

    purchaseList.removeChild(li);

    // Update local storage
    balance += amount;
    balanceAmount.textContent = balance.toFixed(2);
    localStorage.setItem('balance', balance.toFixed(2));
};

function wordsToNumbers(words) {
    const numberMap = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
        "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
        "hundred": 100, "thousand": 1000, "million": 1000000, "billion": 1000000000, "trillion": 1000000000000
    };

    let result = 0;
    let current = 0;

    words.split(/\s+/).forEach(word => {
        if (numberMap[word] !== undefined) {
            current += numberMap[word];
        } else if (word === "hundred" && current !== 0) {
            current *= numberMap[word];
        } else if (numberMap[word]) {
            current = numberMap[word];
        } else {
            result += current;
            current = 0;
        }
    });

    result += current;
    console.log('currency name: ' + result);
    return result;
}

// startAutomationTest();

function startAutomationTest() {
    processVoiceCommand('I give away 20 dollars');
    processVoiceCommand('I give 20 dollars away.');
    processVoiceCommand('I give 20 dollars away.');
    const items = [
        { name: 'Apple', price: 10 },
        { name: 'Act', price: 10 },
        { name: 'Orange', price: 15 },
        { name: 'Bread', price: 20 },
        { name: 'Milk', price: 25 },
        { name: 'Cheese', price: 30 }
    ];
    
    let itemIndex = 0;
    const intervalId = setInterval(() => {
        if (itemIndex < items.length) {
            const item = items[itemIndex];
            if (balance >= item.price) {
                balance -= item.price;
                balanceAmount.textContent = balance.toFixed(2);
                console.log('I buy ' + item.name + ' for '+ item.price + ' ' + selectedCurrencyName);
                processVoiceCommand('I buy ' + item.name + ' for '+ item.price + ' ' + selectedCurrencyName);
            } else {
                recognizedTextLabel.textContent = `Insufficient balance to purchase "${item.name}".`;
                clearInterval(intervalId);
            }
            itemIndex++;
        } else {
            itemIndex = 0;
        }
    }, 3000);
}

function toggleAboutCommandsLessMore() {
    var hiddenItems = document.querySelectorAll('.voice-commands-hidden');
    var toggleLink = document.getElementById('toggle-link');
    
   hiddenItems.forEach(function(item) {
        item.style.display = (item.style.display === 'none' || item.style.display === '') ? 'list-item' : 'none';
    });
    
    // Change the text of the link
    if (toggleLink.textContent === 'Show more') {
        toggleLink.textContent = 'Show less';
    } else {
        toggleLink.textContent = 'Show more';
    }
}

function promptRepeatPhrase() {
    return new Promise((resolve) => {
        // Create a prompt asking the user to accept or decline
        const userResponse = confirm("Would you like to repeat the phrase 'I appreciate the money coming to me from multiple sources' 10 times for an added bonus?");
        
        if (!userResponse) {
            resolve(false);
            return;
        }

        // Start listening for the phrase
        repeatCount = 0;
        function handlePhraseDetected(text) {
            if (text.includes("I appreciate the money coming to me from multiple sources")) {
                repeatCount++;
                console.log(`Phrase repeated ${repeatCount} times`);
                showNote('message', `Phrase repeated ${repeatCount} times`);
                
                if (repeatCount >= targetRepeatMantraCount) {
                    resolve(true);
                }
            }
        }

        // Override the processVoiceCommand function to include our logic
        function customProcessVoiceCommand(text) {
            console.log('text: ' + text);
            showNote('message', text);
            processVoiceCommand(text); // Call existing logic
            
            // Handle the repetition of the phrase
            handlePhraseDetected(text);
        }
        
        // Override the processVoiceCommand function
        window.processVoiceCommand = customProcessVoiceCommand;
    });
}

function simulateVoiceCommand(commandText) {
    console.log('Simulated Command: ' + commandText);
    showNote('message', commandText);
    processVoiceCommand(commandText);
}

function isCurrencyObject(obj) {
    return obj && typeof obj === 'object' && obj.hasOwnProperty('name') && obj.hasOwnProperty('symbol');
}

function getLastWord(str) {
    if (typeof str !== 'string' || str.trim().length === 0) {
        return null; // or handle the case where the input is not a valid string
    }
    const words = str.trim().split(/\s+/); // Split by one or more spaces
    return words[words.length - 1];
}

function updateSoundBars(accuracy) {
    const soundBars = document.querySelectorAll('.sound-bar');

    if (soundBars.length === 0) {
        showNote('warning', 'No sound bars found');
        return;
    }
    
    try {
        if (accuracy <= 0) {
            
            soundBars.forEach((bar, index) => {
                bar.style.opacity = 0.3;
            });
        } else if (accuracy >- 20 && accuracy < 40 ) {
            soundBars.forEach((bar, index) => {
                bar.style.opacity = 0.4;
            });
        } else if (accuracy >= 40 && accuracy < 60 ) {
            soundBars.forEach((bar, index) => {
                bar.style.opacity = 0.5;
            });
        } else if (accuracy >= 60 && accuracy < 80 ) {
            soundBars.forEach((bar, index) => {
                bar.style.opacity = 0.6;
            });
        } else if (accuracy >= 80 && accuracy <= 1000 ) {
            soundBars.forEach((bar, index) => {
                bar.style.opacity = 1;
            });
        } else {
            showNote('warning', 'no if condition for accurancy value');
        }
    } catch (ex) {
        showNote('warning', 'Accuracy exception.');
    }    
}


// Function to handle active item styling
function setActiveItem(clickedItem) {
    // Remove active class from all items
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to the clicked item
    clickedItem.classList.add('active');
}


function onCloseContent(event, feature) {
    event.stopPropagation(); // Prevents triggering parent click event
    const content = event.currentTarget.closest('.item-content');
    if (content && content.classList.contains('active')) {
        content.classList.remove('active');
        if (feature === 'Voice Command Purchases') {
            stopVoiceRecognition();
        }
    }
}

function toggleContent(event, feature) {
    event.stopPropagation(); 
    const item = event.currentTarget;
    const content = item.querySelector('.item-content');
    
    if (content) {
        if (!content.classList.contains('active')) {            
            content.classList.add('active');
        }
    }

    if (feature === 'Voice Command Purchases' && !isVoiceInit) {
        initVCPurchases();
        if (!starting_balance) {
            starting_balance = document.querySelector('#starting_balance');
            balanceAmount = document.getElementById('balanceAmount');
            total_purchases = document.getElementById('total_purchases');
            purchaseList = document.getElementById('purchaseList');
    
            const theme = localStorage.getItem('theme');
            const storedUsername = localStorage.getItem('username');
            initialDeposit = parseFloat(localStorage.getItem('initialDeposit'));
            
            if (storedUsername) {
                displayName = storedUsername;
            }
                
            const storedBalance = parseFloat(localStorage.getItem('balance'));
            const storedCurrency = JSON.parse(localStorage.getItem('currency'));
    
            if (isCurrencyObject(storedCurrency)) {
                selectedCurrency = storedCurrency;
                selectedCurrencyName = getLastWord(selectedCurrency.name);
                showNote('message', `Your currency is ${selectedCurrencyName}`);
            } else {
                alert(JSON.stringify(storedCurrency));
                setDefaultCurrency();
            }
    
            starting_balance.textContent = `Initial Balance: ${selectedCurrency.symbol}${parseFloat(initialDeposit)}`;
            balance = storedBalance;
            balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;        
            
            loadPurchases();
        }
        startAudioVisuals();
        isVoiceInit = true;
    }

    if (feature === '3D Shops') {
        if (!isShopsInit) {
            init3DScene(); 
            isShopsInit = true;
        }
    }
}

/*********************** Spending Tips ******************************/

function openSavingsChallenge() {
    alert("Join our 30-day savings challenge and see how much you can save!");
    // Add logic to redirect to the savings challenge section
}

function analyzeSpendingHabits() {
    alert("Analyzing your spending habits... Stay tuned for insights!");
    // Add logic to open an analysis tool or display insights
}
