/**
 * Displays lightweight development information without affecting the scene.
 * Input: key/value debug data. Output: an optional on-screen diagnostics panel.
 */
export class DebugPanel {
  constructor({ root, enabled = false }) {
    this.root = root;
    this.enabled = enabled;
    this.visible = enabled;
    this.data = new Map();
    this.element = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  init() {
    if (!this.enabled) {
      return;
    }

    this.element = document.createElement('aside');
    this.element.className = 'debug-panel';
    this.element.setAttribute('aria-label', '开发调试信息');
    this.root.append(this.element);
    window.addEventListener('keydown', this.handleKeyDown);
    this.update('Debug', '按 D 隐藏');
  }

  handleKeyDown(event) {
    if (event.key.toLowerCase() !== 'd' || event.repeat) {
      return;
    }

    this.visible = !this.visible;
    this.element.hidden = !this.visible;

    if (this.visible) {
      this.update('Debug', '按 D 隐藏');
    }
  }

  update(label, value) {
    if (!this.enabled || !this.element) {
      return;
    }

    this.data.set(label, String(value));
    this.element.innerHTML = [...this.data]
      .map(
        ([name, currentValue]) =>
          `<div><span>${name}</span><strong>${currentValue}</strong></div>`,
      )
      .join('');
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.element?.remove();
    this.element = null;
    this.data.clear();
  }
}

