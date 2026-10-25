// ============================================================
// ALWAYS OPEN AT HERO (TOP) — Clear hash and scroll to top
// ============================================================
if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname);
}
// Force scroll to very top before anything renders
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

// Extra safety: scroll to top after DOM paints
window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 50);
});

// Prevent browser from restoring previous scroll position
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Theme Toggle (Dark / Light Mode) ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector("i") : null;
    
    // Check saved user preference in localStorage
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        if (themeIcon) {
            themeIcon.className = "bx bx-sun";
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            const isLight = document.body.classList.contains("light-mode");
            
            // Rotate animation effect
            themeToggleBtn.style.transform = "rotate(360deg) scale(1.2)";
            setTimeout(() => {
                themeToggleBtn.style.transform = "";
            }, 500);

            // Icon swap with smooth transition
            if (themeIcon) {
                themeIcon.className = isLight ? "bx bx-sun" : "bx bx-moon";
            }
            
            // Save state
            localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
        });
    }

    // --- 1. Initialize AOS (Animate on Scroll) ---
    AOS.init({
        duration: 800,
        once: false,
        mirror: true,
        offset: 50
    });

    // --- Smooth Nav Scroll (manual, so browser restore doesn't interfere) ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- 2. Initialize Vanilla Tilt for Project Cards ---
    VanillaTilt.init(document.querySelectorAll(".tilt"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.05
    });

    // --- 3. Typing Effect ---
    const typingText = document.getElementById("typing-text");
    const phrases = ["AI Enthusiast", "Full Stack Developer", "System Architect", "Problem Solver"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before typing new word
        }

        setTimeout(typeEffect, typingSpeed);
    }
    
    setTimeout(typeEffect, 1000);

    // --- 4. Animated Stats Counter ---
    const stats = document.querySelectorAll(".stat-number");
    let hasAnimatedStats = false;

    function animateStats() {
        stats.forEach(stat => {
            const target = +stat.getAttribute("data-target");
            const duration = 2000; // ms
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target + "+";
                }
            };
            updateCounter();
        });
    }

    // --- 5. Scroll Listener for Stats and Progress Bars ---
    const skillsSection = document.getElementById("skills");
    const progressBars = document.querySelectorAll(".progress");
    let hasAnimatedSkills = false;

    window.addEventListener("scroll", () => {
        // Animate Stats when in view
        const heroRect = document.querySelector(".stats-container").getBoundingClientRect();
        if (heroRect.top < window.innerHeight && !hasAnimatedStats) {
            animateStats();
            hasAnimatedStats = true;
        }

        // Animate Skills Progress
        if (skillsSection.getBoundingClientRect().top < window.innerHeight - 100 && !hasAnimatedSkills) {
            progressBars.forEach(bar => {
                const width = bar.style.getPropertyValue("--w");
                bar.style.width = width;
            });
            hasAnimatedSkills = true;
        }
    });

    // --- 5b. Live LeetCode Intelligence Dashboard Engine ---
    initLeetCodeDashboard();

    // --- 6. Hack the Terminal Game ---
    // --- 6. Hack the Terminal Game ---
    const terminalBody = document.getElementById("terminal-body");
    const commandHistory = [];
    let historyIndex = -1;

    function getTerminalInput() {
        return document.getElementById("terminal-input");
    }

    // Clicking anywhere in the terminal focuses the prompt input
    const terminalContainer = document.querySelector(".terminal-container");
    if (terminalContainer) {
        terminalContainer.addEventListener("click", () => {
            const input = getTerminalInput();
            if (input) input.focus();
        });
    }

    function smoothNavigateTo(selector) {
        const target = document.querySelector(selector);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function appendTerminalElement(el) {
        const input = getTerminalInput();
        if (input && input.parentElement) {
            input.parentElement.before(el);
        } else {
            terminalBody.appendChild(el);
        }
    }

    function printTerminalText(text, className = "terminal-line", isError = false) {
        const p = document.createElement("p");
        p.className = `terminal-line ${className}`;
        p.textContent = text;
        if (isError) {
            p.style.color = "#ff5f56";
        }
        appendTerminalElement(p);
    }

    function printTerminalHtml(htmlContent) {
        const div = document.createElement("div");
        div.className = "terminal-line";
        div.innerHTML = htmlContent;
        appendTerminalElement(div);
    }

    function displayHelp() {
        const helpHtml = `
            <p style="color: #27c93f; margin-bottom: 6px; font-weight: 600;">Available commands:</p>
            <div style="line-height: 1.6; color: var(--accent-cyan); padding-left: 2px;">
                <div>help</div>
                <div>about</div>
                <div>skills</div>
                <div>projects</div>
                <div>contact</div>
                <div>leetcode</div>
                <div>clear</div>
                <div>matrix</div>
            </div>
        `;
        printTerminalHtml(helpHtml);
    }

    function handleTerminalKeydown(e) {
        // Up Arrow: Navigate back through command history
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (commandHistory.length > 0 && historyIndex > 0) {
                historyIndex--;
                this.value = commandHistory[historyIndex];
            } else if (commandHistory.length > 0 && historyIndex === -1) {
                historyIndex = commandHistory.length - 1;
                this.value = commandHistory[historyIndex];
            }
            return;
        }

        // Down Arrow: Navigate forward through command history
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex !== -1 && historyIndex < commandHistory.length - 1) {
                historyIndex++;
                this.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                this.value = "";
            }
            return;
        }

        if (e.key === "Enter") {
            const rawVal = this.value;
            const trimmed = rawVal.trim();

            // Ignore empty input
            if (trimmed === "") return;

            // Save to history & reset history pointer
            commandHistory.push(trimmed);
            historyIndex = -1;

            const cmd = trimmed.toLowerCase();

            // Echo the executed command line
            printTerminalText(`guest@antigravity-os:~$ ${rawVal}`, "prompt-text");

            // Execute commands
            switch (cmd) {
                case "help":
                    displayHelp();
                    break;

                case "about":
                    printTerminalText("Navigating to About Me section...", "sys-msg");
                    smoothNavigateTo("#about");
                    break;

                case "skills":
                    printTerminalText("Navigating to Technical Arsenal...", "sys-msg");
                    smoothNavigateTo("#skills");
                    break;

                case "projects":
                    printTerminalText("Navigating to Featured Projects...", "sys-msg");
                    smoothNavigateTo("#projects");
                    break;

                case "contact":
                    printTerminalText("Navigating to Contact section...", "sys-msg");
                    smoothNavigateTo("#contact");
                    break;

                case "leetcode":
                    printTerminalText("Opening LeetCode profile [https://leetcode.com/u/deekshithkr/]...", "sys-msg");
                    window.open("https://leetcode.com/u/deekshithkr/", "_blank", "noopener,noreferrer");
                    break;

                case "clear":
                    // Clear all terminal output
                    terminalBody.innerHTML = "";
                    break;

                case "matrix":
                case "konami":
                    printTerminalText("Initiating Matrix Protocol...", "sys-msg", true);
                    startMatrixRain();
                    break;

                default:
                    // Display requested exact format in red text
                    printTerminalText(`Command not found: ${trimmed}. Type 'help' to see available commands.`, "sys-msg error", true);
                    break;
            }

            // Cleanly reposition/render active input line at the bottom
            const activeInputLine = this.parentElement;
            if (activeInputLine) {
                activeInputLine.remove();
            }

            const inputHtml = `
                <div class="input-line">
                    <span class="prompt">guest@antigravity-os:~$</span>
                    <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" autofocus>
                </div>
            `;
            terminalBody.insertAdjacentHTML('beforeend', inputHtml);

            // Re-attach key listener and re-focus
            const newInput = getTerminalInput();
            if (newInput) {
                newInput.addEventListener("keydown", handleTerminalKeydown);
                newInput.focus();
            }

            // Scroll terminal to latest output
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }

    const initialInput = getTerminalInput();
    if (initialInput) {
        initialInput.addEventListener("keydown", handleTerminalKeydown);
    }

    // --- 7. Matrix Rain Easter Egg ---
    function startMatrixRain() {
        const canvas = document.getElementById('matrix-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.opacity = '1';
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/\\';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for (let x = 0; x < columns; x++) drops[x] = 1;
        
        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px Space Mono';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
                    drops[i] = 0;
                drops[i]++;
            }
        }
        
        const matrixInterval = setInterval(drawMatrix, 33);
        
        // Stop after 10 seconds
        setTimeout(() => {
            clearInterval(matrixInterval);
            canvas.style.opacity = '0';
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, 1000);
        }, 10000);
    }

    // --- 8. Copy Email Function ---
    const copyBtn = document.getElementById("copy-email-btn");
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText("deekshith29891@gmail.com");
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = "<i class='bx bx-check'></i> Email Copied!";
        copyBtn.style.borderColor = "#00d4ff";
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.borderColor = "";
        }, 3000);
    });

    // --- 9. Theme Toggle (Simple Dark/Darker) ---
    const themeToggle = document.getElementById("theme-toggle");
    let isDarker = false;
    themeToggle.addEventListener("click", () => {
        if (!isDarker) {
            document.documentElement.style.setProperty('--bg-primary', '#000000');
            document.documentElement.style.setProperty('--bg-secondary', '#050505');
            isDarker = true;
        } else {
            document.documentElement.style.setProperty('--bg-primary', '#050505');
            document.documentElement.style.setProperty('--bg-secondary', '#0a0a0f');
            isDarker = false;
        }
    });

    // --- 10. Contact Form → POST to Formspree ---
    document.getElementById("contact-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector("button");
        const name    = document.getElementById("name").value.trim();
        const email   = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // Show loading state
        btn.disabled = true;
        btn.innerHTML = "<span>Transmitting...</span> <i class='bx bx-loader bx-spin'></i>";

        try {
            const res = await fetch("https://formspree.io/f/mpqbeyzy", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ name, email, message }),
            });

            if (res.ok) {
                btn.innerHTML = "<span>Transmission Sent &#128233;</span> <i class='bx bx-check'></i>";
                btn.style.background = "linear-gradient(45deg, #27c93f, #00d4ff)";
                e.target.reset();
            } else {
                btn.innerHTML = "<span>Failed &#10060; Try Again</span> <i class='bx bx-error'></i>";
                btn.style.background = "linear-gradient(45deg, #ff5f56, #ff6b6b)";
            }
        } catch (err) {
            // Server not running — fallback feedback
            btn.innerHTML = "<span>Server Offline</span> <i class='bx bx-wifi-off'></i>";
            btn.style.background = "linear-gradient(45deg, #ff5f56, #ff6b6b)";
            console.error("Contact form error:", err);
        } finally {
            btn.disabled = false;
            setTimeout(() => {
                btn.innerHTML = "<span>Send Transmission</span> <i class='bx bx-send'></i>";
                btn.style.background = "linear-gradient(45deg, var(--accent-purple), var(--accent-cyan))";
            }, 4000);
        }
    });

    // --- 10b. Premium Interactive Custom Cursor ---
    initCustomCursor();
});

