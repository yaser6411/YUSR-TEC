
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

    // Generate attack vector analysis
    generateAttackVectorAnalysis(reports);

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
        
        ${getAttackDetailsSection(report)}
        
        <div style="margin-top: 15px; text-align: left;">
            <button onclick="analyzeReport(${report.id})" style="background: #0099ff;">🔍 تحليل مفصل</button>
            <button onclick="showAttackVector(${report.id})" style="background: #ff6600;">⚔️ أسلوب الهجوم</button>
            <button onclick="calculateDamage(${report.id})" style="background: #aa00aa;">💰 تقدير الضرر</button>
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

function getAttackDetailsSection(report) {
    const attackVector = analyzeAttackVector(report);
    if (!attackVector) return '';
    
    return `
        <div style="background: #001122; border: 1px solid #0066cc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="color: #0099ff;">⚔️ تفاصيل أسلوب الهجوم</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <strong>نوع الهجوم:</strong> ${attackVector.type}<br>
                    <strong>الأدوات المستخدمة:</strong> ${attackVector.tools.join(', ')}<br>
                    <strong>نقاط الدخول:</strong> ${attackVector.entryPoints.join(', ')}
                </div>
                <div>
                    <strong>الضرر المقدر:</strong> <span style="color: #ff4444;">$${attackVector.estimatedDamage.toLocaleString()}</span><br>
                    <strong>البيانات المخترقة:</strong> ${attackVector.dataCompromised} GB<br>
                    <strong>مدة الهجوم:</strong> ${attackVector.duration} دقيقة
                </div>
            </div>
            <div style="margin-top: 10px; padding: 10px; background: #330000; border-radius: 5px;">
                <strong style="color: #ff6600;">💡 الأوامر المستخدمة:</strong>
                <pre style="color: #00ff00; font-size: 12px; margin: 5px 0;">${attackVector.commands.join('\n')}</pre>
            </div>
        </div>
    `;
}

function analyzeAttackVector(report) {
    const output = report.output?.toLowerCase() || '';
    const command = report.command?.toLowerCase() || '';
    const tool = report.tool || '';
    
    if (output.includes('sql') || command.includes('sql')) {
        return {
            type: 'SQL Injection Attack',
            tools: ['sqlmap', 'manual injection', 'burp suite'],
            entryPoints: ['login forms', 'search parameters', 'URL parameters'],
            estimatedDamage: 25000,
            dataCompromised: 15.5,
            duration: 45,
            commands: [
                "sqlmap -u 'target.com/login.php' --dbs",
                "' OR '1'='1' --",
                "' UNION SELECT username,password FROM users --"
            ]
        };
    } else if (output.includes('xss') || command.includes('xss')) {
        return {
            type: 'Cross-Site Scripting (XSS)',
            tools: ['manual testing', 'XSSer', 'browser dev tools'],
            entryPoints: ['input fields', 'comment sections', 'search boxes'],
            estimatedDamage: 12000,
            dataCompromised: 3.2,
            duration: 20,
            commands: [
                "<script>alert('XSS')</script>",
                "<img src=x onerror=alert(document.cookie)>",
                "javascript:alert('XSS')"
            ]
        };
    } else if (tool.includes('nmap') || output.includes('port')) {
        return {
            type: 'Network Reconnaissance',
            tools: ['nmap', 'masscan', 'netcat'],
            entryPoints: ['open ports', 'services', 'network interfaces'],
            estimatedDamage: 5000,
            dataCompromised: 0.5,
            duration: 15,
            commands: [
                "nmap -sS -sV target.com",
                "nmap -p- --open target.com",
                "nc -v target.com 80"
            ]
        };
    } else if (tool.includes('nikto') || output.includes('web')) {
        return {
            type: 'Web Application Vulnerability Scan',
            tools: ['nikto', 'dirb', 'gobuster'],
            entryPoints: ['web directories', 'hidden files', 'admin panels'],
            estimatedDamage: 8000,
            dataCompromised: 2.1,
            duration: 30,
            commands: [
                "nikto -h target.com",
                "dirb target.com /usr/share/wordlists/dirb/common.txt",
                "gobuster dir -u target.com -w wordlist.txt"
            ]
        };
    }
    
    return null;
}

