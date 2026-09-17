export function calculateMountingLayout({
  surfaceShape = "rectangle",

  rows = 0,
  cols = 0,

  spacingL = 0,
  spacingW = 0,

  surfaceWidth = 0,
  surfaceLength = 0,

  baseOffset = 0,
} = {}) {
  const safeRows = Math.max(
    0,
    Math.floor(Number(rows) || 0)
  );

  const safeCols = Math.max(
    0,
    Math.floor(Number(cols) || 0)
  );

  const resolvedSpacingL =
    Number(spacingL) || 0;

  const resolvedSpacingW =
    Number(spacingW) || 0;

  const resolvedBaseOffset =
    Number(baseOffset) || 0;

  const autoLength =
    (safeRows - 1) *
      resolvedSpacingL +
    resolvedBaseOffset;

  const autoWidth =
    (safeCols - 1) *
      resolvedSpacingW +
    resolvedBaseOffset;

  const resolvedLength =
    Number(surfaceLength) > 0
      ? Number(surfaceLength)
      : autoLength;

  const resolvedWidth =
    Number(surfaceWidth) > 0
      ? Number(surfaceWidth)
      : autoWidth;

  const positions = [];

  // =====================================================
  // RECTANGLE
  // =====================================================

  if (surfaceShape !== "circle") {
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
          ) * resolvedSpacingW;

        const z =
          (
            rowIndex -
            (safeRows - 1) / 2
          ) * resolvedSpacingL;

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
  // CIRCLE
  // =====================================================

  else {
    const totalPendants =
      safeRows * safeCols;

    const diameter = Math.min(
      resolvedWidth,
      resolvedLength
    );

    const circleRadius =
      diameter / 2;

    const edgePadding = Math.max(
      resolvedBaseOffset / 2,
      0
    );

    const usableRadius = Math.max(
      circleRadius - edgePadding,
      0
    );

    if (totalPendants > 0) {
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

      let ringCount = 0;
      let testRemaining = remaining;

      while (testRemaining > 0) {
        ringCount++;

        testRemaining -=
          ringCount * 6;
      }

      const ringSpacing =
        ringCount > 0
          ? usableRadius / ringCount
          : 0;

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
          ringSpacing * ringIndex;

        const angleOffset =
          ringIndex % 2 === 0
            ? Math.PI / pendantCount
            : 0;

        for (
          let itemIndex = 0;
          itemIndex < pendantCount;
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

  const holes = positions.map(
    (position, index) => ({
      id: `hole-${index + 1}`,
      number: index + 1,
      ...position,
    })
  );

  return {
    baseplate: {
      shape:
        surfaceShape === "circle"
          ? "circle"
          : "rectangle",

      width:
        surfaceShape === "circle"
          ? Math.min(
              resolvedWidth,
              resolvedLength
            )
          : resolvedWidth,

      length:
        surfaceShape === "circle"
          ? Math.min(
              resolvedWidth,
              resolvedLength
            )
          : resolvedLength,

      diameter:
        surfaceShape === "circle"
          ? Math.min(
              resolvedWidth,
              resolvedLength
            )
          : null,
    },

    holes,
  };
}