import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { AssemblyState } from './engine';
import './viewer.css';

type Mode = 'exploded' | 'assembled' | 'progress';
interface Props {
  state: AssemblyState;
  mode: Mode;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
  command?: { type: string; nonce: number };
}
type Point = [number, number, number];
type Part = { id: string; name: string; step: number; size: Point; home: Point; apart: Point; label: Point };
const PARTS: Part[] = [
  { id: 'D1', name: 'Base inferior', step: 1, size: [1.94, .13, 1.34], home: [0, .28, 0], apart: [0, .2, .12], label: [.4, -.04, .68] },
  { id: 'B1', name: 'Panel izquierdo', step: 2, size: [.13, 1.69, 1.24], home: [-.9, 1.19, 0], apart: [-1.37, 1.2, .03], label: [-.19, .03, .43] },
  { id: 'B2', name: 'Panel derecho', step: 2, size: [.13, 1.69, 1.24], home: [.9, 1.19, 0], apart: [1.37, 1.2, .03], label: [.19, .04, -.05] },
  { id: 'C1', name: 'Repisa central', step: 3, size: [1.67, .11, 1.08], home: [0, 1.06, .06], apart: [0, 1.3, .08], label: [.08, .1, .52] },
  { id: 'B7', name: 'Travesaño posterior', step: 4, size: [1.67, .32, .1], home: [0, 1.8, -.57], apart: [.15, 1.93, -1.05], label: [.8, .14, .03] },
  { id: 'A1', name: 'Panel superior', step: 5, size: [2.08, .15, 1.48], home: [0, 2.11, 0], apart: [0, 2.8, 0], label: [-.15, .17, -.13] },
  { id: 'F1', name: 'Patas protectoras', step: 7, size: [.13, .13, .13], home: [0, 0, 0], apart: [0, -.32, 0], label: [-.69, .1, .52] },
  { id: 'S1', name: 'Tornillos de montaje', step: 6, size: [.1, .1, .1], home: [0, 0, 0], apart: [0, 0, 0], label: [1.43, 2.35, .46] },
];
type VisualPart = { spec: Part; group: THREE.Group; materials: THREE.MeshStandardMaterial[]; edges: THREE.LineSegments[] };
type Runtime = { camera: THREE.PerspectiveCamera; controls: OrbitControls; parts: VisualPart[]; replayUntil: number; focus: (id: string | null) => void; reset: () => void };

// A deterministic, locally generated oak surface: the viewer never needs a remote model or texture.
function oakTexture(seed: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  let n = seed;
  const rand = () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; };
  ctx.fillStyle = '#d9b184'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1450; i++) {
    const x = rand() * 512, width = .3 + rand() * 1.5;
    ctx.strokeStyle = `rgba(${rand() > .5 ? '107,65,30' : '255,236,198'},${.025 + rand() * .13})`;
    ctx.lineWidth = width; ctx.beginPath();
    const drift = rand() * 7, phase = rand() * 7;
    for (let y = -12; y < 530; y += 8) {
      const xx = x + Math.sin(y / 100 + phase) * drift + Math.sin(y / 38 + phase) * 1.1;
      if (y === -12) ctx.moveTo(xx, y); else ctx.lineTo(xx, y);
    }
    ctx.stroke();
  }
  for (let k = 0; k < 2; k++) {
    const x = 80 + rand() * 350, y = 80 + rand() * 350;
    for (let ring = 1; ring < 14; ring++) {
      ctx.strokeStyle = `rgba(103,64,30,${.075 - ring * .003})`;
      ctx.lineWidth = .6; ctx.beginPath(); ctx.ellipse(x, y, ring * .65, ring * 3.4, -.08, 0, Math.PI * 2); ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function panelGeometry(size: Point) {
  // Rounded edges catch the key light while broad, flat surfaces remain true to the assembly.
  const [w, h, d] = size;
  const bevel = Math.min(.014, w / 8, h / 8, d / 8);
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + bevel, -h / 2 + bevel);
  shape.lineTo(w / 2 - bevel, -h / 2 + bevel);
  shape.lineTo(w / 2 - bevel, h / 2 - bevel);
  shape.lineTo(-w / 2 + bevel, h / 2 - bevel);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, steps: 1, curveSegments: 1 });
  geometry.translate(0, 0, -d / 2 + bevel);
  return geometry;
}