function showAttackVector(id) {
    const report = allReports.find(r => r.id === id);
    if (!report) return;
    
    const attackVector = analyzeAttackVector(report);
    if (!attackVector) {
        alert('❌ لا يمكن تحليل أسلوب الهجوم لهذا التقرير');
        return;
    }
    
    const details = `
🎯 تحليل أسلوب الهجوم المفصل

نوع الهجوم: ${attackVector.type}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛠️ الأدوات المستخدمة:
${attackVector.tools.map(tool => `• ${tool}`).join('\n')}

🚪 نقاط الدخول:
${attackVector.entryPoints.map(entry => `• ${entry}`).join('\n')}

💻 الأوامر المنفذة:
${attackVector.commands.map(cmd => `> ${cmd}`).join('\n')}

📊 تفاصيل الضرر:
• التكلفة المقدرة: $${attackVector.estimatedDamage.toLocaleString()}
• البيانات المخترقة: ${attackVector.dataCompromised} GB
• مدة الهجوم: ${attackVector.duration} دقيقة

⚠️ التوصيات الأمنية:
• تحديث جميع التطبيقات والأنظمة
• تفعيل جدار الحماية التطبيقي (WAF)
• مراجعة سجلات الأمان بانتظام
• تدريب الموظفين على الأمن السيبراني
    `;
    
    alert(details);
}

function calculateDamage(id) {
    const report = allReports.find(r => r.id === id);
    if (!report) return;
    
    const vulnerabilities = extractVulnerabilities(report.output);
    const attackVector = analyzeAttackVector(report);
    
    const baseDamage = vulnerabilities.length * 3000;
    const vectorDamage = attackVector ? attackVector.estimatedDamage : 0;
    const totalDamage = baseDamage + vectorDamage;
    
    const breakdown = [
        { item: 'ثغرات مكتشفة', count: vulnerabilities.length, cost: baseDamage },
        { item: 'أسلوب الهجوم', count: 1, cost: vectorDamage },
        { item: 'تكاليف الاستعادة', count: 1, cost: totalDamage * 0.2 },
        { item: 'فقدان الإنتاجية', count: 1, cost: totalDamage * 0.15 }
    ];
    
    const finalTotal = breakdown.reduce((sum, item) => sum + item.cost, 0);
    
    const damageReport = `
💰 تقرير تقدير الأضرار المالية

الهدف: ${report.command}
الأداة: ${report.tool}
التاريخ: ${formatDate(report.timestamp)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 تفصيل الأضرار:
${breakdown.map(item => 
    `• ${item.item}: ${item.count} × $${(item.cost/item.count).toLocaleString()} = $${item.cost.toLocaleString()}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💸 إجمالي الأضرار المقدرة: $${finalTotal.toLocaleString()}

📈 التأثير على العمليات:
• توقف الخدمات: ${Math.round(vulnerabilities.length * 1.5)} ساعة
• عدد المستخدمين المتأثرين: ${(vulnerabilities.length * 150).toLocaleString()}
• البيانات المعرضة للخطر: ${(vulnerabilities.length * 2.3).toFixed(1)} GB
• الأنظمة المخترقة: ${Math.min(vulnerabilities.length, 5)}

⚠️ المخاطر المستقبلية:
• احتمالية هجمات متقدمة: ${vulnerabilities.length > 3 ? 'عالية' : 'متوسطة'}
• خطر فقدان السمعة: ${vectorDamage > 15000 ? 'مرتفع' : 'منخفض'}
• تكاليف الامتثال: $${(finalTotal * 0.1).toLocaleString()}
    `;
    
    alert(damageReport);
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

function generateAttackVectorAnalysis(reports) {
    const attackMethods = analyzeAttackMethods(reports);
    const damageAssessment = calculateDamageAssessment(reports);
    
    // Display attack methods
    const methodsContainer = document.getElementById('attackMethods');
    methodsContainer.innerHTML = attackMethods.map(method => `
        <div style="margin: 10px 0; padding: 10px; background: #222; border-left: 4px solid ${method.color}; border-radius: 4px;">
            <div style="font-weight: bold; color: ${method.color};">${method.icon} ${method.name}</div>
            <div style="font-size: 12px; color: #aaa; margin: 5px 0;">الاستخدام: ${method.usage} مرة</div>
            <div style="font-size: 12px; color: #ccc;">${method.description}</div>
            <div style="font-size: 11px; color: #888; margin-top: 5px;">الأوامر المستخدمة: ${method.commands.join(', ')}</div>
        </div>
    `).join('');
    
    // Display damage assessment
    const damageContainer = document.getElementById('damageAssessment');
    damageContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #220000; padding: 15px; border-radius: 5px; text-align: center;">
                <div style="font-size: 24px; color: #ff4444; font-weight: bold;">$${damageAssessment.financial.toLocaleString()}</div>
                <div style="font-size: 12px; color: #aaa;">الأضرار المالية المقدرة</div>
            </div>
            <div style="background: #001122; padding: 15px; border-radius: 5px; text-align: center;">
                <div style="font-size: 24px; color: #00aaff; font-weight: bold;">${damageAssessment.dataCompromised} GB</div>
                <div style="font-size: 12px; color: #aaa;">البيانات المخترقة</div>
            </div>
        </div>
        <div style="margin: 15px 0;">
            <h5 style="color: #ff6600;">📊 تفصيل الأضرار:</h5>
            ${damageAssessment.breakdown.map(item => `
                <div style="margin: 8px 0; padding: 8px; background: #111; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #fff;">${item.type}</span>
                        <span style="color: #ff6600; font-weight: bold;">$${item.cost.toLocaleString()}</span>
                    </div>
                    <div style="font-size: 11px; color: #888;">${item.description}</div>
                </div>
            `).join('')}
        </div>
        <div style="background: #330000; padding: 10px; border-radius: 5px; margin-top: 15px;">
            <div style="color: #ff4444; font-weight: bold;">⚠️ تأثير على العمليات:</div>
            <div style="font-size: 12px; color: #ccc; margin: 5px 0;">
                • توقف الخدمات: ${damageAssessment.downtime} ساعة<br>
                • البيانات المسربة: ${damageAssessment.records.toLocaleString()} سجل<br>
                • الأنظمة المخترقة: ${damageAssessment.systemsCompromised}<br>
                • مدة الوصول غير المصرح: ${damageAssessment.unauthorizedAccess} يوم
            </div>
        </div>
    `;
}

