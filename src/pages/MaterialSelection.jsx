import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useContext } from "react";

import { ConfiguratorContext } from "../context/ConfiguratorContext";
import modelList from "../assets/data";

export default function MaterialSelection() {
  const navigate = useNavigate();

  const { workingModel, setWorkingModel } =
    useContext(ConfiguratorContext);

  function selectSpecification(specName, value) {
    setWorkingModel((prev) => ({
      ...prev,
      [specName]: value,
    }));
  }

  const selectedModel = modelList.find(
    (item) => item.id === workingModel.id
  );

  return (
    <div className="w-full min-h-full px-6">
      <div className="h-24 flex items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">
          Material / Finish
        </h1>

        <p className="mb-10">
          {selectedModel?.name}
        </p>

        {Object.entries(
          selectedModel?.specification ?? {}
        ).map(([specName, specValues]) => (
          <div key={specName} className="mb-8">

            <h2 className="text-xl font-bold mb-3">
              {specName}
            </h2>

            <div className="flex gap-3 flex-wrap">
              {specValues.map((value) => (
                <button
                  key={value}
                  onClick={() =>
                    selectSpecification(specName, value)
                  }
                  className={`
                    border rounded-xl px-4 py-2
                    transition-all duration-200
                    ${
                      workingModel[specName] === value
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-400 hover:bg-gray-100"
                    }
                  `}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}