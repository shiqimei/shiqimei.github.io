// Language Toggle for bilingual posts
(function() {
  const toggle = document.getElementById('langToggle');
  const langEn = document.querySelectorAll('.lang-en');
  const langZh = document.querySelectorAll('.lang-zh');

  // Only show toggle if there's bilingual content
  if (langEn.length === 0 && langZh.length === 0) {
    return;
  }

  // Show the toggle
  toggle.classList.add('visible');

  // Get saved language preference or default to 'en'
  const savedLang = localStorage.getItem('preferredLang') || 'en';

  // Set initial state
  setLanguage(savedLang);

  // Add click handlers
  toggle.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
      localStorage.setItem('preferredLang', lang);
    });
  });

  function setLanguage(lang) {
    // Update button states
    toggle.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Show/hide content
    langEn.forEach(el => el.classList.toggle('active', lang === 'en'));
    langZh.forEach(el => el.classList.toggle('active', lang === 'zh'));
  }
})();
