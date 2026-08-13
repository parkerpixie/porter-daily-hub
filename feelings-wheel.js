(() => {
  const FEELINGS = [
    {
      key: 'mad', label: 'MAD', words: ['frustrated', 'annoyed', 'angry', 'furious', 'jealous', 'disrespected'],
      message: 'Something feels unfair, blocked, too much, or not okay.',
      action: 'Give your body 60 seconds before deciding what to do next.',
      deep: ['Unclench your jaw and hands.', 'Say what happened in one sentence without explaining the whole case.', 'Ask: do I need space, help, or a change?']
    },
    {
      key: 'stressed', label: 'STRESSED', words: ['overwhelmed', 'rushed', 'pressured', 'stuck', 'confused', 'too much'],
      message: 'Your brain may be carrying more tabs than it can comfortably keep open.',
      action: 'Pick just one next thing. Everything else can wait for one minute.',
      deep: ['Reduce noise or visual clutter if you can.', 'Ask someone to turn the next step into one concrete action.', 'Use a timer for five minutes and only do that one thing.']
    },
    {
      key: 'sad', label: 'SAD', words: ['hurt', 'lonely', 'disappointed', 'left out', 'grief', 'empty'],
      message: 'Something mattered, and right now it hurts.',
      action: 'Do one gentle thing before trying to solve the feeling.',
      deep: ['Find a safe person or safe place.', 'Name what you wish had happened instead.', 'Choose comfort first, problem-solving second.']
    },
    {
      key: 'scared', label: 'SCARED', words: ['worried', 'nervous', 'unsafe', 'uncertain', 'panicky', 'embarrassed'],
      message: 'Your brain is trying to predict danger or protect you from something uncertain.',
      action: 'Look around and name three things that are actually true right now.',
      deep: ['Put both feet on the floor.', 'Separate what you know from what your brain is predicting.', 'Ask for the information you need instead of filling in the blank.']
    },
    {
      key: 'tired', label: 'TIRED', words: ['drained', 'sleepy', 'burned out', 'done', 'low battery', 'foggy'],
      message: 'Your system may be out of fuel, not out of character.',
      action: 'Lower the difficulty setting for the next ten minutes.',
      deep: ['Drink something or eat if you need fuel.', 'Sit somewhere quieter.', 'Choose the easiest version of the next task that still counts.']
    },
    {
      key: 'sensory', label: 'SENSORY', words: ['too loud', 'too bright', 'itchy', 'crowded', 'touchy', 'body weird'],
      message: 'Your nervous system may be reacting to the environment before words catch up.',
      action: 'Change one sensory input right now.',
      deep: ['Headphones, sunglasses, hoodie, different seat, or more space are all valid tools.', 'Notice whether sound, light, touch, smell, movement, hunger, or temperature is the biggest problem.', 'You do not have to explain the whole feeling before asking for less input.']
    },
    {
      key: 'good', label: 'GOOD', words: ['happy', 'calm', 'proud', 'excited', 'connected', 'relieved'],
      message: 'Something is working. It is worth noticing that too.',
      action: 'Take five seconds to notice what helped this feeling happen.',
      deep: ['What went right?', 'Who or what helped?', 'Is there anything here you want to repeat tomorrow?']
    },
    {
      key: 'other', label: 'OTHER', words: ['bored', 'restless', 'numb', 'mixed up', 'not sure', 'weird'],
      message: 'You do not need the perfect word. "Something is off" is useful information.',
      action: 'Start with your body: more energy, less energy, or just uncomfortable?',
      deep: ['Check hunger, thirst, sleep, pain, temperature, and sensory load.', 'Think about what happened right before the feeling showed up.', 'If none of the words fit, "not sure yet" is a completely valid check-in.']
    }
  ];

  const STORAGE_KEY = 'porter-feelings-checkin-v1';
  let selectedFamily = FEELINGS[0];
  let selectedWord = '';
  let rotation = 0;
  let dragStartAngle = 0;
  let dragStartRotation = 0;
  let dragging = false;

  function buildUI() {
    const dailyView = document.getElementById('dailyView');
    const nowPanel = dailyView?.querySelector('.now-panel');
    if (!dailyView || !nowPanel || document.getElementById('feelingsLaunchPanel')) return;

    const launch = document.createElement('section');
    launch.id = 'feelingsLaunchPanel';
    launch.className = 'feelings-launch-panel manga-panel';
    launch.setAttribute('aria-labelledby', 'feelingsLaunchHeading');
    launch.innerHTML = `
      <div class="feelings-launch-copy">
        <span class="scene-label">CHECK YOUR HUD</span>
        <h3 id="feelingsLaunchHeading">HOW ARE YOU FEELING?</h3>
        <p>No perfect answer required. Pick the closest thing and get one tiny next move.</p>
      </div>
      <div class="feelings-launch-actions">
        <button class="feelings-open-button" type="button" id="openFeelingsWheel">OPEN FEELINGS WHEEL</button>
        <p class="feelings-last-checkin" id="feelingsLastCheckin">No check-in saved yet.</p>
      </div>`;
    nowPanel.insertAdjacentElement('afterend', launch);

    const dialog = document.createElement('dialog');
    dialog.id = 'feelingsDialog';
    dialog.className = 'feelings-dialog';
    dialog.setAttribute('aria-labelledby', 'feelingsDialogTitle');
    dialog.innerHTML = `
      <div class="feelings-dialog-inner">
        <div class="feelings-dialog-header">
          <div>
            <span class="scene-label">PORTER'S FEELINGS WHEEL</span>
            <h2 id="feelingsDialogTitle">WHAT'S GOING ON IN THERE?</h2>
          </div>
          <button class="feelings-close" type="button" id="closeFeelingsWheel" aria-label="Close feelings wheel">✕</button>
        </div>
        <div class="feelings-stage">
          <div class="feelings-wheel-side">
            <div class="feelings-wheel-wrap" id="feelingsWheelWrap">
              <div class="feelings-pointer" aria-hidden="true"></div>
              <div class="feelings-wheel" id="feelingsWheel" aria-label="Feelings categories"></div>
              <div class="feelings-wheel-core">
                <strong id="feelingsCoreLabel">MAD</strong>
                <span>DRAG, SPIN, OR TAP</span>
              </div>
            </div>
            <p class="feelings-drag-hint">Spin the wheel or tap the category that feels closest.</p>
          </div>
          <section class="feelings-detail" aria-live="polite">
            <span class="scene-label">GET MORE SPECIFIC</span>
            <h3 id="feelingDetailHeading">MAD CAN MEAN A LOT</h3>
            <p class="feelings-detail-intro" id="feelingDetailIntro">Pick the word that is closest. Close enough counts.</p>
            <div class="feeling-word-grid" id="feelingWordGrid"></div>
            <div class="feeling-result" id="feelingResult" hidden>
              <div class="feeling-result-title" id="feelingResultTitle"></div>
              <p class="feeling-result-copy" id="feelingResultCopy"></p>
              <div class="feeling-action-card">
                <span>TINY NEXT MOVE</span>
                <strong id="feelingAction"></strong>
              </div>
              <button class="feelings-more-button" id="feelingsMoreButton" type="button" aria-expanded="false">HELP ME FIGURE THIS OUT</button>
              <div class="feelings-deep-dive" id="feelingsDeepDive" hidden></div>
              <button class="feelings-save-button" id="feelingsSaveButton" type="button">SAVE THIS CHECK-IN</button>
            </div>
            <div class="feelings-mascot-row">
              <img src="porter-orangutan-mascot.png" alt="Porter's orangutan guide">
              <p>You are not choosing a permanent label. This is just a snapshot of right now.</p>
            </div>
          </section>
        </div>
      </div>`;
    document.body.appendChild(dialog);

    renderWheel();
    selectFamily(FEELINGS[0], false);
    bindEvents();
    showSavedCheckin();
  }

  function renderWheel() {
    const wheel = document.getElementById('feelingsWheel');
    if (!wheel) return;
    wheel.innerHTML = '';
    FEELINGS.forEach((feeling, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'feeling-slice';
      button.dataset.feeling = feeling.key;
      button.style.setProperty('--angle', `${index * 45}deg`);
      button.textContent = feeling.label;
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedWord = '';
        snapTo(index);
        selectFamily(feeling, true);
      });
      wheel.appendChild(button);
    });
  }

  function selectFamily(feeling, announce = true) {
    selectedFamily = feeling;
    selectedWord = '';
    document.getElementById('feelingsCoreLabel').textContent = feeling.label;
    document.getElementById('feelingDetailHeading').textContent = `${feeling.label} CAN MEAN A LOT`;
    document.getElementById('feelingDetailIntro').textContent = 'Pick the word that is closest. Close enough counts.';

    document.querySelectorAll('.feeling-slice').forEach((el) => {
      el.classList.toggle('is-selected', el.dataset.feeling === feeling.key);
    });

    const grid = document.getElementById('feelingWordGrid');
    grid.innerHTML = '';
    feeling.words.forEach((word) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'feeling-word';
      button.textContent = word;
      button.addEventListener('click', () => selectWord(word));
      grid.appendChild(button);
    });

    document.getElementById('feelingResult').hidden = true;
    document.getElementById('feelingsDeepDive').hidden = true;
    const more = document.getElementById('feelingsMoreButton');
    more.setAttribute('aria-expanded', 'false');
    more.textContent = 'HELP ME FIGURE THIS OUT';

    if (announce) grid.querySelector('button')?.focus({ preventScroll: true });
  }

  function selectWord(word) {
    selectedWord = word;
    document.querySelectorAll('.feeling-word').forEach((el) => {
      el.classList.toggle('is-selected', el.textContent === word);
    });
    document.getElementById('feelingResultTitle').textContent = `Okay: ${word}.`;
    document.getElementById('feelingResultCopy').textContent = selectedFamily.message;
    document.getElementById('feelingAction').textContent = selectedFamily.action;
    document.getElementById('feelingsDeepDive').innerHTML = `<strong>If you want more:</strong><ul>${selectedFamily.deep.map(item => `<li>${item}</li>`).join('')}</ul>`;
    document.getElementById('feelingResult').hidden = false;
  }

  function bindEvents() {
    const dialog = document.getElementById('feelingsDialog');
    document.getElementById('openFeelingsWheel').addEventListener('click', () => {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
    document.getElementById('closeFeelingsWheel').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    document.getElementById('feelingsMoreButton').addEventListener('click', (event) => {
      const deep = document.getElementById('feelingsDeepDive');
      const willOpen = deep.hidden;
      deep.hidden = !willOpen;
      event.currentTarget.setAttribute('aria-expanded', String(willOpen));
      event.currentTarget.textContent = willOpen ? 'HIDE THE EXTRA STUFF' : 'HELP ME FIGURE THIS OUT';
    });

    document.getElementById('feelingsSaveButton').addEventListener('click', saveCheckin);

    const wrap = document.getElementById('feelingsWheelWrap');
    const wheel = document.getElementById('feelingsWheel');
    wrap.addEventListener('pointerdown', (event) => {
      dragging = true;
      dragStartAngle = pointerAngle(event, wrap);
      dragStartRotation = rotation;
      wheel.classList.add('is-dragging');
      wrap.setPointerCapture?.(event.pointerId);
    });
    wrap.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const current = pointerAngle(event, wrap);
      rotation = dragStartRotation + (current - dragStartAngle);
      wheel.style.transform = `rotate(${rotation}deg)`;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      wheel.classList.remove('is-dragging');
      const index = nearestIndex(rotation);
      snapTo(index);
      selectFamily(FEELINGS[index], false);
    };
    wrap.addEventListener('pointerup', endDrag);
    wrap.addEventListener('pointercancel', endDrag);
  }

  function pointerAngle(event, element) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  function nearestIndex(currentRotation) {
    const normalized = ((-currentRotation % 360) + 360) % 360;
    return Math.round(normalized / 45) % FEELINGS.length;
  }

  function snapTo(index) {
    rotation = -(index * 45);
    const wheel = document.getElementById('feelingsWheel');
    wheel.style.transform = `rotate(${rotation}deg)`;
    wheel.querySelectorAll('.feeling-slice').forEach((button, i) => {
      button.style.setProperty('--counter-rotation', `${-rotation}deg`);
      button.style.transform = `rotate(${i * 45}deg) translateY(${window.innerWidth <= 420 ? '-102px' : window.innerWidth <= 760 ? '-122px' : '-150px'}) rotate(${-i * 45 - rotation}deg)`;
    });
  }

  function saveCheckin() {
    if (!selectedWord) return;
    const payload = {
      family: selectedFamily.key,
      familyLabel: selectedFamily.label,
      word: selectedWord,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    showSavedCheckin();
    const button = document.getElementById('feelingsSaveButton');
    button.textContent = 'SAVED ✓';
    setTimeout(() => {
      button.textContent = 'SAVE THIS CHECK-IN';
      document.getElementById('feelingsDialog').close();
    }, 650);
  }

  function showSavedCheckin() {
    const label = document.getElementById('feelingsLastCheckin');
    if (!label) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved?.word || !saved?.timestamp) {
        label.textContent = 'No check-in saved yet.';
        return;
      }
      const when = new Date(saved.timestamp);
      const sameDay = when.toDateString() === new Date().toDateString();
      const time = when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      label.textContent = `${sameDay ? 'Today' : when.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${time}: ${saved.word}`;
    } catch {
      label.textContent = 'No check-in saved yet.';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUI);
  else buildUI();
})();
