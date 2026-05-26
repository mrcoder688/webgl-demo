// Main JavaScript for WebGL Demo

document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursorDot');
    
    if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let dotX = 0, dotY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            dotX += (mouseX - dotX) * 0.3;
            dotY += (mouseY - dotY) * 0.3;
            
            cursor.style.left = cursorX - 10 + 'px';
            cursor.style.top = cursorY - 10 + 'px';
            cursorDot.style.left = dotX - 3 + 'px';
            cursorDot.style.top = dotY - 3 + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
        
        // Hover effect on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .feature-card-3d');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }
    
    // GSAP Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Hero animations
        gsap.to('.hero-eyebrow', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.5,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-title', {
            opacity: 0,
            y: 50,
            duration: 1.2,
            delay: 0.7,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 0.9,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-cta', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            delay: 1.1,
            ease: 'power3.out'
        });
        
        gsap.to('.scroll-indicator', {
            opacity: 1,
            duration: 0.8,
            delay: 1.5
        });
        
        // Features header
        gsap.from('.features-header', {
            scrollTrigger: {
                trigger: '.features-header',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out'
        });
        
        // 3D Cards stagger animation
        gsap.from('.feature-card-3d', {
            scrollTrigger: {
                trigger: '.features-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 80,
            rotateX: 15,
            stagger: 0.15,
            duration: 1,
            ease: 'power3.out'
        });
        
        // Showcase section
        gsap.from('.showcase-text', {
            scrollTrigger: {
                trigger: '.showcase',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: -50,
            duration: 1.2,
            ease: 'power3.out'
        });
        
        gsap.from('.cube-container', {
            scrollTrigger: {
                trigger: '.showcase',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: 50,
            scale: 0.8,
            duration: 1.2,
            ease: 'power3.out'
        });
        
        // Stats counter animation
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.target);
            
            ScrollTrigger.create({
                trigger: stat,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to(stat, {
                        innerHTML: target,
                        duration: 2,
                        snap: { innerHTML: 1 },
                        ease: 'power2.out'
                    });
                },
                once: true
            });
        });
        
        // Parallax effect on scroll
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 100,
            opacity: 0.3
        });
    }
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 3D Card touch support for mobile
    const cards3D = document.querySelectorAll('.feature-card-3d');
    cards3D.forEach(card => {
        card.addEventListener('touchstart', () => {
            card.classList.toggle('flipped');
        });
    });
    
    // Cube mouse interaction
    const cube = document.querySelector('.cube-3d');
    const cubeContainer = document.querySelector('.cube-container');
    
    if (cube && cubeContainer && window.matchMedia('(pointer: fine)').matches) {
        cubeContainer.addEventListener('mousemove', (e) => {
            const rect = cubeContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            cube.style.animation = 'none';
            cube.style.transform = `rotateX(${-15 + y * 30}deg) rotateY(${x * 60}deg)`;
        });
        
        cubeContainer.addEventListener('mouseleave', () => {
            cube.style.animation = 'cube-rotate 20s infinite linear';
        });
    }
});
