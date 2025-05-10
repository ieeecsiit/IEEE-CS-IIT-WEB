document.addEventListener('DOMContentLoaded', function() {
    const typewriterText = document.querySelector('.typewriter-text');
    let isVisible = false;

    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Function to handle scroll
    function handleScroll() {
        if (isInViewport(typewriterText)) {
            if (!isVisible) {
                typewriterText.classList.remove('paused');
                isVisible = true;
            }
        } else {
            if (isVisible) {
                typewriterText.classList.add('paused');
                isVisible = false;
            }
        }
    }

    // Initial check
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
}); 