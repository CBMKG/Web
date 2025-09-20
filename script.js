
// ANTC TRX - Professional Digital Transaction Platform
// Developed with modern web technologies

// Global variables
let currentSlide = 0;
let isAdminLoggedIn = false;
let transactions = [];
let webhooks = {};
let currentWebhookId = '';
let webhookUrl = '';
let animationSpeed = 600;
let loadingDuration = 4000; // 4 seconds loading

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    showLoadingScreen();
    initializeNavigation();
    initializeAnimations();
    initializeFormHandlers();
    initializeScrollEffects();
    initializeCounters();
    initializeTestimonialSlider();
    loadStoredData();
    loadStoredWebhooks();
    displayPublicTransactions();
    initializeFileInputs();

    // Hide loading screen after 4 seconds
    setTimeout(() => {
        hideLoadingScreen();
    }, loadingDuration);
}

// Loading screen management
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 500);
    }
}

// Navigation management
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    scrollToSection(targetId);
                    updateActiveNavLink(this);
                }
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        updateScrollIndicators();
    });
}

function updateActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');

    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    if (mobileToggle) {
        mobileToggle.classList.toggle('active');
    }
}

// Form handling
function initializeFormHandlers() {
    const orderForm = document.getElementById('orderForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const webhookForm = document.getElementById('webhookForm');

    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    if (webhookForm) {
        webhookForm.addEventListener('submit', handleWebhookSave);
    }
}

function handleOrderSubmit(e) {
    e.preventDefault();

    const photoFile = document.getElementById('orderPhoto').files[0];

    const formData = {
        serviceType: document.getElementById('serviceType').value,
        urgency: document.getElementById('urgency').value,
        customerName: document.getElementById('customerName').value,
        customerEmail: document.getElementById('customerEmail').value,
        customerPhone: document.getElementById('customerPhone').value,
        orderAmount: document.getElementById('orderAmount').value,
        orderDetails: document.getElementById('orderDetails').value,
        timestamp: new Date().toISOString(),
        id: generateTransactionId(),
        status: 'pending',
        hasPhoto: !!photoFile,
        photoName: photoFile ? photoFile.name : null
    };

    if (validateOrderForm(formData)) {
        saveTransaction(formData);
        sendDiscordNotification(formData);
        displayPublicTransactions(); // Update public display
        showSuccessMessage('Permintaan transaksi berhasil dikirim! Tim kami akan segera memproses.');
        resetForm();
    }
}

function validateOrderForm(data) {
    const requiredFields = ['serviceType', 'customerName', 'customerEmail', 'customerPhone', 'orderAmount', 'orderDetails'];

    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showErrorMessage(`Field ${field} harus diisi!`);
            return false;
        }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
        showErrorMessage('Format email tidak valid!');
        return false;
    }

    // Phone validation
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(data.customerPhone)) {
        showErrorMessage('Format nomor WhatsApp tidak valid!');
        return false;
    }

    return true;
}

function generateTransactionId() {
    return 'ANTC-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function saveTransaction(transaction) {
    transactions.push(transaction);
    localStorage.setItem('antc_transactions', JSON.stringify(transactions));
    updateAdminStats();
}

function resetForm() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.reset();
    }
    
    // Reset file input button text
    const fileButton = document.querySelector('#orderPhoto + .file-input-wrapper .file-input-button span');
    if (fileButton) {
        fileButton.textContent = 'Pilih Foto Transaksi';
        fileButton.style.color = '';
    }
}

// Admin functionality
function showAdminLogin() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleAdminLogin(e) {
    e.preventDefault();

    const usernameField = document.getElementById('adminUsername');
    const passwordField = document.getElementById('adminPassword');
    
    if (!usernameField || !passwordField) {
        showErrorMessage('Form login tidak ditemukan!');
        return;
    }

    const username = usernameField.value;
    const password = passwordField.value;

    // Simple authentication (in production, use proper authentication)
    if ((username === 'APIS' || username === 'Jidan') && password === 'admin') {
        isAdminLoggedIn = true;
        closeAdminModal();
        showAdminPanel();
        showSuccessMessage('Login berhasil! Selamat datang di dashboard admin.');
    } else {
        showErrorMessage('Username atau password salah!');
    }
}

