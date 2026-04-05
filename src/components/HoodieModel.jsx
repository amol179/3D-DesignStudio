/* eslint-disable react/no-unknown-property */
import PropTypes from "prop-types";
import { Center, Decal, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import * as THREE from "three";

export function HoodieModel({ tshirtColor, onViewChange, selectedView }) {
  const { nodes, materials } = useGLTF("/3Dmodels/hoodie.glb");
  const { frontCanvas, backCanvas } = useCanvas();

  // Create CanvasTexture directly from the Fabric canvas DOM elements
  const frontTexRef = useRef(null);
  const backTexRef = useRef(null);
  const frontHasDesign = useRef(false);
  const backHasDesign = useRef(false);

  // Sync the front canvas texture
  useEffect(() => {
    if (frontCanvas) {
      // Fabric.js canvas has a lowerCanvasEl which contains the rendered content
      const canvasEl = frontCanvas.lowerCanvasEl || frontCanvas.getElement();
      if (canvasEl) {
        const tex = new THREE.CanvasTexture(canvasEl);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        frontTexRef.current = tex;
        frontHasDesign.current = frontCanvas.getObjects().length > 0;
      }
    } else {
      frontTexRef.current = null;
      frontHasDesign.current = false;
    }
  }, [frontCanvas]);

  // Sync the back canvas texture
  useEffect(() => {
    if (backCanvas) {
      const canvasEl = backCanvas.lowerCanvasEl || backCanvas.getElement();
      if (canvasEl) {
        const tex = new THREE.CanvasTexture(canvasEl);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        backTexRef.current = tex;
        backHasDesign.current = backCanvas.getObjects().length > 0;
      }
    } else {
      backTexRef.current = null;
      backHasDesign.current = false;
    }
  }, [backCanvas]);

  // Update textures every frame to keep them in sync with canvas changes
  useFrame(() => {
    if (frontTexRef.current && frontCanvas) {
      frontTexRef.current.needsUpdate = true;
      frontHasDesign.current = frontCanvas.getObjects().length > 0;
    }
    if (backTexRef.current && backCanvas) {
      backTexRef.current.needsUpdate = true;
      backHasDesign.current = backCanvas.getObjects().length > 0;
    }
  });

  const meshNodes = useMemo(
    () => Object.values(nodes).filter((node) => node.isMesh),
    [nodes]
  );

  useEffect(() => {
    meshNodes.forEach((node) => {
      if (node.material?.color) {
        node.material.color.set(tshirtColor);
      }
    });
  }, [meshNodes, tshirtColor]);

  const torsoNode = meshNodes[0];
  if (!torsoNode) return null;

  const handleModelClick = () => {
    onViewChange?.(selectedView === "front" ? "back" : "front");
  };

  const showFrontDecal = frontTexRef.current && frontHasDesign.current;
  const showBackDecal = backTexRef.current && backHasDesign.current;

  return (
    <Center position={[0, 0.05, 0]}>
      <group dispose={null}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {meshNodes.map((node, index) => (
            <mesh
              key={node.uuid}
              castShadow
              receiveShadow
              geometry={node.geometry}
              material={node.material || Object.values(materials)[0]}
              scale={1.55}
              position={node.position}
              rotation={node.rotation}
              onClick={index === 0 ? handleModelClick : undefined}
            >
              {index === 0 && (
                <>
                  {/* Front Decal */}
                  {showFrontDecal && (
                    <Decal
                      position={[0, 0.08, 0.68]}
                      rotation={[-Math.PI / 2 - 0.03, 0, 0]}
                      scale={[0.5, 0.62, 0.45]}
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
                  {/* Back Decal */}
                  {showBackDecal && (
                    <Decal
                      position={[0, 0.08, -0.68]}
                      rotation={[Math.PI / 2 - 0.05, 0, Math.PI]}
                      scale={[0.5, 0.62, 0.45]}
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
                </>
              )}
            </mesh>
          ))}
        </group>
      </group>
    </Center>
  );
}

HoodieModel.propTypes = {
  tshirtColor: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
  selectedView: PropTypes.oneOf(["front", "back"]).isRequired,
};

useGLTF.preload("/3Dmodels/hoodie.glb");