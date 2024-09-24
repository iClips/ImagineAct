let balance = 0;
let recognitionActive = false;
let initialDeposit = 0;
let selectedCurrency = '';
let selectedCurrencyName = 'Rand';
let displayName = '';
let currentPurchase = '';
    
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
    document.body.classList.remove('dark-theme', 'light-theme', 'retro-theme');
    // Add the selected theme class
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
}

document.addEventListener('DOMContentLoaded', () => {
    const elemResetGame = document.getElementById('resetGame');
    const elemResetLevel = document.getElementById('resetLevel');
    
    const loginScreen = document.getElementById('loginScreen');
    const loginButton = document.getElementById('loginButton');
    
    const gameScreen = document.getElementById('gameScreen');
    const starting_balance = document.getElementById('starting_balance');
    const total_purchases = document.getElementById('total_purchases');
    const balanceAmount = document.getElementById('balanceAmount');
    const purchaseList = document.getElementById('purchaseList');
    
    const dropdown_content = document.getElementById('dropdown_content');
    const btn_menu = document.getElementById('btn_menu');
    const aboutLink = document.getElementById('aboutLink');
    const aboutPopup = document.getElementById('aboutPopup');
    const popupClose = document.querySelector('.popup-close');
    const soundBars = document.querySelectorAll('.sound-bar');
    
    const controlSpeechButton = document.getElementById('controlSpeechButton');
    const recognizedTextLabel = document.getElementById('recognizedText');
    const languageSelect = document.getElementById('language');
    const themeSelect = document.getElementById('theme');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.log('Speech Recognition API is not supported in this browser.');
        alert('Speech Recognition API is not supported in this browser.');
        return;
    }
    controlSpeechButton.addEventListener('click', () => {
        if (recognitionActive) {
            stopVoiceRecognition();
            recognizedTextLabel.textContent = "Sleeping";
        } else {
            startVoiceRecognition();
            recognizedTextLabel.textContent = "Listening";
        }
    });
    
    let recognition;
    
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = true;
    } else {
        recognizedTextLabel.textContent = `Unable to Continue!! Yo, it looks like the browser does not support Speech Recognition.`;
    }
    function initSpeechRecognition() {
        recognition.addEventListener('result', (event) => {
            const speechResult = event.results[event.resultIndex][0].transcript.trim();
            recognizedTextLabel.textContent = `You said: "${speechResult}"`;
            
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
        recognizedTextLabel.textContent = "Listening";
    }
    
    function startVoiceRecognition() {
        recognitionActive = true;
        recognition.start();
        controlSpeechButton.classList.add('active-control');
    }
    function stopVoiceRecognition() {
        recognitionActive = false;
        recognition.stop();
        controlSpeechButton.classList.remove('active-control');
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
    
    initializeGame();
    
    function initializeGame() {
        const theme = localStorage.getItem('theme');
        if (theme) {
            setTheme(theme);
            themeSelect.value = theme;
        }
    
        const storedUsername = localStorage.getItem('username');
        initialDeposit = parseFloat(localStorage.getItem('initialDeposit'));
        
        if (storedUsername && !isNaN(initialDeposit)) {
            displayName = storedUsername;
            
            const storedBalance = parseFloat(localStorage.getItem('balance'));
            const storedCurrency = JSON.parse(localStorage.getItem('currency'));
    
            if (isCurrencyObject(storedCurrency)) {
                selectedCurrency = storedCurrency;
                selectedCurrencyName = getLastWord(selectedCurrency.name);
                console.log('selectedCurrencyName: ' + selectedCurrencyName);
            } else {
                console.log('storedCurrency is not an object.');
                alert(JSON.stringify(storedCurrency));
                setDefaultCurrency();
            }
    
            starting_balance.textContent = `Initial Balance: ${selectedCurrency.symbol}${parseFloat(initialDeposit)}`;
            balance = storedBalance;
            balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;
            loadPurchases();
    
            loginScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            
            initSpeechRecognition();
        } else {
            loginScreen.style.display = 'block';
            gameScreen.style.display = 'none';
        }
    }

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
        balance = initialDeposit;
        
        balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;
        starting_balance.textContent = `Initial Balance: ${selectedCurrency.symbol}${parseFloat(initialDeposit)}`;
        
        loginScreen.style.display = 'none';
        gameScreen.style.display = 'block';
    });

    
    function setDefaultCurrency() {
        selectedCurrency = { name: 'ZAR - South African Rand', symbol: 'R' };
        localStorage.setItem('currency', JSON.stringify(selectedCurrency));
        recognizedTextLabel.textContent = 'The currency is set to the default - Rand.';
    }
    
    // Handle reset game
    elemResetGame.addEventListener('click', () => {
        resetGame();
    });
    function resetGame() {
        // localStorage.removeItem('username');
        localStorage.removeItem('balance');
        localStorage.removeItem('purchases');
        localStorage.removeItem('currency');
        localStorage.removeItem('initialDeposit');
        location.reload();
    }
    // Handle reset level
    elemResetLevel.addEventListener('click', () => {
        resetLevel();
    });
    function resetLevel() {
        localStorage.removeItem('balance');
        localStorage.setItem('balance', initialDeposit.toFixed(2));
        localStorage.removeItem('purchases');
        location.reload();
    }
    
    
    aboutLink.addEventListener('click', () => {
        dropdown_content.style.display = 'none';
        aboutPopup.style.display = 'block';
    });
    btn_menu.addEventListener('click', () => {
        toggleMenuPopup();
    });
    function toggleMenuPopup() {
        if (dropdown_content.style.display === 'none' || dropdown_content.style.display === '') {
            dropdown_content.style.display = 'block';
        } else {
            dropdown_content.style.display = 'none';
        }
    }
    
    popupClose.addEventListener('click', () => {
        aboutPopup.style.display = 'none';
    });

    window.onclick = (event) => {
        if (event.target === aboutPopup) {
            aboutPopup.style.display = 'none';
        }
        if (!btn_menu.contains(event.target) && !dropdown_content.contains(event.target)) {
            dropdown_content.style.display = 'none';
        }
    };
    
    
    
    
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
                recognizedTextLabel.textContent = `Item ${item} is not found in purchases`;
                
                return 40; 
            }
        } 
        
        if (!text.match(/\bI\b/i)) {
            recognizedTextLabel.textContent = `Purchase Command must start with "I"`;
            return 20;
        }
    
        const captureResult = extractDetails(text);
        // showNote('message', `Item: ${captureResult.item}, Amount: ${captureResult.amount}, Currency: ${captureResult.currency}`);
        const nonNullCount = Object.values(captureResult).filter(value => value !== null).length;
        
        if (captureResult.currency !== selectedCurrencyName) {
            // showNote('warning', 'Invalid currency. value: ' + captureResult.currency);
            
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
                console.log('Invalid amount');
                showNote('warning', 'Invalid amount. value: ' + amount);
                
                return 60; // Partial accuracy for invalid amount
            } else if (amount <= balance) {
                if (!isItemInPurchaseList(item, amount)) {
                    balance -= amount;
                    balanceAmount.textContent = `${selectedCurrency.symbol}${balance.toFixed(2)}`;
                    localStorage.setItem('balance', balance.toFixed(2));
                    addItemToPurchaseList(item, amount);
                    return 100; // Full accuracy for valid purchase
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
            balance += amount;
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

});

