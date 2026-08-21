import { Vec2, Prism } from './types';
import {
  v2,
  vDist,
  vRotate,
  vAdd,
  isPointInPolygon,
  getPrismVertices,
  clamp,
} from './math';
import { initAudio, playPrismRotate } from './audio';

export interface DragState {
  prismIndex: number | null;
  mode: 'move' | 'rotate' | null;
  dragOffset: Vec2;
  rotOffset: number;
}

export class InputHandler {
  private canvas: HTMLCanvasElement;
  public mousePos: Vec2 = v2(0, 0);
  public dragState: DragState = {
    prismIndex: null,
    mode: null,
    dragOffset: v2(0, 0),
    rotOffset: 0,
  };
  public hoverPrismIndex: number | null = null;
  public hoverHandle: 'body' | 'rot' | null = null;

  private onStateChange?: () => void;

  constructor(canvas: HTMLCanvasElement, onStateChange?: () => void) {
    this.canvas = canvas;
    this.onStateChange = onStateChange;
    this.initEvents();
  }

  private getCanvasPos(e: MouseEvent | Touch): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    const side = Math.min(rect.width, rect.height) || 1000;
    const offsetX = (rect.width - side) / 2;
    const offsetY = (rect.height - side) / 2;
    return {
      x: (e.clientX - rect.left - offsetX) * (1000 / side),
      y: (e.clientY - rect.top - offsetY) * (1000 / side),
    };
  }

  private initEvents(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(this.getCanvasPos(e), e.button === 2));
    window.addEventListener('mousemove', (e) => this.handlePointerMove(this.getCanvasPos(e)));
    window.addEventListener('mouseup', () => this.handlePointerUp());

    // Context menu prevent for right-drag rotation
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mouse wheel for fine rotation
    this.canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        initAudio();
        if (this.hoverPrismIndex !== null) {
          const delta = Math.sign(e.deltaY) * 0.04;
          const prism = this.getPrisms()[this.hoverPrismIndex];
          if (prism && !prism.locked) {
            prism.rot += delta;
            if (prism.baseRot !== undefined) prism.baseRot = prism.rot;
            playPrismRotate(0.5);
            this.onStateChange?.();
          }
        }
      },
      { passive: false }
    );

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerDown(this.getCanvasPos(e.touches[0]), false);
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerMove(this.getCanvasPos(e.touches[0]));
      }
    });

    window.addEventListener('touchend', () => this.handlePointerUp());
  }

  // Delegate function to retrieve current active prisms from game
  public getPrisms: () => Prism[] = () => [];

  public updateHover(prisms: Prism[]): void {
    this.hoverPrismIndex = null;
    this.hoverHandle = null;

    for (let i = prisms.length - 1; i >= 0; i--) {
      const prism = prisms[i];
      if (prism.locked) continue;

      const s = prism.scale || 1;
      const rotGizmoPos = vAdd(prism.pos, vRotate({ x: 0, y: -50 * s }, prism.rot));

      // Test rotation handle hit (generous 18px hit radius for easy grabbing)
      if (vDist(this.mousePos, rotGizmoPos) <= 20) {
        this.hoverPrismIndex = i;
        this.hoverHandle = 'rot';
        this.canvas.style.cursor = 'grab';
        return;
      }

      // Test prism body hit
      const verts = getPrismVertices(prism);
      if (isPointInPolygon(this.mousePos, verts) || vDist(this.mousePos, prism.pos) <= 32 * s) {
        this.hoverPrismIndex = i;
        this.hoverHandle = 'body';
        this.canvas.style.cursor = 'move';
        return;
      }
    }

    this.canvas.style.cursor = 'default';
  }

  private handlePointerDown(pos: Vec2, isRightClick: boolean): void {
    initAudio();
    this.mousePos = pos;
    const prisms = this.getPrisms();
    this.updateHover(prisms);

    if (this.hoverPrismIndex !== null) {
      const prism = prisms[this.hoverPrismIndex];
      const isRotateMode = isRightClick || this.hoverHandle === 'rot';

      if (isRotateMode) {
        const currentMouseAngle = Math.atan2(pos.y - prism.pos.y, pos.x - prism.pos.x);
        this.dragState = {
          prismIndex: this.hoverPrismIndex,
          mode: 'rotate',
          dragOffset: v2(0, 0),
          rotOffset: currentMouseAngle - prism.rot,
        };
        this.canvas.style.cursor = 'grabbing';
      } else {
        this.dragState = {
          prismIndex: this.hoverPrismIndex,
          mode: 'move',
          dragOffset: { x: prism.pos.x - pos.x, y: prism.pos.y - pos.y },
          rotOffset: 0,
        };
      }
      this.onStateChange?.();
    }
  }

  private handlePointerMove(pos: Vec2): void {
    this.mousePos = pos;
    const prisms = this.getPrisms();

    if (this.dragState.prismIndex !== null) {
      const prism = prisms[this.dragState.prismIndex];
      if (prism && !prism.locked) {
        if (this.dragState.mode === 'move') {
          prism.pos.x = clamp(pos.x + this.dragState.dragOffset.x, 60, 1000 - 60);
          prism.pos.y = clamp(pos.y + this.dragState.dragOffset.y, 60, 1000 - 60);
          if (prism.basePos) {
            prism.basePos.x = prism.pos.x;
            prism.basePos.y = prism.pos.y;
          }
          playPrismRotate(0.2);
        } else if (this.dragState.mode === 'rotate') {
          const currentMouseAngle = Math.atan2(pos.y - prism.pos.y, pos.x - prism.pos.x);
          const oldRot = prism.rot;
          prism.rot = currentMouseAngle - this.dragState.rotOffset;
          if (prism.baseRot !== undefined) {
            prism.baseRot = prism.rot;
          }
          playPrismRotate(Math.abs(prism.rot - oldRot) * 10);
        }
        this.onStateChange?.();
      }
    } else {
      this.updateHover(prisms);
    }
  }

  private handlePointerUp(): void {
    if (this.dragState.prismIndex !== null) {
      this.dragState = {
        prismIndex: null,
        mode: null,
        dragOffset: v2(0, 0),
        rotOffset: 0,
      };
      this.canvas.style.cursor = 'default';
      this.updateHover(this.getPrisms());
      this.onStateChange?.();
    }
  }
}
