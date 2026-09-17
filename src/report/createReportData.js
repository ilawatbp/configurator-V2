export function createPendantReportData({
  id = null,
  modelId = null,
  modelName = null,
  color = null,
} = {}) {
  return {
    id,

    product: {
      modelId,
      modelName,
      color,
    },

    specifications: {
      width: null,
      depth: null,
      height: null,
      weight: null,
      wattage: null,
      voltage: null,
      material: null,
    },

    position: {
      x: null,
      y: null,
      z: null,
    },

    cable: {
      length: null,
    },

    mountingHole: {
      x: null,
      z: null,
    },
  };
}

export function createReportData() {
  return {
    report: {
      version: 1,
      generatedAt: null,
    },

    project: {
      projectName: "",
      clientName: "",
      location: "",
      preparedBy: "",
    },

    baseplate: {
      shape: null,

      dimensions: {
        width: null,
        length: null,
        diameter: null,
        thickness: null,
      },

      heightFromFloor: null,
    },

    pendants: [],

    scene: {
      snapshot: null,
    },
  };
}