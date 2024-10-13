// public/widgets/widget-template.js
(function () {
  const CLIENT_ID = '%%CLIENT_ID%%'; // Replaced server-side
  const API_URL = '%%API_URL%%'; // Replaced server-side

  // Cache to store fetched definitions to minimize API calls
  const definitionCache = {};

  // Function to fetch definition of a term
  async function fetchDefinition(term) {
    // Check if definition is already cached
    if (definitionCache[term]) {
      return definitionCache[term];
    }

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
      definitionCache[term] = data.definition; // Cache the definition
      return data.definition;
    } catch (error) {
      console.error('Error fetching definition:', error);
      return 'Definition not available.';
    }
  }

  // Function to display tooltip using Tippy.js
  async function showTooltip(event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Check if a single word is selected
    if (selectedText.split(' ').length === 1 && selectedText.length > 0) {
      const term = selectedText.toLowerCase();

      // Get the range of the selection
      const range = selection.getRangeAt(0);

      // Create a span to wrap the selected text
      const span = document.createElement('span');
      span.className = 'tech-term';
      span.textContent = selectedText;

      // Replace the selected text with the span
      range.deleteContents();
      range.insertNode(span);

      // Clear the selection to prevent multiple inserts
      selection.removeAllRanges();
      selection.addRange(range);

      // Initialize Tippy.js on the newly created span
      tippy(span, {
        content: 'Loading...',
        allowHTML: true,
        interactive: true,
        theme: 'light-border',
        placement: 'auto',
        arrow: true,
        delay: [100, 100],
        onShow(instance) {
          // Fetch the definition and update the tooltip content
          fetchDefinition(term).then((definition) => {
            instance.setContent(`<strong>${selectedText}</strong>: ${definition}`);
          });
        },
      });

      // Programmatically show the tooltip
      span._tippy.show();

      // Automatically hide the tooltip after 5 seconds
      setTimeout(() => {
        span._tippy.hide();
      }, 5000);
    }
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
