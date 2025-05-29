
const apiUrl = '/api';

let visualTargets = [];
let selectedTarget = null;
let scanAnimation = null;

// Initialize the visual display
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 YUSR-TEC Visual Target Display Loaded');
    
    loadVisualTargets();
    createMatrixBackground();
    startRealTimeUpdates();
    
    // Initialize statistics
    updateLiveStats();
});

// Load targets for visual display
function loadVisualTargets() {
    fetch(`${apiUrl}/commands`)
        .then(response => response.json())
        .then(data => {
            parseTargetsForVisual(data);
            displayNetworkMap();
            updateAttackTimeline();
        })
        .catch(error => {
            console.error('خطأ في تحميل البيانات:', error);
        });
}

// Parse targets from commands for visual display
function parseTargetsForVisual(commands) {
    visualTargets = [];
    
    commands.forEach(command => {
        if (command.output && (
            command.output.includes('✅ نجح') ||
            command.output.includes('vulnerability found') ||
            command.output.includes('Access gained') ||
            command.output.includes('SQL injection') ||
            command.output.includes('XSS')
        )) {
            const target = createVisualTarget(command);
            if (target && !visualTargets.find(t => t.address === target.address)) {
                visualTargets.push(target);
            }
        }
    });
    
    // Add some simulated high-value targets for demonstration
    if (visualTargets.length < 5) {
        addSimulatedTargets();
    }
}