function toggleCommands() {
    var hiddenItems = document.querySelectorAll('.voice-commands-hidden');
    var toggleLink = document.getElementById('toggle-link');
    
    // Toggle display of hidden items
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

let repeatCount = 0;
const targetCount = 10;

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
                
                if (repeatCount >= targetCount) {
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

/**
    * Shows a notification message
    * @param {string} type - The type of notification ('error', 'warning', or 'message')
    * @param {string} message - The message to display
    */
function showNote(type, message) {
    // Validate the type
    const validTypes = ['error', 'warning', 'message'];
    if (!validTypes.includes(type)) {
        console.error('Invalid notification type.');
        showNote('error', 'Invalid notification type.');
        return;
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <button onclick="this.parentElement.remove()">×</button>
        ${message}
    `;

    // Add the notification to the container
    const notificationContainer = document.getElementById('error-container');
    notificationContainer.appendChild(notification);

    // Slide down by adding the 'show' class
    setTimeout(() => {
        notification.classList.add('show');
    }, 10); // Slight delay to trigger the transition

    // Auto-hide the notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show'); // Slide up by removing the 'show' class
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 500); // Wait for the slide-up animation to complete
    }, 5000);
}

function extractDetails(text) {
    // 
    const itemRegex = /(?:I buy|I purchase|I get|I pay for|I pay |I acquire|I order)\s+(?:a |an |the |that |at |[ ])?(?:\d+\s+)?([a-zA-Z0-9-_\s]+?)(?=\sfor|\s\d+)/i;
    const amountRegex = /\b(\d+(?:,\d{3})*(?:\.\d{2})?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b/i;
    const currencyRegex = /\b(R|Rand|USD|Dollar|Euro|Pound)\b/i; // You can extend this for more currencies

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