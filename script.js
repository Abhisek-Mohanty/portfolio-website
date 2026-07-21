/* ==========================================================================
   THEME MANAGER (DARK / LIGHT MODE)
   ========================================================================= */
const initTheme = () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        const defaultTheme = systemPrefersDark ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', defaultTheme);
    }

    // Click handler for toggle button
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Add ripple animation class
        themeToggle.classList.add('pulse');
        setTimeout(() => themeToggle.classList.remove('pulse'), 500);
    });
};

/* ==========================================================================
   MOBILE MENU DRAWER ADJUSTMENTS FOR BOOTSTRAP COLLAPSIBLE NAVBAR
   ========================================================================= */
const initMobileMenu = () => {
    const navbarContent = document.getElementById('navbarContent');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navbarContent) return;

    // Auto-close Bootstrap collapsed navbar when user clicks a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarContent.classList.contains('show')) {
                navbarContent.classList.remove('show');
                const toggler = document.querySelector('.navbar-toggler');
                if (toggler) {
                    toggler.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
};

/* ==========================================================================
   TYPEWRITER EFFECT
   ========================================================================= */
const initTypewriter = () => {
    const textElement = document.getElementById('typewriter-text');
    if (!textElement) return;

    const words = ["Software Engineer", "Full-Stack Developer", "FinTech Developer", "Tech Enthusiast"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const type = () => {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deleting is faster
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120; // Natural typing pace
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingSpeed = 1800; // Hold at the end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 400; // Pause before typing next word
        }

        setTimeout(type, typingSpeed);
    };

    // Start effect
    setTimeout(type, 1000);
};

/* ==========================================================================
   SCROLL EFFECTS & NAVIGATION HIGHLIGHT
   ========================================================================= */
const initScrollEffects = () => {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navbar) return;

    // Sticky header adjustments
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer to highlight current section in navigation
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                // Check if any nav link points specifically to this local section ID
                const hasLocalLink = Array.from(navLinks).some(link => link.getAttribute('href') === `#${id}`);
                if (!hasLocalLink) return;

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
};

/* ==========================================================================
   SKILL PROGRESS ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================= */
