
const apiUrl = '/api';

let currentTarget = null;
let realTimeInterval = null;
let chartData = [];
let maxDataPoints = 50;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 YUSR-TEC Advanced Target Details Loaded');
    
    // Check if target was passed via URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('target');
    
    if (targetId) {
        loadTargetById(targetId);
    }
    
    // Initialize chart data
    initializeChart();
});

// Load target by ID from URL parameter
function loadTargetById(targetId) {
    fetch(`${apiUrl}/commands`)
        .then(response => response.json())
        .then(data => {
            const targets = parseTargetsFromCommands(data);
            const target = targets.find(t => t.id == targetId || t.address === targetId);
            
            if (target) {
                setCurrentTarget(target);
            } else {
                alert('❌ لم يتم العثور على الهدف المحدد');
            }
        })
        .catch(error => {
            console.error('خطأ في تحميل الهدف:', error);
        });
}

// Parse targets from commands (same logic as targets.js)
function parseTargetsFromCommands(commands) {
    const targets = [];
    
    commands.forEach(command => {
        if (command.output && (
            command.output.includes('✅ نجح') ||
            command.output.includes('vulnerability found') ||
            command.output.includes('Login successful') ||
            command.output.includes('Access gained')
        )) {
            const target = extractTargetFromCommand(command);
            if (target && !targets.find(t => t.address === target.address)) {
                targets.push(target);
            }
        }
    });
    
    return targets;
}

// Extract target from command (enhanced version)
function extractTargetFromCommand(command) {
    const output = command.output;
    const commandText = command.command;
    
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
    
    // Generate comprehensive target data
    return generateAdvancedTargetData(address, type, command);
}

// Generate advanced target data with comprehensive device information
function generateAdvancedTargetData(address, type, command) {
    return {
        id: Date.now() + Math.random(),
        address: address,
        type: type,
        status: 'compromised',
        
        // Location Information
        location: generateLocationData(address),
        
        // Network Information
        network: generateNetworkData(address, type),
        
        // System Information
        system: generateSystemData(command.output),
        
        // Security Information
        security: generateSecurityData(command.output),
        
        // Vulnerabilities
        vulnerabilities: extractVulnerabilities(command.output),
        
        // Timeline
        timeline: generateTimelineData(command),
        
        // Forensic Data
        forensics: generateForensicData(command.output),
        
        // Real-time Stats
        realTimeStats: initializeRealTimeStats(),
        
        // Connected Devices
        connectedDevices: generateConnectedDevices(),
        
        // Network Infrastructure
        infrastructure: generateNetworkInfrastructure(),
        
        // Domain Associations
        domainAssociations: generateDomainAssociations(address),
        
        // IoT Devices
        iotDevices: generateIoTDevices(),
        
        // Network Services
        networkServices: generateNetworkServices(),
        
        // Compromise details
        compromisedAt: new Date(command.timestamp),
        discoveredAt: new Date(),
        lastActivity: new Date()
    };
}

// Generate connected devices with detailed information
function generateConnectedDevices() {
    const devices = [
        { type: 'workstation', os: 'Windows 11 Pro', hostname: 'WIN-' + generateRandomString(8) },
        { type: 'server', os: 'Ubuntu 22.04 LTS', hostname: 'srv-' + generateRandomString(6) },
        { type: 'mobile', os: 'Android 13', hostname: 'android-' + generateRandomString(6) },
        { type: 'mobile', os: 'iOS 16.5', hostname: 'iPhone-' + generateRandomString(4) },
        { type: 'laptop', os: 'macOS Ventura', hostname: 'MacBook-' + generateRandomString(6) },
        { type: 'tablet', os: 'iPadOS 16', hostname: 'iPad-' + generateRandomString(4) },
        { type: 'iot', os: 'Linux ARM', hostname: 'smart-' + generateRandomString(6) }
    ];
    
    const numDevices = Math.floor(Math.random() * 8) + 3;
    const connectedDevices = [];
    
    for (let i = 0; i < numDevices; i++) {
        const device = devices[Math.floor(Math.random() * devices.length)];
        const deviceInfo = {
            id: generateRandomString(8),
            hostname: device.hostname,
            type: device.type,
            operatingSystem: device.os,
            ipAddress: generateRandomIP(),
            macAddress: generateMacAddress(),
            status: Math.random() > 0.2 ? 'online' : 'offline',
            lastSeen: new Date(Date.now() - Math.random() * 86400000),
            openPorts: generateRandomPorts(),
            vulnerabilities: Math.floor(Math.random() * 8),
            isCompromised: Math.random() > 0.7,
            installedSoftware: generateInstalledSoftware(),
            networkTraffic: {
                bytesIn: Math.floor(Math.random() * 1000000),
                bytesOut: Math.floor(Math.random() * 1000000),
                connections: Math.floor(Math.random() * 50) + 5
            },
            security: {
                firewall: Math.random() > 0.3,
                antivirus: Math.random() > 0.4,
                encrypted: Math.random() > 0.6,
                lastUpdate: new Date(Date.now() - Math.random() * 2592000000) // Random date within last 30 days
            }
        };
        
        connectedDevices.push(deviceInfo);
    }
    
    return connectedDevices;
}

