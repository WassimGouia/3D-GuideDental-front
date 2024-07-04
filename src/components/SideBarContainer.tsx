import React from "react";
import SideBar from "@/components/SideBar";
type Props = {
  children: React.ReactNode;
};

const SideBarContainer = ({ children }: Props) => {
  return (
    <div className="flex ">
      <div className=" top-0 left-0 m-0 flex flex-col h-screen w-1/6">
        <SideBar />
      </div>

      <div className="wml-64 overflow-auto h-screen w-5/6">{children}</div>
    </div>
  );
};

export default SideBarContainer;
