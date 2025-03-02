"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  Float,
  useDetectGPU,
  Environment,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";

interface StarMeshProps {
  isHovered: boolean;
  hasCompletedEntrance: boolean;
  onAnimationComplete?: () => void;
  delay?: number;
}

interface StarAnimationProps {
  delay?: number;
  onAnimationComplete?: () => void;
}

// Optimize star geometry creation
const createStarGeometry = () => {
  const shape = new THREE.Shape();
  const points = [
    [0, 0.5], // Top point
    [0.1, 0.15],
    [0.4, 0.2], // Right top corner
    [0.15, 0.0],
    [0.3, -0.4], // Right bottom corner
    [0, -0.15], // Bottom middle
    [-0.3, -0.4],
    [-0.15, 0],
    [-0.4, 0.2],
    [-0.1, 0.15],
  ];

  shape.moveTo(points[0][0], points[0][1]);
  points.forEach((point, i) => {
    if (i > 0) shape.lineTo(point[0], point[1]);
  });
  shape.lineTo(points[0][0], points[0][1]);

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 5,
  });
};

const StarMesh = ({
  isHovered,
  hasCompletedEntrance,
  onAnimationComplete,
  delay = 0,
}: StarMeshProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<
    THREE.Material & { transmission?: number; distortion?: number }
  >(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const startTime = useRef<number | null>(null);

  // Memoize geometry
  const starGeometry = useMemo(() => createStarGeometry(), []);

  // GPU detection for quality settings
  const gpu = useDetectGPU();
  const quality = useMemo(() => {
    return gpu.tier >= 2 ? "high" : "low";
  }, [gpu.tier]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (starGeometry) {
        starGeometry.dispose();
      }
    };
  }, [starGeometry]);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    const mesh = meshRef.current;
    const material = materialRef.current;

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime + delay;
      return;
    }

    const timeSinceStart = state.clock.elapsedTime - startTime.current;
    const entryDuration = 1.2;

    if (timeSinceStart < 0) {
      mesh.scale.set(0, 0, 0);
      mesh.position.y = 0.5; // Start position above
      return;
    }

    if (timeSinceStart < entryDuration) {
      // Entry animation sequence
      const progress = timeSinceStart / entryDuration;
      const smoothProgress = THREE.MathUtils.smoothstep(progress, 0, 1);

      // 1. Scale up with elastic effect
      const elasticScale = Math.min(
        1,
        1 +
          Math.pow(2, -10 * progress) * Math.sin((progress - 0.1) * 5 * Math.PI)
      );
      mesh.scale.setScalar(elasticScale * 0.2 + smoothProgress * 0.8);

      // 2. Spin animation with smooth deceleration
      const spinRotations = 2; // Number of full rotations
      const spinEasing = THREE.MathUtils.smootherstep(1 - progress, 0, 1);
      mesh.rotation.y = spinRotations * Math.PI * 2 * spinEasing;

      // 3. Position tween with smooth landing
      mesh.position.y = 0.5 * (1 - smoothProgress) * (1 - smoothProgress);

      // Subtle tilt during entry with smooth transition
      mesh.rotation.x = (1 - smoothProgress) * 0.5;

      // Trigger completion near the end of the animation for smoother transition
      if (progress > 0.95 && !hasCompletedEntrance) {
        onAnimationComplete?.();
      }
    } else {
      // Remove the position reset and completion trigger from here
      // as it's now handled during the entry animation

      // Optimized hover and idle animations
      const time = state.clock.getElapsedTime();

      if (isHovered) {
        targetRotation.current.y = Math.sin(time * 2) * 0.2;
        targetRotation.current.x = Math.cos(time * 2) * 0.2;

        // Optimized material transitions
        if (material.transmission !== undefined) {
          material.transmission = THREE.MathUtils.lerp(
            material.transmission,
            0.8,
            0.1
          );
        }
        if (material.distortion !== undefined) {
          material.distortion = THREE.MathUtils.lerp(
            material.distortion,
            0.6,
            0.1
          );
        }
      } else {
        targetRotation.current.y = Math.sin(time * 0.5) * 0.05;
        targetRotation.current.x = Math.cos(time * 0.5) * 0.05;

        if (material.transmission !== undefined) {
          material.transmission = THREE.MathUtils.lerp(
            material.transmission,
            1,
            0.1
          );
        }
        if (material.distortion !== undefined) {
          material.distortion = THREE.MathUtils.lerp(
            material.distortion,
            0.4,
            0.1
          );
        }
      }

      // Optimized rotation interpolation
      currentRotation.current.x = THREE.MathUtils.lerp(
        currentRotation.current.x,
        targetRotation.current.x,
        delta * 4
      );
      currentRotation.current.y = THREE.MathUtils.lerp(
        currentRotation.current.y,
        targetRotation.current.y,
        delta * 4
      );

      mesh.rotation.x = currentRotation.current.x;
      mesh.rotation.y = currentRotation.current.y;

      // Optimized color transition
      const targetColor = isHovered
        ? new THREE.Color("#ffd700")
        : new THREE.Color("#ffb800");
      if (material.color instanceof THREE.Color) {
        material.color.lerp(targetColor, delta * 4);
      }
    }
  });

  return (
    <mesh ref={meshRef} geometry={starGeometry}>
      <MeshTransmissionMaterial
        ref={materialRef}
        samples={quality === "high" ? 4 : 2}
        thickness={0.5}
        roughness={0.05}
        transmission={1}
        ior={1.5}
        chromaticAberration={quality === "high" ? 0.06 : 0.04}
        distortion={0.4}
        distortionScale={0.6}
        temporalDistortion={0.3}
        metalness={0.9}
        clearcoat={1}
        attenuationDistance={0.5}
        attenuationColor="#fff7e6"
        color="#ffb800"
        transparent
        toneMapped={false}
      />
    </mesh>
  );
};

export const StarAnimation = ({
  delay = 0,
  onAnimationComplete,
}: StarAnimationProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasCompletedEntrance, setHasCompletedEntrance] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleComplete = () => {
    setHasCompletedEntrance(true);
    onAnimationComplete?.();
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        delay,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-[100px] h-[100px] relative cursor-pointer"
    >
      <Canvas
        dpr={Math.min(2, window.devicePixelRatio)}
        camera={{ position: [0, 0, 2], fov: 45 }}
        className="w-full h-full"
        style={{ background: "transparent" }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Float speed={1} floatIntensity={1} rotationIntensity={0.2}>
          <Center>
            <StarMesh
              isHovered={isHovered}
              hasCompletedEntrance={hasCompletedEntrance}
              onAnimationComplete={handleComplete}
              delay={delay}
            />
          </Center>
        </Float>

        {/* Simplified lighting */}
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />

        {/* Environment with transparent background */}
        <Environment preset="apartment" background={false} />
      </Canvas>

      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={false}
        animate={{
          scale: isHovered ? 1 : 0.8,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
};
