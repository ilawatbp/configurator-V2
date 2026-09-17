import modelList from "../assets/data";

import {
  calculateMountingLayout,
} from "../utils/calculateMountingLayout";

import {
  createReportData,
  createPendantReportData,
} from "./createReportData";


function numberOrNull(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}


function findSelectedModel(
  workingModel
) {
  if (!workingModel?.id) {
    return null;
  }

  return (
    modelList.find(
      (item) =>
        item.id ===
        workingModel.id
    ) ?? null
  );
}


export function buildReportData({
  workingModel = {},
  compositionConfig = {},
  computedComposition = {},
  project = {},
} = {}) {
  const reportData =
    createReportData();

  const selectedModel =
    findSelectedModel(
      workingModel
    );


  // =====================================================
  // SHARED MOUNTING LAYOUT
  // =====================================================

  const mountingLayout =
    calculateMountingLayout({
      surfaceShape:
        workingModel.surfaceShape,

      rows:
        compositionConfig.rows,

      cols:
        compositionConfig.cols,

      spacingL:
        compositionConfig.spacingL,

      spacingW:
        compositionConfig.spacingW,

      surfaceWidth:
        compositionConfig.surfaceWidth,

      surfaceLength:
        compositionConfig.surfaceLength,

      baseOffset:
        compositionConfig.baseOffset,
    });


  // =====================================================
  // REPORT
  // =====================================================

  reportData.report.generatedAt =
    new Date().toISOString();


  // =====================================================
  // PROJECT
  // =====================================================

  reportData.project = {
    ...reportData.project,
    ...project,
  };


  // =====================================================
  // BASEPLATE
  // =====================================================

  reportData.baseplate.shape =
    mountingLayout.baseplate.shape;

  reportData.baseplate
    .dimensions.width =
    mountingLayout.baseplate.width;

  reportData.baseplate
    .dimensions.length =
    mountingLayout.baseplate.length;

  reportData.baseplate
    .dimensions.diameter =
    mountingLayout.baseplate.diameter;

  reportData.baseplate
    .heightFromFloor =
    numberOrNull(
      compositionConfig.surfaceHeight
    );


  // =====================================================
  // INDEX ACTUAL CALCULATED PENDANTS
  // =====================================================

  const computedPendantsById =
    new Map(
      (
        computedComposition.pendants ??
        []
      ).map((pendant) => [
        pendant.id,
        pendant,
      ])
    );


  // =====================================================
  // PENDANTS, HOLES, POSITIONS, AND STRING LENGTHS
  // =====================================================

  if (workingModel.id) {
    reportData.pendants =
      mountingLayout.holes.map(
        (hole) => {
          const pendantId =
            `pendant-${hole.number}`;

          const computedPendant =
            computedPendantsById.get(
              pendantId
            );

          const pendant =
            createPendantReportData({
              id:
                pendantId,

              modelId:
                workingModel.id ||
                selectedModel?.id ||
                null,

              modelName:
                workingModel
                  .modelName ||
                selectedModel?.name ||
                null,

              color:
                workingModel.color ||
                null,

              fitting:
                workingModel.fitting ||
                null,

              size:
                workingModel.size ||
                null,
            });


          // ===============================================
          // ACTUAL 3D POSITION
          // ===============================================

          pendant.position.x =
            numberOrNull(
              computedPendant
                ?.position?.x
            ) ??
            hole.x;

          pendant.position.y =
            numberOrNull(
              computedPendant
                ?.position?.y
            );

          pendant.position.z =
            numberOrNull(
              computedPendant
                ?.position?.z
            ) ??
            hole.z;


          // ===============================================
          // ACTUAL BASEPLATE HOLE POSITION
          // ===============================================

          pendant.mountingHole.x =
            numberOrNull(
              computedPendant
                ?.mountingHole?.x
            ) ??
            hole.x;

          pendant.mountingHole.z =
            numberOrNull(
              computedPendant
                ?.mountingHole?.z
            ) ??
            hole.z;


          // ===============================================
          // ACTUAL STRING LENGTH
          // ===============================================

          pendant.cable.length =
            numberOrNull(
              computedPendant
                ?.cable?.length
            );


          return pendant;
        }
      );
  }


  // =====================================================
  // RETURN CLEAN REPORT OBJECT
  // =====================================================

  return reportData;
}