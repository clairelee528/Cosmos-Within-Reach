import {
  FINGERTIP_INDICES,
  HAND_CONNECTIONS,
} from '../vision/handLandmarks.js';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

/** Renders the mirrored camera feed and MediaPipe landmarks for calibration. */
export class HandDebugView {
  constructor({ root }) {
    this.root = root;
    this.element = null;
    this.canvas = null;
    this.context = null;
    this.statusElement = null;
    this.fpsElement = null;
    this.video = null;
    this.visible = false;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsWindowStartedAt = performance.now();
  }

  init() {
    this.element = document.createElement('aside');
    this.element.className = 'hand-debug-view';
    this.element.hidden = true;
    this.element.setAttribute('aria-label', '手部追踪调试画面');
    this.element.innerHTML = `
      <header class="hand-debug-header">
        <span>HAND TRACKING</span>
        <strong data-hand-status>No hand</strong>
        <span data-hand-fps>0 FPS</span>
      </header>
      <canvas width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
      <p>H · Hide debug view</p>
    `;
    this.canvas = this.element.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.statusElement = this.element.querySelector('[data-hand-status]');
    this.fpsElement = this.element.querySelector('[data-hand-fps]');
    this.root.append(this.element);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  setVideo(video) {
    this.video = video;
  }

  handleKeyDown = (event) => {
    if (event.key.toLowerCase() !== 'h' || event.repeat) return;

    this.visible = !this.visible;
    this.element.hidden = !this.visible;
  };

  update(result) {
    this.updateFps(result.timestamp);
    this.statusElement.textContent = result.detected
      ? `${result.handedness ?? 'Unknown'} · ${result.landmarks.length} points`
      : 'No hand';

    if (!this.visible) return;

    this.drawVideo();
    if (result.detected) this.drawSkeleton(result.landmarks);
  }

  updateFps(timestamp) {
    this.frameCount += 1;
    const elapsed = timestamp - this.fpsWindowStartedAt;

    if (elapsed < 500) return;

    this.fps = Math.round((this.frameCount * 1000) / elapsed);
    this.fpsElement.textContent = `${this.fps} FPS`;
    this.frameCount = 0;
    this.fpsWindowStartedAt = timestamp;
  }

  drawVideo() {
    const { context } = this;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.save();
    context.translate(CANVAS_WIDTH, 0);
    context.scale(-1, 1);
    context.drawImage(this.video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.restore();
  }

  drawSkeleton(landmarks) {
    const { context } = this;
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(97, 211, 255, 0.82)';
    context.shadowColor = 'rgba(78, 166, 255, 0.65)';
    context.shadowBlur = 8;

    HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
      const start = landmarks[startIndex];
      const end = landmarks[endIndex];
      context.beginPath();
      context.moveTo(start.x * CANVAS_WIDTH, start.y * CANVAS_HEIGHT);
      context.lineTo(end.x * CANVAS_WIDTH, end.y * CANVAS_HEIGHT);
      context.stroke();
    });

    landmarks.forEach((landmark, index) => {
      const isFingertip = FINGERTIP_INDICES.includes(index);
      context.beginPath();
      context.arc(
        landmark.x * CANVAS_WIDTH,
        landmark.y * CANVAS_HEIGHT,
        isFingertip ? 7 : 5,
        0,
        Math.PI * 2,
      );
      context.fillStyle = isFingertip ? '#ffe6a3' : '#f4f8ff';
      context.fill();
    });

    context.shadowBlur = 0;
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.element?.remove();
    this.element = null;
    this.canvas = null;
    this.context = null;
    this.video = null;
  }
}

