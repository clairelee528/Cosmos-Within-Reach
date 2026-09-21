import { CAMERA_STATES } from '../input/CameraManager.js';

/** Displays camera setup feedback without blocking the mouse experience. */
export class CameraStatus {
  constructor({ root }) {
    this.root = root;
    this.element = null;
    this.hideTimer = null;
  }

  init() {
    this.element = document.createElement('aside');
    this.element.className = 'camera-status';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.hidden = true;
    this.root.append(this.element);
  }

  update({ state, message }) {
    if (!this.element) return;

    window.clearTimeout(this.hideTimer);
    this.element.dataset.state = state;

    if (state === CAMERA_STATES.REQUESTING) {
      this.show('请在浏览器提示中允许使用摄像头…');
      return;
    }

    if (state === CAMERA_STATES.READY) {
      this.show('摄像头已连接');
      this.hideTimer = window.setTimeout(() => this.hide(), 2200);
      return;
    }

    if (state === CAMERA_STATES.ERROR) {
      this.show(message);
    }
  }

  showTemporary(message, { state = CAMERA_STATES.READY, duration = 2200 } = {}) {
    if (!this.element) return;

    window.clearTimeout(this.hideTimer);
    this.element.dataset.state = state;
    this.show(message);
    this.hideTimer = window.setTimeout(() => this.hide(), duration);
  }

  show(message) {
    this.element.textContent = message;
    this.element.hidden = false;
  }

  hide() {
    if (this.element) this.element.hidden = true;
  }

  destroy() {
    window.clearTimeout(this.hideTimer);
    this.element?.remove();
    this.element = null;
  }
}
