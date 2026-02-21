const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const targetInfoElement = document.getElementById("target-info");
const statusElement = document.getElementById("status");

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

  targetInfoElement.textContent = `Target: ${targetDate.toUTCString()} (GMT) / 21:20 Israel time on Feb 25`;

  function tick() {
    const current = new Date();
    const diff = targetDate.getTime() - current.getTime();

    if (diff <= 0) {
      setCountdown(0);
      statusElement.textContent = "The countdown reached February 25, 19:20 GMT.";
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