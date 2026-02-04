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

    const initPlayer = (el) => {
        if (el.dataset.initialized === "true") return; // Prevent double init
        el.dataset.initialized = "true";

        const parentElement = el.parentElement;
        const videoId = el.getAttribute('data-video-id');
        const isClientReview = el.closest('.client-review-card') !== null;
        const isFaqVideo = el.getAttribute('data-faq-video') === "true";

        // Determine parameters based on video type
        let playerVars = {
            'autoplay': isClientReview ? 0 : 1, // Autoplay non-reviews (standard behavior)
            'controls': 1,
            'rel': 0,
            'showinfo': 0,
            'mute': 1, // All videos muted by default
            'loop': 1,
            'playlist': videoId
        };

        if (isFaqVideo) {
            playerVars.autoplay = 0; // Don't autoplay FAQ videos
        }

        const player = new YT.Player(el.id, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: playerVars,
            events: {
                'onReady': onPlayerReady,
                'onVolumeChange': onPlayerVolumeChange,
                'onStateChange': onPlayerStateChange
            }
        });
        players.push({
            id: el.id,
            player: player,
            element: parentElement,
            isClientReview: isClientReview,
            isFaqVideo: isFaqVideo,
            manuallyPaused: false,
            autoPausing: false
        });
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initPlayer(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '1000px' }); // Increased rootMargin for faster loading

        playerElements.forEach(el => observer.observe(el));
    } else {
        playerElements.forEach(el => initPlayer(el));
    }
};

let autoplayIntervalStarted = false;

function onPlayerReady(event) {
    const iframe = event.target.getIframe();
    const isClientReview = iframe.closest('.client-review-card') !== null;

    // Explicitly mute on load to ensure muted-autoplay on mobile
    event.target.mute();

    // Check if this is an FAQ video by looking up via ID (more robust)
    const playerObj = players.find(p => p.id === iframe.id);
    const isFaqVideo = playerObj ? playerObj.isFaqVideo : false;

    if (!isClientReview && !isFaqVideo) {
        const rect = iframe.getBoundingClientRect();
        if (rect.right > -100 && rect.left < window.innerWidth + 100) {
            event.target.playVideo();
        }
    }

    playersReady++;
    if (!autoplayIntervalStarted && playersReady > 0) {
        autoplayIntervalStarted = true;
        startAutoplayLogic();
    }
}

function onPlayerStateChange(event) {
    const playerObj = players.find(p => p.player === event.target);
    if (!playerObj) return;

    if (event.data === YT.PlayerState.PLAYING) {
        playerObj.manuallyPaused = false;
        // Logic to pause other players or stop ticker has been removed
        // to allow independent video playback as requested.
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        // If it wasn't our code that called pause (autoPausing), then it was the user
        if (!playerObj.autoPausing) {
            playerObj.manuallyPaused = true;
        }
        playerObj.autoPausing = false; // Reset
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
    const checkVisiblePlayers = () => {
        const viewportWidth = window.innerWidth;
        const centerX = viewportWidth / 2;

        let bestVisible = null;
        let minDistance = Infinity;

        players.forEach(p => {
            if (!p.element || p.isClientReview || p.isFaqVideo) return;

            const rect = p.element.getBoundingClientRect();

            // Check if the player is within the horizontal viewport
            const isVisible = rect.right > -50 && rect.left < viewportWidth + 50;

            if (isVisible) {
                // Determine which video is closest to center for focused autoplay
                const dist = Math.abs((rect.left + rect.right) / 2 - centerX);
                if (dist < minDistance && !p.manuallyPaused) {
                    minDistance = dist;
                    bestVisible = p;
                }
            } else {
                // If NOT visible and is playing, pause to save resources
                if (p.player.getPlayerState && p.player.getPlayerState() === YT.PlayerState.PLAYING) {
                    p.autoPausing = true;
                    p.player.pauseVideo();
                    setTimeout(() => { p.autoPausing = false; }, 500);
                }
            }
        });

        // Try to start the best visible one if it's not manually paused
        if (bestVisible) {
            if (bestVisible.player.getPlayerState &&
                bestVisible.player.getPlayerState() !== YT.PlayerState.PLAYING &&
                bestVisible.player.getPlayerState() !== YT.PlayerState.BUFFERING) {
                try {
                    bestVisible.player.playVideo();
                } catch (e) {
                    console.warn("Autoplay blocked or failed for:", bestVisible.id);
                }
            }
        }
    };

    // Run check frequently
    setInterval(checkVisiblePlayers, 400);
}


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


                    const defaultOpenItem = accordion.querySelector('.accordion-collapse.show');
                    if (defaultOpenItem) {


                        const bsCollapse = bootstrap.Collapse.getInstance(defaultOpenItem) || new bootstrap.Collapse(defaultOpenItem, { toggle: false });


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

        // Stage Section Cards Animation Logic (Refactored for Fade + Scale)
        const stageSection = document.querySelector('.stage-section');
        if (stageSection) {
            const stageCards = stageSection.querySelectorAll('.stage-section-card');

            // Set initial state via class
            stageCards.forEach(card => {
                card.classList.add('stage-card-initial');
            });

            const stageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        stageCards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('stage-card-animate');
                            }, index * 150); // Staggered delay for cards
                        });
                        observer.unobserve(stageSection);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

            stageObserver.observe(stageSection);
        }
    };

    setTimeout(initAccordionAnimations, 100);
});



