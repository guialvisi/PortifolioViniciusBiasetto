const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle?.addEventListener('click', () => {
	const isOpen = mainNav.classList.toggle('open');
	menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
	link.addEventListener('click', () => {
		mainNav.classList.remove('open');
		menuToggle?.setAttribute('aria-expanded', 'false');
	});
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets = document.querySelectorAll('.reveal, .section-label, .display-copy, .intro-details, .section-heading h2, .competency-card, .projects-head h2, .projects-head > p, .project-item, .contact-title, .contact-section > p, .contact-links');

// Content stays readable when JavaScript or IntersectionObserver is unavailable.
if ('IntersectionObserver' in window && !motionPreference.matches) {
	const revealObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('visible');
				revealObserver.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12 });
	revealTargets.forEach((element) => {
		element.classList.add('motion-reveal');
		if (element.matches('.competency-card, .project-item')) {
			element.style.setProperty('--reveal-delay', `${Array.from(element.parentElement.children).indexOf(element) * 120}ms`);
		}
		revealObserver.observe(element);
	});
}

const progressBar = document.querySelector('.scroll-progress');
let scrollScheduled = false;
function updateProgress() {
	const scrollable = document.documentElement.scrollHeight - window.innerHeight;
	progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
	scrollScheduled = false;
}
window.addEventListener('scroll', () => {
	if (!scrollScheduled) {
		scrollScheduled = true;
		requestAnimationFrame(updateProgress);
	}
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

document.querySelector('#current-year').textContent = new Date().getFullYear();
