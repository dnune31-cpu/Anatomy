/**
 * RENDERER CONTRACT — implemented by src/render/renderer.ts (`createRenderer`).
 * The renderer only READS simulation state; it never mutates it.
 */
import type { MapData } from '../data/types';
import type { AnyTowerId, SimEvent, Simulation, Vec2 } from '../sim/types';

export interface PlacementGhost {
  towerId: AnyTowerId;
  x: number;
  y: number;
  valid: boolean;
  /** Range circle radius to draw. */
  range: number;
}

export interface LoadProgress {
  loaded: number;
  total: number;
  label: string;
}

export interface Renderer {
  readonly canvas: HTMLCanvasElement;
  /** Load the map GLB/JSON visuals + all shared assets (towers/enemies/heroes) not yet loaded. */
  loadMap(map: MapData, onProgress?: (p: LoadProgress) => void): Promise<void>;
  /** Attach (or detach with null) the live simulation to draw. */
  setSimulation(sim: Simulation | null): void;
  /** Feed this frame's sim events (pops, explosions, beams…) to spawn VFX / damage numbers / shake. */
  handleEvents(events: SimEvent[]): void;
  /** Draw a frame. `realDt` = wall-clock seconds since last frame; `gameSpeed` 0 (paused) / 1 / 3. */
  render(realDt: number, gameSpeed: number): void;
  /** Convert a client (CSS px) point to sim coords, or null if outside the map viewport. */
  screenToWorld(clientX: number, clientY: number): Vec2 | null;
  /** Convert sim coords to client (CSS px) coords. */
  worldToClient(x: number, y: number): Vec2;
  setGhost(ghost: PlacementGhost | null): void;
  /** Highlight + range circle for the selected tower (uid) or null. */
  setSelected(uid: number | null): void;
  /** Show a target marker preview (silo reticle / patrol point placement). */
  setPointMarker(p: Vec2 | null, kind?: 'reticle' | 'patrol' | 'lock'): void;
  /** Mobile pinch-zoom / pan of the orthographic camera. zoom 1 = fit. */
  setZoom(zoom: number, anchorClient?: Vec2): void;
  panBy(dxClient: number, dyClient: number): void;
  getZoom(): number;
  /** Must be called when the stage is resized/rescaled. */
  resize(): void;
  /** Trigger camera shake (0..1). */
  shake(intensity: number): void;
  dispose(): void;
}

export interface RendererOptions {
  /** Element that the canvas is appended to (the scaled stage). */
  container: HTMLElement;
  /** Quality preset; 'low' disables outlines/shadows/extra particles (phones). */
  quality?: 'low' | 'medium' | 'high';
}