function showAdminPanel() {
    document.querySelectorAll('main > section').forEach(section => {
        section.style.display = 'none';
    });

    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'block';
    }

    updateAdminStats();
    refreshTransactions();
}

function logout() {
    isAdminLoggedIn = false;

    // Animate admin panel closing
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.opacity = '0';
        adminPanel.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            adminPanel.style.display = 'none';

            // Show all sections with animation
            document.querySelectorAll('main > section').forEach((section, index) => {
                section.style.display = 'block';
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, index * 100);
            });

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            showSuccessMessage('Logout berhasil! Kembali ke halaman utama.');
        }, 300);
    }
}

function updateAdminStats() {
    const totalTransactions = transactions.length;
    const pendingOrders = transactions.filter(t => t.status === 'pending').length;
    const completedToday = transactions.filter(t => {
        const today = new Date().toDateString();
        const transactionDate = new Date(t.timestamp).toDateString();
        return transactionDate === today && t.status === 'completed';
    }).length;

    const todayRevenue = transactions
        .filter(t => {
            const today = new Date().toDateString();
            const transactionDate = new Date(t.timestamp).toDateString();
            return transactionDate === today && t.status === 'completed';
        })
        .reduce((sum, t) => sum + parseInt(t.orderAmount || 0), 0);

    // Safe element updates with null checks
    updateElementText('totalTransactions', totalTransactions);
    updateElementText('pendingOrders', pendingOrders);
    updateElementText('todayRevenue', formatCurrency(todayRevenue));
    updateElementText('totalCustomers', new Set(transactions.map(t => t.customerEmail)).size);

    // Quick stats
    updateElementText('todayTransactions', completedToday);
    updateElementText('avgOrderValue', formatCurrency(
        totalTransactions > 0 ? transactions.reduce((sum, t) => sum + parseInt(t.orderAmount || 0), 0) / totalTransactions : 0
    ));
    updateElementText('successRate', 
        totalTransactions > 0 ? Math.round((transactions.filter(t => t.status === 'completed').length / totalTransactions) * 100) + '%' : '0%');

    // Update webhook status
    updateWebhookStatus();
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

function updateWebhookStatus() {
    const webhookStatusElement = document.getElementById('webhookStatus');
    if (webhookStatusElement) {
        const hasActiveWebhook = Object.values(webhooks).some(w => w.url && w.function);
        if (hasActiveWebhook) {
            webhookStatusElement.textContent = '✅ Active';
            webhookStatusElement.style.color = 'var(--success)';
        } else {
            webhookStatusElement.textContent = '❌ Not Set';
            webhookStatusElement.style.color = 'var(--error)';
        }
    }
}

function refreshTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    if (!transactionsList) return;

    transactionsList.innerHTML = '';

    const filteredTransactions = filterTransactionsByStatus();

    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Tidak ada transaksi yang ditemukan.</p>';
        return;
    }

    // Animate transactions appearing one by one
    filteredTransactions.forEach((transaction, index) => {
        setTimeout(() => {
            const transactionElement = createTransactionElement(transaction);
            transactionElement.style.animationDelay = `${index * 0.1}s`;
            transactionsList.appendChild(transactionElement);
        }, index * 100);
    });
}

function filterTransactionsByStatus() {
    const filterStatusElement = document.getElementById('filterStatus');
    const filterStatus = filterStatusElement ? filterStatusElement.value : '';
    if (!filterStatus) return transactions;
    return transactions.filter(t => t.status === filterStatus);
}

