import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface ThreePageCanvasProps {
  scrollProgress?: number; // 0.0 to 1.0
  activeChapter?: number;  // 0 to 6 (if presentation mode)
  isPresentation?: boolean;
  interactive?: boolean;
  className?: string;
}

// Chapter color themes for dynamic Three.js lighting & fog
const THEMES = [
  { // 0: Cover / Landing (Industrial Amber)
    fog: 0x09090b,
    grid: 0xf97316,
    nodes: 0xfbbf24,
    lightA: 0xff6600,
    lightB: 0x38bdf8,
    camY: 18,
    camZ: 38,
    camPitch: -0.32,
  },
  { // 1: Problem (Crimson diagnostics)
    fog: 0x0c0608,
    grid: 0xf43f5e,
    nodes: 0xfb7185,
    lightA: 0xe11d48,
    lightB: 0xff453a,
    camY: 12,
    camZ: 30,
    camPitch: -0.22,
  },
  { // 2: Solution (Resilient Cloud Sky Blue)
    fog: 0x050a12,
    grid: 0x0ea5e9,
    nodes: 0x38bdf8,
    lightA: 0x0284c7,
    lightB: 0x60a5fa,
    camY: 22,
    camZ: 42,
    camPitch: -0.40,
  },
  { // 3: Core Capabilities (Golden Amber)
    fog: 0x0c0905,
    grid: 0xf59e0b,
    nodes: 0xfcd34d,
    lightA: 0xd97706,
    lightB: 0xf97316,
    camY: 16,
    camZ: 34,
    camPitch: -0.28,
  },
  { // 4: Tech Stack (Deep Cobalt & Indigo)
    fog: 0x060714,
    grid: 0x6366f1,
    nodes: 0x818cf8,
    lightA: 0x4f46e5,
    lightB: 0x3b82f6,
    camY: 20,
    camZ: 36,
    camPitch: -0.35,
  },
  { // 5: Benefits & ROI (Emerald Compliance)
    fog: 0x040e0a,
    grid: 0x10b981,
    nodes: 0x34d399,
    lightA: 0x059669,
    lightB: 0x10b981,
    camY: 15,
    camZ: 32,
    camPitch: -0.25,
  },
  { // 6: Closing CTA (Radiant Sunset)
    fog: 0x0a0705,
    grid: 0xf97316,
    nodes: 0xfde047,
    lightA: 0xea580c,
    lightB: 0xfbbf24,
    camY: 24,
    camZ: 44,
    camPitch: -0.45,
  },
];

