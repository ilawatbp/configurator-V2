import { createContext, useState } from "react";

export const ConfiguratorContext = createContext();

export function ConfiguratorProvider({ children }) {
  const [workingModel, setWorkingModel] = useState({
    id: "",
    color: "",
    fitting: "",
    model: "",
    modelName: "",
    size: "",
    surfaceShape: "",
  });

  const [compositionConfig, setCompositionConfig] = useState({
    rows: 9,
    cols: 5,
    pattern: "wave",

    spacingL: 20,
    spacingW: 20,

    surfaceHeight: 170,
    surfaceLength: 0,
    surfaceWidth: 0,

    baseOffset: 10,

    lowest: 0,
    highest: 150,

    clipToShape: true,
    circleSegments: 96,
  });

  return (
    <ConfiguratorContext.Provider
      value={{
        workingModel,
        setWorkingModel,

        compositionConfig,
        setCompositionConfig,
      }}
    >
      {children}
    </ConfiguratorContext.Provider>
  );
}