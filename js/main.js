// GSAP Animations and Interactions
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let cursorX = 0, cursorY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function animateCursor() {
    dotX += (cursorX - dotX) * 0.2;
    dotY += (cursorY - dotY) * 0.2;
    
    cursor.style.left = cursorX - 10 + 'px';
    cursor.style.top = cursorY - 10 + 'px';
    cursorDot.style.left = dotX - 3 + 'px';
    cursorDot.style.top = dotY - 3 + 'px';
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effects
document.querySelectorAll('a, button, .feature-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Hero entrance animations
const heroTl = gsap.timeline({ delay: 0.5 });

heroTl
    .to('.hero-eyebrow', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
    })
    .from('.hero-title', {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-subtitle', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.7')
    .from('.hero-cta', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
    }, '-=0.5')
    .to('.scroll-indicator', {
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.3');

// Glitch effect on title
const glitchText = document.querySelector('.glitch');
if (glitchText) {
    setInterval(() => {
        glitchText.style.animation = 'none';
        glitchText.offsetHeight; // Trigger reflow
        glitchText.style.animation = '';
    }, 3000);
}

// Features scroll animation
gsap.from('.features-header', {
    scrollTrigger: {
        trigger: '.features',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.feature-card', {
    scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
});

// Feature card mouse tracking for glow effect
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
    });
});

// Showcase parallax
gsap.from('.showcase-content', {
    scrollTrigger: {
        trigger: '.showcase',
        start: 'top center',
        end: 'bottom center',
        scrub: 1
    },
    y: 100,
    opacity: 0.5
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            gsap.to(window, {
                duration: 1.5,
                scrollTo: { y: target, offsetY: 80 },
                ease: 'power3.inOut'
            });
        }
    });
});

// Magnetic effect on buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
        });
    });
});

// Nav background on scroll
ScrollTrigger.create({
    start: 'top -100',
    onUpdate: (self) => {
        const nav = document.querySelector('.nav');
        if (self.direction === 1 && self.scroll() > 100) {
            nav.style.background = 'rgba(5, 5, 8, 0.8)';
            nav.style.backdropFilter = 'blur(20px)';
        } else if (self.scroll() < 100) {
            nav.style.background = 'transparent';
            nav.style.backdropFilter = 'none';
        }
    }
});

// Text scramble effect for nav logo
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span style="color: var(--accent)">${char}</span>`;
            } else {
                output += from;
            }
        }
        
        this.el.innerHTML = output;
        
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Initialize text scramble on logo hover
const logo = document.querySelector('.nav-logo');
if (logo) {
    const fx = new TextScramble(logo);
    let counter = 0;
    const phrases = [
        'THE-KERN3L',
        'THE-KERN3L',
        'WEBGL-DEMO',
        'THE-KERN3L'
    ];
    
    logo.addEventListener('mouseenter', () => {
        fx.setText(phrases[counter]).then(() => {
            counter = (counter + 1) % phrases.length;
        });
    });
}

// Performance: Pause animations when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gsap.globalTimeline.pause();
    } else {
        gsap.globalTimeline.resume();
    }
});
