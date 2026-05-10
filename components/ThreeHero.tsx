"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Environment } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingCube() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x += 0.005;
    ref.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color="#00aaff"
        emissive="#003344"
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function FloatingSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(Date.now() * 0.001) * 0.5;
  });

  return (
    <mesh ref={ref} position={[2, 0, 0]}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshStandardMaterial
        color="#7c3aed"
        emissive="#220044"
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
}

export default function ThreeHero() {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        
        {/* LIGHTING */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />

        {/* ENVIRONMENT */}
        <Environment preset="city" />

        {/* FLOATING OBJECTS */}
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <FloatingCube />
        </Float>

        <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1}>
          <FloatingSphere />
        </Float>

        {/* CONTROLS */}
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}
