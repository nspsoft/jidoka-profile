/**
 * Lightweight Zero-Dependency User-Agent Parser
 * Extracts device type, browser name, operating system, and bot flags.
 */

export function parseUserAgent(uaString) {
  const ua = String(uaString || '').trim();
  if (!ua) {
    return {
      deviceType: 'desktop',
      browser: 'Other',
      os: 'Other',
      isBot: false
    };
  }

  // Detect bots / search engine crawlers
  const isBot = /bot|googlebot|crawler|spider|robot|crawling|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|semrush|ahrefs|petalbot/i.test(ua);

  // Detect Device Type
  let deviceType = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobi|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Detect Browser
  let browser = 'Other';
  if (isBot) {
    browser = 'Bot / Crawler';
  } else if (/edg([ea]|ios)?\//i.test(ua)) {
    browser = 'Edge';
  } else if (/opr\/|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/msie|trident/i.test(ua)) {
    browser = 'IE';
  }

  // Detect OS
  let os = 'Other';
  if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  return {
    deviceType,
    browser,
    os,
    isBot
  };
}
