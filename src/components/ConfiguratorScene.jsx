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

  // Keep latest config available to async callbacks.
  const compositionConfigRef =
    useRef(compositionConfig);

  compositionConfigRef.current =
    compositionConfig;

  const sceneRef = useRef(null);
  const baseplateRef = useRef(null);

  // Camera / controls references
const cameraRef = useRef(null);
const controlsRef = useRef(null);

const cameraTransitionRef = useRef({
  active: false,

  startPosition:
    new THREE.Vector3(),

  endPosition:
    new THREE.Vector3(),

  startTarget:
    new THREE.Vector3(),

  endTarget:
    new THREE.Vector3(),

  startTime: 0,
  duration: 650,
});

  // Master GLB
  const pendantTemplateRef =
    useRef(null);

  // Active scene objects
  const pendantRefs =
    useRef([]);

  const cableRefs =
    useRef([]);

  // GLB-specific information
  const pendantAttachmentLocalRef =
    useRef(null);

  const pendantBaseQuaternionRef =
    useRef(null);

  // Shared cable resources
  const cableGeometryRef =
    useRef(null);

  const cableMaterialRef =
    useRef(null);

  // =====================================================
  // CREATE THREE.JS SCENE
  // =====================================================
  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) return;

    // ---------------------------
    // SCENE
    // ---------------------------
    const scene =
      new THREE.Scene();

    scene.background =
      new THREE.Color(
        0xf5f5f5
      );

    sceneRef.current =
      scene;

    // ---------------------------
    // SHARED CABLE RESOURCES
    // ---------------------------
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

    // ---------------------------
    // CAMERA
    // ---------------------------
    const camera =
      new THREE.PerspectiveCamera(
        60,
        container.clientWidth /
          container.clientHeight,
        0.1,
        5000
      );

    camera.position.set(
      220,
      220,
      300
    );

    cameraRef.current =
  camera;

    // ---------------------------
    // RENDERER
    // ---------------------------
    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
      });

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    container.appendChild(
      renderer.domElement
    );

    // ---------------------------
    // LIGHTS
    // ---------------------------
    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.5
      );

    scene.add(
      ambientLight
    );

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

    scene.add(
      directionalLight
    );

    // ---------------------------
    // GRID
    // ---------------------------
    const grid =
      new THREE.GridHelper(
        1000,
        50
      );

    grid.material.transparent =
      true;

    grid.material.opacity =
      0.08;

    scene.add(grid);

    // ---------------------------
    // CONTROLS
    // ---------------------------
    const controls =
      new OrbitControls(
        camera,
        renderer.domElement
      );

    controls.enableDamping =
      true;

    controls.target.set(
      0,
      80,
      0
    );

    controlsRef.current =
  controls;

  function handleControlsStart() {
  cameraTransitionRef.current.active =
    false;
}

controls.addEventListener(
  "start",
  handleControlsStart
);

    // ---------------------------
    // ANIMATION
    // ---------------------------
    let animationFrame;

function animate() {
  animationFrame =
    requestAnimationFrame(
      animate
    );

  // =====================================================
  // SMOOTH CAMERA TRANSITION
  // =====================================================
  const transition =
    cameraTransitionRef.current;

  if (transition.active) {
    const elapsed =
      performance.now() -
      transition.startTime;

    const progress =
      Math.min(
        elapsed /
          transition.duration,
        1
      );

    // Smooth ease-in / ease-out
    const eased =
      progress < 0.5
        ? 4 *
          progress *
          progress *
          progress
        : 1 -
          Math.pow(
            -2 * progress + 2,
            3
          ) /
            2;

    camera.position.lerpVectors(
      transition.startPosition,
      transition.endPosition,
      eased
    );

    controls.target.lerpVectors(
      transition.startTarget,
      transition.endTarget,
      eased
    );

    if (progress >= 1) {
      transition.active =
        false;

      camera.position.copy(
        transition.endPosition
      );

      controls.target.copy(
        transition.endTarget
      );
    }
  }

  controls.update();

  renderer.render(
    scene,
    camera
  );
}

    animate();

    // ---------------------------
    // RESIZE
    // ---------------------------
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

    // ---------------------------
    // CLEANUP
    // ---------------------------
    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      controls.removeEventListener(
  "start",
  handleControlsStart
);

      controls.dispose();

      controlsRef.current =
  null;

