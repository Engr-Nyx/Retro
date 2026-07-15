// --------------------------------------------------
// DRAG & DROP PHOTO HANDLER (For local testing/persistence)
// --------------------------------------------------
function initPhotoSlots() {
    const dropZones = document.querySelectorAll('.drop-zone');
    
    // Load from localStorage if available
    dropZones.forEach(zone => {
        const id = zone.id;
        const savedImage = localStorage.getItem(`photo_${id}`);
        if (savedImage) {
            zone.innerHTML = `<img src="${savedImage}" alt="Photo">`;
        }

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    zone.innerHTML = `<img src="${dataUrl}" alt="Photo">`;
                    try {
                        localStorage.setItem(`photo_${id}`, dataUrl);
                    } catch(err) {
                        console.warn("Image too large for localStorage.");
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

// --------------------------------------------------
// GLOBAL MOTION ENGINE (1 rAF Loop for Parallax)
// --------------------------------------------------
function initMotionEngine() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let scrollY = window.scrollY;
    let targetScrollY = scrollY;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let isTicking = false;

    // Cache section layout properties to prevent layout thrashing (no offsetTop/offsetHeight reads in rAF)
    let cachedSections = [];
    function updateSectionCache() {
        const sections = document.querySelectorAll('main > section');
        cachedSections = Array.from(sections).map(section => {
            return {
                element: section,
                top: section.offsetTop,
                height: section.offsetHeight,
                layers: Array.from(section.querySelectorAll('.parallax-layer'))
            };
        });
    }

    // Update cache on resize & load
    window.addEventListener('resize', updateSectionCache);
    window.addEventListener('load', updateSectionCache);
    updateSectionCache(); // Initial cache

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
        if (!isTicking) {
            window.requestAnimationFrame(updateLoop);
            isTicking = true;
        }
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
        if (!isTicking) {
            window.requestAnimationFrame(updateLoop);
            isTicking = true;
        }
    }, { passive: true });

    function updateLoop() {
        // Smooth interpolation (lerp)
        scrollY += (targetScrollY - scrollY) * 0.1;
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;

        const viewportHeight = window.innerHeight;
        const viewportCenter = scrollY + viewportHeight / 2;

        cachedSections.forEach(sec => {
            const sectionBottom = sec.top + sec.height;
            // Only update layers if section is visible in the viewport
            if (scrollY + viewportHeight > sec.top && scrollY < sectionBottom) {
                const sectionCenter = sec.top + sec.height / 2;
                const diff = viewportCenter - sectionCenter;
                const range = viewportHeight + sec.height;
                const fraction = diff / range; // Normalizes from -0.5 (entering) to 0.5 (leaving)

                sec.layers.forEach(layer => {
                    const speedPx = parseFloat(layer.getAttribute('data-px')) || 0;
                    const speedMx = parseFloat(layer.getAttribute('data-mx')) || 0;

                    // Mouse Parallax
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    const deltaX = mouseX - centerX;
                    const deltaY = mouseY - centerY;
                    const moveMouseX = deltaX * speedMx;
                    const moveMouseY = deltaY * speedMx;

                    // Scroll Parallax (Max displacement of 120px)
                    const maxTranslation = 120;
                    const moveY = fraction * maxTranslation * speedPx;

                    layer.style.transform = `translate3d(${moveMouseX}px, ${moveY + moveMouseY}px, 0)`;
                });
            }
        });

        if (Math.abs(targetScrollY - scrollY) > 0.5 || Math.abs(targetMouseX - mouseX) > 0.5 || Math.abs(targetMouseY - mouseY) > 0.5) {
            window.requestAnimationFrame(updateLoop);
        } else {
            isTicking = false;
        }
    }
}

// --------------------------------------------------
// REVEAL SYSTEM (Once per load)
// --------------------------------------------------
function initReveals() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const elements = document.querySelectorAll('.reveal, .reveal-fade, .reveal-zoom, .reveal-slide-left, .reveal-slide-right, .reveal-rise, .timeline-line.reveal-draw');
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once revealed
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    elements.forEach(el => {
        observer.observe(el);
    });
}

// --------------------------------------------------
// CARD 3D TILT & GLOW (Throttled for pointer-fine)
// --------------------------------------------------
function initCardTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.tilt-3d');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set variables for glow
            card.style.setProperty('--mouseX', `${x}px`);
            card.style.setProperty('--mouseY', `${y}px`);
            
            // 3D Tilt calculation (max 6deg)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6; 
            const rotateY = ((x - centerX) / centerX) * 6;  
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// --------------------------------------------------
// PARTICLE MESH CANVAS (Spatial Grid & Pause off-tab)
// --------------------------------------------------
function initCanvasBackground() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 60; // Capped for perf
    const connectionDistance = 150;
    let isVisible = true;
    let animationId;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = 1.5;
            this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.5)' : 'rgba(0, 245, 160, 0.4)';
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    // Spatial Grid implementation for O(n) check approximation
    function animate() {
        if (!isVisible) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => { p.update(); p.draw(); });
        
        // Simple O(n^2) is fine for 60 particles, spatial grid is overkill for N=60
        // but limiting N keeps it well within budget.
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                // bounding box check first for speed
                if (Math.abs(dx) < connectionDistance && Math.abs(dy) < connectionDistance) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance) {
                        const alpha = (1 - dist / connectionDistance) * 0.2;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
        }
        animationId = requestAnimationFrame(animate);
    }
    
    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isVisible = false;
            cancelAnimationFrame(animationId);
        } else {
            isVisible = true;
            animate();
        }
    });

    animate();
}

// --------------------------------------------------
// TYPING EFFECT
// --------------------------------------------------
function initTypingEffect() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;
    
    const words = ['Cybersecurity Enthusiast', 'Web & Mobile Developer', 'CTF Competitor', 'Long Distance Rider'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentWord = words[wordIndex];
        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120;
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500;
        }
        setTimeout(type, typingSpeed);
    }
    setTimeout(type, 1000);
}

// --------------------------------------------------
// CUSTOM CURSOR & MAGNETIC HOVER
// --------------------------------------------------
function initCustomCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cursor = document.querySelector('.custom-cursor');
    const outline = document.querySelector('.custom-cursor-outline');
    if (!cursor || !outline) return;

    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let outlineX = mouseX, outlineY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isMoving) {
            cursor.style.opacity = '1';
            outline.style.opacity = '1';
            isMoving = true;
        }
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        outline.style.left = outlineX + 'px';
        outline.style.top = outlineY + 'px';
        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover effect
    const hoverables = document.querySelectorAll('a, button, .drop-zone');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => { cursor.classList.add('hovered'); outline.classList.add('hovered'); });
        el.addEventListener('mouseleave', () => { cursor.classList.remove('hovered'); outline.classList.remove('hovered'); });
    });

    // Magnetic Wrap logic
    const magneticElements = document.querySelectorAll('.magnetic-wrap');
    magneticElements.forEach(el => {
        const inner = el.querySelector('.magnetic-inner');
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            inner.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
        });
        el.addEventListener('mouseleave', () => {
            inner.style.transform = `translate3d(0, 0, 0)`;
            inner.style.transition = `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)`;
        });
        el.addEventListener('mouseenter', () => {
            inner.style.transition = 'none';
        });
    });
}

// Mobile Nav
function initMobileNav() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('.nav-menu');
    if (!toggle || !nav) return;
    
    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('open');
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initPhotoSlots();
    initMotionEngine();
    initReveals();
    initCardTilt();
    initCanvasBackground();
    initTypingEffect();
    initCustomCursor();
    initMobileNav();
});
