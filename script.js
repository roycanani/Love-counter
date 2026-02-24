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
const timerElement = document.querySelector(".timer");
const timeLeftButtonElement = document.getElementById("time-left-button");
const carouselElement = document.getElementById("photo-carousel");
const carouselPrevElement = document.getElementById("carousel-prev");
const carouselNextElement = document.getElementById("carousel-next");

const CONFETTI_DURATION_MS = 7200;
const CAROUSEL_SLIDE_INTERVAL_MS = 6000;

let activeTargetDate = null;
let confettiAnimationFrameId = null;
let confettiClearTimeoutId = null;
let activeCarouselIndex = 0;
let carouselAutoSlideTimeoutId = null;
let carouselAutoStartTimeoutId = null;
let isCarouselAutoSlideActive = false;

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

  const canvas = confettiLayerElement;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  if (confettiAnimationFrameId) {
    window.cancelAnimationFrame(confettiAnimationFrameId);
  }

  if (confettiClearTimeoutId) {
    window.clearTimeout(confettiClearTimeoutId);
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewportWidth * dpr);
  canvas.height = Math.floor(viewportHeight * dpr);
  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${viewportHeight}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ["#ff8bc2", "#ffb6df", "#e7bbff", "#ffd5ea", "#ffffff"];
  const particles = Array.from({ length: 170 }, () => ({
    x: Math.random() * viewportWidth,
    y: -20 - Math.random() * viewportHeight * 0.35,
    size: 5 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    velocityX: -0.9 + Math.random() * 1.8,
    velocityY: 1.2 + Math.random() * 1.9,
    gravity: 0.022 + Math.random() * 0.025,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.2 + Math.random() * 0.4,
  }));

  const startTime = performance.now();
  const durationMs = CONFETTI_DURATION_MS;

  function drawFrame(timestamp) {
    context.clearRect(0, 0, viewportWidth, viewportHeight);

    for (const particle of particles) {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += particle.gravity;
      particle.rotation += particle.rotationSpeed;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 1.5);
      context.restore();
    }

    if (timestamp - startTime < durationMs) {
      confettiAnimationFrameId = window.requestAnimationFrame(drawFrame);
      return;
    }

    context.clearRect(0, 0, viewportWidth, viewportHeight);
    confettiAnimationFrameId = null;
  }

  confettiAnimationFrameId = window.requestAnimationFrame(drawFrame);
  confettiClearTimeoutId = window.setTimeout(() => {
    context.clearRect(0, 0, viewportWidth, viewportHeight);
    confettiClearTimeoutId = null;
  }, durationMs + 200);

  return durationMs;
}

function showSurpriseMessage(message) {
  if (!surpriseElement || !surpriseMessageElement) {
    return;
  }

  surpriseMessageElement.textContent = message;
  surpriseElement.classList.add("show");

  window.setTimeout(() => {
    surpriseElement.classList.remove("show");
  }, 5000);
}

function flashTimer() {
  if (!timerElement) {
    return;
  }

  timerElement.classList.remove("flash");
  void timerElement.offsetWidth;
  timerElement.classList.add("flash");
}

function updateCarousel(index) {
  if (!carouselElement) {
    return;
  }

  const images = carouselElement.querySelectorAll(".carousel-image");
  if (!images.length) {
    return;
  }

  activeCarouselIndex = (index + images.length) % images.length;
  images.forEach((imageElement, imageIndex) => {
    const isActive = imageIndex === activeCarouselIndex;
    imageElement.classList.toggle("is-active", isActive);
    imageElement.setAttribute("aria-hidden", String(!isActive));
  });
}

function clearCarouselTimers() {
  if (carouselAutoSlideTimeoutId) {
    window.clearTimeout(carouselAutoSlideTimeoutId);
    carouselAutoSlideTimeoutId = null;
  }

  if (carouselAutoStartTimeoutId) {
    window.clearTimeout(carouselAutoStartTimeoutId);
    carouselAutoStartTimeoutId = null;
  }
}

function resetCarouselAutoSlideTimer() {
  if (!isCarouselAutoSlideActive || !carouselElement) {
    return;
  }

  if (carouselAutoSlideTimeoutId) {
    window.clearTimeout(carouselAutoSlideTimeoutId);
  }

  carouselAutoSlideTimeoutId = window.setTimeout(() => {
    const images = carouselElement.querySelectorAll(".carousel-image");
    if (!images.length) {
      return;
    }

    const nextIndex = (activeCarouselIndex + 1) % images.length;
    updateCarousel(nextIndex);
    resetCarouselAutoSlideTimer();
  }, CAROUSEL_SLIDE_INTERVAL_MS);
}

function startCarouselAutoSlide() {
  isCarouselAutoSlideActive = true;
  resetCarouselAutoSlideTimer();
}

function setupCarousel(initialAutoStartDelayMs = 0) {
  if (!carouselElement || !carouselPrevElement || !carouselNextElement) {
    return;
  }

  const images = carouselElement.querySelectorAll(".carousel-image");
  if (!images.length) {
    return;
  }

  updateCarousel(0);
  clearCarouselTimers();
  isCarouselAutoSlideActive = false;

  if (initialAutoStartDelayMs > 0) {
    carouselAutoStartTimeoutId = window.setTimeout(() => {
      startCarouselAutoSlide();
      carouselAutoStartTimeoutId = null;
    }, initialAutoStartDelayMs);
  } else {
    startCarouselAutoSlide();
  }

  carouselPrevElement.addEventListener("click", () => {
    updateCarousel(activeCarouselIndex - 1);
    if (isCarouselAutoSlideActive) {
      resetCarouselAutoSlideTimer();
    }
  });

  carouselNextElement.addEventListener("click", () => {
    updateCarousel(activeCarouselIndex + 1);
    if (isCarouselAutoSlideActive) {
      resetCarouselAutoSlideTimer();
    }
  });
}

function triggerFinal48Celebration(currentDate, targetDate) {
  const remainingMs = targetDate.getTime() - currentDate.getTime();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;

  if (remainingMs <= 0 || remainingMs >= fortyEightHoursMs) {
    return 0;
  }

  const hoursLeft = Math.ceil(remainingMs / (60 * 60 * 1000));
  showSurpriseMessage(`Only ${hoursLeft} hours left ❤️`);
  return launchConfetti();
}

function triggerTimeLeftEffect() {
  if (!activeTargetDate) {
    return;
  }

  const now = new Date();
  const remainingMs = activeTargetDate.getTime() - now.getTime();

  if (remainingMs <= 0) {
    showSurpriseMessage("It’s time — you’re finally together 💖");
    launchConfetti();
    flashTimer();
    return;
  }

  const totalMinutes = Math.ceil(remainingMs / (60 * 1000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const totalHoursLeft = Math.ceil(remainingMs / (60 * 60 * 1000));

  showSurpriseMessage(`Only ${totalHoursLeft} hours left ❤️ (${days}d ${hours}h ${minutes}m)`);
  launchConfetti();
  flashTimer();
}

function startCountdown() {
  const now = new Date();
  const targetDate = getTargetDate(now);
  const startDate = getStartDateForTarget(targetDate);
  activeTargetDate = targetDate;
  const confettiDuration = triggerFinal48Celebration(now, targetDate);
  setupCarousel(confettiDuration);

  if (timeLeftButtonElement) {
    timeLeftButtonElement.addEventListener("click", triggerTimeLeftEffect);
  }

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