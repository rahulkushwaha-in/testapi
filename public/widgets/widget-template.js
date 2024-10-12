// public/widgets/widget-template.js
(function () {
  const CLIENT_ID = '%%CLIENT_ID%%'; // Replaced server-side
  const API_URL = '%%API_URL%%'; // Replaced server-side

  // Function to fetch definition of a term
  async function fetchDefinition(term) {
    try {
      const response = await fetch(`${API_URL}/api/terms/definitions/${term}`, {
        headers: {
          'x-client-id': CLIENT_ID,
        },
      });
      if (!response.ok) {
        throw new Error('Definition not found');
      }
      const data = await response.json();
      return data.definition;
    } catch (error) {
      console.error('Error fetching definition:', error);
      return 'Definition not available.';
    }
  }

  // Function to display tooltip using Tippy.js
  async function showTooltip(event) {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length === 0) return;

    // Fetch definition
    const definition = await fetchDefinition(selectedText.toLowerCase());

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.innerHTML = `<strong>${selectedText}</strong>: ${definition}`;

    // Initialize Tippy.js tooltip
    tippy(document.body, {
      content: tooltip.innerHTML,
      trigger: 'manual',
      placement: 'top',
      allowHTML: true,
      interactive: true,
      onShow(instance) {
        // Position tooltip near the selection
        const range = window.getSelection().getRangeAt(0);
        const rect = range.getBoundingClientRect();
        instance.popper.style.left = `${rect.left + window.scrollX}px`;
        instance.popper.style.top = `${rect.top + window.scrollY - instance.popper.offsetHeight}px`;
      },
    }).show();
  }

  // Function to load Tippy.js dynamically
  function loadTippy() {
    return new Promise((resolve, reject) => {
      if (window.tippy) {
        resolve();
        return;
      }

      const popperScript = document.createElement('script');
      popperScript.src = 'https://unpkg.com/@popperjs/core@2';
      popperScript.onload = () => {
        const tippyScript = document.createElement('script');
        tippyScript.src = 'https://unpkg.com/tippy.js@6';
        tippyScript.onload = () => {
          resolve();
        };
        tippyScript.onerror = () => {
          reject(new Error('Failed to load Tippy.js'));
        };
        document.head.appendChild(tippyScript);
      };
      popperScript.onerror = () => {
        reject(new Error('Failed to load Popper.js'));
      };
      document.head.appendChild(popperScript);
    });
  }

  // Function to handle selection events
  function handleSelection(event) {
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
      showTooltip(event);
    }
  }

  // Initialize the widget
  (async function init() {
    try {
      await loadTippy();

      // Listen for mouseup events to detect text selection
      document.addEventListener('mouseup', handleSelection);

      // Optional: Listen for touchend events for mobile devices
      document.addEventListener('touchend', handleSelection);
    } catch (error) {
      console.error('Widget initialization error:', error);
    }
  })();
})();