function analyzeAttackMethods(reports) {
    const methods = [];
    
    // SQL Injection analysis
    const sqlReports = reports.filter(r => r.output && (
        r.output.toLowerCase().includes('sql') || 
        r.output.toLowerCase().includes('injection') ||
        r.output.includes('قاعدة البيانات')
    ));
    
    if (sqlReports.length > 0) {
        methods.push({
            name: 'SQL Injection',
            icon: '💉',
            color: '#ff4444',
            usage: sqlReports.length,
            description: 'استغلال ثغرات حقن SQL للوصول إلى قواعد البيانات وسرقة المعلومات',
            commands: ['sqlmap', 'union select', 'information_schema'],
            severity: 'critical',
            impact: 'سرقة كاملة لقاعدة البيانات، تعديل السجلات، حذف البيانات'
        });
    }
    
    // XSS analysis
    const xssReports = reports.filter(r => r.output && r.output.toLowerCase().includes('xss'));
    if (xssReports.length > 0) {
        methods.push({
            name: 'Cross-Site Scripting (XSS)',
            icon: '🕷️',
            color: '#ff6600',
            usage: xssReports.length,
            description: 'حقن كود JavaScript ضار لسرقة جلسات المستخدمين',
            commands: ['<script>', 'document.cookie', 'alert()'],
            severity: 'high',
            impact: 'سرقة كوكيز المستخدمين، إعادة توجيه لمواقع ضارة، سرقة بيانات اعتماد'
        });
    }
    
    // Port scanning analysis
    const portReports = reports.filter(r => r.tool && (
        r.tool.includes('nmap') || 
        r.output.includes('port') || 
        r.output.includes('بورت')
    ));
    
    if (portReports.length > 0) {
        methods.push({
            name: 'Network Reconnaissance',
            icon: '🔍',
            color: '#00aaff',
            usage: portReports.length,
            description: 'استطلاع الشبكة وفحص المنافذ المفتوحة لاكتشاف نقاط الضعف',
            commands: ['nmap', 'netstat', 'telnet'],
            severity: 'medium',
            impact: 'كشف الخدمات المتاحة، تحديد نقاط الدخول المحتملة'
        });
    }
    
    // Brute force analysis
    const bruteReports = reports.filter(r => r.output && (
        r.output.toLowerCase().includes('password') ||
        r.output.toLowerCase().includes('login') ||
        r.output.includes('كلمة مرور')
    ));
    
    if (bruteReports.length > 0) {
        methods.push({
            name: 'Brute Force Attack',
            icon: '🔨',
            color: '#aa00aa',
            usage: bruteReports.length,
            description: 'هجمات القوة الغاشمة لكسر كلمات المرور والوصول للحسابات',
            commands: ['hydra', 'john', 'hashcat'],
            severity: 'high',
            impact: 'اختراق حسابات المستخدمين، الوصول لحسابات الإدارة'
        });
    }
    
    // Web application attacks
    const webReports = reports.filter(r => r.tool && (
        r.tool.includes('nikto') || 
        r.tool.includes('dirb') ||
        r.output.includes('web')
    ));
    
    if (webReports.length > 0) {
        methods.push({
            name: 'Web Application Attacks',
            icon: '🌐',
            color: '#00cc66',
            usage: webReports.length,
            description: 'استهداف تطبيقات الويب واستغلال ثغراتها الأمنية',
            commands: ['nikto', 'dirb', 'gobuster'],
            severity: 'high',
            impact: 'كشف ملفات حساسة، الوصول لوحات الإدارة، تنفيذ كود ضار'
        });
    }
    
    return methods;
}

