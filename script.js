document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interactive components
    initCanvasBackground();
    initTypingEffect();
    initMobileNav();
    initScrollHeader();
    initSectionObserver();
    initMagneticButtons();
    initHeroParallax();
    initCardGlowEffects();
    initCustomCursor();
    initScrollParallax();
    initPassionsSlider();
});

/* --------------------------------------------------
   INTERACTIVE CANVAS BACKGROUND
-------------------------------------------------- */
function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 60;
    const connectionDistance = 120;
    
    // Mouse tracking for particle interaction
    let mouse = {
        x: null,
        y: null,
        radius: 160
    };
    
    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
            // Interleave color schemes (Teal vs Cyan)
            this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(0, 245, 160, 0.3)';
        }
        
        update() {
            // Move particles
            this.x += this.vx;
            this.y += this.vy;
            
            // Boundary bounce
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
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Draw connections between particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        
        // Draw connections between particles and mouse
        if (mouse.x !== null && mouse.y !== null) {
            particles.forEach(p => {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * 0.22;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            });
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/* --------------------------------------------------
   TYPING EFFECT
-------------------------------------------------- */
function initTypingEffect() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;
    
    const words = [
        'Cybersecurity Enthusiast',
        'Web & Mobile Developer',
        'CTF Competitor',
        'Long Distance Rider',
        'Ocean Adventurer',
        'Music Producer'
    ];
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deleting is faster
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120;
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000; // Pause at the end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before typing next word
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start the typing loop
    setTimeout(type, 1000);
}

/* --------------------------------------------------
   MOBILE NAVIGATION
-------------------------------------------------- */
function initMobileNav() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('.nav-menu');
    const links = document.querySelectorAll('.nav-link');
    
    if (!toggle || !nav) return;
    
    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('open');
        document.body.classList.toggle('no-scroll'); // Prevent scrolling when menu is open
    });
    
    // Close menu when clicking links
    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('open')) {
            toggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('open');
            document.body.classList.remove('no-scroll');
        }
    });
}

/* --------------------------------------------------
   SCROLL HEADER TRANSITION
-------------------------------------------------- */
function initScrollHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* --------------------------------------------------
   ACTIVE NAVIGATION LINK ON SCROLL
-------------------------------------------------- */


/* --------------------------------------------------
   DYNAMIC CARD GLOW EFFECTS
-------------------------------------------------- */
function initCardGlowEffects() {
    const cards = document.querySelectorAll('.about-info-card, .passion-card, .stat-card, .support-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate within the element
            const y = e.clientY - rect.top;  // y coordinate within the element
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            
            // 3D Tilt calculation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6; // Max 6 degrees tilt on X
            const rotateY = ((x - centerX) / centerX) * 6;  // Max 6 degrees tilt on Y
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset tilt and scale smoothly
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

/* --------------------------------------------------
   CUSTOM CURSOR
-------------------------------------------------- */
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const outline = document.querySelector('.custom-cursor-outline');
    if (!cursor || !outline) return;

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Show cursor elements on first move
        if (!isMoving) {
            cursor.style.opacity = '1';
            outline.style.opacity = '1';
            isMoving = true;
        }
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Animate the outline with a slight lag (trailing effect)
    function animateOutline() {
        const ease = 0.15; // Delay factor
        outlineX += (mouseX - outlineX) * ease;
        outlineY += (mouseY - outlineY) * ease;

        outline.style.left = outlineX + 'px';
        outline.style.top = outlineY + 'px';

        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover effect on interactive elements
    const hoverables = document.querySelectorAll('a, button, .btn, .passion-card, .stat-card, .support-card, .social-icons a');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            outline.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            outline.classList.remove('hovered');
        });
    });
}

/* --------------------------------------------------
   SCROLL PARALLAX EFFECT (Viewport-Relative)
-------------------------------------------------- */
function initScrollParallax() {
    const elements = document.querySelectorAll('.parallax-shape, .parallax-wrap');
    if (elements.length === 0) return;

    function updateParallax() {
        const viewportHeight = window.innerHeight;
        
        elements.forEach(el => {
            const section = el.closest('section');
            if (!section) return;

            const sectionRect = section.getBoundingClientRect();
            
            // Only calculate and animate if the section is visible in the viewport
            if (sectionRect.top < viewportHeight && sectionRect.bottom > 0) {
                const sectionHeight = sectionRect.height;
                const totalScrollableRange = viewportHeight + sectionHeight;
                const scrolledIntoView = viewportHeight - sectionRect.top;
                const scrollFraction = scrolledIntoView / totalScrollableRange;

                // Center the translation (0 at the center of the viewport)
                const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
                const maxTranslation = 120 * speed; // Max displacement in pixels
                const yPos = (scrollFraction - 0.5) * maxTranslation * 2;

                el.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });
    }

    // Run on scroll
    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateParallax);
    });
    
    // Run on resize to handle viewport changes
    window.addEventListener('resize', updateParallax);
    
    // Initial position on load
    updateParallax();
}

