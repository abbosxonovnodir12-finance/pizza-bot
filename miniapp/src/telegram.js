export const tg = window.Telegram?.WebApp;

export const tgUser = tg?.initDataUnsafe?.user || null;

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#f6f6f8');
    tg.setBackgroundColor?.('#f6f6f8');
    tg.setBottomBarColor?.('#ffffff');
    tg.disableVerticalSwipes?.();
  } catch {
    /* eski Telegram versiyalari */
  }
}

export function haptic(style = 'light') {
  try {
    tg?.HapticFeedback?.impactOccurred(style);
  } catch {
    /* ignore */
  }
}

export function hapticSuccess() {
  try {
    tg?.HapticFeedback?.notificationOccurred('success');
  } catch {
    /* ignore */
  }
}

export function showAlert(message) {
  try {
    if (tg?.initData) return tg.showAlert(message);
  } catch {
    /* ignore */
  }
  window.alert(message);
}

export function closeApp() {
  try {
    tg?.close();
  } catch {
    /* ignore */
  }
}

export function callPhone(phone) {
  window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function messagePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  const url = `https://t.me/+${digits}`;
  try {
    if (tg?.openTelegramLink) return tg.openTelegramLink(url);
  } catch {
    /* ignore */
  }
  window.open(url, '_blank');
}

export function startTrackId() {
  const fromUrl = new URLSearchParams(window.location.search).get('track');
  const fromStart = tg?.initDataUnsafe?.start_param?.match(/^track_(\d+)$/)?.[1];
  const id = Number(fromUrl || fromStart);
  return Number.isInteger(id) && id > 0 ? id : null;
}
