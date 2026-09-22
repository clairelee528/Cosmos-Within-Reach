import { GESTURES } from '../gestures/GestureEngine.js';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** Displays the smoothed index-finger position as a projection-friendly cursor. */
export class GestureCursor {
  constructor({ root }) {
    this.root = root;
    this.element = null;
    this.enabled = true;
    this.hovered = false;
  }

  init() {
    this.element = document.createElement('div');
    this.element.className = 'gesture-cursor';
    this.element.hidden = true;
    this.element.setAttribute('aria-hidden', 'true');
    this.element.innerHTML = '<span></span>';
    this.root.append(this.element);
  }

  update(gestureFrame) {
    if (!this.enabled || !gestureFrame.cursor) {
      this.hide();
      return;
    }

    const x = clamp01(gestureFrame.cursor.x);
    const y = clamp01(gestureFrame.cursor.y);
    this.element.style.left = `${x * 100}%`;
    this.element.style.top = `${y * 100}%`;
    this.element.dataset.state =
      gestureFrame.stableGesture === GESTURES.PINCH
        ? 'pinch'
        : this.hovered
          ? 'hover'
          : 'default';
    this.element.hidden = false;
  }

  setHovered(value) {
    this.hovered = Boolean(value);
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (!this.enabled) this.hide();
  }

  hide() {
    if (this.element) this.element.hidden = true;
  }

  destroy() {
    this.element?.remove();
    this.element = null;
  }
}

