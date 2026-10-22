"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Orbiting Member Sphere Component
function MemberNode({ 
  radius, 
  speed, 
  offset, 
  color, 
  emissive 
}: { 
  radius: number; 
  speed: number; 
  offset: number; 
  color: string; 
  emissive: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.z = Math.sin(t) * radius;
    meshRef.current.position.y = Math.sin(t * 2) * 0.25;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.22, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={emissive} 
        emissiveIntensity={0.6} 
        metalness={0.8} 
        roughness={0.2} 
      />
    </mesh>
  );
}

// Main 3D Àjọṣe Coin & Ring
function AjoRotationalCore() {
  const ringRef = useRef<THREE.Mesh>(null);
  const coinRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
      ringRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.15 + 0.3;
    }
    if (coinRef.current) {
      coinRef.current.rotation.y += delta * 0.6;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= delta * 0.2;
    }
  });

  return (
    <group>
      {/* Central Floating Ajo Gold Coin */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <group ref={coinRef} position={[0, 0, 0]}>
          {/* Main Coin Cylinder */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.18, 64]} />
            <meshStandardMaterial 
              color="#D4AF37" 
              metalness={0.92} 
              roughness={0.18} 
            />
          </mesh>

          {/* Inner Emerald Relief Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
            <ringGeometry args={[0.7, 1.05, 64]} />
            <meshStandardMaterial 
              color="#0B3022" 
              metalness={0.6} 
              roughness={0.3} 
              side={THREE.DoubleSide} 
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
            <ringGeometry args={[0.7, 1.05, 64]} />
            <meshStandardMaterial 
              color="#0B3022" 
              metalness={0.6} 
              roughness={0.3} 
              side={THREE.DoubleSide} 
            />
          </mesh>

          {/* Central Golden Emblem Dome */}
          <mesh position={[0, 0, 0.11]}>
            <sphereGeometry args={[0.45, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial 
              color="#F3E8CE" 
              emissive="#C5A059" 
              emissiveIntensity={0.4} 
              metalness={0.95} 
              roughness={0.1} 
            />
          </mesh>
          <mesh position={[0, 0, -0.11]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.45, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial 
              color="#F3E8CE" 
              emissive="#C5A059" 
              emissiveIntensity={0.4} 
              metalness={0.95} 
              roughness={0.1} 
            />
          </mesh>
        </group>
      </Float>

      {/* Primary Golden Rotational Torus Ring */}
      <mesh ref={ringRef} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[2.3, 0.09, 32, 100]} />
        <meshStandardMaterial 
          color="#C5A059" 
          metalness={0.95} 
          roughness={0.12} 
        />
      </mesh>

      {/* Outer Fine Orbit Ring */}
      <mesh ref={outerRingRef} rotation={[-0.3, 0.2, 0]}>
        <torusGeometry args={[2.7, 0.04, 24, 100]} />
        <meshStandardMaterial 
          color="#34D399" 
          emissive="#10B981" 
          emissiveIntensity={0.5} 
          metalness={0.7} 
          roughness={0.2} 
        />
      </mesh>

      {/* Orbiting Members (Representing Rotational Ajo Turns) */}
      <MemberNode radius={2.3} speed={0.8} offset={0} color="#10B981" emissive="#059669" />
      <MemberNode radius={2.3} speed={0.8} offset={(Math.PI * 2) / 3} color="#FBBF24" emissive="#D97706" />
      <MemberNode radius={2.3} speed={0.8} offset={(Math.PI * 4) / 3} color="#60A5FA" emissive="#2563EB" />
    </group>
  );
}

export default function AjoCircleScene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 8, 5]} intensity={2.2} color="#FFF8E7" />
      <directionalLight position={[-6, -4, -4]} intensity={1.5} color="#34D399" />
      <pointLight position={[0, 0, 3]} intensity={1.8} color="#C5A059" />

      {/* Golden Atmosphere Sparkles */}
      <Sparkles 
        count={50} 
        scale={6} 
        size={2.4} 
        speed={0.4} 
        color="#F3E8CE" 
        opacity={0.7} 
      />

      <AjoRotationalCore />

      {/* Interactive Orbit Controls (Smooth drag-to-inspect) */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={(Math.PI * 2) / 3}
        rotateSpeed={0.6}
      />
    </>
  );
}
