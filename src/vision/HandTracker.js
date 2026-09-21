import { HAND_TRACKING_CONFIG } from '../config/visionConfig.js';

export const HAND_TRACKER_STATES = Object.freeze({
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  READY: 'READY',
  ERROR: 'ERROR',
  DISPOSED: 'DISPOSED',
});

/**
 * Owns the MediaPipe Hand Landmarker lifecycle.
 * Frame inference is added separately so model loading stays independently testable.
 */
export class HandTracker {
  constructor({ config = HAND_TRACKING_CONFIG, onStateChange, onResult } = {}) {
    this.config = config;
    this.onStateChange = onStateChange;
    this.onResult = onResult;
    this.state = HAND_TRACKER_STATES.IDLE;
    this.landmarker = null;
    this.initializationPromise = null;
    this.video = null;
    this.frameRequestId = null;
    this.usingVideoFrameCallback = false;
    this.isProcessing = false;
    this.lastVideoTime = -1;
  }

  async init() {
    if (this.landmarker && this.state === HAND_TRACKER_STATES.READY) {
      return this.landmarker;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.setState(HAND_TRACKER_STATES.LOADING);
    this.initializationPromise = this.createLandmarker();

    try {
      this.landmarker = await this.initializationPromise;
      this.setState(HAND_TRACKER_STATES.READY);
      return this.landmarker;
    } catch (cause) {
      const error = new Error('手部识别模型加载失败，鼠标操作仍可正常使用。', {
        cause,
      });
      error.name = 'HandTrackerInitializationError';
      this.setState(HAND_TRACKER_STATES.ERROR, { message: error.message });
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  async createLandmarker() {
    const { FilesetResolver, HandLandmarker } = await import(
      '@mediapipe/tasks-vision'
    );
    const vision = await FilesetResolver.forVisionTasks(this.config.wasmPath);

    return HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: this.config.modelPath,
        delegate: 'GPU',
      },
      runningMode: this.config.runningMode,
      numHands: this.config.numHands,
      minHandDetectionConfidence: this.config.minHandDetectionConfidence,
      minHandPresenceConfidence: this.config.minHandPresenceConfidence,
      minTrackingConfidence: this.config.minTrackingConfidence,
    });
  }

  setState(state, detail = {}) {
    this.state = state;
    this.onStateChange?.({ state, ...detail });
  }

  start(video) {
    if (!this.landmarker || this.state !== HAND_TRACKER_STATES.READY) {
      throw new Error('HandTracker must finish initialization before tracking.');
    }

    if (!(video instanceof HTMLVideoElement)) {
      throw new TypeError('HandTracker requires an HTMLVideoElement.');
    }

    this.stop();
    this.video = video;
    this.usingVideoFrameCallback =
      typeof this.video.requestVideoFrameCallback === 'function';
    this.scheduleNextFrame();
  }

  scheduleNextFrame() {
    if (!this.video) return;

    this.frameRequestId = this.usingVideoFrameCallback
      ? this.video.requestVideoFrameCallback(this.processFrame)
      : window.requestAnimationFrame(this.processFrame);
  }

  processFrame = (timestamp) => {
    if (!this.video) return;

    const videoTime = this.video.currentTime;
    const canProcess =
      !this.isProcessing &&
      this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      videoTime !== this.lastVideoTime;

    if (canProcess) {
      this.isProcessing = true;
      this.lastVideoTime = videoTime;

      try {
        const result = this.landmarker.detectForVideo(this.video, timestamp);
        this.onResult?.(this.normalizeResult(result, timestamp));
      } catch (error) {
        console.warn('A hand tracking frame could not be processed.', error);
      } finally {
        this.isProcessing = false;
      }
    }

    this.scheduleNextFrame();
  };

  normalizeResult(result, timestamp) {
    const sourceLandmarks = result.landmarks?.[0];

    if (!sourceLandmarks) {
      return {
        detected: false,
        handedness: null,
        landmarks: [],
        timestamp,
      };
    }

    const handedness = result.handedness?.[0]?.[0];

    return {
      detected: true,
      handedness: handedness?.categoryName ?? handedness?.displayName ?? null,
      landmarks: sourceLandmarks.map(({ x, y, z }) => ({
        // The interaction coordinates mirror the camera like a familiar selfie view.
        x: 1 - x,
        y,
        z,
      })),
      timestamp,
    };
  }

  stop() {
    if (this.frameRequestId !== null && this.video) {
      if (this.usingVideoFrameCallback) {
        this.video.cancelVideoFrameCallback?.(this.frameRequestId);
      } else {
        window.cancelAnimationFrame(this.frameRequestId);
      }
    }

    this.frameRequestId = null;
    this.video = null;
    this.isProcessing = false;
    this.lastVideoTime = -1;
  }

  dispose() {
    this.stop();
    this.landmarker?.close();
    this.landmarker = null;
    this.initializationPromise = null;
    this.setState(HAND_TRACKER_STATES.DISPOSED);
  }
}