document.addEventListener('DOMContentLoaded', function () {
    const connectBtn = document.getElementById('connectBtn');
    const connectDropdown = document.getElementById('connectDropdown');

    if (connectBtn && connectDropdown) {
        connectBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            connectDropdown.classList.toggle('show');

            // Rotate chevron
            const icon = connectBtn.querySelector('i');
            if (icon) {
                icon.style.transform = connectDropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!connectBtn.contains(e.target) && !connectDropdown.contains(e.target)) {
                connectDropdown.classList.remove('show');
                const icon = connectBtn.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const elements = document.querySelectorAll('.grow-your-gym .col-md-4, .features-split-section .row');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                // Optional: Stop observing after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Adjust trigger point
    });

    elements.forEach(element => {
        observer.observe(element);
    });

    // FAQ Masonry Layout Refresh on Accordion Toggle
    const faqContainer = document.querySelector('.faq-section-classname-container .row');
    if (faqContainer) {
        const faqAccordions = faqContainer.querySelectorAll('.collapse');
        faqAccordions.forEach(acc => {
            acc.addEventListener('shown.bs.collapse', function () {
                var msnry = Masonry.data(faqContainer);
                if (msnry) msnry.layout();
            });
            acc.addEventListener('hidden.bs.collapse', function () {
                var msnry = Masonry.data(faqContainer);
                if (msnry) msnry.layout();
            });
        });
    }
});


document.querySelectorAll('.tutorial-video-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', function () {
        const videoId = this.dataset.videoId;
        if (!videoId) return;

        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
        iframe.setAttribute('width', '100%');
        iframe.setAttribute('height', '100%');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');

        this.innerHTML = '';
        this.appendChild(iframe);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const progressBar = document.getElementById('scrollProgressBar');
    const goToTopBtn = document.getElementById('goToTopBtn');

    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;

        if (progressBar) {
            progressBar.style.width = scrollPercentage + '%';

            const hue = (scrollPercentage / 100) * 360;
        }

        if (goToTopBtn) {
            if (scrollTop > 300) {
                goToTopBtn.classList.add('show');
            } else {
                goToTopBtn.classList.remove('show');
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const flagContainers = document.querySelectorAll('.flag-counter-container');
    let currentIndices = [0, 0, 0, 0];
    let usedFlags = new Set();
    let isAnimating = false;

    // Preload all flag images
    function preloadImages() {
        const allImages = document.querySelectorAll('.flag-img');
        allImages.forEach(img => {
            // Create a new Image object to force load
            const preloadImg = new Image();
            preloadImg.src = img.src;
            img.dataset.loaded = 'false';

            preloadImg.onload = function () {
                img.dataset.loaded = 'true';
                img.classList.remove('loading');
            };

            preloadImg.onerror = function () {
                img.dataset.loaded = 'true';
                img.classList.remove('loading');
            };

            // Show loading state
            img.classList.add('loading');
        });
    }

    function getRandomUniqueFlag(containerIndex) {
        const container = flagContainers[containerIndex];
        const flags = container.querySelectorAll('.flag-img');
        const availableIndices = [];

        // Find available flags that aren't currently shown in other containers
        flags.forEach((flag, index) => {
            if (!usedFlags.has(flag.src)) {
                availableIndices.push(index);
            }
        });

        // If no unique flags available, reset and use any flag
        if (availableIndices.length === 0) {
            usedFlags.clear();
            return Math.floor(Math.random() * flags.length);
        }

        return availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    function rotateFlags() {
        if (isAnimating) return;
        isAnimating = true;

        // Clear used flags set for this rotation cycle
        usedFlags.clear();

        flagContainers.forEach((container, containerIndex) => {
            const flags = container.querySelectorAll('.flag-img');
            const currentActive = container.querySelector('.flag-img.active');
            const nextIndex = getRandomUniqueFlag(containerIndex);

            // Mark this flag as used for current cycle
            usedFlags.add(flags[nextIndex].src);

            // Set next flag as "next" state (coming from bottom)
            const nextFlag = flags[nextIndex];
            nextFlag.classList.add('next');

            // Force reflow to ensure CSS transition starts
            void nextFlag.offsetWidth;

            // Start animation after a small delay to create staggered effect
            setTimeout(() => {
                if (currentActive) {
                    currentActive.classList.remove('active');
                    currentActive.classList.add('leaving');
                }

                nextFlag.classList.remove('next');
                nextFlag.classList.add('active');

                // Remove leaving class after animation completes
                if (currentActive) {
                    setTimeout(() => {
                        currentActive.classList.remove('leaving');
                    }, 1200);
                }

                currentIndices[containerIndex] = nextIndex;
            }, containerIndex * 100); // Staggered start for each container
        });

        // Reset animation flag after all animations complete
        setTimeout(() => {
            isAnimating = false;
        }, 2000);
    }

    // Preload images first
    preloadImages();

    // Start rotation after images are loaded - change every 4 seconds (slower)
    let rotationInterval;

    function startRotation() {
        // Initial rotation after 2 seconds to ensure images are loaded
        setTimeout(() => {
            rotateFlags();
            // Continue rotation every 4 seconds
            rotationInterval = setInterval(rotateFlags, 4000);
        }, 2000);
    }

    // Check if all images are loaded before starting
    function checkAllImagesLoaded() {
        const allImages = document.querySelectorAll('.flag-img');
        const loadedImages = Array.from(allImages).filter(img => img.dataset.loaded === 'true');

        if (loadedImages.length >= allImages.length * 0.8) { // Start when 80% are loaded
            startRotation();
        } else {
            setTimeout(checkAllImagesLoaded, 500);
        }
    }

    // Start checking image loading
    setTimeout(checkAllImagesLoaded, 1000);

    // Fallback in case image loading check fails
    setTimeout(startRotation, 3000);
});