// ============================================================
// PREMIUM INTERACTIVE CUSTOM CURSOR IMPLEMENTATION
// ============================================================
function initCustomCursor() {
    // Check if device supports hover and fine pointer (mouse/trackpad)
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFinePointer) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cursorDot = document.getElementById("cursor-dot");
    const cursorRing = document.getElementById("cursor-ring");
    if (!cursorDot || !cursorRing) return;

    document.body.classList.add("custom-cursor-active");

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isHovering = false;
    let isProjectCard = false;
    let isClicking = false;
    let animationFrameId = null;

    // Smooth lerp speed (0.16 = buttery smooth slight delay)
    const lerpSpeed = prefersReducedMotion ? 1 : 0.16;

    function render() {
        if (isVisible) {
            // Dot follows cursor immediately
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

            // Outer ring follows with smooth delayed interpolation
            if (prefersReducedMotion) {
                ringX = mouseX;
                ringY = mouseY;
            } else {
                ringX += (mouseX - ringX) * lerpSpeed;
                ringY += (mouseY - ringY) * lerpSpeed;
            }

            const clickScale = isClicking ? " scale(0.88)" : "";
            cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)${clickScale}`;
        }
        animationFrameId = requestAnimationFrame(render);
    }
    animationFrameId = requestAnimationFrame(render);

    // Track mouse movement
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isVisible) {
            isVisible = true;
            cursorDot.classList.add("cursor-visible");
            cursorRing.classList.add("cursor-visible");
            ringX = mouseX;
            ringY = mouseY;
        }
    }, { passive: true });

    // Handle cursor leaving the window
    document.addEventListener("mouseleave", () => {
        isVisible = false;
        cursorDot.classList.remove("cursor-visible");
        cursorRing.classList.remove("cursor-visible");
    });

    document.addEventListener("mouseenter", () => {
        isVisible = true;
        cursorDot.classList.add("cursor-visible");
        cursorRing.classList.add("cursor-visible");
    });

    // Subtle Click Feedback
    window.addEventListener("mousedown", () => {
        isClicking = true;
        cursorDot.classList.add("cursor-clicking");
        cursorRing.classList.add("cursor-clicking");
    });

    window.addEventListener("mouseup", () => {
        isClicking = false;
        cursorDot.classList.remove("cursor-clicking");
        cursorRing.classList.remove("cursor-clicking");
    });

    // Event delegation for interactive elements & project cards
    const interactiveSelector = "a, button, input, textarea, select, .btn, .theme-toggle, .timeline-dot, .dot, .project-links button";

    document.addEventListener("mouseover", (e) => {
        const target = e.target;

        // Check if inside project card
        const projectCard = target.closest(".project-card");
        const interactiveEl = target.closest(interactiveSelector);

        if (projectCard && !interactiveEl) {
            // Hovering project card area
            if (!isProjectCard) {
                isProjectCard = true;
                cursorRing.classList.add("cursor-project");
                cursorDot.classList.add("cursor-project");
            }
            if (isHovering) {
                isHovering = false;
                cursorRing.classList.remove("cursor-hover");
                cursorDot.classList.remove("cursor-hover");
            }
        } else if (interactiveEl) {
            // Hovering buttons, links, inputs
            if (isProjectCard) {
                isProjectCard = false;
                cursorRing.classList.remove("cursor-project");
                cursorDot.classList.remove("cursor-project");
            }
            if (!isHovering) {
                isHovering = true;
                cursorRing.classList.add("cursor-hover");
                cursorDot.classList.add("cursor-hover");
            }
        } else {
            // Neither
            if (isProjectCard) {
                isProjectCard = false;
                cursorRing.classList.remove("cursor-project");
                cursorDot.classList.remove("cursor-project");
            }
            if (isHovering) {
                isHovering = false;
                cursorRing.classList.remove("cursor-hover");
                cursorDot.classList.remove("cursor-hover");
            }
        }
    });

    // Listen for window blur / focus
    window.addEventListener("blur", () => {
        isVisible = false;
        cursorDot.classList.remove("cursor-visible");
        cursorRing.classList.remove("cursor-visible");
    });
}

// ============================================================
// LIVE LEETCODE INTELLIGENCE DASHBOARD ENGINE
// ============================================================
function initLeetCodeDashboard() {
    const dashboardSection = document.getElementById("leetcode-intel");
    if (!dashboardSection) return;

    // State
    let lastSnapshot = null;
    let refreshIntervalTimer = null;
    const POLLING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

    // DOM Elements
    const statusLabel = document.getElementById("status-label");
    const statusIndicator = document.querySelector(".status-indicator");
    const refreshBtn = document.getElementById("btn-refresh-leetcode");
    const refreshIcon = document.getElementById("refresh-icon");

    const elGlobalRank = document.getElementById("val-global-rank");
    const elAcceptanceRate = document.getElementById("val-acceptance-rate");
    const elTotalSubs = document.getElementById("val-total-subs");
    const elLastSynced = document.getElementById("val-last-synced");

    const elTotalSolved = document.getElementById("val-total-solved");
    const elEasySolved = document.getElementById("val-easy-solved");
    const elMedSolved = document.getElementById("val-med-solved");
    const elHardSolved = document.getElementById("val-hard-solved");

    const barEasy = document.getElementById("bar-easy");
    const barMed = document.getElementById("bar-med");
    const barHard = document.getElementById("bar-hard");

    const elCurrentStreak = document.getElementById("val-current-streak");
    const elLongestStreak = document.getElementById("val-longest-streak");
    const elTodaySubs = document.getElementById("val-today-subs");
    const elWeeklySubs = document.getElementById("val-weekly-subs");
    const elMonthlySubs = document.getElementById("val-monthly-subs");
    const elActiveDays = document.getElementById("val-active-days");

    const elGoalCounter = document.getElementById("goal-counter-text");
    const elGoalFill = document.getElementById("goal-progress-fill");
    const elGoalStatus = document.getElementById("goal-status-text");

    const heatmapGrid = document.getElementById("heatmap-grid");
    const heatmapMonths = document.getElementById("heatmap-months");
    const heatmapTooltip = document.getElementById("heatmap-tooltip");
    const recentBody = document.getElementById("recent-submissions-body");
    const toastHub = document.getElementById("toast-hub");

    // Toast notification creator
    function showToast(title, message, iconClass = 'bx bx-badge-check') {
        if (!toastHub) return;
        const toast = document.createElement("div");
        toast.className = "leetcode-toast";
        toast.innerHTML = `
            <i class='${iconClass} toast-icon'></i>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-msg">${message}</span>
            </div>
            <button class="toast-dismiss" aria-label="Dismiss">&times;</button>
        `;
        toast.querySelector(".toast-dismiss").addEventListener("click", () => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(40px)";
            setTimeout(() => toast.remove(), 250);
        });
        toastHub.appendChild(toast);

        // Auto dismiss after 6 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = "0";
                toast.style.transform = "translateX(40px)";
                setTimeout(() => toast.remove(), 250);
            }
        }, 6000);
    }

    // Set Engine Status
    function setStatus(type, label) {
        if (!statusIndicator || !statusLabel) return;
        statusIndicator.className = `status-indicator ${type}`;
        statusLabel.textContent = label;
    }

    // Animate Number Count
    function animateValue(element, targetNum, suffix = "") {
        if (!element) return;
        if (targetNum === null || targetNum === undefined) {
            element.textContent = "Unavailable";
            return;
        }
        const target = typeof targetNum === "number" ? targetNum : parseInt(targetNum, 10);
        if (isNaN(target)) {
            element.textContent = targetNum;
            return;
        }
        let start = 0;
        const duration = 1200;
        const increment = Math.ceil(target / (duration / 16));
        const step = () => {
            start += increment;
            if (start < target) {
                element.textContent = start.toLocaleString() + suffix;
                requestAnimationFrame(step);
            } else {
                element.textContent = target.toLocaleString() + suffix;
            }
        };
        step();
    }

    // Render Heatmap (GitHub style - 52 weeks / 7 days per column)
    function renderHeatmap(dateCounts = {}) {
        if (!heatmapGrid) return;
        heatmapGrid.innerHTML = "";
        if (heatmapMonths) heatmapMonths.innerHTML = "";

        const today = new Date();
        const totalWeeks = 52;
        const totalDays = totalWeeks * 7;

        // Find the start date (aligned to Sunday/Monday)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - totalDays);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let lastMonth = -1;

        // Build list of all dates
        const dateList = [];
        let cur = new Date(startDate);
        while (cur <= today) {
            dateList.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
        }

        // Render months header labels
        if (heatmapMonths) {
            let weekCount = 0;
            dateList.forEach((d, idx) => {
                if (idx % 7 === 0) {
                    const m = d.getMonth();
                    if (m !== lastMonth && weekCount > 3) {
                        const mSpan = document.createElement("span");
                        mSpan.style.marginRight = "24px";
                        mSpan.textContent = monthNames[m];
                        heatmapMonths.appendChild(mSpan);
                        lastMonth = m;
                        weekCount = 0;
                    }
                    weekCount++;
                }
            });
        }

        // Render grid cells
        dateList.forEach(d => {
            const dateStr = d.toISOString().split("T")[0];
            const count = dateCounts[dateStr] || 0;

            let level = 0;
            if (count > 0 && count <= 2) level = 1;
            else if (count > 2 && count <= 5) level = 2;
            else if (count > 5 && count <= 10) level = 3;
            else if (count > 10) level = 4;

            const cell = document.createElement("div");
            cell.className = `heatmap-cell level-${level}`;
            cell.dataset.date = dateStr;
            cell.dataset.count = count;

            // Hover tooltip
            cell.addEventListener("mouseenter", (e) => {
                if (!heatmapTooltip) return;
                const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                heatmapTooltip.innerHTML = `<strong>${count} submission${count === 1 ? '' : 's'}</strong> on ${formattedDate}`;
                heatmapTooltip.style.display = "block";
                const rect = cell.getBoundingClientRect();
                heatmapTooltip.style.left = `${rect.left + window.scrollX - 40}px`;
                heatmapTooltip.style.top = `${rect.top + window.scrollY - 38}px`;
            });

            cell.addEventListener("mouseleave", () => {
                if (heatmapTooltip) heatmapTooltip.style.display = "none";
            });

            heatmapGrid.appendChild(cell);
        });
    }

    // Render Recent Submissions
    function renderRecentSubmissions(submissions = []) {
        if (!recentBody) return;
        if (!submissions || submissions.length === 0) {
            recentBody.innerHTML = `<tr><td colspan="4" class="table-loading-cell">No recent submissions found on profile.</td></tr>`;
            return;
        }

        recentBody.innerHTML = submissions.map(sub => {
            const isAccepted = sub.isAccepted || sub.statusDisplay?.toLowerCase() === "accepted";
            const statusClass = isAccepted ? "accepted" : "failed";
            const date = new Date(sub.timestamp * 1000);
            const timeAgo = formatTimeAgo(date);

            return `
                <tr>
                    <td>
                        <a href="https://leetcode.com/problems/${sub.titleSlug}/" target="_blank" rel="noopener noreferrer" class="sub-title-link">
                            ${sub.title}
                        </a>
                    </td>
                    <td><span class="status-pill ${statusClass}">${sub.statusDisplay}</span></td>
                    <td><span class="lang-badge">${sub.lang}</span></td>
                    <td><span class="time-badge" title="${date.toLocaleString()}">${timeAgo}</span></td>
                </tr>
            `;
        }).join("");
    }

    function formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    // Compare with Previous Snapshot for Verified Notifications
    function evaluateProgressDiff(prev, next) {
        if (!prev || !next) return;

        // 1. New Problems Solved
        const prevSolved = prev.stats?.totalSolved || 0;
        const nextSolved = next.stats?.totalSolved || 0;
        if (nextSolved > prevSolved) {
            const diff = nextSolved - prevSolved;
            showToast("New Problem Solved! 🚀", `Congratulations! You solved ${diff} new LeetCode problem${diff === 1 ? '' : 's'}. Total: ${nextSolved}`);
        }

        // 2. New Accepted Submissions
        const prevLatestTs = prev.recentSubmissions?.[0]?.timestamp || 0;
        const newAccepted = (next.recentSubmissions || []).filter(sub => 
            sub.timestamp > prevLatestTs && (sub.isAccepted || sub.statusDisplay?.toLowerCase() === "accepted")
        );
        newAccepted.forEach(sub => {
            showToast("Submission Accepted! ✅", `Accepted on "${sub.title}" (${sub.lang})`);
        });

        // 3. Streak Extended
        const prevStreak = prev.stats?.currentStreak || 0;
        const nextStreak = next.stats?.currentStreak || 0;
        if (nextStreak > prevStreak && nextStreak > 1) {
            showToast("Streak Extended! 🔥", `Active coding streak is now ${nextStreak} consecutive days!`);
        }

        // 4. Milestone Check
        if (prevSolved < 100 && nextSolved >= 100) {
            showToast("Milestone Unlocked! 🏆", "Centurion Milestone: 100+ LeetCode problems solved!");
        }
    }

    // Main Fetch Function
    async function fetchIntelligence(isManual = false) {
        setStatus("syncing", "Syncing...");
        if (refreshIcon) refreshIcon.classList.add("bx-spin");

        try {
            const url = isManual ? "/api/leetcode?refresh=true" : "/api/leetcode";
            const res = await fetch(url);
            const json = await res.json();

            if (!json.success || !json.data) {
                throw new Error(json.error || "Invalid response structure");
            }

            const data = json.data;

            // Diff check if we had a prior snapshot
            if (lastSnapshot) {
                evaluateProgressDiff(lastSnapshot, data);
            }
            lastSnapshot = data;

            // Update DOM with live data
            if (elGlobalRank) elGlobalRank.textContent = data.profile?.ranking ? `#${data.profile.ranking.toLocaleString()}` : "Unavailable";
            if (elAcceptanceRate) elAcceptanceRate.textContent = data.stats?.acceptanceRate || "Unavailable";
            if (elTotalSubs) elTotalSubs.textContent = data.stats?.totalSubmissions ? data.stats.totalSubmissions.toLocaleString() : "--";
            if (elLastSynced) {
                const syncDate = new Date(data.lastSynchronized || Date.now());
                elLastSynced.textContent = syncDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // Stats breakdown
            animateValue(elTotalSolved, data.stats?.totalSolved);
            if (elEasySolved) elEasySolved.textContent = `${data.stats?.easySolved || 0}`;
            if (elMedSolved) elMedSolved.textContent = `${data.stats?.mediumSolved || 0}`;
            if (elHardSolved) elHardSolved.textContent = `${data.stats?.hardSolved || 0}`;

            const total = data.stats?.totalSolved || 1;
            if (barEasy) barEasy.style.width = `${Math.min(100, Math.round(((data.stats?.easySolved || 0) / total) * 100))}%`;
            if (barMed) barMed.style.width = `${Math.min(100, Math.round(((data.stats?.mediumSolved || 0) / total) * 100))}%`;
            if (barHard) barHard.style.width = `${Math.min(100, Math.round(((data.stats?.hardSolved || 0) / total) * 100))}%`;

            // Streaks
            animateValue(elCurrentStreak, data.stats?.currentStreak);
            animateValue(elLongestStreak, data.stats?.longestStreak);
            animateValue(elTodaySubs, data.stats?.todaySubmissions);
            animateValue(elWeeklySubs, data.stats?.weeklySubmissions);
            animateValue(elMonthlySubs, data.stats?.monthlySubmissions);
            animateValue(elActiveDays, data.stats?.totalActiveDays);

            // Daily Target (Goal: 2 problems per day)
            const todayCount = data.stats?.todaySubmissions || 0;
            const target = 2;
            const goalPercent = Math.min(100, Math.round((todayCount / target) * 100));
            if (elGoalFill) elGoalFill.style.width = `${goalPercent}%`;
            if (elGoalCounter) elGoalCounter.textContent = `${todayCount} / ${target} Submissions`;
            if (elGoalStatus) {
                elGoalStatus.textContent = todayCount >= target 
                    ? "✨ Daily target achieved for today!" 
                    : `${target - todayCount} more submission required to hit daily cadence.`;
            }

            // Render Heatmap & Recent Submissions
            renderHeatmap(data.heatmap?.dateCounts);
            renderRecentSubmissions(data.recentSubmissions);

            // Update status indicator
            if (json.source === "stale_cache") {
                setStatus("stale", "Cached Snapshot");
            } else {
                setStatus("live", "Live & Synchronized");
            }

            if (isManual) {
                showToast("Telemetry Synchronized", "Successfully refreshed live statistics from LeetCode.", "bx bx-check-circle");
            }
        } catch (err) {
            console.error("LeetCode dashboard sync error:", err);
            setStatus("offline", "Sync Error");
            if (elLastSynced && !lastSnapshot) {
                elLastSynced.textContent = "Offline";
            }
            if (isManual) {
                showToast("Sync Notice", "Could not reach LeetCode API. Serving cached telemetry.", "bx bx-info-circle");
            }
        } finally {
            if (refreshIcon) refreshIcon.classList.remove("bx-spin");
        }
    }

    // Refresh Button Event
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            fetchIntelligence(true);
        });
    }

    // Initial Fetch
    fetchIntelligence(false);

    // Set Up Background Polling Every 5 Minutes
    if (refreshIntervalTimer) clearInterval(refreshIntervalTimer);
    refreshIntervalTimer = setInterval(() => {
        fetchIntelligence(false);
    }, POLLING_INTERVAL_MS);
}



