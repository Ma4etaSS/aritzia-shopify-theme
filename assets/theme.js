/**
 * Aritzia Clone Theme - Main JavaScript
 * Vanilla JS - No dependencies
 */

(function() {
  'use strict';

  // =========================================
  // UTILITY FUNCTIONS
  // =========================================
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // =========================================
  // HEADER FUNCTIONALITY
  // =========================================
  
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    const isHomepage = document.body.classList.contains('template-index');
    let lastScrollY = 0;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;
      
      // Transparent/solid header on homepage
      if (isHomepage) {
        if (scrollY > 100) {
          header.classList.remove('header--transparent');
          header.classList.add('header--solid');
        } else {
          header.classList.add('header--transparent');
          header.classList.remove('header--solid');
        }
      }

      // Hide/show on scroll (optional)
      if (scrollY > lastScrollY && scrollY > 200) {
        // Scrolling down
        // header.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        // header.style.transform = 'translateY(0)';
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    // Initial call
    updateHeader();
  }

  // =========================================
  // MEGA MENU ACCESSIBILITY
  // =========================================
  
  function initMegaMenu() {
    const navItems = document.querySelectorAll('[data-nav-item]');
    
    navItems.forEach(item => {
      const button = item.querySelector('.header__nav-button');
      const menu = item.querySelector('.mega-menu');
      
      if (!button || !menu) return;

      // Click toggle for accessibility
      button.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        // Close all other menus first
        navItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherBtn = otherItem.querySelector('.header__nav-button');
            const otherMenu = otherItem.querySelector('.mega-menu');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherMenu) otherMenu.setAttribute('aria-hidden', 'true');
          }
        });
        
        this.setAttribute('aria-expanded', !isExpanded);
        menu.setAttribute('aria-hidden', isExpanded);
      });

      // Keyboard navigation
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          button.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
          button.focus();
        }
      });

      // Close when clicking outside
      document.addEventListener('click', function(e) {
        if (!item.contains(e.target)) {
          button.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
        }
      });
    });
  }

  // =========================================
  // MOBILE MENU
  // =========================================
  
  function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('.mobile-menu');
    const close = document.querySelector('.mobile-menu__close');
    
    if (!toggle) return;

    function openMenu() {
      menu?.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menu?.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function() {
      const isOpen = this.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    close?.addEventListener('click', closeMenu);

    // Close on escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && menu?.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', debounce(function() {
      if (window.innerWidth >= 1024 && menu?.classList.contains('is-open')) {
        closeMenu();
      }
    }, 100));
  }

  // =========================================
  // SEARCH
  // =========================================
  
  function initSearch() {
    const searchToggle = document.querySelector('.header__search');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-overlay__input');
    const searchClose = document.querySelector('.search-overlay__close');

    if (!searchToggle) return;

    function openSearch() {
      searchOverlay?.classList.add('is-open');
      searchInput?.focus();
      document.body.style.overflow = 'hidden';
    }

    function closeSearch() {
      searchOverlay?.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    searchToggle.addEventListener('click', openSearch);
    searchClose?.addEventListener('click', closeSearch);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchOverlay?.classList.contains('is-open')) {
        closeSearch();
      }
    });
  }

  // =========================================
  // QUICK ADD BUTTONS
  // =========================================
  
  function initQuickAdd() {
    document.querySelectorAll('[data-quick-add]').forEach(button => {
      button.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = this.dataset.productId;
        const variantId = this.dataset.variantId;
        const originalText = this.textContent;
        
        // Visual feedback
        this.textContent = 'Adding...';
        this.disabled = true;
        
        try {
          // If we have a variant ID, add to cart
          if (variantId) {
            const response = await fetch('/cart/add.js', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: variantId,
                quantity: 1
              })
            });

            if (response.ok) {
              this.textContent = 'Added!';
              this.style.background = '#000';
              this.style.color = '#fff';
              
              // Update cart count if exists
              updateCartCount();
            } else {
              throw new Error('Failed to add');
            }
          } else {
            // Demo mode - just show visual feedback
            await new Promise(resolve => setTimeout(resolve, 500));
            this.textContent = 'Added!';
            this.style.background = '#000';
            this.style.color = '#fff';
          }
        } catch (error) {
          this.textContent = 'Error';
        }

        // Reset after delay
        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = '';
          this.style.color = '';
          this.disabled = false;
        }, 1500);
      });
    });
  }

  // =========================================
  // CART COUNT UPDATE
  // =========================================
  
  async function updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      const countElements = document.querySelectorAll('[data-cart-count]');
      
      countElements.forEach(el => {
        el.textContent = cart.item_count;
        el.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
  }

  // =========================================
  // ANNOUNCEMENT BAR
  // =========================================
  
  function initAnnouncementBar() {
    const bar = document.querySelector('.announcement-bar');
    const closeBtn = bar?.querySelector('[data-announcement-close]');
    
    if (!bar) return;

    // Check if previously dismissed
    const dismissed = sessionStorage.getItem('announcement-dismissed');
    if (dismissed) {
      bar.style.display = 'none';
      document.documentElement.style.setProperty('--announcement-height', '0px');
      return;
    }

    closeBtn?.addEventListener('click', function() {
      bar.style.display = 'none';
      document.documentElement.style.setProperty('--announcement-height', '0px');
      sessionStorage.setItem('announcement-dismissed', 'true');
    });
  }

  // =========================================
  // LAZY LOADING IMAGES
  // =========================================
  
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      images.forEach(img => {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
        
        // If already loaded (cached)
        if (img.complete) {
          img.classList.add('loaded');
        }
      });
    } else {
      // Fallback with Intersection Observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '100px'
      });

      images.forEach(img => observer.observe(img));
    }
  }

  // =========================================
  // PRODUCT OPTIONS
  // =========================================
  
  function initProductOptions() {
    // Color swatches
    document.querySelectorAll('[data-color-swatch]').forEach(swatch => {
      swatch.addEventListener('click', function() {
        const form = this.closest('form');
        const siblings = form?.querySelectorAll('[data-color-swatch]');
        
        siblings?.forEach(s => s.classList.remove('is-active'));
        this.classList.add('is-active');
        
        // Update hidden input
        const input = form?.querySelector('input[name="options[Color]"]');
        if (input) {
          input.value = this.dataset.value;
        }
      });
    });

    // Size buttons
    document.querySelectorAll('[data-size-button]').forEach(button => {
      button.addEventListener('click', function() {
        const form = this.closest('form');
        const siblings = form?.querySelectorAll('[data-size-button]');
        
        siblings?.forEach(b => b.classList.remove('is-active'));
        this.classList.add('is-active');
        
        // Update hidden input
        const input = form?.querySelector('input[name="options[Size]"]');
        if (input) {
          input.value = this.dataset.value;
        }
      });
    });
  }

  // =========================================
  // QUANTITY SELECTOR
  // =========================================
  
  function initQuantitySelectors() {
    document.querySelectorAll('[data-quantity]').forEach(container => {
      const input = container.querySelector('input');
      const minus = container.querySelector('[data-quantity-minus]');
      const plus = container.querySelector('[data-quantity-plus]');
      
      if (!input) return;

      minus?.addEventListener('click', function() {
        const value = parseInt(input.value) || 1;
        if (value > 1) {
          input.value = value - 1;
          input.dispatchEvent(new Event('change'));
        }
      });

      plus?.addEventListener('click', function() {
        const value = parseInt(input.value) || 1;
        const max = parseInt(input.max) || 999;
        if (value < max) {
          input.value = value + 1;
          input.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  // =========================================
  // ACCORDION
  // =========================================
  
  function initAccordions() {
    document.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
      trigger.addEventListener('click', function() {
        const accordion = this.closest('[data-accordion]');
        const content = accordion?.querySelector('[data-accordion-content]');
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        this.setAttribute('aria-expanded', !isExpanded);
        
        if (content) {
          content.style.maxHeight = isExpanded ? '0' : content.scrollHeight + 'px';
        }
      });
    });
  }

  // =========================================
  // TABS
  // =========================================
  
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(tabContainer => {
      const triggers = tabContainer.querySelectorAll('[data-tab-trigger]');
      const panels = tabContainer.querySelectorAll('[data-tab-panel]');
      
      triggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
          const targetId = this.dataset.tabTrigger;
          
          // Update triggers
          triggers.forEach(t => {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
          });
          this.classList.add('is-active');
          this.setAttribute('aria-selected', 'true');
          
          // Update panels
          panels.forEach(panel => {
            panel.classList.remove('is-active');
            panel.hidden = true;
          });
          
          const targetPanel = tabContainer.querySelector(`[data-tab-panel="${targetId}"]`);
          if (targetPanel) {
            targetPanel.classList.add('is-active');
            targetPanel.hidden = false;
          }
        });
      });
    });
  }

  // =========================================
  // SMOOTH SCROLL
  // =========================================
  
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 70;
          const announcementHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--announcement-height')) || 40;
          const offset = headerHeight + announcementHeight;
          
          const position = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({
            top: position,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // =========================================
  // NEWSLETTER FORM
  // =========================================
  
  function initNewsletter() {
    const forms = document.querySelectorAll('form[id*="newsletter"]');
    
    forms.forEach(form => {
      form.addEventListener('submit', async function(e) {
        const button = form.querySelector('button[type="submit"]');
        const originalText = button?.textContent || 'Subscribe';
        
        if (button) {
          button.textContent = 'Subscribing...';
          button.disabled = true;
        }
        
        // Form will submit naturally to Shopify
        // This just handles visual feedback
      });
    });
  }

  // =========================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // =========================================
  
  function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // =========================================
  // FOCUS TRAP (for modals/drawers)
  // =========================================
  
  function createFocusTrap(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleKeydown(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    container.addEventListener('keydown', handleKeydown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeydown);
    };
  }

  // =========================================
  // INITIALIZATION
  // =========================================
  
  function init() {
    initHeader();
    initMegaMenu();
    initMobileMenu();
    initSearch();
    initQuickAdd();
    initAnnouncementBar();
    initLazyLoading();
    initProductOptions();
    initQuantitySelectors();
    initAccordions();
    initTabs();
    initSmoothScroll();
    initNewsletter();
    initScrollAnimations();

    // Expose functions globally if needed
    window.themeUtils = {
      updateCartCount,
      createFocusTrap,
      debounce,
      throttle
    };

    console.log('Aritzia Clone Theme initialized');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
