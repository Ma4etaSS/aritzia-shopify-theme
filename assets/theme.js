/**
 * Aritzia Theme - Main JavaScript
 * Complete functionality for cart, navigation, products
 */

(function() {
  'use strict';

  // ========================
  // CART DRAWER
  // ========================
  
  const CartDrawer = {
    drawer: null,
    overlay: null,
    
    init() {
      this.drawer = document.querySelector('[data-cart-drawer]');
      if (!this.drawer) return;
      
      this.overlay = this.drawer.querySelector('[data-cart-overlay]');
      
      // Global open function
      window.openCartDrawer = () => this.open();
      window.closeCartDrawer = () => this.close();
      
      this.bindEvents();
    },
    
    bindEvents() {
      // Close button
      this.drawer.querySelectorAll('[data-cart-close]').forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });
      
      // Overlay click
      this.overlay?.addEventListener('click', () => this.close());
      
      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.drawer.classList.contains('is-open')) {
          this.close();
        }
      });
      
      // Cart icon clicks
      document.querySelectorAll('[data-cart-toggle]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });
      
      // Quantity controls
      this.drawer.addEventListener('click', (e) => {
        const minusBtn = e.target.closest('[data-quantity-minus]');
        const plusBtn = e.target.closest('[data-quantity-plus]');
        const removeBtn = e.target.closest('[data-remove-item]');
        
        if (minusBtn) this.updateQuantity(minusBtn.dataset.key, -1);
        if (plusBtn) this.updateQuantity(plusBtn.dataset.key, 1);
        if (removeBtn) this.removeItem(removeBtn.dataset.key);
      });
      
      // Quantity input change
      this.drawer.addEventListener('change', (e) => {
        if (e.target.matches('[data-quantity-input]')) {
          this.setQuantity(e.target.dataset.key, parseInt(e.target.value) || 1);
        }
      });
    },
    
    open() {
      this.drawer.classList.add('is-open');
      this.drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      this.refresh();
    },
    
    close() {
      this.drawer.classList.remove('is-open');
      this.drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },
    
    async updateQuantity(key, change) {
      const input = this.drawer.querySelector(`[data-quantity-input][data-key="${key}"]`);
      const newQuantity = Math.max(1, (parseInt(input.value) || 1) + change);
      await this.setQuantity(key, newQuantity);
    },
    
    async setQuantity(key, quantity) {
      this.drawer.classList.add('is-loading');
      
      try {
        const response = await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity })
        });
        
        if (response.ok) {
          await this.refresh();
        }
      } catch (error) {
        console.error('Error updating cart:', error);
      }
      
      this.drawer.classList.remove('is-loading');
    },
    
    async removeItem(key) {
      await this.setQuantity(key, 0);
    },
    
    async refresh() {
      try {
        const response = await fetch('/cart?view=drawer');
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newDrawer = doc.querySelector('[data-cart-drawer]');
        
        if (newDrawer) {
          // Update items
          const items = this.drawer.querySelector('[data-cart-items]');
          const newItems = newDrawer.querySelector('[data-cart-items]');
          if (items && newItems) {
            items.innerHTML = newItems.innerHTML;
          }
          
          // Update footer
          const footer = this.drawer.querySelector('[data-cart-footer]');
          const newFooter = newDrawer.querySelector('[data-cart-footer]');
          if (footer && newFooter) {
            footer.outerHTML = newFooter.outerHTML;
          } else if (!footer && newFooter) {
            this.drawer.querySelector('.cart-drawer__container').appendChild(
              document.importNode(newFooter, true)
            );
          } else if (footer && !newFooter) {
            footer.remove();
          }
          
          // Update count
          const count = newDrawer.querySelector('[data-cart-count]')?.textContent || '0';
          this.updateCartCounts(count);
        }
      } catch (error) {
        console.error('Error refreshing cart:', error);
        // Fallback: simple refresh
        const cartResponse = await fetch('/cart.js');
        const cart = await cartResponse.json();
        this.updateCartCounts(cart.item_count);
      }
    },
    
    updateCartCounts(count) {
      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? '' : 'none';
      });
    }
  };

  // ========================
  // MOBILE MENU
  // ========================
  
  const MobileMenu = {
    menu: null,
    
    init() {
      this.menu = document.querySelector('[data-mobile-menu]');
      if (!this.menu) return;
      
      this.bindEvents();
    },
    
    bindEvents() {
      // Open menu
      document.querySelectorAll('[data-menu-toggle]').forEach(btn => {
        btn.addEventListener('click', () => this.open());
      });
      
      // Close menu
      this.menu.querySelectorAll('[data-menu-close]').forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });
      
      // Accordions
      this.menu.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => this.toggleAccordion(trigger));
      });
      
      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.menu.classList.contains('is-open')) {
          this.close();
        }
      });
    },
    
    open() {
      this.menu.classList.add('is-open');
      this.menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    },
    
    close() {
      this.menu.classList.remove('is-open');
      this.menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },
    
    toggleAccordion(trigger) {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const content = trigger.nextElementSibling;
      
      trigger.setAttribute('aria-expanded', !isExpanded);
      content.setAttribute('aria-hidden', isExpanded);
    }
  };

  // ========================
  // HEADER
  // ========================
  
  const Header = {
    header: null,
    lastScrollY: 0,
    
    init() {
      this.header = document.querySelector('.header');
      if (!this.header) return;
      
      this.bindEvents();
      this.handleScroll();
    },
    
    bindEvents() {
      // Scroll handling
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Mega menu hover
      this.header.querySelectorAll('[data-mega-menu-trigger]').forEach(trigger => {
        const megaMenu = trigger.nextElementSibling;
        if (!megaMenu) return;
        
        trigger.addEventListener('mouseenter', () => {
          megaMenu.classList.add('is-visible');
          trigger.setAttribute('aria-expanded', 'true');
        });
        
        trigger.parentElement.addEventListener('mouseleave', () => {
          megaMenu.classList.remove('is-visible');
          trigger.setAttribute('aria-expanded', 'false');
        });
      });
      
      // Search toggle
      this.header.querySelectorAll('[data-search-toggle]').forEach(btn => {
        btn.addEventListener('click', () => this.toggleSearch());
      });
    },
    
    handleScroll() {
      const scrollY = window.scrollY;
      
      // Add scrolled class
      if (scrollY > 50) {
        this.header.classList.add('header--scrolled');
      } else {
        this.header.classList.remove('header--scrolled');
      }
      
      // Hide/show on scroll
      if (scrollY > this.lastScrollY && scrollY > 200) {
        this.header.classList.add('header--hidden');
      } else {
        this.header.classList.remove('header--hidden');
      }
      
      this.lastScrollY = scrollY;
    },
    
    toggleSearch() {
      const searchOverlay = document.querySelector('[data-search-overlay]');
      if (searchOverlay) {
        searchOverlay.classList.toggle('is-visible');
        if (searchOverlay.classList.contains('is-visible')) {
          searchOverlay.querySelector('input')?.focus();
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    }
  };

  // ========================
  // HERO SLIDESHOW
  // ========================
  
  const HeroSlideshow = {
    init() {
      document.querySelectorAll('[data-hero-slideshow]').forEach(slideshow => {
        this.initSlideshow(slideshow);
      });
    },
    
    initSlideshow(slideshow) {
      const slides = slideshow.querySelectorAll('.hero__slide');
      const dots = slideshow.querySelectorAll('[data-slide]');
      const prevBtn = slideshow.querySelector('[data-prev]');
      const nextBtn = slideshow.querySelector('[data-next]');
      const playPauseBtn = slideshow.querySelector('[data-play-pause]');
      
      if (slides.length <= 1) return;
      
      let currentIndex = 0;
      let interval;
      let isPlaying = slideshow.dataset.autoplay === 'true';
      const speed = parseInt(slideshow.dataset.speed) || 5000;
      
      const goToSlide = (index) => {
        slides.forEach((slide, i) => {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === index);
          dot.setAttribute('aria-current', i === index);
        });
        currentIndex = index;
      };
      
      const nextSlide = () => {
        goToSlide((currentIndex + 1) % slides.length);
      };
      
      const prevSlide = () => {
        goToSlide((currentIndex - 1 + slides.length) % slides.length);
      };
      
      const play = () => {
        isPlaying = true;
        interval = setInterval(nextSlide, speed);
        if (playPauseBtn) {
          playPauseBtn.setAttribute('aria-label', 'Pause slideshow');
          playPauseBtn.classList.add('is-playing');
        }
      };
      
      const pause = () => {
        isPlaying = false;
        clearInterval(interval);
        if (playPauseBtn) {
          playPauseBtn.setAttribute('aria-label', 'Play slideshow');
          playPauseBtn.classList.remove('is-playing');
        }
      };
      
      // Event listeners
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          goToSlide(index);
          pause();
        });
      });
      
      prevBtn?.addEventListener('click', () => {
        prevSlide();
        pause();
      });
      
      nextBtn?.addEventListener('click', () => {
        nextSlide();
        pause();
      });
      
      playPauseBtn?.addEventListener('click', () => {
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      });
      
      // Touch/swipe support
      let touchStartX = 0;
      let touchEndX = 0;
      
      slideshow.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      slideshow.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          pause();
        }
      }, { passive: true });
      
      // Pause on hover
      slideshow.addEventListener('mouseenter', pause);
      slideshow.addEventListener('mouseleave', () => {
        if (isPlaying) play();
      });
      
      // Start autoplay
      if (isPlaying) {
        play();
      }
    }
  };

  // ========================
  // ANNOUNCEMENT BAR
  // ========================
  
  const AnnouncementBar = {
    init() {
      const bar = document.querySelector('[data-announcement-bar]');
      if (!bar) return;
      
      const closeBtn = bar.querySelector('[data-announcement-close]');
      
      // Check if already dismissed
      if (sessionStorage.getItem('announcementDismissed') === 'true') {
        bar.remove();
        document.documentElement.style.setProperty('--announcement-height', '0px');
        return;
      }
      
      closeBtn?.addEventListener('click', () => {
        bar.style.transform = 'translateY(-100%)';
        bar.style.opacity = '0';
        
        setTimeout(() => {
          bar.remove();
          document.documentElement.style.setProperty('--announcement-height', '0px');
          sessionStorage.setItem('announcementDismissed', 'true');
        }, 300);
      });
    }
  };

  // ========================
  // LAZY LOADING
  // ========================
  
  const LazyLoading = {
    init() {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
              }
              img.classList.add('is-loaded');
              observer.unobserve(img);
            }
          });
        }, { rootMargin: '100px' });
        
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
          observer.observe(img);
        });
      }
    }
  };

  // ========================
  // QUICK ADD
  // ========================
  
  const QuickAdd = {
    init() {
      document.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-quick-add]');
        if (!btn) return;
        
        e.preventDefault();
        
        const variantId = btn.dataset.quickAdd;
        const textEl = btn.querySelector('span') || btn;
        const originalText = textEl.textContent;
        
        btn.disabled = true;
        textEl.textContent = 'Adding...';
        
        try {
          const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, quantity: 1 })
          });
          
          if (response.ok) {
            textEl.textContent = 'Added!';
            
            // Update cart count
            const cartResponse = await fetch('/cart.js');
            const cart = await cartResponse.json();
            document.querySelectorAll('[data-cart-count]').forEach(el => {
              el.textContent = cart.item_count;
              el.style.display = cart.item_count > 0 ? '' : 'none';
            });
            
            // Open cart drawer
            if (typeof window.openCartDrawer === 'function') {
              window.openCartDrawer();
            }
          } else {
            throw new Error('Failed to add to cart');
          }
        } catch (error) {
          textEl.textContent = 'Error';
          console.error(error);
        }
        
        setTimeout(() => {
          textEl.textContent = originalText;
          btn.disabled = false;
        }, 1500);
      });
    }
  };

  // ========================
  // PRODUCT CARD HOVER
  // ========================
  
  const ProductCards = {
    init() {
      // Color swatches on product cards
      document.querySelectorAll('.product-card__swatches').forEach(swatches => {
        swatches.querySelectorAll('[data-color]').forEach(swatch => {
          swatch.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = swatch.closest('.product-card');
            const color = swatch.dataset.color;
            const imageUrl = swatch.dataset.image;
            
            // Update image
            const mainImage = card.querySelector('.product-card__image--primary');
            if (mainImage && imageUrl) {
              mainImage.src = imageUrl;
            }
            
            // Update active state
            swatches.querySelectorAll('[data-color]').forEach(s => s.classList.remove('is-active'));
            swatch.classList.add('is-active');
          });
        });
      });
    }
  };

  // ========================
  // ANIMATIONS
  // ========================
  
  const Animations = {
    init() {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        document.querySelectorAll('[data-animate]').forEach(el => {
          observer.observe(el);
        });
      }
    }
  };

  // ========================
  // QUANTITY CONTROLS
  // ========================
  
  const QuantityControls = {
    init() {
      document.addEventListener('click', (e) => {
        const minus = e.target.closest('[data-quantity-minus]');
        const plus = e.target.closest('[data-quantity-plus]');
        
        if (minus || plus) {
          const container = (minus || plus).closest('[data-quantity]');
          const input = container?.querySelector('[data-quantity-input]');
          
          if (input) {
            let value = parseInt(input.value) || 1;
            const min = parseInt(input.min) || 1;
            const max = parseInt(input.max) || 99;
            
            if (minus && value > min) {
              input.value = value - 1;
            } else if (plus && value < max) {
              input.value = value + 1;
            }
            
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    }
  };

  // ========================
  // SEARCH
  // ========================
  
  const Search = {
    init() {
      const searchInput = document.querySelector('[data-search-input]');
      const searchResults = document.querySelector('[data-search-results]');
      
      if (!searchInput || !searchResults) return;
      
      let debounceTimer;
      
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.search(searchInput.value, searchResults);
        }, 300);
      });
      
      // Close on escape
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          searchResults.innerHTML = '';
          searchResults.classList.remove('is-visible');
        }
      });
    },
    
    async search(query, container) {
      if (query.length < 2) {
        container.innerHTML = '';
        container.classList.remove('is-visible');
        return;
      }
      
      try {
        const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`);
        const data = await response.json();
        
        if (data.resources?.results?.products?.length) {
          container.innerHTML = data.resources.results.products.map(product => `
            <a href="${product.url}" class="search-result">
              <img src="${product.featured_image?.url || ''}" alt="${product.title}" class="search-result__image">
              <div class="search-result__info">
                <p class="search-result__title">${product.title}</p>
                <p class="search-result__price">${product.price}</p>
              </div>
            </a>
          `).join('');
          container.classList.add('is-visible');
        } else {
          container.innerHTML = '<p class="search-result__empty">No products found</p>';
          container.classList.add('is-visible');
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  // ========================
  // ACCORDIONS
  // ========================
  
  const Accordions = {
    init() {
      document.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => {
          const content = trigger.nextElementSibling;
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          
          trigger.setAttribute('aria-expanded', !isExpanded);
          
          if (content) {
            if (isExpanded) {
              content.style.maxHeight = '0';
              content.setAttribute('aria-hidden', 'true');
            } else {
              content.style.maxHeight = content.scrollHeight + 'px';
              content.setAttribute('aria-hidden', 'false');
            }
          }
        });
      });
    }
  };

  // ========================
  // WISHLIST (Local Storage)
  // ========================
  
  const Wishlist = {
    storageKey: 'aritzia_wishlist',
    
    init() {
      this.updateUI();
      
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-wishlist-add]');
        if (btn) {
          e.preventDefault();
          const productId = btn.dataset.wishlistAdd;
          this.toggle(productId);
          btn.classList.toggle('is-active');
        }
      });
    },
    
    getItems() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
      } catch {
        return [];
      }
    },
    
    toggle(productId) {
      const items = this.getItems();
      const index = items.indexOf(productId);
      
      if (index > -1) {
        items.splice(index, 1);
      } else {
        items.push(productId);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.updateUI();
    },
    
    updateUI() {
      const items = this.getItems();
      const count = items.length;
      
      document.querySelectorAll('[data-wishlist-count]').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? '' : 'none';
      });
      
      document.querySelectorAll('[data-wishlist-add]').forEach(btn => {
        const productId = btn.dataset.wishlistAdd;
        btn.classList.toggle('is-active', items.includes(productId));
      });
    }
  };

  // ========================
  // INITIALIZE
  // ========================
  
  document.addEventListener('DOMContentLoaded', () => {
    CartDrawer.init();
    MobileMenu.init();
    Header.init();
    HeroSlideshow.init();
    AnnouncementBar.init();
    LazyLoading.init();
    QuickAdd.init();
    ProductCards.init();
    Animations.init();
    QuantityControls.init();
    Search.init();
    Accordions.init();
    Wishlist.init();
    
    // Remove loading class
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  });

  // Handle page transitions
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // Page was restored from cache
      CartDrawer.init();
    }
  });

})();
