// YouTube Shorts Drag-to-Scroll Controller
// Allows users to drag/swipe the shorts carousel in any direction

(function () {
    'use strict';

    const wrapper = document.querySelector('.shorts-ticker-wrapper');
    const ticker = document.getElementById('shortsTicker');

    if (!wrapper || !ticker) {
        console.warn('Shorts elements not found');
        return;
    }

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let translateX = 0;
    let animationId = null;

    // Get current transform value
    function getCurrentTransform() {
        const style = window.getComputedStyle(ticker);
        const matrix = new DOMMatrix(style.transform);
        return matrix.m41; // translateX value
    }

    // Start dragging (mouse)
    function handleMouseDown(e) {
        isDragging = true;
        startX = e.pageX;
        translateX = getCurrentTransform();

        wrapper.classList.add('dragging');
        ticker.style.animationPlayState = 'paused';

        // Prevent text selection
        e.preventDefault();
    }

    // Dragging (mouse)
    function handleMouseMove(e) {
        if (!isDragging) return;

        e.preventDefault();
        currentX = e.pageX;
        const deltaX = currentX - startX;

        // Apply the drag movement
        const newTranslateX = translateX + deltaX;
        ticker.style.transform = `translateX(${newTranslateX}px)`;
    }

    // Stop dragging (mouse)
    function handleMouseUp() {
        if (!isDragging) return;

        isDragging = false;
        wrapper.classList.remove('dragging');

        // Get final position
        const finalTransform = getCurrentTransform();

        // Resume animation from current position
        resumeAnimationFromPosition(finalTransform);
    }

    // Touch start (mobile)
    function handleTouchStart(e) {
        isDragging = true;
        startX = e.touches[0].pageX;
        translateX = getCurrentTransform();

        wrapper.classList.add('dragging');
        ticker.style.animationPlayState = 'paused';
    }

    // Touch move (mobile)
    function handleTouchMove(e) {
        if (!isDragging) return;

        currentX = e.touches[0].pageX;
        const deltaX = currentX - startX;

        // Apply the drag movement
        const newTranslateX = translateX + deltaX;
        ticker.style.transform = `translateX(${newTranslateX}px)`;
    }

    // Touch end (mobile)
    function handleTouchEnd() {
        if (!isDragging) return;

        isDragging = false;
        wrapper.classList.remove('dragging');

        // Get final position
        const finalTransform = getCurrentTransform();

        // Resume animation from current position
        resumeAnimationFromPosition(finalTransform);
    }

    // Resume CSS animation from current position
    function resumeAnimationFromPosition(currentPos) {
        // Remove inline transform to let CSS animation take over
        ticker.style.transform = '';

        // Calculate how far we are in the animation cycle
        const tickerWidth = ticker.scrollWidth / 2; // Half because items are duplicated

        // Normalize position to animation range
        let normalizedPos = currentPos % tickerWidth;
        if (normalizedPos > 0) normalizedPos -= tickerWidth;

        // Calculate animation delay to start from current position
        const animationDuration = 35; // seconds (matches CSS)
        const progress = Math.abs(normalizedPos) / tickerWidth;
        const delay = -(progress * animationDuration);

        // Apply new animation with calculated delay
        ticker.style.animation = 'none';
        ticker.offsetHeight; // Trigger reflow
        ticker.style.animation = `ticker-scroll ${animationDuration}s linear infinite`;
        ticker.style.animationDelay = `${delay}s`;
        ticker.style.animationPlayState = 'running';
    }

    // Mouse events (desktop)
    wrapper.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent dragging from leaving the window
    wrapper.addEventListener('mouseleave', () => {
        if (isDragging) {
            handleMouseUp();
        }
    });

    // Touch events (mobile)
    wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: true });
    wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Prevent click events from firing after drag
    let clickStartX = 0;
    wrapper.addEventListener('mousedown', (e) => {
        clickStartX = e.pageX;
    });

    wrapper.addEventListener('click', (e) => {
        const clickEndX = e.pageX;
        if (Math.abs(clickEndX - clickStartX) > 5) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    console.log('Shorts drag-to-scroll initialized');
})();
