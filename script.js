// ──────────────────────────────────────────────
// 0.  THEME INITIALIZATION & TOGGLE
// ──────────────────────────────────────────────
(function() {
    const root = document.documentElement;
    let isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    function applyTheme(dark) {
        if (dark) {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
        document.dispatchEvent(new CustomEvent('themeChanged'));
    }

    // Apply immediately to prevent flash
    applyTheme(isDark);

    // Wait for DOM to hook up buttons
    document.addEventListener("DOMContentLoaded", () => {
        const themeBtns = document.querySelectorAll('.theme-toggle-btn');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                isDark = !isDark;
                applyTheme(isDark);
            });
        });
    });
})();

// ──────────────────────────────────────────────
// 1.  HERO TYPING EFFECT
// ──────────────────────────────────────────────
const heroStr = "The Universe, Decoded.";
let heroIdx = 0;
const heroEl = document.getElementById("hero-text");

function typeHero() {
    if (heroIdx <= heroStr.length) {
        heroEl.textContent = heroStr.slice(0, heroIdx);
        heroIdx++;
        setTimeout(typeHero, 55 + Math.random() * 45);
    }
}
setTimeout(typeHero, 900);

// ──────────────────────────────────────────────
// 2.  MOBILE MENU
// ──────────────────────────────────────────────
const mobBtn = document.getElementById("mob-btn");
const mobMenu = document.getElementById("mob-menu");
if (mobBtn && mobMenu) {
    mobBtn.addEventListener("click", () => {
        const open = !mobMenu.classList.contains("hidden");
        mobMenu.classList.toggle("hidden");
        mobBtn.setAttribute("aria-expanded", !open);
        mobBtn.textContent = open ? "[menu]" : "[close]";
    });
    mobMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
        mobMenu.classList.add("hidden");
        mobBtn.setAttribute("aria-expanded", "false");
        mobBtn.textContent = "[menu]";
    }));
}

