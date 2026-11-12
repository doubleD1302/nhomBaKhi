// Main entry point
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AppController.init();
    });
  } else {
    window.AppController.init();
  }
})();
