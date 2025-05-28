
const apiUrl = '/api';

let attackSession = {
    startTime: null,
    attacksLaunched: 0,
    vulnerabilitiesExploited: 0,
    results: [],
    isRunning: false
};

function startAIHack() {
    const target = document.getElementById('hackTarget').value.trim();
    const targetType = document.getElementById('targetType').value;
    const attackType = document.getElementById('attackType').value;

    if (!target) {
        alert('يرجى إدخال الهدف المراد اختراقه');
        return;
    }

    // Reset session
    attackSession = {
        startTime: new Date(),
        attacksLaunched: 0,
        vulnerabilitiesExploited: 0,
        results: [],
        isRunning: true
    };

    // Show stats and output
    document.getElementById('attackStats').style.display = 'grid';
    document.getElementById('hackOutput').style.display = 'block';
    
    const output = document.getElementById('hackOutput');
    output.innerHTML = '🚀 بدء عملية الاختراق الذكي...\n';
    output.innerHTML += `🎯 الهدف: ${target}\n`;
    output.innerHTML += `📋 نوع الهدف: ${getTargetTypeText(targetType)}\n`;
    output.innerHTML += `⚔️ نوع الهجوم: ${getAttackTypeText(attackType)}\n`;
    output.innerHTML += '================================\n\n';

    // Send to AI hacker
    fetch(`${apiUrl}/ai-hack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, targetType, attackType })
    })
    .then(response => response.json())
    .then(data => {
        output.innerHTML += `🤖 الذكاء الاصطناعي: ${data.message}\n`;
        output.innerHTML += `🧠 الاستراتيجية المختارة: ${data.strategy}\n\n`;
        startAttackTimer();
    })
    .catch(error => {
        console.error('❌ خطأ:', error);
        output.innerHTML += '❌ حدث خطأ أثناء بدء عملية الاختراق\n';
    });
}

function generatePayloads() {
    const target = document.getElementById('hackTarget').value.trim();
    const targetType = document.getElementById('targetType').value;
    const attackType = document.getElementById('attackType').value;

    if (!target) {
        alert('يرجى إدخال الهدف أولاً');
        return;
    }

    document.getElementById('payloadSection').style.display = 'block';
    
    fetch(`${apiUrl}/generate-payloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, targetType, attackType })
    })
    .then(response => response.json())
    .then(data => {
        displayPayloads(data.payloads);
    })
    .catch(error => {
        console.error('خطأ في إنشاء الحمولات:', error);
    });
}

function displayPayloads(payloads) {
    const container = document.getElementById('generatedPayloads');
    container.innerHTML = '';

    if (payloads && payloads.length > 0) {
        payloads.forEach((payload, index) => {
            const payloadDiv = document.createElement('div');
            payloadDiv.style.cssText = 'background: #000; border: 1px solid #ff4444; padding: 15px; margin: 10px 0; border-radius: 5px;';
            payloadDiv.innerHTML = `
                <h4 style="color: #ff0000;">🧨 حمولة ${index + 1}: ${payload.type}</h4>
                <pre style="color: #00ff00; font-family: monospace;">${payload.code}</pre>
                <button onclick="copyToClipboard('${payload.code.replace(/'/g, "\\'")}')">📋 نسخ</button>
                <button onclick="executePayload('${payload.code.replace(/'/g, "\\'")}')">⚡ تنفيذ</button>
            `;
            container.appendChild(payloadDiv);
        });
    } else {
        container.innerHTML = '<p style="color: #ff6600;">لم يتم إنشاء أي حمولات</p>';
    }
}