function filterTransactions() {
    refreshTransactions();
}

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
        <div class="transaction-header">
            <span class="transaction-id">${transaction.id}</span>
            <span class="transaction-status status-${transaction.status}">${getStatusText(transaction.status)}</span>
        </div>
        <div class="transaction-details">
            <div class="transaction-detail">
                <strong>Nama:</strong> ${transaction.customerName}
            </div>
            <div class="transaction-detail">
                <strong>Email:</strong> ${transaction.customerEmail}
            </div>
            <div class="transaction-detail">
                <strong>WhatsApp:</strong> ${transaction.customerPhone}
            </div>
            <div class="transaction-detail">
                <strong>Layanan:</strong> ${getServiceName(transaction.serviceType)}
            </div>
            <div class="transaction-detail">
                <strong>Urgency:</strong> ${getUrgencyText(transaction.urgency)}
            </div>
            <div class="transaction-detail">
                <strong>Budget:</strong> ${formatCurrency(transaction.orderAmount)}
            </div>
        </div>
        <div class="transaction-detail">
            <strong>Detail:</strong> ${transaction.orderDetails}
        </div>
        <div class="transaction-detail">
            <strong>Waktu:</strong> ${formatDateTime(transaction.timestamp)}
        </div>
        <div class="transaction-actions">
            ${transaction.status === 'pending' ? `
                <button class="btn-small btn-success" onclick="updateTransactionStatus('${transaction.id}', 'completed')">
                    <i class="fas fa-check"></i> Complete
                </button>
                <button class="btn-small btn-danger" onclick="updateTransactionStatus('${transaction.id}', 'failed')">
                    <i class="fas fa-times"></i> Failed
                </button>
            ` : ''}
            <button class="btn-small btn-warning" onclick="deleteTransaction('${transaction.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return div;
}

function updateTransactionStatus(transactionId, newStatus) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        transaction.status = newStatus;
        localStorage.setItem('antc_transactions', JSON.stringify(transactions));
        refreshTransactions();
        updateAdminStats();
        showSuccessMessage(`Status transaksi ${transactionId} berhasil diupdate!`);
    }
}

function deleteTransaction(transactionId) {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        transactions = transactions.filter(t => t.id !== transactionId);
        localStorage.setItem('antc_transactions', JSON.stringify(transactions));
        refreshTransactions();
        updateAdminStats();
        showSuccessMessage('Transaksi berhasil dihapus!');
    }
}

// Webhook functionality
function handleWebhookSave(e) {
    e.preventDefault();

    if (!currentWebhookId) {
        showErrorMessage('Pilih webhook terlebih dahulu!');
        return;
    }

    const urlField = document.getElementById('discordWebhook');
    const funcField = document.getElementById('webhookFunction');
    
    if (!urlField || !funcField) {
        showErrorMessage('Form webhook tidak ditemukan!');
        return;
    }

    const url = urlField.value;
    const func = funcField.value;

    if (!url || !func) {
        showErrorMessage('URL webhook dan fungsi harus diisi!');
        return;
    }

    // Validasi URL webhook Discord
    if (!isValidDiscordWebhook(url)) {
        showErrorMessage('URL webhook Discord tidak valid!');
        return;
    }

    if (!webhooks[currentWebhookId]) {
        webhooks[currentWebhookId] = {};
    }

    webhooks[currentWebhookId].url = url;
    webhooks[currentWebhookId].function = func;
    webhooks[currentWebhookId].name = `Webhook ${currentWebhookId}`;
    webhooks[currentWebhookId].created = new Date().toISOString();

    localStorage.setItem('antc_webhooks', JSON.stringify(webhooks));
    showSuccessMessage(`✅ Webhook ${currentWebhookId} berhasil disimpan!`);

    // Update webhook URL for compatibility
    if (func === 'transaction') {
        webhookUrl = url;
        localStorage.setItem('antc_webhook_url', url);
    }
    updateAdminStats(); // Update status after saving
}

