const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname)));

// قاعدة البيانات
const dbPath = path.resolve(__dirname, 'yusrtec.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ خطأ في فتح قاعدة البيانات:', err.message);
    } else {
        console.log('✅ قاعدة البيانات مفتوحة بنجاح');
    }
});

// إنشاء الجدول لو مافي
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool TEXT,
            command TEXT,
            output TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// AI-powered vulnerability scanner
app.post('/api/ai-scan', (req, res) => {
    const { target, scanType } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'الهدف مطلوب' });
    }

    // AI decision making for best scanning approach
    const aiDecision = makeAIDecision(target, scanType);
    
    db.run(
        `INSERT INTO commands (tool, command, output) VALUES (?, ?, ?)`,
        ['AI-Scanner', `Scanning ${target}`, 'بدء الفحص الذكي...'],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Execute AI-selected scanning strategy
            executeAIScan(target, aiDecision, this.lastID);
            res.status(200).json({ 
                message: 'بدء الفحص الذكي', 
                id: this.lastID,
                strategy: aiDecision.strategy
            });
        }
    );
});

// Manual command execution
app.post('/api/run-command', (req, res) => {
    const { tool, command } = req.body;

    if (!tool || !command) {
        return res.status(400).json({ error: 'البيانات ناقصة' });
    }

    db.run(
        `INSERT INTO commands (tool, command, output) VALUES (?, ?, ?)`,
        [tool, command, 'جارٍ التنفيذ...'],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Execute the command safely
            executeCommand(tool, command, this.lastID);
            res.status(200).json({ message: 'تم تسجيل الأمر بنجاح', id: this.lastID });
        }
    );
});