// ──────────────────────────────────────────────
// 3.  FOOTER YEAR
// ──────────────────────────────────────────────
const yearEl = document.getElementById("yr");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// ──────────────────────────────────────────────
// 4.  QUANTUM CONSTELLATION NETWORK
// ──────────────────────────────────────────────
(function () {
    const cvs = document.getElementById("spacetime-canvas");
    if (!cvs) return;
    const ctx = cvs.getContext("2d");

    /* ---- Config ---- */
    const PARTICLE_COUNT = 150;
    const CONNECT_DISTANCE = 140; // max distance to draw a line between particles
    const MOUSE_DISTANCE = 200;   // max distance for mouse interaction
    const PARTICLE_SPEED = 0.4;

    

    function getThemeColors() {
        const rs = getComputedStyle(document.documentElement);
        // Provide fallback strings to parse if css variables aren't ready
        const p1 = rs.getPropertyValue('--canvas-p1').trim() || '0,255,156';
        const p2 = rs.getPropertyValue('--canvas-p2').trim() || '97,175,239';
        const p3 = rs.getPropertyValue('--canvas-p3').trim() || '198,120,221';
        const line = rs.getPropertyValue('--canvas-line').trim() || '0,255,156';
        
        const parseRGB = (str) => {
            const parts = str.split(',').map(s => parseInt(s.trim()));
            return { r: parts[0] || 0, g: parts[1] || 255, b: parts[2] || 156 };
        };
        return {
            colors: [parseRGB(p1), parseRGB(p2), parseRGB(p3)],
            line: parseRGB(line)
        };
    }
    
    let themeColors = getThemeColors();
    document.addEventListener('themeChanged', () => {
        themeColors = getThemeColors();
        particles.forEach(p => {
            p.baseColor = themeColors.colors[Math.floor(Math.random() * themeColors.colors.length)];
        });
    });


    /* ---- State ---- */
    let W, H, dpr;
    let mx = -9999, my = -9999;
    let particles = [];

    /* ---- Resize ---- */
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        cvs.width = W * dpr;
        cvs.height = H * dpr;
        cvs.style.width = W + "px";
        cvs.style.height = H + "px";
        ctx.scale(dpr, dpr);

        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * PARTICLE_SPEED;
            this.vy = Math.sin(angle) * PARTICLE_SPEED;

            this.radius = Math.random() * 1.5 + 0.5;
            this.baseColor = themeColors.colors[Math.floor(Math.random() * themeColors.colors.length)];
        }

        update() {
            // Mouse interaction: Gentle repulsion to simulate magnetic field
            const dx = mx - this.x;
            const dy = my - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_DISTANCE) {
                const force = (MOUSE_DISTANCE - dist) / MOUSE_DISTANCE;
                this.x -= (dx / dist) * force * 2;
                this.y -= (dy / dist) * force * 2;
            }

            // Normal movement
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off walls smoothly
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;

            // Failsafe bounds
            if (this.x < -50) this.x = W + 50;
            if (this.x > W + 50) this.x = -50;
            if (this.y < -50) this.y = H + 50;
            if (this.y > H + 50) this.y = -50;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.baseColor.r}, ${this.baseColor.g}, ${this.baseColor.b}, 0.8)`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Adjust particle count based on screen size for performance
        const count = Math.floor((W * H) / 12000);
        const finalCount = Math.min(Math.max(count, 50), PARTICLE_COUNT);

        for (let i = 0; i < finalCount; i++) {
            particles.push(new Particle());
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Update all particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }

        // Draw connections (highly optimized loop)
        ctx.lineWidth = 0.8;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];

            // Connect to mouse if close enough
            const dxm = mx - p1.x;
            const dym = my - p1.y;
            const distm = Math.sqrt(dxm * dxm + dym * dym);
            if (distm < MOUSE_DISTANCE) {
                const opacity = 1 - (distm / MOUSE_DISTANCE);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(mx, my);
                ctx.strokeStyle = `rgba(${themeColors.line.r}, ${themeColors.line.g}, ${themeColors.line.b}, ${opacity * 0.5})`;
                ctx.stroke();
            }

            // Connect to other particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                // Fast distance check squared to avoid unnecessary Math.sqrt
                if (dx * dx + dy * dy < CONNECT_DISTANCE * CONNECT_DISTANCE) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const opacity = 1 - (dist / CONNECT_DISTANCE);

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);

                    // Blend colors for lines based on the first particle
                    ctx.strokeStyle = `rgba(${p1.baseColor.r}, ${p1.baseColor.g}, ${p1.baseColor.b}, ${opacity * 0.35})`;
                    ctx.stroke();
                }
            }

            // Finally, draw the particle dot on top
            p1.draw();
        }

        requestAnimationFrame(draw);
    }

    /* ---- Events ---- */
    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener("mouseleave", () => { mx = -9999; my = -9999; });
    document.addEventListener("touchmove", e => {
        const touch = e.touches[0];
        if (touch) { mx = touch.clientX; my = touch.clientY; }
    }, { passive: true });
    document.addEventListener("touchend", () => { mx = -9999; my = -9999; });

    /* ---- Init ---- */
    resize();
    draw();
})();

// ──────────────────────────────────────────────
// 5.  VIEW ARCHIVE
// ──────────────────────────────────────────────
const viewArchiveBtn = document.getElementById("view-archive-btn");
if (viewArchiveBtn) {
    viewArchiveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const hiddenItems = document.querySelectorAll(".archive-item.hidden");
        hiddenItems.forEach(item => {
            item.classList.remove("hidden");
        });
        // Hide the button container since we've shown all items
        viewArchiveBtn.parentElement.style.display = "none";
    });
}


// ──────────────────────────────────────────────
// 6. CATEGORY FILTERING
// ──────────────────────────────────────────────
const pills = document.querySelectorAll('.category-pill');
const articlesList = document.querySelectorAll('.flat-article');

if (pills.length > 0 && articlesList.length > 0) {
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Update active state
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            const cat = pill.textContent.toLowerCase();
            
            articlesList.forEach(art => {
                const subtitle = art.querySelector('.flat-subtitle').textContent.toLowerCase();
                
                // Show all if 'General' is clicked, otherwise filter
                if (cat === 'general' || subtitle.includes(cat) || subtitle.includes(cat.replace('holes', 'hole'))) {
                    // Make sure it doesn't have the 'hidden' class if it was an archive item
                    art.classList.remove('hidden'); 
                    art.style.display = 'flex';
                } else {
                    art.style.display = 'none';
                }
            });
            
            // Hide the view archive button if filtering
            const archiveBtn = document.getElementById('view-archive-btn');
            if (archiveBtn) {
                archiveBtn.parentElement.style.display = 'none';
            }
        });
    });
}
