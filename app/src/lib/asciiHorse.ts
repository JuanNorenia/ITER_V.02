import { asciiHash, clamp, mix, wrap } from "./asciiGrid";
import type { AsciiGrid, AsciiPointer } from "./asciiGrid";

type Point = [number, number];
interface Shape {
  points: Point[];
  tone: number;
  erase?: boolean;
}
const TAU = Math.PI * 2;
const RAMP = " .:-=+*#%@";

function ellipse(cx: number, cy: number, rx: number, ry: number): Point[] {
  return Array.from({ length: 24 }, (_, index) => {
    const angle = (index / 24) * TAU;
    return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
  });
}

function cubic(a: Point, b: Point, c: Point, d: Point, steps = 12): Point[] {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const u = 1 - t;
    return [
      u ** 3 * a[0] +
        3 * u ** 2 * t * b[0] +
        3 * u * t ** 2 * c[0] +
        t ** 3 * d[0],
      u ** 3 * a[1] +
        3 * u ** 2 * t * b[1] +
        3 * u * t ** 2 * c[1] +
        t ** 3 * d[1],
    ];
  });
}

function taperedBone(
  a: Point,
  b: Point,
  startWidth: number,
  endWidth: number
): Point[] {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / length;
  const ny = (b[0] - a[0]) / length;
  return [
    [a[0] + nx * startWidth, a[1] + ny * startWidth],
    [b[0] + nx * endWidth, b[1] + ny * endWidth],
    [b[0] - nx * endWidth, b[1] - ny * endWidth],
    [a[0] - nx * startWidth, a[1] - ny * startWidth],
  ];
}

/** Two-bone IK keeps the lower limbs articulated throughout the continuous stride. */
function joint(a: Point, b: Point, upper: number, lower: number): Point {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const distance = Math.max(1, Math.hypot(dx, dy));
  const reach = clamp(distance, Math.abs(upper - lower) + 1, upper + lower - 1);
  const along = (upper ** 2 - lower ** 2 + reach ** 2) / (2 * reach);
  const bend = Math.sqrt(Math.max(0, upper ** 2 - along ** 2));
  return [
    a[0] + (dx / distance) * along - (dy / distance) * bend,
    a[1] + (dy / distance) * along + (dx / distance) * bend,
  ];
}

// Original contours in a 900 × 600 anatomical coordinate space, not traced assets.
const BODY: Point[] = [
  ...cubic([302, 223], [312, 164], [372, 155], [438, 173]),
  ...cubic([438, 173], [498, 182], [558, 183], [606, 176]),
  ...cubic([606, 176], [643, 158], [652, 90], [690, 48]),
  ...cubic([690, 48], [708, 30], [737, 42], [754, 53]),
  ...cubic([754, 53], [781, 56], [795, 77], [805, 94]),
  ...cubic([805, 94], [818, 103], [852, 112], [864, 130]),
  ...cubic([864, 130], [871, 150], [848, 162], [825, 151]),
  ...cubic([825, 151], [808, 144], [789, 129], [780, 134]),
  ...cubic([780, 134], [753, 158], [748, 206], [732, 245]),
  ...cubic([732, 245], [715, 291], [693, 322], [652, 321]),
  ...cubic([652, 321], [592, 314], [533, 334], [459, 313]),
  ...cubic([459, 313], [423, 343], [358, 343], [328, 307]),
  ...cubic([328, 307], [307, 282], [290, 259], [302, 223]),
];

function horseShapes(progress: number, tension: number): Shape[] {
  const angle = wrap(progress) * TAU;
  const shapes: Shape[] = [];
  const add = (points: Point[], tone: number, erase = false) =>
    shapes.push({ points, tone, erase });
  const leg = (front: boolean, offset: number, far: boolean) => {
    const stride = angle + offset * TAU;
    const hip: Point = front ? [665, 266] : [361, 274];
    const root: Point = [
      hip[0] + (front ? -25 : 40) + 12 * Math.cos(stride),
      hip[1] + 76,
    ];
    const foot: Point = [
      hip[0] + (front ? 146 : 153) * Math.cos(stride) * (1 + tension * 0.07),
      454 + 96 * Math.sin(stride),
    ];
    const knee = joint(root, foot, 108, 126);
    const tone = far ? 0.46 : 0.95;
    add(taperedBone(hip, root, front ? 28 : 40, front ? 15 : 22), tone);
    add(ellipse(root[0], root[1], front ? 15 : 23, 18), tone);
    add(taperedBone(root, knee, front ? 13 : 18, 9), tone);
    add(ellipse(knee[0], knee[1], 10, 11), tone);
    add(taperedBone(knee, foot, 8, 5), tone);
    add(ellipse(foot[0], foot[1], 7, 8), tone);
    add(
      [
        [foot[0] - 7, foot[1] + 1],
        [foot[0] + 9, foot[1] + 1],
        [foot[0] + 20, foot[1] + 17],
        [foot[0] - 10, foot[1] + 17],
      ],
      tone
    );
  };

  leg(false, 0.58, true);
  leg(true, 0.1, true);

  const tail = cubic(
    [319, 213],
    [229, 172 - 20 * Math.sin(angle)],
    [166, 279 + 35 * Math.cos(angle)],
    [41, 211 + 30 * Math.sin(angle + 0.8)],
    20
  );
  for (let index = 0; index < tail.length - 1; index++) {
    add(
      taperedBone(
        tail[index],
        tail[index + 1],
        mix(23, 2, index / tail.length),
        mix(23, 2, (index + 1) / tail.length)
      ),
      0.7
    );
  }

  add(BODY, 0.97);
  add(
    [
      [695, 49],
      [697, 5],
      [721, 41],
    ],
    0.97
  );
  add(
    [
      [735, 53],
      [751, 14],
      [753, 65],
    ],
    0.97
  );

  const mane = cubic([696, 47], [648, 65], [663, 124], [606, 183], 16);
  for (let index = 0; index < mane.length - 1; index++) {
    const wind = 8 * Math.sin(angle + index * 0.7);
    const a: Point = [mane[index][0] - 9 - wind, mane[index][1]];
    const b: Point = [mane[index + 1][0] - 9 - wind, mane[index + 1][1]];
    add(taperedBone(a, b, 10, 7), 0.67);
  }

  leg(false, 0.48, false);
  leg(true, 0, false);
  // Sparse muscle planes give the bright silhouette volume without visual noise.
  add(ellipse(375, 229, 45, 47), 0.79);
  add(ellipse(664, 253, 25, 37), 0.81);
  add(ellipse(779, 90, 5, 4), 0, true);
  add(ellipse(848, 133, 4, 3), 0.28);
  return shapes;
}

