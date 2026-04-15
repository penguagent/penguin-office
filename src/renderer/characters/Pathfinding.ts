interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export function findPath(
  grid: boolean[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): { x: number; y: number }[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const sx = Math.round(startX);
  const sy = Math.round(startY);
  const ex = Math.round(endX);
  const ey = Math.round(endY);

  if (ex < 0 || ex >= cols || ey < 0 || ey >= rows) return [];
  if (grid[ey]![ex]) return [];

  const openSet: Node[] = [];
  const closedSet = new Set<string>();

  const start: Node = { x: sx, y: sy, g: 0, h: heuristic(sx, sy, ex, ey), f: 0, parent: null };
  start.f = start.g + start.h;
  openSet.push(start);

  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    if (current.x === ex && current.y === ey) {
      return reconstructPath(current);
    }

    closedSet.add(`${current.x},${current.y}`);

    for (const [dx, dy] of directions) {
      const nx = current.x + dx!;
      const ny = current.y + dy!;
      const key = `${nx},${ny}`;

      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      if (grid[ny]![nx]) continue;
      if (closedSet.has(key)) continue;

      // Prevent diagonal cutting through obstacles
      if (dx !== 0 && dy !== 0) {
        if (grid[current.y]![current.x + dx!] || grid[current.y + dy!]![current.x]) continue;
      }

      const moveCost = dx !== 0 && dy !== 0 ? 1.414 : 1;
      const g = current.g + moveCost;
      const existing = openSet.find((n) => n.x === nx && n.y === ny);

      if (!existing) {
        const h = heuristic(nx, ny, ex, ey);
        openSet.push({ x: nx, y: ny, g, h, f: g + h, parent: current });
      } else if (g < existing.g) {
        existing.g = g;
        existing.f = g + existing.h;
        existing.parent = current;
      }
    }
  }

  return [];
}

function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function reconstructPath(node: Node): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  let current: Node | null = node;
  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  return path;
}
