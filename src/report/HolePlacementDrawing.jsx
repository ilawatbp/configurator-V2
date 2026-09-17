function formatMeasurement(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return Number.isInteger(number)
        ? String(number)
        : number.toFixed(2);
}


export default function HolePlacementDrawing({
    reportData,
    unit = "cm",
}) {
    const baseplate =
        reportData?.baseplate;

    const pendants =
        reportData?.pendants ?? [];

    const shape =
        baseplate?.shape === "circle"
            ? "circle"
            : "rectangle";

    const width = Number(
        baseplate?.dimensions?.width
    );

    const length = Number(
        baseplate?.dimensions?.length
    );

    if (
        !Number.isFinite(width) ||
        !Number.isFinite(length) ||
        width <= 0 ||
        length <= 0
    ) {
        return (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800">
                Enter valid baseplate dimensions to generate the hole-placement drawing.
            </div>
        );
    }

    const holes = pendants
        .map((pendant, index) => {
            const rawStringLength =
                pendant.cable?.length;

            const stringLength =
                rawStringLength === null ||
                    rawStringLength === undefined ||
                    rawStringLength === ""
                    ? null
                    : Number(
                        rawStringLength
                    );

            return {
                id:
                    pendant.id ??
                    `pendant-${index + 1}`,

                number:
                    index + 1,

                x: Number(
                    pendant.mountingHole?.x
                ),

                z: Number(
                    pendant.mountingHole?.z
                ),

                stringLength:
                    Number.isFinite(
                        stringLength
                    )
                        ? stringLength
                        : null,
            };
        })
        .filter(
            (hole) =>
                Number.isFinite(hole.x) &&
                Number.isFinite(hole.z)
        );

    const maximumDimension =
        Math.max(width, length);

    const padding =
        Math.max(
            maximumDimension * 0.18,
            15
        );

    const minX =
        -width / 2 - padding;

    const minY =
        -length / 2 - padding;

    const viewBoxWidth =
        width + padding * 2;

    const viewBoxHeight =
        length + padding * 2;

    const holeRadius =
        Math.max(
            maximumDimension * 0.008,
            1.2
        );

    const labelSize =
        Math.max(
            maximumDimension * 0.018,
            3
        );

    const dimensionOffset =
        padding * 0.45;

    return (
        <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">
                    Baseplate / Hole Placement Plan
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Origin is at the center of the baseplate.
                    X is horizontal and Z is vertical.
                </p>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-300 bg-white p-4">
                <svg
                    viewBox={`${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`}
                    className="mx-auto block h-auto w-full max-w-4xl"
                    role="img"
                    aria-label="Top-view baseplate hole-placement drawing"
                >
                    {/* Baseplate outline */}
                    {shape === "circle" ? (
                        <circle
                            cx="0"
                            cy="0"
                            r={width / 2}
                            fill="#f8fafc"
                            stroke="#111827"
                            strokeWidth="1.2"
                            vectorEffect="non-scaling-stroke"
                        />
                    ) : (
                        <rect
                            x={-width / 2}
                            y={-length / 2}
                            width={width}
                            height={length}
                            fill="#f8fafc"
                            stroke="#111827"
                            strokeWidth="1.2"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {/* Center lines */}
                    <line
                        x1={-width / 2}
                        y1="0"
                        x2={width / 2}
                        y2="0"
                        stroke="#94a3b8"
                        strokeWidth="0.8"
                        strokeDasharray="5 4"
                        vectorEffect="non-scaling-stroke"
                    />

                    <line
                        x1="0"
                        y1={-length / 2}
                        x2="0"
                        y2={length / 2}
                        stroke="#94a3b8"
                        strokeWidth="0.8"
                        strokeDasharray="5 4"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Center point */}
                    <circle
                        cx="0"
                        cy="0"
                        r={holeRadius * 0.45}
                        fill="#ef4444"
                    />

                    {/* Mounting holes */}
                    {holes.map((hole) => {
                        // SVG Y increases downward,
                        // so invert the Three.js Z axis.
                        const drawingY =
                            -hole.z;

                        return (
                            <g key={hole.id}>
                                <circle
                                    cx={hole.x}
                                    cy={drawingY}
                                    r={holeRadius}
                                    fill="#ffffff"
                                    stroke="#2563eb"
                                    strokeWidth="1.2"
                                    vectorEffect="non-scaling-stroke"
                                />

                                <text
                                    x={
                                        hole.x +
                                        holeRadius * 1.5
                                    }
                                    y={
                                        drawingY -
                                        holeRadius * 1.5
                                    }
                                    fontSize={labelSize}
                                    fill="#1e3a8a"
                                >
                                    H{hole.number}
                                </text>
                            </g>
                        );
                    })}

                    {/* Width dimension */}
                    <line
                        x1={-width / 2}
                        y1={
                            length / 2 +
                            dimensionOffset
                        }
                        x2={width / 2}
                        y2={
                            length / 2 +
                            dimensionOffset
                        }
                        stroke="#111827"
                        strokeWidth="0.8"
                        vectorEffect="non-scaling-stroke"
                    />

                    <line
                        x1={-width / 2}
                        y1={length / 2}
                        x2={-width / 2}
                        y2={
                            length / 2 +
                            dimensionOffset * 1.25
                        }
                        stroke="#111827"
                        strokeWidth="0.8"
                        vectorEffect="non-scaling-stroke"
                    />

                    <line
                        x1={width / 2}
                        y1={length / 2}
                        x2={width / 2}
                        y2={
                            length / 2 +
                            dimensionOffset * 1.25
                        }
                        stroke="#111827"
                        strokeWidth="0.8"
                        vectorEffect="non-scaling-stroke"
                    />

                    <text
                        x="0"
                        y={
                            length / 2 +
                            dimensionOffset -
                            2
                        }
                        textAnchor="middle"
                        fontSize={labelSize}
                        fill="#111827"
                    >
                        {formatMeasurement(width)} {unit}
                    </text>

                    {/* Length dimension */}
                    <line
                        x1={
                            width / 2 +
                            dimensionOffset
                        }
                        y1={-length / 2}
                        x2={
                            width / 2 +
                            dimensionOffset
                        }
                        y2={length / 2}
                        stroke="#111827"
                        strokeWidth="0.8"
                        vectorEffect="non-scaling-stroke"
                    />

                    <line
                        x1={width / 2}
                        y1={-length / 2}
                        x2={
                            width / 2 +
                            dimensionOffset * 1.25
                        }
                        y2={-length / 2}
                        stroke="#111827"
                        strokeWidth="0.8"
                        vectorEffect="non-scaling-stroke"
                    />

                    <line
                        x1={width / 2}
                        y1={length / 2}
                        x2={
                            width / 2 +
                            dimensionOffset * 1.25
                        }
                        y2={length / 2}
                        stroke="#111827"
                        strokeWidth="0.8"
                        vectorEffect="non-scaling-stroke"
                    />

                    <text
                        x={
                            width / 2 +
                            dimensionOffset -
                            2
                        }
                        y="0"
                        textAnchor="middle"
                        fontSize={labelSize}
                        fill="#111827"
                        transform={`rotate(90 ${width / 2 +
                            dimensionOffset -
                            2
                            } 0)`}
                    >
                        {formatMeasurement(length)} {unit}
                    </text>
                </svg>
            </div>

            <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="border border-gray-300 px-3 py-2">
                                Hole
                            </th>

                            <th className="border border-gray-300 px-3 py-2">
                                X from center
                            </th>

                            <th className="border border-gray-300 px-3 py-2">
                                Z from center
                            </th>
                            <th className="border border-gray-300 px-3 py-2">
                                String Length
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {holes.map((hole) => (
                            <tr key={hole.id}>
                                <td className="border border-gray-300 px-3 py-2">
                                    H{hole.number}
                                </td>

                                <td className="border border-gray-300 px-3 py-2">
                                    {formatMeasurement(hole.x)} {unit}
                                </td>

                                <td className="border border-gray-300 px-3 py-2">
                                    {formatMeasurement(hole.z)} {unit}
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                    {hole.stringLength !== null
                                        ? `${formatMeasurement(
                                            hole.stringLength
                                        )} ${unit}`
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}