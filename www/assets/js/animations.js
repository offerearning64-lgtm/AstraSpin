/* ==========================================================================
   AstraSpin - Animation Controller
   File: assets/js/animations.js
   Centralized animation logic. No duplicated animation code.
   ========================================================================== */

const Animations = (() => {
    let _scrollObserver = null;

    /**
     * Initialize the scroll-based entrance animation observer.
     */
    function initScrollObserver() {
        if (_scrollObserver) _scrollObserver.disconnect();

        _scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    _scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });
    }

    /**
     * Trigger scroll animations on all un-animated elements.
     */
    function triggerScrollAnimations() {
        if (!_scrollObserver) initScrollObserver();
        const els = document.querySelectorAll('.anim-in:not(.visible)');
        els.forEach(el => _scrollObserver.observe(el));
    }

    /**
     * Add entrance animation class to an element.
     * @param {HTMLElement} el
     */
    function addEntrance(el) {
        if (!el) return;
        el.classList.add('anim-in');
        requestAnimationFrame(() => {
            el.classList.add('visible');
        });
    }

    /**
     * Scale-down press effect (touch feedback).
     * @param {HTMLElement} el
     * @param {number} scale - Scale factor (default 0.96)
     * @param {number} duration - Duration in ms
     */
    function pressEffect(el, scale = 0.96, duration = 150) {
        if (!el) return;
        el.style.transform = `scale(${scale})`;
        el.style.transition = `transform ${duration}ms ease`;
        setTimeout(() => {
            el.style.transform = '';
        }, duration);
    }

    /**
     * Animate a counter from one value to another.
     * @param {HTMLElement} el
     * @param {number} from
     * @param {number} to
     * @param {number} duration
     */
    function animateCounter(el, from, to, duration = 500) {
        if (!el) return;
        const start = performance.now();
        const diff = to - from;

        function step(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            el.textContent = Math.round(from + diff * eased);
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    /* Public API */
    return Object.freeze({
        initScrollObserver,
        triggerScrollAnimations,
        addEntrance,
        pressEffect,
        animateCounter,
    });
})();