function testWebhook() {
    if (!currentWebhookId || !webhooks[currentWebhookId] || !webhooks[currentWebhookId].url) {
        showErrorMessage('Pilih dan simpan webhook terlebih dahulu!');
        return;
    }

    const webhook = webhooks[currentWebhookId];
    const testMessage = {
        embeds: [{
            title: "🧪 Test Message - ANTC TRX",
            description: `✅ Webhook ${currentWebhookId} berhasil dikonfigurasi!\n🔧 Fungsi: ${webhook.function}\n📅 Waktu test: ${new Date().toLocaleString('id-ID')}`,
            color: 3447003,
            timestamp: new Date().toISOString(),
            thumbnail: {
                url: "https://cdn.discordapp.com/attachments/placeholder/logo.png"
            },
            footer: {
                text: "ANTC TRX Admin Panel • Test Mode",
                icon_url: "https://cdn.discordapp.com/attachments/placeholder/icon.png"
            }
        }]
    };

    showLoadingMessage('Mengirim test message...');

    sendWebhookMessage(testMessage, webhook.url)
        .then(() => {
            showSuccessMessage('✅ Test message berhasil dikirim ke Discord!');
        })
        .catch((error) => {
            console.error('Webhook test error:', error);
            showErrorMessage('❌ Gagal mengirim test message. Periksa URL webhook!');
        });
}

function loadWebhook() {
    const select = document.getElementById('webhookSelect');
    if (!select) return;
    
    currentWebhookId = select.value;

    const urlField = document.getElementById('discordWebhook');
    const funcField = document.getElementById('webhookFunction');

    if (currentWebhookId && webhooks[currentWebhookId]) {
        const webhook = webhooks[currentWebhookId];
        if (urlField) urlField.value = webhook.url || '';
        if (funcField) funcField.value = webhook.function || '';
        showSuccessMessage(`Webhook ${currentWebhookId} dimuat!`);
    } else {
        if (urlField) urlField.value = '';
        if (funcField) funcField.value = '';
    }
}

function isValidDiscordWebhook(url) {
    const discordWebhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
    return discordWebhookRegex.test(url);
}

function sendDiscordNotification(transaction) {
    // Cari webhook dengan fungsi transaction
    const transactionWebhook = Object.values(webhooks).find(w => w.function === 'transaction');
    const targetUrl = transactionWebhook ? transactionWebhook.url : webhookUrl;

    if (!targetUrl) {
        console.warn('No webhook configured for transactions');
        return;
    }

    const urgencyEmoji = {
        'normal': '⏱️',
        'fast': '⚡',
        'instant': '🚀'
    };

    const fields = [
        { name: "🆔 ID Transaksi", value: `\`${transaction.id}\``, inline: true },
        { name: "👤 Nama Customer", value: transaction.customerName, inline: true },
        { name: "🎯 Jenis Transaksi", value: getServiceName(transaction.serviceType), inline: true },
        { name: "💰 Total Nilai", value: `**${formatCurrency(transaction.orderAmount)}**`, inline: true },
        { name: `${urgencyEmoji[transaction.urgency]} Urgency`, value: getUrgencyText(transaction.urgency), inline: true },
        { name: "📱 WhatsApp", value: `\`${transaction.customerPhone}\``, inline: true },
        { name: "📧 Email", value: transaction.customerEmail, inline: false },
        { name: "📝 Detail Transaksi", value: `\`\`\`${transaction.orderDetails}\`\`\``, inline: false }
    ];

    if (transaction.hasPhoto) {
        fields.push({ 
            name: "📸 Lampiran Foto", 
            value: `✅ File: \`${transaction.photoName}\``, 
            inline: false 
        });
    }

    const message = {
        content: `🔔 **TRANSAKSI BARU MASUK!** 🔔`,
        embeds: [{
            title: "💳 ANTC TRX - Transaksi Baru",
            description: `📊 **Status:** 🟡 \`PENDING\`\n⏰ **Waktu:** ${formatDateTime(transaction.timestamp)}\n🌟 **Platform:** ANTC TRX Professional`,
            color: 3447003,
            fields: fields,
            timestamp: new Date().toISOString(),
            footer: {
                text: "ANTC TRX • Professional Digital Platform",
                icon_url: "https://cdn.discordapp.com/attachments/placeholder/antc-icon.png"
            },
            thumbnail: {
                url: "https://cdn.discordapp.com/attachments/placeholder/transaction-icon.png"
            }
        }]
    };

    sendWebhookMessage(message, targetUrl)
        .then(() => {
            console.log('Discord notification sent successfully');
        })
        .catch((error) => {
            console.error('Failed to send Discord notification:', error);
        });
}

