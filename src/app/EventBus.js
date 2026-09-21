/**
 * Provides a small publish/subscribe channel for semantic interaction events.
 * Input: an event name and payload. Output: notifications to event subscribers.
 */

export const EVENTS = Object.freeze({
  HAND_FOUND: 'HAND_FOUND',
  HAND_LOST: 'HAND_LOST',
  HAND_TRACK_UPDATE: 'HAND_TRACK_UPDATE',
  CURSOR_MOVE: 'CURSOR_MOVE',
  PLANET_HOVER_START: 'PLANET_HOVER_START',
  PLANET_HOVER_END: 'PLANET_HOVER_END',
  SELECT: 'SELECT',
  BACK: 'BACK',
  ZOOM: 'ZOOM',
  ROTATE: 'ROTATE',
  STATE_CHANGE: 'STATE_CHANGE',
});

export class EventBus {
  #listeners = new Map();

  on(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Event listener must be a function.');
    }

    const eventListeners = this.#listeners.get(eventName) ?? new Set();
    eventListeners.add(listener);
    this.#listeners.set(eventName, eventListeners);

    return () => this.off(eventName, listener);
  }

  off(eventName, listener) {
    const eventListeners = this.#listeners.get(eventName);

    if (!eventListeners) {
      return false;
    }

    const removed = eventListeners.delete(listener);

    if (eventListeners.size === 0) {
      this.#listeners.delete(eventName);
    }

    return removed;
  }

  emit(eventName, payload = {}) {
    const eventListeners = this.#listeners.get(eventName);

    if (!eventListeners) {
      return;
    }

    [...eventListeners].forEach((listener) => listener(payload));
  }

  clear() {
    this.#listeners.clear();
  }
}
