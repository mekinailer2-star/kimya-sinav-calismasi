// ============================================
// KIMYA SINAV CALISMASI - Application Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // === Loader ===
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1200);

    // === Theme Toggle ===
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check saved theme
    const savedTheme = localStorage.getItem('kimya-theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.setAttribute('data-theme', 'dark');
    }

    // Update meta theme color
    function updateThemeColor() {
        const isDark = html.getAttribute('data-theme') === 'dark';
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', isDark ? '#0f0f1a' : '#6c5ce7');
        }
    }
    updateThemeColor();

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('kimya-theme', next);
        updateThemeColor();
    });

    // === Navbar Scroll ===
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('progressBar');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        // Navbar shadow
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Progress bar
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / scrollHeight) * 100;
        progressBar.style.width = scrollPercent + '%';

        // Back to top
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link
        updateActiveNavLink();
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // === Active Nav Link ===
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const sidebarLinks = document.querySelectorAll('.sidebar-link');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    // === Mobile Sidebar ===
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    function openSidebar() {
        hamburger.classList.add('active');
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        if (sidebar.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

    // === Scroll Animations ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // === Quiz System ===
    const quizQuestions = [
        {
            question: 'CH₂=CH₂ (Etilen) molekulundeki karbon atomlarinin hibritleşme turu nedir?',
            options: ['sp', 'sp²', 'sp³', 'sp³d'],
            correct: 1,
            explanation: 'Cift bag yapan karbon atomlari sp² hibritlesmesi yapar.'
        },
        {
            question: 'Uclu bagda kac tane pi (π) bagi bulunur?',
            options: ['0', '1', '2', '3'],
            correct: 2,
            explanation: 'Uclu bagda 1 sigma + 2 pi olmak uzere 3 bag vardir.'
        },
        {
            question: 'CH≡C-CH₂-CH₂-CH₃ bilesiginin IUPAC adi nedir?',
            options: ['1-Pentin', '2-Pentin', '1-Penten', 'Pentanin'],
            correct: 0,
            explanation: '5 karbonlu zincir + 1. karbonda uclu bag = 1-Pentin'
        },
        {
            question: 'Sigma bag sayisi nasil hesaplanir? (Acik zincirli bilesiklerde)',
            options: [
                'Toplam atom sayisi + 1',
                'Toplam atom sayisi - 1',
                'Toplam bag sayisi x 2',
                'Karbon sayisi - 1'
            ],
            correct: 1,
            explanation: 'Acik zincirli bilesiklerde: Toplam Atom Sayisi - 1 = Sigma Bag Sayisi'
        },
        {
            question: 'Asagidakilerden hangisi bir alken adlandirmasidir?',
            options: [
                '2-metil hekzan',
                '3,4-Dimetil 2-penten',
                '1-Pentin',
                '1,3-Hekzadiyin'
            ],
            correct: 1,
            explanation: 'Alken adlandirmasinda "-en" son eki kullanilir. 3,4-Dimetil 2-penten bir alkendir.'
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    const quizCard = document.getElementById('quizCard');
    const quizResult = document.getElementById('quizResult');
    const quizQuestion = document.getElementById('quizQuestion');
    const quizOptions = document.getElementById('quizOptions');
    const quizNextBtn = document.getElementById('quizNextBtn');
    const quizProgressBarEl = document.getElementById('quizProgressBar');
    const scoreText = document.getElementById('scoreText');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultText = document.getElementById('resultText');
    const quizRestart = document.getElementById('quizRestart');

    function loadQuestion() {
        answered = false;
        const q = quizQuestions[currentQuestion];
        quizQuestion.textContent = q.question;
        quizOptions.innerHTML = '';
        quizNextBtn.style.display = 'none';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => selectAnswer(idx, btn));
            quizOptions.appendChild(btn);
        });

        // Update progress
        quizProgressBarEl.style.width = ((currentQuestion) / quizQuestions.length * 100) + '%';
        scoreText.textContent = score + ' / ' + quizQuestions.length;
    }

    function selectAnswer(idx, btn) {
        if (answered) return;
        answered = true;

        const q = quizQuestions[currentQuestion];
        const allOptions = quizOptions.querySelectorAll('.quiz-option');

        allOptions.forEach(opt => opt.classList.add('disabled'));

        if (idx === q.correct) {
            btn.classList.add('correct');
            score++;
        } else {
            btn.classList.add('wrong');
            allOptions[q.correct].classList.add('correct');
        }

        scoreText.textContent = score + ' / ' + quizQuestions.length;

        if (currentQuestion < quizQuestions.length - 1) {
            quizNextBtn.style.display = 'block';
            quizNextBtn.textContent = 'Sonraki Soru \u2192';
        } else {
            quizNextBtn.style.display = 'block';
            quizNextBtn.textContent = 'Sonuclari Gor \u2192';
        }
    }

    quizNextBtn.addEventListener('click', () => {
        currentQuestion++;
        if (currentQuestion < quizQuestions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    });

    function showResults() {
        quizCard.style.display = 'none';
        document.getElementById('quizScore').style.display = 'none';
        quizResult.style.display = 'block';
        quizProgressBarEl.style.width = '100%';

        const percent = (score / quizQuestions.length) * 100;

        if (percent === 100) {
            resultIcon.textContent = '\uD83C\uDF1F';
            resultTitle.textContent = 'Muhteşem!';
            resultText.textContent = 'Tum sorulari dogru cevapladin! Sinava hazirsın!';
        } else if (percent >= 80) {
            resultIcon.textContent = '\uD83C\uDF89';
            resultTitle.textContent = 'Harika!';
            resultText.textContent = score + '/' + quizQuestions.length + ' dogru! Cok iyi gidiyorsun!';
        } else if (percent >= 60) {
            resultIcon.textContent = '\uD83D\uDCAA';
            resultTitle.textContent = 'Iyi!';
            resultText.textContent = score + '/' + quizQuestions.length + ' dogru. Biraz daha calis!';
        } else {
            resultIcon.textContent = '\uD83D\uDCDA';
            resultTitle.textContent = 'Daha Fazla Calis!';
            resultText.textContent = score + '/' + quizQuestions.length + ' dogru. Notlari tekrar gozden gecir.';
        }
    }

    quizRestart.addEventListener('click', () => {
        currentQuestion = 0;
        score = 0;
        answered = false;
        quizCard.style.display = 'block';
        document.getElementById('quizScore').style.display = 'block';
        quizResult.style.display = 'none';
        loadQuestion();
    });

    // Initialize quiz
    loadQuestion();

    // === PWA Install ===
    let deferredPrompt;
    const pwaInstallBanner = document.getElementById('pwaInstallBanner');
    const pwaInstallBtn = document.getElementById('pwaInstallBtn');
    const pwaDismissBtn = document.getElementById('pwaDismissBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const dismissed = localStorage.getItem('pwa-dismissed');
        if (!dismissed) {
            pwaInstallBanner.style.display = 'block';
        }
    });

    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    pwaInstallBanner.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });
    }

    if (pwaDismissBtn) {
        pwaDismissBtn.addEventListener('click', () => {
            pwaInstallBanner.style.display = 'none';
            localStorage.setItem('pwa-dismissed', 'true');
        });
    }

    // === Register Service Worker ===
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('Service Worker registered:', reg.scope);
                })
                .catch(err => {
                    console.log('Service Worker registration failed:', err);
                });
        });
    }

    // === Smooth scroll for nav links ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // === Keyboard navigation ===
    document.addEventListener('keydown', (e) => {
        // Escape to close sidebar
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
        // 'd' to toggle dark mode
        if (e.key === 'd' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const activeEl = document.activeElement;
            if (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA') {
                themeToggle.click();
            }
        }
    });
});
