(() => {
  let moving = false;

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  async function moveWeek(direction) {
    if (moving) return;
    moving = true;

    const button = document.querySelector(direction < 0 ? "#previousDay" : "#nextDay");
    const weekButtons = document.querySelectorAll("#previousWeek, #nextWeek, #thisWeek");
    weekButtons.forEach((item) => { item.disabled = true; });

    try {
      for (let step = 0; step < 7; step += 1) {
        button?.click();
        await wait(180);
      }

      await wait(900);
      window.dispatchEvent(new Event("focus"));
    } finally {
      weekButtons.forEach((item) => { item.disabled = false; });
      moving = false;
    }
  }

  function goToCurrentWeek() {
    document.querySelector("#goToday")?.click();
    window.setTimeout(() => window.dispatchEvent(new Event("focus")), 250);
  }

  document.querySelector("#previousWeek")?.addEventListener("click", () => moveWeek(-1));
  document.querySelector("#nextWeek")?.addEventListener("click", () => moveWeek(1));
  document.querySelector("#thisWeek")?.addEventListener("click", goToCurrentWeek);
})();
