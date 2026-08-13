// update live tab count
chrome.tabs.query({ currentWindow: true }, (tabs) => {
  document.getElementById('tab-count-text').textContent = `${tabs.length} tabs live`;
});

// close all tabs in the current window and open a new blank tab
document.getElementById('close-session').addEventListener('click', close_session);

function close_session(){
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.remove(tabs[i].id);
        }
        chrome.tabs.create({});
    });
}

// render the saved sessions list with Play/Delete buttons
function render_sessions(){
    chrome.storage.local.get(["saved_sessions"], (result) => {
        const sessions = result.saved_sessions || {};
        const list = document.getElementById("session-list");

        list.innerHTML = Object.keys(sessions).map(name => `
            <div class="session-card" data-session-name="${name}">
                <div class="session-card-info">
                    <span class="session-name">${name}</span>
                    <span class="session-meta">${sessions[name].length} tabs</span>
                </div>
                <div class="session-actions">
                    <button class="session-button session-resume" type="button">Resume</button>
                    <button class="session-button session-delete" type="button">Delete</button>
                </div>
            </div>
        `).join('');
    });
}

// play/delete clicks for sessions
const sessionList = document.getElementById('session-list');
sessionList.addEventListener('click', (event) => {
    const card = event.target.closest('.session-card');
    if (!card) return;

    const sessionName = card.dataset.sessionName;
    if (event.target.closest('.session-resume')) {
        playSession(sessionName);
        return;
    }

    if (event.target.closest('.session-delete')) {
        deleteSession(sessionName);
        return;
    }
});

function playSession(name){
    chrome.storage.local.get(["saved_sessions"], (result) => {
        const sessions = result.saved_sessions || {};
        const urls = sessions[name] || [];
        if (!urls.length) {
            alert('Saved session not found.');
            return;
        }

        urls.forEach((url, index) => {
            chrome.tabs.create({ url, active: index === 0 });
        });
    });
}

function deleteSession(name){
    chrome.storage.local.get(["saved_sessions"], (result) => {
        const current_sessions = result.saved_sessions || {};
        if (!(name in current_sessions)) return;

        delete current_sessions[name];
        chrome.storage.local.set({ saved_sessions: current_sessions }, () => {
            render_sessions();
        });
    });
}

render_sessions();
