/**
 * Setup image zoom functionality
 */
export function setupImageZoom() {
    // Get all zoomable images
    const images = document.querySelectorAll('.card-image.zoomable');

    // Get overlay elements (already in HTML)
    const overlay = document.getElementById('image-zoom-overlay');
    const zoomedImgContainer = overlay.querySelector('.zoomed-image-container');
    const zoomedImg = overlay.querySelector('.zoomed-image');
    const closeBtn = overlay.querySelector('.zoom-close-btn');

    // Add event listeners

    // Close on button click/touch
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeZoomedImage();
    });

    // Close on touch events for mobile
    closeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeZoomedImage();
    });
    // Support touch events for mobile closing
    zoomedImgContainer.addEventListener('touchend', (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeZoomedImage();
    });

    // Close on overlay background click/touch
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeZoomedImage();
        }
    });

    // Also close when tapping on the image container or image itself on mobile
    zoomedImgContainer.addEventListener('click', (e) => {
        if (e.target === zoomedImgContainer || e.target === zoomedImg) {
            closeZoomedImage();
        }
    });

    // Add click event to each image
    images.forEach(img => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zoomImage(img.src, img.alt);
        });

        // Also handle touch events for mobile
        img.addEventListener('touchend', (e) => {
            // Prevent default only if it's a simple tap
            if (!this.hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                zoomImage(img.src, img.alt);
            }
        });
    });

    // Add escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeZoomedImage();
        }
    });
}

/**
 * Zoom an image
 */
export function zoomImage(src, alt) {
    const overlay = document.getElementById('image-zoom-overlay');
    const zoomedImg = overlay.querySelector('.zoomed-image');

    // Set image source
    zoomedImg.src = src;
    zoomedImg.alt = alt || 'Enlarged image';

    // Wait for the image to load before showing overlay
    zoomedImg.onload = () => {
        // Show overlay
        overlay.classList.add('active');

        // Prevent body scrolling but ensure overlay can scroll
        document.body.style.overflow = 'hidden';
        overlay.style.overflow = 'auto';

        // Reset scroll position
        overlay.scrollTop = 0;
        overlay.scrollLeft = 0;
    };

    // Fallback in case image is already cached and onload doesn't fire
    setTimeout(() => {
        if (!overlay.classList.contains('active')) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }, 100);
}

/**
 * Close zoomed image
 */
export function closeZoomedImage() {
    const overlay = document.getElementById('image-zoom-overlay');
    overlay.classList.remove('active');

    // Re-enable body scrolling
    document.body.style.overflow = '';

    // Clear image source after animation completes
    setTimeout(() => {
        const zoomedImg = overlay.querySelector('.zoomed-image');
        zoomedImg.src = '';
    }, 300);
}
