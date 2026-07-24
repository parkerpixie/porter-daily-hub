(() => {
  const SOURCE = 'https://mymorningintelligencereport.netlify.app/';
  const TIME_ZONE = 'America/Chicago';

  // This mirrors the Morning Intelligence Report's matched reflection-card pool.
  // Keeping the small index here avoids a cross-origin JSON request while the
  // actual card images still come from the Morning Report's published assets.
  const CARD_LIBRARY = [
    ['badger','Badger','I stay grounded'],
    ['beaver','Beaver','I shape my environment'],
    ['bee','Bee','I release overwork'],
    ['brown-bear','Brown Bear','I honor rest'],
    ['butterfly','Butterfly','I trust my transformation'],
    ['capybara','Capybara','Calm Presence over Deregulated Chaos'],
    ['cow','Cow','I remain steady'],
    ['deer','Deer','I move with grace'],
    ['dog','Dog','Loyalty is sacred'],
    ['dolphin','Dolphin','Two things can be true'],
    ['dragonfly','Dragonfly','I allow clarity to guide me'],
    ['eagle','Eagle','I rise above reactive emotion'],
    ['elephant','Elephant','I rise above reactive emotion'],
    ['flamingo','Flamingo','I honor space in stillness'],
    ['fox','Fox','I trust my instincts'],
    ['frog','Frog','I simplify before I strategize'],
    ['hawk','Hawk','What you focus on expands'],
    ['horse','Horse','You are not fenced in'],
    ['lizard','Lizard','I adapt without losing myself'],
    ['moose','Moose','I am allowed to take up space'],
    ['moth','Moth','I can exist in the in-between'],
    ['octopus','Octopus','I can pause, pivot and proceed'],
    ['otter','Otter','Joy is a form of wisdom'],
    ['owl','Owl','I move with awareness'],
    ['panther','Panther','I do not wait for permission'],
    ['peacock','Peacock',"I shine because I'm real"],
    ['seahorse','Seahorse','I anchor myself to what matters'],
    ['snake','Snake','I release what no longer fits'],
    ['squirrel','Squirrel','I notice what matters'],
    ['swan','Swan',"I listen for what's real"],
    ['turtle','Turtle','I remain steady'],
    ['whale','Whale','I welcome the peace that follows being seen'],
    ['wolf','Wolf','I honor independence and pack']
  ].map(([id, animal, message]) => ({
    id,
    animal,
    message,
    image: `assets/oracle/reflections/${id}.webp`
  }));

  const navButton = document.getElementById('sharedSkillNav');
  const view = document.getElementById('sharedSkillView');
  const image = document.getElementById('sharedSkillImage');
  const animal = document.getElementById('sharedSkillAnimal');
  const message = document.getElementById('sharedSkillMessage');
  const meaning = document.getElementById('sharedSkillMeaning');
  const practice = document.getElementById('sharedSkillPractice');
  const reset = document.getElementById('sharedSkillReset');
  const status = document.getElementById('sharedSkillStatus');
  const downloadButton = document.getElementById('downloadSharedSkill');
  const previousButton = document.getElementById('previousSharedCard');
  const nextButton = document.getElementById('nextSharedCard');
  const todayButton = document.getElementById('todaySharedCard');
  const exploreLabel = document.getElementById('sharedExploreLabel');

  if (!navButton || !view) return;

  const cards = CARD_LIBRARY;
  let todayCard = null;
  let currentIndex = 0;

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

  const hashString = (value) => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const selectDaily = (items) => items[hashString(`${localDateKey()}:spirit-animal-reflection`) % items.length];

  const wisdomFor = (card) => {
    const text = `${card.animal} ${card.message}`.toLowerCase();
    const exact = {
      peacock: {
        meaning: 'This card is about being real instead of making yourself smaller so other people feel comfortable. You are allowed to be visible, different, and fully yourself.',
        practice: ['Say what you actually think in one moment today, even if you say it calmly and briefly.', 'Enjoy something you genuinely like without apologizing or explaining why it is cool.', 'Notice one thing that makes you different and treat it as information, not a flaw.'],
        reset: 'You do not need to shrink yourself to belong. Being real is enough.'
      },
      capybara: {
        meaning: 'Calm does not mean nothing is happening. It means you are giving your brain enough space to choose what happens next.',
        practice: ['Pause before answering when you feel pushed.', 'Do one task at a time instead of mentally carrying the entire day.', 'Use a quiet activity on purpose when your nervous system feels crowded.'],
        reset: 'Slow is still moving. Calm is still strength.'
      },
      dolphin: {
        meaning: 'Two feelings or two ideas can both be true. You do not have to force every situation into one simple answer.',
        practice: ['Try saying “part of me feels…, and another part feels…”.', 'Let yourself like something and still have complaints about it.', 'Ask one more question before deciding someone is completely right or wrong.'],
        reset: 'Complicated does not mean broken. More than one thing can be true.'
      },
      fox: {
        meaning: 'Your instincts are useful signals. They are not always the whole answer, but they are worth noticing instead of automatically ignoring.',
        practice: ['Notice what your body does when something feels wrong or right.', 'Pause and gather one more fact before committing.', 'Trust yourself enough to ask for clarification.'],
        reset: 'You are allowed to notice the signal before you know the full plan.'
      },
      turtle: {
        meaning: 'Steady progress usually works better than rushing until your brain crashes. You can move at a pace you can actually maintain.',
        practice: ['Choose one small next step.', 'Take a break before you are completely exhausted.', 'Finish slowly instead of quitting because fast is not possible.'],
        reset: 'You do not have to be fast to get somewhere.'
      }
    };

    if (exact[card.id]) return exact[card.id];
    if (/rest|stillness|pause|calm|softness|peace/.test(text)) return { meaning: 'This card is asking you to stop treating rest like something you have to earn. Pausing can help your brain come back online.', practice: ['Take one real break without multitasking.', 'Lower one unnecessary demand today.', 'Before reacting, give yourself ten slow seconds.'], reset: 'Pausing is not failing. It is how you make room for the next choice.' };
    if (/confident|space|visible|stand out|permission|shine|real|ground/.test(text)) return { meaning: 'This skill is about taking up your actual amount of space without becoming smaller just to avoid attention or disagreement.', practice: ['Share one honest preference.', 'Stand or sit in a way that feels comfortable instead of trying to disappear.', 'Let one strength be visible without immediately making a joke about it.'], reset: 'You are not too much. You are allowed to be here as yourself.' };
    if (/release|let go|no longer|enough|hurt|regeneration|transformation/.test(text)) return { meaning: 'Something can matter and still be ready to leave. Letting go is not pretending it never mattered.', practice: ['Stop one argument with yourself that is going nowhere.', 'Put away, delete, or step back from one thing that is draining you.', 'Ask what would help now instead of what should have happened before.'], reset: 'You can keep the lesson without carrying the whole weight.' };
    if (/awareness|notice|focus|clarity|instinct|see|listen/.test(text)) return { meaning: 'This skill is about noticing what is actually happening before your brain races ahead with a full story.', practice: ['Name three facts before making a conclusion.', 'Notice one body signal such as tight shoulders or fast breathing.', 'Ask yourself what needs attention first, not all at once.'], reset: 'Come back to what you know right now. The next step can come after that.' };
    if (/small|steady|simplify|progress|shape|act|risk/.test(text)) return { meaning: 'Big changes are usually built out of small actions. Today is about making the next step possible, not finishing the entire quest.', practice: ['Shrink one task until it feels startable.', 'Work for ten minutes before deciding whether you can continue.', 'Count progress that is incomplete but real.'], reset: 'The next small step counts. You do not need the whole staircase.' };
    if (/kindness|loyalty|give|pack|independence|seen/.test(text)) return { meaning: 'Relationships work best when care includes you too. You can be kind, connected, and still have boundaries.', practice: ['Check what you need before automatically agreeing.', 'Send one kind message that does not require a perfect response.', 'Say no or ask for space when that is the honest answer.'], reset: 'Caring about people does not require abandoning yourself.' };
    if (/joy|wonder|dance|abundance/.test(text)) return { meaning: 'Enjoyment is useful. It can recharge attention, make hard days more survivable, and remind you that life is not only a list of requirements.', practice: ['Choose one small thing purely because it is fun.', 'Notice a funny, beautiful, or interesting detail.', 'Let yourself look forward to something without downplaying it.'], reset: 'Joy is not a distraction from life. It is part of life.' };
    return { meaning: `Today’s card says, “${card.message || 'Pay attention to what matters.'}” Think of it as a skill to experiment with, not a rule you have to perform perfectly.`, practice: ['Notice one moment when this message might apply.', 'Try the skill once in a low-pressure situation.', 'At the end of the day, decide what helped and what did not.'], reset: 'You only have to practice, not master it today.' };
  };

  const assetUrl = (path) => new URL(path, SOURCE).href;

  const renderCard = (card, isToday = false) => {
    const guidance = wisdomFor(card);
    const src = assetUrl(card.image);
    image.src = src;
    image.alt = `${card.animal} Spirit Animal of the Day card`;
    image.dataset.downloadName = `${localDateKey()}-${card.id}-spirit-animal.webp`;
    image.onerror = () => {
      status.textContent = 'The card image is still unpacking on Mom’s report. Refresh in a minute and it should appear.';
      animal.textContent = card.animal;
      message.textContent = card.message;
    };
    animal.textContent = card.animal;
    message.textContent = card.message || 'A skill to carry with you today.';
    meaning.textContent = guidance.meaning;
    practice.replaceChildren(...guidance.practice.map((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
    reset.textContent = guidance.reset;
    status.textContent = isToday ? 'This is the same card showing in Mom’s Morning Intelligence Report today.' : 'Exploring the card library. Use “Today’s card” to return to the shared daily skill.';
    exploreLabel.textContent = `${currentIndex + 1} of ${cards.length}`;
    todayButton.hidden = isToday;
    downloadButton.disabled = false;
    previousButton.disabled = false;
    nextButton.disabled = false;
  };

  const showSharedView = () => {
    document.getElementById('dailyView')?.classList.add('is-hidden');
    document.getElementById('weekView')?.classList.add('is-hidden');
    document.getElementById('packingView')?.classList.add('is-hidden');
    view.classList.remove('is-hidden');
    document.querySelectorAll('.view-button').forEach((button) => button.classList.remove('is-active'));
    navButton.classList.add('is-active');
    view.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    view.classList.add('is-hidden');
    navButton.classList.remove('is-active');
  }));
  navButton.addEventListener('click', showSharedView);
  previousButton.addEventListener('click', () => { currentIndex = (currentIndex - 1 + cards.length) % cards.length; renderCard(cards[currentIndex], cards[currentIndex].id === todayCard?.id); });
  nextButton.addEventListener('click', () => { currentIndex = (currentIndex + 1) % cards.length; renderCard(cards[currentIndex], cards[currentIndex].id === todayCard?.id); });
  todayButton.addEventListener('click', () => { currentIndex = cards.findIndex((card) => card.id === todayCard.id); renderCard(todayCard, true); });

  downloadButton.addEventListener('click', async () => {
    const src = image.currentSrc || image.src;
    if (!src) return;
    downloadButton.disabled = true;
    downloadButton.textContent = 'PREPARING…';
    try {
      const response = await fetch(src, { mode: 'cors' });
      if (!response.ok) throw new Error('Image download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.dataset.downloadName || 'spirit-animal-card.webp';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      status.textContent = 'Card downloaded. On a phone, check Downloads or your browser’s saved files.';
    } catch {
      window.open(src, '_blank', 'noopener,noreferrer');
      status.textContent = 'The card opened by itself. Press and hold the image on your phone to save it.';
    } finally {
      downloadButton.disabled = false;
      downloadButton.textContent = 'DOWNLOAD CARD';
    }
  });

  todayCard = selectDaily(cards);
  currentIndex = cards.findIndex((card) => card.id === todayCard.id);
  renderCard(todayCard, true);
})();