/* --------------------------------------------------
   STICKY SLIDESHOW STACKING & DOTS
   -------------------------------------------------- */
/* --------------------------------------------------
   SECTION INTERSECTION OBSERVER (SCROLL REVEAL & NAV)
   -------------------------------------------------- */
function initSectionObserver() {
    const sections = document.querySelectorAll('main > section');
    const dots = document.querySelectorAll('.slide-dot');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0) return;

    // Use IntersectionObserver to toggle active-slide class (handles entry & exit animations)
    const options = {
        root: null,
        rootMargin: '-20% 0px -20% 0px', // Trigger when section occupies the center area of viewport
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const section = entry.target;
            const index = Array.from(sections).indexOf(section);

            if (entry.isIntersecting) {
                section.classList.add('active-slide');
                
                // Update active dot navigation
                dots.forEach((dot, dIndex) => {
                    if (dIndex === index) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });

                // Update active header nav link
                navLinks.forEach((link, lIndex) => {
                    if (lIndex === index) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            } else {
                // Remove active-slide class when section exits to allow re-triggering entrance animations
                // This creates the fade-out/zoom-out effect when scrolling away
                section.classList.remove('active-slide');
            }
        });
    }, options);

    sections.forEach(section => observer.observe(section));

    // Connect dots to scroll positions
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = sections[index];
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Connect nav links to scroll positions
    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = sections[index];
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* --------------------------------------------------
   INTERACTIVE MAGNETIC BUTTONS
   -------------------------------------------------- */
function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.btn, .logo, .social-icons a, .slide-dot');
    
    if (window.matchMedia('(pointer: fine)').matches) {
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Attract element towards the cursor position
                el.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0) scale(1.04)`;
                el.style.transition = 'none';
                
                // Attract inner icon slightly more for layered depth
                const icon = el.querySelector('i');
                if (icon) {
                    icon.style.transform = `translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
                    icon.style.transition = 'none';
                }
            });
            
            el.addEventListener('mouseleave', () => {
                // Smoothly snap back to origin
                el.style.transform = '';
                el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                
                const icon = el.querySelector('i');
                if (icon) {
                    icon.style.transform = '';
                    icon.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                }
            });
        });
    }
}


/* --------------------------------------------------
   MULTI-LAYER HERO PARALLAX
   -------------------------------------------------- */
function initHeroParallax() {
    const hero = document.getElementById('hero');
    const layerBg = document.querySelector('.layer-bg');
    const layerGrid = document.querySelector('.layer-grid');
    const layerGlow = document.querySelector('.layer-glow');
    
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const heroHeight = hero.offsetHeight;

        if (scrollTop <= heroHeight) {
            // Background moves slowly
            if (layerBg) layerBg.style.transform = `translate3d(0, ${scrollTop * 0.08}px, 0)`;
            // Grid translates and maintains perspective rotation
            if (layerGrid) layerGrid.style.transform = `perspective(500px) rotateX(60deg) translateY(${-80 + scrollTop * 0.25}px) translateZ(0)`;
            // Glows translate slightly
            if (layerGlow) layerGlow.style.transform = `translate3d(0, ${scrollTop * 0.12}px, 0)`;
        }
    });
}

/* --------------------------------------------------
   DRAG TO SCROLL PASSIONS SLIDER (Desktop)
   -------------------------------------------------- */
function initPassionsSlider() {
    const track = document.querySelector('.passions-grid');
    if (!track) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    // Only enable dragging cursor styles on desktop
    if (window.innerWidth >= 1025) {
        track.style.cursor = 'grab';
    }

    track.addEventListener('mousedown', (e) => {
        if (window.innerWidth < 1025) return;
        isDown = true;
        track.style.cursor = 'grabbing';
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
        if (window.innerWidth < 1025) return;
        isDown = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', () => {
        if (window.innerWidth < 1025) return;
        isDown = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDown || window.innerWidth < 1025) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.8; // Scroll multiplier
        track.scrollLeft = scrollLeft - walk;
    });

    // Handle resize to adjust cursor
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1025) {
            track.style.cursor = 'grab';
        } else {
            track.style.cursor = '';
        }
    });
}


