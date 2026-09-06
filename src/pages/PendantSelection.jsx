import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router";

import Cards from "../components/Cards";

import modelList from "../assets/data";

import { useContext } from "react";
import { ConfiguratorContext } from "../context/ConfiguratorContext";

export default function PendantSelection() {
  const navigate = useNavigate();
  const { setWorkingModel } = useContext(ConfiguratorContext);

  function selectHandle(id) {
    navigate("/matselect");
    setWorkingModel(prev => ({
      ...prev, id: id
    }))
  }

  return (
    <div className=" w-full min-h-full px-6">
      <div className="h-24 flex items-center">
        <button
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft />
        </button>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modelList.map((item) => {
          return (
            <Cards item={item} selectHandle={selectHandle} key={item.id} />
          );
        })}
      </div>
    </div>
  );
}
