'use client';

import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useTheme } from 'next-themes';

const ParticleSphere = () => {
  const ref = useRef<THREE.Points>(null);
  const { theme } = useTheme();
  const { viewport, pointer } = useThree();
  const color = theme === 'dark' ? '#ffffff' : '#000000';

  const [sphere, mouse] = useMemo(() => {
    const spherePoints = new Float32Array(15000);
    for (let i = 0; i < 5000; i++) {
      const i3 = i * 3;
      const { x, y, z } = THREE.MathUtils.randVect(new THREE.Vector3(), { radius: 4.5 });
      spherePoints[i3] = x;
      spherePoints[i3 + 1] = y;
      spherePoints[i3 + 2] = z;
    }
    const mousePosition = new THREE.Vector2();
    return [spherePoints, mousePosition];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      mouse.x = (pointer.x * viewport.width) / 2.5;
      mouse.y = (pointer.y * viewport.height) / 2.5;
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;

      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mouse.x, 0.02);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, mouse.y, 0.02);
    }
  });

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.005}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};


export function InteractiveCanvas() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ParticleSphere />
      </Canvas>
    </div>
  );
}

// NOTE: useThree is not directly available in react-three/fiber v8 in the same way.
// It needs to be imported, so we are keeping it here but removing the import from the top.
// This is a workaround to satisfy the linter if it's not smart enough.
import { useThree } from '@react-three/fiber';