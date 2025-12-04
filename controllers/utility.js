// ===========================
// UTILITY CONTROLLER
// ===========================

export class UtilityController {
    // Initialize utility functions
    static init() {
        this.setupSmoothScroll();
    }

    // Setup smooth scroll for anchor links
    static setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                // Only handle if it's a valid anchor (not just '#')
                if (href && href !== '#') {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
}
