import { useNavigate } from "react-router";

import { Menu, ArrowLeft, UserRound } from "lucide-react";

import logo from "../assets/logo icon.png"

import { useState } from "react";
export default function Sidebar() {
  const navigation = useNavigate();
  const [isCollapse, setIsCollapse] = useState(false);

  function collapseHandle() {
    setIsCollapse((prev) => !prev);
  }

  return (
    <aside
      className={`fixed min-h-dvh flex flex-col shrink-0 overflow-hidden border-r border-gray-300
                  ${isCollapse ? "w-64" : "w-18"}
                transition-all duration-300`}
    >

      {/* <div className={`h-12 flex items-center bg-amber-200 w-full ${isCollapse ? "justify-end" : "justify-center"}`}>
        <Menu
          className={`h-5 w-5 ${isCollapse ? "hidden" : "flex"}`}
          onClick={collapseHandle}
        />

        <ArrowLeft
          className={`m-4 h-5 w-5 ${isCollapse ? "flex" : "hidden"}`}
          onClick={collapseHandle}
        />
        {console.log(isCollapse)}
      </div> */}

      <div className={`h-24 flex items-center w-full justify-center items-center`}>
        <img src={logo} alt="ilaw" className="w-6.5"
              onClick={()=>{navigation("/")}}
        />
      </div>

      <div className="flex-1 w-full flex justify-center items-center">
        {/* code sa gitna here***************** */}
      </div>
      <div className="h-12 w-full flex justify-center items-center">
        <UserRound strokeWidth={1}/>
      </div>
    </aside>
  );
}
