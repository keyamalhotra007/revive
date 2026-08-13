chrome.tabs.query({ currentWindow: true }, (tabs) => {
  document.getElementById('tab-count-text').textContent = `${tabs.length} tabs live`;
});


// save tabs
function create_session(){
    document.getElementById("create").addEventListener("click", () => {
        const session_name = document.getElementById("session-name").value.trim();

        if(!session_name){
            alert("Please enter a name for your session");
            return;
        }


        chrome.tabs.query({currentWindow: true}, (tabs) => {
            const urls = tabs.map(tab => tab.url);
            
            chrome.storage.local.get(["saved_sessions"], (result) => {
                const current_sessions = result.saved_sessions || {};

                if(session_name in current_sessions){
                    alert("A session with this name already exists");
                    return;
                }
                current_sessions[session_name] = urls;

                chrome.storage.local.set({ saved_sessions: current_sessions }, () => {
                    document.getElementById("session-name").value = "";
                    render_sessions(); // call this after saving
                });
            });
        });
    });
}

function render_sessions(){
    chrome.storage.local.get(["saved_sessions"], (result) => {
        const sessions = result.saved_sessions || {};
        const list = document.getElementById("session-list");

        list.innerHTML = Object.keys(sessions).map(name => `
            <div class="session-card">
                <span class="session-name">${name}</span>
                <span class="session-meta">${sessions[name].length} tabs</span>
            </div>
        `).join('');
    });
}


function replace_session(){
    // Attach one click listener to the list container so we can handle newly rendered cards.
    const list = document.getElementById("session-list");

    list.addEventListener("click", (event) => {
        const card = event.target.closest(".session-card");
        if (!card) return; // ignore clicks outside a session card

        // Get the session name from the clicked card's child span.
        const session_name = card.querySelector(".session-name").textContent.trim();

        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            const urls = tabs.map(tab => tab.url);

            chrome.storage.local.get(["saved_sessions"], (result) => {
                const current_sessions = result.saved_sessions || {};

                // Replace the selected session with the current tab URLs.
                current_sessions[session_name] = urls;

                chrome.storage.local.set({ saved_sessions: current_sessions }, () => {
                    render_sessions();
                });
            });
        });
    });
}


create_session();
render_sessions();
replace_session();