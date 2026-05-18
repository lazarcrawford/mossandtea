/* ============================================
   Moss & Tea — Light interaction layer
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Scroll progress ---
    const progress = document.querySelector('.scroll-progress');

    function updateProgress() {
        if (!progress) return;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
        progress.style.width = `${Math.min(100, Math.max(0, ratio * 100)).toFixed(1)}%`;
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    // --- Scroll reveals ---
    const revealItems = document.querySelectorAll('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealItems.forEach((item) => item.classList.add('reveal--visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('reveal--visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

        revealItems.forEach((item) => revealObserver.observe(item));
    }

    // --- Service card reveals ---
    const serviceCards = document.querySelectorAll('.service-card');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        serviceCards.forEach((card) => card.classList.add('service-card--visible'));
    } else {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('service-card--visible');
                cardObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14 });

        serviceCards.forEach((card) => cardObserver.observe(card));
    }

    // ============================================
    // Lightbox
    // ============================================
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

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
            .filter((item) => !item.hidden);
    }

    function openLightbox(index, items = getItems()) {
        if (index < 0 || index >= items.length) return;

        currentIndex = index;
        const item = items[currentIndex];
        const category = item.dataset.category || 'held-gaze';
        const src = item.dataset.src;

        lbImage.classList.remove('lightbox__image--loaded');
        lbImage.src = '';
        lbImage.alt = '';

        Array.from(lightbox.classList)
            .filter((className) => className.startsWith('lightbox--') && className !== 'lightbox--open')
            .forEach((className) => lightbox.classList.remove(className));
        lightbox.classList.add(`lightbox--${category}`, 'lightbox--open');
        document.body.style.overflow = 'hidden';

        const tempImg = new Image();
        tempImg.onload = () => {
            lbImage.src = src;
            lbImage.alt = item.querySelector('img')?.alt || '';
            requestAnimationFrame(() => lbImage.classList.add('lightbox__image--loaded'));
        };
        tempImg.src = src;

        // Preload neighbors so prev/next feel instant
        const preload = (offset) => {
            const target = items[currentIndex + offset];
            if (!target) return;
            const url = target.dataset.src;
            if (!url) return;
            const img = new Image();
            img.decoding = 'async';
            img.src = url;
        };
        preload(1);
        preload(-1);

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
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < items.length) openLightbox(nextIndex, items);
    }

    document.addEventListener('click', (event) => {
        const item = event.target.closest('[data-lightbox]');
        if (!item || item.hidden) return;
        const items = getItems();
        const index = items.indexOf(item);
        if (index >= 0) openLightbox(index, items);
    });

    lbClose.addEventListener('click', closeLightbox);
    lbCloseArea.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => navigate(-1));
    lbNext.addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', (event) => {
        if (!lightbox.classList.contains('lightbox--open')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') navigate(-1);
        if (event.key === 'ArrowRight') navigate(1);
    });

    let touchStartX = 0;

    lightbox.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (event) => {
        const diff = touchStartX - event.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
    }, { passive: true });
});