// Generate network infrastructure details
function generateNetworkInfrastructure() {
    return {
        routers: [
            {
                model: 'Cisco ISR 2901',
                ip: generateRandomIP(),
                firmware: '15.7(3)M8',
                ports: 24,
                vlans: [1, 10, 20, 30],
                isManaged: true,
                hasVulnerabilities: Math.random() > 0.6
            },
            {
                model: 'Netgear R7000',
                ip: generateRandomIP(),
                firmware: 'V1.0.11.123',
                ports: 4,
                vlans: [1],
                isManaged: false,
                hasVulnerabilities: Math.random() > 0.3
            }
        ],
        switches: [
            {
                model: 'HP ProCurve 2524',
                ip: generateRandomIP(),
                ports: 24,
                managementVlan: 1,
                spanningTree: true,
                portSecurity: Math.random() > 0.5
            }
        ],
        accessPoints: [
            {
                ssid: 'CorporateWiFi',
                bssid: generateMacAddress(),
                channel: Math.floor(Math.random() * 11) + 1,
                encryption: 'WPA3',
                clientCount: Math.floor(Math.random() * 20) + 5
            },
            {
                ssid: 'Guest-Network',
                bssid: generateMacAddress(),
                channel: Math.floor(Math.random() * 11) + 1,
                encryption: 'WPA2',
                clientCount: Math.floor(Math.random() * 10) + 2
            }
        ],
        firewalls: [
            {
                model: 'pfSense',
                version: '2.7.0',
                ip: generateRandomIP(),
                rules: Math.floor(Math.random() * 100) + 50,
                logging: true,
                threatBlocking: Math.random() > 0.3
            }
        ]
    };
}

// Generate domain associations
function generateDomainAssociations(primaryAddress) {
    const domains = [
        'mail.' + primaryAddress.replace(/^www\./, ''),
        'ftp.' + primaryAddress.replace(/^www\./, ''),
        'api.' + primaryAddress.replace(/^www\./, ''),
        'admin.' + primaryAddress.replace(/^www\./, ''),
        'secure.' + primaryAddress.replace(/^www\./, ''),
        'backup.' + primaryAddress.replace(/^www\./, '')
    ];
    
    return domains.slice(0, Math.floor(Math.random() * 4) + 2).map(domain => ({
        domain: domain,
        ip: generateRandomIP(),
        isActive: Math.random() > 0.2,
        hasSSL: Math.random() > 0.3,
        lastChecked: new Date(Date.now() - Math.random() * 3600000),
        technologies: generateWebTechnologies(),
        vulnerabilities: Math.floor(Math.random() * 5)
    }));
}

