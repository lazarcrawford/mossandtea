/* ============================================
   Moss & Tea — Irina Crawford Photography
   Interactions
   ============================================ */

const galleryChapters = {
    witness: {
        text: 'Woman as Sacred gathers portraits where the subject keeps her interior life intact. The camera becomes a companion to gaze, refusal, adornment, concealment, and self-possession.'
    },
    body: {
        text: 'Body Landscapes follows bodies in water, stone, shadow, and motion. These images treat gesture as language and the body as a place where memory, strength, and vulnerability meet.'
    },
    performance: {
        text: 'Mythology recovers Irina’s Beauty CULTure images from Annenberg: masks, veils, painted faces, theatrical doubles, and constructed selves that turn beauty into character and ritual.'
    },
    editorial: {
        text: 'Editorial as Ritual gathers fashion work where garment, landscape, and model become a ceremony. The image is not selling a look so much as staging a transformation.'
    },
    earth: {
        text: 'Faces of Nature widens the field: water, desert, insects, and luminous dark. Irina looks at the nonhuman world with the same intimacy she gives a face.'
    },
    trace: {
        text: 'Afterimages gathers what remains after presence has passed through: beds, thresholds, fruit, cars, museum ground, forest floor, fossil traces, and slanted light. These are relics, not empty spaces.'
    }
};

