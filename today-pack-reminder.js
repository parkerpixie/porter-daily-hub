(() => {
  const PACKING_TITLE_PATTERN = /\b(pack|packing)\b/i;

  const addStyles = () => {
    if (document.getElementById('calendarPackingSpotlightStyles')) return;
    const style = document.createElement('style');
    style.id = 'calendarPackingSpotlightStyles';
    style.textContent = `
      .calendar-packing-spotlight {
        border: 5px solid #1b1722;
        box-shadow: 10px 10px 0 #1b1722;
        background:
          radial-gradient(circle at 90% 10%, rgba(255,255,255,.62) 0 7%, transparent 7.5%),
          linear-gradient(135deg, #fff430 0 63%, #9c59d1 63% 100%);
        padding: clamp(20px, 4vw, 34px);
        margin: 24px 0 30px;
        position: relative;
        overflow: hidden;
      }
      .calendar-packing-spotlight::after {
        content: 'PACK!';
        position: absolute;
        right: -8px;
        top: -14px;
        font-family: 'Bangers', system-ui, sans-serif;
        font-size: clamp(4.4rem, 11vw, 8.5rem);
        line-height: 1;
        color: rgba(27, 23, 34, .12);
        transform: rotate(7deg);
        pointer-events: none;
      }
      .calendar-packing-kicker {
        display: inline-block;
        border: 3px solid #1b1722;
        background: #fff;
        padding: 5px 10px;
        font-weight: 1000;
        letter-spacing: .08em;
        margin-bottom: 12px;
      }
      .calendar-packing-spotlight h3 {
        position: relative;
        z-index: 1;
        margin: 0;
        font-family: 'Bangers', system-ui, sans-serif;
        font-size: clamp(2.6rem, 7vw, 5.5rem);
        letter-spacing: .025em;
        line-height: .95;
        max-width: 820px;
      }
      .calendar-packing-time {
        position: relative;
        z-index: 1;
        display: block;
        margin: 12px 0 18px;
        font-size: clamp(1.15rem, 2.5vw, 1.65rem);
        font-weight: 1000;
      }
      .calendar-packing-spotlight p {
        position: relative;
        z-index: 1;
        max-width: 720px;
        margin: 0 0 18px;
        font-size: 1.05rem;
        font-weight: 850;
      }
      .calendar-packing-button {
        position: relative;
        z-index: 2;
        display: inline-block;
        border: 4px solid #1b1722;
        background: #fff;
        color: #1b1722;
        box-shadow: 6px 6px 0 #1b1722;
        padding: 12px 18px;
        font: 1000 1rem/1 'Nunito', system-ui, sans-serif;
        text-decoration: none;
        cursor: pointer;
      }
      .calendar-packing-button:hover,
      .calendar-packing-button:focus-visible {
        transform: translate(-2px, -2px);
        box-shadow: 8px 8px 0 #1b1722;
      }
      .event-card.is-packing-event {
        background: #fff430;
        border-width: 4px;
      }
      .event-card.is-packing-event .event-title::before { content: '🧳 '; }
    `;
    document.head.appendChild(style);
  };

  const openPackingList = () => {
    const packingButton = document.querySelector('[data-view="packing"]');
    if (packingButton) packingButton.click();
    window.setTimeout(() => {
      document.getElementById('packingView')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 20);
  };

  const findPackingEventCard = () => Array.from(document.querySelectorAll('#dailyTimeline .event-card')).find((card) =>
    PACKING_TITLE_PATTERN.test(card.querySelector('.event-title')?.textContent || '')
  );

  const syncPackingSpotlight = () => {
    const existing = document.getElementById('calendarPackingSpotlight');
    const eventCard = findPackingEventCard();

    document.querySelectorAll('#dailyTimeline .event-card').forEach((card) => {
      const isPacking = PACKING_TITLE_PATTERN.test(card.querySelector('.event-title')?.textContent || '');
      card.classList.toggle('is-packing-event', isPacking);
    });

    if (!eventCard) {
      existing?.remove();
      return;
    }

    const title = eventCard.querySelector('.event-title')?.textContent?.trim() || 'Packing';
    const time = eventCard.querySelector('.event-time')?.textContent?.trim() || '';

    if (existing?.dataset.title === title && existing?.dataset.time === time) return;
    existing?.remove();
    addStyles();

    const card = document.createElement('section');
    card.id = 'calendarPackingSpotlight';
    card.className = 'calendar-packing-spotlight';
    card.dataset.title = title;
    card.dataset.time = time;
    card.setAttribute('aria-label', `${title} packing reminder`);
    card.innerHTML = `
      <span class="calendar-packing-kicker">TODAY'S MAIN QUEST</span>
      <h3>${title.replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[character]))}</h3>
      <span class="calendar-packing-time">${time}</span>
      <p>Use the checklist while items go into the bag. When every item is checked, Mom and Dad will be notified.</p>
      <button type="button" class="calendar-packing-button">OPEN PACKING LIST →</button>
    `;
    card.querySelector('.calendar-packing-button').addEventListener('click', openPackingList);

    const nowPanel = document.querySelector('#dailyView .now-panel');
    if (nowPanel) nowPanel.insertAdjacentElement('afterend', card);
  };

  const start = () => {
    syncPackingSpotlight();
    const timeline = document.getElementById('dailyTimeline');
    if (!timeline) return;
    new MutationObserver(syncPackingSpotlight).observe(timeline, { childList: true, subtree: true, characterData: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