// Animation and effects
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => {
        countObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function initializeTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length === 0) return;

    let currentTestimonial = 0;

    setInterval(() => {
        testimonials[currentTestimonial].classList.remove('active');
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        testimonials[currentTestimonial].classList.add('active');
    }, 5000);
}

// Scroll effects
function initializeScrollEffects() {
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        if (scrollTopBtn) {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateScrollIndicators() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === currentSection) {
            link.classList.add('active');
        }
    });
}

// Floating Action Button
function toggleFab() {
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) {
        fabContainer.classList.toggle('active');
    }
}

// Data management
function loadStoredData() {
    const storedTransactions = localStorage.getItem('antc_transactions');
    if (storedTransactions) {
        try {
            transactions = JSON.parse(storedTransactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
            transactions = [];
        }
    }

    const storedWebhook = localStorage.getItem('antc_webhook_url');
    if (storedWebhook) {
        webhookUrl = storedWebhook;
        const webhookField = document.getElementById('discordWebhook');
        if (webhookField) {
            webhookField.value = webhookUrl;
        }
    }
}

function loadStoredWebhooks() {
    const storedWebhooks = localStorage.getItem('antc_webhooks');
    if (storedWebhooks) {
        try {
            webhooks = JSON.parse(storedWebhooks);
            console.log('Webhooks loaded:', Object.keys(webhooks).length, 'configured');
        } catch (error) {
            console.error('Error loading webhooks:', error);
            webhooks = {};
        }
    }

    // Load legacy webhook URL for backward compatibility
    const legacyWebhook = localStorage.getItem('antc_webhook_url');
    if (legacyWebhook && !Object.values(webhooks).find(w => w.url === legacyWebhook)) {
        webhooks['1'] = {
            url: legacyWebhook,
            function: 'transaction',
            name: 'Legacy Webhook',
            created: new Date().toISOString()
        };
        webhookUrl = legacyWebhook;
    }
    updateAdminStats(); // Call updateAdminStats after loading webhooks
}

function exportData() {
    const data = {
        transactions: transactions,
        exportDate: new Date().toISOString(),
        platform: 'ANTC TRX'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `antc-trx-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    showSuccessMessage('Data berhasil diekspor!');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getServiceName(serviceType) {
    const services = {
        'cdid': '🎮 CDid',
        'garden': '🌱 Grow a Garden',
        'akun': '👤 Akun',
        'bloxfruit': '🎯 Blox Fruit',
        'joki-ml': '🎮 Joki Mobile Legends',
        'joki-pubg': '🎯 Joki PUBG',
        'top-up-ff': '💎 Top Up Free Fire',
        'top-up-ml': '💎 Top Up Mobile Legends',
        'joki-valorant': '🎮 Joki Valorant',
        'netflix': '📺 Akun Netflix',
        'spotify': '🎵 Akun Spotify',
        'steam': '🎮 Steam Wallet',
        'other': '🔧 Lainnya'
    };
    return services[serviceType] || serviceType;
}

function getUrgencyText(urgency) {
    const urgencies = {
        'normal': 'Normal (24-48 jam)',
        'fast': 'Cepat (12-24 jam) +20%',
        'instant': 'Instan (1-6 jam) +50%'
    };
    return urgencies[urgency] || urgency;
}

function getStatusText(status) {
    const statuses = {
        'pending': 'Pending',
        'completed': 'Completed',
        'failed': 'Failed'
    };
    return statuses[status] || status;
}

function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

function showLoadingMessage(message) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-message';
    loadingDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: var(--surface-light); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary); position: fixed; top: 20px; right: 20px; z-index: 9999; box-shadow: var(--shadow-card);">
            <div style="width: 20px; height: 20px; border: 2px solid var(--accent-blue); border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            ${message}
        </div>
    `;

    document.body.appendChild(loadingDiv);

    setTimeout(() => {
        if (document.body.contains(loadingDiv)) {
            loadingDiv.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(loadingDiv)) {
                    document.body.removeChild(loadingDiv);
                }
            }, 300);
        }
    }, 3000);
}

