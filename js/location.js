/**
 * Store Location Tabs & Dynamic Map Switching
 */
function initStoreTabs() {
  const tabButtons = document.querySelectorAll('.store-tab-btn');
  const storeCards = document.querySelectorAll('.store-info-card');
  const mapIframe = document.querySelector('.map-iframe');

  const mapUrls = {
    mumbai: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.9142750694116!2d72.83151897593257!3d18.935105282240974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1ddb3f07297%3A0xbce5c79294d1f211!2sFort%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1714560000000!5m2!1sen!2sin",

  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStore = btn.getAttribute('data-store');

      tabButtons.forEach(b => b.classList.remove('active'));
      storeCards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeCard = document.getElementById(`store-${targetStore}`);
      if (activeCard) activeCard.classList.add('active');

      if (mapIframe && mapUrls[targetStore]) {
        mapIframe.src = mapUrls[targetStore];
      }
    });
  });
}