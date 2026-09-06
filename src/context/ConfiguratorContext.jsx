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

  return (
    <ConfiguratorContext.Provider
      value={{
        workingModel,
        setWorkingModel,
      }}
    >
      {children}
    </ConfiguratorContext.Provider>
  );
}