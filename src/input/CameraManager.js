const DEFAULT_CONSTRAINTS = Object.freeze({
  audio: false,
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user',
  },
});

export const CAMERA_STATES = Object.freeze({
  IDLE: 'IDLE',
  REQUESTING: 'REQUESTING',
  READY: 'READY',
  ERROR: 'ERROR',
  STOPPED: 'STOPPED',
});

export class CameraError extends Error {
  constructor({ code, message, cause }) {
    super(message, { cause });
    this.name = 'CameraError';
    this.code = code;
  }
}

/**
 * Owns browser camera permission, stream lifecycle, and the video frame source.
 * Input: optional media constraints. Output: a ready-to-read HTMLVideoElement.
 */
export class CameraManager {
  constructor({ constraints = DEFAULT_CONSTRAINTS, onStateChange } = {}) {
    this.constraints = constraints;
    this.onStateChange = onStateChange;
    this.state = CAMERA_STATES.IDLE;
    this.stream = null;
    this.video = null;
  }

  async start() {
    if (this.state === CAMERA_STATES.READY && this.video) {
      return this.video;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw this.setError(
        new CameraError({
          code: 'UNSUPPORTED',
          message: '当前浏览器不支持摄像头访问，请使用最新版 Chrome 或 Edge。',
        }),
      );
    }

    this.setState(CAMERA_STATES.REQUESTING);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      this.video = this.createVideoElement(this.stream);
      await this.video.play();
      this.setState(CAMERA_STATES.READY, this.getVideoDetails());
      return this.video;
    } catch (error) {
      this.stopTracks();
      throw this.setError(this.normalizeError(error));
    }
  }

  createVideoElement(stream) {
    const video = document.createElement('video');
    video.className = 'camera-source';
    video.setAttribute('aria-hidden', 'true');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    return video;
  }

  getVideoDetails() {
    const track = this.stream?.getVideoTracks()[0];
    const settings = track?.getSettings?.() ?? {};

    return {
      width: settings.width ?? this.video?.videoWidth ?? 640,
      height: settings.height ?? this.video?.videoHeight ?? 480,
      deviceLabel: track?.label || 'Camera',
    };
  }

  normalizeError(error) {
    const errors = {
      NotAllowedError: {
        code: 'PERMISSION_DENIED',
        message: '摄像头权限未开启。鼠标操作仍可使用；请允许访问后刷新页面。',
      },
      NotFoundError: {
        code: 'DEVICE_NOT_FOUND',
        message: '没有检测到可用摄像头。鼠标操作仍可正常使用。',
      },
      NotReadableError: {
        code: 'DEVICE_BUSY',
        message: '摄像头正被其他应用占用。关闭占用程序后刷新页面即可重试。',
      },
      OverconstrainedError: {
        code: 'CONSTRAINT_FAILED',
        message: '摄像头不支持当前画面设置，请更换设备后重试。',
      },
      SecurityError: {
        code: 'SECURITY_ERROR',
        message: '浏览器阻止了摄像头访问，请确认页面通过 localhost 或 HTTPS 打开。',
      },
    };
    const fallback = {
      code: 'UNKNOWN',
      message: '摄像头启动失败。鼠标操作仍可使用，请刷新页面重试。',
    };
    const detail = errors[error?.name] ?? fallback;

    return new CameraError({ ...detail, cause: error });
  }

  setError(error) {
    this.setState(CAMERA_STATES.ERROR, {
      code: error.code,
      message: error.message,
    });
    return error;
  }

  setState(state, detail = {}) {
    this.state = state;
    this.onStateChange?.({ state, ...detail });
  }

  stopTracks() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  stop() {
    this.stopTracks();
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video.remove();
      this.video = null;
    }
    this.setState(CAMERA_STATES.STOPPED);
  }
}