function displayPublicTransactions() {
    const publicList = document.getElementById('publicTransactionsList');
    if (!publicList) return;

    publicList.innerHTML = '';

    if (transactions.length === 0) {
        publicList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Belum ada transaksi.</p>';
        return;
    }

    const publicTransactions = transactions.slice(-10); // Show last 10 transactions

    publicTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'public-transaction-item';
        transactionElement.innerHTML = `
            <div class="public-transaction-header">
                <span class="transaction-id">${transaction.id}</span>
                <span class="transaction-status status-${transaction.status}">${getStatusText(transaction.status)}</span>
            </div>
            <div class="public-transaction-details">
                <div class="transaction-detail">
                    <strong>Layanan:</strong> ${getServiceName(transaction.serviceType)}
                </div>
                <div class="transaction-detail">
                    <strong>Jumlah:</strong> ${formatCurrency(transaction.orderAmount)}
                </div>
                <div class="transaction-detail">
                    <strong>Waktu:</strong> ${formatDateTime(transaction.timestamp)}
                </div>
            </div>
        `;
        publicList.appendChild(transactionElement);
    });
}

function initializeFileInputs() {
    // Initialize order photo input
    const orderPhotoInput = document.getElementById('orderPhoto');
    if (orderPhotoInput) {
        orderPhotoInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            const button = e.target.parentElement?.querySelector('.file-input-button span');
            if (fileName && button) {
                button.textContent = `📷 ${fileName}`;
                button.style.color = 'var(--success)';
            }
        });
    }

    // Initialize announce photo input
    const announcePhotoInput = document.getElementById('announcePhoto');
    if (announcePhotoInput) {
        announcePhotoInput.addEventListener('change', handlePhotoPreview);
    }
}

