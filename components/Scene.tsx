import { Canvas, extend, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import React, { useEffect } from 'react';
import { Physics, Triplet, useSphere } from '@react-three/cannon';
import * as THREE from 'three';

extend({ OrbitControls });

const norm = (v: Triplet) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

const Center = () => {
  const [ref, api] = useSphere(() => ({
    mass: 1000000,
    position: [0, 0, 0],
    args: [1],
  }));

  return (
    <mesh castShadow receiveShadow ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="orange" opacity={1} />
    </mesh>
  );
};

const Sphere = ({
  velocity = [0, 8, 0] as Triplet,
  position = [6, 0, 0] as Triplet,
  color = 'red',
}) => {
  const [ref, api] = useSphere(() => ({
    mass: 5,
    position,
    velocity,
    linearDamping: 0,
    angularDamping: 0,
  }));

  const [positionVector, setPositionVector] = React.useState<Triplet>([
    0, 0, 0,
  ]);
  const [velocityVector, setVelocityVector] = React.useState<Triplet>([
    0, 0, 0,
  ]);

  const vec = new THREE.Vector3();

  useEffect(() => {
    api.position.subscribe((v) => setPositionVector(v));
    api.velocity.subscribe((v) => setVelocityVector(v));
  }, []);

  useFrame(() => {
    api.applyLocalForce(
      // Random vector applied from the current position of the object towards the center
      vec
        // @ts-ignore Fix
        .setFromMatrixPosition(ref.current?.matrix)
        .normalize()
        .multiplyScalar(-2)
        .toArray(),
      [0, 0, 0]
    );
  });

  return (
    <>
      <mesh castShadow receiveShadow ref={ref}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0}
          envMapIntensity={0.2}
          emissive="#370037"
        />
      </mesh>
      {/* Velocity vector */}
      <arrowHelper
        args={[
          new THREE.Vector3(
            velocityVector[0],
            velocityVector[1],
            velocityVector[2]
          ).normalize(),
          new THREE.Vector3(
            positionVector[0],
            positionVector[1],
            positionVector[2]
          ),
          norm(velocityVector) * 2,
          'red',
        ]}
      />
      {/* Position vector */}
      <arrowHelper
        args={[
          new THREE.Vector3(
            positionVector[0],
            positionVector[1],
            positionVector[2]
          )
            .negate()
            .normalize(),
          new THREE.Vector3(
            positionVector[0],
            positionVector[1],
            positionVector[2]
          ),
          2,
          'red',
        ]}
      />
    </>
  );
};

const Scene = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Canvas dpr={Math.min(window.devicePixelRatio, 2)} shadows linear>
      <React.Suspense fallback={null}>
        <OrbitControls attach="orbitControls" />
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 10]}
          fov={75}
          near={0.01}
          far={100}
        />
        <color attach="background" args={['#EBECF2']} />
        <ambientLight intensity={0.25} />
        <directionalLight
          intensity={5}
          position={[-10, -10, 0]}
          color="white"
          castShadow
          shadow-mapSize={[4096, 4096]}
        />
        <Physics gravity={[0, 0, 0]} iterations={10}>
          {/* <Sphere position={[6, 0, 6]} velocity={[0, 8, 0]} /> */}
          <Sphere position={[5, 0, 0]} velocity={[0, 2, 0]} color="blue" />
          <Center />
        </Physics>
        <axesHelper args={[10]} />
        <gridHelper args={[40, 100]} rotation={[-Math.PI / 2, 0, 0]} />
      </React.Suspense>
    </Canvas>
  );
};

export default Scene;
