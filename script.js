
    // ====================== ዳታ (DATA) ==============================
    let documents = JSON.parse(localStorage.getItem('documents')) || [];
    let timelineLogs = JSON.parse(localStorage.getItem('timelineLogs')) || [];

    // =============== ናይ HTML ኤለመንትስ ምሓዝ (ELEMENTS) ===============
    const documentListElement = document.getElementById('document-list');
    const addDocBtn = document.getElementById('addDocBtn');
    const docInput = document.getElementById('docInput');
    
    const timelineListElement = document.getElementById('timeline-list');
    const addLogBtn = document.getElementById('addLogBtn');
    const logInput = document.getElementById('logInput');

    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');

    // ================ ተግባራት (FUNCTIONS) ===========================
    
    // --- ናይ ሰነዳት ተግባራት (Document Functions) ---
    function saveDocuments() { localStorage.setItem('documents', JSON.stringify(documents)); }

    function renderDocuments() {
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

    // --- ናይ ታይምላይን ተግባራት (Timeline Log Functions) ---
    function saveLogs() { localStorage.setItem('timelineLogs', JSON.stringify(timelineLogs)); }

    function renderLogs() {
        timelineListElement.innerHTML = '';
        timelineLogs.forEach((log, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span><strong>${log.date}:</strong> ${log.text}</span>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
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
    
    // --- ሓደስቲ ናይ ዳታ ምዕቃብ ተግባራት (NEW DATA MANAGEMENT FUNCTIONS) ---

    function handleSaveData() {
        // 1. ንኹሉ ዳታና ኣብ ሓደ ዓብዪ ነገር (object) ነጥርንፎ።
        const allData = {
            documents: documents,
            timelineLogs: timelineLogs
        };
        
        // 2. ነቲ ዳታ ናብ JSON ዝበሃል ናይ ጽሑፍ ቅርጺ ንቕይሮ።
        const dataString = JSON.stringify(allData, null, 2); // null, 2 ንጽፉፍ መልክዕ እዩ።
        
        // 3. ሓደ 'Blob' ንፈጥር፣ እዚ ከም ሓደ ናይ ኮምፕዩተር ፋይል እዩ።
        const blob = new Blob([dataString], {type: 'application/json'});
        
        // 4. ሓደ ዘይረአ ናይ ምውራድ ሊንክ ንፈጥር።
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `family_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`; // ንኣብነት፡ family_dashboard_backup_2024-12-25.json
        
        // 5. ነቲ ሊንክ ባዕልና ንጠውቖ እሞ ነቲ ፋይል ነውርዶ።
        downloadLink.click();
    }

    function handleLoadData(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 1. ነቲ ፋይል ከንብቦ ዝኽእል 'FileReader' ንፈጥር።
        const reader = new FileReader();
        
        // 2. እቲ ምንባብ ምስ ተወድአ እንታይ ክገብር ከም ዘለዎ ንነግሮ።
        reader.onload = function(e) {
            try {
                // 3. ነቲ ካብ ፋይል ዝተነበበ ጽሑፍ ናብ ሓቀኛ ዳታ ንቕይሮ።
                const loadedData = JSON.parse(e.target.result);
                
                // 4. ነቲ ናትና ዳታ በቲ ሓድሽ ንትክኦ።
                if (loadedData.documents && loadedData.timelineLogs) {
                    documents = loadedData.documents;
                    timelineLogs = loadedData.timelineLogs;
                    
                    // 5. ንኹሉ ነገር ሓዲሽና ነርኢ እሞ ኣብ መዘክር'ውን ነዕቅቦ።
                    renderDocuments();
                    saveDocuments();
                    renderLogs();
                    saveLogs();
                    
                    alert('Data loaded successfully!');
                } else {
                    alert('Invalid file format.');
                }
            } catch (error) {
                alert('Error reading the file. Make sure it is a valid backup file.');
            }
        };
        
        // 6. ነቲ ፋይል ከንብቦ ንእዝዞ።
        reader.readAsText(file);
    }


    // ============ EVENT LISTENERS ======================
    addDocBtn.addEventListener('click', handleAddDocument);
    documentListElement.addEventListener('click', handleDocumentEvents);
    
    addLogBtn.addEventListener('click', handleAddLog);
    timelineListElement.addEventListener('click', handleDeleteLog);

    saveBtn.addEventListener('click', handleSaveData);
    loadBtn.addEventListener('click', () => fileInput.click()); // ነታ 'Load' በተን ምስ ጠወቕናያ፡ ነታ ዝተሓብአት ናይ ፋይል ምርጫ ትኸፍት።
    fileInput.addEventListener('change', handleLoadData);

    // ============== ገጽ ምጅማር (INITIALIZE) =================
    renderDocuments();
    renderLogs();