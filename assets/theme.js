/**
 * Aritzia Clone Theme JavaScript
 * Vanilla JS - No jQuery dependency
 */

(function() {
  'use strict';

  /* ==========================================================================
     Utilities
     ========================================================================== */
  
  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const trapFocus = (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    });
  };

  /* ==========================================================================
     Announcement Bar
     ========================================================================== */
  
  class AnnouncementBar {
    constructor(element) {
      this.element = element;
      this.messages = element.querySelectorAll('[data-announcement-message]');
      this.closeBtn = element.querySelector('[data-announcement-close]');
      this.currentIndex = 0;
      this.interval = null;
      
      this.init();
    }

    init() {
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      if (this.messages.length > 1) {
        this.startRotation();
      }
    }

    startRotation() {
      const speed = parseInt(this.element.dataset.rotationSpeed || 5) * 1000;
      this.interval = setInterval(() => this.nextMessage(), speed);
    }

    nextMessage() {
      this.messages[this.currentIndex].classList.remove('is-active');
      this.currentIndex = (this.currentIndex + 1) % this.messages.length;
      this.messages[this.currentIndex].classList.add('is-active');
    }

    close() {
      this.element.style.display = 'none';
      if (this.interval) {
        clearInterval(this.interval);
      }
      sessionStorage.setItem('announcement-closed', 'true');
    }
  }

  /* ==========================================================================
     Header
     ========================================================================== */
  
  class Header {
    constructor(element) {
      this.element = element;
      this.wrapper = element.querySelector('.header__wrapper');
      this.dropdownTriggers = element.querySelectorAll('[data-dropdown-trigger]');
      this.searchToggle = element.querySelector('[data-search-toggle]');
      this.searchOverlay = element.querySelector('[data-search-overlay]');
      this.searchClose = element.querySelector('[data-search-close]');
      this.menuToggle = element.querySelector('[data-menu-toggle]');
      this.mobileMenu = element.querySelector('[data-mobile-menu]');
      this.menuOverlay = element.querySelector('[data-menu-overlay]');
      this.menuClose = element.querySelector('[data-menu-close]');
      this.cartToggle = element.querySelector('[data-cart-toggle]');
      
      this.lastScrollY = 0;
      this.isSticky = false;
      
      this.init();
    }

    init() {
      // Dropdown menus
      this.dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => this.toggleDropdown(e));
        trigger.addEventListener('mouseenter', (e) => this.openDropdown(e));
      });

      // Close dropdowns on outside click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.header__nav-item')) {
          this.closeAllDropdowns();
        }
      });

      // Search
      if (this.searchToggle && this.searchOverlay) {
        this.searchToggle.addEventListener('click', () => this.openSearch());
        this.searchClose?.addEventListener('click', () => this.closeSearch());
      }

      // Mobile menu
      if (this.menuToggle && this.mobileMenu) {
        this.menuToggle.addEventListener('click', () => this.openMobileMenu());
        this.menuClose?.addEventListener('click', () => this.closeMobileMenu());
        this.menuOverlay?.addEventListener('click', () => this.closeMobileMenu());
        
        // Submenu triggers
        const submenuTriggers = this.mobileMenu.querySelectorAll('[data-mobile-submenu-trigger]');
        submenuTriggers.forEach(trigger => {
          trigger.addEventListener('click', (e) => this.openSubmenu(e));
        });
        
        const backButtons = this.mobileMenu.querySelectorAll('[data-mobile-submenu-back]');
        backButtons.forEach(btn => {
          btn.addEventListener('click', (e) => this.closeSubmenu(e));
        });
      }

      // Cart drawer
      if (this.cartToggle) {
        this.cartToggle.addEventListener('click', (e) => {
          e.preventDefault();
          window.cartDrawer?.open();
        });
      }

      // Sticky header
      window.addEventListener('scroll', debounce(() => this.handleScroll(), 10));
    }

    toggleDropdown(e) {
      const item = e.target.closest('.header__nav-item');
      const isActive = item.classList.contains('is-active');
      
      this.closeAllDropdowns();
      
      if (!isActive) {
        item.classList.add('is-active');
        e.target.setAttribute('aria-expanded', 'true');
      }
    }

    openDropdown(e) {
      const item = e.target.closest('.header__nav-item');
      if (item.classList.contains('has-dropdown')) {
        this.closeAllDropdowns();
        item.classList.add('is-active');
        const trigger = item.querySelector('[data-dropdown-trigger]');
        trigger?.setAttribute('aria-expanded', 'true');
      }
    }

    closeAllDropdowns() {
      this.element.querySelectorAll('.header__nav-item.is-active').forEach(item => {
        item.classList.remove('is-active');
        const trigger = item.querySelector('[data-dropdown-trigger]');
        trigger?.setAttribute('aria-expanded', 'false');
      });
    }

    openSearch() {
      this.searchOverlay.hidden = false;
      this.searchOverlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      this.searchOverlay.querySelector('input')?.focus();
      trapFocus(this.searchOverlay);
    }

    closeSearch() {
      this.searchOverlay.classList.remove('is-active');
      document.body.style.overflow = '';
      setTimeout(() => {
        this.searchOverlay.hidden = true;
      }, 300);
    }

    openMobileMenu() {
      this.mobileMenu.hidden = false;
      this.menuOverlay.hidden = false;
      requestAnimationFrame(() => {
        this.mobileMenu.classList.add('is-active');
        this.menuOverlay.classList.add('is-active');
      });
      document.body.style.overflow = 'hidden';
      this.menuToggle.setAttribute('aria-expanded', 'true');
      trapFocus(this.mobileMenu);
    }

    closeMobileMenu() {
      this.mobileMenu.classList.remove('is-active');
      this.menuOverlay.classList.remove('is-active');
      document.body.style.overflow = '';
      this.menuToggle.setAttribute('aria-expanded', 'false');
      setTimeout(() => {
        this.mobileMenu.hidden = true;
        this.menuOverlay.hidden = true;
      }, 300);
    }

    openSubmenu(e) {
      const submenu = e.target.closest('.mobile-menu__item').querySelector('[data-mobile-submenu]');
      if (submenu) {
        submenu.hidden = false;
        requestAnimationFrame(() => {
          submenu.classList.add('is-active');
        });
      }
    }

    closeSubmenu(e) {
      const submenu = e.target.closest('[data-mobile-submenu]');
      if (submenu) {
        submenu.classList.remove('is-active');
        setTimeout(() => {
          submenu.hidden = true;
        }, 300);
      }
    }

    handleScroll() {
      const scrollY = window.scrollY;
      const headerHeight = this.wrapper.offsetHeight;
      
      if (scrollY > headerHeight && !this.isSticky) {
        this.element.classList.add('is-sticky');
        this.isSticky = true;
      } else if (scrollY <= headerHeight && this.isSticky) {
        this.element.classList.remove('is-sticky');
        this.isSticky = false;
      }
      
      this.lastScrollY = scrollY;
    }
  }

  /* ==========================================================================
     Cart Drawer
     ========================================================================== */
  
  class CartDrawer {
    constructor(element) {
      this.element = element;
      this.closeButtons = element.querySelectorAll('[data-cart-drawer-close]');
      this.content = element.querySelector('[data-cart-drawer-content]');
      
      this.init();
    }

    init() {
      this.closeButtons.forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });

      // Quantity buttons
      this.element.addEventListener('click', (e) => {
        if (e.target.matches('[data-quantity-minus]')) {
          this.updateQuantity(e.target, -1);
        }
        if (e.target.matches('[data-quantity-plus]')) {
          this.updateQuantity(e.target, 1);
        }
        if (e.target.matches('[data-remove-item]')) {
          this.removeItem(e.target);
        }
      });

      // ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.element.classList.contains('is-active')) {
          this.close();
        }
      });
    }

    open() {
      this.element.hidden = false;
      requestAnimationFrame(() => {
        this.element.classList.add('is-active');
      });
      document.body.style.overflow = 'hidden';
      trapFocus(this.element);
    }

    close() {
      this.element.classList.remove('is-active');
      document.body.style.overflow = '';
      setTimeout(() => {
        this.element.hidden = true;
      }, 300);
    }

    updateQuantity(button, change) {
      const item = button.closest('[data-cart-item]');
      const input = item.querySelector('[data-quantity-input]');
      const newQuantity = Math.max(0, parseInt(input.value) + change);
      
      input.value = newQuantity;
      this.updateCart(item.dataset.cartItem, newQuantity);
    }

    removeItem(button) {
      const item = button.closest('[data-cart-item]');
      this.updateCart(item.dataset.cartItem, 0);
    }

    async updateCart(key, quantity) {
      try {
        const response = await fetch(window.routes.cart_change_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: key,
            quantity: quantity
          })
        });

        const cart = await response.json();
        this.updateUI(cart);
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    }

    updateUI(cart) {
      // Update cart count
      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = cart.item_count;
      });

      // Refresh cart drawer content
      this.refreshContent();
    }

    async refreshContent() {
      try {
        const response = await fetch('/?section_id=cart-drawer');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('[data-cart-drawer-content]');
        
        if (newContent && this.content) {
          this.content.innerHTML = newContent.innerHTML;
        }
      } catch (error) {
        console.error('Error refreshing cart:', error);
      }
    }
  }

  /* ==========================================================================
     Hero Banner Slider
     ========================================================================== */
  
  class HeroBanner {
    constructor(element) {
      this.element = element;
      this.slides = element.querySelectorAll('[data-hero-slide]');
      this.navDots = element.querySelectorAll('[data-hero-nav]');
      this.currentIndex = 0;
      this.interval = null;
      
      if (this.slides.length > 1) {
        this.init();
      }
    }

    init() {
      // Navigation dots
      this.navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
      });

      // Auto-play
      this.startAutoPlay();
      
      // Pause on hover
      this.element.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.element.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    goToSlide(index) {
      this.slides[this.currentIndex].classList.remove('is-active');
      this.navDots[this.currentIndex]?.classList.remove('is-active');
      
      this.currentIndex = index;
      
      this.slides[this.currentIndex].classList.add('is-active');
      this.navDots[this.currentIndex]?.classList.add('is-active');
    }

    nextSlide() {
      this.goToSlide((this.currentIndex + 1) % this.slides.length);
    }

    startAutoPlay() {
      this.interval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoPlay() {
      clearInterval(this.interval);
    }
  }

  /* ==========================================================================
     Collection Filters
     ========================================================================== */
  
  class CollectionFilters {
    constructor(element) {
      this.element = element;
      this.filterToggle = element.querySelector('[data-filter-toggle]');
      this.filters = element.querySelector('[data-filters]');
      this.filterClose = element.querySelector('[data-filter-close]');
      this.sortSelect = element.querySelector('[data-sort-select]');
      this.filterAccordions = element.querySelectorAll('[data-filter-accordion]');
      
      this.init();
    }

    init() {
      // Filter toggle (mobile)
      if (this.filterToggle && this.filters) {
        this.filterToggle.addEventListener('click', () => this.openFilters());
        this.filterClose?.addEventListener('click', () => this.closeFilters());
      }

      // Sort select
      if (this.sortSelect) {
        this.sortSelect.addEventListener('change', () => this.handleSort());
      }

      // Filter accordions
      this.filterAccordions.forEach(accordion => {
        accordion.addEventListener('click', () => this.toggleAccordion(accordion));
      });
    }

    openFilters() {
      this.filters.hidden = false;
      requestAnimationFrame(() => {
        this.filters.classList.add('is-active');
      });
      document.body.style.overflow = 'hidden';
    }

    closeFilters() {
      this.filters.classList.remove('is-active');
      document.body.style.overflow = '';
      setTimeout(() => {
        this.filters.hidden = true;
      }, 300);
    }

    toggleAccordion(accordion) {
      const isExpanded = accordion.getAttribute('aria-expanded') === 'true';
      accordion.setAttribute('aria-expanded', !isExpanded);
    }

    handleSort() {
      const value = this.sortSelect.value;
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', value);
      window.location.href = url.toString();
    }
  }

  /* ==========================================================================
     Product Card Quick Add
     ========================================================================== */
  
  class ProductCard {
    constructor(element) {
      this.element = element;
      this.form = element.querySelector('.product-card__form');
      this.wishlistBtn = element.querySelector('[data-wishlist-add]');
      
      this.init();
    }

    init() {
      // Quick add form
      if (this.form) {
        this.form.addEventListener('submit', (e) => this.handleQuickAdd(e));
      }

      // Wishlist
      if (this.wishlistBtn) {
        this.wishlistBtn.addEventListener('click', () => this.toggleWishlist());
      }
    }

    async handleQuickAdd(e) {
      e.preventDefault();
      
      const formData = new FormData(this.form);
      
      try {
        const response = await fetch(window.routes.cart_add_url, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.status === 422) {
          console.error(result.description);
          return;
        }

        // Update cart count
        const cartCount = document.querySelectorAll('[data-cart-count]');
        const cartResponse = await fetch(window.routes.cart_url + '.js');
        const cart = await cartResponse.json();
        
        cartCount.forEach(el => {
          el.textContent = cart.item_count;
        });

        // Open cart drawer
        window.cartDrawer?.open();
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }

    toggleWishlist() {
      this.wishlistBtn.classList.toggle('is-active');
      // Wishlist logic can be extended here
    }
  }

  /* ==========================================================================
     Initialize
     ========================================================================== */
  
  document.addEventListener('DOMContentLoaded', () => {
    // Announcement Bar
    const announcementBar = document.querySelector('[data-announcement-bar]');
    if (announcementBar && !sessionStorage.getItem('announcement-closed')) {
      new AnnouncementBar(announcementBar);
    }

    // Header
    const header = document.querySelector('[data-header]');
    if (header) {
      new Header(header);
    }

    // Cart Drawer
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    if (cartDrawer) {
      window.cartDrawer = new CartDrawer(cartDrawer);
    }

    // Hero Banner
    const heroBanner = document.querySelector('[data-hero-banner]');
    if (heroBanner) {
      new HeroBanner(heroBanner);
    }

    // Collection Filters
    const collectionGrid = document.querySelector('.collection-grid');
    if (collectionGrid) {
      new CollectionFilters(collectionGrid);
    }

    // Product Cards
    document.querySelectorAll('[data-product-card]').forEach(card => {
      new ProductCard(card);
    });

    // Lazy load images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  });
})();