function executePayload(payload) {
    if (!confirm('هل أنت متأكد من تنفيذ هذه الحمولة؟')) {
        return;
    }

    const output = document.getElementById('hackOutput');
    output.innerHTML += `\n⚡ تنفيذ الحمولة: ${payload}\n`;
    
    fetch(`${apiUrl}/execute-payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
    })
    .then(response => response.json())
    .then(data => {
        output.innerHTML += `📊 نتيجة التنفيذ: ${data.result}\n`;
        if (data.success) {
            attackSession.vulnerabilitiesExploited++;
            updateStats();
        }
    })
    .catch(error => {
        output.innerHTML += `❌ خطأ في التنفيذ: ${error.message}\n`;
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ الحمولة إلى الحافظة');
    });
}

function startAttackTimer() {
    const timer = setInterval(() => {
        if (!attackSession.isRunning) {
            clearInterval(timer);
            return;
        }
        
        updateStats();
        
        // Simulate attack progress
        if (Math.random() > 0.7) {
            attackSession.attacksLaunched++;
            const output = document.getElementById('hackOutput');
            output.innerHTML += generateRandomAttackResult() + '\n';
            output.scrollTop = output.scrollHeight;
        }
    }, 2000);
}

function generateRandomAttackResult() {
    const results = [
        '🔍 فحص البورت 22: مفتوح - SSH متاح',
        '💉 اختبار SQL Injection على parameter id',
        '🕷️ فحص XSS في form البحث',
        '🔒 محاولة brute force على صفحة الإدارة',
        '📡 استطلاع DNS للحصول على subdomains',
        '🌐 فحص HTTP headers للأمان',
        '⚡ تجربة payload للثغرة CVE-2023-12345',
        '🎯 استهداف خدمة FTP على البورت 21',
        '🔐 محاولة تجاوز authentication',
        '📂 البحث عن ملفات backup مكشوفة'
    ];
    
    const statuses = ['✅ نجح', '❌ فشل', '⚠️ جزئي'];
    const result = results[Math.floor(Math.random() * results.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    if (status === '✅ نجح') {
        attackSession.vulnerabilitiesExploited++;
    }
    
    return `${result} - ${status}`;
}

function updateStats() {
    document.getElementById('attacksLaunched').textContent = attackSession.attacksLaunched;
    document.getElementById('vulnerabilitiesExploited').textContent = attackSession.vulnerabilitiesExploited;
    
    const successRate = attackSession.attacksLaunched > 0 ? 
        Math.round((attackSession.vulnerabilitiesExploited / attackSession.attacksLaunched) * 100) : 0;
    document.getElementById('successRate').textContent = successRate + '%';
    
    if (attackSession.startTime) {
        const elapsed = new Date() - attackSession.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        document.getElementById('timeElapsed').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function clearResults() {
    document.getElementById('hackOutput').innerHTML = '';
    document.getElementById('hackOutput').style.display = 'none';
    document.getElementById('attackStats').style.display = 'none';
    document.getElementById('payloadSection').style.display = 'none';
    attackSession.isRunning = false;
}

function exportHackReport() {
    const target = document.getElementById('hackTarget').value.trim();
    const output = document.getElementById('hackOutput').textContent;
    
    const report = `
YUSR-TEC - تقرير الاختراق الذكي
===============================

الهدف: ${target}
التاريخ: ${new Date().toLocaleString('ar-SA')}
الهجمات المطلقة: ${attackSession.attacksLaunched}
الثغرات المستغلة: ${attackSession.vulnerabilitiesExploited}
معدل النجاح: ${document.getElementById('successRate').textContent}

تفاصيل العملية:
================
${output}

تحذير: هذا التقرير للأغراض التعليمية والاختبار الأمني فقط
`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hack-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getTargetTypeText(type) {
    const types = {
        'network': 'شبكة/خادم',
        'webapp': 'تطبيق ويب',
        'domain': 'دومين',
        'api': 'API',
        'mobile': 'تطبيق جوال',
        'iot': 'جهاز IoT'
    };
    return types[type] || type;
}

function getAttackTypeText(type) {
    const types = {
        'auto': 'تلقائي',
        'reconnaissance': 'استطلاع',
        'vulnerability-scan': 'فحص الثغرات',
        'exploit': 'استغلال',
        'post-exploit': 'ما بعد الاستغلال',
        'social-engineering': 'هندسة اجتماعية',
        'dos': 'إنكار الخدمة',
        'mitm': 'هجوم الوسط',
        'privilege-escalation': 'تصعيد الصلاحيات'
    };
    return types[type] || type;
}