// Generate IoT devices
function generateIoTDevices() {
    const iotTypes = [
        { name: 'Smart Thermostat', brand: 'Nest', model: 'Learning Thermostat' },
        { name: 'Security Camera', brand: 'Hikvision', model: 'DS-2CD2085G1' },
        { name: 'Smart Lock', brand: 'August', model: 'Smart Lock Pro' },
        { name: 'WiFi Speaker', brand: 'Sonos', model: 'One Gen2' },
        { name: 'Smart TV', brand: 'Samsung', model: 'QN55Q80A' },
        { name: 'Smart Doorbell', brand: 'Ring', model: 'Video Doorbell Pro' },
        { name: 'Smart Plug', brand: 'TP-Link', model: 'Kasa EP25' },
        { name: 'WiFi Printer', brand: 'HP', model: 'LaserJet Pro M404n' }
    ];
    
    const numDevices = Math.floor(Math.random() * 6) + 2;
    return iotTypes.slice(0, numDevices).map(device => ({
        ...device,
        ip: generateRandomIP(),
        mac: generateMacAddress(),
        firmware: generateRandomString(8),
        lastUpdate: new Date(Date.now() - Math.random() * 7776000000), // Random date within last 90 days
        isVulnerable: Math.random() > 0.5,
        defaultCredentials: Math.random() > 0.7,
        openPorts: generateRandomPorts().slice(0, 3),
        protocols: ['HTTP', 'HTTPS', 'UPnP', 'mDNS'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
}

// Generate network services
function generateNetworkServices() {
    const services = [
        { name: 'Active Directory', port: 389, version: '2019', critical: true },
        { name: 'DNS Server', port: 53, version: 'BIND 9.16', critical: true },
        { name: 'DHCP Server', port: 67, version: 'ISC DHCP 4.4', critical: true },
        { name: 'File Server', port: 445, version: 'SMB 3.1.1', critical: false },
        { name: 'Print Server', port: 631, version: 'CUPS 2.3', critical: false },
        { name: 'Web Server', port: 80, version: 'Apache 2.4.54', critical: false },
        { name: 'Database', port: 3306, version: 'MySQL 8.0', critical: true },
        { name: 'Email Server', port: 25, version: 'Postfix 3.6', critical: false }
    ];
    
    return services.filter(() => Math.random() > 0.4).map(service => ({
        ...service,
        status: Math.random() > 0.1 ? 'running' : 'stopped',
        connections: Math.floor(Math.random() * 100) + 10,
        lastRestart: new Date(Date.now() - Math.random() * 604800000), // Random date within last week
        hasVulnerabilities: Math.random() > 0.6,
        isPatched: Math.random() > 0.3,
        configIssues: Math.floor(Math.random() * 5)
    }));
}

// Helper functions
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateRandomPorts() {
    const commonPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 1433, 3306, 3389, 5432, 8080];
    const numPorts = Math.floor(Math.random() * 6) + 2;
    return commonPorts.sort(() => 0.5 - Math.random()).slice(0, numPorts);
}

function generateInstalledSoftware() {
    const software = [
        'Microsoft Office 365',
        'Google Chrome',
        'Mozilla Firefox',
        'Adobe Acrobat Reader',
        'VLC Media Player',
        'WinRAR',
        'Notepad++',
        'TeamViewer',
        'Skype',
        'Zoom'
    ];
    
    const numSoftware = Math.floor(Math.random() * 8) + 3;
    return software.sort(() => 0.5 - Math.random()).slice(0, numSoftware);
}

function generateWebTechnologies() {
    const techs = ['Apache', 'Nginx', 'PHP', 'MySQL', 'WordPress', 'jQuery', 'Bootstrap', 'CloudFlare'];
    const numTechs = Math.floor(Math.random() * 5) + 2;
    return techs.sort(() => 0.5 - Math.random()).slice(0, numTechs);
}

// Generate location data
function generateLocationData(address) {
    const locations = [
        { country: 'United States', city: 'New York', continent: 'North America', timezone: 'EST', isp: 'Cloudflare Inc.', coords: [40.7128, -74.0060] },
        { country: 'Germany', city: 'Berlin', continent: 'Europe', timezone: 'CET', isp: 'Deutsche Telekom', coords: [52.5200, 13.4050] },
        { country: 'Japan', city: 'Tokyo', continent: 'Asia', timezone: 'JST', isp: 'NTT Communications', coords: [35.6762, 139.6503] },
        { country: 'United Kingdom', city: 'London', continent: 'Europe', timezone: 'GMT', isp: 'British Telecom', coords: [51.5074, -0.1278] },
        { country: 'Australia', city: 'Sydney', continent: 'Oceania', timezone: 'AEST', isp: 'Telstra Corporation', coords: [-33.8688, 151.2093] }
    ];
    
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    return {
        ...location,
        zipCode: Math.floor(Math.random() * 90000) + 10000,
        organization: generateOrganization(),
        latitude: location.coords[0],
        longitude: location.coords[1]
    };
}

// Generate organization name
function generateOrganization() {
    const orgs = [
        'TechCorp International',
        'Global Systems Ltd',
        'DataFlow Networks',
        'SecureNet Solutions',
        'CloudTech Industries',
        'CyberSpace Inc.',
        'Digital Dynamics Corp',
        'NetGuard Systems'
    ];
    
    return orgs[Math.floor(Math.random() * orgs.length)];
}

// Generate network data
function generateNetworkData(address, type) {
    return {
        ipAddress: address.includes('.') ? address : generateRandomIP(),
        domain: type === 'website' ? address : generateRandomDomain(),
        ports: generateOpenPorts(),
        protocols: ['TCP', 'UDP', 'HTTP', 'HTTPS'],
        bandwidth: Math.floor(Math.random() * 1000) + 100 + ' Mbps',
        latency: Math.floor(Math.random() * 50) + 10 + ' ms',
        gateway: generateRandomIP(),
        dns: [generateRandomIP(), generateRandomIP()],
        subnet: generateSubnet()
    };
}

// Generate random IP
function generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Generate random domain
function generateRandomDomain() {
    const domains = ['example.com', 'testsite.org', 'demo-server.net', 'webservice.io'];
    return domains[Math.floor(Math.random() * domains.length)];
}

// Generate subnet
function generateSubnet() {
    return `192.168.${Math.floor(Math.random() * 255)}.0/24`;
}

// Generate open ports
function generateOpenPorts() {
    const commonPorts = [22, 80, 443, 21, 25, 53, 110, 143, 993, 995, 3306, 5432, 6379, 27017];
    const numPorts = Math.floor(Math.random() * 8) + 3;
    const selectedPorts = [];
    
    for (let i = 0; i < numPorts; i++) {
        const port = commonPorts[Math.floor(Math.random() * commonPorts.length)];
        if (!selectedPorts.includes(port)) {
            selectedPorts.push(port);
        }
    }
    
    return selectedPorts.sort((a, b) => a - b);
}

// Generate system data
function generateSystemData(output) {
    const systems = [
        { os: 'Ubuntu 20.04 LTS', kernel: '5.4.0-74-generic', arch: 'x86_64' },
        { os: 'Windows Server 2019', kernel: 'NT 10.0.17763', arch: 'x64' },
        { os: 'CentOS 8', kernel: '4.18.0-348.el8', arch: 'x86_64' },
        { os: 'macOS Big Sur', kernel: 'Darwin 20.6.0', arch: 'x86_64' }
    ];
    
    const system = systems[Math.floor(Math.random() * systems.length)];
    
    return {
        ...system,
        uptime: Math.floor(Math.random() * 365) + ' days',
        cpu: generateCPUInfo(),
        memory: generateMemoryInfo(),
        storage: generateStorageInfo(),
        services: extractServices(output)
    };
}

// Generate CPU info
function generateCPUInfo() {
    const cpus = [
        'Intel Xeon E5-2686 v4 @ 2.30GHz',
        'AMD EPYC 7571 @ 2.55GHz',
        'Intel Core i7-9700K @ 3.60GHz',
        'AMD Ryzen 9 3900X @ 3.80GHz'
    ];
    
    return {
        model: cpus[Math.floor(Math.random() * cpus.length)],
        cores: Math.pow(2, Math.floor(Math.random() * 4) + 1), // 2, 4, 8, 16
        threads: Math.pow(2, Math.floor(Math.random() * 5) + 2), // 4, 8, 16, 32, 64
        usage: Math.floor(Math.random() * 80) + 10 + '%'
    };
}

// Generate memory info
function generateMemoryInfo() {
    const sizes = [4, 8, 16, 32, 64, 128];
    const total = sizes[Math.floor(Math.random() * sizes.length)];
    const used = Math.floor(total * (Math.random() * 0.6 + 0.2)); // 20-80% usage
    
    return {
        total: total + ' GB',
        used: used + ' GB',
        free: (total - used) + ' GB',
        usage: Math.floor((used / total) * 100) + '%'
    };
}

// Generate storage info
function generateStorageInfo() {
    const sizes = [100, 250, 500, 1000, 2000];
    const total = sizes[Math.floor(Math.random() * sizes.length)];
    const used = Math.floor(total * (Math.random() * 0.7 + 0.1)); // 10-80% usage
    
    return {
        total: total + ' GB',
        used: used + ' GB',
        free: (total - used) + ' GB',
        usage: Math.floor((used / total) * 100) + '%',
        type: Math.random() > 0.5 ? 'SSD' : 'HDD'
    };
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
    if (output.includes('53') || output.includes('DNS')) services.push('DNS (53)');
    
    // Add some random services if none found
    if (services.length === 0) {
        const defaultServices = ['HTTP (80)', 'HTTPS (443)', 'SSH (22)'];
        services.push(...defaultServices.slice(0, Math.floor(Math.random() * 3) + 1));
    }
    
    return services;
}

// Generate security data
function generateSecurityData(output) {
    const threatLevel = Math.floor(Math.random() * 100);
    
    return {
        threatLevel: threatLevel,
        threatCategory: getThreatCategory(threatLevel),
        firewall: Math.random() > 0.3 ? 'Active' : 'Disabled',
        antivirus: Math.random() > 0.4 ? 'Active' : 'Disabled',
        encryption: Math.random() > 0.6 ? 'Enabled' : 'Disabled',
        authentication: generateAuthMethods(),
        patches: Math.random() > 0.5 ? 'Up to date' : 'Outdated',
        accessLevel: determineAccessLevel(output)
    };
}

// Get threat category
function getThreatCategory(level) {
    if (level >= 80) return 'Critical';
    if (level >= 60) return 'High';
    if (level >= 40) return 'Medium';
    return 'Low';
}

// Generate authentication methods
function generateAuthMethods() {
    const methods = ['Password', '2FA', 'Certificate', 'Biometric', 'Token'];
    const numMethods = Math.floor(Math.random() * 3) + 1;
    const selected = [];
    
    for (let i = 0; i < numMethods; i++) {
        const method = methods[Math.floor(Math.random() * methods.length)];
        if (!selected.includes(method)) {
            selected.push(method);
        }
    }
    
    return selected;
}

// Determine access level
function determineAccessLevel(output) {
    if (output.includes('root') || output.includes('admin') || output.includes('SYSTEM')) {
        return 'Administrator';
    } else if (output.includes('user') || output.includes('shell')) {
        return 'User';
    } else if (output.includes('database') || output.includes('sql')) {
        return 'Database';
    }
    return 'Limited';
}

// Extract vulnerabilities
function extractVulnerabilities(output) {
    const vulnerabilities = [];
    
    if (output.includes('SQL injection') || output.includes('sqlmap')) {
        vulnerabilities.push({
            type: 'SQL Injection',
            severity: 'Critical',
            cvss: 9.8,
            exploitable: true,
            patched: false
        });
    }
    
    if (output.includes('XSS') || output.includes('script')) {
        vulnerabilities.push({
            type: 'Cross-Site Scripting',
            severity: 'High', 
            cvss: 8.1,
            exploitable: true,
            patched: false
        });
    }
    
    if (output.includes('CVE-')) {
        vulnerabilities.push({
            type: 'Known CVE',
            severity: 'High',
            cvss: 8.5,
            exploitable: true,
            patched: Math.random() > 0.7
        });
    }
    
    // Add some default vulnerabilities if none found
    if (vulnerabilities.length === 0) {
        vulnerabilities.push({
            type: 'Weak Configuration',
            severity: 'Medium',
            cvss: 6.2,
            exploitable: false,
            patched: false
        });
    }
    
    return vulnerabilities;
}

// Generate timeline data
function generateTimelineData(command) {
    const timeline = [
        {
            time: new Date(command.timestamp),
            event: 'Target Discovered',
            type: 'discovery',
            details: 'Initial target identification and reconnaissance'
        },
        {
            time: new Date(Date.now() - Math.random() * 3600000),
            event: 'Vulnerability Scan',
            type: 'scan',
            details: 'Comprehensive vulnerability assessment completed'
        },
        {
            time: new Date(Date.now() - Math.random() * 1800000),
            event: 'Exploitation Attempt',
            type: 'exploit',
            details: 'First exploitation attempt launched'
        },
        {
            time: new Date(),
            event: 'Access Gained',
            type: 'success',
            details: 'Successful compromise achieved'
        }
    ];
    
    return timeline.sort((a, b) => a.time - b.time);
}

// Generate forensic data
function generateForensicData(output) {
    return {
        artifacts: generateArtifacts(),
        processes: generateProcesses(),
        networkConnections: generateNetworkConnections(),
        files: generateFileAccess(),
        registry: generateRegistryAccess(),
        logs: generateLogEntries()
    };
}

// Generate artifacts
function generateArtifacts() {
    return [
        { type: 'Browser History', count: Math.floor(Math.random() * 1000) + 100 },
        { type: 'Temporary Files', count: Math.floor(Math.random() * 500) + 50 },
        { type: 'Registry Entries', count: Math.floor(Math.random() * 200) + 20 },
        { type: 'Event Logs', count: Math.floor(Math.random() * 10000) + 1000 }
    ];
}

// Generate processes
function generateProcesses() {
    const processes = [
        'explorer.exe', 'chrome.exe', 'firefox.exe', 'notepad.exe',
        'cmd.exe', 'powershell.exe', 'svchost.exe', 'lsass.exe'
    ];
    
    return processes.map(proc => ({
        name: proc,
        pid: Math.floor(Math.random() * 9999) + 1000,
        cpu: Math.floor(Math.random() * 100) + '%',
        memory: Math.floor(Math.random() * 500) + 'MB'
    }));
}

// Generate network connections
function generateNetworkConnections() {
    const connections = [];
    const numConnections = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < numConnections; i++) {
        connections.push({
            localPort: Math.floor(Math.random() * 65535) + 1024,
            remoteAddress: generateRandomIP(),
            remotePort: Math.floor(Math.random() * 65535) + 1,
            protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
            state: Math.random() > 0.3 ? 'ESTABLISHED' : 'LISTENING'
        });
    }
    
    return connections;
}

// Generate file access
function generateFileAccess() {
    const files = [
        'C:\\Users\\Admin\\Documents\\passwords.txt',
        'C:\\Windows\\System32\\config\\SAM',
        '/etc/passwd',
        '/var/log/auth.log',
        '~/.ssh/id_rsa',
        '/home/user/.bashrc'
    ];
    
    return files.map(file => ({
        path: file,
        accessed: new Date(Date.now() - Math.random() * 86400000),
        modified: new Date(Date.now() - Math.random() * 172800000),
        size: Math.floor(Math.random() * 10000) + 'B'
    }));
}

// Generate registry access
function generateRegistryAccess() {
    const keys = [
        'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
        'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer',
        'HKLM\\SYSTEM\\CurrentControlSet\\Services'
    ];
    
    return keys.map(key => ({
        key: key,
        action: Math.random() > 0.5 ? 'Read' : 'Write',
        timestamp: new Date(Date.now() - Math.random() * 3600000)
    }));
}

// Generate log entries
function generateLogEntries() {
    const entries = [];
    const numEntries = Math.floor(Math.random() * 20) + 10;
    
    for (let i = 0; i < numEntries; i++) {
        entries.push({
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            level: Math.random() > 0.7 ? 'ERROR' : Math.random() > 0.5 ? 'WARNING' : 'INFO',
            source: 'Security',
            message: generateLogMessage()
        });
    }
    
    return entries.sort((a, b) => b.timestamp - a.timestamp);
}

// Generate log message
function generateLogMessage() {
    const messages = [
        'Failed login attempt detected',
        'Suspicious network activity',
        'File access violation',
        'Registry modification detected',
        'Process creation anomaly',
        'Network connection established'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

// Initialize real-time stats
function initializeRealTimeStats() {
    return {
        dataTraffic: 0,
        activeThreats: Math.floor(Math.random() * 5),
        exploitAttempts: Math.floor(Math.random() * 10),
        openConnections: Math.floor(Math.random() * 20) + 5
    };
}

// Set current target and display details
function setCurrentTarget(target) {
    currentTarget = target;
    
    // Update header
    document.getElementById('targetTitle').textContent = `🎯 ${target.address}`;
    document.getElementById('targetSubtitle').textContent = `${target.type} - ${target.security.threatCategory} Risk`;
    
    // Show content
    document.getElementById('targetContent').style.display = 'block';
    
    // Update all sections
    updateLocationInfo(target.location);
    updateNetworkInfo(target.network);
    updateSystemInfo(target.system);
    updateSecurityInfo(target.security);
    updateLocationDetails(target.location);
    updateNetworkTopology(target);
    updateVulnerabilityTimeline(target.timeline);
    updateForensicAnalysis(target.forensics);
    
    // Start real-time monitoring
    startRealTimeUpdates();
}

// Update location information
function updateLocationInfo(location) {
    document.getElementById('locationInfo').innerHTML = `
        <div><strong>🌍 الدولة:</strong> ${location.country}</div>
        <div><strong>🏙️ المدينة:</strong> ${location.city}</div>
        <div><strong>📡 مزود الخدمة:</strong> ${location.isp}</div>
        <div><strong>🕐 المنطقة الزمنية:</strong> ${location.timezone}</div>
    `;
    
    document.getElementById('coordinates').textContent = 
        `📍 الإحداثيات: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
}

// Update network information
function updateNetworkInfo(network) {
    document.getElementById('networkInfo').innerHTML = `
        <div><strong>🌐 عنوان IP:</strong> ${network.ipAddress}</div>
        <div><strong>🔗 الدومين:</strong> ${network.domain}</div>
        <div><strong>📡 عرض النطاق:</strong> ${network.bandwidth}</div>
        <div><strong>⚡ زمن الاستجابة:</strong> ${network.latency}</div>
        <div><strong>🚪 المنافذ المفتوحة:</strong> ${network.ports.join(', ')}</div>
    `;
}

// Update system information
function updateSystemInfo(system) {
    document.getElementById('systemInfo').innerHTML = `
        <div><strong>💻 نظام التشغيل:</strong> ${system.os}</div>
        <div><strong>🔧 المعالج:</strong> ${system.cpu.model}</div>
        <div><strong>💾 الذاكرة:</strong> ${system.memory.used} / ${system.memory.total}</div>
        <div><strong>💽 التخزين:</strong> ${system.storage.used} / ${system.storage.total}</div>
        <div><strong>⏱️ وقت التشغيل:</strong> ${system.uptime}</div>
    `;
}

// Update security information
function updateSecurityInfo(security) {
    document.getElementById('securityInfo').innerHTML = `
        <div><strong>🔐 مستوى الوصول:</strong> ${security.accessLevel}</div>
        <div><strong>🛡️ جدار الحماية:</strong> ${security.firewall}</div>
        <div><strong>🦠 مكافح الفيروسات:</strong> ${security.antivirus}</div>
        <div><strong>🔒 التشفير:</strong> ${security.encryption}</div>
        <div><strong>🔑 المصادقة:</strong> ${security.authentication.join(', ')}</div>
    `;
    
    // Update threat meter
    const threatFill = document.getElementById('threatLevel');
    threatFill.style.width = security.threatLevel + '%';
}

// Update location details tab
function updateLocationDetails(location) {
    document.getElementById('continent').textContent = location.continent;
    document.getElementById('country').textContent = location.country;
    document.getElementById('city').textContent = location.city;
    document.getElementById('zipCode').textContent = location.zipCode;
    document.getElementById('timezone').textContent = location.timezone;
    document.getElementById('isp').textContent = location.isp;
    document.getElementById('organization').textContent = location.organization;
    
    // Create map visualization
    createMapVisualization(location);
}

// Create map visualization
function createMapVisualization(location) {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.innerHTML = `
        <div style="width: 100%; height: 250px; background: linear-gradient(45deg, #000, #003300); border: 1px solid #00ff00; border-radius: 5px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #00ff00; text-align: center;">
                <div style="font-size: 24px;">🗺️</div>
                <div style="margin: 10px 0;">${location.city}, ${location.country}</div>
                <div style="font-size: 12px; color: #888;">📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</div>
            </div>
            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); padding: 5px 10px; border-radius: 3px; color: #00ff00; font-size: 12px;">
                🌐 Live Location
            </div>
        </div>
    `;
}

// Update network topology
function updateNetworkTopology(target) {
    const container = document.getElementById('topologyContainer');
    container.innerHTML = '';
    
    // Create network nodes
    const nodes = [
        { id: 'target', label: target.address, x: 250, y: 150, type: 'target' },
        { id: 'gateway', label: target.network.gateway, x: 150, y: 100, type: 'gateway' },
        { id: 'dns1', label: target.network.dns[0], x: 350, y: 100, type: 'dns' },
        { id: 'dns2', label: target.network.dns[1], x: 350, y: 200, type: 'dns' },
        { id: 'subnet', label: target.network.subnet, x: 150, y: 200, type: 'subnet' }
    ];
    
    // Create connections
    const connections = [
        { from: 'target', to: 'gateway' },
        { from: 'target', to: 'dns1' },
        { from: 'target', to: 'dns2' },
        { from: 'gateway', to: 'subnet' }
    ];
    
    // Draw connections
    connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        const line = document.createElement('div');
        line.className = 'connection-line';
        
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        line.style.width = length + 'px';
        line.style.left = fromNode.x + 'px';
        line.style.top = fromNode.y + 'px';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0';
        
        container.appendChild(line);
    });
    
    // Draw nodes
    nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'topology-node';
        nodeEl.style.left = (node.x - 30) + 'px';
        nodeEl.style.top = (node.y - 30) + 'px';
        nodeEl.title = node.label;
        
        const icon = getNodeIcon(node.type);
        nodeEl.innerHTML = `<div style="font-size: 20px;">${icon}</div>`;
        
        container.appendChild(nodeEl);
    });
    
    // Update network details
    updateNetworkDetails(target.network);
}

// Get node icon
function getNodeIcon(type) {
    const icons = {
        target: '🎯',
        gateway: '🚪',
        dns: '🌐',
        subnet: '🏠'
    };
    return icons[type] || '📡';
}

// Update network details
function updateNetworkDetails(network) {
    document.getElementById('networkDetails').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div style="background: #111; padding: 15px; border-radius: 8px;">
                <h5>🌐 Network Configuration</h5>
                <div>IP Address: ${network.ipAddress}</div>
                <div>Gateway: ${network.gateway}</div>
                <div>Subnet: ${network.subnet}</div>
            </div>
            <div style="background: #111; padding: 15px; border-radius: 8px;">
                <h5>📡 DNS Servers</h5>
                <div>Primary: ${network.dns[0]}</div>
                <div>Secondary: ${network.dns[1]}</div>
            </div>
            <div style="background: #111; padding: 15px; border-radius: 8px;">
                <h5>🚪 Open Ports</h5>
                <div>${network.ports.join(', ')}</div>
            </div>
            <div style="background: #111; padding: 15px; border-radius: 8px;">
                <h5>⚡ Performance</h5>
                <div>Bandwidth: ${network.bandwidth}</div>
                <div>Latency: ${network.latency}</div>
            </div>
        </div>
    `;
}

// Update vulnerability timeline
function updateVulnerabilityTimeline(timeline) {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';
    
    timeline.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        timelineItem.innerHTML = `
            <div style="margin-left: 20px;">
                <h4>${item.event}</h4>
                <div style="color: #888; font-size: 14px; margin: 5px 0;">
                    ${item.time.toLocaleString('ar-SA')}
                </div>
                <div style="margin: 10px 0;">
                    ${item.details}
                </div>
                <div style="font-size: 12px; color: #666;">
                    النوع: ${item.type}
                </div>
            </div>
        `;
        
        container.appendChild(timelineItem);
    });
}

// Update forensic analysis
function updateForensicAnalysis(forensics) {
    const container = document.getElementById('forensicContainer');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                <h4>🗂️ Digital Artifacts</h4>
                ${forensics.artifacts.map(artifact => `
                    <div style="margin: 10px 0; display: flex; justify-content: space-between;">
                        <span>${artifact.type}</span>
                        <span style="color: #ff4444;">${artifact.count}</span>
                    </div>
                `).join('')}
            </div>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                <h4>⚙️ Running Processes</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${forensics.processes.slice(0, 5).map(proc => `
                        <div style="margin: 5px 0; font-family: monospace; font-size: 12px;">
                            <div>${proc.name} (PID: ${proc.pid})</div>
                            <div style="color: #888;">CPU: ${proc.cpu}, RAM: ${proc.memory}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                <h4>🌐 Network Connections</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${forensics.networkConnections.slice(0, 5).map(conn => `
                        <div style="margin: 5px 0; font-family: monospace; font-size: 12px;">
                            <div>${conn.localPort} → ${conn.remoteAddress}:${conn.remotePort}</div>
                            <div style="color: #888;">${conn.protocol} - ${conn.state}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                <h4>📋 Recent Log Entries</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${forensics.logs.slice(0, 5).map(log => `
                        <div style="margin: 8px 0; font-size: 12px;">
                            <div style="color: ${log.level === 'ERROR' ? '#ff4444' : log.level === 'WARNING' ? '#ffaa00' : '#888'};">
                                [${log.level}] ${log.message}
                            </div>
                            <div style="color: #666; font-size: 10px;">
                                ${log.timestamp.toLocaleString('ar-SA')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Show advanced tab
function showAdvancedTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content-advanced');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-advanced');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Initialize chart
function initializeChart() {
    const canvas = document.getElementById('activityChart');
    const ctx = canvas.getContext('2d');
    
    // Initialize empty chart data
    for (let i = 0; i < maxDataPoints; i++) {
        chartData.push(0);
    }
    
    // Draw initial chart
    drawChart(ctx, canvas);
}

// Draw chart
function drawChart(ctx, canvas) {
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw data line
    if (chartData.length > 1) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const stepX = width / (chartData.length - 1);
        
        for (let i = 0; i < chartData.length; i++) {
            const x = i * stepX;
            const y = height - (chartData[i] / 100) * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }
}

// Start real-time updates
function startRealTimeUpdates() {
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
    }
    
    realTimeInterval = setInterval(() => {
        if (currentTarget) {
            updateRealTimeStats();
            updateActivityChart();
        }
    }, 2000);
}

// Update real-time statistics
function updateRealTimeStats() {
    const stats = currentTarget.realTimeStats;
    
    // Update stats with random variations
    stats.dataTraffic = Math.floor(Math.random() * 100) + 50;
    stats.activeThreats += Math.floor(Math.random() * 3) - 1;
    stats.exploitAttempts += Math.floor(Math.random() * 2);
    stats.openConnections += Math.floor(Math.random() * 5) - 2;
    
    // Ensure non-negative values
    stats.activeThreats = Math.max(0, stats.activeThreats);
    stats.openConnections = Math.max(5, stats.openConnections);
    
    // Update display
    document.getElementById('dataTraffic').textContent = stats.dataTraffic + ' MB/s';
    document.getElementById('activeThreats').textContent = stats.activeThreats;
    document.getElementById('exploitAttempts').textContent = stats.exploitAttempts;
    document.getElementById('openConnections').textContent = stats.openConnections;
}

// Update activity chart
function updateActivityChart() {
    // Add new data point
    const newValue = currentTarget.realTimeStats.dataTraffic;
    chartData.push(newValue);
    
    // Remove old data points
    if (chartData.length > maxDataPoints) {
        chartData.shift();
    }
    
    // Redraw chart
    const canvas = document.getElementById('activityChart');
    const ctx = canvas.getContext('2d');
    drawChart(ctx, canvas);
}

// Load targets list for selection
function loadTargetsList() {
    const modal = document.getElementById('targetSelectionModal');
    const container = document.getElementById('targetsListContainer');
    
    fetch(`${apiUrl}/commands`)
        .then(response => response.json())
        .then(data => {
            const targets = parseTargetsFromCommands(data);
            
            container.innerHTML = '';
            
            if (targets.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">لا توجد أهداف متاحة</div>';
            } else {
                targets.forEach(target => {
                    const targetDiv = document.createElement('div');
                    targetDiv.style.cssText = `
                        background: #111;
                        border: 1px solid #333;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 10px 0;
                        cursor: pointer;
                        transition: all 0.3s;
                    `;
                    
                    targetDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: bold; color: #00ff00;">${target.address}</div>
                                <div style="color: #888; font-size: 14px;">${target.type} - ${target.security?.threatCategory || 'Unknown'} Risk</div>
                            </div>
                            <div style="color: #ff4444;">
                                ${target.vulnerabilities?.length || 0} ثغرات
                            </div>
                        </div>
                    `;
                    
                    targetDiv.addEventListener('mouseenter', function() {
                        this.style.background = '#222';
                        this.style.borderColor = '#00ff00';
                    });
                    
                    targetDiv.addEventListener('mouseleave', function() {
                        this.style.background = '#111';
                        this.style.borderColor = '#333';
                    });
                    
                    targetDiv.addEventListener('click', function() {
                        setCurrentTarget(target);
                        closeTargetSelection();
                    });
                    
                    container.appendChild(targetDiv);
                });
            }
            
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('خطأ في تحميل الأهداف:', error);
            alert('❌ فشل في تحميل قائمة الأهداف');
        });
}

