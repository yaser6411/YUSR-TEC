const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

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

// استقبال أوامر وتنفيذها (مؤقتاً للطباعة فقط لأمان أكثر)
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

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 السيرفر شغال على http://0.0.0.0:${port}`);
});
