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

  // Keep the latest config available to async GLB callbacks.
  const compositionConfigRef = useRef(compositionConfig);
  compositionConfigRef.current = compositionConfig;

  const sceneRef = useRef(null);
  const baseplateRef = useRef(null);

  // One loaded GLB is kept as the master/template.
  const pendantTemplateRef = useRef(null);

  // Active scene objects.
  const pendantRefs = useRef([]);
  const cableRefs = useRef([]);

  // Cable attachment is calculated only once per loaded GLB.
  const pendantAttachmentLocalRef = useRef(null);

  // All cables share one geometry and one material.
  const cableGeometryRef = useRef(null);
  const cableMaterialRef = useRef(null);

  // =====================================================
  // CREATE THREE.JS SCENE
  // =====================================================
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Shared cable geometry/material.
    cableGeometryRef.current =
      new THREE.CylinderGeometry(
        0.1,
        0.1,
        1,
        8
      );

    cableMaterialRef.current =
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.6,
        metalness: 0.1,
      });

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      5000
    );

    camera.position.set(220, 220, 300);

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

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.5
      );

    scene.add(ambientLight);

    const directionalLight =
      new THREE.DirectionalLight(
        0xffffff,
        2
      );

    directionalLight.position.set(
      200,
      300,
      200
    );

    scene.add(directionalLight);

    const grid =
      new THREE.GridHelper(
        1000,
        50
      );

    grid.material.transparent = true;
    grid.material.opacity = 0.08;

    scene.add(grid);

    const controls =
      new OrbitControls(
        camera,
        renderer.domElement
      );

    controls.enableDamping = true;
    controls.target.set(0, 80, 0);

    let animationFrame;

    function animate() {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      controls.update();

      renderer.render(
        scene,
        camera
      );
    }

    animate();

    function handleResize() {
      const width =
        container.clientWidth;

      const height =
        container.clientHeight;

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      controls.dispose();

      grid.geometry?.dispose();
      grid.material?.dispose();

      cableGeometryRef.current?.dispose();
      cableMaterialRef.current?.dispose();

      cableGeometryRef.current = null;
      cableMaterialRef.current = null;

      if (baseplateRef.current) {
        scene.remove(
          baseplateRef.current
        );

        baseplateRef.current.geometry?.dispose();
        baseplateRef.current.material?.dispose();

        baseplateRef.current = null;
      }

      renderer.dispose();

      if (
        renderer.domElement.parentNode
      ) {
        renderer.domElement.parentNode.removeChild(
          renderer.domElement
        );
      }

      sceneRef.current = null;
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
      (rows - 1) *
        spacingL +
      baseOffset;

    const autoWidth =
      (cols - 1) *
        spacingW +
      baseOffset;

    const resolvedLength =
      surfaceLength > 0
        ? surfaceLength
        : autoLength;

    const resolvedWidth =
      surfaceWidth > 0
        ? surfaceWidth
        : autoWidth;

    if (baseplateRef.current) {
      scene.remove(
        baseplateRef.current
      );

      baseplateRef.current.geometry?.dispose();
      baseplateRef.current.material?.dispose();

      baseplateRef.current = null;
    }

    const thickness = 4;

    let geometry;

    if (
      workingModel.surfaceShape ===
      "circle"
    ) {
      const diameter = Math.min(
        resolvedWidth,
        resolvedLength
      );

      const radius =
        diameter / 2;

      geometry =
        new THREE.CylinderGeometry(
          radius,
          radius,
          thickness,
          circleSegments
        );
    } else {
      geometry =
        new THREE.BoxGeometry(
          resolvedWidth,
          thickness,
          resolvedLength
        );
    }

    const material =
      new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        roughness: 0.7,
        metalness: 0.1,
      });

    const baseplate =
      new THREE.Mesh(
        geometry,
        material
      );

    baseplate.position.set(
      0,
      surfaceHeight,
      0
    );

    scene.add(baseplate);

    baseplateRef.current =
      baseplate;
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
  // LOAD PENDANT TEMPLATE
  // Reload ONLY when pendant or color changes
  // =====================================================
  useEffect(() => {
    const scene =
      sceneRef.current;

    if (!scene) return;

    const selectedModel =
      modelList.find(
        (item) =>
          item.id ===
          workingModel.id
      );

    if (!selectedModel) return;

    const modelPath =
      selectedModel.models?.[
        workingModel.color
      ] ??
      selectedModel.models?.default;

    console.log(
      "Selected ID:",
      workingModel.id
    );

    console.log(
      "Selected color:",
      workingModel.color
    );

    console.log(
      "Model path:",
      modelPath
    );

    if (!modelPath) {
      console.warn(
        "No GLB found for selected configuration:",
        workingModel.id,
        workingModel.color
      );

      return;
    }

    const loader =
      new GLTFLoader();

    let cancelled = false;

    loader.load(
      modelPath,

      (gltf) => {
        if (cancelled) {
          disposeObject(
            gltf.scene
          );

          return;
        }

        const pendant =
          gltf.scene;

        pendant.updateMatrixWorld(
          true
        );

        const box =
          new THREE.Box3().setFromObject(
            pendant
          );

        const size =
          new THREE.Vector3();

        box.getSize(size);

        console.log(
          "Pendant GLB size:",
          {
            width: size.x,
            height: size.y,
            depth: size.z,
          }
        );

        pendantTemplateRef.current =
          pendant;

        // Calculate cable attachment ONCE for this GLB.
        pendantAttachmentLocalRef.current =
          calculatePendantAttachment(
            pendant
          );

        rebuildPendantGrid();
      },

      undefined,

      (error) => {
        if (cancelled) return;

        console.error(
          "Error loading GLB:",
          modelPath,
          error
        );
      }
    );

    return () => {
      cancelled = true;

      clearCables();
      clearPendants();

      pendantAttachmentLocalRef.current =
        null;

      if (
        pendantTemplateRef.current
      ) {
        disposeObject(
          pendantTemplateRef.current
        );

        pendantTemplateRef.current =
          null;
      }
    };
  }, [
    workingModel.id,
    workingModel.color,
  ]);

