/**
 * Utility for Meta (Facebook) Pixel tracking events.
 * Ensures consistent checking of the fbq object and standardized event payloads.
 */

/**
 * Tracks a standard Meta Pixel event.
 * @param {string} eventName - The name of the standard event (e.g., 'ViewContent', 'Purchase').
 * @param {Object} [params] - Optional parameters for the event.
 */
export const trackPixel = (eventName, params = {}) => {
  if (typeof window.fbq === 'function') {
    // Standard events use 'track'
    if (Object.keys(params).length > 0) {
      window.fbq('track', eventName, params);
    } else {
      window.fbq('track', eventName);
    }
    console.log(`[Meta Pixel] Tracked standard event: ${eventName}`, params);
  } else {
    console.warn(`[Meta Pixel] fbq not defined. Could not track event: ${eventName}`);
  }
};

/**
 * Tracks a custom Meta Pixel event.
 * @param {string} eventName - The name of the custom event.
 * @param {Object} [params] - Optional parameters for the event.
 */
export const trackPixelCustom = (eventName, params = {}) => {
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, params);
    console.log(`[Meta Pixel] Tracked custom event: ${eventName}`, params);
  } else {
    console.warn(`[Meta Pixel] fbq not defined. Could not track custom event: ${eventName}`);
  }
};

export default {
  track: trackPixel,
  trackCustom: trackPixelCustom
};