function makeBolt(material: THREE.MeshStandardMaterial, length = .12) {
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, length, 10), material);
  shaft.position.y = -length / 2;
  const head = new THREE.Mesh(new THREE.CylinderGeometry(.034, .034, .018, 16), material);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(.039, .003, .007), new THREE.MeshStandardMaterial({ color: '#53616b', roughness: .5 }));
  slot.position.y = .01;
  group.add(shaft, head, slot);
  group.traverse(obj => { if (obj instanceof THREE.Mesh) obj.castShadow = true; });
  return group;
}

export default function AssemblyViewer({ state, mode, reducedMotion, onSelect, command }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const labels = useRef<Record<string, HTMLButtonElement | null>>({});
  const runtime = useRef<Runtime | null>(null);
  const latest = useRef({ state, mode, reducedMotion, onSelect });
  latest.current = { state, mode, reducedMotion, onSelect };
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { setUnavailable(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Modelo 3D interactivo de la mesa. Arrastrá para rotar; usá los botones para seleccionar las piezas.');
    renderer.domElement.setAttribute('role', 'img');
    host.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 80);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = .09;
    controls.minDistance = 3.8; controls.maxDistance = 11;
    controls.maxPolarAngle = Math.PI * .49;
    controls.minPolarAngle = .2;
    controls.enablePan = false;
    controls.target.set(0, 1.25, 0);
    camera.position.set(4.3, 3.3, 5.3);
    controls.update();
    scene.add(new THREE.HemisphereLight('#eaf7ff', '#a8917c', 2.5));
    const key = new THREE.DirectionalLight('#fff5e5', 3.2);
    key.position.set(-3, 7, 4); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -4; key.shadow.camera.right = 4;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -4;
    key.shadow.normalBias = .025; key.shadow.bias = -.0002;
    key.shadow.radius = 4;
    scene.add(key);
    const rim = new THREE.DirectionalLight('#d8f1ff', 1.7); rim.position.set(4, 3, -3); scene.add(rim);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .045 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.52; floor.receiveShadow = true; scene.add(floor);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const shadowContext = shadowCanvas.getContext('2d')!;
    const shadowGradient = shadowContext.createRadialGradient(64, 64, 8, 64, 64, 64);
    shadowGradient.addColorStop(0, 'rgba(49,66,76,.17)');
    shadowGradient.addColorStop(.45, 'rgba(49,66,76,.07)');
    shadowGradient.addColorStop(1, 'rgba(49,66,76,0)');
    shadowContext.fillStyle = shadowGradient; shadowContext.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const softContact = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 2.8), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false }));
    softContact.rotation.x = -Math.PI / 2; softContact.position.y = -.518; scene.add(softContact);
    const texture = oakTexture(72);
    const parts: VisualPart[] = [];
    const pickable: THREE.Object3D[] = [];
    PARTS.forEach((spec, index) => {
      const group = new THREE.Group(); group.userData.partId = spec.id;
      const metal = new THREE.MeshStandardMaterial({ color: '#b7c3cd', metalness: .82, roughness: .27 });
      const wood = new THREE.MeshStandardMaterial({ map: texture, color: index % 2 ? '#fff3df' : '#ffead3', roughness: .52, metalness: 0 });
      const materials: THREE.MeshStandardMaterial[] = [wood];
      const edges: THREE.LineSegments[] = [];
      const addWood = (size: Point, position: Point) => {
        const geometry = panelGeometry(size);
        const mesh = new THREE.Mesh(geometry, wood); mesh.position.set(...position);
        mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.partId = spec.id;
        const outlineBox = new THREE.BoxGeometry(...size);
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(outlineBox), new THREE.LineBasicMaterial({ color: '#9c7651', transparent: true, opacity: .15 }));
        outlineBox.dispose();
        edge.position.copy(mesh.position); group.add(mesh, edge); edges.push(edge); pickable.push(mesh);
      };
      if (spec.id === 'F1') {
        for (const x of [-.76, .76]) for (const z of [-.48, .48]) addWood([.16, .22, .16], [x, .105, z]);
      } else if (spec.id === 'S1') {
        for (const x of [-.9, .9]) for (const z of [-.42, .42]) {
          const bolt = makeBolt(metal); bolt.position.set(x, 2.18, z); bolt.userData.partId = 'S1';
          bolt.traverse(obj => { if (obj instanceof THREE.Mesh) { obj.userData.partId = 'S1'; pickable.push(obj); } });
          group.add(bolt);
        }
      } else {
        addWood(spec.size, [0, 0, 0]);
        // Recessed fixing holes and shelf pins are placed on the actual joining faces.
        if (spec.id === 'B1' || spec.id === 'B2') {
          for (const y of [-.63, -.13, .65]) for (const z of [-.42, .42]) {
            const hole = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .002, 12), new THREE.MeshStandardMaterial({ color: '#866747', roughness: 1 }));
            hole.rotation.z = Math.PI / 2; hole.position.set(spec.id === 'B1' ? .067 : -.067, y, z); group.add(hole);
          }
        }
        if (spec.id === 'C1') {
          for (const x of [-.81, .81]) for (const z of [-.42, .42]) {
            const pin = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .16, 12), metal);
            pin.rotation.z = Math.PI / 2; pin.position.set(x, -.04, z); group.add(pin);
          }
        }
        if (spec.id === 'B7') {
          for (const x of [-.72, .72]) for (const y of [-.075, .075]) {
            const hole = new THREE.Mesh(new THREE.CylinderGeometry(.017, .017, .002, 12), new THREE.MeshStandardMaterial({ color: '#866747', roughness: 1 }));
            hole.rotation.x = Math.PI / 2; hole.position.set(x, y, .052); group.add(hole);
          }
        }
      }
      const current = latest.current;
      group.position.set(...(current.mode === 'assembled' || (current.mode === 'progress' && current.state.completed.includes(spec.step)) ? spec.home : spec.apart));
      group.traverse(obj => { if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial && !materials.includes(obj.material)) materials.push(obj.material); });
      if (!materials.includes(metal)) metal.dispose();
      if (spec.id === 'S1') wood.dispose();
      scene.add(group); parts.push({ spec, group, materials, edges });
    });
    const guides = new THREE.Group();
    const guideMaterial = new THREE.LineDashedMaterial({ color: '#65afd0', transparent: true, opacity: .27, dashSize: .045, gapSize: .05 });
    for (const x of [-.77, .77]) for (const z of [-.42, .42]) {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, .35, z), new THREE.Vector3(x, 2.73, z)]), guideMaterial);
      line.computeLineDistances(); guides.add(line);
    }
    scene.add(guides);
    let fitScale = 1;
    const defaultOffset = new THREE.Vector3(4.3, 2.05, 5.3);
    const reset = () => { controls.target.set(0, 1.25, 0); camera.position.copy(controls.target).addScaledVector(defaultOffset, fitScale); controls.update(); };
    const focus = (id: string | null) => {
      const part = parts.find(p => p.spec.id === id);
      if (!part) { reset(); return; }
      const direction = camera.position.clone().sub(controls.target).normalize();
      controls.target.copy(part.group.position);
      if (id === 'F1' || id === 'S1') controls.target.y = id === 'F1' ? .25 : 1.7;
      camera.position.copy(controls.target).addScaledVector(direction, 4.1 * fitScale); controls.update();
    };
    runtime.current = { camera, controls, parts, replayUntil: 0, focus, reset };
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height); camera.aspect = width / height;
      const nextFitScale = Math.max(1, 1.18 / camera.aspect);
      const offset = camera.position.clone().sub(controls.target).multiplyScalar(nextFitScale / fitScale);
      fitScale = nextFitScale;
      controls.minDistance = 3.8 * fitScale; controls.maxDistance = 11 * fitScale;
      camera.position.copy(controls.target).add(offset);
      camera.updateProjectionMatrix(); controls.update();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const raycaster = new THREE.Raycaster();
    let downX = 0, downY = 0;
    const pointerDown = (event: PointerEvent) => { downX = event.clientX; downY = event.clientY; };
    const pointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      const hit = raycaster.intersectObjects(pickable, false)[0];
      if (hit?.object.userData.partId) latest.current.onSelect(hit.object.userData.partId);
    };
    const contextLost = (event: Event) => { event.preventDefault(); setUnavailable(true); };
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    let frame = 0, previous = performance.now(), appearanceKey = '';
    const projected = new THREE.Vector3();
    const target = new THREE.Vector3();
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const current = latest.current;
      const dt = Math.min((now - previous) / 1000, .06); previous = now;
      const t = current.reducedMotion ? 1 : 1 - Math.exp(-dt * 5);
      const replaying = !!runtime.current && runtime.current.replayUntil > now;
      const key = `${current.state.missing.join(',')}|${current.state.selectedPart}`;
      const appearanceChanged = key !== appearanceKey;
      const w = host.clientWidth, h = host.clientHeight;
      parts.forEach(part => {
        const { spec, group } = part;
        const missing = current.state.missing.includes(spec.id);
        const selected = current.state.selectedPart === spec.id;
        const assembled = replaying || current.mode === 'assembled' || (current.mode === 'progress' && current.state.completed.includes(spec.step));
        target.set(...(assembled ? spec.home : spec.apart));
        group.position.lerp(target, t);
        if (spec.id === 'S1') group.position.y = THREE.MathUtils.lerp(group.position.y, assembled ? 0 : .25, t);
        if (appearanceChanged) {
          group.traverse(object => { if (object instanceof THREE.Mesh) object.castShadow = !missing; });
          part.materials.forEach(mat => {
            if (!mat.userData.baseColor) mat.userData.baseColor = mat.color.clone();
            mat.color.copy(missing ? new THREE.Color('#ff635f') : mat.userData.baseColor);
            mat.emissive.set(selected && !missing ? '#02688b' : '#000000');
            mat.emissiveIntensity = selected ? .14 : 0;
            mat.transparent = missing; mat.opacity = missing ? .25 : 1; mat.depthWrite = !missing;
          });
          part.edges.forEach(edge => {
            const mat = edge.material as THREE.LineBasicMaterial;
            mat.color.set(missing ? '#fa5e61' : selected ? '#009bd3' : '#9c7651');
            mat.opacity = missing || selected ? .9 : .12;
          });
        }
        const label = labels.current[spec.id];
        if (label) {
          projected.copy(group.position).add(target.set(...spec.label)).project(camera);
          label.style.transform = `translate(-50%, -50%) translate(${(projected.x * .5 + .5) * w}px, ${(-projected.y * .5 + .5) * h}px)`;
          label.style.visibility = projected.z > 1 || projected.z < -1 ? 'hidden' : 'visible';
        }
      });
      appearanceKey = key;
      guides.visible = current.mode === 'exploded' && !replaying;
      floor.position.y = THREE.MathUtils.lerp(floor.position.y, replaying || current.mode === 'assembled' ? -.02 : -.36, t);
      softContact.position.y = floor.position.y + .002;
      controls.enableDamping = !current.reducedMotion;
      controls.update(); renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry);
          const list = Array.isArray(object.material) ? object.material : [object.material]; list.forEach(material => materials.add(material));
        }
      });
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); texture.dispose(); shadowTexture.dispose();
      key.shadow.map?.dispose();
      renderer.dispose(); renderer.domElement.remove(); runtime.current = null;
    };
  }, []);

  useEffect(() => {
    const view = runtime.current;
    if (!view || !command) return;
    const offset = view.camera.position.clone().sub(view.controls.target);
    if (command.type === 'rotate-left' || command.type === 'rotate-right' || command.type === 'back') {
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), command.type === 'back' ? Math.PI : command.type === 'rotate-left' ? -.35 : .35);
      view.camera.position.copy(view.controls.target).add(offset);
    } else if (command.type === 'zoom-in' || command.type === 'zoom-out') {
      offset.setLength(THREE.MathUtils.clamp(offset.length() * (command.type === 'zoom-in' ? .82 : 1.22), view.controls.minDistance, view.controls.maxDistance));
      view.camera.position.copy(view.controls.target).add(offset);
    } else if (command.type === 'focus') view.focus(latest.current.state.selectedPart);
    else if (command.type === 'replay') {
      view.parts.forEach(part => part.group.position.set(...part.spec.apart));
      view.replayUntil = performance.now() + (latest.current.reducedMotion ? 100 : 3100);
    } else if (command.type === 'reset') { view.replayUntil = 0; view.reset(); }
    view.controls.update();
  }, [command]);

  return <div className="assembly-viewer" ref={mount}>
    {unavailable ? <div className="viewer-fallback" role="status"><span className="fallback-cube">◇</span><strong>Vista 3D no disponible</strong><p>Este navegador no pudo iniciar WebGL. Podés seguir con la lista de piezas y el manual.</p><div className="fallback-parts">{PARTS.map(part => <button key={part.id} onClick={() => onSelect(part.id)}>{part.id} · {part.name}</button>)}</div></div> : <div className="viewer-labels" aria-label="Piezas del modelo 3D">
      {PARTS.map(part => <button key={part.id} ref={el => { labels.current[part.id] = el; }} className={`part-label ${state.selectedPart === part.id ? 'is-selected' : ''} ${state.missing.includes(part.id) ? 'is-missing' : ''} ${part.id === 'F1' || part.id === 'S1' ? 'is-small' : ''}`} onClick={() => onSelect(part.id)} aria-label={`${part.id}: ${part.name}${state.missing.includes(part.id) ? ', pieza faltante' : ''}`} aria-pressed={state.selectedPart === part.id} title={`${part.id} · ${part.name}`}>{part.id}{state.missing.includes(part.id) && <span aria-hidden="true"> !</span>}</button>)}
    </div>}
    {!unavailable && <div className="viewer-gesture" aria-hidden="true"><span>↔</span> Arrastrá para explorar <i /> Scroll para acercar</div>}
  </div>;
}
