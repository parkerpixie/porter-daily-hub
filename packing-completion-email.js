(() => {
  const FORM_NAME = "porter-packing-complete";
  const RECIPIENTS = "Parkerfur@gmail.com, blakeetalbot@gmail.com";
  const list = document.getElementById("packingList");
  const status = document.getElementById("packingEmailStatus");
  const resetButton = document.getElementById("resetPacking");

  if (!list) return;

  const currentSeason = () => {
    const active = document.querySelector("[data-season].is-active");
    return active?.dataset.season || "summer";
  };

  const storageKey = (season) => `porterPackingCompletionEmailSent:${season}`;

  const readSent = (season) => {
    try {
      return window.localStorage.getItem(storageKey(season)) === "true";
    } catch {
      return false;
    }
  };

  const writeSent = (season, value) => {
    try {
      if (value) window.localStorage.setItem(storageKey(season), "true");
      else window.localStorage.removeItem(storageKey(season));
    } catch {
      // The email still attempts to send if storage is unavailable.
    }
  };

  const visibleCheckboxes = () => [...list.querySelectorAll("input[type='checkbox']")];

  const postCompletion = async (season) => {
    if (readSent(season)) return;

    writeSent(season, true);
    if (status) status.textContent = "Packing complete! Telling Mom and Dad…";

    const body = new URLSearchParams({
      "form-name": FORM_NAME,
      subject: "Porter has completed their packing",
      message: "Porter has completed their packing.",
      season: `${season.charAt(0).toUpperCase()}${season.slice(1)}`,
      recipients: RECIPIENTS,
      completed_at: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
    });

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });

      if (!response.ok) throw new Error(`Notification returned ${response.status}`);
      if (status) status.textContent = "Packing complete! Mom and Dad were notified. ✓";
    } catch (error) {
      console.error(error);
      writeSent(season, false);
      if (status) status.textContent = "Packing is complete, but the email could not be sent. Please tell Mom or Dad.";
    }
  };

  const checkCompletion = () => {
    const checkboxes = visibleCheckboxes();
    if (!checkboxes.length) return;

    const season = currentSeason();
    const checkedCount = checkboxes.filter((box) => box.checked).length;
    const allChecked = checkedCount === checkboxes.length;
    const noneChecked = checkedCount === 0;

    if (noneChecked) {
      writeSent(season, false);
      if (status) status.textContent = "An email will be sent when every item is checked.";
      return;
    }

    if (allChecked) postCompletion(season);
    else if (status && !readSent(season)) {
      status.textContent = "An email will be sent when every item is checked.";
    }
  };

  list.addEventListener("change", () => window.setTimeout(checkCompletion, 0));
  document.querySelectorAll("[data-season]").forEach((button) => {
    button.addEventListener("click", () => window.setTimeout(checkCompletion, 0));
  });
  resetButton?.addEventListener("click", () => window.setTimeout(checkCompletion, 50));

  const observer = new MutationObserver(() => window.setTimeout(checkCompletion, 0));
  observer.observe(list, { childList: true, subtree: true });

  window.setTimeout(checkCompletion, 0);
})();
