const images = ['7.png', 'mango.jpg', 'cherry.webp', 'gyat.png', 'bell.webp', 'sks.webp', 'cat.jpg', 'chillguy.webp', 'gram.png', 'thosewhoknow.png'];
const initialCoins = 100;
let currentPage = 1;
const resultsPerPage = 5;
// Load coins from localStorage or set to initialCoins
let coins = localStorage.getItem('coins') ? parseInt(localStorage.getItem('coins')) : initialCoins;
document.getElementById('coinCount').innerText = coins;
// Open IndexedDB
let db;
const request = indexedDB.open('slotMachineDB', 1);
request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore('results', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('result', 'result', { unique: false });
};
request.onsuccess = (event) => {
    db = event.target.result;
    loadResults();
};
request.onerror = (event) => {
    console.error('Database error:', event.target.errorCode);
};
function startSlotAnimations(slotCount) {
    for (let i = 1; i <= slotCount; i++) {
        const slot = document.getElementById(`slot${i}`);
        slot.style.animation = 'continuousSpin 1s linear infinite';
    }
}
function stopSlotAnimations(slotCount) {
    for (let i = 1; i <= slotCount; i++) {
        const slot = document.getElementById(`slot${i}`);
        slot.style.animation = 'none';
    }
}
function createSlots(slotCount) {
    const slotsContainer = document.getElementById('slotsContainer');
    slotsContainer.innerHTML = '';
    for (let i = 1; i <= slotCount; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.id = `slot${i}`;
        slotsContainer.appendChild(slot);
    }
    if (slotCount === 3) {
        slotsContainer.classList.add('vertical');
    } else {
        slotsContainer.classList.remove('vertical');
    }
}

document.getElementById('rollButton').addEventListener('click', () => {
    const mode = document.getElementById('mode').value;
    const betAmount = mode === 'easy' ? 2 : 10;
    const slotCount = mode === 'easy' ? 3 : 6;
    if (coins >= betAmount) {
        coins -= betAmount;
        localStorage.setItem('coins', coins);
        document.getElementById('coinCount').innerText = coins;
        // Disable roll button
        document.getElementById('rollButton').disabled = true;
        // Play roll sound
        const rollSound = document.getElementById('rollSound');
        rollSound.play();
        // Start slot animations
        startSlotAnimations(slotCount);
        rollSound.addEventListener('ended', () => {
            // Stop slot animations 2 seconds after the roll sound ends
            setTimeout(() => {
                stopSlotAnimations(slotCount);
                let slots = [];
                for (let i = 1; i <= slotCount; i++) {
                    const slot = document.getElementById(`slot${i}`);
                    const randomImage = images[Math.floor(Math.random() * images.length)];
                    slots.push(randomImage);
                    setTimeout(() => {
                        slot.style.backgroundImage = `url(${randomImage})`;
                        slot.style.animation = 'spin 0.3s ease-in-out';
                    }, i * 500); // Show each slot result 1 second apart
                }
                setTimeout(() => {
                    // Check for matches
                    const messageElement = document.getElementById('message');
                    const lossMessageElement = document.getElementById('lossMessage');
                    messageElement.innerText = '';
                    lossMessageElement.innerText = '';
                    let result;
                    if (slots.every((val, i, arr) => val === arr[0])) {
                        coins += betAmount * 10; // Earn 10 times the bet amount if all slots match
                        messageElement.innerText = `You won ${betAmount * 10} coins!`;
                        document.getElementById('winSound').play();
                        result = `Won ${betAmount * 10} coins`;
                    } else if (slots.some((val, i, arr) => arr.filter(v => v === val).length > 1)) {
                        coins += betAmount * 2; // Earn 2 times the bet amount if at least two slots match
                        messageElement.innerText = `You won ${betAmount * 2} coins!`;
                        result = `Won ${betAmount * 2} coins`;
                    } else {
                        lossMessageElement.innerText = `You lost ${betAmount} coins!`;
                        result = `Lost ${betAmount} coins`;
                    }
                    localStorage.setItem('coins', coins);
                    document.getElementById('coinCount').innerText = coins;
                    // Save result to IndexedDB
                    const transaction = db.transaction(['results'], 'readwrite');
                    const objectStore = transaction.objectStore('results');
                    objectStore.add({ result: result, timestamp: new Date() });
                    transaction.oncomplete = () => {
                        loadResults();
                    };
                    // Enable roll button
                    document.getElementById('rollButton').disabled = false;
                }, slotCount * 1000 + 2000); // Wait for all slots to show their results
            }, 2000);
        });
    } else {
        alert('You do not have enough coins to place this bet!');
    }
});
document.getElementById('slot2').addEventListener('click', () => {
    coins += 200; // Add 200 coins to the total
    localStorage.setItem('coins', coins); // Save the updated coins in localStorage
    document.getElementById('coinCount').innerText = coins; // Update the displayed coin count
    // Optional: Display a success message
    const messageElement = document.getElementById('message');
    messageElement.innerText = 'You received 200 bonus coins!';
    setTimeout(() => {
        messageElement.innerText = ''; // Clear the message after 2 seconds
    }, 2000);
});
document.getElementById('resetButton').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset?')) {
        coins = initialCoins;
        localStorage.setItem('coins', coins);
        document.getElementById('coinCount').innerText = coins;
        document.getElementById('message').innerText = '';
        document.getElementById('lossMessage').innerText = '';
    }
});
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadResults();
    }
});
document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadResults();
});
document.getElementById('mode').addEventListener('change', (event) => {
    const mode = event.target.value;
    const slotCount = mode === 'easy' ? 3 : 6;
    createSlots(slotCount);
});
function loadResults() {
    const transaction = db.transaction(['results'], 'readonly');
    const objectStore = transaction.objectStore('results');
    const request = objectStore.getAll();
    request.onsuccess = (event) => {
        const results = event.target.result.sort((a, b) => b.timestamp - a.timestamp);
        const start = (currentPage - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        const paginatedResults = results.slice(start, end);
        const transcriptBody = document.getElementById('transcriptBody');
        transcriptBody.innerHTML = '';
        paginatedResults.forEach((result) => {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            const resultCell = document.createElement('td');
            timeCell.textContent = new Date(result.timestamp).toLocaleString();
            resultCell.textContent = result.result;
            row.appendChild(timeCell);
            row.appendChild(resultCell);
            transcriptBody.appendChild(row);
        });
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = end >= results.length;
    };
}
// Initialize slots for the default mode
createSlots(3);