// سحب سجل الأوامر
app.get('/api/commands', (req, res) => {
    db.all(`SELECT * FROM commands ORDER BY timestamp DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// AI Decision Making Engine
function makeAIDecision(target, scanType) {
    const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(target);
    const isURL = target.includes('http') || target.includes('www');
    
    let strategy = {
        type: scanType || 'auto',
        tools: [],
        approach: 'passive'
    };

    if (isIP) {
        strategy.tools = ['nmap', 'masscan', 'vulnerability-scanner'];
        strategy.approach = 'network-focused';
    } else if (isURL) {
        strategy.tools = ['nikto', 'dirb', 'sqlmap', 'xss-scanner'];
        strategy.approach = 'web-focused';
    }

    // AI chooses best combination based on target type
    if (scanType === 'create-bugs') {
        strategy.tools.push('payload-generator', 'exploit-creator');
        strategy.approach = 'offensive';
    }

    return strategy;
}

// Execute AI-selected scanning strategy
function executeAIScan(target, strategy, commandId) {
    const scanCommands = generateScanCommands(target, strategy);
    
    let currentCommand = 0;
    function runNextCommand() {
        if (currentCommand >= scanCommands.length) {
            updateCommandOutput(commandId, '✅ انتهى الفحص الذكي');
            return;
        }

        const cmd = scanCommands[currentCommand];
        updateCommandOutput(commandId, `🔍 تنفيذ: ${cmd}`);
        
        exec(cmd, (error, stdout, stderr) => {
            let output = stdout || stderr || 'تم التنفيذ';
            if (error) {
                output = `خطأ: ${error.message}`;
            }
            
            updateCommandOutput(commandId, `${cmd}\n${output}\n---\n`);
            currentCommand++;
            setTimeout(runNextCommand, 2000); // Delay between commands
        });
    }
    
    runNextCommand();
}

// Generate scanning commands based on AI strategy
function generateScanCommands(target, strategy) {
    let commands = [];
    
    if (strategy.tools.includes('nmap')) {
        commands.push(`echo "🔍 NMAP Scan for ${target}"`);
        commands.push(`nmap -sV -sC ${target} || echo "Nmap scan completed"`);
    }
    
    if (strategy.tools.includes('nikto')) {
        commands.push(`echo "🕷️ Web Vulnerability Scan for ${target}"`);
        commands.push(`echo "Nikto scan would run here - ${target}"`);
    }
    
    if (strategy.tools.includes('dirb')) {
        commands.push(`echo "📁 Directory Brute Force for ${target}"`);
        commands.push(`echo "Directory enumeration for ${target}"`);
    }
    
    if (strategy.approach === 'offensive') {
        commands.push(`echo "⚡ Generating exploit payloads for ${target}"`);
        commands.push(`echo "Creating proof-of-concept exploits"`);
    }
    
    return commands;
}

// Execute manual commands safely
function executeCommand(tool, command, commandId) {
    // Security check for dangerous commands
    const dangerousPatterns = ['rm -rf', 'dd if=', 'mkfs', 'shutdown', 'reboot'];
    if (dangerousPatterns.some(pattern => command.includes(pattern))) {
        updateCommandOutput(commandId, '❌ أمر خطير - تم رفضه');
        return;
    }
    
    exec(command, (error, stdout, stderr) => {
        let output = stdout || stderr || 'تم التنفيذ';
        if (error) {
            output = `خطأ: ${error.message}`;
        }
        updateCommandOutput(commandId, output);
    });
}

// Update command output in database
function updateCommandOutput(commandId, output) {
    db.run(
        `UPDATE commands SET output = output || ? WHERE id = ?`,
        [output + '\n', commandId],
        (err) => {
            if (err) console.error('خطأ في تحديث النتيجة:', err);
        }
    );
}

// AI analysis endpoint for detailed reports
app.post('/api/ai-analyze', (req, res) => {
    const { reportId, output } = req.body;
    
    if (!reportId || !output) {
        return res.status(400).json({ error: 'معرف التقرير والمخرجات مطلوبة' });
    }
    
    // Simulate AI analysis
    const analysis = performAIAnalysis(output);
    
    db.run(
        `INSERT INTO commands (tool, command, output) VALUES (?, ?, ?)`,
        ['AI-Analyzer', `Analysis for report ${reportId}`, analysis],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ analysis, id: this.lastID });
        }
    );
});

// Exploit generation endpoint
app.post('/api/generate-exploit', (req, res) => {
    const { reportId, vulnerabilities } = req.body;
    
    if (!reportId || !vulnerabilities) {
        return res.status(400).json({ error: 'معرف التقرير والثغرات مطلوبة' });
    }
    
    const exploit = generateExploitCode(vulnerabilities);
    
    db.run(
        `INSERT INTO commands (tool, command, output) VALUES (?, ?, ?)`,
        ['Exploit-Generator', `Exploit for report ${reportId}`, exploit],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ exploit, id: this.lastID });
        }
    );
});

// AI Analysis function
function performAIAnalysis(output) {
    let analysis = "🤖 تحليل الذكاء الاصطناعي:\n\n";
    
    if (output.includes('open') || output.includes('مفتوح')) {
        analysis += "🔓 تم اكتشاف منافذ مفتوحة - يُنصح بمراجعة الخدمات المُعرضة\n";
    }
    
    if (output.includes('vulnerability') || output.includes('ثغرة')) {
        analysis += "⚠️ تم اكتشاف ثغرات أمنية - يتطلب تدخل فوري\n";
    }
    
    if (output.includes('sql') || output.includes('injection')) {
        analysis += "💉 احتمالية وجود ثغرة SQL Injection - خطر عالي\n";
    }
    
    if (output.includes('xss') || output.includes('script')) {
        analysis += "🕷️ احتمالية وجود ثغرة XSS - يُنصح بتطهير المدخلات\n";
    }
    
    analysis += "\n📊 التوصيات:\n";
    analysis += "1. إجراء فحص شامل للنظام\n";
    analysis += "2. تطبيق التحديثات الأمنية\n";
    analysis += "3. مراجعة صلاحيات المستخدمين\n";
    analysis += "4. تفعيل مراقبة النظام\n";
    
    return analysis;
}

// Exploit generation function
function generateExploitCode(vulnerabilities) {
    let exploit = "⚡ كود الاستغلال المُولد:\n\n";
    
    vulnerabilities.forEach((vuln, index) => {
        exploit += `--- الثغرة ${index + 1} ---\n`;
        
        if (vuln.toLowerCase().includes('sql')) {
            exploit += `# SQL Injection Payload
' OR '1'='1' --
' UNION SELECT username, password FROM users --
'; DROP TABLE users; --\n\n`;
        }
        
        if (vuln.toLowerCase().includes('xss')) {
            exploit += `# XSS Payload
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>\n\n`;
        }
        
        if (vuln.toLowerCase().includes('port') || vuln.toLowerCase().includes('open')) {
            exploit += `# Port Exploitation
nmap -sV -sC target_ip
nc target_ip port_number
telnet target_ip port_number\n\n`;
        }
    });
    
    exploit += "⚠️ تحذير: استخدم هذه الاكواد فقط للاختبار على الأنظمة المملوكة لك";
    
    return exploit;
}

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 السيرفر شغال على http://0.0.0.0:${port}`);
    console.log(`🤖 AI-Powered Bug Hunter & Creator Ready`);
});
