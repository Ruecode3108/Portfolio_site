lucide.createIcons();

const book = document.querySelector('.book');
const leaves = [...document.querySelectorAll('.leaf')];
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const status = document.getElementById('status');
const wide = window.matchMedia('(min-width: 801px)');

// spread = how many leaves are flipped.
// 0 = closed, front cover only. 1 to leaves.length - 1 = open, two pages. leaves.length = closed, back cover only.
let spread = 0;

function go(n) {
    spread = Math.max(0, Math.min(leaves.length, n));

    book.dataset.state = spread === 0 ? 'start' : spread === leaves.length ? 'end' : 'open';

    leaves.forEach(function (leaf, i) {
        const flipped = i < spread;
        leaf.classList.toggle('flipped', flipped);
        leaf.style.zIndex = flipped ? i + 1 : leaves.length - i;

        // Only the visible faces are reachable by keyboard
        leaf.querySelector('.front').inert = wide.matches && i !== spread;
        leaf.querySelector('.back').inert = wide.matches && i !== spread - 1;
    });

    prevBtn.disabled = spread === 0;
    nextBtn.disabled = spread === leaves.length;
    status.textContent = spread === 0 ? 'Front cover'
        : spread === leaves.length ? 'Back cover'
            : 'Spread ' + spread + ' of ' + (leaves.length - 1);
}

// Click the right page to go forward, the left page to go back
book.addEventListener('click', function (e) {
    if (!wide.matches) return;

    const jump = e.target.closest('[data-spread]');
    if (jump) {
        e.preventDefault();
        go(Number(jump.dataset.spread));
        return;
    }

    if (e.target.closest('a, button')) return;

    const face = e.target.closest('.face');
    if (!face) return;
    go(face.classList.contains('front') ? spread + 1 : spread - 1);
});

prevBtn.addEventListener('click', function () { go(spread - 1); });
nextBtn.addEventListener('click', function () { go(spread + 1); });

document.addEventListener('keydown', function (e) {
    if (!wide.matches) return;
    if (e.key === 'ArrowRight') go(spread + 1);
    if (e.key === 'ArrowLeft') go(spread - 1);
});

wide.addEventListener('change', function () { go(spread); });

// If a real picture exists in /images, hide the placeholder icon
document.querySelectorAll('.photo[data-src]').forEach(function (photo) {
    const img = new Image();
    img.onload = function () { photo.classList.add('has-img'); };
    img.src = photo.dataset.src;
});

go(0);