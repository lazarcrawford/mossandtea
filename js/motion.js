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
            .filter((item) => !item.hidden)
            .sort((a, b) => parseInt(a.dataset.lightbox, 10) - parseInt(b.dataset.lightbox, 10));
    }

    function openLightbox(index) {
        const items = getItems();
        if (index < 0 || index >= items.length) return;

        currentIndex = index;
        const item = items[currentIndex];
        const category = item.dataset.category || 'witness';
        const src = item.dataset.src;

        lbImage.classList.remove('lightbox__image--loaded');
        lbImage.src = '';
        lbImage.alt = '';

        lightbox.classList.remove('lightbox--witness', 'lightbox--body', 'lightbox--performance', 'lightbox--editorial', 'lightbox--earth', 'lightbox--trace');
        lightbox.classList.add(`lightbox--${category}`, 'lightbox--open');
        document.body.style.overflow = 'hidden';

        const tempImg = new Image();
        tempImg.onload = () => {
            lbImage.src = src;
            lbImage.alt = item.querySelector('img')?.alt || '';
            requestAnimationFrame(() => lbImage.classList.add('lightbox__image--loaded'));
        };
        tempImg.src = src;

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
        const nextIndex = currentIndex + direction;
        const items = getItems();
        if (nextIndex >= 0 && nextIndex < items.length) openLightbox(nextIndex);
    }

    document.addEventListener('click', (event) => {
        const item = event.target.closest('[data-lightbox]');
        if (!item || item.hidden) return;
        const index = getItems().indexOf(item);
        if (index >= 0) openLightbox(index);
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
