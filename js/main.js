/* ============================================
   Moss & Tea — Irina Crawford Photography
   Interactions
   ============================================ */

const DEFAULT_GALLERY_FILTER = 'held-gaze';
const GALLERY_MANIFEST_URL = '/data/gallery-config.json';

let galleryChapters = {};
let galleryImages = [];
let activeGalleryFilter = DEFAULT_GALLERY_FILTER;

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char]));
}

function setGalleryStatus(message) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    gallery.innerHTML = `<p class="gallery__status">${escapeHtml(message)}</p>`;
}

function chapterById(id) {
    return galleryChapters[id] || galleryChapters[DEFAULT_GALLERY_FILTER] || { label: '', text: '' };
}

async function loadArchiveManifest() {
    const response = await fetch(GALLERY_MANIFEST_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Gallery manifest failed to load: ${response.status}`);

    const manifest = await response.json();
    galleryChapters = Object.fromEntries((manifest.chapters || []).map((chapter) => [chapter.id, chapter]));
    galleryImages = manifest.images || [];

    if (!galleryImages.length) throw new Error('Gallery manifest does not include images.');
}

function renderArchiveGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    gallery.innerHTML = galleryImages.map((image, index) => {
        const classes = ['gallery__item'];
        if (image.layout) classes.push(`gallery__item--${image.layout}`);
        const ratioWidth = Number(image.thumbWidth || image.width) || 1;
        const ratioHeight = Number(image.thumbHeight || image.height) || 1;
        const rowSpan = Math.max(18, Math.round((ratioHeight / ratioWidth) * 34));

        return `
            <button class="${classes.join(' ')}" style="--row-span: ${rowSpan};" type="button" data-category="${escapeHtml(image.chapter)}" data-lightbox="${index + 1}" data-src="${escapeHtml(image.full)}" data-caption="${escapeHtml(image.caption)}">
                <img src="${escapeHtml(image.thumb)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" width="${Number(image.thumbWidth) || ''}" height="${Number(image.thumbHeight) || ''}">
                <span class="gallery__overlay">
                    <span>${escapeHtml(image.caption)}</span>
                </span>
            </button>
        `;
    }).join('');
}

function applyGalleryFilter(filter = DEFAULT_GALLERY_FILTER) {
    const copy = document.getElementById('portfolioChapterCopy');
    const gallery = document.getElementById('gallery');
    const chapter = chapterById(filter);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeGalleryFilter = filter;

    document.querySelectorAll('[data-gallery-filter]').forEach((button) => {
        const active = button.dataset.galleryFilter === filter;
        button.classList.toggle('portfolio__chapter--active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const reveal = () => {
        if (!gallery) return;
        gallery.dataset.activeCategory = filter;

        const visibleItems = [];
        document.querySelectorAll('#gallery [data-category]').forEach((item) => {
            const visible = item.dataset.category === filter;
            item.hidden = !visible;
            item.classList.remove('gallery__item--enter');
            if (visible) visibleItems.push(item);
        });

        visibleItems.forEach((item, index) => {
            item.style.setProperty('--enter-delay', `${Math.min(index * 28, 260)}ms`);
            requestAnimationFrame(() => item.classList.add('gallery__item--enter'));
        });

        gallery.classList.remove('gallery--switching');
    };

    if (gallery && !reduceMotion && gallery.dataset.activeCategory && gallery.dataset.activeCategory !== filter) {
        gallery.classList.add('gallery--switching');
        window.setTimeout(reveal, 160);
    } else {
        reveal();
    }

    if (copy) copy.textContent = chapter.text;
}

async function initializeArchiveGallery() {
    try {
        setGalleryStatus('Gathering the archive...');
        await loadArchiveManifest();
        renderArchiveGallery();
        applyGalleryFilter(activeGalleryFilter);
    } catch (err) {
        console.error(err);
        setGalleryStatus('The archive is not available right now.');
    }
}

initializeArchiveGallery();

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

    // --- Logo: smooth scroll to top on homepage ---
    document.querySelectorAll('[data-scroll-top]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // --- Contact form handler ---
    const form = document.getElementById('contactForm');
    if (form) {
        const status = document.getElementById('contactStatus');

        function setStatus(message, type = '') {
            if (!status) return;
            status.textContent = message;
            status.className = `form__status ${type ? `form__status--${type}` : ''}`;
        }

        function mailtoFallback(values) {
            const mailtoLink = `mailto:hello@mossandtea.com?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(
                `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`
            )}`;
            window.location.href = mailtoLink;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;
            setStatus('');

            // Honeypot — if a bot filled the hidden "company" field, silently no-op
            if (form.elements.company && form.elements.company.value) {
                form.reset();
                setStatus('Thank you. Your note was sent.', 'success');
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }

            const values = {
                name: form.elements.name.value.trim(),
                email: form.elements.email.value.trim(),
                subject: form.elements.subject.value.trim() || 'Photography Inquiry',
                message: form.elements.message.value.trim(),
            };

            try {
                const resp = await fetch('/api/inquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok || !data.ok) {
                    throw new Error(data.message || data.error || 'Inquiry endpoint unavailable');
                }
                form.reset();
                setStatus('Thank you. Your note was sent.', 'success');
            } catch (err) {
                setStatus('Opening your email app as a backup.', 'error');
                mailtoFallback(values);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
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

    // --- Portfolio chapter filters ---
    document.querySelectorAll('[data-gallery-filter]').forEach((button) => {
        button.addEventListener('click', () => applyGalleryFilter(button.dataset.galleryFilter));
    });

    applyGalleryFilter(activeGalleryFilter);

});
