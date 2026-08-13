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

    // --- 6. Hack the Terminal Game ---
    const terminalInput = document.getElementById("terminal-input");
    const terminalBody = document.getElementById("terminal-body");
    
    const terminalCommands = {
        help: "Available commands: help, about, skills, clear, sudo, matrix, projects",
        about: "Engineering Student. Initializing global domination through code.",
        skills: "Loading skill matrices... JavaScript, Python, C++, React, WebGL.",
        projects: "Accessing restricted files... Access Granted. Scroll up.",
        sudo: "Nice try. This incident will be reported.",
        clear: "CLEAR_ACTION"
    };

    terminalInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            const val = this.value.trim().toLowerCase();
            if (val === "") return;
            
            printTerminal(`guest@antigravity-os:~$ ${val}`, "prompt-text");
            
            if (val === "matrix" || val === "konami") {
                printTerminal("Initiating Matrix Protocol...", "sys-msg red");
                startMatrixRain();
            } else if (val === "clear") {
                // Keep the initial headers
                terminalBody.innerHTML = `
                    <p class="sys-msg">Terminal cleared.</p>
                `;
            } else if (terminalCommands[val]) {
                printTerminal(terminalCommands[val], "sys-msg");
            } else {
                printTerminal(`bash: ${val}: command not found`, "sys-msg error");
            }
            
            // Re-add input line
            const inputHtml = `
                <div class="input-line">
                    <span class="prompt">guest@antigravity-os:~$</span>
                    <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" autofocus>
                </div>
            `;
            this.parentElement.remove();
            terminalBody.insertAdjacentHTML('beforeend', inputHtml);
            
            // Re-attach event listener
            const newInput = document.getElementById("terminal-input");
            newInput.addEventListener("keydown", arguments.callee);
            newInput.focus();
            
            // Scroll to bottom
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });

    function printTerminal(text, className) {
        const p = document.createElement("p");
        p.className = className;
        p.textContent = text;
        if (className.includes("error")) p.style.color = "#ff5f56";
        if (className.includes("red")) p.style.color = "#ff6b6b";
        terminalInput.parentElement.before(p);
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
            themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
            isDarker = true;
        } else {
            document.documentElement.style.setProperty('--bg-primary', '#050505');
            document.documentElement.style.setProperty('--bg-secondary', '#0a0a0f');
            themeToggle.innerHTML = "<i class='bx bx-moon'></i>";
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
                btn.innerHTML = "<span>Transmission Sent ✓</span> <i class='bx bx-check'></i>";
                btn.style.background = "linear-gradient(45deg, #27c93f, #00d4ff)";
                e.target.reset();
            } else {
                btn.innerHTML = "<span>Failed — Try Again</span> <i class='bx bx-error'></i>";
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
});

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