// =====================================================
// HEIGHT PATTERN SETTINGS
// Recalculate pendant Y positions
// =====================================================
useEffect(() => {
  rebuildPendantGrid();

}, [
  compositionConfig.lowest,
  compositionConfig.highest,
  compositionConfig.pattern,
]);

  // =====================================================
  // BASEPLATE HEIGHT → UPDATE EXISTING CABLES
  // =====================================================
  useEffect(() => {
    updateAllCables();
  }, [
    compositionConfig.surfaceHeight,
  ]);

  // =====================================================
  // MULTIPLE PENDANT GRID
  // Reuse existing pendants/cables.
  // =====================================================
  useEffect(() => {
    rebuildPendantGrid();
  }, [
    compositionConfig.rows,
    compositionConfig.cols,
    compositionConfig.spacingL,
    compositionConfig.spacingW,
  ]);

  // =====================================================
  // CALCULATE CABLE ATTACHMENT ONCE PER GLB
  // =====================================================
  function calculatePendantAttachment(
    template
  ) {
    template.updateMatrixWorld(
      true
    );

    const box =
      new THREE.Box3().setFromObject(
        template
      );

    const center =
      new THREE.Vector3();

    box.getCenter(center);

    const raycaster =
      new THREE.Raycaster();

    raycaster.set(
      new THREE.Vector3(
        center.x,
        box.max.y + 1000,
        center.z
      ),
      new THREE.Vector3(
        0,
        -1,
        0
      )
    );

    const hits =
      raycaster.intersectObject(
        template,
        true
      );

    let attachmentWorld;

    if (hits.length > 0) {
      attachmentWorld =
        hits[0].point.clone();
    } else {
      attachmentWorld =
        new THREE.Vector3(
          center.x,
          box.max.y,
          center.z
        );
    }

    return template.worldToLocal(
      attachmentWorld.clone()
    );
  }

  // =====================================================
  // CLEAR ALL CABLES
  // Used only when changing model/color or cleaning up.
  // =====================================================
  function clearCables() {
    const scene =
      sceneRef.current;

    if (!scene) {
      cableRefs.current = [];
      return;
    }

    cableRefs.current.forEach(
      (cable) => {
        scene.remove(cable);
      }
    );

    cableRefs.current = [];
  }

  // =====================================================
  // CLEAR ALL PENDANTS
  // Clones share geometry/material with the template,
  // so do not dispose clones individually here.
  // =====================================================
  function clearPendants() {
    const scene =
      sceneRef.current;

    if (!scene) {
      pendantRefs.current = [];
      return;
    }

    pendantRefs.current.forEach(
      (pendant) => {
        scene.remove(pendant);
      }
    );

    pendantRefs.current = [];
  }

  // =====================================================
  // UPDATE EXISTING CABLES
  // No raycasts and no cable mesh recreation here.
  // =====================================================
  function updateAllCables() {
    const baseplate =
      baseplateRef.current;

    const attachmentLocal =
      pendantAttachmentLocalRef.current;

    if (
      !baseplate ||
      !attachmentLocal
    ) {
      return;
    }

    baseplate.updateMatrixWorld(
      true
    );

    // Calculate the bottom of the baseplate once.
    const baseplateBox =
      new THREE.Box3().setFromObject(
        baseplate
      );

    const baseplateBottomY =
      baseplateBox.min.y;

    // Reuse one Vector3 for the whole loop.
    const attachmentWorld =
      new THREE.Vector3();

    pendantRefs.current.forEach(
      (pendant, index) => {
        const cable =
          cableRefs.current[index];

        if (!cable) return;

        pendant.updateMatrixWorld(
          true
        );

        attachmentWorld
          .copy(
            attachmentLocal
          )
          .applyMatrix4(
            pendant.matrixWorld
          );

        const cableLength =
          baseplateBottomY -
          attachmentWorld.y;

        if (cableLength <= 0) {
          cable.visible = false;
          return;
        }

        cable.visible = true;

        cable.scale.set(
          1,
          cableLength,
          1
        );

        cable.position.set(
          attachmentWorld.x,
          attachmentWorld.y +
            cableLength / 2,
          attachmentWorld.z
        );
      }
    );
  }

  // =====================================================
