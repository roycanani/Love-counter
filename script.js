const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const targetInfoElement = document.getElementById("target-info");
const statusElement = document.getElementById("status");
const progressPercentElement = document.getElementById("progress-percent");
const progressBarElement = document.getElementById("progress-bar");
const confettiLayerElement = document.getElementById("confetti-layer");
const surpriseElement = document.getElementById("surprise");
const surpriseMessageElement = document.getElementById("surprise-message");

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
    progressBarElement.value = 0;
    progressBarElement.setAttribute("aria-valuenow", "0");
    return;
  }

  const elapsedMs = Math.min(Math.max(currentMs - startMs, 0), totalMs);
  const progress = (elapsedMs / totalMs) * 100;
  const displayProgress = progress.toFixed(2);

  progressPercentElement.textContent = `${displayProgress}%`;
  progressBarElement.value = progress;
  progressBarElement.setAttribute("aria-valuenow", String(Math.round(progress)));
  progressBarElement.setAttribute("aria-valuetext", `${displayProgress}% complete`);
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

function launchConfetti() {
  if (!confettiLayerElement) {
    return;
  }

  const colors = ["#ff8bc2", "#ffb6df", "#e7bbff", "#ffd5ea", "#ffffff"];
  const pieces = 120;

  for (let index = 0; index < pieces; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--fall-delay", `${Math.random() * 0.45}s`);
    piece.style.setProperty("--fall-duration", `${3.5 + Math.random() * 2.3}s`);
    piece.style.setProperty("--drift-x", `${-140 + Math.random() * 280}px`);
    piece.style.setProperty("--spin", `${360 + Math.random() * 720}deg`);
    confettiLayerElement.appendChild(piece);
  }

  window.setTimeout(() => {
    confettiLayerElement.textContent = "";
  }, 6500);
}

function showFinalHoursMessage(hoursLeft) {
  if (!surpriseElement || !surpriseMessageElement) {
    return;
  }

  surpriseMessageElement.textContent = `Only ${hoursLeft} hours left ❤️`;
  surpriseElement.classList.add("show");

  window.setTimeout(() => {
    surpriseElement.classList.remove("show");
  }, 5000);
}

function triggerFinal48Celebration(currentDate, targetDate) {
  const remainingMs = targetDate.getTime() - currentDate.getTime();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;

  if (remainingMs <= 0 || remainingMs >= fortyEightHoursMs) {
    return;
  }

  const hoursLeft = Math.ceil(remainingMs / (60 * 60 * 1000));
  showFinalHoursMessage(hoursLeft);
  launchConfetti();
}

function startCountdown() {
  const now = new Date();
  const targetDate = getTargetDate(now);
  const startDate = getStartDateForTarget(targetDate);
  triggerFinal48Celebration(now, targetDate);

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