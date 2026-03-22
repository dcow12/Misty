// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "QUERY_SENT") {
        handleQueryWithCooldown();
    }
});

async function handleQueryWithCooldown() {
    // 1. Get the last time a query was successful
    let data = await chrome.storage.local.get(['lastQueryTime']);
    let now = Date.now();
    let cooldownPeriod = 5000; // 5 seconds

    // 2. Check if 5 seconds have passed
    if (data.lastQueryTime && (now - data.lastQueryTime < cooldownPeriod)) {
        console.log("Cooldown active. Seconds left: " + ((cooldownPeriod - (now - data.lastQueryTime)) / 1000));
        return; // EXIT - Too soon!
    }

    // 3. If we passed the check, save the new time and update stats
    await chrome.storage.local.set({ lastQueryTime: now });
    updateStats();
}

async function updateStats() {
    let data = await chrome.storage.local.get([
        'happiness',
        'totalWater',
        'totalLiters',  
        'lastReset',
        'notifsEnabled'
    ]);
    
    let happiness = (data.happiness === undefined) ? 30 : data.happiness;
    let totalWater = data.totalWater || 0;
    let totalLiters = data.totalLiters || 0; 
    let lastReset = data.lastReset || Date.now();
    let notifsEnabled = data.notifsEnabled !== undefined ? data.notifsEnabled : true;

    // 24 hour reset
    if (Date.now() - lastReset > 24 * 60 * 60 * 1000) {
        happiness = 30;
        lastReset = Date.now();
    }

    if (happiness > 0) {
        happiness--;
        const waterIncrement = 30; 
        totalWater += waterIncrement;
    }
    if (happiness < 30 && happiness % 2 === 0) {
        totalLiters += 1;
    }

    // Milestones
    if (happiness < 30 && happiness % 10 === 0) {
        if (notifsEnabled) {
            sendAlert(happiness);
        }
    }

    await chrome.storage.local.set({ 
        happiness, 
        totalWater, 
        totalLiters, 
        lastReset 
    });

    updateIcon(happiness);
}

function updateIcon(h) {
    let img = "droplet0.png"; 
    if (h <= 0) img = "droplet50.png";
    else if (h <= 5) img = "droplet40.png";
    else if (h <= 10) img = "droplet30.png";
    else if (h <= 20) img = "droplet20.png";
    else if (h <= 25) img = "droplet10.png";
    chrome.action.setIcon({ path: img });
}

function sendAlert(h) {
    console.log("Attempting to send notification for happiness:", h);
    
    let msg = `Happiness is dropping! Only ${h} left...`;
    if (h <= 0) msg = "Misty has dried up completely.";


    const notifId = "droplet_" + Date.now();

    chrome.notifications.create(notifId, {
        type: 'basic',
        iconUrl: 'chromeicon.png', 
        title: 'Misty Status',
        message: msg,
        priority: 2, 
        silent: false
    }, (id) => {
        if (chrome.runtime.lastError) {
            console.error("Notification Error:", chrome.runtime.lastError);
        } else {
            console.log("Notification sent successfully with ID:", id);
        }
    });
}