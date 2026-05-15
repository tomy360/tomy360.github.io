// Scroll Reveal - solo en desktop
if (window.innerWidth > 768) {
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-visible');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-anim]').forEach(el => animObserver.observe(el));
} else {
    // En mobile: todos visibles desde el inicio
    document.querySelectorAll('[data-anim]').forEach(el => el.classList.add('anim-visible'));
}

// Navbar glassmorphism on scroll
const nav = document.querySelector('nav');
if (nav) {
    window.addEventListener('scroll', () => {
        nav.classList.toggle('nav-scrolled', window.scrollY > 50);
    }, { passive: true });
}

// Partículas sutiles en el hero
const hero = document.querySelector('.CartelPresent');
if (hero && !document.getElementById('particles-canvas')) {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    hero.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        w = canvas.width = hero.offsetWidth;
        h = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 35; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            o: Math.random() * 0.4 + 0.1
        });
    }

    function animar() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.o})`;
            ctx.fill();
        });
        requestAnimationFrame(animar);
    }
    animar();
}