const galleryImages = [
    { file: 'Abby06BW.jpg', category: 'witness', caption: 'Woman as Sacred — Mask, fruit, and gaze', alt: 'Black and white portrait with face paint beneath fruit branches', layout: 'tall' },
    { file: 'Abby08.jpg', category: 'witness', caption: 'Woman as Sacred — Figure among oranges', alt: 'Portrait of a woman standing among orange trees', layout: 'wide' },
    { file: 'Braina05.jpg', category: 'witness', caption: 'Woman as Sacred — Seated in the forest', alt: 'Black and white portrait of a woman seated among fallen leaves', layout: '' },
    { file: 'Braina11BW.jpg', category: 'witness', caption: 'Woman as Sacred — Crowned in shadow', alt: 'Black and white close portrait of a woman with a floral crown', layout: 'tall' },
    { file: 'G3A5407B.jpg', category: 'witness', caption: 'Woman as Sacred — Leaf over the eyes', alt: 'Black and white close portrait with a leaf held over the face', layout: 'wide' },
    { file: 'Ganna08.jpg', category: 'witness', caption: 'Woman as Sacred — Veil and hand', alt: 'Black and white portrait partly hidden by draped fabric', layout: 'tall' },
    { file: 'MG_1382.jpg', category: 'witness', caption: 'Woman as Sacred — Embrace', alt: 'Black and white close portrait of two women embracing', layout: '' },
    { file: 'Makenna09S.jpg', category: 'witness', caption: 'Woman as Sacred — Matchlight', alt: 'Low-key portrait of a woman holding a match', layout: 'tall' },
    { file: 'berit21B.jpg', category: 'witness', caption: 'Woman as Sacred — Skin, grain, breath', alt: 'Black and white close portrait focused on cheek, lips, and freckles', layout: '' },
    { file: 'cenit_12B.jpg', category: 'witness', caption: 'Woman as Sacred — CENIT, eyes closed', alt: 'Black and white portrait of CENIT with eyes closed and a necklace', layout: 'tall' },
    { file: 'cenit_21B.jpg', category: 'witness', caption: 'Woman as Sacred — CENIT, guarded light', alt: 'Black and white portrait of CENIT with hands covering her eyes', layout: '' },
    { file: 'cenit_28.jpg', category: 'witness', caption: 'Woman as Sacred — CENIT, hand and necklace', alt: 'Black and white portrait crop of CENIT leaning forward', layout: 'tall' },
    { file: 'noemie8bw.jpg', category: 'witness', caption: 'Woman as Sacred — Face in leaves', alt: 'Black and white portrait of a woman framed by leaves', layout: '' },

    { file: 'BB16.jpg', category: 'body', caption: 'Body Landscapes — Rest on concrete', alt: 'Black and white image of a figure lying on the ground', layout: 'wide' },
    { file: 'Braina10.jpg', category: 'body', caption: 'Body Landscapes — Back turned to the river', alt: 'Black and white portrait from behind near a river', layout: 'tall' },
    { file: 'Braina14.jpg', category: 'body', caption: 'Body Landscapes — Green at the waterline', alt: 'Woman in a green dress sitting near blue water', layout: '' },
    { file: 'Braina20.jpg', category: 'body', caption: 'Body Landscapes — Bones and hand', alt: 'Black and white portrait with hand covering face and skeleton print shirt', layout: 'wide' },
    { file: 'G3A1886.jpg', category: 'body', caption: 'Body Landscapes — Arched on sand', alt: 'Black and white figure arching backward on sand', layout: 'tall' },
    { file: 'G3A1901.jpg', category: 'body', caption: 'Body Landscapes — Kneeling in sand', alt: 'Black and white figure kneeling on sand', layout: '' },
    { file: 'G3A5320.jpg', category: 'body', caption: 'Body Landscapes — Under falling water', alt: 'Figure seated beneath a waterfall', layout: 'wide' },
    { file: 'cenit_river01.jpg', category: 'body', caption: 'Body Landscapes — CENIT by the river', alt: 'Portrait of CENIT sitting beside a river', layout: 'tall' },

    { file: 'harvest/annenberg-beauty-culture/annenberg_01.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, veil study I', alt: 'Archived Annenberg Beauty CULTure image by Irina Garaiacu with a face obscured by pale veil', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_02.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, profile in light', alt: 'Archived Annenberg Beauty CULTure profile portrait by Irina Garaiacu', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_03.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, veiled profile', alt: 'Archived Annenberg Beauty CULTure veiled portrait by Irina Garaiacu', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_04.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, low light gaze', alt: 'Archived Annenberg Beauty CULTure portrait by Irina Garaiacu in low light', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_05.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, blurred double', alt: 'Archived Annenberg Beauty CULTure blurred black and white portrait by Irina Garaiacu', layout: '' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_06.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, painted face', alt: 'Archived Annenberg Beauty CULTure painted face by Irina Garaiacu', layout: '' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_07.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, doll figure', alt: 'Archived Annenberg Beauty CULTure doll-like face by Irina Garaiacu', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_08.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, fracture mask', alt: 'Archived Annenberg Beauty CULTure mask portrait by Irina Garaiacu', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_09.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, fan portrait I', alt: 'Archived Annenberg Beauty CULTure fan portrait by Irina Garaiacu', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_10.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, painted blur', alt: 'Archived Annenberg Beauty CULTure painterly portrait by Irina Garaiacu', layout: 'wide' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_11.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, fan portrait II', alt: 'Archived Annenberg Beauty CULTure fan portrait by Irina Garaiacu', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_12.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, reclining figure', alt: 'Archived Annenberg Beauty CULTure reclining figure by Irina Garaiacu', layout: 'wide' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_13.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, maker and puppet', alt: 'Archived Annenberg Beauty CULTure puppet image by Irina Garaiacu', layout: 'wide' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_14.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, paper body', alt: 'Archived Annenberg Beauty CULTure paper costume image by Irina Garaiacu', layout: 'wide' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_15.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, stitched face', alt: 'Archived Annenberg Beauty CULTure stitched-face character by Irina Garaiacu', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_16.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, masked wreath', alt: 'Archived Annenberg Beauty CULTure masked figure in a wreath by Irina Garaiacu', layout: 'tall' },
    { file: 'harvest/annenberg-beauty-culture/annenberg_17.jpg', category: 'performance', caption: 'Mythology — Beauty CULTure, skin of light', alt: 'Archived Annenberg Beauty CULTure close abstract texture by Irina Garaiacu', layout: 'wide' },

    { file: 'harvest/no-substance-alexis/alexis_01.jpg', category: 'editorial', caption: 'Editorial as Ritual — Alexis, garment at dusk I', alt: 'No Substance editorial photograph by Irina Garaiacu of Alexis holding a garment at dusk', layout: 'tall' },
    { file: 'harvest/no-substance-alexis/alexis_02.jpg', category: 'editorial', caption: 'Editorial as Ritual — Alexis, field at sunset', alt: 'No Substance editorial photograph by Irina Garaiacu of Alexis standing in a field at sunset', layout: 'tall' },
    { file: 'harvest/no-substance-alexis/alexis_03.jpg', category: 'editorial', caption: 'Editorial as Ritual — Alexis, pressed leaf', alt: 'No Substance editorial still life photograph by Irina Garaiacu of a leaf on dark fabric', layout: '' },
    { file: 'harvest/no-substance-alexis/alexis_04.jpg', category: 'editorial', caption: 'Editorial as Ritual — Festival dress apparition', alt: 'No Substance editorial photograph by Irina Garaiacu of a pale dress hanging outdoors', layout: 'tall' },
    { file: 'harvest/no-substance-alexis/alexis_05.jpg', category: 'editorial', caption: 'Editorial as Ritual — Ground as textile', alt: 'No Substance editorial ground texture photograph by Irina Garaiacu', layout: '' },
    { file: 'harvest/no-substance-alexis/alexis_06.jpg', category: 'editorial', caption: 'Editorial as Ritual — Alexis, walking through dusk', alt: 'No Substance editorial photograph by Irina Garaiacu of Alexis walking outdoors', layout: 'tall' },
    { file: 'harvest/no-substance-alexis/alexis_07.jpg', category: 'editorial', caption: 'Editorial as Ritual — Alexis, garment at dusk II', alt: 'No Substance editorial close photograph by Irina Garaiacu of Alexis with garment and sunset light', layout: 'tall' },

    { file: 'G3A5499.jpg', category: 'earth', caption: 'Faces of Nature — Rain surface', alt: 'Close study of rain and water spray', layout: 'wide' },
    { file: 'IMG_5969.jpg', category: 'earth', caption: 'Faces of Nature — Jellyfish, luminous dark', alt: 'Jellyfish glowing against a dark background', layout: 'tall' },
    { file: 'IMG_5982.jpg', category: 'earth', caption: 'Faces of Nature — Jellyfish, orange trace', alt: 'Orange jellyfish in dark water', layout: '' },
    { file: 'MG_8849.jpg', category: 'earth', caption: 'Faces of Nature — Desert from above', alt: 'Aerial view of desert ridges', layout: 'wide' },
    { file: 'bug05.jpg', category: 'earth', caption: 'Faces of Nature — Wing and blue', alt: 'Macro photograph of an insect wing', layout: 'tall' },
    { file: 'bug06B.jpg', category: 'earth', caption: 'Faces of Nature — Beetle in black', alt: 'Black and white macro photograph of a beetle', layout: '' },
    { file: 'nhmla02.jpg', category: 'trace', caption: 'Afterimages — Museum ground', alt: 'Antlers and animal legs in a museum-like natural scene', layout: 'wide' },
    { file: 'nhmla03.jpg', category: 'trace', caption: 'Afterimages — Forest floor', alt: 'Dark forest floor with moss and small flowers', layout: '' },
    { file: 'nhmla04.jpg', category: 'trace', caption: 'Afterimages — Fossil trace', alt: 'Dark study of a fossil or bone-like form on the ground', layout: '' },

    { file: 'IMG_6420.jpg', category: 'trace', caption: 'Afterimages — Car at water edge', alt: 'A car parked near water in muted light', layout: 'wide' },
    { file: 'Makenna13.jpg', category: 'trace', caption: 'Afterimages — Fruit and cloth', alt: 'Still life of fruit and stains on white cloth', layout: '' },
    { file: 'Margo10.jpg', category: 'trace', caption: 'Afterimages — Blue threshold', alt: 'Woman seen from behind in a blue corridor', layout: 'tall' },
    { file: 'bed.jpg', category: 'trace', caption: 'Afterimages — Unmade bed', alt: 'Dark interior photograph of an unmade bed', layout: 'wide' },
    { file: 'random.jpg', category: 'trace', caption: 'Afterimages — Slant of light', alt: 'Interior wall with a narrow slant of window light', layout: '' }
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
