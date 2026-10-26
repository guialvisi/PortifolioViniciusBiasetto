const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle?.addEventListener('click', () => {
	const isOpen = mainNav.classList.toggle('open');
	menuToggle.setAttribute('aria-expanded', String(isOpen));
	menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

document.querySelectorAll('.main-nav a').forEach((link) => {
	link.addEventListener('click', () => {
		mainNav.classList.remove('open');
		menuToggle?.setAttribute('aria-expanded', 'false');
		menuToggle?.setAttribute('aria-label', 'Abrir menu');
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

// Fine-pointer depth uses one animation frame per paint and resets on exit.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const portrait = document.querySelector('.hero-visual .image-frame');
let portraitFrame;
portrait?.addEventListener('pointermove', (event) => {
	if (motionPreference.matches || !finePointer.matches) return;
	cancelAnimationFrame(portraitFrame);
	portraitFrame = requestAnimationFrame(() => {
		const bounds = portrait.getBoundingClientRect();
		portrait.style.setProperty('--tilt-x', `${(0.5 - (event.clientY - bounds.top) / bounds.height) * 12}deg`);
		portrait.style.setProperty('--tilt-y', `${((event.clientX - bounds.left) / bounds.width - 0.5) * 12}deg`);
	});
});
portrait?.addEventListener('pointerleave', () => {
	cancelAnimationFrame(portraitFrame);
	portrait.style.removeProperty('--tilt-x');
	portrait.style.removeProperty('--tilt-y');
});

function closeMenu() {
 mainNav.classList.remove('open');
 menuToggle.setAttribute('aria-expanded', 'false');
 menuToggle.setAttribute('aria-label', 'Abrir menu');
}
document.addEventListener('keydown', (event) => {
 if (event.key === 'Escape' && mainNav.classList.contains('open')) {
  closeMenu();
  menuToggle.focus();
 }
});
document.addEventListener('click', (event) => {
 if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 1001px)').addEventListener('change', closeMenu);
