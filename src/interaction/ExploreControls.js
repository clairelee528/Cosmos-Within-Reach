import { EVENTS } from '../app/EventBus.js';

/** Mouse controls used only while inspecting a selected planet. */
export class ExploreControls {
  constructor({ canvas, events }) {
    this.canvas = canvas;
    this.events = events;
    this.enabled = false;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  init() {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    window.addEventListener('keydown', this.handleKeyDown);
  }

  handlePointerDown = (event) => {
    if (!this.enabled || event.button !== 0) return;
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.canvas.setPointerCapture?.(event.pointerId);
  };

  handlePointerMove = (event) => {
    if (!this.enabled || !this.dragging) return;
    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.events.emit(EVENTS.ROTATE, { deltaX, deltaY });
  };

  handlePointerUp = () => {
    this.dragging = false;
  };

  handleWheel = (event) => {
    if (!this.enabled) return;
    event.preventDefault();
    this.events.emit(EVENTS.ZOOM, { delta: event.deltaY / 1000 });
  };

  handleKeyDown = (event) => {
    if (!this.enabled || event.key !== 'Escape') return;
    this.events.emit(EVENTS.BACK, { source: 'keyboard' });
  };

  setEnabled(value) {
    this.enabled = value;
    if (!value) this.dragging = false;
    this.canvas.classList.toggle('is-exploring', value);
  }

  dispose() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
