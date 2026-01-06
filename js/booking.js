document.addEventListener('DOMContentLoaded', function () {
    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach(button => {
        button.addEventListener('click', function () {

        });
    });

    // Dropdown Section Image Swapping Logic
    const dropdownAccordion = document.getElementById('accordionExample');
    const dropdownImage = document.getElementById('main-dropdown-image');

    if (dropdownAccordion && dropdownImage) {
        dropdownAccordion.addEventListener('show.bs.collapse', function (e) {
            const button = e.target.previousElementSibling.querySelector('.accordion-button');
            const newImageSrc = button.getAttribute('data-image');

            if (newImageSrc) {
                // Fade out
                dropdownImage.style.opacity = '0';

                setTimeout(() => {
                    // Change source
                    dropdownImage.src = newImageSrc;
                    // Fade in
                    dropdownImage.style.opacity = '1';
                }, 400); // Matches the CSS transition duration
            }
        });
    }

    // Booking Section Image Swapping Logic
    const bookingAccordionElement = document.getElementById('bookingAccordion');
    const bookingImageElement = document.getElementById('booking-image');

    if (bookingAccordionElement && bookingImageElement) {
        bookingAccordionElement.addEventListener('show.bs.collapse', function (e) {
            const button = e.target.previousElementSibling.querySelector('.accordion-button');
            const newImageSrc = button.getAttribute('data-image');

            if (newImageSrc) {
                // Fade out
                bookingImageElement.style.opacity = '0';

                setTimeout(() => {
                    // Change source
                    bookingImageElement.src = newImageSrc;
                    // Fade in
                    bookingImageElement.style.opacity = '1';
                }, 400);
            }
        });
    }


    const bookingImage = document.querySelector('.booking-section-right-img');
    if (bookingImage) {
        bookingImage.style.opacity = '0';
        bookingImage.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            bookingImage.style.opacity = '1';
        }, 300);
    }
});


let players = [];
let playersReady = 0;

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



window.onYouTubeIframeAPIReady = function () {
    const playerElements = document.querySelectorAll('.youtube-player');
    playerElements.forEach((el, index) => {
        const parentElement = el.parentElement;
        const videoId = el.getAttribute('data-video-id');
        const isClientReview = el.closest('.client-review-card') !== null;

        const player = new YT.Player(el.id, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 0, // Logic handles play
                'controls': 1,
                'rel': 0,
                'showinfo': 0,
                'mute': isClientReview ? 0 : 1, // Unmute client reviews (click-to-play), others muted (autoplay)
                'loop': 1,
                'playlist': videoId
            },
            events: {
                'onReady': onPlayerReady,
                'onVolumeChange': onPlayerVolumeChange
            }
        });
        players.push({ id: el.id, player: player, element: parentElement, isClientReview: isClientReview });
    });
};

function onPlayerReady(event) {
    const iframe = event.target.getIframe();
    const isClientReview = iframe.closest('.client-review-card') !== null;

    if (!isClientReview) {
        event.target.playVideo();
    }

    playersReady++;
    if (playersReady === players.length) {
        startAutoplayLogic();
    }
}

function onPlayerVolumeChange(event) {
    const playerMuted = event.target.isMuted();
    const playerVolume = event.target.getVolume();

    if (!playerMuted && playerVolume > 0) {
        players.forEach(p => {
            if (p.player !== event.target) {
                p.player.mute();
            }
        });
    }
}

function startAutoplayLogic() {
    const checkCenterPlayer = () => {
        const centerX = window.innerWidth / 2;
        let closestPlayer = null;
        let minDistance = Infinity;

        players.forEach(p => {
            if (!p.element || p.isClientReview) return; // Skip client review videos
            const rect = p.element.getBoundingClientRect();
            const playerCenter = rect.left + rect.width / 2;
            const distance = Math.abs(centerX - playerCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestPlayer = p;
            }
        });

        players.forEach(p => {
            if (!p.element || p.isClientReview) return; // Skip client review videos


            if (p.player.getPlayerState && p.player.getPlayerState() !== YT.PlayerState.PLAYING && p.player.getPlayerState() !== YT.PlayerState.BUFFERING) {
                p.player.playVideo();
            }
        });
    };

    setInterval(checkCenterPlayer, 100);
}


// Custom Particle Background Implementation removed as per request
function initCustomParticles() {
    // Function removed
}

