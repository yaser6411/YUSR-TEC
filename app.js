const apiUrl = '/api';

function runCommand() {
    const tool = document.getElementById('tool').value.trim();
    const command = document.getElementById('command').value.trim();

    if (!tool || !command) {
        alert('يرجى تعبئة كل الحقول');
        return;
    }

    fetch(`${apiUrl}/run-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, command })
    })
    .then(response => response.json())
    .then(data => {
        alert('✅ تم تسجيل الأمر بنجاح');
        loadLogs();
    })
    .catch(error => {
        console.error('❌ خطأ:', error);
        alert('حدث خطأ أثناء إرسال الأمر');
    });
}

function loadLogs() {
    fetch(`${apiUrl}/commands`)
        .then(response => response.json())
        .then(data => {
            const logs = document.getElementById('logs');
            logs.innerHTML = '';

            data.forEach(entry => {
                const div = document.createElement('div');
                div.innerHTML = `<strong>🛠️ أداة:</strong> ${entry.tool} <br> <strong>💬 أمر:</strong> ${entry.command} <br> <strong>🕒 وقت:</strong> ${entry.timestamp}<hr>`;
                logs.appendChild(div);
            });
        });
}

// تحميل السجل تلقائي عند الفتح
window.onload = loadLogs;
