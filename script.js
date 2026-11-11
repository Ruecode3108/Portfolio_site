lucide.createIcons();

const book = document.querySelector('.book');
const leaves = [...document.querySelectorAll('.leaf')];
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const status = document.getElementById('status');
const wide = window.matchMedia('(min-width: 801px)');
const faces = [...document.querySelectorAll('.face')];

// spread = how many leaves are flipped.
// 0 = closed, front cover only. 1 to leaves.length - 1 = open, two pages. leaves.length = closed, back cover only.
let spread = 0;
let mobilePage = 0;
let suppressTap = false;

function isWide() {
    return wide.matches;
}

function go(n) {
    spread = Math.max(0, Math.min(leaves.length, n));

    book.dataset.state = spread === 0 ? 'start' : spread === leaves.length ? 'end' : 'open';

    leaves.forEach(function (leaf, i) {
        const flipped = i < spread;
        leaf.classList.toggle('flipped', flipped);
        leaf.style.zIndex = flipped ? i + 1 : leaves.length - i;

        // Only the visible faces are reachable by keyboard
        leaf.querySelector('.front').inert = isWide() && i !== spread;
        leaf.querySelector('.back').inert = isWide() && i !== spread - 1;
    });

    if (isWide()) {
        prevBtn.disabled = spread === 0;
        nextBtn.disabled = spread === leaves.length;
        status.textContent = spread === 0 ? 'Front cover'
            : spread === leaves.length ? 'Back cover'
                : 'Spread ' + spread + ' of ' + (leaves.length - 1);
    }
}

function goMobile(page) {
    mobilePage = Math.max(0, Math.min(faces.length - 1, page));
    faces.forEach(function (face, i) {
        face.classList.toggle('mobile-active', i === mobilePage);
        face.inert = i !== mobilePage;
    });

    prevBtn.disabled = mobilePage === 0;
    nextBtn.disabled = mobilePage === faces.length - 1;
    status.textContent = 'Page ' + (mobilePage + 1) + ' of ' + faces.length;
}

// Click the right page to go forward, the left page to go back
book.addEventListener('click', function (e) {
    if (suppressTap) {
        suppressTap = false;
        return;
    }

    const jump = e.target.closest('[data-spread]');
    if (jump) {
        e.preventDefault();
        if (isWide()) {
            go(Number(jump.dataset.spread));
        } else {
            const target = document.querySelector(jump.getAttribute('href'));
            if (target) goMobile(faces.indexOf(target));
        }
        return;
    }

    if (e.target.closest('a, button, input, textarea, select, form, label, .polaroid.phone, .screen-deck')) return;

    const face = e.target.closest('.face');
    if (!face) return;
    if (isWide()) {
        go(face.classList.contains('front') ? spread + 1 : spread - 1);
    } else if (e.clientX < face.getBoundingClientRect().left + face.offsetWidth / 2) {
        goMobile(mobilePage - 1);
    } else {
        goMobile(mobilePage + 1);
    }
});

prevBtn.addEventListener('click', function () {
    if (isWide()) go(spread - 1);
    else goMobile(mobilePage - 1);
});
nextBtn.addEventListener('click', function () {
    if (isWide()) go(spread + 1);
    else goMobile(mobilePage + 1);
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') {
        if (isWide()) go(spread + 1);
        else goMobile(mobilePage + 1);
    }
    if (e.key === 'ArrowLeft') {
        if (isWide()) go(spread - 1);
        else goMobile(mobilePage - 1);
    }
});

let touchStartX = 0;
book.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

book.addEventListener('touchend', function (e) {
    if (isWide()) return;
    const distance = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45) return;
    suppressTap = true;
    window.setTimeout(function () { suppressTap = false; }, 500);
    goMobile(mobilePage + (distance < 0 ? 1 : -1));
}, { passive: true });

wide.addEventListener('change', function () {
    if (isWide()) {
        faces.forEach(function (face) { face.classList.remove('mobile-active'); });
        go(spread);
    } else {
        goMobile(mobilePage);
    }
});

// If a real picture exists in /images, hide the placeholder icon
document.querySelectorAll('.photo[data-src]').forEach(function (photo) {
    const img = new Image();
    img.onload = function () { photo.classList.add('has-img'); };
    img.src = photo.dataset.src;
});

