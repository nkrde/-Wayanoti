/* --- VERTICAL SCROLL PROGRESS NAVIGATOR JAVASCRIPT --- */

(function() {
  function isProjectPage() {
    const path = window.location.pathname;
    return path.includes('waya') || /p\d+/.test(path);
  }

  function initNavigator() {
    if (document.querySelector('.progress-ticks-container')) return;

    console.log("Initializing draggable scroll progress bar...");

    // 1. Create Container
    const container = document.createElement('div');
    container.className = 'progress-ticks-container';

    // 2. Create Track Line
    const trackLine = document.createElement('div');
    trackLine.className = 'progress-track-line';
    
    const trackFill = document.createElement('div');
    trackFill.className = 'progress-track-fill';
    trackLine.appendChild(trackFill);

    // 3. Create 3 Ticks (Top, Middle, End)
    const topDot = document.createElement('div');
    topDot.className = 'tick-dot top-dot active';
    topDot.setAttribute('data-depth', '0');

    const middleDot = document.createElement('div');
    middleDot.className = 'tick-dot middle-dot';
    middleDot.setAttribute('data-depth', '50');

    const endDot = document.createElement('div');
    endDot.className = 'tick-dot end-dot';
    endDot.setAttribute('data-depth', '100');

    trackLine.appendChild(topDot);
    trackLine.appendChild(middleDot);
    trackLine.appendChild(endDot);
    container.appendChild(trackLine);
    document.body.appendChild(container);

    // 4. Drag & Click Scroll Logic
    function handleDrag(clientY) {
      const rect = trackLine.getBoundingClientRect();
      const dragY = clientY - rect.top;
      const percentage = Math.min(Math.max(0, dragY / rect.height), 1);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, percentage * docHeight);
    }

    let isDragging = false;

    // Mouse events
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleDrag(e.clientY);
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        handleDrag(e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events
    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      handleDrag(e.touches[0].clientY);
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) {
        handleDrag(e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Click events directly on the dots
    [topDot, middleDot, endDot].forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent container mousedown drag triggering
        const depth = parseInt(dot.getAttribute('data-depth'));
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({
          top: (depth / 100) * docHeight,
          behavior: 'smooth'
        });
      });
    });

    // 5. Scroll Event Listener to track scroll depth and update highlights
    function updateScrollState() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      // Update the track fill height
      if (trackFill) {
        trackFill.style.height = `${scrollPercent}%`;
      }

      // Activate the closest dot based on scroll zones
      if (scrollPercent < 33) {
        topDot.classList.add('active');
        middleDot.classList.remove('active');
        endDot.classList.remove('active');
      } else if (scrollPercent >= 33 && scrollPercent < 66) {
        topDot.classList.remove('active');
        middleDot.classList.add('active');
        endDot.classList.remove('active');
      } else {
        topDot.classList.remove('active');
        middleDot.classList.remove('active');
        endDot.classList.add('active');
      }
    }

    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    updateScrollState();
  }

  function injectOrangeButton() {
    const paragraphs = document.querySelectorAll('p.framer-text');
    for (const p of paragraphs) {
      if (p.textContent.includes('Lodding..........') || p.textContent.includes('Loading..........')) {
        // Correct the spelling typo if it exists
        if (p.textContent.includes('Lodding..........')) {
          p.innerHTML = p.innerHTML.replace('Lodding..........', 'Loading..........');
        }
        
        // Remove old orange button if present
        const oldBtn = p.querySelector('.orange-glowing-btn');
        if (oldBtn) oldBtn.remove();
        
        if (!p.querySelector('.orange-glowing-dot')) {
          const dot = document.createElement('span');
          dot.className = 'orange-glowing-dot';
          p.insertBefore(dot, p.firstChild);
        }
      }
    }
  }

  // --- THEME TOGGLE FUNCTIONALITY ---
  const sunSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
    updateToggleButtons();
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const targetTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme', targetTheme);
    applyTheme(targetTheme);
  }

  function updateToggleButtons() {
    const isDark = document.body.classList.contains('dark-mode');
    const buttons = document.querySelectorAll('.theme-toggle-btn');
    buttons.forEach(btn => {
      btn.innerHTML = isDark ? sunSVG : moonSVG;
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  function injectThemeToggles() {
    const linkContainers = document.querySelectorAll('.framer-1a2xv6j, div[data-framer-name="links"]');
    linkContainers.forEach(container => {
      if (!container.querySelector('.theme-toggle-btn')) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle-btn';
        btn.type = 'button';
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleTheme();
        };
        container.appendChild(btn);
      }
    });
    updateToggleButtons();
  }

  function checkAndUpdateNavigator() {
    if (isProjectPage()) {
      if (!document.querySelector('.progress-ticks-container')) {
        initNavigator();
      }
    } else {
      const container = document.querySelector('.progress-ticks-container');
      if (container) container.remove();
    }
  }

  // Initial theme initialization
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  const observer = new MutationObserver(() => {
    runProtectedInjections();
  });

  function runProtectedInjections() {
    observer.disconnect();
    checkAndUpdateNavigator();
    injectOrangeButton();
    injectThemeToggles();
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  setInterval(() => {
    runProtectedInjections();
  }, 800);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runProtectedInjections();
    });
  } else {
    runProtectedInjections();
  }
})();
