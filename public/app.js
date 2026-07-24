const IMAGE_CHANGE_INTERVAL_MS = 30_000;

// В каждой группе ровно 3 изображения.
// Файлы находятся в папке public/images/.
const IMAGES = {
  weekdayMorning: [
    './images/weekday-morning-1.png',
    './images/weekday-morning-2.png',
    './images/weekday-morning-3.png'
  ],
  weekdayEvening: [
    './images/weekday-evening-1.png',
    './images/weekday-evening-2.png',
    './images/weekday-evening-3.png'
  ],
  weekendMorning: [
    './images/weekend-morning-1.png',
    './images/weekend-morning-2.png',
    './images/weekend-morning-3.png'
  ],
  weekendEvening: [
    './images/weekend-evening-1.png',
    './images/weekend-evening-2.png',
    './images/weekend-evening-3.png'
  ]
};

const LABELS = {
  weekdayMorning: 'Будни · утро · 08:00–13:00',
  weekdayEvening: 'Будни · вечер · 13:00–08:00',
  weekendMorning: 'Выходные · утро · 08:00–13:00',
  weekendEvening: 'Выходные · вечер · 13:00–08:00'
};

function pad2(value) {
  return String(value).padStart(2, '0');
}

function getDateKeys(now = new Date()) {
  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());

  return {
    annual: `${month}-${day}`,
    exact: `${now.getFullYear()}-${month}-${day}`
  };
}

function isWeekendException(now = new Date()) {
  const keys = getDateKeys(now);
  return WEEKEND_EXCEPTIONS.includes(keys.annual)
    || WEEKEND_EXCEPTIONS.includes(keys.exact);
}

function isWeekendDay(now = new Date()) {
  const dayOfWeek = now.getDay();

  // Пятница, суббота и воскресенье считаются выходными
  return (
    dayOfWeek === 5 ||
    dayOfWeek === 6 ||
    dayOfWeek === 0 ||
    isWeekendException(now)
  );
}

function isMorning(now = new Date()) {
  const hour = now.getHours();
  return hour >= 8 && hour < 13;
}

function getCurrentMode(now = new Date()) {
  const dayType = isWeekendDay(now) ? 'weekend' : 'weekday';
  const timeType = isMorning(now) ? 'Morning' : 'Evening';
  return `${dayType}${timeType}`;
}

function getCurrentImageIndex(now = new Date()) {
  return Math.floor(now.getTime() / IMAGE_CHANGE_INTERVAL_MS) % 3;
}

function getCurrentImage(now = new Date()) {
  const mode = getCurrentMode(now);
  const imageIndex = getCurrentImageIndex(now);

  return {
    mode,
    imageIndex,
    imageUrl: IMAGES[mode][imageIndex]
  };
}

function preloadImages() {
  Object.values(IMAGES).flat().forEach((imageUrl) => {
    const image = new Image();
    image.src = imageUrl;
  });
}

let lastAppliedImageUrl = '';

function applyBackground(now = new Date()) {
  const current = getCurrentImage(now);

  if (current.imageUrl !== lastAppliedImageUrl) {
    document.body.style.backgroundImage = `url("${current.imageUrl}")`;
    lastAppliedImageUrl = current.imageUrl;
  }

  const modeElement = document.getElementById('currentMode');
  if (modeElement) {
    modeElement.textContent = `${LABELS[current.mode]} · изображение ${current.imageIndex + 1}/3`;
  }
}

function millisecondsUntilNextImage(now = new Date()) {
  const elapsed = now.getTime() % IMAGE_CHANGE_INTERVAL_MS;
  return IMAGE_CHANGE_INTERVAL_MS - elapsed + 20;
}

function scheduleNextUpdate() {
  window.setTimeout(() => {
    applyBackground();
    scheduleNextUpdate();
  }, millisecondsUntilNextImage());
}

// Небольшая дополнительная проверка нужна для точного переключения режима
// в 08:00 и 13:00, даже если вкладка была временно неактивна.
window.setInterval(() => applyBackground(), 5_000);

preloadImages();
applyBackground();
scheduleNextUpdate();

// Оставлено для простой проверки логики из консоли браузера.
window.PRICE_SCHEDULE = {
  getCurrentMode,
  getCurrentImage,
  isWeekendDay,
  isWeekendException
};
