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
		if (element.matches('.competency-card, .tools-grid > li, .project-item')) {
			element.style.setProperty('--reveal-delay', `${Array.from(element.parentElement.children).indexOf(element) * 90}ms`);
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
window.matchMedia('(max-width: 1000px)').addEventListener('change', closeMenu);

// Sulcos de plantio projetados do horizonte até o primeiro plano.
const canvas = document.querySelector('#bg-canvas');
const context = canvas?.getContext('2d');

if (context) {
	const palette = getComputedStyle(document.documentElement);
	const ribbonGreen = palette.getPropertyValue('--ink-soft').trim();
	const ribbonAccent = palette.getPropertyValue('--terracotta').trim();
	let resizeFrame;

	function drawFurrows() {
		resizeFrame = undefined;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (motionPreference.matches || !width || !height) return;

		canvas.width = width;
		canvas.height = height;
		const horizonX = width * .64;
		const horizonY = height * .18;
		const bend = width * .15;
		const count = width < 700 ? 11 : 17;
		const shade = context.createLinearGradient(0, horizonY, 0, height);
		shade.addColorStop(0, 'transparent');
		shade.addColorStop(1, ribbonGreen);
		const light = context.createLinearGradient(0, horizonY, 0, height);
		light.addColorStop(0, 'transparent');
		light.addColorStop(1, ribbonAccent);

		for (let index = 0; index < count; index++) {
			const across = (index / (count - 1) - .5) * width * 2;
			const startX = horizonX + across * .045;
			const middleX = horizonX + across * .22 - bend * .2;
			const nearX = horizonX + across * .61 + bend;
			const endX = horizonX + across + bend;
			context.beginPath();
			context.moveTo(startX, horizonY);
			context.bezierCurveTo(middleX, height * .45, nearX, height * .75, endX, height);
			context.lineTo(endX + width * .017, height);
			context.bezierCurveTo(nearX + width * .013, height * .75, middleX + width * .005, height * .45, startX, horizonY);
			context.fillStyle = index % 4 === 0 ? light : shade;
			context.globalAlpha = index % 4 === 0 ? .26 : .21;
			context.fill();
		}
	}

	function scheduleFurrows() {
		if (resizeFrame === undefined) resizeFrame = requestAnimationFrame(drawFurrows);
	}

	window.addEventListener('resize', scheduleFurrows);
	motionPreference.addEventListener('change', scheduleFurrows);
	scheduleFurrows();
}

// Inclinação das miniaturas com mouse ou caneta.
document.querySelectorAll('.project-item').forEach((project) => {
	const thumbnail = project.querySelector('.project-thumb');
	if (!thumbnail) return;

	function resetTilt() {
		thumbnail.style.removeProperty('--project-tilt-x');
		thumbnail.style.removeProperty('--project-tilt-y');
	}

	project.addEventListener('pointermove', (event) => {
		if (motionPreference.matches || !finePointer.matches || event.pointerType === 'touch') return;

		const bounds = project.getBoundingClientRect();
		const x = (event.clientX - bounds.left) / bounds.width - .5;
		const y = (event.clientY - bounds.top) / bounds.height - .5;
		thumbnail.style.setProperty('--project-tilt-x', `${-y * 12}deg`);
		thumbnail.style.setProperty('--project-tilt-y', `${x * 12}deg`);
	});
	project.addEventListener('pointerleave', resetTilt);
	project.addEventListener('pointercancel', resetTilt);
	motionPreference.addEventListener('change', resetTilt);
	finePointer.addEventListener('change', resetTilt);
});

// Projeta as curvas em perspectiva enquanto a câmera avança em direção à marca.
function drawIntroRibbons(canvas, { width, height }) {
	const context = canvas.getContext('2d');
	if (!context) return;

	const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	context.setTransform(dpr, 0, 0, dpr, 0, 0);
	context.lineCap = 'round';

	const radius = Math.max(width * .46, height * .34);
	const focalLength = radius * 2;
	const count = width < 600 ? 12 : 18;
	const strands = Array.from({ length: count }, (_, index) => {
		const fraction = index / (count - 1);
		const color = index % 5 === 0 ? '217, 111, 76' : '201, 218, 115';
		const highlight = context.createLinearGradient(0, height, width, 0);
		highlight.addColorStop(0, `rgba(${color}, .08)`);
		highlight.addColorStop(.48 + fraction * .18, `rgba(${color}, .8)`);
		highlight.addColorStop(1, `rgba(${color}, .12)`);
		return { fraction, highlight };
	});

	const camera = .35;
	for (const { fraction, highlight } of strands) {
		context.beginPath();
		for (let point = 0; point <= 64; point++) {
			const along = point / 64;
			const angle = along * 4 - 2 + fraction * 1.55 - camera * 1.2;
			const distance = radius * (1.05 + fraction * .55 + along * .32);
			const depth = Math.cos(angle) * distance * .65 + radius * (fraction - camera);
			const perspective = focalLength / Math.max(focalLength + depth, focalLength * .42);
			const x = Math.sin(angle) * distance;
			const y = (along - .5) * radius * 1.65 + Math.cos(angle) * distance * .28;
			const screenX = width / 2 + (x + y * .48) * perspective;
			const screenY = height * .54 + (y - x * .32) * perspective;
			if (point === 0) context.moveTo(screenX, screenY);
			else context.lineTo(screenX, screenY);
		}

		context.lineWidth = .7 + (1 - fraction) * (1 + camera);
		context.strokeStyle = highlight;
		context.stroke();
	}

}

// A abertura encolhe até o logotipo do cabeçalho.
function playIntro() {
	const layer = document.querySelector('#intro-layer');
	const squircle = document.querySelector('#intro-squircle');
	const ribbons = document.querySelector('#intro-ribbons');
	const logo = document.querySelector('#intro-logo');
	const target = document.querySelector('.site-header .brand-logo');
	if (!layer || !squircle || !logo || !target || !squircle.animate || motionPreference.matches) return;

	const destination = target.getBoundingClientRect();
	if (destination.top < 0 || destination.bottom > window.innerHeight) return;

	const hero = document.querySelector('.hero');
	hero?.classList.add('cinematic-intro');
	const timing = { delay: 760, duration: 850, easing: 'cubic-bezier(.76, 0, .24, 1)', fill: 'forwards' };
	layer.style.setProperty('--intro-hold', `${timing.delay}ms`);
	layer.style.setProperty('--intro-duration', `${timing.delay + timing.duration}ms`);
	hero?.style.setProperty('--intro-hold', `${timing.delay}ms`);
	layer.hidden = false;
	const viewport = layer.getBoundingClientRect();
	if (ribbons) drawIntroRibbons(ribbons, viewport);
	const x = destination.left + destination.width / 2 - viewport.width / 2;
	const y = destination.top + destination.height / 2 - viewport.height / 2;
	const panelAnimation = squircle.animate([
		{ transform: 'translate3d(0, 0, 0) scale(1)' },
		{ transform: `translate3d(${x}px, ${y}px, 0) scale(${destination.width / logo.offsetWidth})` }
	], timing);
	const logoEntrance = logo.animate([
		{ opacity: 0, transform: 'perspective(600px) rotateY(-160deg) scale(.72)' },
		{ opacity: 1, transform: 'perspective(600px) rotateY(0deg) scale(1)' }
	], { duration: timing.delay, easing: 'cubic-bezier(.2, .7, .25, 1)', fill: 'backwards' });
	const fade = layer.animate([{ opacity: 1 }, { opacity: 0 }], {
		delay: timing.delay + timing.duration, duration: 300, fill: 'forwards'
	});

	function closeIntro() {
		layer.hidden = true;
		panelAnimation.cancel();
		logoEntrance.cancel();
		fade.cancel();
		motionPreference.removeEventListener('change', closeIntro);
		window.removeEventListener('resize', closeIntro);
	}

	fade.addEventListener('finish', closeIntro, { once: true });
	motionPreference.addEventListener('change', closeIntro);
	window.addEventListener('resize', closeIntro);
}

playIntro();