function rasterPolygon(
  mask: Float32Array,
  cols: number,
  rows: number,
  shape: Shape
) {
  const points = shape.points;
  const minY = Math.max(
    0,
    Math.floor(Math.min(...points.map(point => point[1])))
  );
  const maxY = Math.min(
    rows - 1,
    Math.ceil(Math.max(...points.map(point => point[1])))
  );
  for (let row = minY; row <= maxY; row++) {
    const y = row + 0.5;
    const hits: number[] = [];
    for (let index = 0; index < points.length; index++) {
      const a = points[index];
      const b = points[(index + 1) % points.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        hits.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
    }
    hits.sort((a, b) => a - b);
    for (let index = 0; index + 1 < hits.length; index += 2) {
      const left = Math.max(0, Math.floor(hits[index]));
      const right = Math.min(cols - 1, Math.ceil(hits[index + 1]) - 1);
      for (let col = left; col <= right; col++) {
        const coverage =
          Math.min(col + 1, hits[index + 1]) - Math.max(col, hits[index]);
        if (coverage < 0.04) continue;
        const cell = row * cols + col;
        // Coverage, rather than centre-only sampling, preserves slender legs on mobile.
        mask[cell] = shape.erase ? 0 : shape.tone * (0.65 + coverage * 0.35);
      }
    }
  }
}

export function horseCycleRate(pointer: AsciiPointer): number {
  return (
    0.82 +
    clamp(pointer.strength, 0, 1) *
      (0.35 + (clamp(pointer.x, -1, 1) + 1) * 0.28)
  );
}

export interface AsciiHorseFrame {
  horse: string;
  ground: string;
}

export function renderAsciiHorse(
  grid: AsciiGrid,
  progress: number,
  pointer: AsciiPointer
): AsciiHorseFrame {
  const angle = wrap(progress) * TAU;
  const strength = clamp(pointer.strength, 0, 1);
  const px = clamp(pointer.x, -1, 1) * strength;
  const py = clamp(pointer.y, -1, 1) * strength;
  const scale = Math.min((grid.width * 0.94) / 900, (grid.height * 0.88) / 600);
  const room = Math.max(0, grid.width / 2 - 450 * scale);
  const centreX = grid.width / 2 + px * room * 0.65;
  const baseY = grid.height * 0.94 - 590 * scale;
  const lift = -9 * Math.sin(angle * 2) + py * 7;
  const pitch = 0.013 * Math.sin(angle) + py * 0.012;
  const mask = new Float32Array(grid.cols * grid.rows);
  for (const shape of horseShapes(progress, px)) {
    rasterPolygon(mask, grid.cols, grid.rows, {
      ...shape,
      points: shape.points.map(([x, y]): Point => {
        const neck = clamp((x - 600) / 260, 0, 1);
        const dx = x - 450 + px * (y - 260) * 0.025;
        const dy = y + lift + neck * py * 9;
        return [
          (centreX + (dx - (dy - 260) * pitch) * scale) / grid.cellWidth,
          (baseY + (dy + dx * pitch) * scale) / grid.lineHeight,
        ];
      }),
    });
  }

  const horse: string[] = [];
  const ground: string[] = [];
  const groundRow = Math.min(grid.rows - 1, Math.floor(grid.rows * 0.96));
  const drift = Math.floor(wrap(progress) * 48);
  for (let row = 0; row < grid.rows; row++) {
    let silhouette = "";
    let track = "";
    for (let col = 0; col < grid.cols; col++) {
      const index = row * grid.cols + col;
      let tone = mask[index];
      if (tone > 0) {
        const edge =
          col === 0 ||
          col === grid.cols - 1 ||
          row === 0 ||
          row === grid.rows - 1 ||
          !mask[index - 1] ||
          !mask[index + 1] ||
          !mask[index - grid.cols] ||
          !mask[index + grid.cols];
        tone *= edge ? 0.79 : 0.94 + asciiHash(col, row) * 0.06;
      }
      silhouette +=
        RAMP[Math.min(RAMP.length - 1, Math.floor(tone * RAMP.length))];
      if (row === groundRow) track += (col + drift) % 7 < 3 ? "-" : " ";
      else if (row > groundRow - 4 && (col * 7 + row * 13 + drift) % 43 === 0)
        track += ".";
      else track += " ";
    }
    horse.push(silhouette);
    ground.push(track);
  }
  return { horse: horse.join("\n"), ground: ground.join("\n") };
}