// Create visual target object
function createVisualTarget(command) {
    const output = command.output;
    const commandText = command.command;
    
    // Extract address
    const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
    const domainRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
    
    let address = '';
    let type = 'unknown';
    
    const ipMatch = output.match(ipRegex) || commandText.match(ipRegex);
    const domainMatch = output.match(domainRegex) || commandText.match(domainRegex);
    
    if (ipMatch) {
        address = ipMatch[0];
        type = 'server';
    } else if (domainMatch) {
        address = domainMatch[0].replace(/https?:\/\//, '').replace(/www\./, '');
        type = 'website';
    }
    
    if (!address) return null;
    
    // Determine threat level and value
    let threatLevel = 'medium';
    let isHighValue = false;
    let hasBackdoor = false;
    
    if (output.includes('admin') || output.includes('database') || output.includes('root')) {
        threatLevel = 'critical';
        isHighValue = true;
    } else if (output.includes('SQL injection') || output.includes('shell')) {
        threatLevel = 'high';
    }
    
    if (output.includes('backdoor') || output.includes('persistent')) {
        hasBackdoor = true;
    }
    
    return {
        id: Date.now() + Math.random(),
        address: address,
        type: type,
        threatLevel: threatLevel,
        isHighValue: isHighValue,
        hasBackdoor: hasBackdoor,
        vulnerabilities: extractVulnerabilities(output),
        compromisedAt: new Date(command.timestamp),
        location: generateRandomLocation(),
        systemInfo: extractSystemInfo(output),
        dataExfiltrated: Math.floor(Math.random() * 100) + 10, // GB
        activeSessions: Math.floor(Math.random() * 5) + 1
    };
}

// Extract vulnerabilities from output
function extractVulnerabilities(output) {
    const vulns = [];
    if (output.includes('SQL injection') || output.includes('sql')) vulns.push('SQL Injection');
    if (output.includes('XSS') || output.includes('script')) vulns.push('XSS');
    if (output.includes('admin') || output.includes('login')) vulns.push('Admin Access');
    if (output.includes('shell') || output.includes('SSH')) vulns.push('Remote Shell');
    if (output.includes('database') || output.includes('3306')) vulns.push('Database Access');
    return vulns;
}

// Extract system information
function extractSystemInfo(output) {
    let os = 'Unknown';
    let services = [];
    
    if (output.includes('Linux') || output.includes('Ubuntu')) os = 'Linux';
    else if (output.includes('Windows')) os = 'Windows';
    else if (output.includes('Apache')) os = 'Web Server';
    
    if (output.includes('22') || output.includes('SSH')) services.push('SSH');
    if (output.includes('80') || output.includes('HTTP')) services.push('HTTP');
    if (output.includes('443') || output.includes('HTTPS')) services.push('HTTPS');
    if (output.includes('3306') || output.includes('MySQL')) services.push('MySQL');
    
    return { os, services };
}

// Generate random location for visualization
function generateRandomLocation() {
    const locations = [
        { country: 'USA', city: 'New York', lat: 40.7128, lng: -74.0060 },
        { country: 'UK', city: 'London', lat: 51.5074, lng: -0.1278 },
        { country: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
        { country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
        { country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 }
    ];
    return locations[Math.floor(Math.random() * locations.length)];
}

// Add simulated targets for demonstration
function addSimulatedTargets() {
    const simulated = [
        {
            id: 'sim1',
            address: 'corporate-server.com',
            type: 'website',
            threatLevel: 'critical',
            isHighValue: true,
            hasBackdoor: true,
            vulnerabilities: ['SQL Injection', 'Admin Access', 'Database Access'],
            compromisedAt: new Date(),
            location: { country: 'USA', city: 'New York' },
            systemInfo: { os: 'Linux', services: ['HTTP', 'SSH', 'MySQL'] },
            dataExfiltrated: 250,
            activeSessions: 3
        },
        {
            id: 'sim2',
            address: '192.168.100.50',
            type: 'server',
            threatLevel: 'high',
            isHighValue: false,
            hasBackdoor: true,
            vulnerabilities: ['Remote Shell', 'SSH'],
            compromisedAt: new Date(),
            location: { country: 'Germany', city: 'Berlin' },
            systemInfo: { os: 'Windows', services: ['SSH', 'RDP'] },
            dataExfiltrated: 75,
            activeSessions: 2
        }
    ];
    
    visualTargets.push(...simulated);
}

// Display network map with targets
function displayNetworkMap() {
    const map = document.getElementById('networkMap');
    
    // Clear existing nodes
    const existingNodes = map.querySelectorAll('.target-node');
    existingNodes.forEach(node => node.remove());
    
    visualTargets.forEach((target, index) => {
        const node = createTargetNode(target, index);
        map.appendChild(node);
    });
    
    // Create connection lines
    setTimeout(createConnectionLines, 500);
}

// Create visual node for target
function createTargetNode(target, index) {
    const node = document.createElement('div');
    node.className = 'target-node';
    node.id = `target-${target.id}`;
    
    // Add special classes
    if (target.isHighValue) node.classList.add('high-value');
    if (target.hasBackdoor) node.classList.add('persistent');
    
    // Position randomly on the map
    const mapRect = document.getElementById('networkMap').getBoundingClientRect();
    const x = Math.random() * (mapRect.width - 140) + 20;
    const y = Math.random() * (mapRect.height - 140) + 50;
    
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    
    node.innerHTML = `
        <div class="threat-level threat-${target.threatLevel}">${target.threatLevel.toUpperCase()}</div>
        <div class="node-icon">${getTargetIcon(target.type)}</div>
        <div class="node-address">${target.address}</div>
        ${target.hasBackdoor ? '<div class="backdoor-indicator"></div>' : ''}
    `;
    
    node.onclick = () => showTargetDetails(target);
    
    return node;
}

// Get icon for target type
function getTargetIcon(type) {
    const icons = {
        'website': '🌐',
        'server': '🖥️',
        'database': '🗄️',
        'mobile': '📱',
        'iot': '🏠'
    };
    return icons[type] || '🎯';
}

// Create connection lines between targets
function createConnectionLines() {
    const map = document.getElementById('networkMap');
    const nodes = map.querySelectorAll('.target-node');
    
    // Remove existing lines
    const existingLines = map.querySelectorAll('.connection-line');
    existingLines.forEach(line => line.remove());
    
    // Create lines between some nodes
    for (let i = 0; i < nodes.length - 1; i++) {
        if (Math.random() > 0.6) { // 40% chance to create connection
            const line = createConnectionLine(nodes[i], nodes[i + 1]);
            map.appendChild(line);
        }
    }
}

// Create connection line between two nodes
function createConnectionLine(node1, node2) {
    const line = document.createElement('div');
    line.className = 'connection-line';
    
    const rect1 = node1.getBoundingClientRect();
    const rect2 = node2.getBoundingClientRect();
    const mapRect = document.getElementById('networkMap').getBoundingClientRect();
    
    const x1 = rect1.left - mapRect.left + rect1.width / 2;
    const y1 = rect1.top - mapRect.top + rect1.height / 2;
    const x2 = rect2.left - mapRect.left + rect2.width / 2;
    const y2 = rect2.top - mapRect.top + rect2.height / 2;
    
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    line.style.left = x1 + 'px';
    line.style.top = y1 + 'px';
    line.style.width = length + 'px';
    line.style.transform = `rotate(${angle}deg)`;
    
    return line;
}

// Show target details in modal
function showTargetDetails(target) {
    selectedTarget = target;
    const modal = document.getElementById('targetModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h2>${getTargetIcon(target.type)} ${target.address}</h2>
        <div style="color: #888; margin-bottom: 20px;">تم الاختراق: ${target.compromisedAt.toLocaleString('ar-SA')}</div>
        
        <div class="vulnerability-chart">
            <h3>🔍 الثغرات المكتشفة</h3>
            ${target.vulnerabilities.map(vuln => `
                <div style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${vuln}</span>
                        <span style="color: #ff4444;">عالي</span>
                    </div>
                    <div class="vuln-bar">
                        <div class="vuln-fill" style="width: ${Math.random() * 60 + 40}%;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div style="background: #111; padding: 15px; border-radius: 8px;">
                <h4>💻 معلومات النظام</h4>
                <div>نظام التشغيل: ${target.systemInfo.os}</div>
                <div>الخدمات: ${target.systemInfo.services.join(', ')}</div>
                <div>الموقع: ${target.location.city}, ${target.location.country}</div>
            </div>
            <div style="background: #111; padding: 15px; border-radius: 8px;">
                <h4>📊 الإحصائيات</h4>
                <div>البيانات المسربة: ${target.dataExfiltrated} GB</div>
                <div>الجلسات النشطة: ${target.activeSessions}</div>
                <div>مستوى التهديد: ${target.threatLevel}</div>
            </div>
        </div>
        
        <div style="background: #0a0a0a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>🎯 الإجراءات المتاحة</h4>
            <button onclick="executeRemoteCommand('${target.address}')" style="background: #ff4444; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">💻 تنفيذ أوامر</button>
            <button onclick="exfiltrateData('${target.address}')" style="background: #ff6600; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">📁 سرقة البيانات</button>
            <button onclick="installPersistence('${target.address}')" style="background: #00aa00; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">🔐 تثبيت استمرارية</button>
            <button onclick="coverTracks('${target.address}')" style="background: #333; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">👻 إخفاء الأثر</button>
            <button onclick="startVictimControl('${target.address}')" style="background: #ff0000; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">🎮 التحكم في الضحية</button>
        </div>
        
        ${target.hasBackdoor ? `
            <div style="background: #001100; border: 1px solid #00aa00; padding: 15px; border-radius: 8px;">
                <h4>🔐 الأبواب الخلفية النشطة</h4>
                <div style="color: #00ff00;">✅ SSH Backdoor - نشط</div>
                <div style="color: #00ff00;">✅ Web Shell - نشط</div>
                <div style="color: #00ff00;">✅ Reverse Shell - نشط</div>
                <div style="color: #00ff00;">✅ RAT (Remote Access Trojan) - نشط</div>
                <div style="color: #00ff00;">✅ Keylogger - نشط</div>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Close target modal
function closeTargetModal() {
    document.getElementById('targetModal').style.display = 'none';
}

// Update live statistics
function updateLiveStats() {
    const totalHacked = visualTargets.length;
    const activeSessions = visualTargets.reduce((sum, t) => sum + t.activeSessions, 0);
    const dataExfiltrated = visualTargets.reduce((sum, t) => sum + t.dataExfiltrated, 0);
    const exploitsUsed = visualTargets.reduce((sum, t) => sum + t.vulnerabilities.length, 0);
    
    document.getElementById('totalHacked').textContent = totalHacked;
    document.getElementById('activeSessions').textContent = activeSessions;
    document.getElementById('dataExfiltrated').textContent = dataExfiltrated.toFixed(1) + ' GB';
    document.getElementById('exploitsUsed').textContent = exploitsUsed;
}

// Update attack timeline
function updateAttackTimeline() {
    const timeline = document.getElementById('attackTimeline');
    timeline.innerHTML = '';
    
    // Create timeline items from recent activities
    const activities = [
        '🎯 نجح اختراق corporate-server.com',
        '💉 تم استغلال ثغرة SQL injection في قاعدة البيانات',
        '🔑 تم تثبيت SSH backdoor بنجاح',
        '📁 تم تسريب 250 GB من البيانات الحساسة',
        '👻 تم تفعيل وضع التخفي لتجنب الكشف',
        '⚡ بدء هجوم جماعي على 5 أهداف جديدة'
    ];
    
    activities.forEach((activity, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div style="font-weight: bold; color: #ff4444;">${activity}</div>
            <div style="color: #888; font-size: 12px;">${new Date(Date.now() - index * 60000).toLocaleString('ar-SA')}</div>
        `;
        timeline.appendChild(item);
    });
}

// Create matrix-style background
function createMatrixBackground() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.1';
    
    document.getElementById('matrixBg').appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01';
    const charSize = 14;
    const columns = canvas.width / charSize;
    const drops = [];
    
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff41';
        ctx.font = charSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * charSize, drops[i] * charSize);
            
            if (drops[i] * charSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 100);
}

// Start real-time updates
function startRealTimeUpdates() {
    setInterval(() => {
        updateLiveStats();
        
        // Simulate new activities
        if (Math.random() > 0.8) {
            simulateNewActivity();
        }
        
        // Update node animations
        updateNodeAnimations();
    }, 5000);
}

// Simulate new activity
function simulateNewActivity() {
    const activities = [
        'تم اكتشاف هدف جديد',
        'نجح استغلال ثغرة جديدة',
        'تم تسريب المزيد من البيانات',
        'تحديث الأبواب الخلفية'
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    console.log('🔄 نشاط جديد:', activity);
    
    // Update a random target's data
    if (visualTargets.length > 0) {
        const randomTarget = visualTargets[Math.floor(Math.random() * visualTargets.length)];
        randomTarget.dataExfiltrated += Math.floor(Math.random() * 10) + 1;
        randomTarget.activeSessions = Math.floor(Math.random() * 5) + 1;
    }
}

// Update node animations
function updateNodeAnimations() {
    const nodes = document.querySelectorAll('.target-node');
    nodes.forEach(node => {
        if (Math.random() > 0.7) {
            node.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                node.style.animation = 'pulse 2s infinite';
            }, 500);
        }
    });
}

// Control panel functions
function scanForNewTargets() {
    alert('🔍 بدء البحث عن أهداف جديدة...');
    
    setTimeout(() => {
        const newTarget = {
            id: Date.now(),
            address: `new-target-${Math.floor(Math.random() * 1000)}.com`,
            type: 'website',
            threatLevel: 'medium',
            isHighValue: Math.random() > 0.7,
            hasBackdoor: false,
            vulnerabilities: ['SQL Injection'],
            compromisedAt: new Date(),
            location: generateRandomLocation(),
            systemInfo: { os: 'Linux', services: ['HTTP'] },
            dataExfiltrated: Math.floor(Math.random() * 50),
            activeSessions: 1
        };
        
        visualTargets.push(newTarget);
        displayNetworkMap();
        updateLiveStats();
        alert('🎯 تم اكتشاف هدف جديد: ' + newTarget.address);
    }, 2000);
}

function launchMassAttack() {
    alert('⚡ بدء الهجوم الجماعي على جميع الأهداف...');
    
    visualTargets.forEach(target => {
        target.activeSessions += Math.floor(Math.random() * 3) + 1;
        target.dataExfiltrated += Math.floor(Math.random() * 20) + 5;
    });
    
    setTimeout(() => {
        updateLiveStats();
        alert('✅ تم تنفيذ الهجوم الجماعي بنجاح');
    }, 3000);
}

function activateStealthMode() {
    alert('👻 تم تفعيل وضع التخفي - جميع الأنشطة أصبحت غير مرئية للأنظمة الأمنية');
}

function exportNetworkMap() {
    const report = generateNetworkReport();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-map-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generateNetworkReport() {
    let report = `
YUSR-TEC - تقرير خريطة الشبكة المخترقة
=====================================

تاريخ التقرير: ${new Date().toLocaleString('ar-SA')}
إجمالي الأهداف المخترقة: ${visualTargets.length}
البيانات المسربة الإجمالية: ${visualTargets.reduce((sum, t) => sum + t.dataExfiltrated, 0)} GB
الجلسات النشطة: ${visualTargets.reduce((sum, t) => sum + t.activeSessions, 0)}

تفاصيل الأهداف:
===============

`;

    visualTargets.forEach((target, index) => {
        report += `
${index + 1}. ${target.address}
   النوع: ${target.type}
   مستوى التهديد: ${target.threatLevel}
   الموقع: ${target.location.city}, ${target.location.country}
   نظام التشغيل: ${target.systemInfo.os}
   الثغرات: ${target.vulnerabilities.join(', ')}
   البيانات المسربة: ${target.dataExfiltrated} GB
   الجلسات النشطة: ${target.activeSessions}
   الأبواب الخلفية: ${target.hasBackdoor ? 'نشطة' : 'غير مثبتة'}
   تاريخ الاختراق: ${target.compromisedAt.toLocaleString('ar-SA')}

`;
    });

    return report;
}

// Target action functions
function executeRemoteCommand(target) {
    alert(`💻 تنفيذ أوامر عن بُعد على ${target}...`);
}

function exfiltrateData(target) {
    alert(`📁 بدء تسريب البيانات من ${target}...`);
}

function installPersistence(target) {
    alert(`🔐 تثبيت آليات الاستمرارية على ${target}...`);
}

function coverTracks(target) {
    alert(`👻 إخفاء آثار النشاط على ${target}...`);
}

// Start victim control interface
function startVictimControl(targetAddress) {
    console.log(`🎮 Starting victim control for ${targetAddress}`);
    closeTargetModal();
    
    // Show control panels
    document.getElementById('victimControlPanel').style.display = 'block';
    document.getElementById('victimMonitor').style.display = 'block';
    
    // Initialize victim monitoring
    initializeVictimMonitoring(targetAddress);
    
    alert(`🎮 بدء التحكم في الضحية: ${targetAddress}`);
}

// Initialize victim monitoring
function initializeVictimMonitoring(targetAddress) {
    const victimInfo = document.getElementById('victimDetailsContent');
    
    // Generate detailed victim information
    const victimDetails = generateVictimDetails(targetAddress);
    
    victimInfo.innerHTML = `
        <div style="color: #ff0000; font-weight: bold; margin-bottom: 15px;">🎯 الهدف: ${targetAddress}</div>
        
        <div style="margin: 10px 0;">
            <strong>📱 نوع الجهاز:</strong> ${victimDetails.deviceType}
        </div>
        <div style="margin: 10px 0;">
            <strong>💻 نظام التشغيل:</strong> ${victimDetails.os}
        </div>
        <div style="margin: 10px 0;">
            <strong>🌐 المتصفح:</strong> ${victimDetails.browser}
        </div>
        <div style="margin: 10px 0;">
            <strong>📍 الموقع الجغرافي:</strong> ${victimDetails.location}
        </div>
        <div style="margin: 10px 0;">
            <strong>📶 عنوان IP:</strong> ${victimDetails.ipAddress}
        </div>
        <div style="margin: 10px 0;">
            <strong>🕒 آخر نشاط:</strong> ${victimDetails.lastActivity}
        </div>
        
        <div style="background: #222; padding: 10px; border-radius: 5px; margin: 15px 0;">
            <strong>🔍 الأجهزة المتاحة:</strong>
            <div style="margin: 5px 0;">
                📷 كاميرا: ${victimDetails.devices.camera ? '✅ متاحة' : '❌ غير متاحة'}
            </div>
            <div style="margin: 5px 0;">
                🎤 مايكروفون: ${victimDetails.devices.microphone ? '✅ متاح' : '❌ غير متاح'}
            </div>
            <div style="margin: 5px 0;">
                🖱️ ماوس: ${victimDetails.devices.mouse ? '✅ متاح' : '❌ غير متاح'}
            </div>
            <div style="margin: 5px 0;">
                ⌨️ لوحة المفاتيح: ${victimDetails.devices.keyboard ? '✅ متاحة' : '❌ غير متاحة'}
            </div>
        </div>
        
        <div style="background: #001100; border: 1px solid #00ff00; padding: 10px; border-radius: 5px; margin: 15px 0;">
            <strong>📊 إحصائيات المراقبة:</strong>
            <div style="margin: 5px 0;">📸 لقطات التقطت: ${victimDetails.stats.screenshots}</div>
            <div style="margin: 5px 0;">🎵 تسجيلات صوتية: ${victimDetails.stats.audioRecordings}</div>
            <div style="margin: 5px 0;">⌨️ ضغطات المفاتيح: ${victimDetails.stats.keystrokes}</div>
            <div style="margin: 5px 0;">🖱️ نقرات الماوس: ${victimDetails.stats.mouseClicks}</div>
        </div>
    `;
    
    // Start live monitoring simulation
    startLiveMonitoring(targetAddress);
}

// Generate detailed victim information
function generateVictimDetails(targetAddress) {
    const devices = ['Windows PC', 'MacBook Pro', 'Linux Workstation', 'Android Phone', 'iPhone'];
    const browsers = ['Chrome 120.0', 'Firefox 121.0', 'Safari 17.2', 'Edge 120.0'];
    const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Berlin, Germany', 'Sydney, Australia'];
    
    return {
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        os: selectedTarget?.systemInfo?.os || 'Windows 11',
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        location: selectedTarget?.location ? `${selectedTarget.location.city}, ${selectedTarget.location.country}` : locations[Math.floor(Math.random() * locations.length)],
        ipAddress: targetAddress.includes('.') ? targetAddress : `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        lastActivity: new Date().toLocaleString('ar-SA'),
        devices: {
            camera: Math.random() > 0.2,
            microphone: Math.random() > 0.1,
            mouse: true,
            keyboard: true
        },
        stats: {
            screenshots: Math.floor(Math.random() * 50) + 10,
            audioRecordings: Math.floor(Math.random() * 20) + 5,
            keystrokes: Math.floor(Math.random() * 5000) + 1000,
            mouseClicks: Math.floor(Math.random() * 1000) + 200
        }
    };
}

// Start live monitoring simulation
function startLiveMonitoring(targetAddress) {
    const screenElement = document.getElementById('victimScreen');
    
    // Simulate live screen capture
    let frameCount = 0;
    const monitoringInterval = setInterval(() => {
        frameCount++;
        
        if (frameCount % 5 === 0) {
            // Simulate screen content change
            const activities = [
                '📧 يكتب رسالة إلكترونية',
                '🌐 يتصفح موقع البنك',
                '💬 محادثة على WhatsApp',
                '📄 يعمل على مستند سري',
                '🎮 يلعب لعبة',
                '📱 يستخدم التطبيقات',
                '🔑 يدخل كلمات مرور',
                '💳 يدخل بيانات بطاقة ائتمان'
            ];
            
            const currentActivity = activities[Math.floor(Math.random() * activities.length)];
            screenElement.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 20px;">📺</div>
                    <div style="font-size: 16px; color: #00ff00;">البث المباشر نشط</div>
                    <div style="font-size: 14px; color: #fff; margin: 10px 0;">النشاط الحالي:</div>
                    <div style="font-size: 18px; color: #ff4444;">${currentActivity}</div>
                    <div style="margin-top: 20px; font-size: 12px; color: #888;">
                        الإطار: ${frameCount} | FPS: 30 | الجودة: HD
                    </div>
                </div>
            `;
        }
    }, 1000);
    
    // Store interval for cleanup
    window.victimMonitoringInterval = monitoringInterval;
}

// Victim control functions
function activateCamera() {
    alert('📹 تم تفعيل الكاميرا بنجاح - جارٍ البث المباشر');
    logVictimAction('Camera activated');
}

function takeScreenshot() {
    alert('📸 تم التقاط لقطة شاشة - حُفظت في ملف الأهداف');
    logVictimAction('Screenshot captured');
}

function recordScreen() {
    alert('🎥 بدء تسجيل الشاشة - مدة التسجيل: غير محدودة');
    logVictimAction('Screen recording started');
}

function activateMicrophone() {
    alert('🎤 تم تفعيل المايكروفون - جارٍ التنصت المباشر');
    logVictimAction('Microphone activated');
}

function recordAudio() {
    alert('🎵 بدء التسجيل الصوتي - جودة عالية');
    logVictimAction('Audio recording started');
}

function playSound() {
    const sounds = ['تحذير أمني', 'صوت إنذار', 'رسالة صوتية مزيفة', 'صوت مخيف'];
    const selectedSound = sounds[Math.floor(Math.random() * sounds.length)];
    alert(`🔊 تم تشغيل: ${selectedSound}`);
    logVictimAction(`Played sound: ${selectedSound}`);
}

function controlMouse() {
    alert('🖱️ تم السيطرة على الماوس - يمكنك الآن التحكم في مؤشر الضحية');
    logVictimAction('Mouse control activated');
}

function disableMouse() {
    alert('🚫 تم تعطيل الماوس - الضحية لا يستطيع استخدام الماوس');
    logVictimAction('Mouse disabled');
}

function fakeClick() {
    const actions = ['نقر على رابط ضار', 'فتح ملف مشبوه', 'تنزيل برنامج ضار', 'النقر على إعلان'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    alert(`👆 تم تنفيذ: ${action}`);
    logVictimAction(`Fake click: ${action}`);
}

function captureKeystrokes() {
    alert('⌨️ تم تفعيل تسجيل المفاتيح - جارٍ تسجيل كل ما يكتبه الضحية');
    logVictimAction('Keylogger activated');
}

function injectKeystrokes() {
    const messages = ['تم اختراق جهازك', 'أرسل $1000 إلى هذا الحساب', 'كلمة مرورك ضعيفة', 'قم بتحديث نظامك فوراً'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    alert(`💉 تم حقن النص: "${message}"`);
    logVictimAction(`Injected keystrokes: ${message}`);
}

function disableKeyboard() {
    alert('🔒 تم تعطيل لوحة المفاتيح - الضحية لا يستطيع الكتابة');
    logVictimAction('Keyboard disabled');
}

// Log victim actions
function logVictimAction(action) {
    const timestamp = new Date().toLocaleString('ar-SA');
    console.log(`🎯 [${timestamp}] Victim Action: ${action}`);
    
    // Update victim stats
    if (selectedTarget) {
        selectedTarget.activeSessions += 1;
        updateLiveStats();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('targetModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Cleanup function when leaving page
window.addEventListener('beforeunload', function() {
    if (window.victimMonitoringInterval) {
        clearInterval(window.victimMonitoringInterval);
    }
});
