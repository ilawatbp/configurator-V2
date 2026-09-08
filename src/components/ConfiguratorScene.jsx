import { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { ConfiguratorContext } from "../context/ConfiguratorContext";
import modelList from "../assets/data";

function disposeObject(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;

    child.geometry?.dispose();

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!material) return;

      Object.values(material).forEach((value) => {
        if (value?.isTexture) {
          value.dispose();
        }
      });

      material.dispose();
    });
  });
}


export default function ConfiguratorScene() {
  const containerRef = useRef(null);

  const {
    workingModel,
    compositionConfig,
  } = useContext(ConfiguratorContext);

  const sceneRef = useRef(null);
  const baseplateRef = useRef(null);
  const pendantRef = useRef(null);
  const lowestRef = useRef(compositionConfig.lowest);

  // =====================================================
  // CREATE THREE.JS SCENE
  // =====================================================
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // ---------------------------
    // SCENE
    // ---------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    sceneRef.current = scene;

    // ---------------------------
    // CAMERA
    // ---------------------------
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      5000
    );

    camera.position.set(220, 220, 300);

    // ---------------------------
    // RENDERER
    // ---------------------------
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    container.appendChild(renderer.domElement);

    // ---------------------------
    // LIGHTS
    // ---------------------------
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      1.5
    );

    scene.add(ambientLight);

    const directionalLight =
      new THREE.DirectionalLight(0xffffff, 2);

    directionalLight.position.set(200, 300, 200);

    scene.add(directionalLight);

    // ---------------------------
    // GRID
    // ---------------------------
    const grid = new THREE.GridHelper(
      1000,
      50
    );

    grid.material.transparent = true;
    grid.material.opacity = 0.08;

    scene.add(grid);

    // ---------------------------
    // CONTROLS
    // ---------------------------
    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.target.set(0, 80, 0);

    // ---------------------------
    // ANIMATION
    // ---------------------------
    let animationFrame;

    function animate() {
      animationFrame = requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // ---------------------------
    // RESIZE
    // ---------------------------
    function handleResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    // ---------------------------
    // CLEANUP
    // ---------------------------
    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener(
        "resize",
        handleResize
      );

      controls.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);
  

  // =====================================================
  // BASEPLATE
  // =====================================================
  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) return;

    const {
      rows,
      cols,
      spacingL,
      spacingW,
      surfaceWidth,
      surfaceLength,
      surfaceHeight,
      baseOffset,
      circleSegments,
    } = compositionConfig;

    const autoLength =
      (rows - 1) * spacingL + baseOffset;

    const autoWidth =
      (cols - 1) * spacingW + baseOffset;

    const resolvedLength =
      surfaceLength > 0
        ? surfaceLength
        : autoLength;

    const resolvedWidth =
      surfaceWidth > 0
        ? surfaceWidth
        : autoWidth;

    // Remove old baseplate
    if (baseplateRef.current) {
      scene.remove(baseplateRef.current);

      baseplateRef.current.geometry.dispose();
      baseplateRef.current.material.dispose();
    }

    const thickness = 4;

    let geometry;

    // ---------------------------
    // CIRCLE
    // ---------------------------
    if (workingModel.surfaceShape === "circle") {
      const diameter = Math.min(
        resolvedWidth,
        resolvedLength
      );

      const radius = diameter / 2;

      geometry = new THREE.CylinderGeometry(
        radius,
        radius,
        thickness,
        circleSegments
      );
    }

    // ---------------------------
    // RECTANGLE
    // ---------------------------
    else {
      geometry = new THREE.BoxGeometry(
        resolvedWidth,
        thickness,
        resolvedLength
      );
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.7,
      metalness: 0.1,
    });

    const baseplate = new THREE.Mesh(
      geometry,
      material
    );

    baseplate.position.set(
      0,
      surfaceHeight,
      0
    );

    scene.add(baseplate);

    baseplateRef.current = baseplate;

  }, [
  compositionConfig.rows,
  compositionConfig.cols,
  compositionConfig.spacingL,
  compositionConfig.spacingW,
  compositionConfig.surfaceWidth,
  compositionConfig.surfaceLength,
  compositionConfig.surfaceHeight,
  compositionConfig.baseOffset,
  compositionConfig.circleSegments,
  workingModel.surfaceShape,
]);

// =====================================================
// LOAD ONE PENDANT
// Reload ONLY when pendant or color changes
// =====================================================
useEffect(() => {
  const scene = sceneRef.current;

  if (!scene) return;

  const selectedModel = modelList.find(
    (item) => item.id === workingModel.id
  );

  if (!selectedModel) return;

  const modelPath =
    selectedModel.models?.[workingModel.color] ??
    selectedModel.models?.default;

  console.log("Selected ID:", workingModel.id);
  console.log("Selected color:", workingModel.color);
  console.log("Model path:", modelPath);

  if (!modelPath) {
    console.warn(
      "No GLB found for selected configuration:",
      workingModel.id,
      workingModel.color
    );

    return;
  }

  // Remove old pendant
  if (pendantRef.current) {
    scene.remove(pendantRef.current);

    disposeObject(pendantRef.current);

    pendantRef.current = null;
  }

  const loader = new GLTFLoader();

  let cancelled = false;

  loader.load(
    modelPath,

    // SUCCESS
    (gltf) => {
      if (cancelled) {
        disposeObject(gltf.scene);
        return;
      }

      const pendant = gltf.scene;

      pendant.updateMatrixWorld(true);

      const box =
        new THREE.Box3().setFromObject(pendant);

      const size =
        new THREE.Vector3();

      box.getSize(size);

      console.log("Pendant GLB size:", {
        width: size.x,
        height: size.y,
        depth: size.z,
      });

      pendant.position.set(
        0,
        lowestRef.current,
        0
      );

      scene.add(pendant);

      pendantRef.current = pendant;
    },

    undefined,

    // ERROR
    (error) => {
      if (cancelled) return;

      console.error(
        "Error loading GLB:",
        modelPath,
        error
      );
    }
  );

  // CLEANUP
  return () => {
    cancelled = true;

    if (pendantRef.current) {
      scene.remove(pendantRef.current);

      disposeObject(pendantRef.current);

      pendantRef.current = null;
    }
  };

}, [
  workingModel.id,
  workingModel.color,
]);

  // =====================================================
// PENDANT HEIGHT
// Move existing pendant without reloading the GLB
// =====================================================
useEffect(() => {
  lowestRef.current = compositionConfig.lowest;

  const pendant = pendantRef.current;

  if (!pendant) return;

  pendant.position.y = compositionConfig.lowest;

}, [compositionConfig.lowest]);

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full"
    />
  );
}