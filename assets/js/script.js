let balance = 0;
let recognitionActive = false;
let initialDeposit = 0;
let selectedCurrency = {};
let selectedCurrencyName = 'Rand';
let displayName = '';
let currentPurchase = '';
let recognition;
let repeatCount = 0;
const targetRepeatMantraCount = 10;

let resetGameLink;
let resetLevelLink;

let loginScreen;
let loginButton;

let gameScreen;
let starting_balance;
let total_purchases;
let balanceAmount;      
let purchaseList;

let dropdown_content;
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('doc loaded');
    resetGameLink = document.getElementById('resetGame');
    resetLevelLink = document.getElementById('resetLevel');
    
    loginScreen = document.getElementById('loginScreen');
    loginButton = document.getElementById('loginButton');
    
    gameScreen = document.getElementById('gameScreen');
    
    recognizedTextLabel = document.getElementById('recognizedText');
    languageSelect = document.getElementById('language');
    themeSelect = document.getElementById('theme');

    dropdown_content = document.getElementById('dropdown_content');
    btn_menu = document.getElementById('btn_menu');
    aboutLink = document.getElementById('aboutLink');
    aboutPopup = document.getElementById('aboutPopup');
    popupClose = document.getElementById('closePopup');
    soundBars = document.querySelectorAll('.sound-bar');
    
    registerEventListeners();
    
    const theme = localStorage.getItem('theme');
    const storedUsername = localStorage.getItem('username');
    initialDeposit = parseFloat(localStorage.getItem('initialDeposit'));
    
    if (popupClose  !== 'undefined') {
        popupClose.addEventListener('click', () => {
            aboutPopup.style.display = 'none';
        });
    }

    window.onclick = (event) => {
        if (event.target === aboutPopup) {
            aboutPopup.style.display = 'none';
        }
        if (!btn_menu.contains(event.target) && !dropdown_content.contains(event.target)) {
            dropdown_content.style.display = 'none';
        }
    };

    if (storedUsername && !isNaN(initialDeposit)) {
        loginScreen.style.display = 'none';
        gameScreen.style.display = 'block';

        // gsap.timeline()
        // .to('.step-1', { duration: 1.5, opacity: 1, y: -50, delay: 0.5 })
        // .to('.step-2', { duration: 1.5, opacity: 1, y: -50, delay: 2 })
        // .to('.step-3', { duration: 1.5, opacity: 1, y: -50, delay: 2 })
        // .to('.step-4', { duration: 1.5, opacity: 1, y: -50, delay: 2 });
    } else {
        loginScreen.style.display = 'block';
        gameScreen.style.display = 'none';
    }
});