const initSkillAnimations = () => {
    const skillsSection = document.getElementById('skills');
    const progressFills = document.querySelectorAll('.progress-fill');

    if (!skillsSection || progressFills.length === 0) return;

    const observerOptions = {
        root: null,
        threshold: 0.15
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressFills.forEach(fill => {
                    const widthVal = fill.style.width;
                    fill.style.width = '0';
                    setTimeout(() => {
                        fill.style.width = widthVal;
                    }, 50);
                });
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observer.observe(skillsSection);
};

/* ==========================================================================
   INTERACTIVE FINTECH CALCULATOR & LOS RISK DECISIONING
   ========================================================================= */
const initFintechWidget = () => {
    // Inputs
    const amountSlider = document.getElementById('loan-amount');
    const rateSlider = document.getElementById('loan-rate');
    const tenureSlider = document.getElementById('loan-tenure');
    const cibilInput = document.getElementById('cibil-score');
    const incomeInput = document.getElementById('monthly-income');
    const runCheckBtn = document.getElementById('run-check-btn');

    if (!amountSlider || !rateSlider || !tenureSlider) return;

    // Value Labels
    const amountVal = document.getElementById('amount-val');
    const rateVal = document.getElementById('rate-val');
    const tenureVal = document.getElementById('tenure-val');

    // Outputs
    const emiText = document.getElementById('emi-value');
    const interestText = document.getElementById('interest-value');
    const repaymentText = document.getElementById('repayment-value');
    const foirText = document.getElementById('foir-value');
    const decisionBadge = document.getElementById('decision-badge');
    const amortizationRows = document.getElementById('amortization-rows');
    const resultMsgBlock = document.getElementById('check-result-msg');

    // Helper: Format to Indian Currency Format (Lakhs, Thousands)
    const formatRupee = (num) => {
        return '₹' + Math.round(num).toLocaleString('en-IN');
    };

    // Calculate Loan Metrics & Render Amortization Table
    const calculateLoan = () => {
        const principal = parseFloat(amountSlider.value);
        const annualRate = parseFloat(rateSlider.value);
        const tenureMonths = parseFloat(tenureSlider.value);
        const monthlyIncome = parseFloat(incomeInput.value) || 20000;

        // Label updates
        if (amountVal) amountVal.textContent = parseFloat(amountSlider.value).toLocaleString('en-IN');
        if (rateVal) rateVal.textContent = annualRate.toFixed(1);
        if (tenureVal) tenureVal.textContent = tenureMonths;

        // Math: Monthly EMI
        const monthlyRate = (annualRate / 12) / 100;
        let emi = 0;
        if (monthlyRate === 0) {
            emi = principal / tenureMonths;
        } else {
            emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        }

        const totalRepayment = emi * tenureMonths;
        const totalInterest = totalRepayment - principal;
        const foir = (emi / monthlyIncome) * 100;

        // Update metrics display
        if (emiText) emiText.textContent = formatRupee(emi);
        if (interestText) interestText.textContent = formatRupee(totalInterest);
        if (repaymentText) repaymentText.textContent = formatRupee(totalRepayment);
        if (foirText) {
            foirText.textContent = foir.toFixed(1) + '%';

            // Highlight FOIR card if too high (debt threshold warning)
            if (foir > 50) {
                foirText.style.color = '#ef4444'; // Apple System Red
            } else {
                foirText.style.color = 'var(--apple-text-secondary)'; // Standard system text color
            }
        }

        // Render First 5 Months Amortization Schedule
        if (amortizationRows) {
            amortizationRows.innerHTML = '';
            let balance = principal;
            const monthsToShow = Math.min(5, tenureMonths);

            for (let i = 1; i <= monthsToShow; i++) {
                const interestPaid = balance * monthlyRate;
                const principalPaid = emi - interestPaid;
                balance = Math.max(0, balance - principalPaid);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>&nbsp;Month ${i}</td>
                    <td>${formatRupee(principalPaid)}</td>
                    <td>${formatRupee(interestPaid)}</td>
                    <td>${formatRupee(balance)}</td>
                `;
                amortizationRows.appendChild(row);
            }
        }
    };

    // Simulate LOS Risk Engine Run
    const runCreditAssessment = () => {
        if (!runCheckBtn || !decisionBadge || !resultMsgBlock) return;

        runCheckBtn.disabled = true;
        runCheckBtn.textContent = 'Assessing Risk Profile (LOS)...';
        decisionBadge.textContent = 'ASSESSING';
        decisionBadge.className = 'badge badge-warning';

        // Simulate 1.2 second network scorecard rules check
        setTimeout(() => {
            const cibil = parseInt(cibilInput.value) || 300;
            const foirVal = parseFloat(foirText.textContent.replace('%', ''));

            let status = 'approved';
            let message = '';

            if (cibil < 600) {
                status = 'rejected';
                message = `<strong>Decision: Rejected.</strong> CIBIL score is too low (${cibil}). Underwriting rules require a minimum score of 600.`;
            } else if (cibil >= 600 && cibil < 700) {
                status = 'referred';
                message = `<strong>Decision: Referred to Credit.</strong> Score (${cibil}) is in the moderate range. LAP requires manual review of properties & secondary income.`;
            } else if (foirVal > 60) {
                status = 'referred';
                message = `<strong>Decision: Referred to Credit.</strong> Fixed Obligation to Income Ratio (${foirVal.toFixed(1)}%) exceeds risk threshold of 60%. Lower the loan amount.`;
            } else {
                status = 'approved';
                message = `<strong>Decision: Pre-Approved.</strong> Applicant meets automated scorecard criteria. Clean credit history. Auto-disbursement initialized via LMS integrations.`;
            }

            // Update badge and message styling
            if (status === 'approved') {
                decisionBadge.textContent = 'PRE-APPROVED';
                decisionBadge.className = 'badge badge-success px-3 py-2';
                resultMsgBlock.className = 'check-result-msg p-3 d-flex align-items-center gap-3';
                resultMsgBlock.innerHTML = `<div class="msg-icon fs-3">🛡️</div><p class="small mb-0">${message}</p>`;
            } else if (status === 'referred') {
                decisionBadge.textContent = 'REFERRED';
                decisionBadge.className = 'badge badge-warning px-3 py-2';
                resultMsgBlock.className = 'check-result-msg p-3 d-flex align-items-center gap-3 warning-assessment';
                resultMsgBlock.innerHTML = `<div class="msg-icon fs-3">⚠️</div><p class="small mb-0">${message}</p>`;
            } else {
                decisionBadge.textContent = 'DECLINED';
                decisionBadge.className = 'badge px-3 py-2';
                decisionBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                decisionBadge.style.color = '#ef4444';
                decisionBadge.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                resultMsgBlock.className = 'check-result-msg p-3 d-flex align-items-center gap-3 warning-assessment';
                resultMsgBlock.innerHTML = `<div class="msg-icon fs-3">❌</div><p class="small mb-0">${message}</p>`;
            }

            runCheckBtn.disabled = false;
            runCheckBtn.textContent = 'Run Credit Assessment';
        }, 1200);
    };

    // Attach Event Listeners
    amountSlider.addEventListener('input', calculateLoan);
    rateSlider.addEventListener('input', calculateLoan);
    tenureSlider.addEventListener('input', calculateLoan);
    if (incomeInput) incomeInput.addEventListener('input', calculateLoan);
    runCheckBtn.addEventListener('click', runCreditAssessment);

    // Initial calculation
    calculateLoan();
};

/* ==========================================================================
   CONTACT FORM DISPATCH SIMULATOR
   ========================================================================= */
const initContactForm = () => {
    const form = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status');

    if (!form || !statusMsg) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending Message...';
        statusMsg.style.display = 'none';

        const formData = new FormData(form);
        formData.append("access_key", "a2f2b3d6-4edb-4f09-bcee-ec8a995434e2");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                statusMsg.textContent = "Success! Your message has been sent.";
                statusMsg.className = "form-status-msg success";
                form.reset();
            } else {
                statusMsg.textContent = "Error: " + (data.message || "Failed to send message.");
                statusMsg.className = "form-status-msg error";
            }
        } catch (error) {
            statusMsg.textContent = "Something went wrong. Please try again.";
            statusMsg.className = "form-status-msg error";
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
            statusMsg.style.display = 'block';

            // Hide message after 6 seconds
            setTimeout(() => {
                statusMsg.style.display = 'none';
            }, 6000);
        }
    });
};

/* ==========================================================================
   COMET CURSOR ANIMATION
   ========================================================================= */
const initCometCursor = () => {
    // Disable on mobile/touch devices (where coarse pointers like fingers are used)
    // if (window.matchMedia('(pointer: coarse)').matches) return;
    document.body.style.cursor = 'none'

    // Create and inject Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'comet-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Scale canvas for high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    const resizeCanvas = () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial call

    const mouse = { x: 0, y: 0 };
    const cometHead = { x: 0, y: 0 };
    const particles = [];
    let isMouseActive = false;
    let isDrawing = false;
    let lastMouseTime = Date.now();

    // Check theme
    const htmlElement = document.documentElement;
    const isDarkTheme = () => htmlElement.getAttribute('data-theme') !== 'light';

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        if (!isMouseActive) {
            cometHead.x = e.clientX;
            cometHead.y = e.clientY;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            isMouseActive = true;
        } else {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }
        lastMouseTime = Date.now();

        if (!isDrawing) {
            isDrawing = true;
            requestAnimationFrame(drawLoop);
        }
    });

    // Handle mouse leaving window
    document.addEventListener('mouseleave', () => {
        isMouseActive = false;
    });

    // Particle factory
    const createParticle = (x, y, vx, vy, maxLife, size) => {
        return { x, y, vx, vy, life: maxLife, maxLife, size };
    };

    // Draw and animate loop
    const drawLoop = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Lerp factor for smooth comet head dragging
        const lerpFactor = 0.2;
        cometHead.x += (mouse.x - cometHead.x) * lerpFactor;
        cometHead.y += (mouse.y - cometHead.y) * lerpFactor;

        // Fetch dark/light mode status dynamically
        const dark = isDarkTheme();
        const headColor = dark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 30, 0.95)';
        const particleBaseColor = dark ? '255, 255, 255' : '30, 30, 30';

        // Check distance to cursor to spawn trailing particles
        const dx = mouse.x - cometHead.x;
        const dy = mouse.y - cometHead.y;
        const distance = Math.hypot(dx, dy);

        // Spawn particles when moving
        if (isMouseActive && (distance > 0.5 || Date.now() - lastMouseTime < 100)) {
            // Spawn count scales with speed to create a fuller tail during fast movements
            const numParticles = Math.min(2, Math.max(1, Math.round(distance / 4)));
            for (let i = 0; i < numParticles; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dispersion = Math.random() * 1.2;
                // Add slight backward drift vector based on direction of motion
                const vx = Math.cos(angle) * dispersion - dx * 0.12;
                const vy = Math.sin(angle) * dispersion - dy * 0.12;

                const life = 15 + Math.random() * 20; // 15 to 35 frames
                const size = 1.2 + Math.random() * 10;

                particles.push(createParticle(cometHead.x, cometHead.y, vx, vy, life, size));
            }
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            const opacity = p.life / p.maxLife;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * opacity, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleBaseColor}, ${opacity * 0.65})`;
            ctx.fill();
        }

        // Draw glowing comet head
        if (isMouseActive) {
            ctx.beginPath();
            ctx.arc(cometHead.x, cometHead.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = headColor;
            ctx.shadowColor = dark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 30, 30, 0.4)';
            ctx.shadowBlur = dark ? 10 : 5;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow for efficiency
        }

        // Sleep state verification to prevent idle rendering
        const timeSinceMove = Date.now() - lastMouseTime;
        if (particles.length === 0 && timeSinceMove > 1000) {
            isDrawing = false;
        } else {
            requestAnimationFrame(drawLoop);
        }
    };
};

/* ==========================================================================
   AVATAR B&W TO COLOR SCRATCH REVEAL EFFECT
   ========================================================================= */
const initAvatarScratch = () => {
    const img = document.getElementById('avatar-img');
    const container = document.getElementById('avatar-container');
    if (!img || !container) return;

    // Create and append canvas overlay
    const canvas = document.createElement('canvas');
    canvas.className = 'avatar-canvas';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let points = [];
    let isLoopRunning = false;
    let imgWidth = 0;
    let imgHeight = 0;

    const dpr = window.devicePixelRatio || 1;

    // Set canvas sizes based on container boundaries
    const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        imgWidth = rect.width;
        imgHeight = rect.height;
        canvas.width = imgWidth * dpr;
        canvas.height = imgHeight * dpr;
        ctx.scale(dpr, dpr);
        drawGrayscale();
    };

    // Draw the grayscale version onto the canvas overlay
    const drawGrayscale = () => {
        if (!img.complete || img.naturalWidth === 0) return;
        ctx.clearRect(0, 0, imgWidth, imgHeight);
        ctx.save();
        ctx.filter = 'grayscale(100%) contrast(1.15)'; // Elegant dramatic black & white
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
        ctx.restore();
    };

    // Main animation loop for erasing and fading back
    const updateAndDraw = () => {
        if (points.length === 0) {
            drawGrayscale();
            isLoopRunning = false;
            return;
        }

        // 1. Draw solid grayscale image as base
        ctx.save();
        ctx.clearRect(0, 0, imgWidth, imgHeight);
        ctx.filter = 'grayscale(100%) contrast(1.15)';
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
        ctx.restore();

        // 2. Apply destination-out composite to erase areas where cursor passed
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        for (let i = points.length - 1; i >= 0; i--) {
            const p = points[i];
            p.life -= 0.012; // Controls reveal duration (approx 80 frames)
            if (p.life <= 0) {
                points.splice(i, 1);
                continue;
            }

            // Radius scales down as it fades
            const radius = p.maxRadius * (0.3 + 0.7 * p.life);
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);

            // Outer edges blend smoothly into the black & white overlay
            grad.addColorStop(0, `rgba(0, 0, 0, ${p.life})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        requestAnimationFrame(updateAndDraw);
    };

    // Convert screen coordinates to canvas local coordinates and verify circular boundary
    const addScratchPoint = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Verify bounds inside the circular container (using center & radius)
        const centerX = imgWidth / 2;
        const centerY = imgHeight / 2;
        const clipRadius = imgWidth / 2;
        const distance = Math.hypot(x - centerX, y - centerY);

        if (distance <= clipRadius) {
            points.push({
                x,
                y,
                life: 1.0,
                maxRadius: 40 + Math.random() * 20 // Comet size dependent
            });

            if (!isLoopRunning) {
                isLoopRunning = true;
                requestAnimationFrame(updateAndDraw);
            }
        }
    };

    // Register mouse hover movement
    window.addEventListener('mousemove', (e) => {
        if (!img.complete || img.naturalWidth === 0) return;
        addScratchPoint(e.clientX, e.clientY);
    });

    // Mobile / Touch support
    window.addEventListener('touchmove', (e) => {
        if (!img.complete || img.naturalWidth === 0) return;
        if (e.touches.length > 0) {
            addScratchPoint(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    // Initialize when ready
    if (img.complete) {
        resizeCanvas();
    } else {
        img.addEventListener('load', resizeCanvas);
    }

    // Handle container resizing
    window.addEventListener('resize', resizeCanvas);
};

/* ==========================================================================
   INITIALIZE ALL MODULES ON CONTENT LOADED
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initTypewriter();
    initScrollEffects();
    initSkillAnimations();
    initFintechWidget();
    initContactForm();
    initCometCursor();
    // initAvatarScratch();
});
