// ──────────────────────────────────────────────
// 1.  HERO TYPING EFFECT
// ──────────────────────────────────────────────
const heroStr = "the universe, decoded.\nline by line.";
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
    
    // Theme colors: Green (#00ff9c), Blue (#61afef), Purple (#c678dd)
    const COLORS = [
        { r: 0, g: 255, b: 156 },
        { r: 97, g: 175, b: 239 },
        { r: 198, g: 120, b: 221 }
    ];

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
            this.baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
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
                ctx.strokeStyle = `rgba(0, 255, 156, ${opacity * 0.5})`; // Neon green connecting to mouse
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
