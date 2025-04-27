const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'yusrtec.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ فشل فتح قاعدة البيانات:', err.message);
    } else {
        console.log('✅ قاعدة البيانات مفتوحة');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool TEXT,
            command TEXT,
            output TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ خطأ في إنشاء الجدول:', err.message);
        } else {
            console.log('✅ الجدول جاهز');
        }
        db.close();
    });
});