cameraRef.current =
  null;

      grid.geometry?.dispose();
      grid.material?.dispose();

      cableGeometryRef.current?.dispose();
      cableMaterialRef.current?.dispose();

      cableGeometryRef.current =
        null;

      cableMaterialRef.current =
        null;

      if (
        baseplateRef.current
      ) {
        scene.remove(
          baseplateRef.current
        );

        baseplateRef.current
          .geometry
          ?.dispose();

        baseplateRef.current
          .material
          ?.dispose();

        baseplateRef.current =
          null;
      }

      renderer.dispose();

      if (
        renderer.domElement
          .parentNode
      ) {
        renderer.domElement
          .parentNode
          .removeChild(
            renderer.domElement
          );
      }

      sceneRef.current =
        null;
    };
  }, []);

  // =====================================================
  // BASEPLATE
  // =====================================================
  useEffect(() => {
    const scene =
      sceneRef.current;

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
    } =
      compositionConfig;

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

    // Remove old baseplate
    if (
      baseplateRef.current
    ) {
      scene.remove(
        baseplateRef.current
      );

      baseplateRef.current
        .geometry
        ?.dispose();

      baseplateRef.current
        .material
        ?.dispose();

      baseplateRef.current =
        null;
    }

    const thickness = 4;

    let geometry;

    // ---------------------------
    // CIRCLE
    // ---------------------------
    if (
      workingModel.surfaceShape ===
      "circle"
    ) {
      const diameter =
        Math.min(
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
    }

    // ---------------------------
    // RECTANGLE
    // ---------------------------
    else {
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

    scene.add(
      baseplate
    );

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
  // Reload only when model/color changes
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

    if (!selectedModel) {
      return;
    }

const rawModelPath =
  selectedModel.models?.[
    workingModel.color
  ] ??
  selectedModel.models
    ?.default;

const modelPath = rawModelPath
  ? `${import.meta.env.BASE_URL}${rawModelPath.replace(/^\/+/, "")}`
  : null;

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

    let cancelled =
      false;

    loader.load(
      modelPath,

      // SUCCESS
      (gltf) => {
        if (cancelled) {
          disposeObject(
            gltf.scene
          );

          return;
        }

        const pendant =
          gltf.scene;

        // Save original GLB rotation
        pendantBaseQuaternionRef.current =
          pendant.quaternion.clone();

        pendant.updateMatrixWorld(
          true
        );

        // ---------------------------
        // DEBUG GLB SIZE
        // ---------------------------
        const box =
          new THREE.Box3()
            .setFromObject(
              pendant
            );

        const size =
          new THREE.Vector3();

        box.getSize(size);

        console.log(
          "Pendant GLB size:",
          {
            width:
              size.x,
            height:
              size.y,
            depth:
              size.z,
          }
        );

        // Save ONE master GLB
        pendantTemplateRef.current =
          pendant;

        // Find cable attachment once
        pendantAttachmentLocalRef.current =
          calculatePendantAttachment(
            pendant
          );

// Build current grid
rebuildPendantGrid();

// Frame newly loaded pendant model
requestAnimationFrame(
  () => {
    fitCameraToComposition();
  }
);
      },

      undefined,

      // ERROR
      (error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Error loading GLB:",
          modelPath,
          error
        );
      }
    );

    // ---------------------------
    // GLB CLEANUP
    // ---------------------------
    return () => {
      cancelled =
        true;

      clearCables();
      clearPendants();

      pendantAttachmentLocalRef.current =
        null;

      pendantBaseQuaternionRef.current =
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
  // PENDANT LAYOUT + HEIGHT + ROTATION
  // One effect for all layout-related changes
  // =====================================================
  useEffect(() => {
    rebuildPendantGrid();
  }, [
    // Grid
    compositionConfig.rows,
    compositionConfig.cols,
    compositionConfig.spacingL,
    compositionConfig.spacingW,

    // Height pattern
    compositionConfig.lowest,
    compositionConfig.highest,
    compositionConfig.pattern,

    // Rotation
    compositionConfig.rotationPattern,

    // Surface / clipping
    compositionConfig.surfaceWidth,
    compositionConfig.surfaceLength,
    compositionConfig.baseOffset,

    // Baseplate shape
    workingModel.surfaceShape,
  ]);

  // =====================================================
  // BASEPLATE HEIGHT
  // Only cable lengths need updating
  // =====================================================
  useEffect(() => {
    updateAllCables();
  }, [
    compositionConfig.surfaceHeight,
  ]);

  // =====================================================
// AUTO-FRAME CAMERA WHEN COMPOSITION CHANGES
// =====================================================
useEffect(() => {
  const frameId =
    requestAnimationFrame(
      () => {
        fitCameraToComposition();
      }
    );

  return () => {
    cancelAnimationFrame(
      frameId
    );
  };
}, [
  // Grid / radial layout
  compositionConfig.rows,
  compositionConfig.cols,
  compositionConfig.spacingL,
  compositionConfig.spacingW,

  // Height
  compositionConfig.lowest,
  compositionConfig.highest,
  compositionConfig.pattern,

  // Baseplate
  compositionConfig.surfaceWidth,
  compositionConfig.surfaceLength,
  compositionConfig.surfaceHeight,
  compositionConfig.baseOffset,

  // Shape
  workingModel.surfaceShape,

  // Rotation can slightly affect
  // bounds of asymmetrical pendants
  compositionConfig.rotationPattern,
]);

  // =====================================================
  // CALCULATE PENDANT ATTACHMENT
  // Raycast only ONCE per loaded GLB
  // =====================================================
  function calculatePendantAttachment(
    template
  ) {
    template.updateMatrixWorld(
      true
    );

    const box =
      new THREE.Box3()
        .setFromObject(
          template
        );

    const center =
      new THREE.Vector3();

    box.getCenter(
      center
    );

    const raycaster =
      new THREE.Raycaster();

    raycaster.set(
      new THREE.Vector3(
        center.x,
        box.max.y +
          1000,
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

    if (
      hits.length > 0
    ) {
      attachmentWorld =
        hits[0]
          .point
          .clone();
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
  // =====================================================
  function clearCables() {
    const scene =
      sceneRef.current;

    if (!scene) {
      cableRefs.current =
        [];

      return;
    }

    cableRefs.current.forEach(
      (cable) => {
        scene.remove(
          cable
        );
      }
    );

    cableRefs.current =
      [];
  }

  // =====================================================
  // CLEAR ALL PENDANTS
  // =====================================================
  function clearPendants() {
    const scene =
      sceneRef.current;

    if (!scene) {
      pendantRefs.current =
        [];

      return;
    }

    pendantRefs.current.forEach(
      (pendant) => {
        scene.remove(
          pendant
        );
      }
    );

    pendantRefs.current =
      [];
  }

  // =====================================================
  // UPDATE EXISTING CABLES
  // No raycast
  // No cable recreation
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

    // Calculate baseplate bottom once
    const baseplateBox =
      new THREE.Box3()
        .setFromObject(
          baseplate
        );

    const baseplateBottomY =
      baseplateBox.min.y;

    // Reuse Vector3
    const attachmentWorld =
      new THREE.Vector3();

    pendantRefs.current.forEach(
      (
        pendant,
        index
      ) => {
        const cable =
          cableRefs.current[
            index
          ];

        if (!cable) {
          return;
        }

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

        if (
          cableLength <= 0
        ) {
          cable.visible =
            false;

          return;
        }

        cable.visible =
          true;

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
  // =====================================================
 // =====================================================
// CALCULATE PENDANT HEIGHT
//
// Routes height calculation to the correct
// pattern engine depending on baseplate shape.
// =====================================================
function calculatePendantHeight(params) {
  if (
    params.surfaceShape ===
    "circle"
  ) {
    return calculateCircleHeight(
      params
    );
  }

  return calculateRectangleHeight(
    params
  );
}


// =====================================================
// RECTANGLE HEIGHT PATTERNS
// Existing rectangular behavior
// =====================================================
function calculateRectangleHeight({
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
        rowIndex -
        centerRow;

      const colOffset =
        colIndex -
        centerCol;

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

      if (
        maxDistance === 0
      ) {
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
        rowIndex -
        centerRow;

      const colOffset =
        colIndex -
        centerCol;

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

      if (
        maxDistance === 0
      ) {
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
          rows +
            cols -
            2,
          1
        );

      const progress =
        (
          rowIndex +
          colIndex
        ) /
        totalSteps;

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
    // ==================================================
    case "ripple": {
      const centerRow =
        (rows - 1) / 2;

      const centerCol =
        (cols - 1) / 2;

      const rowOffset =
        rowIndex -
        centerRow;

      const colOffset =
        colIndex -
        centerCol;

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
    // ==================================================
    case "spiral": {
      const centerRow =
        (rows - 1) / 2;

      const centerCol =
        (cols - 1) / 2;

      const rowOffset =
        rowIndex -
        centerRow;

      const colOffset =
        colIndex -
        centerCol;

      const angle =
        Math.atan2(
          rowOffset,
          colOffset
        );

      const distance =
        Math.sqrt(
          rowOffset *
            rowOffset +
          colOffset *
            colOffset
        );

      const maxRadius =
        Math.sqrt(
          centerRow *
            centerRow +
          centerCol *
            centerCol
        );

      const normalizedRadius =
        maxRadius > 0
          ? distance /
            maxRadius
          : 0;

      const spiralTurns =
        2;

      const phase =
        angle +
        normalizedRadius *
          Math.PI *
          2 *
          spiralTurns;

      const progress =
        (
          Math.sin(
            phase
          ) +
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
        ) %
          2 ===
        0;

      return isHigh
        ? highest
        : lowest;
    }


    // ==================================================
    // RANDOM
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
// CIRCLE HEIGHT PATTERNS
//
// Uses:
// ringIndex
// angle
// radialProgress
//
// radialProgress:
// center = 0
// outer ring = 1
// =====================================================
function calculateCircleHeight({
  rowIndex,
  colIndex,
  pattern,
  lowest,
  highest,
  ringIndex,
  angle,
  radialProgress,
}) {
  const range =
    highest - lowest;

  const radiusProgress =
    THREE.MathUtils.clamp(
      radialProgress ?? 0,
      0,
      1
    );

  const safeAngle =
    angle ?? 0;

  const safeRingIndex =
    ringIndex ?? 0;


  // Physical normalized position
  // within the circular layout.
  const normalizedX =
    Math.cos(
      safeAngle
    ) *
    radiusProgress;

  const normalizedZ =
    Math.sin(
      safeAngle
    ) *
    radiusProgress;


  switch (pattern) {

    // ==================================================
    // FLAT
    // Every pendant same height
    // ==================================================
    case "flat":
      return lowest;


    // ==================================================
    // DOME
    //
    // Center = highest
    // Outer ring = lowest
    // ==================================================
    case "dome": {
      return (
        highest -
        range *
          radiusProgress
      );
    }


    // ==================================================
    // REVERSE DOME
    //
    // Center = lowest
    // Outer ring = highest
    // ==================================================
    case "reverseDome": {
      return (
        lowest +
        range *
          radiusProgress
      );
    }


    // ==================================================
    // DIAGONAL
    //
    // Physical diagonal gradient across
    // the circular baseplate.
    // ==================================================
    case "diagonal": {
      const direction =
        (
          normalizedX +
          normalizedZ
        ) /
        Math.SQRT2;

      const progress =
        THREE.MathUtils.clamp(
          (
            direction +
            1
          ) / 2,
          0,
          1
        );

      return (
        lowest +
        range *
          progress
      );
    }


    // ==================================================
    // WAVE
    //
    // Wave moves across the actual
    // circular surface.
    // ==================================================
    case "wave": {
      const wave =
        (
          Math.sin(
            normalizedX *
              Math.PI
          ) +
          1
        ) / 2;

      return (
        lowest +
        range *
          wave
      );
    }


    // ==================================================
    // RIPPLE
    //
    // True concentric ripple.
    // All pendants on the same ring
    // share the same height.
    // ==================================================
    case "ripple": {
      const ripple =
        (
          Math.cos(
            radiusProgress *
              Math.PI *
              2
          ) +
          1
        ) / 2;

      return (
        lowest +
        range *
          ripple
      );
    }


    // ==================================================
    // SPIRAL
    //
    // Uses actual circular angle
    // plus distance from center.
    // ==================================================
    case "spiral": {
      const spiralTurns =
        2;

      const phase =
        safeAngle +
        radiusProgress *
          Math.PI *
          2 *
          spiralTurns;

      const progress =
        (
          Math.sin(
            phase
          ) +
          1
        ) / 2;

      return (
        lowest +
        range *
          progress
      );
    }


    // ==================================================
    // CHECKERBOARD
    //
    // For a circle, alternating rings
    // looks better than rectangular
    // checkerboard indexing.
    // ==================================================
    case "checkerboard": {
      const isHigh =
        safeRingIndex %
          2 ===
        0;

      return isHigh
        ? highest
        : lowest;
    }


    // ==================================================
    // RANDOM
    //
    // Deterministic:
    // same pendant keeps same height.
    // ==================================================
    case "random": {
      const seed =
        Math.sin(
          (rowIndex + 1) *
            12.9898 +
          (colIndex + 1) *
            78.233
        ) *
        43758.5453;

      const randomValue =
        seed -
        Math.floor(
          seed
        );

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
  // APPLY PENDANT ROTATION
  // =====================================================
  function applyPendantRotation({
    pendant,
    x,
    z,
    rowIndex,
    colIndex,
    rotationPattern = "default",
  }) {
    const baseQuaternion =
      pendantBaseQuaternionRef.current;

    if (
      !pendant ||
      !baseQuaternion
    ) {
      return;
    }

    // Always start with original GLB rotation
    pendant.quaternion.copy(
      baseQuaternion
    );

    switch (
      rotationPattern
    ) {
      // ---------------------------------
      // DEFAULT / RANDOM
      // ---------------------------------
      case "default":
      case "random": {
        const seed =
          Math.sin(
            (rowIndex + 1) *
              12.9898 +
            (colIndex + 1) *
              78.233
          ) *
          43758.5453;

        const randomValue =
          seed -
          Math.floor(
            seed
          );

        const angle =
          randomValue *
          Math.PI *
          2;

        const rotationQuaternion =
          new THREE.Quaternion()
            .setFromAxisAngle(
              new THREE.Vector3(
                0,
                1,
                0
              ),
              angle
            );

        pendant.quaternion
          .copy(
            rotationQuaternion
          )
          .multiply(
            baseQuaternion
          );

        return;
      }

      // ---------------------------------
      // RADIAL
      // ---------------------------------
      case "radial": {
        if (
          x === 0 &&
          z === 0
        ) {
          return;
        }

        const angle =
          Math.atan2(
            x,
            z
          );

        const rotationQuaternion =
          new THREE.Quaternion()
            .setFromAxisAngle(
              new THREE.Vector3(
                0,
                1,
                0
              ),
              angle
            );

        pendant.quaternion
          .copy(
            rotationQuaternion
          )
          .multiply(
            baseQuaternion
          );

        return;
      }

      // ---------------------------------
      // ORIGINAL
      // ---------------------------------
      case "original":
        return;

      default:
        return;
    }
  }

  // =====================================================
// AUTO-FRAME CAMERA
//
// Fits the complete lighting composition
// inside the viewport while preserving
// the current viewing direction.
// =====================================================
function fitCameraToComposition() {
  const camera =
    cameraRef.current;

  const controls =
    controlsRef.current;

  const baseplate =
    baseplateRef.current;

  if (
    !camera ||
    !controls ||
    !baseplate
  ) {
    return;
  }

  // =====================================================
  // CALCULATE COMPOSITION BOUNDS
  // =====================================================
  const box =
    new THREE.Box3();

  box.expandByObject(
    baseplate
  );

  pendantRefs.current.forEach(
    (pendant) => {
      pendant.updateMatrixWorld(
        true
      );

      box.expandByObject(
        pendant
      );
    }
  );

  if (box.isEmpty()) {
    return;
  }

  // =====================================================
  // FIND CENTER + BOUNDING SPHERE
  // =====================================================
  const center =
    new THREE.Vector3();

  box.getCenter(
    center
  );

  const sphere =
    new THREE.Sphere();

  box.getBoundingSphere(
    sphere
  );

  const radius =
    Math.max(
      sphere.radius,
      1
    );

  // =====================================================
  // CALCULATE REQUIRED CAMERA DISTANCE
  // =====================================================
  const verticalFov =
    THREE.MathUtils.degToRad(
      camera.fov
    );

  const horizontalFov =
    2 *
    Math.atan(
      Math.tan(
        verticalFov / 2
      ) *
        camera.aspect
    );

  // Use the smaller FOV so the object
  // fits both vertically and horizontally.
  const limitingFov =
    Math.min(
      verticalFov,
      horizontalFov
    );

  const padding =
    1.25;

  const distance =
    (
      radius /
      Math.sin(
        limitingFov / 2
      )
    ) *
    padding;

  // =====================================================
  // PRESERVE CURRENT VIEWING ANGLE
  // =====================================================
  const direction =
    new THREE.Vector3()
      .subVectors(
        camera.position,
        controls.target
      );

  if (
    direction.lengthSq() <
    0.0001
  ) {
    direction.set(
      1,
      0.7,
      1
    );
  }

  direction.normalize();

// =====================================================
// CREATE SMOOTH CAMERA TRANSITION
// =====================================================
const targetPosition =
  center
    .clone()
    .add(
      direction.multiplyScalar(
        distance
      )
    );

const transition =
  cameraTransitionRef.current;

// Current camera state
transition.startPosition.copy(
  camera.position
);

transition.startTarget.copy(
  controls.target
);

// Destination
transition.endPosition.copy(
  targetPosition
);

transition.endTarget.copy(
  center
);

transition.startTime =
  performance.now();

transition.active =
  true;

  // =====================================================
  // UPDATE CAMERA CLIPPING
  // =====================================================
  camera.near =
    Math.max(
      distance / 100,
      0.1
    );

  camera.far =
    Math.max(
      distance * 10,
      5000
    );

  camera.updateProjectionMatrix();
}

  // =====================================================
  // SYNC PENDANT GRID
  // Object pooling + circle clipping
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

      rotationPattern =
        "default",

      surfaceWidth,
      surfaceLength,
      baseOffset,
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

// =====================================================
// BUILD PENDANT POSITIONS
//
// Rectangle:
//   Normal rows × columns grid
//
// Circle:
//   Center + concentric circular rings
// =====================================================
const positions = [];




// =====================================================
// RECTANGLE POSITIONING
// =====================================================
if (
  workingModel.surfaceShape !==
  "circle"
) {
  for (
    let rowIndex = 0;
    rowIndex < safeRows;
    rowIndex++
  ) {
    for (
      let colIndex = 0;
      colIndex < safeCols;
      colIndex++
    ) {
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

      positions.push({
        rowIndex,
        colIndex,
        x,
        z,

        ringIndex: null,
        angle: null,
        radialProgress: null,
      });
    }
  }
}


// =====================================================
// CIRCLE POSITIONING
// =====================================================
else {
  const totalPendants =
    safeRows * safeCols;

  if (totalPendants > 0) {

    // ---------------------------------
    // Calculate baseplate diameter
    // ---------------------------------
    const autoLength =
      (safeRows - 1) *
        spacingL +
      baseOffset;

    const autoWidth =
      (safeCols - 1) *
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

    const circleDiameter =
      Math.min(
        resolvedWidth,
        resolvedLength
      );

    const circleRadius =
      circleDiameter / 2;

    // Keep pendant centers slightly
    // away from the edge of the plate.
    const edgePadding =
      Math.max(
        baseOffset / 2,
        0
      );

    const usableRadius =
      Math.max(
        circleRadius -
          edgePadding,
        0
      );


    // ---------------------------------
    // CENTER PENDANT
    // ---------------------------------
    positions.push({
      rowIndex: 0,
      colIndex: 0,

      x: 0,
      z: 0,

      ringIndex: 0,
      angle: 0,
      radialProgress: 0,
    });


    let remaining =
      totalPendants - 1;

    // ---------------------------------
    // Determine how many rings
    // are required.
    //
    // Ring capacities:
    //
    // ring 1 = 6
    // ring 2 = 12
    // ring 3 = 18
    // ring 4 = 24
    // ...
    // ---------------------------------
    let ringCount = 0;
    let testRemaining =
      remaining;

    while (
      testRemaining > 0
    ) {
      ringCount++;

      const capacity =
        ringCount * 6;

      testRemaining -=
        capacity;
    }


    const ringSpacing =
      ringCount > 0
        ? usableRadius /
          ringCount
        : 0;


    // ---------------------------------
    // BUILD EACH RING
    // ---------------------------------
    let linearIndex = 1;

    for (
      let ringIndex = 1;
      ringIndex <= ringCount;
      ringIndex++
    ) {
      if (remaining <= 0) {
        break;
      }

      const ringCapacity =
        ringIndex * 6;

      const pendantCount =
        Math.min(
          ringCapacity,
          remaining
        );

      const radius =
        ringSpacing *
        ringIndex;

      // Slightly rotate alternating rings.
      // This avoids everything lining up
      // like spokes.
      const angleOffset =
        ringIndex % 2 === 0
          ? Math.PI /
            pendantCount
          : 0;

      for (
        let itemIndex = 0;
        itemIndex <
        pendantCount;
        itemIndex++
      ) {
        const angle =
          (
            itemIndex /
            pendantCount
          ) *
            Math.PI *
            2 +
          angleOffset;

        const x =
          Math.cos(angle) *
          radius;

        const z =
          Math.sin(angle) *
          radius;

        // Keep compatible row/column
        // indexes for your existing
        // height-pattern engine.
        const rowIndex =
          Math.floor(
            linearIndex /
            safeCols
          );

        const colIndex =
          linearIndex %
          safeCols;

        positions.push({
          rowIndex,
          colIndex,

          x,
          z,

          // Save radial information
          // for future circle-specific
          // height patterns.
          ringIndex,
          angle,

          radialProgress:
            ringCount > 0
              ? ringIndex /
                ringCount
              : 0,
        });

        linearIndex++;
      }

      remaining -=
        pendantCount;
    }
  }
}

    const requiredCount =
      positions.length;

    // =====================================================
    // ADD ONLY MISSING OBJECTS
    // =====================================================
    while (
      pendantRefs.current
        .length <
      requiredCount
    ) {
      const pendant =
        template.clone(
          true
        );

      scene.add(
        pendant
      );

      pendantRefs.current.push(
        pendant
      );

      const cable =
        new THREE.Mesh(
          cableGeometryRef.current,
          cableMaterialRef.current
        );

      scene.add(
        cable
      );

      cableRefs.current.push(
        cable
      );
    }

    // =====================================================
    // REMOVE ONLY EXTRA OBJECTS
    // =====================================================
    while (
      pendantRefs.current
        .length >
      requiredCount
    ) {
      const pendant =
        pendantRefs.current.pop();

      if (pendant) {
        scene.remove(
          pendant
        );
      }

      const cable =
        cableRefs.current.pop();

      if (cable) {
        scene.remove(
          cable
        );
      }
    }

    // =====================================================
    // POSITION ACTIVE PENDANTS
    // =====================================================
    for (
      let index = 0;
      index <
      requiredCount;
      index++
    ) {
 const {
  rowIndex,
  colIndex,
  x,
  z,
  ringIndex,
  angle,
  radialProgress,
} =
  positions[index];

const y =
  calculatePendantHeight({
    rowIndex,
    colIndex,

    rows:
      safeRows,

    cols:
      safeCols,

    pattern,
    lowest,
    highest,

    surfaceShape:
      workingModel.surfaceShape,

    ringIndex,
    angle,
    radialProgress,
  });

      const pendant =
        pendantRefs.current[
          index
        ];

      pendant.position.set(
        x,
        y,
        z
      );

      applyPendantRotation({
        pendant,
        x,
        z,
        rowIndex,
        colIndex,
        rotationPattern,
      });
    }

    // Update cables after all transforms
    updateAllCables();
  }

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full"
    />
  );
}