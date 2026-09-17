/**
 * Shows a simple full-screen loading message while core modules initialize.
 * Input: a root element and status text. Output: visible loading feedback.
 */
export class LoadingScreen {
  constructor({ root }) {
    this.root = root;
    this.element = null;
  }

  show(message = '正在进入宇宙…') {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'loading-screen';
      this.element.setAttribute('role', 'status');
      this.element.setAttribute('aria-live', 'polite');
      this.element.innerHTML = `
        <div class="loading-orbit" aria-hidden="true"></div>
        <p class="loading-message"></p>
      `;
      this.root.append(this.element);
    }

    this.element.querySelector('.loading-message').textContent = message;
    this.element.hidden = false;
  }

  setMessage(message) {
    const messageElement = this.element?.querySelector('.loading-message');

    if (messageElement) {
      messageElement.textContent = message;
    }
  }

  hide() {
    if (!this.element) {
      return;
    }

    this.element.classList.add('is-leaving');
    window.setTimeout(() => {
      if (this.element) {
        this.element.hidden = true;
        this.element.classList.remove('is-leaving');
      }
    }, 300);
  }

  destroy() {
    this.element?.remove();
    this.element = null;
  }
}