// Enhanced sendWebhookMessage function with better error handling
async function sendWebhookMessage(message, url = null) {
    const targetUrl = url || webhookUrl;

    if (!targetUrl) {
        throw new Error('No webhook URL configured');
    }

    if (!isValidDiscordWebhook(targetUrl)) {
        throw new Error('Invalid Discord webhook URL');
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ANTC-TRX-Bot/1.0'
            },
            body: JSON.stringify(message),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Webhook request failed: ${response.status} - ${errorText}`);
        }

        return await response.text();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Webhook request timeout - periksa koneksi internet');
        }
        console.error('Webhook error:', error);
        throw error;
    }
}

// Announce functionality
function sendAnnounce() {
    const announceSection = document.getElementById('announceSection');
    if (announceSection) {
        announceSection.style.display = 'block';
        announceSection.style.animation = 'slideInUp 0.4s ease forwards';

        // Focus pada input title
        setTimeout(() => {
            const titleInput = document.getElementById('announceTitle');
            if (titleInput) {
                titleInput.focus();
            }
        }, 400);
    }
}

function sendPhotoAnnounce() {
    const announceSection = document.getElementById('announceSection');
    if (announceSection) {
        announceSection.style.display = 'block';
        announceSection.style.animation = 'slideInUp 0.4s ease forwards';

        // Set focus pada foto upload dan buat preview area
        setTimeout(() => {
            const photoInput = document.getElementById('announcePhoto');
            if (photoInput) {
                photoInput.focus();
            }

            // Create image preview area if not exists
            if (!document.getElementById('imagePreview')) {
                createImagePreviewArea();
            }
        }, 400);
    }
}

function sendCustomMessage() {
    const customWebhook = Object.values(webhooks).find(w => w.function === 'custom');

    if (!customWebhook) {
        showErrorMessage('❌ Webhook custom belum dikonfigurasi!');
        return;
    }

    const title = prompt('🎯 Masukkan judul pesan custom:');
    const messageText = prompt('📝 Masukkan isi pesan:');

    if (!title || !messageText) {
        showErrorMessage('Judul dan pesan harus diisi!');
        return;
    }

    const customMessage = {
        embeds: [{
            title: `🔧 ${title}`,
            description: messageText,
            color: 9936031, // Purple color for custom messages
            timestamp: new Date().toISOString(),
            footer: {
                text: "ANTC TRX • Custom Message"
            }
        }]
    };

    showLoadingMessage('📤 Mengirim pesan custom...');

    sendWebhookMessage(customMessage, customWebhook.url)
        .then(() => showSuccessMessage('✅ Pesan custom berhasil dikirim!'))
        .catch(() => showErrorMessage('❌ Gagal mengirim pesan custom!'));
}

function publishAnnounce() {
    const titleField = document.getElementById('announceTitle');
    const messageField = document.getElementById('announceMessage');
    const photoField = document.getElementById('announcePhoto');
    
    if (!titleField || !messageField) {
        showErrorMessage('Form announce tidak ditemukan!');
        return;
    }

    const title = titleField.value;
    const messageText = messageField.value;
    const photo = photoField ? photoField.files[0] : null;

    if (!title || !messageText) {
        showErrorMessage('Judul dan pesan harus diisi!');
        return;
    }

    // Cari webhook announce atau photo_announce
    const announceWebhook = Object.values(webhooks).find(w => 
        w.function === 'announce' || w.function === 'photo_announce'
    );

    if (!announceWebhook) {
        showErrorMessage('❌ Webhook announce belum dikonfigurasi!');
        return;
    }

    showLoadingMessage('📤 Mengirim announce ke Discord...');

    const announceMessage = {
        content: `📢 **PENGUMUMAN BARU!** 📢`,
        embeds: [{
            title: `🎯 ${title}`,
            description: messageText,
            color: 15844367, // Gold color for announcements
            timestamp: new Date().toISOString(),
            footer: {
                text: "ANTC TRX • Official Announcement",
                icon_url: "https://cdn.discordapp.com/attachments/placeholder/megaphone-icon.png"
            },
            thumbnail: {
                url: "https://cdn.discordapp.com/attachments/placeholder/megaphone-icon.png"
            }
        }]
    };

    // Handle photo upload with proper Discord image display
    if (photo) {
        announceMessage.embeds[0].image = {
            url: "attachment://announce_photo.png"
        };
        announceMessage.embeds[0].fields = [{
            name: "📸 Foto Lampiran",
            value: `✅ **${photo.name}** (${formatFileSize(photo.size)})`,
            inline: false
        }];

        // Send with form data for file upload
        sendAnnounceWithPhoto(announceMessage, photo, announceWebhook.url);
    } else {
        // Send regular message without photo
        sendWebhookMessage(announceMessage, announceWebhook.url)
            .then(() => {
                showSuccessMessage('✅ Announce berhasil dikirim ke Discord!');
                resetAnnounceForm();
            })
            .catch((error) => {
                console.error('Announce error:', error);
                showErrorMessage('❌ Gagal mengirim announce! Periksa koneksi internet.');
            });
    }
}

async function sendAnnounceWithPhoto(message, photoFile, webhookUrl) {
    try {
        const formData = new FormData();
        formData.append('payload_json', JSON.stringify(message));
        formData.append('file', photoFile, 'announce_photo.png');

        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Webhook request failed: ${response.status}`);
        }

        showSuccessMessage('✅ Announce dengan foto berhasil dikirim ke Discord!');
        resetAnnounceForm();
    } catch (error) {
        console.error('Photo announce error:', error);
        showErrorMessage('❌ Gagal mengirim announce dengan foto! Periksa koneksi internet.');
    }
}

