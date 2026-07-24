(() => {
  const TIME_ZONE = 'America/Chicago';
  const ACTIVE_DATE = '2026-07-24';
  const STORAGE_KEY = `porterPackReminder:${ACTIVE_DATE}`;

  const localDateKey = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  const addStyles = () => {
    if (document.getElementById('todayPackReminderStyles')) return;
    const style = document.createElement('style');
    style.id = 'todayPackReminderStyles';
    style.textContent = `
      .pack-reminder-card {
        border: 3px solid #1b1722;
        box-shadow: 6px 6px 0 #1b1722;
        background: linear-gradient(135deg, #fff430 0 68%, #9c59d1 68% 100%);
        padding: 16px;
        margin-bottom: 14px;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 14px;
        align-items: center;
      }
      .pack-reminder-card.is-complete { opacity: .68; }
      .pack-reminder-check {
        width: 30px;
        height: 30px;
        accent-color: #9c59d1;
        cursor: pointer;
      }
      .pack-reminder-copy strong {
        display: block;
        font-family: 'Bangers', system-ui, sans-serif;
        font-size: clamp(1.45rem, 3vw, 2rem);
        letter-spacing: .03em;
        line-height: 1;
      }
      .pack-reminder-copy p { margin: 6px 0 12px; font-weight: 800; }
      .pack-reminder-link {
        display: inline-block;
        border: 3px solid #1b1722;
        background: #fff;
        color: #1b1722;
        box-shadow: 4px 4px 0 #1b1722;
        padding: 9px 13px;
        font-weight: 900;
        text-decoration: none;
        cursor: pointer;
      }
      .pack-reminder-link:hover,
      .pack-reminder-link:focus-visible { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 #1b1722; }
      @media (max-width: 560px) {
        .pack-reminder-card { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  };

  const openPackingList = () => {
    const packingButton = document.querySelector('[data-view="packing"]');
    if (packingButton) packingButton.click();
    document.getElementById('packingView')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const insertReminder = () => {
    if (localDateKey() !== ACTIVE_DATE) return;
    if (document.getElementById('todayPackReminder')) return;

    const morningPanel = Array.from(document.querySelectorAll('.time-panel')).find((panel) =>
      /morning/i.test(panel.querySelector('h3')?.textContent || '')
    );
    const target = morningPanel?.querySelector('.panel-content');
    if (!target) return;

    addStyles();
    const checked = window.localStorage.getItem(STORAGE_KEY) === 'done';
    const card = document.createElement('div');
    card.id = 'todayPackReminder';
    card.className = `pack-reminder-card${checked ? ' is-complete' : ''}`;
    card.innerHTML = `
      <input class="pack-reminder-check" type="checkbox" ${checked ? 'checked' : ''} aria-label="Mark packing complete">
      <div class="pack-reminder-copy">
        <strong>${checked ? 'PACKING COMPLETE!' : 'PACK FOR THE WEEKEND'}</strong>
        <p>${checked ? 'Quest cleared. Nice work.' : 'Use the packing list so nothing important gets left behind.'}</p>
        <button type="button" class="pack-reminder-link">OPEN PACKING LIST →</button>
      </div>
    `;

    const checkbox = card.querySelector('.pack-reminder-check');
    const heading = card.querySelector('strong');
    const text = card.querySelector('p');
    checkbox.addEventListener('change', () => {
      window.localStorage.setItem(STORAGE_KEY, checkbox.checked ? 'done' : 'open');
      card.classList.toggle('is-complete', checkbox.checked);
      heading.textContent = checkbox.checked ? 'PACKING COMPLETE!' : 'PACK FOR THE WEEKEND';
      text.textContent = checkbox.checked ? 'Quest cleared. Nice work.' : 'Use the packing list so nothing important gets left behind.';
    });
    card.querySelector('.pack-reminder-link').addEventListener('click', openPackingList);

    target.prepend(card);
  };

  const start = () => {
    insertReminder();
    const timeline = document.getElementById('dailyTimeline');
    if (!timeline) return;
    new MutationObserver(insertReminder).observe(timeline, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
