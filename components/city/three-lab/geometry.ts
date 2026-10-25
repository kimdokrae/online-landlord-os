import { BufferGeometry, Float32BufferAttribute, Color, Shape, ExtrudeGeometry, Vector3, CatmullRomCurve3 } from "three";

export const GROUND = .2;
export const walkCurve = new CatmullRomCurve3([
  new Vector3(-2.8, GROUND + .025, 2.9), new Vector3(-3, GROUND + .025, 1.45),
  new Vector3(-1.7, GROUND + .025, .65), new Vector3(.4, GROUND + .025, .6),
  new Vector3(2.8, GROUND + .025, 1.45), new Vector3(2.5, GROUND + .025, 3.15),
  new Vector3(.2, GROUND + .025, 3.8),
], true, "catmullrom", .3);

/** Concentric organic rings are actual triangles, with an opaque grass cap. */
export function islandGeometry(rings: { r: number; y: number }[], cap = false, colored = false) {
  const positions: number[] = [], indices: number[] = [], colors: number[] = [];
  const segments = 96;
  rings.forEach((ring, row) => {
    for (let j = 0; j <= segments; j++) {
      const a = j / segments * Math.PI * 2;
      const radius = ring.r * (1 + .045 * Math.sin(a * 3 + .7) + .023 * Math.sin(a * 7));
      positions.push(Math.cos(a) * radius, ring.y, Math.sin(a) * radius * .79);
      const c = new Color().lerpColors(new Color("#b38f91"), new Color("#dfbea4"), row / (rings.length - 1));
      c.multiplyScalar(.97 + .03 * Math.cos(a * 9)); colors.push(c.r, c.g, c.b);
      if (row > 0 && j < segments) { const b = row * (segments + 1) + j; indices.push(b, b + 1, b - segments - 1, b + 1, b - segments, b - segments - 1); }
    }
  });
  if (cap) {
    const center = positions.length / 3; positions.push(0, rings.at(-1)!.y, 0); colors.push(1, 1, 1);
    const start = (rings.length - 1) * (segments + 1);
    for (let j = 0; j < segments; j++) indices.push(center, start + j + 1, start + j);
  }
  const geometry = new BufferGeometry(); geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  if (colored) geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}
export function pathGeometry(curve: CatmullRomCurve3, width: number) {
  const points = curve.getPoints(120), positions: number[] = [], indices: number[] = [];
  points.forEach((p, i) => {
    const tangent = curve.getTangent(i / (points.length - 1)); const side = new Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width / 2);
    positions.push(p.x + side.x, p.y, p.z + side.z, p.x - side.x, p.y, p.z - side.z);
    if (i < points.length - 1) { const k = i * 2; indices.push(k, k + 2, k + 1, k + 2, k + 3, k + 1); }
  });
  const g = new BufferGeometry(); g.setAttribute("position", new Float32BufferAttribute(positions, 3)); g.setIndex(indices); g.computeVertexNormals(); return g;
}
export function roofGeometry(width: number, height: number, depth: number) {
  const shape = new Shape(); shape.moveTo(-width / 2, 0); shape.lineTo(0, height); shape.lineTo(width / 2, 0); shape.closePath();
  const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .07, bevelThickness: .07, bevelSegments: 3, steps: 1 });
  geometry.translate(0, 0, -depth / 2); return geometry;
}
export function heartGeometry() {
  const s = new Shape(); s.moveTo(0, 0); s.bezierCurveTo(-.33, .23, -.25, .49, 0, .27); s.bezierCurveTo(.25, .49, .33, .23, 0, 0);
  const g = new ExtrudeGeometry(s, { depth: .06, bevelEnabled: true, bevelSize: .018, bevelThickness: .018, bevelSegments: 2, curveSegments: 10 }); g.translate(0, 0, -.03); return g;
}
