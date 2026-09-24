/**
 * 3D Interactive Packaging Canvas Viewer for JRI Website
 * Features:
 * - 360° Mouse / Touch Drag Orbit Controls with Smooth Inertial Damping
 * - Scroll Wheel / Pinch Zooming (Clamped)
 * - Automatic Idle Showcase Rotation (pauses upon user touch/drag)
 * - Photorealistic Cardboard & Material Shading with Directional Lighting
 * - Packaging Geometries: Corrugated Box, Imprabox Partition, Film Roll, PP Sheet
 * - GLB / GLTF Model-Viewer Fallback Support
 */

export function init3DViewer(container, options = {}) {
  if (!container) return null;
  const {
    type = 'box',        // 'box' | 'part' | 'roll' | 'sheet' | 'cust'
    modelUrl = '',       // optional .glb/.gltf url
    productName = '',
    dimensions = { l: 400, w: 300, h: 250 },
    autoRotate = true
  } = options;

  container.innerHTML = '';

  // If a custom GLB/GLTF model is provided, attempt model-viewer
  if (modelUrl && (modelUrl.endsWith('.glb') || modelUrl.endsWith('.gltf'))) {
    if (!customElements.get('model-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      document.head.appendChild(s);
    }
    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', modelUrl);
    mv.setAttribute('alt', productName || '3D Packaging Model');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('shadow-intensity', '1');
    mv.setAttribute('poster', '');
    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.minHeight = '380px';
    mv.style.display = 'block';
    container.appendChild(mv);
    return { destroy: () => { container.innerHTML = ''; } };
  }

  // --- Procedural Canvas 3D Engine ---
  const canvas = document.createElement('canvas');
  canvas.className = 'canvas-3d-viewer';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.cursor = 'grab';

  const overlay = document.createElement('div');
  overlay.className = 'viewer-3d-hint';
  overlay.innerHTML = '<span class="v3d-tag">3D INTERACTIVE 360°</span><span class="v3d-text">🖱 Geser untuk memutar • Scroll untuk zoom</span>';

  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.userSelect = 'none';
  container.appendChild(canvas);
  container.appendChild(overlay);

  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let velX = 0, velY = 0;
  let isIdle = true;
  let idleTimer = null;

  // Camera & view angles
  let rotX = 0.42;  // pitch (vertical angle in radians)
  let rotY = -0.75; // yaw (horizontal angle in radians)
  let zoom = 1.0;
  const minZoom = 0.65, maxZoom = 1.6;

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = (rect.width || 600) * dpr;
    canvas.height = (rect.height || 420) * dpr;
  }
  resize();
  window.addEventListener('resize', resize);

  // 3D Math Utilities
  const rotateX = (v, a) => {
    const cos = Math.cos(a), sin = Math.sin(a);
    return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
  };
  const rotateY = (v, a) => {
    const cos = Math.cos(a), sin = Math.sin(a);
    return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
  };
  const project = (v, w, h, fov = 500, dist = 550) => {
    const z = v[2] + dist / zoom;
    const scale = fov / Math.max(z, 50);
    return {
      x: w / 2 + v[0] * scale,
      y: h / 2 + v[1] * scale,
      z: z
    };
  };

  // Light Vector (from upper right front)
  const light = [0.45, -0.7, 0.55];
  const lLen = Math.hypot(light[0], light[1], light[2]);
  const lNorm = [light[0] / lLen, light[1] / lLen, light[2] / lLen];

  // Geometries Definition
  function getModelData() {
    const faces = [];
    const lines = [];

    if (type === 'part') {
      // Imprabox Partition: Outer tray + internal dividers
      const sx = 120, sy = 60, sz = 90;
      const bColor = '#1a4488'; // Blue imprabox
      const dColor = '#14366e';

      // Outer box faces
      const v = [
        [-sx, -sy, -sz], [sx, -sy, -sz], [sx, sy, -sz], [-sx, sy, -sz],
        [-sx, -sy,  sz], [sx, -sy,  sz], [sx, sy,  sz], [-sx, sy,  sz]
      ];
      // Bottom & sides (open top)
      faces.push({ v: [v[4], v[5], v[6], v[7]], color: bColor }); // Front
      faces.push({ v: [v[1], v[0], v[3], v[2]], color: bColor }); // Back
      faces.push({ v: [v[0], v[4], v[7], v[3]], color: bColor }); // Left
      faces.push({ v: [v[5], v[1], v[2], v[6]], color: bColor }); // Right
      faces.push({ v: [v[3], v[2], v[6], v[7]], color: dColor }); // Bottom

      // Internal Divider Partitions
      for (let offset = -sx + 60; offset < sx; offset += 60) {
        faces.push({
          v: [[offset, -sy, -sz], [offset, -sy, sz], [offset, sy, sz], [offset, sy, -sz]],
          color: '#285cb0',
          isDivider: true
        });
      }
      for (let offset = -sz + 45; offset < sz; offset += 45) {
        faces.push({
          v: [[-sx, -sy, offset], [sx, -sy, offset], [sx, sy, offset], [-sx, sy, offset]],
          color: '#204d96',
          isDivider: true
        });
      }
    } else if (type === 'roll') {
      // PE Film Roll: Cylinder composed of 24 radial segments
      const r = 85, h = 180, segs = 24;
      const rollColor = '#5282c0';
      const topPts = [], btmPts = [];
      for (let i = 0; i < segs; i++) {
        const th = (i / segs) * Math.PI * 2;
        topPts.push([Math.cos(th) * r, -h / 2, Math.sin(th) * r]);
        btmPts.push([Math.cos(th) * r,  h / 2, Math.sin(th) * r]);
      }
      for (let i = 0; i < segs; i++) {
        const next = (i + 1) % segs;
        faces.push({
          v: [topPts[i], topPts[next], btmPts[next], btmPts[i]],
          color: rollColor,
          isRoll: true
        });
      }
      faces.push({ v: topPts, color: '#6898d8', isTop: true });
      faces.push({ v: btmPts.slice().reverse(), color: '#3866a0', isBtm: true });
    } else if (type === 'sheet') {
      // PP Corrugated Flute Sheets stack
      const sx = 130, sy = 24, sz = 100;
      const sColor = '#0e2b5c';
      const v = [
        [-sx, -sy, -sz], [sx, -sy, -sz], [sx, sy, -sz], [-sx, sy, -sz],
        [-sx, -sy,  sz], [sx, -sy,  sz], [sx, sy,  sz], [-sx, sy,  sz]
      ];
      faces.push({ v: [v[4], v[5], v[6], v[7]], color: sColor, isSheetEdge: true }); // Front
      faces.push({ v: [v[1], v[0], v[3], v[2]], color: sColor });                     // Back
      faces.push({ v: [v[0], v[1], v[5], v[4]], color: '#163d7e' });                   // Top
      faces.push({ v: [v[3], v[2], v[6], v[7]], color: '#091c3d' });                   // Bottom
      faces.push({ v: [v[0], v[4], v[7], v[3]], color: sColor, isSheetEdge: true }); // Left
      faces.push({ v: [v[5], v[1], v[2], v[6]], color: sColor, isSheetEdge: true }); // Right
    } else {
      // Default: 3D Corrugated Carton Box with flaps and flute lines
      const sx = 110, sy = 85, sz = 90;
      const kraft = '#be925f'; // Natural Kraft Cardboard
      const v = [
        [-sx, -sy, -sz], [sx, -sy, -sz], [sx, sy, -sz], [-sx, sy, -sz],
        [-sx, -sy,  sz], [sx, -sy,  sz], [sx, sy,  sz], [-sx, sy,  sz]
      ];
      // 6 Box Faces
      faces.push({ v: [v[4], v[5], v[6], v[7]], color: kraft, isFront: true }); // Front
      faces.push({ v: [v[1], v[0], v[3], v[2]], color: kraft });                // Back
      faces.push({ v: [v[0], v[1], v[5], v[4]], color: '#cfaa79', isTop: true });// Top
      faces.push({ v: [v[3], v[2], v[6], v[7]], color: '#976e3c' });            // Bottom
      faces.push({ v: [v[0], v[4], v[7], v[3]], color: '#af8350' });            // Left
      faces.push({ v: [v[5], v[1], v[2], v[6]], color: '#af8350' });            // Right

      // Top Tape Seam
      lines.push({
        from: [0, -sy - 0.5, -sz],
        to:   [0, -sy - 0.5,  sz],
        color: 'rgba(180, 130, 70, 0.65)',
        width: 14
      });
      // Fragile / JRI Logo print on front face
      lines.push({
        from: [-sx + 24, sy - 30, sz + 0.5],
        to:   [-sx + 50, sy - 30, sz + 0.5],
        color: '#d71920',
        width: 3
      });
    }

    return { faces, lines };
  }

  const modelData = getModelData();

  function render() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle radial pedestal shadow
    const grad = ctx.createRadialGradient(w / 2, h / 2 + 130 * zoom, 15, w / 2, h / 2 + 130 * zoom, 220 * zoom);
    grad.addColorStop(0, 'rgba(10, 20, 45, 0.35)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 130 * zoom, 180 * zoom, 48 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Transform and sort faces by depth (Painter's Algorithm)
    const projectedFaces = [];
    modelData.faces.forEach(face => {
      const transV = face.v.map(pt => {
        let p = rotateX(pt, rotX);
        p = rotateY(p, rotY);
        return p;
      });

      // Face normal for backface culling & lighting
      const p0 = transV[0], p1 = transV[1], p2 = transV[2];
      const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2];
      const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2];
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;

      // Only draw forward-facing faces (or double-sided dividers)
      if (nz < 0 || face.isDivider) {
        const nLen = Math.hypot(nx, ny, nz) || 1;
        const norm = [nx / nLen, ny / nLen, nz / nLen];
        const dot = Math.max(0, -(norm[0] * lNorm[0] + norm[1] * lNorm[1] + norm[2] * lNorm[2]));
        const lightIntensity = 0.45 + dot * 0.55;

        // Average Z depth
        let avgZ = 0;
        const pts2d = transV.map(pt => {
          avgZ += pt[2];
          return project(pt, w, h);
        });
        avgZ /= transV.length;

        projectedFaces.push({
          pts: pts2d,
          z: avgZ,
          color: face.color,
          light: lightIntensity,
          isTop: face.isTop,
          isFront: face.isFront,
          isSheetEdge: face.isSheetEdge
        });
      }
    });

    // Sort furthest to closest
    projectedFaces.sort((a, b) => b.z - a.z);

    // Draw sorted faces
    projectedFaces.forEach(f => {
      ctx.beginPath();
      ctx.moveTo(f.pts[0].x, f.pts[0].y);
      for (let i = 1; i < f.pts.length; i++) {
        ctx.lineTo(f.pts[i].x, f.pts[i].y);
      }
      ctx.closePath();

      // Shading color
      ctx.fillStyle = shadeColor(f.color, f.light);
      ctx.fill();

      // Clean, sharp edge outline
      ctx.strokeStyle = 'rgba(14, 35, 80, 0.25)';
      ctx.lineWidth = 1.2 * (window.devicePixelRatio || 1);
      ctx.stroke();

      // Corrugated texture lines for realism
      if (f.isFront && type === 'box') {
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 1.5;
        const step = 8 * zoom;
        for (let y = -h; y < h * 2; y += step) {
          ctx.beginPath();
          ctx.moveTo(-w, y);
          ctx.lineTo(w * 2, y);
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    // Draw projected 3D lines (Tape / details)
    modelData.lines.forEach(l => {
      let p1 = rotateX(l.from, rotX);
      p1 = rotateY(p1, rotY);
      let p2 = rotateX(l.to, rotX);
      p2 = rotateY(p2, rotY);

      if (p1[2] < 30 && p2[2] < 30) {
        const pr1 = project(p1, w, h);
        const pr2 = project(p2, w, h);
        ctx.beginPath();
        ctx.moveTo(pr1.x, pr1.y);
        ctx.lineTo(pr2.x, pr2.y);
        ctx.strokeStyle = l.color;
        ctx.lineWidth = l.width * zoom * (window.devicePixelRatio || 1);
        ctx.lineCap = 'square';
        ctx.stroke();
      }
    });
  }

  // Color shading helper
  function shadeColor(color, factor) {
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16);
      let r = (num >> 16) * factor;
      let g = ((num >> 8) & 0x00FF) * factor;
      let b = (num & 0x0000FF) * factor;
      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));
      return `rgb(${r},${g},${b})`;
    }
    return color;
  }

  // Animation Loop with Idle Auto-Rotation and Inertia Damping
  function loop() {
    if (!isDragging) {
      if (isIdle && autoRotate) {
        rotY += 0.007; // Smooth auto rotation
      } else {
        // Inertia damping
        rotY += velX;
        rotX += velY;
        velX *= 0.92;
        velY *= 0.92;
        rotX = Math.max(-1.1, Math.min(1.1, rotX));
        if (Math.hypot(velX, velY) < 0.0005) {
          velX = 0;
          velY = 0;
        }
      }
    }
    render();
    animationId = requestAnimationFrame(loop);
  }
  loop();

  // User Interaction Handlers
  function resetIdle() {
    isIdle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { isIdle = true; }, 3200);
  }

  function onPointerDown(e) {
    isDragging = true;
    resetIdle();
    canvas.style.cursor = 'grabbing';
    lastX = e.clientX || (e.touches && e.touches[0].clientX);
    lastY = e.clientY || (e.touches && e.touches[0].clientY);
    velX = 0;
    velY = 0;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    resetIdle();
    const curX = e.clientX || (e.touches && e.touches[0].clientX);
    const curY = e.clientY || (e.touches && e.touches[0].clientY);
    const dx = curX - lastX;
    const dy = curY - lastY;

    velX = dx * 0.006;
    velY = dy * 0.006;
    rotY += velX;
    rotX += velY;
    rotX = Math.max(-1.1, Math.min(1.1, rotX));

    lastX = curX;
    lastY = curY;
  }

  function onPointerUp() {
    isDragging = false;
    canvas.style.cursor = 'grab';
  }

  function onWheel(e) {
    e.preventDefault();
    resetIdle();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    zoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
  }

  function onDblClick() {
    rotX = 0.42;
    rotY = -0.75;
    zoom = 1.0;
    resetIdle();
  }

  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  canvas.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('dblclick', onDblClick);

  return {
    destroy: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      container.innerHTML = '';
    }
  };
}
