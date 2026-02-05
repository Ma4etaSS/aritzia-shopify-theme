/**
 * Aritzia Clone Theme JavaScript
 */

(function() {
  'use strict';

  // Header scroll behavior
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    let lastScroll = 0;
    const isHomepage = document.body.classList.contains('template-index');

    function updateHeader() {
      const scroll = window.scrollY;

      if (isHomepage) {
        if (scroll > 100) {
          header.classList.remove('header--transparent');
          header.classList.add('header--solid');
        } else {
          header.classList.add('header--transparent');
          header.classList.remove('header--solid');
        }
      }

      lastScroll = scroll;
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // Mobile menu toggle
  function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    
    if (!toggle || !mobileMenu) return;

    toggle.addEventListener('click', function() {
      const isOpen = mobileMenu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });
  }

  // Product option selection
  function initProductOptions() {
    const options = document.querySelectorAll('.product-option__value');
    
    options.forEach(function(option) {
      option.addEventListener('click', function() {
        const parent = this.closest('.product-option__values');
        parent.querySelectorAll('.product-option__value').forEach(function(opt) {
          opt.classList.remove('is-selected');
        });
        this.classList.add('is-selected');
      });
    });
  }

  // Quick add buttons
  function initQuickAdd() {
    const quickAddButtons = document.querySelectorAll('.product-card__quick-add');
    
    quickAddButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Add animation
        this.textContent = 'Added!';
        this.style.background = '#000';
        this.style.color = '#fff';
        
        setTimeout(() => {
          this.textContent = 'Quick Add';
          this.style.background = '';
          this.style.color = '';
        }, 2000);
      });
    });
  }

  // Announcement bar close
  function initAnnouncementBar() {
    const announcement = document.querySelector('[data-announcement]');
    const closeBtn = document.querySelector('[data-announcement-close]');
    
    if (!announcement || !closeBtn) return;

    closeBtn.addEventListener('click', function() {
      announcement.style.display = 'none';
      document.documentElement.style.setProperty('--announcement-height', '0px');
    });
  }

  // Hero slideshow
  function initHeroSlideshow() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;

    const slides = hero.querySelectorAll('.hero__slide');
    if (slides.length <= 1) return;

    let currentSlide = 0;
    const autoplaySpeed = 5000;

    function showSlide(index) {
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    let interval = setInterval(nextSlide, autoplaySpeed);

    // Pause button
    const pauseBtn = hero.querySelector('.hero__pause');
    if (pauseBtn) {
      let isPaused = false;
      pauseBtn.addEventListener('click', function() {
        isPaused = !isPaused;
        if (isPaused) {
          clearInterval(interval);
          this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        } else {
          interval = setInterval(nextSlide, autoplaySpeed);
          this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        }
      });
    }
  }

  // Lazy loading images
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      return;
    }

    // Fallback for older browsers
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });

    images.forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // Initialize all components
  function init() {
    initHeader();
    initMobileMenu();
    initProductOptions();
    initQuickAdd();
    initAnnouncementBar();
    initHeroSlideshow();
    initLazyLoading();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
