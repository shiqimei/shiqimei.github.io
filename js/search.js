/*
 * Search - Command Palette
 */

(function() {
  // Search index - will be populated from posts
  const searchIndex = [];

  // DOM elements
  let modal, input, results;

  // Initialize search
  function init() {
    createModal();
    buildIndex();
    bindEvents();
  }

  // Create modal HTML
  function createModal() {
    const modalHTML = `
      <div class="search-modal" id="searchModal">
        <div class="search-backdrop"></div>
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input type="text" class="search-input" id="searchInput" placeholder="Search posts..." autocomplete="off">
            <kbd class="search-kbd">ESC</kbd>
          </div>
          <div class="search-results" id="searchResults"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    modal = document.getElementById('searchModal');
    input = document.getElementById('searchInput');
    results = document.getElementById('searchResults');
  }

  // Build search index from timeline items
  function buildIndex() {
    const items = document.querySelectorAll('.timeline-item');
    items.forEach(item => {
      const titleEl = item.querySelector('.timeline-title a');
      const excerptEl = item.querySelector('.timeline-excerpt');
      const dateEl = item.querySelector('.timeline-date');

      if (titleEl) {
        searchIndex.push({
          title: titleEl.textContent.trim(),
          excerpt: excerptEl ? excerptEl.textContent.trim() : '',
          date: dateEl ? dateEl.textContent.trim() : '',
          url: titleEl.getAttribute('href')
        });
      }
    });
  }

  // Bind keyboard and click events
  function bindEvents() {
    // Cmd/Ctrl + K to open
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openModal();
      }
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // Click backdrop to close
    modal.querySelector('.search-backdrop').addEventListener('click', closeModal);

    // Search on input
    input.addEventListener('input', debounce(search, 150));

    // Keyboard navigation
    input.addEventListener('keydown', handleNavigation);

    // Search button click
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }
  }

  // Open modal
  function openModal() {
    modal.classList.add('active');
    input.value = '';
    input.focus();
    renderResults(searchIndex);
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Search function
  function search() {
    const query = input.value.toLowerCase().trim();

    if (!query) {
      renderResults(searchIndex);
      return;
    }

    const filtered = searchIndex.filter(item => {
      return item.title.toLowerCase().includes(query) ||
             item.excerpt.toLowerCase().includes(query);
    });

    renderResults(filtered, query);
  }

  // Render results with highlighting
  function renderResults(items, query = '') {
    if (items.length === 0) {
      results.innerHTML = '<div class="search-empty">No results found</div>';
      return;
    }

    results.innerHTML = items.map((item, index) => `
      <a href="${item.url}" class="search-result-item${index === 0 ? ' active' : ''}">
        <div class="search-result-title">${highlight(item.title, query)}</div>
        <div class="search-result-excerpt">${highlight(item.excerpt, query)}</div>
        <div class="search-result-date">${item.date}</div>
      </a>
    `).join('');
  }

  // Highlight matching text
  function highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Escape regex special chars
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Keyboard navigation
  function handleNavigation(e) {
    const items = results.querySelectorAll('.search-result-item');
    const active = results.querySelector('.search-result-item.active');
    let index = Array.from(items).indexOf(active);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      index = Math.min(index + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      index = Math.max(index - 1, 0);
    } else if (e.key === 'Enter' && active) {
      e.preventDefault();
      window.location.href = active.getAttribute('href');
      return;
    } else {
      return;
    }

    items.forEach(item => item.classList.remove('active'));
    items[index]?.classList.add('active');
    items[index]?.scrollIntoView({ block: 'nearest' });
  }

  // Debounce helper
  function debounce(fn, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
