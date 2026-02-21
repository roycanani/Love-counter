const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const targetInfoElement = document.getElementById("target-info");
const statusElement = document.getElementById("status");
const progressPercentElement = document.getElementById("progress-percent");
const progressFillElement = document.getElementById("progress-fill");
const progressTrackElement = document.querySelector(".progress-track");

function pad(value) {
  return String(value).padStart(2, "0");
}

function getTargetDate(now) {
  const year = now.getUTCFullYear();
  const targetThisYear = Date.UTC(year, 1, 25, 19, 20, 0);

  if (now.getTime() <= targetThisYear) {
    return new Date(targetThisYear);
  }

  return new Date(Date.UTC(year + 1, 1, 25, 19, 20, 0));
}

function getStartDateForTarget(targetDate) {
  return new Date(Date.UTC(targetDate.getUTCFullYear(), 0, 15, 0, 0, 0));
}

function setProgress(current, startDate, targetDate) {
  const startMs = startDate.getTime();
  const endMs = targetDate.getTime();
  const currentMs = current.getTime();
  const totalMs = endMs - startMs;

  if (totalMs <= 0) {
    progressPercentElement.textContent = "0%";
    progressFillElement.style.width = "0%";
    progressTrackElement.setAttribute("aria-valuenow", "0");
    return;
  }

  const elapsedMs = Math.min(Math.max(currentMs - startMs, 0), totalMs);
  const progress = (elapsedMs / totalMs) * 100;
  const displayProgress = progress.toFixed(2);

  progressPercentElement.textContent = `${displayProgress}%`;
  progressFillElement.style.width = `${progress}%`;
  progressTrackElement.setAttribute("aria-valuenow", String(Math.round(progress)));
  progressTrackElement.setAttribute("aria-valuetext", `${displayProgress}% complete`);
}

function setCountdown(diffMs) {
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysElement.textContent = pad(days);
  hoursElement.textContent = pad(hours);
  minutesElement.textContent = pad(minutes);
  secondsElement.textContent = pad(seconds);
}

function startCountdown() {
  const now = new Date();
  const targetDate = getTargetDate(now);
  const startDate = getStartDateForTarget(targetDate);

  targetInfoElement.textContent = `Reunion target: ${targetDate.toUTCString()} (GMT) / 21:20 Israel time on Feb 25`;

  function tick() {
    const current = new Date();
    const diff = targetDate.getTime() - current.getTime();
    setProgress(current, startDate, targetDate);

    if (diff <= 0) {
      setCountdown(0);
      setProgress(targetDate, startDate, targetDate);
      statusElement.textContent = "You made it — welcome back to Jade. 💖";
      statusElement.classList.add("done");
      clearInterval(interval);
      return;
    }

    statusElement.textContent = "";
    setCountdown(diff);
  }

  tick();
  const interval = setInterval(tick, 1000);
}

startCountdown();