// --- 11. Three.js Background Objects (Hero) ---
function initThreeJSHero() {
    const container = document.getElementById('hero-canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create Torus Knot
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x7b2cbf, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x00d4ff
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 30;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        torusKnot.rotation.x += 0.005;
        torusKnot.rotation.y += 0.005;
        
        particlesMesh.rotation.y += 0.001;
        
        // Gentle camera movement based on mouse
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// --- 12. Three.js Avatar (About) ---
function initThreeJSAvatar() {
    const container = document.getElementById('avatar-3d-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create Icosahedron (Geometric shape representing tech/structure)
    const geometry = new THREE.IcosahedronGeometry(2, 0);
    
    // Custom shader material for glowing neon effect
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x00d4ff,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x00d4ff,
        emissiveIntensity: 0.2,
        wireframe: true
    });
    
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7b2cbf, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        shape.rotation.x += 0.01;
        shape.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

// Call Three.js initializations
window.addEventListener('load', () => {
    initThreeJSHero();
    initThreeJSAvatar();
});

// --- 13. Particles.js (tsParticles) Initialization ---
tsParticles.load("tsparticles", {
    fpsLimit: 60,
    particles: {
        number: {
            value: 40,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: ["#00d4ff", "#7b2cbf"]
        },
        shape: {
            type: "circle",
        },
        opacity: {
            value: 0.3,
            random: true,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: false,
            }
        },
        links: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.1,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
                default: "out"
            },
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detectsOn: "canvas",
        events: {
            onHover: {
                enable: true,
                mode: "grab"
            },
            onClick: {
                enable: true,
                mode: "push"
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                links: {
                    opacity: 0.5
                }
            },
            push: {
                quantity: 4
            }
        }
    },
    detectRetina: true
});