document.addEventListener('DOMContentLoaded', function () {
    // initCustomParticles(); // Removed

    const svgImage = document.querySelector('.img-fluid[src*="ban.svg"]');

    if (svgImage) {
        // Wait for SVG to load
        if (svgImage.complete) {
            initSVGAnimations(svgImage);
        } else {
            svgImage.addEventListener('load', function () {
                initSVGAnimations(svgImage);
            });
        }
    }

    function initSVGAnimations(svgElement) {
        // Get the SVG document
        const svgDoc = svgElement.contentDocument;
        if (!svgDoc) return;

        // Find message-like elements in the SVG
        const messageElements = svgDoc.querySelectorAll('g, rect, circle, ellipse, path');

        // Add animation classes based on element properties
        messageElements.forEach((el, index) => {
            // Check if element looks like a message box (adjust these heuristics)
            const bbox = el.getBBox();
            const isMessageBox = (
                (bbox.width > 50 && bbox.width < 300) && // Reasonable size for message
                (bbox.height > 30 && bbox.height < 200) &&
                !el.classList.contains('man') && // Exclude man figure
                !el.classList.contains('human') &&
                !el.classList.contains('person')
            );

            if (isMessageBox) {
                el.classList.add('message-box');
                el.classList.add(`message-${index}`);

                // Add different animation types based on position or content
                if (index % 4 === 0) el.classList.add('notification');
                else if (index % 4 === 1) el.classList.add('chat-bubble');
                else if (index % 4 === 2) el.classList.add('popup');
                else el.classList.add('workout-message');

                // Add animation delay for staggered effect
                el.style.animationDelay = `${(index * 0.3)}s`;
            }

            // Add animation to text elements inside message boxes
            const textElements = el.querySelectorAll('text, tspan');
            textElements.forEach(textEl => {
                textEl.classList.add('message-text');
            });
        });
    }

    // Alternative: If SVG is inline, use this approach
    const inlineSVG = document.querySelector('svg.img-fluid');
    if (inlineSVG) {
        animateInlineSVG(inlineSVG);
    }

    function animateInlineSVG(svg) {
        // Find groups that might contain message boxes
        const groups = svg.querySelectorAll('g');

        groups.forEach((group, index) => {
            // Check if this group contains message-like elements
            const rects = group.querySelectorAll('rect, circle, ellipse');
            const texts = group.querySelectorAll('text');

            if (rects.length > 0 && texts.length > 0) {
                // Likely a message box
                group.classList.add('message-box');
                group.classList.add(`message-${index}`);

                // Add staggered animation
                group.style.animationDelay = `${(index * 0.4)}s`;

                // Animate text inside
                texts.forEach(text => {
                    text.classList.add('message-text');
                });

                // Animate background shapes
                rects.forEach(rect => {
                    rect.classList.add('message-shadow');
                });
            }
        });
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.business-card');
    const button = document.querySelector('.btn-demo-blue');
    let animationTriggered = false;

    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight * 0.85) && // Trigger at 85% of viewport
            rect.bottom >= (window.innerHeight * 0.15)
        );
    }

    // Animate elements
    function animateOnScroll() {
        if (animationTriggered) return;

        const section = document.querySelector('.we-fit-in-section');
        if (section && isInViewport(section)) {
            animationTriggered = true;

            // Animate cards with staggered delay
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('scroll-visible');
                }, index * 100);
            });

            // Animate button
            setTimeout(() => {
                if (button) button.classList.add('scroll-visible');
            }, 800);

            // Remove scroll listener after animation
            window.removeEventListener('scroll', animateOnScroll);
        }
    }

    // Initial check on page load
    setTimeout(animateOnScroll, 500);

    // Check on scroll (throttled)
    window.addEventListener('scroll', () => {
        requestAnimationFrame(animateOnScroll);
    });

    // Check on resize
    window.addEventListener('resize', animateOnScroll);

    // Accordion Scroll Animation and Auto-Opening Logic
    const initAccordionAnimations = () => {
        const accordionSections = document.querySelectorAll('.accordion');

        const observerOptions = {
            threshold: 0.2, // Trigger when 20% of the section is visible
            rootMargin: '0px 0px -50px 0px'
        };

        const accordionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const accordion = entry.target;
                    const items = accordion.querySelectorAll('.accordion-item');

                    // Add animation class to items for scroll effect
                    items.forEach((item, index) => {
                        item.classList.add('accordion-item-animate');
                        setTimeout(() => {
                            item.classList.add('active');
                        }, index * 150); // Staggered delay
                    });

                    // Auto-opening logic for the default item
                    const defaultOpenItem = accordion.querySelector('.accordion-collapse.show');
                    if (defaultOpenItem) {
                        // Briefly hide and then re-show to trigger the animation
                        // if we want it to look like it's "auto-opening" on scroll.
                        // However, to keep it simple and smooth, we can just ensure 
                        // it's transitioned properly.

                        // To strictly follow "auto opening once a render website or scroll"
                        // we can remove 'show' class initially and add it back here.

                        const bsCollapse = bootstrap.Collapse.getInstance(defaultOpenItem) || new bootstrap.Collapse(defaultOpenItem, { toggle: false });

                        // If it was already marked as 'show' in HTML, it might be open.
                        // We can force a re-open if it's the first time it's seen.
                        if (!accordion.dataset.animated) {
                            defaultOpenItem.classList.remove('show');
                            setTimeout(() => {
                                bsCollapse.show();
                            }, items.length * 150 + 200); // Wait for fade-in to mostly finish
                        }
                    }

                    accordion.dataset.animated = "true";
                    observer.unobserve(accordion);
                }
            });
        }, observerOptions);

        accordionSections.forEach(section => {
            // Initially add the animation class to avoid jumpiness before observer kicks in
            const items = section.querySelectorAll('.accordion-item');
            items.forEach(item => item.classList.add('accordion-item-animate'));

            accordionObserver.observe(section);
        });

        // Stage Section Cards Animation Logic
        const stageSection = document.querySelector('.stage-section');
        if (stageSection) {
            const stageCards = stageSection.querySelectorAll('.stage-section-card');
            stageCards.forEach(card => card.classList.add('stage-card-animate'));

            const stageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        stageCards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('active');
                            }, index * 100); // Staggered delay for cards
                        });
                        observer.unobserve(stageSection);
                    }
                });
            }, { threshold: 0.15 });

            stageObserver.observe(stageSection);
        }
    };

    // Initialize after a short delay to ensure layout is ready
    setTimeout(initAccordionAnimations, 100);
});