function resetAnnounceForm() {
    const titleField = document.getElementById('announceTitle');
    const messageField = document.getElementById('announceMessage');
    const photoField = document.getElementById('announcePhoto');
    
    if (titleField) titleField.value = '';
    if (messageField) messageField.value = '';
    if (photoField) photoField.value = '';
    
    removeImagePreview();

    // Hide announce section with animation
    const announceSection = document.getElementById('announceSection');
    if (announceSection) {
        announceSection.style.animation = 'slideOutDown 0.4s ease forwards';
        setTimeout(() => {
            announceSection.style.display = 'none';
        }, 400);
    }
}

function createImagePreviewArea() {
    const announceSection = document.getElementById('announceSection');
    if (!announceSection) return;
    
    const photoGroup = announceSection.querySelector('.form-group:has(#announcePhoto)');

    if (photoGroup && !document.getElementById('imagePreview')) {
        const previewDiv = document.createElement('div');
        previewDiv.id = 'imagePreview';
        previewDiv.className = 'image-preview-container';
        previewDiv.innerHTML = `
            <div class="image-preview-placeholder">
                <i class="fas fa-image"></i>
                <p>Preview foto akan muncul di sini</p>
            </div>
        `;
        photoGroup.appendChild(previewDiv);
    }
}

function handlePhotoPreview(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('imagePreview');

    if (!previewContainer) {
        createImagePreviewArea();
        return;
    }

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContainer.innerHTML = `
                <div class="image-preview-item">
                    <img src="${e.target.result}" alt="Preview" class="preview-image">
                    <div class="image-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${formatFileSize(file.size)}</span>
                        <button type="button" class="remove-image-btn" onclick="removeImagePreview()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else if (file) {
        showErrorMessage('File yang dipilih bukan gambar yang valid!');
        event.target.value = '';
    }
}

function removeImagePreview() {
    const previewContainer = document.getElementById('imagePreview');
    const photoInput = document.getElementById('announcePhoto');

    if (previewContainer) {
        previewContainer.innerHTML = `
            <div class="image-preview-placeholder">
                <i class="fas fa-image"></i>
                <p>Preview foto akan muncul di sini</p>
            </div>
        `;
    }
    
    if (photoInput) {
        photoInput.value = '';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('adminModal');
    if (event.target === modal) {
        closeAdminModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to close modal
    if (event.key === 'Escape') {
        closeAdminModal();
    }

    // Ctrl/Cmd + K for admin login
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        showAdminLogin();
    }
});

// Professional console branding
console.log(`
%c  ╔═══════════════════════════════════════╗
  ║            ANTC TRX v2.0              ║
  ║     Professional Digital Platform     ║
  ║                                       ║
  ║  🚀 Modern • Secure • Professional   ║
  ╚═══════════════════════════════════════╝
`, 'color: #00D2FF; font-family: monospace; font-size: 12px; font-weight: bold;');

// Performance optimization
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful');
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Export functions for global access
window.scrollToSection = scrollToSection;
window.showAdminLogin = showAdminLogin;
window.closeAdminModal = closeAdminModal;
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleFab = toggleFab;
window.scrollToTop = scrollToTop;
window.resetForm = resetForm;
window.refreshTransactions = refreshTransactions;
window.filterTransactions = filterTransactions;
window.exportData = exportData;
window.testWebhook = testWebhook;
window.updateTransactionStatus = updateTransactionStatus;
window.deleteTransaction = deleteTransaction;
window.loadWebhook = loadWebhook;
window.sendAnnounce = sendAnnounce;
window.sendPhotoAnnounce = sendPhotoAnnounce;
window.publishAnnounce = publishAnnounce;
window.sendCustomMessage = sendCustomMessage;
window.removeImagePreview = removeImagePreview;
