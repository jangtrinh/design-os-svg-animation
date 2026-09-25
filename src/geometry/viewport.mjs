/**
 * viewport.mjs — Multi-Aspect Viewport Engine & Safe Zone Geometry
 * 
 * Manages responsive coordinate systems, safe-zone bounding boxes, and camera
 * framing across 16:9 (Widescreen), 9:16 (Vertical Social), and 1:1 (Square Feed).
 * Zero black letterbox policy: layouts adapt spatially per aspect ratio.
 */

export const ASPECT_RATIOS = {
  '16:9': {
    id: '16:9',
    width: 1920,
    height: 1080,
    aspect: 16 / 9,
    label: 'Widescreen (YouTube, Web Hero)',
    safeZone: {
      left: 96,    // 5% margin
      top: 54,     // 5% margin
      right: 1824, // 95% margin
      bottom: 1026,// 95% margin
      width: 1728, // 90% inner width
      height: 972  // 90% inner height
    }
  },
  '9:16': {
    id: '9:16',
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    label: 'Vertical Short-Form (TikTok, Reels, Shorts)',
    safeZone: {
      left: 108,   // 10% side padding
      top: 230,    // 12% top avoidance (Search bar, status, brand bar)
      right: 972,  // 90% side padding
      bottom: 1574,// 18% bottom avoidance (Caption text, audio title, like/share buttons)
      width: 864,  // 80% inner width
      height: 1344 // 70% safe vertical height
    }
  },
  '1:1': {
    id: '1:1',
    width: 1080,
    height: 1080,
    aspect: 1,
    label: 'Square Feed (LinkedIn, X, Instagram)',
    safeZone: {
      left: 81,    // 7.5% margin
      top: 81,     // 7.5% margin
      right: 999,  // 92.5% margin
      bottom: 999, // 92.5% margin
      width: 918,  // 85% inner width
      height: 918  // 85% inner height
    }
  }
};

/**
 * Returns configuration profile for specified aspect ratio.
 * @param {string} aspectKey - '16:9' | '9:16' | '1:1'
 */
export function getViewportConfig(aspectKey = '16:9') {
  const config = ASPECT_RATIOS[aspectKey];
  if (!config) {
    throw new Error(`[Viewport] Unsupported aspect ratio: "${aspectKey}". Valid: "16:9", "9:16", "1:1"`);
  }
  return config;
}

/**
 * Validates whether a given bounding box fits strictly inside the aspect ratio's safe zone.
 * @param {object} bounds - { x, y, width, height }
 * @param {string} aspectKey - Target aspect ratio
 * @returns {object} { isSafe: boolean, violations: string[] }
 */
export function auditSafeZone(bounds, aspectKey = '16:9') {
  const { safeZone } = getViewportConfig(aspectKey);
  const violations = [];

  const left = bounds.x;
  const top = bounds.y;
  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;

  if (left < safeZone.left) {
    violations.push(`Element crosses left safe margin (x=${left} < ${safeZone.left})`);
  }
  if (top < safeZone.top) {
    violations.push(`Element crosses top safe margin (y=${top} < ${safeZone.top})`);
  }
  if (right > safeZone.right) {
    violations.push(`Element crosses right safe margin (right=${right} > ${safeZone.right})`);
  }
  if (bottom > safeZone.bottom) {
    violations.push(`Element crosses bottom safe margin (bottom=${bottom} > ${safeZone.bottom})`);
  }

  return {
    isSafe: violations.length === 0,
    violations,
    safeZone
  };
}

/**
 * Computes camera pan and zoom transform to focus on a target coordinate
 * while clamping within safe zone boundaries.
 * 
 * @param {object} targetPoint - { x, y } in scene coordinates
 * @param {number} zoomLevel - Desired zoom factor (e.g. 1.5 - 2.5)
 * @param {string} aspectKey - Target aspect ratio
 * @returns {object} { scale: number, translateX: number, translateY: number }
 */
export function computeCameraTransform(targetPoint, zoomLevel = 1.0, aspectKey = '16:9') {
  const { width, height, safeZone } = getViewportConfig(aspectKey);

  if (zoomLevel <= 1.0) {
    return { scale: 1.0, translateX: 0, translateY: 0 };
  }

  // Desired center is targetPoint
  const centerX = width / 2;
  const centerY = height / 2;

  // Translate required to place targetPoint at viewport center
  let dx = (centerX - targetPoint.x) * zoomLevel;
  let dy = (centerY - targetPoint.y) * zoomLevel;

  // Bounds clamping to avoid showing empty void margins outside canvas
  const maxDx = ((zoomLevel - 1) * width) / 2;
  const maxDy = ((zoomLevel - 1) * height) / 2;

  dx = Math.max(-maxDx, Math.min(maxDx, dx));
  dy = Math.max(-maxDy, Math.min(maxDy, dy));

  return {
    scale: Number(zoomLevel.toFixed(4)),
    translateX: Number(dx.toFixed(2)),
    translateY: Number(dy.toFixed(2))
  };
}
