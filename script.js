// ─────────────────────────────────────────
//  Mobile Navigation Toggle
// ─────────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active'); // animates hamburger → X
});

// Close menu when a nav link is clicked (good UX on mobile)
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
    });
});


// ─────────────────────────────────────────
//  Highlight active nav link on scroll
// ─────────────────────────────────────────
const sections = document.querySelectorAll('section[id], nav[id], footer[id]');
const allNavLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                allNavLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    },
    { threshold: 0.4 }
);

sections.forEach(section => observer.observe(section));