// Screen data mapping for IGNISGUARD showcase
const screenData = {
    'ig-home': {
        src: 'assets/ignisguard-home.png',
        caption: 'live telemetry & controls',
        c1: '#e58863',
        c2: '#2c1810'
    },
    'ig-alerts': {
        src: 'assets/ignisguard-alerts.jpg',
        caption: 'incident dispatch & warnings log',
        c1: '#c45a2c',
        c2: '#5d3a24'
    },
    'ig-edu': {
        src: 'assets/ignisguard-education.jpg',
        caption: 'safety education hub & quiz',
        c1: '#a9b98f',
        c2: '#5d3a24'
    },
    'ig-settings': {
        src: 'assets/ignisguard-settings.jpg',
        caption: 'sensor sensitivity & siren overrides',
        c1: '#b9cbd6',
        c2: '#2c1810'
    }
};

// Screen switcher handler
document.querySelectorAll('.screen-pill').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const target = btn.dataset.screenTarget;
        const data = screenData[target];
        if (!data) return;

        const switcher = btn.closest('.screen-switcher');
        if (switcher) {
            switcher.querySelectorAll('.screen-pill').forEach(function (p) {
                p.classList.remove('active');
            });
            btn.classList.add('active');
        }

        const deck = btn.closest('.screen-deck');
        if (deck) {
            const photo = deck.querySelector('.photo');
            const caption = deck.querySelector('.caption');
            if (photo) {
                photo.dataset.src = data.src;
                photo.style.setProperty('--img', 'url(' + data.src + ')');
                photo.style.setProperty('--c1', data.c1);
                photo.style.setProperty('--c2', data.c2);
            }
            if (caption) {
                caption.textContent = data.caption;
            }
        }
    });
});

// Image Lightbox Modal logic
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const modalCaption = document.getElementById('modal-caption');
const modalClose = document.getElementById('modal-close');

function openModal(src, caption) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    if (modalCaption) modalCaption.textContent = caption || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

if (modalClose) {
    modalClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeModal();
    });
}

if (modal) {
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.classList.contains('modal-dialog')) {
            closeModal();
        }
    });
}

document.querySelectorAll('.polaroid.phone').forEach(function (polaroid) {
    polaroid.addEventListener('click', function (e) {
        e.stopPropagation();
        const photo = polaroid.querySelector('.photo');
        const caption = polaroid.querySelector('.caption');
        if (photo && photo.dataset.src) {
            openModal(photo.dataset.src, caption ? caption.textContent : '');
        }
    });
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
});

// Direct contact form submission via FormSubmit
const contactForm = document.getElementById('contact-form');
const contactSubmit = document.getElementById('contact-submit');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const messageInput = document.getElementById('contact-message');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !message) return;

        const btnText = contactSubmit ? contactSubmit.querySelector('span') : null;
        if (contactSubmit) contactSubmit.disabled = true;
        if (btnText) btnText.textContent = 'Sending...';
        if (formStatus) {
            formStatus.className = 'form-status';
            formStatus.textContent = 'Sending message...';
        }

        fetch('https://formsubmit.co/ajax/ruvarashesithole3108@outlook.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                _subject: 'Portfolio Contact from ' + name,
                _template: 'box'
            })
        })
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network error');
        })
        .then(function () {
            if (formStatus) {
                formStatus.className = 'form-status success';
                formStatus.textContent = '✓ Message sent! I will reply soon.';
            }
            contactForm.reset();
            if (contactSubmit) contactSubmit.disabled = false;
            if (btnText) btnText.textContent = 'Send Email';
        })
        .catch(function () {
            if (formStatus) {
                formStatus.className = 'form-status error';
                formStatus.innerHTML = 'Could not send automatically. <a href="mailto:ruvarashesithole3108@outlook.com?subject=Portfolio%20Inquiry%20from%20' + encodeURIComponent(name) + '&body=' + encodeURIComponent(message) + '" style="text-decoration:underline; color:inherit;">Click here to open email app</a>';
            }
            if (contactSubmit) contactSubmit.disabled = false;
            if (btnText) btnText.textContent = 'Send Email';
        });
    });
}

go(0);
if (!isWide()) goMobile(0);