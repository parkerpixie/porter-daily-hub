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
      // The checklist still works if storage is unavailable.
    }
  };

  const visibleCheckboxes = () => [...list.querySelectorAll("input[type='checkbox']")];

  const updateStatus = () => {
    const checkboxes = visibleCheckboxes();
    const season = currentSeason();
    if (!checkboxes.length) return;

    const checkedCount = checkboxes.filter((box) => box.checked).length;
    if (checkedCount === 0) {
      writeSent(season, false);
      if (status) status.textContent = "An email will be sent when every item is checked.";
    } else if (checkedCount < checkboxes.length && status && !readSent(season)) {
      status.textContent = "An email will be sent when every item is checked.";
    }
  };

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

  list.addEventListener("change", (event) => {
    const changedBox = event.target.closest("input[type='checkbox']");
    if (!changedBox) return;

    window.setTimeout(() => {
      const checkboxes = visibleCheckboxes();
      const season = currentSeason();
      if (!checkboxes.length) return;

      const checkedCount = checkboxes.filter((box) => box.checked).length;
      const allChecked = checkedCount === checkboxes.length;

      // A notification may only be triggered by the user actively checking
      // the final remaining item. Page loads, rerenders, resets, and season
      // changes can update the status but can never send an email.
      if (changedBox.checked && allChecked) postCompletion(season);
      else updateStatus();
    }, 0);
  });

  document.querySelectorAll("[data-season]").forEach((button) => {
    button.addEventListener("click", () => window.setTimeout(updateStatus, 0));
  });

  resetButton?.addEventListener("click", () => {
    window.setTimeout(() => {
      writeSent(currentSeason(), false);
      updateStatus();
    }, 75);
  });

  const observer = new MutationObserver(() => window.setTimeout(updateStatus, 0));
  observer.observe(list, { childList: true, subtree: true });

  window.setTimeout(updateStatus, 0);
})();