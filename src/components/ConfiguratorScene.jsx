import { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { ConfiguratorContext } from "../context/ConfiguratorContext";
import modelList from "../assets/data";

export default function ConfiguratorScene() {
  const containerRef = useRef(null);

  const {
    workingModel,
    compositionConfig,
  } = useContext(ConfiguratorContext);

  const sceneRef = useRef(null);
  const baseplateRef = useRef(null);
  const pendantRef = useRef(null);

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
    compositionConfig,
    workingModel.surfaceShape,
  ]);

  // =====================================================
  // LOAD ONE PENDANT
  // =====================================================
  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) return;

    const selectedModel = modelList.find(
      (item) => item.id === workingModel.id
    );

    if (!selectedModel) return;

    // Example:
    // GL012A + orange
    // -> /models/GL012Aorange.glb
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

    // Remove previous pendant
    if (pendantRef.current) {
      scene.remove(pendantRef.current);
      pendantRef.current = null;
    }

    const loader = new GLTFLoader();

    loader.load(
      modelPath,

      (gltf) => {
        const pendant = gltf.scene;

        pendant.position.set(
          0,
          compositionConfig.lowest,
          0
        );

        scene.add(pendant);

        pendantRef.current = pendant;
      },

      undefined,

      (error) => {
        console.error(
          "Error loading GLB:",
          modelPath,
          error
        );
      }
    );

    return () => {
      if (pendantRef.current) {
        scene.remove(pendantRef.current);
        pendantRef.current = null;
      }
    };

  }, [
    workingModel.id,
    workingModel.color,
    compositionConfig.lowest,
  ]);

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full"
    />
  );
}