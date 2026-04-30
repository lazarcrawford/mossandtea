/* ============================================
   Moss & Tea — Irina Crawford Photography
   Interactions
   ============================================ */

const galleryChapters = {
    witness: {
        text: 'Women as Witness gathers portraits where the subject keeps her interior life intact. The camera becomes a companion to gaze, refusal, adornment, concealment, and self-possession.'
    },
    body: {
        text: 'Body as Landscape follows bodies in water, stone, shadow, and motion. These images treat gesture as language and the body as a place where memory, strength, and vulnerability meet.'
    },
    earth: {
        text: 'Earth as Element widens the field: creatures, museums, water, desert, and darkness. Irina looks at the nonhuman world with the same intimacy she gives a face.'
    },
    trace: {
        text: 'Spaces as Afterimages holds what remains after the figure leaves: beds, thresholds, fruit, cars, and slanted light. The ordinary becomes evidence of a life passing through.'
    }
};

const galleryImages = [
    { file: 'Abby06BW.jpg', category: 'witness', caption: 'Women as Witness — Mask, fruit, and gaze', alt: 'Black and white portrait with face paint beneath fruit branches', layout: 'tall' },
    { file: 'Abby08.jpg', category: 'witness', caption: 'Women as Witness — Figure among oranges', alt: 'Portrait of a woman standing among orange trees', layout: 'wide' },
    { file: 'Braina05.jpg', category: 'witness', caption: 'Women as Witness — Seated in the forest', alt: 'Black and white portrait of a woman seated among fallen leaves', layout: '' },
    { file: 'Braina11BW.jpg', category: 'witness', caption: 'Women as Witness — Crowned in shadow', alt: 'Black and white close portrait of a woman with a floral crown', layout: 'tall' },
    { file: 'G3A5407B.jpg', category: 'witness', caption: 'Women as Witness — Leaf over the eyes', alt: 'Black and white close portrait with a leaf held over the face', layout: 'wide' },
    { file: 'Ganna08.jpg', category: 'witness', caption: 'Women as Witness — Veil and hand', alt: 'Black and white portrait partly hidden by draped fabric', layout: 'tall' },
    { file: 'MG_1382.jpg', category: 'witness', caption: 'Women as Witness — Embrace', alt: 'Black and white close portrait of two women embracing', layout: '' },
    { file: 'Makenna09S.jpg', category: 'witness', caption: 'Women as Witness — Matchlight', alt: 'Low-key portrait of a woman holding a match', layout: 'tall' },
    { file: 'berit21B.jpg', category: 'witness', caption: 'Women as Witness — Skin, grain, breath', alt: 'Black and white close portrait focused on cheek, lips, and freckles', layout: '' },
    { file: 'cenit_12B.jpg', category: 'witness', caption: 'Women as Witness — CENIT, eyes closed', alt: 'Black and white portrait of CENIT with eyes closed and a necklace', layout: 'tall' },
    { file: 'cenit_21B.jpg', category: 'witness', caption: 'Women as Witness — CENIT, guarded light', alt: 'Black and white portrait of CENIT with hands covering her eyes', layout: '' },
    { file: 'cenit_28.jpg', category: 'witness', caption: 'Women as Witness — CENIT, hand and necklace', alt: 'Black and white portrait crop of CENIT leaning forward', layout: 'tall' },
    { file: 'noemie8bw.jpg', category: 'witness', caption: 'Women as Witness — Face in leaves', alt: 'Black and white portrait of a woman framed by leaves', layout: '' },

    { file: 'BB16.jpg', category: 'body', caption: 'Body as Landscape — Rest on concrete', alt: 'Black and white image of a figure lying on the ground', layout: 'wide' },
    { file: 'Braina10.jpg', category: 'body', caption: 'Body as Landscape — Back turned to the river', alt: 'Black and white portrait from behind near a river', layout: 'tall' },
    { file: 'Braina14.jpg', category: 'body', caption: 'Body as Landscape — Green at the waterline', alt: 'Woman in a green dress sitting near blue water', layout: '' },
    { file: 'Braina20.jpg', category: 'body', caption: 'Body as Landscape — Bones and hand', alt: 'Black and white portrait with hand covering face and skeleton print shirt', layout: 'wide' },
    { file: 'G3A1886.jpg', category: 'body', caption: 'Body as Landscape — Arched on sand', alt: 'Black and white figure arching backward on sand', layout: 'tall' },
    { file: 'G3A1901.jpg', category: 'body', caption: 'Body as Landscape — Kneeling in sand', alt: 'Black and white figure kneeling on sand', layout: '' },
    { file: 'G3A5320.jpg', category: 'body', caption: 'Body as Landscape — Under falling water', alt: 'Figure seated beneath a waterfall', layout: 'wide' },
    { file: 'cenit_river01.jpg', category: 'body', caption: 'Body as Landscape — CENIT by the river', alt: 'Portrait of CENIT sitting beside a river', layout: 'tall' },

    { file: 'G3A5499.jpg', category: 'earth', caption: 'Earth as Element — Rain surface', alt: 'Close study of rain and water spray', layout: 'wide' },
    { file: 'IMG_5969.jpg', category: 'earth', caption: 'Earth as Element — Jellyfish, luminous dark', alt: 'Jellyfish glowing against a dark background', layout: 'tall' },
    { file: 'IMG_5982.jpg', category: 'earth', caption: 'Earth as Element — Jellyfish, orange trace', alt: 'Orange jellyfish in dark water', layout: '' },
    { file: 'MG_8849.jpg', category: 'earth', caption: 'Earth as Element — Desert from above', alt: 'Aerial view of desert ridges', layout: 'wide' },
    { file: 'bug05.jpg', category: 'earth', caption: 'Earth as Element — Wing and blue', alt: 'Macro photograph of an insect wing', layout: 'tall' },
    { file: 'bug06B.jpg', category: 'earth', caption: 'Earth as Element — Beetle in black', alt: 'Black and white macro photograph of a beetle', layout: '' },
    { file: 'nhmla02.jpg', category: 'earth', caption: 'Earth as Element — Museum ground', alt: 'Antlers and animal legs in a museum-like natural scene', layout: 'wide' },
    { file: 'nhmla03.jpg', category: 'earth', caption: 'Earth as Element — Forest floor', alt: 'Dark forest floor with moss and small flowers', layout: '' },
    { file: 'nhmla04.jpg', category: 'earth', caption: 'Earth as Element — Fossil trace', alt: 'Dark study of a fossil or bone-like form on the ground', layout: '' },

    { file: 'IMG_6420.jpg', category: 'trace', caption: 'Spaces as Afterimages — Car at water edge', alt: 'A car parked near water in muted light', layout: 'wide' },
    { file: 'Makenna13.jpg', category: 'trace', caption: 'Spaces as Afterimages — Fruit and cloth', alt: 'Still life of fruit and stains on white cloth', layout: '' },
    { file: 'Margo10.jpg', category: 'trace', caption: 'Spaces as Afterimages — Blue threshold', alt: 'Woman seen from behind in a blue corridor', layout: 'tall' },
    { file: 'bed.jpg', category: 'trace', caption: 'Spaces as Afterimages — Unmade bed', alt: 'Dark interior photograph of an unmade bed', layout: 'wide' },
    { file: 'random.jpg', category: 'trace', caption: 'Spaces as Afterimages — Slant of light', alt: 'Interior wall with a narrow slant of window light', layout: '' }
];

function renderArchiveGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    gallery.innerHTML = galleryImages.map((image, index) => {
        const classes = ['gallery__item'];
        if (image.layout) classes.push(`gallery__item--${image.layout}`);

        return `
            <button class="${classes.join(' ')}" type="button" data-category="${image.category}" data-lightbox="${index + 1}" data-src="images/irina/${image.file}" data-caption="${image.caption}">
                <img src="images/irina/${image.file}" alt="${image.alt}" loading="lazy">
                <span class="gallery__overlay">
                    <span>${image.caption}</span>
                </span>
            </button>
        `;
    }).join('');
}

function applyGalleryFilter(filter) {
    const copy = document.getElementById('portfolioChapterCopy');
    const gallery = document.getElementById('gallery');
    const chapter = galleryChapters[filter] || galleryChapters.witness;
    const previous = gallery?.dataset.activeCategory || 'witness';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-gallery-filter]').forEach((button) => {
        const active = button.dataset.galleryFilter === filter;
        button.classList.toggle('portfolio__chapter--active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const reveal = () => {
        if (!gallery) return;
        gallery.dataset.activeCategory = filter;
        gallery.classList.remove(`gallery--${previous}`);
        gallery.classList.add(`gallery--${filter}`);

        const visibleItems = [];
        document.querySelectorAll('#gallery [data-category]').forEach((item) => {
            const visible = item.dataset.category === filter;
            item.hidden = !visible;
            item.classList.remove('gallery__item--enter');
            if (visible) visibleItems.push(item);
        });

        visibleItems.forEach((item, index) => {
            item.style.setProperty('--enter-delay', `${Math.min(index * 55, 520)}ms`);
            requestAnimationFrame(() => item.classList.add('gallery__item--enter'));
        });

        gallery.classList.remove('gallery--switching');
    };

    if (gallery && !reduceMotion && previous !== filter) {
        gallery.classList.add('gallery--switching');
        window.setTimeout(reveal, 180);
    } else {
        reveal();
    }

    if (copy) copy.textContent = chapter.text;
}

renderArchiveGallery();
applyGalleryFilter('witness');

function animatePortfolioChapters() {
    const portfolio = document.getElementById('portfolio');
    const chapters = document.getElementById('portfolioChapters');
    const gallery = document.getElementById('gallery');
    if (!portfolio || !chapters || !gallery) return;

    const rect = portfolio.getBoundingClientRect();
    const galleryRect = gallery.getBoundingClientRect();
    const active = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.12;
    const floating = active && galleryRect.top < window.innerHeight * 0.18 && galleryRect.bottom > window.innerHeight * 0.42;
    const floatProgress = Math.min(1, Math.max(0, (window.innerHeight * 0.18 - galleryRect.top) / Math.max(1, galleryRect.height * 0.55)));
    const clustered = floating && floatProgress > 0.42;
    const driftX = floating ? Math.sin(floatProgress * Math.PI * 2.4) * 14 : 0;
    const driftY = floating ? Math.cos(floatProgress * Math.PI * 1.8) * 10 : 0;
    const rotate = floating ? Math.sin(floatProgress * Math.PI * 1.5) * 0.8 : 0;
    const top = 82 + floatProgress * 92;

    chapters.classList.toggle('portfolio__chapters--floating', floating);
    chapters.classList.toggle('portfolio__chapters--clustered', clustered);
    chapters.style.setProperty('--chapter-x', `${driftX.toFixed(2)}px`);
    chapters.style.setProperty('--chapter-y', `${driftY.toFixed(2)}px`);
    chapters.style.setProperty('--chapter-rotate', `${rotate.toFixed(2)}deg`);
    chapters.style.setProperty('--chapter-top', `${top.toFixed(2)}px`);
}

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

    applyGalleryFilter('witness');
    animatePortfolioChapters();
    window.addEventListener('scroll', animatePortfolioChapters, { passive: true });
    window.addEventListener('resize', animatePortfolioChapters);

});
