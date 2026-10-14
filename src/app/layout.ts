/**
 * Fixed 16:9 stage. Everything (canvas + HTML overlay) is laid out in stage pixels and the
 * whole stage is uniformly scaled + letterboxed to fit the window.
 */
export const STAGE_W = 1920;
export const STAGE_H = 1080;
/** Right-hand shop / upgrade panel width (stage px). */
export const PANEL_W = 400;
/** The map is rendered into this stage-space rectangle (left of the panel). */
export const MAP_VIEWPORT = { x: 0, y: 0, w: STAGE_W - PANEL_W, h: STAGE_H } as const;
/** Camera tilt from horizontal, degrees (spec: ~75°). */
export const CAMERA_TILT_DEG = 75;
