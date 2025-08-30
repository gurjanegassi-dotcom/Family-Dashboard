// ====================== DATA ==============================
let documents = JSON.parse(localStorage.getItem('documents')) || [];
let timelineLogs = JSON.parse(localStorage.getItem('timelineLogs')) || [];

// ====================== ELEMENTS ==============================
const documentListElement = document.getElementById('document-list');
const addDocBtn = document.getElementById('addDocBtn');
const docInput = document.getElementById('docInput');
const timelineListElement = document.getElementById('timeline-list');
const addLogBtn = document.getElementById('addLogBtn');
const logInput = document.getElementById('logInput');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const fileInput = document.getElementById('fileInput');

// ====================== FUNCTIONS ===========================

// --- Document Functions ---
function saveDocuments() { localStorage.setItem('documents', JSON.stringify(documents)); }

function renderDocuments() {
    // NEW FEATURE: Sort documents to show "Pending" first.
    const statusOrder = { "Pending": 1, "Scanned": 2, "Submitted": 3 };
    documents.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    documentListElement.innerHTML = '';
    documents.forEach((doc, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="doc-name">${doc.name}</span>
            <div>
              <select class="status-select" data-index="${index}">
                  <option value="Pending" ${doc.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Submitted" ${doc.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                  <option value="Scanned" ${doc.status === 'Scanned' ? 'selected' : ''}>Scanned, Ready</option>
              </select>
              <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        documentListElement.appendChild(listItem);
    });
}

function handleAddDocument() {
    const newDocText = docInput.value.trim();
    if (newDocText === "") return;
    documents.push({ name: newDocText, status: 'Pending' });
    renderDocuments();
    saveDocuments();
    docInput.value = "";
}

function handleDocumentEvents(event) {
    const target = event.target;
    const index = target.dataset.index;
    if (target.classList.contains('status-select')) {
        documents[index].status = target.value;
        renderDocuments(); // Re-render to sort the list
        saveDocuments();
    }
    if (target.classList.contains('delete-btn')) {
        if (confirm(`Are you sure you want to delete "${documents[index].name}"?`)) {
            documents.splice(index, 1);
            renderDocuments();
            saveDocuments();
        }
    }
}

// --- Timeline Log Functions ---
function saveLogs() { localStorage.setItem('timelineLogs', JSON.stringify(timelineLogs)); }

function renderLogs() {
    timelineListElement.innerHTML = '';
    timelineLogs.forEach((log, index) => {
        const listItem = document.createElement('li');
        const textSpan = document.createElement('span');
        textSpan.innerHTML = `<strong>${log.date}:</strong> ${log.text}`;
        textSpan.dataset.index = index; // Add index for editing
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.dataset.index = index;
        
        listItem.appendChild(textSpan);
        listItem.appendChild(deleteButton);
        timelineListElement.appendChild(listItem);
    });
}

function handleAddLog() {
    const newLogText = logInput.value.trim();
    if (newLogText === "") return;
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    timelineLogs.unshift({ date: dateString, text: newLogText });
    renderLogs();
    saveLogs();
    logInput.value = "";
}

// NEW FEATURE: Edit a log entry
function handleEditLog(event) {
    const target = event.target;
    // Check if the clicked element is the text part of the log
    if (target.tagName === 'SPAN' || target.tagName === 'STRONG') {
        const textSpan = target.closest('span');
        const index = textSpan.dataset.index;
        const currentText = timelineLogs[index].text;

        const newText = prompt("Edit your log entry:", currentText);

        if (newText !== null && newText.trim() !== "") {
            timelineLogs[index].text = newText.trim();
            renderLogs();
            saveLogs();
        }
    }
}

function handleDeleteLog(event) {
    if (event.target.classList.contains('delete-btn')) {
        const index = event.target.dataset.index;
        if (confirm('Are you sure you want to delete this log entry?')) {
            timelineLogs.splice(index, 1);
            renderLogs();
            saveLogs();
        }
    }
}

// --- Data Management Functions ---
// (These functions remain the same)
function handleSaveData() {
    const allData = { documents: documents, timelineLogs: timelineLogs };
    const dataString = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataString], {type: 'application/json'});
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `family_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`;
    downloadLink.click();
}

function handleLoadData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedData = JSON.parse(e.target.result);
            if (loadedData.documents && loadedData.timelineLogs) {
                documents = loadedData.documents;
                timelineLogs = loadedData.timelineLogs;
                renderDocuments();
                saveDocuments();
                renderLogs();
                saveLogs();
                alert('Data loaded successfully!');
            } else { alert('Invalid file format.'); }
        } catch (error) { alert('Error reading the file.'); }
    };
    reader.readAsText(file);
}

// ====================== EVENT LISTENERS ===========================
addDocBtn.addEventListener('click', handleAddDocument);
documentListElement.addEventListener('click', handleDocumentEvents);

addLogBtn.addEventListener('click', handleAddLog);
timelineListElement.addEventListener('click', function(event) {
    handleDeleteLog(event);
    handleEditLog(event);
});

saveBtn.addEventListener('click', handleSaveData);
loadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleLoadData);

// ====================== INITIALIZE THE PAGE ===========================
renderDocuments();
renderLogs();