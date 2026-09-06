import { useContext } from "react";
import { ConfiguratorContext } from "../context/ConfiguratorContext";

export default function CompositionPanel() {
  const {
    workingModel,
    compositionConfig,
    setCompositionConfig,
  } = useContext(ConfiguratorContext);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "pattern") {
      setCompositionConfig((prev) => ({
        ...prev,
        [name]: value,
      }));

      return;
    }

    const numberValue = Number(value);

    setCompositionConfig((prev) => ({
      ...prev,
      [name]: numberValue,
    }));
  }

  const controls = [
    {
      label: "Base Plate Width",
      name: "surfaceWidth",
      min: 0,
      max: 999,
    },
    {
      label: "Base Plate Length",
      name: "surfaceLength",
      min: 0,
      max: 999,
    },
    {
      label: "Rows",
      name: "rows",
      min: 1,
      max: 20,
    },
    {
      label: "Columns",
      name: "cols",
      min: 1,
      max: 20,
    },
    {
      label: "Base Plate Offset",
      name: "baseOffset",
      min: 0,
      max: 30,
    },
    {
      label: "Spacing Y",
      name: "spacingL",
      min: 0,
      max: 100,
    },
    {
      label: "Spacing X",
      name: "spacingW",
      min: 0,
      max: 100,
    },
    {
      label: "Base Plate From Floor",
      name: "surfaceHeight",
      min: 0,
      max: 999,
    },
    {
      label: "Lowest From Ground",
      name: "lowest",
      min: 0,
      max: compositionConfig.surfaceHeight,
    },
    {
      label: "Highest From Ground",
      name: "highest",
      min: 0,
      max: compositionConfig.surfaceHeight,
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Pattern */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Pattern
        </label>

        <select
          name="pattern"
          value={compositionConfig.pattern}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          {[
            "flat",
            "dome",
            "reverseDome",
            "wave",
            "ripple",
            "spiral",
            "diagonal",
            "checkerboard",
            "random",
          ].map((pattern) => (
            <option
              key={pattern}
              value={pattern}
            >
              {pattern}
            </option>
          ))}
        </select>
      </div>

      {/* Composition controls */}
      {controls.map(({ label, name, min, max }) => {
        const hideBaseOffset =
          name === "baseOffset" &&
          (compositionConfig.surfaceLength > 0 ||
            compositionConfig.surfaceWidth > 0) &&
          workingModel.surfaceShape !== "circle";

        if (hideBaseOffset) {
          return null;
        }

        return (
          <div key={name}>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                {label}
              </label>

              <input
                type="number"
                name={name}
                min={min}
                max={max}
                value={compositionConfig[name]}
                onChange={handleChange}
                className="w-20 border border-gray-300 rounded-md px-2 py-1"
              />
            </div>

            <input
              type="range"
              name={name}
              min={min}
              max={max}
              value={compositionConfig[name]}
              onChange={handleChange}
              className="w-full"
            />
          </div>
        );
      })}
    </div>
  );
}