function calculateDamageAssessment(reports) {
    const vulnerabilitiesFound = reports.reduce((sum, r) => sum + extractVulnerabilities(r.output).length, 0);
    const systemsAffected = new Set(reports.map(r => r.command || 'unknown')).size;
    
    // Calculate financial damage based on attack types and severity
    let baseDamage = vulnerabilitiesFound * 5000; // $5k per vulnerability
    let dataCompromised = vulnerabilitiesFound * 2.5; // GB per vulnerability
    
    // Additional costs based on attack types
    const sqlAttacks = reports.filter(r => r.output && r.output.toLowerCase().includes('sql')).length;
    const xssAttacks = reports.filter(r => r.output && r.output.toLowerCase().includes('xss')).length;
    const adminAccess = reports.filter(r => r.output && r.output.toLowerCase().includes('admin')).length;
    
    const breakdown = [
        {
            type: 'سرقة البيانات الحساسة',
            cost: sqlAttacks * 15000,
            description: `${sqlAttacks} هجوم SQL injection - قواعد بيانات مخترقة`
        },
        {
            type: 'اختراق حسابات المستخدمين',
            cost: xssAttacks * 8000,
            description: `${xssAttacks} هجوم XSS - جلسات مسروقة`
        },
        {
            type: 'الوصول لحسابات الإدارة',
            cost: adminAccess * 25000,
            description: `${adminAccess} وصول إداري غير مصرح - تحكم كامل`
        },
        {
            type: 'توقف الخدمات',
            cost: systemsAffected * 3000,
            description: `${systemsAffected} نظام متأثر - انقطاع الخدمة`
        },
        {
            type: 'استعادة الأنظمة',
            cost: baseDamage * 0.3,
            description: 'تكاليف الإصلاح والاستعادة'
        },
        {
            type: 'الغرامات التنظيمية',
            cost: dataCompromised > 10 ? 50000 : 0,
            description: 'غرامات انتهاك حماية البيانات'
        }
    ];
    
    const totalFinancialDamage = breakdown.reduce((sum, item) => sum + item.cost, 0);
    
    return {
        financial: totalFinancialDamage,
        dataCompromised: Math.round(dataCompromised * 10) / 10,
        breakdown: breakdown,
        downtime: Math.round(vulnerabilitiesFound * 0.5 + systemsAffected * 2),
        records: vulnerabilitiesFound * 1000 + Math.floor(Math.random() * 50000),
        systemsCompromised: systemsAffected,
        unauthorizedAccess: Math.round(vulnerabilitiesFound * 0.8 + Math.random() * 5)
    };
}

// تحديث تلقائي كل 30 ثانية
setInterval(loadReports, 30000);
