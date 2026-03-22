
function notifyExtension() {
    console.log("Droplet: Triggering query count...");
    chrome.runtime.sendMessage({ type: "QUERY_SENT" });
}

window.addEventListener('keydown', (e) => {
 
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeElem = document.activeElement;
        const isInput = activeElem.tagName === 'TEXTAREA' || 
                        activeElem.tagName === 'INPUT' || 
                        activeElem.getAttribute('contenteditable') === 'true';

        if (isInput) {
            notifyExtension();
        }
    }
}, true);

window.addEventListener('click', (e) => {
    // detect clicking
    const isButton = e.target.closest('button');
    if (isButton) {
     
        const btnHtml = isButton.innerHTML.toLowerCase();
        const isSend = btnHtml.includes('send') || 
                       isButton.getAttribute('data-testid') === 'send-button' ||
                       isButton.getAttribute('aria-label')?.toLowerCase().includes('send');

        if (isSend) {
            notifyExtension();
        }
    }
});