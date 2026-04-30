/* ============================================
   Moss & Tea — Motion Physics Engine
   Smooth scroll · Parallax · 3D Tilt · Reveals
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Inject Lenis smooth scroll ---
    const lenisScript = document.createElement('script');
    lenisScript.src = 'https://unpkg.com/lenis@1.1.18/dist/lenis.min.js';
    lenisScript.onload = initMotion;
    document.head.appendChild(lenisScript);

    function initMotion() {
        // --- Lenis Smooth Scroll ---
        const lenis = new Lenis({
            duration: 1.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 1.5,
            infinite: false
        });

        lenis.on('scroll', (e) => {
            const progress = document.querySelector('.scroll-progress');
            if (progress) progress.style.width = (e.progress * 100).toFixed(1) + '%';
        });

        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        // --- Scroll Reveals ---
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        // --- Gallery Stagger ---
        const galleryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('gallery__item--visible');
                    galleryObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('.gallery__item').forEach(el => galleryObserver.observe(el));

        // --- Service Cards Stagger ---
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('service-card--visible');
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.service-card').forEach(el => cardObserver.observe(el));

        // --- 3D Card Tilt ---
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                card.style.transform = `perspective(800px) rotateX(${((y - cy) / cy) * -8}deg) rotateY(${((x - cx) / cx) * 8}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
            });
        });
    }

    // --- Mouse Parallax on Hero (works without Lenis) ---
    const hero = document.querySelector('.hero');
    if (hero) {
        const bg = hero.querySelector('.hero__bg');
        const content = hero.querySelector('.hero__content');
        if (bg && content) {
            let mx = 0, my = 0, cx = 0, cy = 0;
            document.addEventListener('mousemove', (e) => {
                mx = (e.clientX / window.innerWidth - 0.5) * 2;
                my = (e.clientY / window.innerHeight - 0.5) * 2;
            });
            function animateParallax() {
                cx += (mx - cx) * 0.05;
                cy += (my - cy) * 0.05;
                bg.style.transform = `translate(${cx * -15}px, ${cy * -10}px) scale(1.05)`;
                content.style.transform = `translate(${cx * 5}px, ${cy * 3}px)`;
                requestAnimationFrame(animateParallax);
            }
            animateParallax();
        }
    }

    // --- Attention shutter cursor ---
    if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const field = document.createElement('div');
        field.className = 'attention-field';
        field.setAttribute('aria-hidden', 'true');

        const cursor = document.createElement('div');
        cursor.className = 'cursor-follower';
        cursor.setAttribute('aria-hidden', 'true');
        cursor.innerHTML = '<div class="cursor-aura"></div><div class="cursor-shutter"></div><div class="cursor-dot"></div>';
        document.body.classList.add('has-attention-cursor');
        document.body.appendChild(field);
        document.body.appendChild(cursor);

        let mx2 = window.innerWidth / 2;
        let my2 = window.innerHeight / 2;
        let dx = mx2;
        let dy = my2;
        let lastX = mx2;
        let lastY = my2;

        document.documentElement.style.setProperty('--gaze-x', `${mx2}px`);
        document.documentElement.style.setProperty('--gaze-y', `${my2}px`);

        document.addEventListener('mousemove', (e) => {
            mx2 = e.clientX;
            my2 = e.clientY;
            document.documentElement.style.setProperty('--gaze-x', `${mx2}px`);
            document.documentElement.style.setProperty('--gaze-y', `${my2}px`);
        }, { passive: true });

        document.addEventListener('mousedown', () => {
            cursor.classList.add('cursor-follower--pulse');
            window.setTimeout(() => cursor.classList.remove('cursor-follower--pulse'), 260);
        });

        function animateDot() {
            const vx = mx2 - lastX;
            const vy = my2 - lastY;
            const speed = Math.min(1, Math.hypot(vx, vy) / 56);
            const angle = Math.atan2(vy, vx) * 180 / Math.PI;
            const hue = (185 + (mx2 / Math.max(1, window.innerWidth)) * 85 + (my2 / Math.max(1, window.innerHeight)) * 32) % 360;

            dx += (mx2 - dx) * 0.18;
            dy += (my2 - dy) * 0.18;
            cursor.style.setProperty('--cursor-speed', speed.toFixed(3));
            cursor.style.setProperty('--cursor-hue', `${hue.toFixed(1)}deg`);
            cursor.style.setProperty('--cursor-tilt', `${angle.toFixed(2)}deg`);
            cursor.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;

            lastX += (mx2 - lastX) * 0.32;
            lastY += (my2 - lastY) * 0.32;
            requestAnimationFrame(animateDot);
        }
        animateDot();

        document.querySelectorAll('a, button, .gallery__item, .service-card, input, textarea').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-follower--active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-follower--active'));
        });

        document.querySelectorAll('.gallery__item, .service-card, .about__image').forEach(el => {
            el.addEventListener('mousemove', (event) => {
                const rect = el.getBoundingClientRect();
                el.style.setProperty('--local-gaze-x', `${event.clientX - rect.left}px`);
                el.style.setProperty('--local-gaze-y', `${event.clientY - rect.top}px`);
            }, { passive: true });
        });
    }

    // ============================================
    // Lightbox — Fluid gallery viewer
    // ============================================
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lbImage = document.getElementById('lightboxImage');
        const lbCaption = document.getElementById('lightboxCaption');
        const lbCounter = document.getElementById('lightboxCounter');
        const lbChapter = document.getElementById('lightboxChapter');
        const lbClose = document.getElementById('lightboxClose');
        const lbPrev = document.getElementById('lightboxPrev');
        const lbNext = document.getElementById('lightboxNext');
        const lbCloseArea = document.getElementById('lightboxCloseArea');

        let currentIndex = 0;

        function getItems() {
            return Array.from(document.querySelectorAll('[data-lightbox]'))
                .filter((item) => !item.hidden)
                .sort((a, b) => parseInt(a.dataset.lightbox) - parseInt(b.dataset.lightbox));
        }

        function openLightbox(index) {
            const items = getItems();
            if (index < 0 || index >= items.length) return;
            currentIndex = index;
            const item = items[currentIndex];
            const category = item.dataset.category || 'witness';

            // Reset image state
            lbImage.classList.remove('lightbox__image--loaded');
            lbImage.src = '';

            // Open the lightbox
            lightbox.classList.remove('lightbox--witness', 'lightbox--body', 'lightbox--performance', 'lightbox--editorial', 'lightbox--earth', 'lightbox--trace');
            lightbox.classList.add(`lightbox--${category}`);
            lightbox.dataset.category = category;
            lightbox.classList.add('lightbox--open');
            document.body.style.overflow = 'hidden';

            // Load the high-res image
            const src = item.dataset.src;
            const tempImg = new Image();
            tempImg.onload = () => {
                lbImage.src = src;
                lbImage.alt = item.querySelector('img')?.alt || '';
                // Small delay for the container transition to begin before image fades in
                setTimeout(() => lbImage.classList.add('lightbox__image--loaded'), 150);
            };
            tempImg.src = src;

            // Caption and counter
            const chapterLabel = document.querySelector(`[data-gallery-filter="${category}"]`)?.textContent?.trim() || '';
            lbCaption.textContent = item.dataset.caption || '';
            lbCounter.textContent = `${currentIndex + 1} / ${items.length}`;
            if (lbChapter) lbChapter.textContent = chapterLabel;
        }

        function closeLightbox() {
            lightbox.classList.remove('lightbox--open');
            document.body.style.overflow = '';
        }

        function navigate(direction) {
            const items = getItems();
            const newIndex = currentIndex + direction;
            if (newIndex >= 0 && newIndex < items.length) {
                openLightbox(newIndex);
            }
        }

        // Click on visible gallery items, including dynamically filtered chapters.
        document.addEventListener('click', (event) => {
            const item = event.target.closest('[data-lightbox]');
            if (!item || item.hidden) return;
            const items = getItems();
            const index = items.indexOf(item);
            if (index >= 0) openLightbox(index);
        });

        // Close handlers
        lbClose.addEventListener('click', closeLightbox);
        lbCloseArea.addEventListener('click', closeLightbox);

        // Navigation
        lbPrev.addEventListener('click', () => navigate(-1));
        lbNext.addEventListener('click', () => navigate(1));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('lightbox--open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                navigate(diff > 0 ? 1 : -1);
            }
        }, { passive: true });
    }

});