export const ThreePageCanvas: React.FC<ThreePageCanvasProps> = ({
  scrollProgress = 0,
  activeChapter = 0,
  isPresentation = false,
  interactive = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // User toggleable interactive 3D settings
  const [wireframeMode, setWireframeMode] = useState(false);
  const [particlesActive, setParticlesActive] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  // References for live updates across frames
  const themeRef = useRef(THEMES[0]);
  const progressRef = useRef(scrollProgress);
  const chapterRef = useRef(activeChapter);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    chapterRef.current = activeChapter;
    const targetIdx = Math.min(THEMES.length - 1, Math.max(0, activeChapter));
    themeRef.current = THEMES[targetIdx];
  }, [activeChapter]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const currentTheme = themeRef.current;
    scene.fog = new THREE.FogExp2(currentTheme.fog, 0.018);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    camera.position.set(0, currentTheme.camY, currentTheme.camZ);
    camera.rotation.x = currentTheme.camPitch;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // 2. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLightA = new THREE.DirectionalLight(currentTheme.lightA, 2.2);
    dirLightA.position.set(20, 40, 20);
    scene.add(dirLightA);

    const pointLightB = new THREE.PointLight(currentTheme.lightB, 2.0, 80);
    pointLightB.position.set(-15, 10, -10);
    scene.add(pointLightB);

    // 3. Topographical CAD / BIM Undulating Terrain Grid
    const gridCols = 48;
    const gridRows = 48;
    const gridGeom = new THREE.PlaneGeometry(120, 120, gridCols, gridRows);
    gridGeom.rotateX(-Math.PI / 2);

    const originalPositions = gridGeom.attributes.position.array.slice() as Float32Array;

    const gridMaterial = new THREE.MeshBasicMaterial({
      color: currentTheme.grid,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const terrainMesh = new THREE.Mesh(gridGeom, gridMaterial);
    terrainMesh.position.y = -4;
    scene.add(terrainMesh);

    // 4. Secondary Dotted Grid Points at Vertices
    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute('position', gridGeom.attributes.position);
    const pointsMat = new THREE.PointsMaterial({
      color: currentTheme.nodes,
      size: 0.35,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const gridPoints = new THREE.Points(pointsGeom, pointsMat);
    gridPoints.position.y = -4;
    scene.add(gridPoints);

    // 5. Rising 3D Architectural Wireframe Structures (Digital Twin Foundation Blocks)
    const buildingGroup = new THREE.Group();
    const buildingCoords = [
      { x: -18, z: -10, w: 6, h: 14, d: 8, name: 'Madrid Centro' },
      { x: 16, z: -14, w: 8, h: 22, d: 7, name: 'Torre Diagonal' },
      { x: -8, z: -25, w: 12, h: 9, d: 12, name: 'Nave Logística' },
      { x: 12, z: 8, w: 7, h: 16, d: 6, name: 'Residencial Levante' },
      { x: -24, z: 12, w: 9, h: 11, d: 10, name: 'Túnel Sur' },
    ];

    buildingCoords.forEach((b) => {
      const boxGeom = new THREE.BoxGeometry(b.w, b.h, b.d);
      const edges = new THREE.EdgesGeometry(boxGeom);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: currentTheme.grid,
          transparent: true,
          opacity: 0.45,
        })
      );
      line.position.set(b.x, b.h / 2 - 4, b.z);
      buildingGroup.add(line);

      // Floor slab lines inside the volume
      const floors = Math.floor(b.h / 3);
      for (let f = 1; f < floors; f++) {
        const floorGeom = new THREE.EdgesGeometry(new THREE.PlaneGeometry(b.w, b.d));
        floorGeom.rotateX(-Math.PI / 2);
        const floorLine = new THREE.LineSegments(
          floorGeom,
          new THREE.LineBasicMaterial({
            color: currentTheme.nodes,
            transparent: true,
            opacity: 0.22,
          })
        );
        floorLine.position.set(b.x, -4 + f * 3, b.z);
        buildingGroup.add(floorLine);
      }

      // Vertical Beacon Light Beam
      const beamGeom = new THREE.CylinderGeometry(0.12, 0.4, 30, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: currentTheme.lightA,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.set(b.x, b.h + 10, b.z);
      buildingGroup.add(beam);
    });
    scene.add(buildingGroup);

    // 6. Glowing Circular Geofence Rings
    const geofenceGroup = new THREE.Group();
    buildingCoords.slice(0, 3).forEach((b) => {
      const ringGeom = new THREE.RingGeometry(8, 8.4, 48);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(b.x, -3.8, b.z);
      geofenceGroup.add(ring);
    });
    scene.add(geofenceGroup);

    // 7. Dynamic 3D Splines Connecting Site Nodes to Cloud Gateway Hub
    const cloudHubPos = new THREE.Vector3(0, 24, -8);
    const splineLines: THREE.Line[] = [];

    buildingCoords.forEach((b) => {
      const start = new THREE.Vector3(b.x, b.h - 4, b.z);
      const mid = new THREE.Vector3((b.x + cloudHubPos.x) / 2, 28, (b.z + cloudHubPos.z) / 2);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, cloudHubPos);
      const points = curve.getPoints(36);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: currentTheme.nodes,
        transparent: true,
        opacity: 0.28,
      });
      const splineLine = new THREE.Line(lineGeom, lineMat);
      scene.add(splineLine);
      splineLines.push(splineLine);
    });

    // 8. Glowing Data Packets Flowing Along Splines
    const packetCount = 20;
    const packetPositions = new Float32Array(packetCount * 3);
    const packetGeom = new THREE.BufferGeometry();
    packetGeom.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
    const packetMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const packetPoints = new THREE.Points(packetGeom, packetMat);
    scene.add(packetPoints);

    // 9. Floating Ambient Starfield Dust (Zero Gravity Particles)
    const particleCount = 280;
    const particleGeom = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 110;
      particlePos[i + 1] = Math.random() * 45 - 2;
      particlePos[i + 2] = (Math.random() - 0.5) * 110;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const ambientParticleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ambientParticles = new THREE.Points(particleGeom, ambientParticleMat);
    scene.add(ambientParticles);

    // 10. Mouse & Scroll Interaction
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 11. Window Resize Listener
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 12. Main 60 FPS Render Loop
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Don't render if tab is hidden
      if (document.hidden) return;

      const elapsedTime = clock.getElapsedTime();
      const targetTheme = themeRef.current;
      const progress = progressRef.current;

      // Smooth mouse parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Smooth Camera Interpolation based on scroll and theme
      const targetCamY = targetTheme.camY + (isPresentation ? 0 : -progress * 10);
      const targetCamZ = targetTheme.camZ + (isPresentation ? 0 : -progress * 15);
      const targetCamX = (autoRotate && !prefersReducedMotion ? Math.sin(elapsedTime * 0.12) * 5 : 0) + mouseRef.current.x * 4;

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY + mouseRef.current.y * 2 - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;

      camera.lookAt(0, isPresentation ? 4 : 0, isPresentation ? -5 : -10);

      // Interpolate Scene Fog and Lighting Colors
      if (scene.fog && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(new THREE.Color(targetTheme.fog), 0.04);
      }
      dirLightA.color.lerp(new THREE.Color(targetTheme.lightA), 0.04);
      pointLightB.color.lerp(new THREE.Color(targetTheme.lightB), 0.04);
      gridMaterial.color.lerp(new THREE.Color(targetTheme.grid), 0.04);
      pointsMat.color.lerp(new THREE.Color(targetTheme.nodes), 0.04);

      // Animate Topographical Waves on the Grid Vertices
      if (!prefersReducedMotion) {
        const positions = gridGeom.attributes.position.array as Float32Array;
        const vertexCount = positions.length / 3;

        for (let i = 0; i < vertexCount; i++) {
          const idx = i * 3;
          const origX = originalPositions[idx];
          const origZ = originalPositions[idx + 2];

          // Harmonic undulation wave algorithm
          const wave =
            Math.sin(origX * 0.08 + elapsedTime * 0.7) * Math.cos(origZ * 0.08 + elapsedTime * 0.5) * 1.8 +
            Math.sin((origX + origZ) * 0.04 + elapsedTime * 0.4) * 1.0;

          positions[idx + 1] = wave;
        }

        gridGeom.attributes.position.needsUpdate = true;

        // Rotate Geofence Rings
        geofenceGroup.children.forEach((child, i) => {
          child.rotation.z = elapsedTime * (i % 2 === 0 ? 0.3 : -0.2);
        });

        // Animate Floating Ambient Dust Particles
        const partPositions = ambientParticleMat.opacity > 0 ? (particleGeom.attributes.position.array as Float32Array) : null;
        if (partPositions) {
          for (let p = 0; p < particleCount; p++) {
            const pIdx = p * 3;
            partPositions[pIdx + 1] += Math.sin(elapsedTime * 0.5 + p) * 0.02;
            if (partPositions[pIdx + 1] > 45) partPositions[pIdx + 1] = -2;
          }
          particleGeom.attributes.position.needsUpdate = true;
        }

        // Animate Data Packets along 3D splines
        const packetPosArray = packetGeom.attributes.position.array as Float32Array;
        for (let k = 0; k < packetCount; k++) {
          const splineIdx = k % buildingCoords.length;
          const b = buildingCoords[splineIdx];
          const start = new THREE.Vector3(b.x, b.h - 4, b.z);
          const mid = new THREE.Vector3((b.x + cloudHubPos.x) / 2, 28, (b.z + cloudHubPos.z) / 2);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, cloudHubPos);

          const t = ((elapsedTime * 0.28 + k / packetCount) % 1);
          const pt = curve.getPoint(t);

          packetPosArray[k * 3] = pt.x;
          packetPosArray[k * 3 + 1] = pt.y;
          packetPosArray[k * 3 + 2] = pt.z;
        }
        packetGeom.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js objects cleanly
      gridGeom.dispose();
      gridMaterial.dispose();
      pointsGeom.dispose();
      pointsMat.dispose();
      particleGeom.dispose();
      ambientParticleMat.dispose();
      packetGeom.dispose();
      packetMat.dispose();

      buildingGroup.clear();
      geofenceGroup.clear();
      splineLines.forEach((l) => {
        l.geometry.dispose();
        if (Array.isArray(l.material)) l.material.forEach((m) => m.dispose());
        else l.material.dispose();
      });

      renderer.dispose();
    };
  }, [isPresentation, autoRotate]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 1. Hardware-Accelerated Full-Page WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* 2. Top-to-Bottom Subtle Film Vignette Gradient for WCAG Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b]/90 pointer-events-none" />

      {/* 3. Subtle CAD Matrix Watermark in corner */}
      <div className="absolute bottom-4 right-6 pointer-events-none hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        <span>Three.js BIM Digital Twin // 60 FPS</span>
      </div>
    </div>
  );
};
