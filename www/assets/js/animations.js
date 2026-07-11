



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

    /* Public API */
    return Object.freeze({
        initScrollObserver,
        triggerScrollAnimations,
    });
})();

