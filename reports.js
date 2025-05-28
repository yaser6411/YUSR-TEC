
const apiUrl = '/api';

let allReports = [];
let filteredReports = [];

function loadReports() {
    fetch(`${apiUrl}/commands`)
        .then(response => response.json())
        .then(data => {
            allReports = data;
            filteredReports = data;
            displayReports(data);
            updateSummaryStats(data);
        })
        .catch(error => {
            console.error('❌ خطأ في تحميل التقارير:', error);
            alert('حدث خطأ أثناء تحميل التقارير');
        });
}

function displayReports(reports) {
    const container = document.getElementById('detailedReports');
    container.innerHTML = '';

    if (reports.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 40px;">لا توجد تقارير متاحة</div>';
        return;
    }

    reports.forEach(report => {
        const reportCard = createReportCard(report);
        container.appendChild(reportCard);
    });
}

function createReportCard(report) {
    const div = document.createElement('div');
    div.className = 'report-card';
    
    const status = getCommandStatus(report.output);
    const vulnerabilities = extractVulnerabilities(report.output);
    const severity = analyzeSeverity(report.output);
    
    div.innerHTML = `
        <div class="report-header">
            <div>
                <h3>🛠️ ${report.tool}</h3>
                <p style="margin: 5px 0; color: #aaa;">${report.command}</p>
            </div>
            <div>
                <span class="status-badge status-${status.type}">${status.text}</span>
                <div style="font-size: 12px; color: #aaa; margin-top: 5px;">${formatDate(report.timestamp)}</div>
            </div>
        </div>
        
        ${vulnerabilities.length > 0 ? `
            <div style="margin: 15px 0;">
                <h4 style="color: #ff6b6b;">⚠️ ثغرات مكتشفة (${vulnerabilities.length})</h4>
                <ul style="color: #ffaa00;">
                    ${vulnerabilities.map(vuln => `<li>${vuln}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${severity.level !== 'low' ? `
            <div style="margin: 15px 0; padding: 10px; background: ${severity.color}20; border-left: 4px solid ${severity.color};">
                <strong style="color: ${severity.color};">🚨 مستوى الخطورة: ${severity.text}</strong>
            </div>
        ` : ''}
        
        <div class="command-output">${report.output || 'لا توجد مخرجات'}</div>
        
        <div style="margin-top: 15px; text-align: left;">
            <button onclick="analyzeReport(${report.id})" style="background: #0099ff;">🔍 تحليل مفصل</button>
            <button onclick="exportSingleReport(${report.id})" style="background: #666;">📄 تصدير</button>
            <button onclick="deleteReport(${report.id})" style="background: #ff4444;">🗑️ حذف</button>
            ${report.tool === 'AI-Scanner' ? `<button onclick="generateExploit(${report.id})" style="background: #ff4444;">⚡ إنشاء استغلال</button>` : ''}
        </div>
    `;
    
    return div;
}

function getCommandStatus(output) {
    if (!output || output.includes('جارٍ التنفيذ')) {
        return { type: 'running', text: 'قيد التنفيذ' };
    } else if (output.includes('خطأ') || output.includes('فشل')) {
        return { type: 'error', text: 'خطأ' };
    } else {
        return { type: 'completed', text: 'مكتمل' };
    }
}

function extractVulnerabilities(output) {
    const vulnerabilities = [];
    const lines = output.split('\n');
    
    lines.forEach(line => {
        if (line.toLowerCase().includes('vulnerability') || 
            line.toLowerCase().includes('exploit') ||
            line.includes('ثغرة') ||
            line.toLowerCase().includes('open port') ||
            line.toLowerCase().includes('sql injection') ||
            line.toLowerCase().includes('xss')) {
            vulnerabilities.push(line.trim());
        }
    });
    
    return vulnerabilities;
}

function analyzeSeverity(output) {
    const criticalKeywords = ['critical', 'high', 'خطير', 'حرج'];
    const mediumKeywords = ['medium', 'moderate', 'متوسط'];
    
    const lowerOutput = output.toLowerCase();
    
    if (criticalKeywords.some(keyword => lowerOutput.includes(keyword))) {
        return { level: 'critical', text: 'حرج', color: '#ff4444' };
    } else if (mediumKeywords.some(keyword => lowerOutput.includes(keyword))) {
        return { level: 'medium', text: 'متوسط', color: '#ff9500' };
    } else {
        return { level: 'low', text: 'منخفض', color: '#00ffcc' };
    }
}

function updateSummaryStats(reports) {
    const totalScans = reports.length;
    const activeScans = reports.filter(r => getCommandStatus(r.output).type === 'running').length;
    
    let vulnerabilitiesFound = 0;
    let criticalIssues = 0;
    
    reports.forEach(report => {
        const vulns = extractVulnerabilities(report.output);
        vulnerabilitiesFound += vulns.length;
        
        const severity = analyzeSeverity(report.output);
        if (severity.level === 'critical') {
            criticalIssues++;
        }
    });
    
    document.getElementById('totalScans').textContent = totalScans;
    document.getElementById('activeScans').textContent = activeScans;
    document.getElementById('vulnerabilitiesFound').textContent = vulnerabilitiesFound;
    document.getElementById('criticalIssues').textContent = criticalIssues;
}

function filterReports() {
    const typeFilter = document.getElementById('filterType').value;
    const timeFilter = document.getElementById('filterTime').value;
    
    let filtered = allReports;
    
    // Filter by type
    if (typeFilter !== 'all') {
        filtered = filtered.filter(report => report.tool.includes(typeFilter));
    }
    
    // Filter by time
    if (timeFilter !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (timeFilter) {
            case 'today':
                filterDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
        }
        
        filtered = filtered.filter(report => new Date(report.timestamp) >= filterDate);
    }
    
    filteredReports = filtered;
    displayReports(filtered);
    updateSummaryStats(filtered);
}

function exportReports() {
    const data = filteredReports.map(report => ({
        الأداة: report.tool,
        الأمر: report.command,
        الوقت: report.timestamp,
        الحالة: getCommandStatus(report.output).text,
        الثغرات: extractVulnerabilities(report.output).length,
        المخرجات: report.output
    }));
    
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, 'yusr-tec-reports.csv', 'text/csv');
}

function exportSingleReport(id) {
    const report = allReports.find(r => r.id === id);
    if (!report) return;
    
    const reportText = `
YUSR-TEC - تقرير مفصل
=====================

الأداة: ${report.tool}
الأمر: ${report.command}
التاريخ: ${report.timestamp}
الحالة: ${getCommandStatus(report.output).text}

النتائج:
${report.output}

الثغرات المكتشفة:
${extractVulnerabilities(report.output).join('\n')}
    `;
    
    downloadFile(reportText, `report-${id}.txt`, 'text/plain');
}

function analyzeReport(id) {
    const report = allReports.find(r => r.id === id);
    if (!report) return;
    
    // Send for AI analysis
    fetch(`${apiUrl}/ai-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id, output: report.output })
    })
    .then(response => response.json())
    .then(data => {
        alert(`🤖 تحليل الذكاء الاصطناعي:\n${data.analysis || 'تم بدء التحليل'}`);
    })
    .catch(error => {
        console.error('خطأ في التحليل:', error);
        alert('حدث خطأ أثناء التحليل');
    });
}

function generateExploit(id) {
    const report = allReports.find(r => r.id === id);
    if (!report) return;
    
    fetch(`${apiUrl}/generate-exploit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id, vulnerabilities: extractVulnerabilities(report.output) })
    })
    .then(response => response.json())
    .then(data => {
        alert(`⚡ تم إنشاء استغلال للثغرات:\n${data.exploit || 'تم بدء عملية الإنشاء'}`);
    })
    .catch(error => {
        console.error('خطأ في إنشاء الاستغلال:', error);
        alert('حدث خطأ أثناء إنشاء الاستغلال');
    });
}

function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// تحميل التقارير عند فتح الصفحة
window.onload = loadReports;

function deleteReport(id) {
    if (!confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
        return;
    }

    fetch(`${apiUrl}/delete-report/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ تم حذف التقرير بنجاح');
            loadReports(); // Reload reports
        } else {
            alert('❌ فشل في حذف التقرير');
        }
    })
    .catch(error => {
        console.error('خطأ في حذف التقرير:', error);
        alert('حدث خطأ أثناء حذف التقرير');
    });
}

// تحديث تلقائي كل 30 ثانية
setInterval(loadReports, 30000);
