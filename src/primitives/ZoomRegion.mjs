/**
 * ZoomRegion.mjs — Focus Camera Punch & Spring Zoom Transform
 * 
 * Provides smooth spring-interpolated camera zoom into specific UI coordinates.
 * Strictly adheres to the Decoupled Motion Invariant:
 * Camera motion settles completely before any pointer motion begins.
 */

import { computeCameraTransform } from '../geometry/viewport.mjs';

export class ZoomRegionController {
  constructor(options = {}) {
    this.aspectKey = options.aspectKey || '16:9';
    this.targetPoint = options.targetPoint || { x: 960, y: 540 };
    this.zoomLevel = options.zoomLevel || 1.0;
  }

  setTarget(point, zoom = 1.8) {
    this.targetPoint = point;
    this.zoomLevel = zoom;
  }

  reset() {
    this.zoomLevel = 1.0;
  }

  /**
   * Generates SVG transform string for the camera wrapper at given progress (0..1).
   * @param {number} progress - Eased animation progress (0..1)
   * @returns {string} SVG transform attribute value
   */
  getTransform(progress = 1.0) {
    const currentZoom = 1.0 + (this.zoomLevel - 1.0) * progress;
    const { scale, translateX, translateY } = computeCameraTransform(
      this.targetPoint,
      currentZoom,
      this.aspectKey
    );

    return `translate(${translateX}, ${translateY}) scale(${scale})`;
  }
}