// Close target selection modal
function closeTargetSelection() {
    document.getElementById('targetSelectionModal').style.display = 'none';
}

// Export target report
function exportTargetReport() {
    if (!currentTarget) {
        alert('❌ لا يوجد هدف محدد للتصدير');
        return;
    }
    
    const report = generateDetailedTargetReport(currentTarget);
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `target-details-${currentTarget.address}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ تم تصدير التقرير بنجاح');
}

// Generate detailed target report
function generateDetailedTargetReport(target) {
    return `
YUSR-TEC - تقرير تفاصيل الهدف المتقدم
====================================

الهدف: ${target.address}
النوع: ${target.type}
تاريخ الاكتشاف: ${target.discoveredAt.toLocaleString('ar-SA')}
تاريخ الاختراق: ${target.compromisedAt.toLocaleString('ar-SA')}

📍 معلومات الموقع الجغرافي:
=============================
القارة: ${target.location.continent}
الدولة: ${target.location.country}
المدينة: ${target.location.city}
الرمز البريدي: ${target.location.zipCode}
المنطقة الزمنية: ${target.location.timezone}
الإحداثيات: ${target.location.latitude}, ${target.location.longitude}
مزود الخدمة: ${target.location.isp}
المنظمة: ${target.location.organization}

🌐 معلومات الشبكة:
===================
عنوان IP: ${target.network.ipAddress}
الدومين: ${target.network.domain}
الشبكة الفرعية: ${target.network.subnet}
البوابة: ${target.network.gateway}
خوادم DNS: ${target.network.dns.join(', ')}
المنافذ المفتوحة: ${target.network.ports.join(', ')}
عرض النطاق: ${target.network.bandwidth}
زمن الاستجابة: ${target.network.latency}

💻 معلومات النظام:
==================
نظام التشغيل: ${target.system.os}
الإصدار: ${target.system.kernel}
المعمارية: ${target.system.arch}
وقت التشغيل: ${target.system.uptime}

المعالج: ${target.system.cpu.model}
الأنوية: ${target.system.cpu.cores}
الخيوط: ${target.system.cpu.threads}
استخدام المعالج: ${target.system.cpu.usage}

الذاكرة الإجمالية: ${target.system.memory.total}
الذاكرة المستخدمة: ${target.system.memory.used}
الذاكرة المتاحة: ${target.system.memory.free}
نسبة استخدام الذاكرة: ${target.system.memory.usage}

مساحة التخزين الإجمالية: ${target.system.storage.total}
المساحة المستخدمة: ${target.system.storage.used}
المساحة المتاحة: ${target.system.storage.free}
نوع التخزين: ${target.system.storage.type}

الخدمات المكتشفة: ${target.system.services.join(', ')}

🔐 تقييم الأمان:
================
مستوى التهديد: ${target.security.threatLevel}% (${target.security.threatCategory})
مستوى الوصول: ${target.security.accessLevel}
جدار الحماية: ${target.security.firewall}
مكافح الفيروسات: ${target.security.antivirus}
التشفير: ${target.security.encryption}
طرق المصادقة: ${target.security.authentication.join(', ')}
حالة التحديثات: ${target.security.patches}

⚠️ الثغرات المكتشفة:
=====================
${target.vulnerabilities.map((vuln, index) => `
${index + 1}. ${vuln.type}
   الخطورة: ${vuln.severity}
   CVSS: ${vuln.cvss}
   قابلة للاستغلال: ${vuln.exploitable ? 'نعم' : 'لا'}
   مُصححة: ${vuln.patched ? 'نعم' : 'لا'}
`).join('')}

⏰ التسلسل الزمني:
==================
${target.timeline.map(item => `
${item.time.toLocaleString('ar-SA')} - ${item.event}
النوع: ${item.type}
التفاصيل: ${item.details}
`).join('\n')}

🔬 البيانات الجنائية:
====================
القطع الأثرية الرقمية:
${target.forensics.artifacts.map(artifact => `- ${artifact.type}: ${artifact.count}`).join('\n')}

العمليات النشطة:
${target.forensics.processes.slice(0, 10).map(proc => `- ${proc.name} (PID: ${proc.pid}) - CPU: ${proc.cpu}, RAM: ${proc.memory}`).join('\n')}

الاتصالات الشبكية:
${target.forensics.networkConnections.slice(0, 10).map(conn => `- ${conn.localPort} → ${conn.remoteAddress}:${conn.remotePort} (${conn.protocol})`).join('\n')}

========================================
تم إنشاء هذا التقرير بواسطة YUSR-TEC v2.0
تاريخ التقرير: ${new Date().toLocaleString('ar-SA')}
`;
}

// Start real-time monitoring
function startRealTimeMonitoring() {
    if (!currentTarget) {
        alert('❌ لا يوجد هدف محدد للمراقبة');
        return;
    }
    
    alert(`📡 بدء المراقبة المباشرة للهدف: ${currentTarget.address}`);
    
    // Enhanced real-time updates
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
    }
    
    realTimeInterval = setInterval(() => {
        updateRealTimeStats();
        updateActivityChart();
        simulateRealTimeEvents();
    }, 1000); // Update every second for more responsive monitoring
}

// Simulate real-time events
function simulateRealTimeEvents() {
    if (Math.random() > 0.9) { // 10% chance
        const events = [
            'تم اكتشاف نشاط مشبوه',
            'محاولة اتصال جديدة',
            'تغيير في حالة الملفات',
            'نشاط شبكي غير عادي',
            'محاولة تصعيد صلاحيات'
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        console.log(`🚨 [Real-time] ${event} - ${currentTarget.address}`);
    }
}

// Add navigation link to all pages
function addNavigationToPages() {
    // This function would be called from other pages to add navigation
    const pages = ['index.html', 'targets.html', 'visual-targets.html', 'reports.html', 'hacker.html', 'analysis.html'];
    
    pages.forEach(page => {
        // Add target details link to navigation if it doesn't exist
        const nav = document.querySelector('nav');
        if (nav && !nav.querySelector('a[href="target-details.html"]')) {
            const link = document.createElement('button');
            link.onclick = () => window.location.href = 'target-details.html';
            link.style.cssText = 'background: #0066cc; color: #fff; margin: 0 10px;';
            link.textContent = '🎯 تفاصيل الهدف';
            nav.appendChild(link);
        }
    });
}

// Global functions for cross-page integration
window.openTargetDetails = function(targetAddress) {
    window.location.href = `target-details.html?target=${encodeURIComponent(targetAddress)}`;
};

window.shareTargetData = function(targetData) {
    // Function to receive target data from other pages
    if (targetData) {
        setCurrentTarget(targetData);
    }
};
