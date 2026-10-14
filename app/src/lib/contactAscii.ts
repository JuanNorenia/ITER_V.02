type Point = { x: number; y: number };

export function contactAsciiFrame(
  cols: number,
  rows: number,
  phase: number,
  pointer?: Point,
): string {
  const ramp = " .:+*#";
  const u = ((phase % 1) + 1) % 1;
  const build = Math.min(1, u / 0.3);
  const shift = u < 0.3 ? 0 : Math.sin(((u - 0.3) / 0.7) * Math.PI) * 0.12;
  const cut = u > 0.65 ? (u - 0.65) / 0.35 : -1;
  const lines: string[] = [];

  for (let row = 0; row < rows; row++) {
    const y = row / Math.max(1, rows - 1);
    let line = "";
    for (let col = 0; col < cols; col++) {
      let x = col / Math.max(1, cols - 1);
      let density = (col + row * 3) % 7 === 0 ? 0.2 : 0;
      if (pointer) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const influence = Math.exp(-(dx * dx + dy * dy) / 0.018);
        x += dx * influence * 0.6;
        density += influence * 0.3;
      }
      for (let module = 0; module < 6; module++) {
        if (module / 6 > build) continue;
        const cx = 0.16 + (module % 2) * 0.62 + (module % 2 ? -shift : shift);
        const cy = 0.17 + Math.floor(module / 2) * 0.3;
        const inside = Math.abs(x - cx) < 0.09 && Math.abs(y - cy) < 0.055;
        if (inside) density = Math.max(density, 0.55 + (module % 3) * 0.18);
      }
      if (cut >= 0 && Math.abs(x - cut - (y - 0.5) * 0.2) < 0.045) density = 0;
      line += ramp[Math.min(ramp.length - 1, Math.floor(density * ramp.length))];
    }
    lines.push(line);
  }
  return lines.join("\n");
}
