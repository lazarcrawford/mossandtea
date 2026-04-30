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

    // --- Custom Cursor ---
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-follower';
        cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';

        const style = document.createElement('style');
        style.textContent = `
            .cursor-follower {
                position: fixed; pointer-events: none; z-index: 9999;
                top: 0; left: 0;
                transition: transform 0.1s cubic-bezier(0.25,0.1,0.25,1);
            }
            .cursor-dot {
                width: 6px; height: 6px; background: var(--clay);
                border-radius: 50%; position: absolute; top: -3px; left: -3px;
            }
            .cursor-ring {
                width: 32px; height: 32px;
                border: 1px solid rgba(139,111,94,0.3);
                border-radius: 50%; position: absolute; top: -16px; left: -16px;
                transition: all 0.3s cubic-bezier(0.25,0.1,0.25,1);
            }
            .cursor-follower--active .cursor-ring {
                width: 48px; height: 48px; top: -24px; left: -24px;
                border-color: var(--sage);
                background: rgba(138,154,122,0.08);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(cursor);

        let mx2 = 0, my2 = 0, dx = 0, dy = 0;
        document.addEventListener('mousemove', (e) => { mx2 = e.clientX; my2 = e.clientY; });

        function animateDot() {
            dx += (mx2 - dx) * 0.25;
            dy += (my2 - dy) * 0.25;
            cursor.style.transform = `translate(${dx}px, ${dy}px)`;
            requestAnimationFrame(animateDot);
        }
        animateDot();

        document.querySelectorAll('a, button, .gallery__item, .service-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-follower--active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-follower--active'));
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
            lightbox.classList.remove('lightbox--witness', 'lightbox--body', 'lightbox--earth', 'lightbox--trace');
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