// CALCULATE PENDANT HEIGHT
// Step 4D - Height Pattern Engine
// =====================================================
function calculatePendantHeight({
  rowIndex,
  colIndex,
  rows,
  cols,
  pattern,
  lowest,
  highest,
}) {
  const range =
    highest - lowest;

  switch (pattern) {

    // ==================================================
    // FLAT
    // ==================================================
    case "flat":
      return lowest;


    // ==================================================
    // DIAGONAL
    // ==================================================
    case "diagonal": {
      const maxStep =
        (rows - 1) +
        (cols - 1);

      if (maxStep === 0) {
        return lowest;
      }

      const currentStep =
        rowIndex +
        colIndex;

      const progress =
        currentStep /
        maxStep;

      return (
        lowest +
        range * progress
      );
    }


    // ==================================================
    // DOME
    // Center = highest
    // Outside = lowest
    // ==================================================
    case "dome": {
      const centerRow =
        (rows - 1) / 2;

      const centerCol =
        (cols - 1) / 2;

      const rowOffset =
        rowIndex - centerRow;

      const colOffset =
        colIndex - centerCol;

      const maxRowOffset =
        centerRow;

      const maxColOffset =
        centerCol;

      const normalizedRow =
        maxRowOffset > 0
          ? rowOffset /
            maxRowOffset
          : 0;

      const normalizedCol =
        maxColOffset > 0
          ? colOffset /
            maxColOffset
          : 0;

      const distance =
        Math.sqrt(
          normalizedRow *
            normalizedRow +
          normalizedCol *
            normalizedCol
        );

      const maxDistance =
        Math.sqrt(
          (rows > 1 ? 1 : 0) +
          (cols > 1 ? 1 : 0)
        );

      if (maxDistance === 0) {
        return highest;
      }

      const progress =
        Math.min(
          distance /
            maxDistance,
          1
        );

      return (
        highest -
        range * progress
      );
    }


    // ==================================================
    // REVERSE DOME
    // Center = lowest
    // Outside = highest
    // ==================================================
    case "reverseDome": {
      const centerRow =
        (rows - 1) / 2;

      const centerCol =
        (cols - 1) / 2;

      const rowOffset =
        rowIndex - centerRow;

      const colOffset =
        colIndex - centerCol;

      const maxRowOffset =
        centerRow;

      const maxColOffset =
        centerCol;

      const normalizedRow =
        maxRowOffset > 0
          ? rowOffset /
            maxRowOffset
          : 0;

      const normalizedCol =
        maxColOffset > 0
          ? colOffset /
            maxColOffset
          : 0;

      const distance =
        Math.sqrt(
          normalizedRow *
            normalizedRow +
          normalizedCol *
            normalizedCol
        );

      const maxDistance =
        Math.sqrt(
          (rows > 1 ? 1 : 0) +
          (cols > 1 ? 1 : 0)
        );

      if (maxDistance === 0) {
        return lowest;
      }

      const progress =
        Math.min(
          distance /
            maxDistance,
          1
        );

      return (
        lowest +
        range * progress
      );
    }


    // ==================================================
    // WAVE
    // ==================================================
    case "wave": {
      const totalSteps =
        Math.max(
          rows + cols - 2,
          1
        );

      const progress =
        (
          rowIndex +
          colIndex
        ) / totalSteps;

      const wave =
        (
          Math.sin(
            progress *
              Math.PI *
              2
          ) +
          1
        ) / 2;

      return (
        lowest +
        range * wave
      );
    }


    // ==================================================
    // RIPPLE
    // Circular waves from the center
    // ==================================================
    case "ripple": {
      const centerRow =
        (rows - 1) / 2;

      const centerCol =
        (cols - 1) / 2;

      const rowOffset =
        rowIndex - centerRow;

      const colOffset =
        colIndex - centerCol;

      const distance =
        Math.sqrt(
          rowOffset *
            rowOffset +
          colOffset *
            colOffset
        );

      const ripple =
        (
          Math.cos(
            distance *
              Math.PI
          ) +
          1
        ) / 2;

      return (
        lowest +
        range * ripple
      );
    }


    // ==================================================
// SPIRAL
// Smooth spiral with no sudden height jump
// ==================================================
case "spiral": {
  const centerRow =
    (rows - 1) / 2;

  const centerCol =
    (cols - 1) / 2;

  const rowOffset =
    rowIndex - centerRow;

  const colOffset =
    colIndex - centerCol;

  const angle =
    Math.atan2(
      rowOffset,
      colOffset
    );

  const distance =
    Math.sqrt(
      rowOffset * rowOffset +
      colOffset * colOffset
    );

  const maxRadius =
    Math.sqrt(
      centerRow * centerRow +
      centerCol * centerCol
    );

  const normalizedRadius =
    maxRadius > 0
      ? distance / maxRadius
      : 0;

  // Controls how tightly the spiral winds
  const spiralTurns = 2;

  const phase =
    angle +
    normalizedRadius *
      Math.PI *
      2 *
      spiralTurns;

  // Smooth 0 → 1 transition
  const progress =
    (
      Math.sin(phase) +
      1
    ) / 2;

  return (
    lowest +
    range * progress
  );
}


    // ==================================================
    // CHECKERBOARD
    // ==================================================
    case "checkerboard": {
      const isHigh =
        (
          rowIndex +
          colIndex
        ) % 2 === 0;

      return isHigh
        ? highest
        : lowest;
    }


    // ==================================================
    // RANDOM
    // Deterministic random:
    // same grid position keeps same height
    // ==================================================
    case "random": {
      const seed =
        Math.sin(
          rowIndex *
            12.9898 +
          colIndex *
            78.233
        ) *
        43758.5453;

      const randomValue =
        seed -
        Math.floor(seed);

      return (
        lowest +
        range *
          randomValue
      );
    }


    // ==================================================
    // FALLBACK
    // ==================================================
    default:
      return lowest;
  }
}

  // =====================================================
  // SYNC PENDANT GRID USING OBJECT REUSE
  // Only add/remove the difference.
  // =====================================================
  function rebuildPendantGrid() {
    const scene =
      sceneRef.current;

    const template =
      pendantTemplateRef.current;

    if (
      !scene ||
      !template ||
      !cableGeometryRef.current ||
      !cableMaterialRef.current
    ) {
      return;
    }

const {
  rows,
  cols,
  spacingL,
  spacingW,
  lowest,
  highest = lowest,
  pattern = "flat",
} =
  compositionConfigRef.current;

    const safeRows =
      Math.max(
        0,
        Math.floor(rows)
      );

    const safeCols =
      Math.max(
        0,
        Math.floor(cols)
      );

    const requiredCount =
      safeRows * safeCols;

    // Add only missing pendant/cable pairs.
    while (
      pendantRefs.current.length <
      requiredCount
    ) {
      const pendant =
        template.clone(true);

      scene.add(pendant);

      pendantRefs.current.push(
        pendant
      );

      const cable =
        new THREE.Mesh(
          cableGeometryRef.current,
          cableMaterialRef.current
        );

      scene.add(cable);

      cableRefs.current.push(
        cable
      );
    }

    // Remove only extra pendant/cable pairs.
    while (
      pendantRefs.current.length >
      requiredCount
    ) {
      const pendant =
        pendantRefs.current.pop();

      if (pendant) {
        scene.remove(pendant);
      }

      const cable =
        cableRefs.current.pop();

      if (cable) {
        scene.remove(cable);
      }
    }

    // Reposition the objects that already exist.
    for (
      let index = 0;
      index < requiredCount;
      index++
    ) {
      const rowIndex =
        Math.floor(
          index / safeCols
        );

      const colIndex =
        index % safeCols;

      const x =
        (
          colIndex -
          (safeCols - 1) / 2
        ) * spacingW;

      const z =
        (
          rowIndex -
          (safeRows - 1) / 2
        ) * spacingL;

        const y =
  calculatePendantHeight({
    rowIndex,
    colIndex,
    rows: safeRows,
    cols: safeCols,
    pattern,
    lowest,
    highest,
  });

      const pendant =
        pendantRefs.current[index];

pendant.position.set(
  x,
  y,
  z
);
    }

    updateAllCables();
  }

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full"
    />
  );
}
