function refresh() {
    chrome.storage.local.get(['happiness', 'totalWater', 'totalLiters', 'notifsEnabled'], (data) => {
        const h = (data.happiness === undefined) ? 30 : data.happiness;
        document.getElementById('q-count').innerText = h;

   
        const totalWaterML = data.totalWater || 0;
        const totalLitersVal = data.totalLiters || 0;

 
        document.getElementById('w-count').innerText = `${totalWaterML} mL`;
        
    
        document.getElementById('w-count2').innerText = `${totalLitersVal} L`;

      
        document.getElementById('notif-switch').checked = data.notifsEnabled !== false;

     
        const char = document.getElementById('character');
        const cont = document.getElementById('container');

        let stateNum = 0;
        if (h <= 0) stateNum = 50;
        else if (h <= 5) stateNum = 40;
        else if (h <= 10) stateNum = 30;
        else if (h <= 15) stateNum = 20;
        else if (h <= 25) stateNum = 10;
        else stateNum = 0;

        char.className = 'state-' + stateNum;

        console.log(`Happiness: ${h} | Applying: state-${stateNum}`);

        if (h <= 0) {
            cont.classList.add('dead');
            cont.classList.remove('alive');
        } else {
            cont.classList.add('alive');
            cont.classList.remove('dead');
        }
    });
}

refresh();

chrome.storage.onChanged.addListener((changes, namespace) => {
    refresh();
});

document.getElementById('notif-switch').onchange = (e) => {
    chrome.storage.local.set({ notifsEnabled: e.target.checked });
};