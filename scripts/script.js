document.addEventListener('DOMContentLoaded', () => {
    const addItemBtn = document.getElementById('add-item-btn');
    const itemForm = document.getElementById('item-form');
    const itemSearch = document.getElementById('item-search');
    const itemSuggestions = document.getElementById('item-suggestions');
    const addedItemsContainer = document.getElementById('added-items');
    const finalCommandPreview = document.getElementById('final-command-preview');
    const finalCommandPre = document.getElementById('final-command');
    const expandCommandBtn = document.getElementById('expand-command-btn');
    const copyCommandBtn = document.getElementById('copy-command-btn');
    const tabs = document.querySelectorAll('.tab-button');
    
    // Money Tab Elements
    const enableMoneyCheckbox = document.getElementById('enable-money');
    const moneyAmountInput = document.getElementById('money-amount');
    const moneyError = document.getElementById('money-error');
    
    // Friendship Tab Elements
    const friendshipList = document.getElementById('friendship-list');
    
    // Powers Tab Elements
    const powersList = document.getElementById('powers-list');
    
    let allItems = [];
    let allFriendships = [];
    let allPowers = [];
    let finalCommands = [];
    let formattedCommands

    fetch('allItems.json')
        .then(response => response.json())
        .then(data => {
            allItems = data;
        })
        .catch(error => console.error('Error loading items:', error));
    
    // Fetch all villagers from characters.json
    fetch('characters.json')
        .then(response => response.json())
        .then(data => {
            allFriendships = data;
            populateFriendships(); 
        })
        .catch(error => console.error('Error loading villagers:', error));
    
    // Function to populate the Friendship tab
    function populateFriendships() {
        allFriendships.forEach(villager => {
            const friendshipEntry = document.createElement('div');
            friendshipEntry.classList.add('villager-entry');
            
            friendshipEntry.innerHTML = `
                <img src="${villager.Img}" alt="${villager.Name}" class="preview-img">
                <span class="villager-name">${villager.Name}</span>
                <input class="heart-input" type="number" min="0" max="12" value="0" data-villager-name="${villager.Name}">
                <img src="images/Heart.png" alt="Heart" class="heart-img">
                <div class="villager-error error-message hidden">Enter a number between 0 and 12.</div>
            `;
            const heartInput = friendshipEntry.querySelector('.heart-input');
            const villagerError = friendshipEntry.querySelector('.villager-error');
            
            if (heartInput) {
                heartInput.addEventListener('input', () => {
                    const value = heartInput.value.trim();
                    if (isValidHeartAmount(value)) {
                        heartInput.classList.remove('invalid');
                        villagerError.classList.add('hidden');
                    } else {
                        heartInput.classList.add('invalid');
                        villagerError.classList.remove('hidden');
                    }
                    updateFinalCommand();
                });
            }
            
            friendshipList.appendChild(friendshipEntry);
        });
    }

    // Fetch all powers from powers.json
    fetch('powers.json')
        .then(response => response.json())
        .then(data => {
            allPowers = data;
            populatePowers();
        })
        .catch(error => console.error('Error loading powers:', error));

    // Function to populate the Powers tab
    function populatePowers() {
        allPowers.forEach(power => {
            const powerEntry = document.createElement('div');
            powerEntry.classList.add('power-entry');
            
            powerEntry.innerHTML = `
                <img src="${power.Img}" alt="${power.Name}" class="preview-img">
                <span class="power-name">${power.Name}</span>
                <label>
                    <input type="checkbox" class="power-checkbox" data-command="${power.Command}">
                    Enable
                </label>
            `;
            
            // Add event listener to the checkbox
            const powerCheckbox = powerEntry.querySelector('.power-checkbox');
            powerCheckbox.addEventListener('change', () => {
                updateFinalCommand();
            });
            
            powersList.appendChild(powerEntry);
        });
    }
    
    // Tab Switching Shit
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all 
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to active tab
            tab.classList.add('active');
            // Hide all
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            // Show the good 1
            const selectedTab = document.getElementById(tab.dataset.tab);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
        });
    });

    addItemBtn.addEventListener('click', () => {
        itemForm.classList.toggle('hidden');
        if (!itemForm.classList.contains('hidden')) {
            itemSearch.focus();
        }
    });
    
    // search
    itemSearch.addEventListener('input', handleSearch);
    
    function handleSearch() {
        const query = itemSearch.value.toLowerCase();
        itemSuggestions.innerHTML = '';
        if (query.length === 0) {
            return;
        }
        const matchedItems = allItems
            .filter(item => item.Name.toLowerCase().includes(query))
            .slice(0, 10); // top ten options
        matchedItems.forEach(item => {
            const suggestion = document.createElement('div');
            suggestion.classList.add('suggestion-item');
            
            // Bold matchs
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedName = item.Name.replace(regex, '<strong>$1</strong>');
            
            suggestion.innerHTML = `
                <img src="data:image/png;base64,${item.Image}" alt="${item.Name}">
                <span>${highlightedName}</span>
            `;
            suggestion.addEventListener('click', () => {
                addItemToList(item);
                itemForm.classList.add('hidden');
                itemSearch.value = '';
                itemSuggestions.innerHTML = '';
            });
            itemSuggestions.appendChild(suggestion);
        });
    }
    
    function enforceMaxQuantity(event) {
        const input = event.target;
        if (parseInt(input.value, 10) > 999) {
            input.value = 999;
        } else if (parseInt(input.value, 10) < 1) {
            input.value = 1;
        }
    }
    
    function addItemToList(item) {
        if (!item || !item.Image || !item.Name || !item.ID) {
            console.error('Invalid item object:', item);
            return;
        }
    
        const addedItem = document.createElement('div');
        addedItem.classList.add('added-item');
        addedItem.innerHTML = `
            <img src="data:image/png;base64,${item.Image}" alt="${item.Name}">
            <div class="details">
                <span>${item.Name}</span>
                <label>Amount:
                    <input class="qty-input" type="number" min="1" max="999" value="1">
                </label>
                <label>Quality:
                    <select class="quality-select">
                        <option value="0">Default</option>
                        <option value="1">Silver</option>
                        <option value="2">Gold</option>
                        <option value="3">Iridium</option>
                    </select>
                </label>
                <button class="remove-btn">Remove</button>
            </div>
        `;
    
        const qtyInput = addedItem.querySelector('.qty-input');
        const qualitySelect = addedItem.querySelector('.quality-select');
        const removeBtn = addedItem.querySelector('.remove-btn');
    
        // make sure that the elements exist
        if (qtyInput) {
            qtyInput.addEventListener('change', enforceMaxQuantity);
            qtyInput.addEventListener('change', updateFinalCommand);
        } else {
            console.error('Amount input not found!');
        }
    
        if (qualitySelect) {
            qualitySelect.addEventListener('change', updateFinalCommand);
        } else {
            console.error('Quality select not found!');
        }
    
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                addedItem.remove();
                updateFinalCommand();
            });
        } else {
            console.error('Remove button not found!');
        }
    
        addedItemsContainer.appendChild(addedItem);
        updateFinalCommand();
    }
    
    function updateFinalCommand() {
        finalCommands = [];
        
        // Process Shit
        const items = document.querySelectorAll('.added-item');
        items.forEach(item => {
            const itemNameElement = item.querySelector('.details span');
            const qtyInput = item.querySelector('.qty-input');
            const qualitySelect = item.querySelector('.quality-select');
    
            if (!itemNameElement || !qtyInput || !qualitySelect) {
                console.error('Missing elements in added-item:', item);
                return;
            }
    
            const itemName = itemNameElement.textContent;
            const id = getItemIdByName(itemName);
            let qty = parseInt(qtyInput.value, 10);
            const quality = parseInt(qualitySelect.value, 10);
    
            // check quantity limits
            if (isNaN(qty) || qty < 1) {
                qty = 1;
                qtyInput.value = qty;
            } else if (qty > 999) {
                qty = 999;
                qtyInput.value = qty;
            }
    
            if (id !== null) {
                finalCommands.push(`#$action AddItem ${id} ${qty} ${quality}`);
            }
        });
        
        // Process Money
        if (enableMoneyCheckbox && enableMoneyCheckbox.checked) {
            const moneyValue = moneyAmountInput.value.trim();
            if (isValidNumber(moneyValue)) {
                const moneyAmount = parseInt(moneyValue, 10);
                finalCommands.push(`#$action AddMoney ${moneyAmount}`);
                moneyError.classList.add('hidden');
            } else {
                moneyError.classList.remove('hidden');
            }
        }
        
        // Process Friendship
        const friendshipEntries = document.querySelectorAll('.friendship-list .villager-entry');
        friendshipEntries.forEach(entry => {
            const heartInput = entry.querySelector('.heart-input');
            const villagerName = heartInput.getAttribute('data-villager-name');
            const heartValue = heartInput.value.trim();
            const villagerError = entry.querySelector('.villager-error');
    
            if (isValidHeartAmount(heartValue)) {
                const heartAmount = parseInt(heartValue, 10);
                if (heartAmount > 0) {
                    const friendshipPoints = 250 * heartAmount;
                    finalCommands.push(`#$action AddFriendshipPoints ${villagerName} ${friendshipPoints}`);
                }
                villagerError.classList.add('hidden');
            } else {
                // Show error message
                if (heartValue !== '') {
                    villagerError.classList.remove('hidden');
                } else {
                    villagerError.classList.add('hidden');
                }
            }
        });
        
        // Process Powers
        const powerCheckboxes = powersList.querySelectorAll('.power-checkbox');
        powerCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const command = checkbox.getAttribute('data-command');
                finalCommands.push(command);
            }
        });
        
        // Combine all commands into a single string
        const combinedCommands = finalCommands.join('\n');
    
        // Use splitId() function to format the commands
        formattedCommands = splitId(combinedCommands);
    
        if (formattedCommands.trim() === '') {
            finalCommandPre.textContent = "# Commands will appear here...";
        } else {
            finalCommandPre.textContent = formattedCommands;
        }
    
        manageCommandPreview();
    }
    
    function getItemIdByName(name) {
        const found = allItems.find(item => item.Name === name);
        return found ? found.ID : null;
    }
    
    // Money Tab Functionality
    if (enableMoneyCheckbox && moneyAmountInput) {
        enableMoneyCheckbox.addEventListener('change', () => {
            if (enableMoneyCheckbox.checked) {
                moneyAmountInput.disabled = false;
                moneyAmountInput.focus();
            } else {
                moneyAmountInput.disabled = true;
                moneyAmountInput.value = '0';
                moneyError.classList.add('hidden');
                updateFinalCommand();
            }
        });
    
        moneyAmountInput.addEventListener('input', () => {
            const moneyValue = moneyAmountInput.value.trim();
            if (moneyValue === '') {
                moneyError.classList.remove('hidden');
            } else if (isValidNumber(moneyValue)) {
                moneyError.classList.add('hidden');
            } else {
                moneyError.classList.remove('hidden');
            }
            updateFinalCommand();
        });
    }
    
    function isValidNumber(value) {
        const regex = /^\d+$/;
        return regex.test(value);
    }
    
    // Function to validate heart amount (0-12)
    function isValidHeartAmount(value) {
        const regex = /^(?:1[0-2]|0|[1-9])$/;
        return regex.test(value);
    }
    
    // Manage Final Command Preview and Expand Button
    function manageCommandPreview() {
        const maxPreviewLines = 5;
        const commandText = finalCommandPre.textContent;
        const commandLines = commandText.split('\n');
        
        if (commandLines.length > maxPreviewLines) {
            const previewText = commandLines.slice(0, maxPreviewLines).join('\n') + '\n...';
            finalCommandPre.textContent = previewText;
            expandCommandBtn.style.display = 'inline-block';
        } else {
            expandCommandBtn.style.display = 'none';
        }
    }
    
    expandCommandBtn.addEventListener('click', () => {
        if (finalCommandPreview.classList.contains('expanded')) {
            updateFinalCommand();
            expandCommandBtn.textContent = 'Expand';
            finalCommandPreview.classList.remove('expanded');
        } else {
            const fullCommands = finalCommands.join('\n');
            finalCommandPre.textContent = splitId(fullCommands);
            expandCommandBtn.textContent = 'Collapse';
            finalCommandPreview.classList.add('expanded');
        }
    });
    
    // Copy
    copyCommandBtn.addEventListener('click', () => {
        const commandsToCopy = formattedCommands;
        navigator.clipboard.writeText(commandsToCopy).then(() => {
            copyCommandBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyCommandBtn.textContent = 'Copy';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    });
});
