// YouTube Shorts Drag-to-Scroll Controller
// Allows users to drag/swipe the shorts carousel in any direction

(function () {
    'use strict';

    const wrapper = document.querySelector('.shorts-ticker-wrapper');
    const ticker = document.getElementById('shortsTicker');

    if (!wrapper || !ticker) return;

    let isDragging = false;
    let startX = 0;
    let currentTranslateX = 0;
    const animationDuration = 35; // Must match CSS

    // Get current transform value (either from animation or inline style)
    function getCurrentTransform() {
        const style = window.getComputedStyle(ticker);
        const matrix = new DOMMatrix(style.transform);
        return matrix.m41; // Current translateX
    }

    function onDragStart(x) {
        isDragging = true;
        startX = x;
        currentTranslateX = getCurrentTransform();

        // Stop animation immediately and lock at current position
        ticker.style.animation = 'none';
        ticker.style.transform = `translateX(${currentTranslateX}px)`;

        wrapper.classList.add('dragging');
    }

    function onDragMove(x) {
        if (!isDragging) return;

        const deltaX = x - startX;
        let newX = currentTranslateX + deltaX;

        // Loop logic: if we drag too far, wrap around seamlessly
        const tickerWidth = ticker.scrollWidth / 2;
        if (newX > 0) {
            newX -= tickerWidth;
            startX += tickerWidth;
        } else if (newX < -tickerWidth) {
            newX += tickerWidth;
            startX -= tickerWidth;
        }

        ticker.style.transform = `translateX(${newX}px)`;
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        wrapper.classList.remove('dragging');

        // Resume animation from the current drag position
        const finalX = getCurrentTransform();
        resumeAnimation(finalX);
    }

    function resumeAnimation(currentPos) {
        const tickerWidth = ticker.scrollWidth / 2;

        // Calculate where we are in the 0 to -50% cycle
        let normalizedPos = currentPos % tickerWidth;
        if (normalizedPos > 0) normalizedPos -= tickerWidth;

        // Calculate negative delay to skip to the current progress of the animation
        const progress = Math.abs(normalizedPos) / tickerWidth;
        const delay = -(progress * animationDuration);

        // Force browser to restart animation with the correct delay
        ticker.style.animation = 'none';
        ticker.offsetHeight; // Reflow
        ticker.style.transform = '';
        ticker.style.animation = `ticker-scroll ${animationDuration}s linear infinite`;
        ticker.style.animationDelay = `${delay}s`;
    }

    // Mouse Listeners
    wrapper.addEventListener('mousedown', (e) => {
        onDragStart(e.clientX);
        e.preventDefault(); // Prevents image dragging and text selection
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            onDragMove(e.clientX);
        }
    });

    window.addEventListener('mouseup', onDragEnd);

    // Touch Listeners
    wrapper.addEventListener('touchstart', (e) => {
        onDragStart(e.touches[0].clientX);
    }, { passive: false });

    wrapper.addEventListener('touchmove', (e) => {
        if (isDragging) {
            onDragMove(e.touches[0].clientX);
            // Prevent page scrolling while dragging horizontally
            if (e.cancelable) e.preventDefault();
        }
    }, { passive: false });

    wrapper.addEventListener('touchend', onDragEnd);

    // Click protection: if the user dragged, don't trigger a click (e.g. following a link)
    let mousedownX = 0;
    wrapper.addEventListener('mousedown', (e) => mousedownX = e.clientX);
    wrapper.addEventListener('click', (e) => {
        if (Math.abs(e.clientX - mousedownX) > 5) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    console.log('Shorts drag-to-scroll initialized and fixed');
})();
