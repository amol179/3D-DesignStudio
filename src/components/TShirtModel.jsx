/* eslint-disable react/no-unknown-property */

import PropTypes from "prop-types";
import { Center, Decal, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function TshirtModel({
  tshirtColor,
  designTexture,
  designTextureBack,
  onViewChange,
}) {
  const { nodes, materials } = useGLTF("/3Dmodels/02.glb");
  const meshRef = useRef();

  // Persistent texture refs (survive re-renders)
  const frontTexRef = useRef(null);
  const backTexRef = useRef(null);

  // Load front texture from data URL
  useEffect(() => {
    if (!designTexture) {
      frontTexRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      frontTexRef.current = tex;
    };
    img.src = designTexture;
  }, [designTexture]);

  // Load back texture from data URL
  useEffect(() => {
    if (!designTextureBack) {
      backTexRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      backTexRef.current = tex;
    };
    img.src = designTextureBack;
  }, [designTextureBack]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.color.set(tshirtColor);
    }
  }, [tshirtColor]);

  const handleClick = (view) => {
    onViewChange(view);
  };

  return (
    <Center position={[0, 0.1, 0]}>
      <group dispose={null}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            scale={7.5}
            position={[0, 0, 2]}
            castShadow
            receiveShadow
            geometry={nodes["T-Shirt_1"].geometry}
            material={materials.Shirt}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["T-Shirt_2"].geometry}
            scale={7.5}
            position={[0, 0, 2]}
            material={materials["front.001"]}
          >
            <meshBasicMaterial transparent opacity={0} />
            {frontTexRef.current && (
              <Decal
                position={[0, 0.2, -0.31]}
                rotation={[-Math.PI / 2 - 0.05, 0, 0]}
                scale={[0.52, 0.7, 0.5]}
                onClick={() => handleClick("front")}
              >
                <meshStandardMaterial
                  map={frontTexRef.current}
                  toneMapped={false}
                  transparent
                  polygonOffset
                  polygonOffsetFactor={-1}
                />
              </Decal>
            )}
          </mesh>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["T-Shirt_3"].geometry}
            material={materials.back}
            scale={7.5}
            position={[0, 0, 2]}
          >
            <meshBasicMaterial transparent opacity={0} />
            {backTexRef.current && (
              <Decal
                position={[0, -0.2, -0.27]}
                rotation={[Math.PI / 2 - 0.2, 0, Math.PI]}
                scale={[0.52, 0.7, 0.5]}
                onClick={() => handleClick("back")}
              >
                <meshStandardMaterial
                  map={backTexRef.current}
                  toneMapped={false}
                  transparent
                  polygonOffset
                  polygonOffsetFactor={-1}
                />
              </Decal>
            )}
          </mesh>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["T-Shirt_4"].geometry}
            material={materials["left hand"]}
            scale={7.5}
            position={[0, 0, 2]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["T-Shirt_5"].geometry}
            material={materials["right hand"]}
            scale={7.5}
            position={[0, 0, 2]}
          />
        </group>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["T-Shirt001"].geometry}
            material={materials.background}
            scale={7.5}
            position={[0, 0, 2]}
            ref={meshRef}
          />
        </group>
      </group>
    </Center>
  );
}

TshirtModel.propTypes = {
  tshirtColor: PropTypes.string.isRequired,
  designTexture: PropTypes.string,
  designTextureBack: PropTypes.string,
  onViewChange: PropTypes.func.isRequired,
};

useGLTF.preload("/3Dmodels/02.glb");
