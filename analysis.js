
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

function copyCode(button) {
    const codeBlock = button.parentElement;
    const code = codeBlock.textContent.replace('نسخ', '').trim();
    
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'تم النسخ!';
        button.style.background = '#00ff00';
        button.style.color = '#000';
        
        setTimeout(() => {
            button.textContent = 'نسخ';
            button.style.background = '#333';
            button.style.color = '#fff';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('فشل في نسخ الكود');
    });
}

// Auto-scroll animation for code blocks
function animateCodeExecution(codeBlock) {
    const lines = codeBlock.textContent.split('\n');
    codeBlock.innerHTML = '';
    
    lines.forEach((line, index) => {
        setTimeout(() => {
            const lineElement = document.createElement('div');
            lineElement.textContent = line;
            lineElement.style.opacity = '0';
            lineElement.style.transform = 'translateX(-20px)';
            lineElement.style.transition = 'all 0.3s ease';
            
            codeBlock.appendChild(lineElement);
            
            setTimeout(() => {
                lineElement.style.opacity = '1';
                lineElement.style.transform = 'translateX(0)';
            }, 50);
        }, index * 100);
    });
}

// Simulate real-time scanning
function simulateRealTimeScan() {
    const scanResults = [
        '🔍 بدء المسح الشامل...',
        '📡 فحص المنافذ: 22, 80, 443, 3306 مفتوحة',
        '🕷️ اكتشاف تطبيق ويب: Apache/2.4.41',
        '💉 اختبار SQL Injection: ثغرة مكتشفة!',
        '🎯 اختبار XSS: ثغرة انعكاسية مؤكدة',
        '🔒 فحص SSL: تكوين ضعيف',
        '📁 البحث عن الملفات: /admin/ مكشوف',
        '✅ انتهى المسح - 5 ثغرات مكتشفة'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
        if (index < scanResults.length) {
            console.log(scanResults[index]);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 2000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 YUSR-TEC AI Analysis Engine Loaded');
    console.log('🧠 Deep Learning Models: Active');
    console.log('🔍 Vulnerability Detection: Ready');
    console.log('⚡ Exploitation Framework: Initialized');
    
    // Add dynamic effects to vulnerability cards
    const vulnCards = document.querySelectorAll('.vulnerability-card');
    vulnCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 0 25px rgba(255, 68, 68, 0.5)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 0 15px rgba(255, 68, 68, 0.3)';
        });
    });
    
    // Add typing effect to AI decisions
    const aiDecisions = document.querySelectorAll('.ai-decision');
    aiDecisions.forEach(decision => {
        decision.addEventListener('click', function() {
            const codeBlock = this.querySelector('.code-block');
            if (codeBlock) {
                animateCodeExecution(codeBlock);
            }
        });
    });
    
    // Simulate scanning on page load
    setTimeout(simulateRealTimeScan, 1000);
});

// Advanced AI simulation functions
function simulateAIDecisionMaking() {
    const decisions = [
        'تحليل نوع الهدف: تطبيق ويب',
        'تقييم سطح الهجوم: عالي',
        'اختيار الاستراتيجية: متعدد المتجهات',
        'تحسين الأدوات: SQL + XSS + Directory Traversal',
        'تحديد الأولوية: الثغرات الحرجة أولاً'
    ];
    
    return decisions;
}

function generateExploitPayload(vulnType) {
    const payloads = {
        'sql': [
            "' OR '1'='1' --",
            "' UNION SELECT username,password FROM users --",
            "'; DROP TABLE users; --"
        ],
        'xss': [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>"
        ],
        'lfi': [
            "../../../../etc/passwd",
            "..\\..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "php://filter/read=convert.base64-encode/resource=config.php"
        ]
    };
    
    return payloads[vulnType] || ['Payload not available'];
}

// Export functions for global use
window.showTab = showTab;
window.copyCode = copyCode;
window.simulateRealTimeScan = simulateRealTimeScan;
