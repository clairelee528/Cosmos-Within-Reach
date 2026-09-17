/**
 * Stores the application's top-level state and validates state transitions.
 * Input: a requested state name. Output: the current state and change events.
 */

export const APP_STATES = Object.freeze({
  BOOT: 'BOOT',
  CALIBRATION: 'CALIBRATION',
  OVERVIEW: 'OVERVIEW',
  TRANSITION: 'TRANSITION',
  EXPLORE: 'EXPLORE',
});

const DEFAULT_TRANSITIONS = Object.freeze({
  [APP_STATES.BOOT]: [APP_STATES.CALIBRATION, APP_STATES.OVERVIEW],
  [APP_STATES.CALIBRATION]: [APP_STATES.OVERVIEW],
  [APP_STATES.OVERVIEW]: [APP_STATES.CALIBRATION, APP_STATES.TRANSITION],
  [APP_STATES.TRANSITION]: [APP_STATES.EXPLORE, APP_STATES.OVERVIEW],
  [APP_STATES.EXPLORE]: [APP_STATES.TRANSITION, APP_STATES.OVERVIEW],
});

export class AppState {
  #current;
  #listeners = new Set();

  constructor(initialState = APP_STATES.BOOT) {
    if (!Object.values(APP_STATES).includes(initialState)) {
      throw new Error(`Unknown initial application state: ${initialState}`);
    }

    this.#current = initialState;
  }

  get current() {
    return this.#current;
  }

  canTransition(nextState) {
    return DEFAULT_TRANSITIONS[this.#current]?.includes(nextState) ?? false;
  }

  transitionTo(nextState, metadata = {}) {
    if (nextState === this.#current) {
      return false;
    }

    if (!this.canTransition(nextState)) {
      throw new Error(
        `Invalid application state transition: ${this.#current} -> ${nextState}`,
      );
    }

    const previousState = this.#current;
    this.#current = nextState;

    const change = {
      previousState,
      currentState: nextState,
      metadata,
    };

    this.#listeners.forEach((listener) => listener(change));
    return true;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('AppState listener must be a function.');
    }

    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}

