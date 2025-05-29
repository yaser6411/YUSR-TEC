
// YUSR-TEC Global AI Coordinator
// Manages all AI systems and ensures continuous operation

class AICoordinator {
    constructor() {
        this.aiSystems = new Map();
        this.isRunning = false;
        this.upgradeSchedule = [];
        this.lastUpgrade = Date.now();
        
        console.log('👑 YUSR-TEC AI Coordinator Initialized');
        this.initializeAISystems();
    }

    initializeAISystems() {
        // Register all AI systems
        this.aiSystems.set('selfLearning', {
            instance: window.selfLearningAI,
            status: 'stopped',
            lastActivity: Date.now(),
            importance: 'critical'
        });
        
        this.aiSystems.set('autonomous', {
            instance: window.autonomousAI, 
            status: 'stopped',
            lastActivity: Date.now(),
            importance: 'critical'
        });
        
        console.log(`🤖 Registered ${this.aiSystems.size} AI systems`);
    }

    async startAllAI() {
        this.isRunning = true;
        console.log('🚀 Starting All AI Systems - Persistent Mode');
        
        // Start monitoring and management
        this.startMonitoring();
        
        // Start all AI systems
        for (const [name, system] of this.aiSystems) {
            await this.startAISystem(name, system);
        }
        
        // Start continuous upgrade cycle
        this.startUpgradeCycle();
    }

    async startAISystem(name, system) {
        try {
            console.log(`⚡ Starting ${name} AI system...`);
            
            if (system.instance && typeof system.instance.startAutonomousLearning === 'function') {
                system.instance.startAutonomousLearning();
            } else if (system.instance && typeof system.instance.startAutonomousScanning === 'function') {
                system.instance.startAutonomousScanning();
            }
            
            system.status = 'running';
            system.lastActivity = Date.now();
            
            console.log(`✅ ${name} AI system started successfully`);
        } catch (error) {
            console.log(`❌ Failed to start ${name}: ${error.message}`);
            // Schedule retry
            setTimeout(() => this.startAISystem(name, system), 5000);
        }
    }

    startMonitoring() {
        console.log('👁️ AI Monitoring System Active');
        
        setInterval(() => {
            this.monitorAISystems();
            this.ensureContinuousOperation();
        }, 30000); // Monitor every 30 seconds
    }

    monitorAISystems() {
        for (const [name, system] of this.aiSystems) {
            const timeSinceActivity = Date.now() - system.lastActivity;
            
            // Check if AI system is still active
            if (system.instance && !system.instance.isActive) {
                console.log(`⚠️ ${name} AI detected as inactive - restarting...`);
                this.restartAISystem(name, system);
            }
            
            // Check for timeout (no activity for 2 minutes)
            if (timeSinceActivity > 120000) {
                console.log(`⏰ ${name} AI timeout detected - forcing restart...`);
                this.restartAISystem(name, system);
            }
        }
    }

    async restartAISystem(name, system) {
        console.log(`🔄 Restarting ${name} AI system...`);
        
        try {
            // Stop if running
            if (system.instance && system.instance.stop) {
                system.instance.stop();
            }
            
            // Wait a moment
            await this.sleep(2000);
            
            // Restart
            await this.startAISystem(name, system);
            
        } catch (error) {
            console.log(`❌ Failed to restart ${name}: ${error.message}`);
        }
    }

    ensureContinuousOperation() {
        // Ensure at least one AI system is always running
        let activeCount = 0;
        
        for (const [name, system] of this.aiSystems) {
            if (system.instance && system.instance.isActive) {
                activeCount++;
            }
        }
        
        if (activeCount === 0) {
            console.log('🚨 No AI systems active - emergency restart!');
            this.emergencyRestart();
        }
        
        console.log(`📊 AI Status: ${activeCount}/${this.aiSystems.size} systems active`);
    }

    async emergencyRestart() {
        console.log('🆘 Emergency AI Restart Sequence');
        
        for (const [name, system] of this.aiSystems) {
            if (system.importance === 'critical') {
                console.log(`🚨 Emergency starting ${name}...`);
                await this.startAISystem(name, system);
                await this.sleep(1000);
            }
        }
    }

    startUpgradeCycle() {
        console.log('🔧 AI Upgrade Cycle Started');
        
        setInterval(() => {
            this.performSystemUpgrades();
        }, 300000); // Upgrade every 5 minutes
    }

    async performSystemUpgrades() {
        console.log('⬆️ Performing System-Wide AI Upgrades');
        
        const upgrades = [
            'Enhanced threat detection algorithms',
            'Improved exploitation techniques',
            'Advanced evasion mechanisms', 
            'Optimized resource utilization',
            'Enhanced learning capabilities',
            'Better persistence methods'
        ];
        
        const upgrade = upgrades[Math.floor(Math.random() * upgrades.length)];
        console.log(`🚀 Applying upgrade: ${upgrade}`);
        
        // Apply upgrade to all AI systems
        for (const [name, system] of this.aiSystems) {
            this.applyUpgradeToSystem(name, upgrade);
        }
        
        this.lastUpgrade = Date.now();
    }

    applyUpgradeToSystem(systemName, upgrade) {
        console.log(`🔧 Applying '${upgrade}' to ${systemName}`);
        
        // Simulate upgrade application
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
            console.log(`✅ Upgrade applied to ${systemName} successfully`);
        } else {
            console.log(`❌ Upgrade failed for ${systemName} - will retry later`);
        }
    }

    // Force stop all AI (only when user explicitly requests)
    async stopAllAI() {
        console.log('⚠️ User requested AI shutdown');
        
        this.isRunning = false;
        
        for (const [name, system] of this.aiSystems) {
            if (system.instance && system.instance.stop) {
                console.log(`⏹️ Stopping ${name}...`);
                system.instance.stop();
                system.status = 'stopped';
            }
        }
        
        console.log('⏹️ All AI systems stopped by user request');
    }

    // Get comprehensive AI status
    getAIStatus() {
        const status = {
            coordinator: this.isRunning ? 'active' : 'inactive',
            systems: {},
            totalActive: 0,
            lastUpgrade: new Date(this.lastUpgrade).toLocaleString('ar-SA')
        };
        
        for (const [name, system] of this.aiSystems) {
            status.systems[name] = {
                status: system.instance?.isActive ? 'active' : 'inactive',
                lastActivity: new Date(system.lastActivity).toLocaleString('ar-SA')
            };
            
            if (system.instance?.isActive) {
                status.totalActive++;
            }
        }
        
        return status;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global AI coordinator
const aiCoordinator = new AICoordinator();

// Auto-start everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('👑 AI Coordinator Ready');
    
    // Wait for other AI systems to initialize
    setTimeout(() => {
        console.log('🚀 Starting coordinated AI systems...');
        aiCoordinator.startAllAI();
    }, 2000);
});

// Make globally available
window.aiCoordinator = aiCoordinator;

// Prevent accidental shutdowns
window.addEventListener('beforeunload', function(e) {
    if (aiCoordinator.isRunning) {
        e.preventDefault();
        e.returnValue = 'All AI systems are running. Stop them first before leaving.';
        return 'All AI systems are running. Stop them first before leaving.';
    }
});