function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      /*search for elements with a certain atrribute:*/
      file = elmnt.getAttribute("w3-include-html");
      if (file) {
        /* Make an HTTP request using the attribute value as the file name: */
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
            /* Remove the attribute, and call this function once more: */
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
        /* Exit the function: */
        return;
      }
    }
}
function registerEventListeners() {
    if (controlSpeechButton) {
        controlSpeechButton.addEventListener('click', () => {
            console.log('controlSpeechButton was clicked');
            if (recognitionActive) {
                stopVoiceRecognition();                
            } else {
                startVoiceRecognition();
            }
        });
    }
    
    languageSelect.addEventListener('change', () => {
        recognitionLang = languageSelect.value;
        recognition.lang = recognitionLang;
        if (recognitionActive) {
            stopVoiceRecognition();
            recognition.onend = () => { 
                startVoiceRecognition();
            };
        }
    });
    themeSelect.addEventListener('change', () => {
        setTheme(themeSelect.value);
    });

    loginButton.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        initialDeposit = parseFloat(document.getElementById('initialDeposit').value);
        
        const currencyInput = document.getElementById('currency');
        const selectedCurrencySymbol = currencyInput.value;
        console.log('selectedCurrencySymbol: ' + selectedCurrencySymbol);
        let selectedCurrencyObj = null;
        
        const datalistOptions = document.querySelectorAll('#currencies option');
        console.log(JSON.stringify(datalistOptions));
        
        datalistOptions.forEach(option => {
            if (option.value === selectedCurrencySymbol) {
                const currencyName = option.textContent.split(' - ')[1];
                selectedCurrencyObj = {
                    name: currencyName,
                    symbol: selectedCurrencySymbol
                };
                console.log('selectedCurrencyText: ' + option.textContent);
            }
        });
    
        if (selectedCurrencyObj) {
            localStorage.setItem('currency', JSON.stringify(selectedCurrencyObj));
            selectedCurrency = selectedCurrencyObj;
            console.log('selectedCurrency is saved to storage: ' + JSON.stringify(selectedCurrency));
        } else {
            alert('Please select a valid currency.');
            return;
        }
    
        if (!initialDeposit || initialDeposit <= 0) {
            alert('You have to start with an initial balance.');
            return;
        }
    
        if (!username || isNaN(initialDeposit) || !selectedCurrency) {
            alert('Kindly fill in all fields to initialize the game.');
            return;
        }
    
        localStorage.setItem('username', username);
        localStorage.setItem('balance', initialDeposit.toFixed(2));
        localStorage.setItem('initialDeposit', initialDeposit.toFixed(2));        
        localStorage.setItem('purchases', JSON.stringify([]));

        loginScreen.style.display = 'none';
        gameScreen.style.display = 'block';
    });

    
    resetGameLink.addEventListener('click', () => {
        resetGame();
    });
    resetLevelLink.addEventListener('click', () => {
        resetLevel();
    });
    
    aboutLink.addEventListener('click', () => {
        dropdown_content.style.display = 'none';
        aboutPopup.style.display = 'block';
    });

    btn_menu.addEventListener('click', () => {
        toggleMenuPopup();
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
    console.log('Command text: ' + text);
    
    let itemRegex = /(?:I (?:buy|purchase|get|pay for|pay|acquire|order|spent))\s+(?:(?:\d+(?:,\d{3})*(?:\.\d{2})?\s+(?:R|Rand|USD|Dollar|Euro|Pound))\s+of\s+)?(?:a |an |the |that |at |[ ])?(.*?)(?:(?:\s+for)?\s+\d+(?:,\d{3})*(?:\.\d{2})?\s+(?:R|Rand|USD|Dollar|Euro|Pound))?/i;

    const amountRegex = /\b(\d+(?:,\d{3})*(?:\.\d{2})?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b/i;

    if (itemRegex) {
        const itemBeforeAmountRegex = /(?:I\s(?:buy|purchase|get|pay\sfor|pay|acquire|order|spent|obtain|grab|pick\sup|snag|give\saway|remove|delete|drop|cancel|discard|erase|eliminate|clear|take\sout))\s+(?:a|an|the|that|at|[ ])?(.*?)(?:\sfor|\swith|\sat)?\s+\d+(?:,\d{3})*(?:\.\d{2})?\s+(?:R|Rand|USD|Dollar|Euro|Pound|¥|₹|CHF|AUD|CAD|Franc|Yen|Rupee|Rand|ZAR|South\sAfrican\sRand)?/i;

        const itemAfterAmountRegex = /(?:I\s(?:buy|purchase|get|pay\sfor|pay|acquire|order|spent|obtain|grab|pick\sup|snag|give\saway|remove|delete|drop|cancel|discard|erase|eliminate|clear|take\sout))\s+\d+(?:,\d{3})*(?:\.\d{2})?\s+(?:R|Rand|USD|Dollar|Euro|Pound|¥|₹|CHF|AUD|CAD|Franc|Yen|Rupee|Rand|ZAR|South\sAfrican\sRand)\s+of\s+(.*)/i;

        if (itemAfterAmountRegex) {
            itemRegex = itemAfterAmountRegex;
        }
        if (itemBeforeAmountRegex) {
            itemRegex = itemBeforeAmountRegex;
        }
    }
    const currencyRegex = /\b(R|Rand|USD|Dollar|US\sDollar|CAD|Canadian\sDollar|AUD|Australian\sDollar|EUR|Euro|GBP|British\sPound|Pound|JPY|Japanese\sYen|Yen|CHF|Swiss\sFranc|Franc|CNY|Chinese\sYuan|Yuan|₹|INR|Indian\sRupee|Rupee)\b/i;

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
        // Add the selected theme class
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
    } catch (ex) {
        showNote('warning', 'Theme set exception: ' + ex.message + ' theme=' + theme);
    }
}

function initSpeechRecognition() {
    if (controlSpeechButton !== null) {
        controlSpeechButton = document.getElementById('controlSpeechButton');        
        SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    } else {
        console.log('Oops! there is no reference');
    }

    if (!SpeechRecognition) {
        alert('Speech Recognition API is not supported in this browser.');
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
    
    startVoiceRecognition();
}

function startVoiceRecognition() {
    recognitionActive = true;
    recognition.start();

    if (recognizedTextLabel) {
        recognizedTextLabel.textContent = "Listening";
    }
    if (controlSpeechButton) {
        controlSpeechButton.classList.add('active-control');
    } else {
        showNote("error", "Element with ID 'speechContainer' not found in the DOM.");
    }
}

function stopVoiceRecognition() {
    recognitionActive = false;
    recognition.stop();

    if (recognizedTextLabel) {
        recognizedTextLabel.textContent = "Sleeping";
    }
    
    if (controlSpeechButton) {
       controlSpeechButton.classList.remove('active-control');
    } else {
        showNote("error", "Element with ID 'controlSpeechButton' not found in the DOM.");
    }
}

function setDefaultCurrency() {
    selectedCurrency = { name: 'ZAR - South African Rand', symbol: 'R' };
    localStorage.setItem('currency', JSON.stringify(selectedCurrency));
    recognizedTextLabel.textContent = 'The currency is set to the default - Rand.';
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
    if (dropdown_content.style.display === 'none' || dropdown_content.style.display === '') {
        dropdown_content.style.display = 'block';
    } else {
        dropdown_content.style.display = 'none';
    }
}

function processVoiceCommand(text) {
    if (text.toLowerCase() === 'stop listening') {
        stopVoiceRecognition();
        recognizedTextLabel.textContent = "Sleeping";
        return 100; // No accuracy needed for stopping
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
    // showNote('message', `Item: ${captureResult.item}, Amount: ${captureResult.amount}, Currency: ${captureResult.currency}`);
    const nonNullCount = Object.values(captureResult).filter(value => value !== null).length;
    console.log('nonNullCount: ' + nonNullCount);
    if (captureResult.currency !== selectedCurrencyName) {
        // showNote('warning', 'Invalid currency. value: ' + captureResult.currency);
        
        return (nonNullCount + 1) * 20;
    } else if (nonNullCount < 3) {
        showNote('warning', `Missing information in your purchase. Item: ${captureResult.item}, Amount: ${captureResult.amount}, Currency: ${captureResult.currency}`);
        return (nonNullCount + 1) * 20;
    } else if (nonNullCount === 3) {
        console.log('nonNullCount === 3');
        const item = captureResult.item.replace(selectedCurrency.symbol, '');
        const amountText = captureResult.amount;
        let amount;

        if (/^\d/.test(amountText)) {
            amount = parseFloat(amountText.replace(/,/g, ''));
        } else {
            amount = wordsToNumbers(amountText.toLowerCase());
        }
        console.log('amount: ' + amount);
        if (isNaN(amount)) {
            console.log('Invalid amount');
            showNote('warning', 'Invalid amount. value: ' + amount);
            
            return 60; // Partial accuracy for invalid amount
        } else if (amount <= balance) {
            console.log('should be purchase..');
            if (!isItemInPurchaseList(item, amount)) {
                balance -= amount;
                balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;
                localStorage.setItem('balance', balance.toFixed(2));
                addItemToPurchaseList(item, amount);
                return 100; // Full accuracy for valid purchase
            } else {
                console.log('guess not');
                recognizedTextLabel.textContent = `This item is already purchased. ${captureResult.item}, Amount: ${captureResult.amount}, Currency: ${captureResult.currency}`;
            }
        }
    }
    showNote('warning', 'Insufficient balance');
    console.log('Insufficient balance');
    return 20;
    
}

function isNumber(value) {
    return !isNaN(Number(value));
}
function handleZeroBalance() {
    console.log('balance is less than 0. balance: ' + balance);
    // controlSpeechButton.classList.remove('active-control');
    
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
    balanceAmount.textContent = balance.toFixed(2);
    recognizedTextLabel.textContent = `Congratulations! You have completed this level. Your balance has been doubled to ${selectedCurrency.symbol}${balance.toFixed(2)} for the next level.`;
    localStorage.setItem('balance', balance.toFixed(2));
    localStorage.setItem('initialDeposit', initialDeposit.toFixed(2));
    
    
    // setTimeout(() => {
    //     promptRepeatPhrase().then((success) => {
    //         if (success) {
    //             initialDeposit *= 1.5;
    //             balance = initialDeposit;
    //             balanceAmount.textContent = balance.toFixed(2);
    //             localStorage.setItem('balance', balance.toFixed(2));
    //             localStorage.setItem('initialDeposit', initialDeposit.toFixed(2));     
    //             recognizedTextLabel.textContent = `Well done! Your balance has increased to ${selectedCurrency.symbol}${balance.toFixed(2)} for the next level.`;
    //         } else {
    //             console.log("The operation was declined.");
    //         }
    //     });} , 3000);
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
                
                if (repeatCount >= targetRepeatMantraCount) {
                    resolve(true);
                }
            }
        }

        // Override the processVoiceCommand function to include our logic
        function customProcessVoiceCommand(text) {
            console.log('text: ' + text);
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
        if (accuracy >= 0 && accuracy < 0 ) {
            soundBars[0].style.opacity = 1;
            soundBars[1].style.opacity = 0;
            soundBars[2].style.opacity = 0;
            soundBars[3].style.opacity = 0;
            soundBars[4].style.opacity = 0;
        } else if (accuracy >- 20 && accuracy < 40 ) {
            soundBars[0].style.opacity = 1;
            soundBars[1].style.opacity = 1;
            soundBars[2].style.opacity = 0;
            soundBars[3].style.opacity = 0;
            soundBars[4].style.opacity = 0;
        } else if (accuracy >= 40 && accuracy < 60 ) {
            soundBars[0].style.opacity = 1;
            soundBars[1].style.opacity = 1;
            soundBars[2].style.opacity = 1;
            soundBars[3].style.opacity = 0;
            soundBars[4].style.opacity = 0;
            soundBars[5].style.opacity = 0;
        } else if (accuracy >= 60 && accuracy < 80 ) {
            soundBars[0].style.opacity = 1;
            soundBars[1].style.opacity = 1;
            soundBars[2].style.opacity = 1;
            soundBars[3].style.opacity = 1;
            soundBars[4].style.opacity = 0;
        } else if (accuracy >= 80 && accuracy < 1000 ) {
            soundBars[0].style.opacity = 1;
            soundBars[1].style.opacity = 1;
            soundBars[2].style.opacity = 1;
            soundBars[3].style.opacity = 1;
            soundBars[4].style.opacity = 1;
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


function toggleContent(event, feature) {
    const item = event.currentTarget;
    if (item.classList.contains('active')) {
        return;
    }


    const content = item.querySelector('.item-content');

    item.classList.add('active');
    content.style.display = "block";

    if (feature === 'Voice Command Purchases') {
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
        } else {
            alert(JSON.stringify(storedCurrency));
            setDefaultCurrency();
        }

        starting_balance.textContent = `Initial Balance: ${selectedCurrency.symbol}${parseFloat(initialDeposit)}`;
        balance = storedBalance;
        balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;        
        
        loadPurchases();
        
        initSpeechRecognition();
    }

    if (feature === '3D Sphere') {
        init3DSphere(); // Initialize the 3D sphere when opened
    }
}

let scene, camera, renderer, sphere, controls;


function init3DSphere() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, 300);
    document.getElementById('earth-container').appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00aaff, // Blue color for simplicity
        wireframe: true  // Use wireframe to see the structure
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // OrbitControls to enable zoom and rotation
    controls = new THREE.OrbitControls(camera, renderer.domElement);    

    // Adjust the zoom and rotation limits
    controls.enableZoom = true;
    controls.enableDamping = true;  // Smooth damping (inertia)
    controls.dampingFactor = 0.25;  // Controls the inertia effect
    controls.minDistance = 1;       // Minimum zoom (close to the sphere)
    controls.maxDistance = 10;      // Maximum zoom (far from the sphere)
    controls.enablePan = false;     // Disable panning to focus on rotation
    controls.touches = {
        ONE: THREE.TOUCH.ROTATE,    // One-finger rotates the sphere
        TWO: THREE.TOUCH.DOLLY_ROTATE // Two-finger zooms and rotates
    };

    // Position the camera initially
    camera.position.z = 3;

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Update controls to allow rotation and zoom
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
});


