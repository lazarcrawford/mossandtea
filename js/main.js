/* ============================================
   Moss & Tea — Irina Crawford Photography
   Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Nav scroll effect ---
    const nav = document.getElementById('nav');
    const hero = document.getElementById('hero');

    function updateNav() {
        const scrollY = window.scrollY;
        const heroBottom = hero ? hero.offsetHeight : 0;

        if (scrollY > 50) {
            nav.classList.add('nav--scrolled');
            nav.classList.remove('nav--transparent');
        } else {
            nav.classList.remove('nav--scrolled');
            nav.classList.add('nav--transparent');
        }
    }

    // Initial state
    if (window.scrollY <= 50) {
        nav.classList.add('nav--transparent');
    }

    window.addEventListener('scroll', updateNav, { passive: true });

    // --- Mobile nav toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav__links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav__links--open');
        });
    }

    // Close mobile nav on link click
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('nav__links--open');
        });
    });

    // --- Smooth scroll for nav links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Contact form handler ---
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            // Build mailto fallback
            const name = form.querySelector('input[placeholder="Name"]').value;
            const email = form.querySelector('input[placeholder="Email"]').value;
            const subject = form.querySelector('input[placeholder="Subject"]').value || 'Photography Inquiry';
            const message = form.querySelector('textarea').value;

            const mailtoLink = `mailto:hello@mossandtea.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\n\n${message}`
            )}`;

            // Open mailto as fallback
            window.location.href = mailtoLink;

            // Reset button after a moment
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 3000);
        });
    }

    // --- Fade-in on scroll (Intersection Observer) ---
    const fadeElements = document.querySelectorAll('.section__header, .about__grid, .services__grid, .contact__grid');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';

                requestAnimationFrame(() => {
                    entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                });

                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        fadeObserver.observe(el);
    });

    // --- Gallery item click (future: Lightbox) ---
    document.querySelectorAll('.gallery__item').forEach(item => {
        item.addEventListener('click', () => {
            // Placeholder for lightbox future enhancement
            const img = item.querySelector('img');
            if (img) {
                console.log('Gallery item clicked:', img.src);
                // Future: Open in lightbox
            }
        });
    });

});
