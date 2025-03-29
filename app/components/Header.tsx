import { GoFileBinary } from "react-icons/go";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function Header() {
  return (
    <div className="w-full h-full flex flex-row items-center justify-around ">
      <div className="flex flex-col h-full w-1/4 justify-center items-center p-4">
        <GoFileBinary className="text-6xl" />
        <h1>De-Bin</h1>
      </div>
      <div className="h-full flex items-center justify-around w-1/4 p-4">
        <div className="header-item hover-text">
          <h3>Help</h3>
          <MdKeyboardArrowDown size={20}/>
        </div>
        <div className="header-item hover-text">
          <h3>Tools</h3>
          <MdKeyboardArrowDown size={20}/>
        </div>
      </div>
    </div>
  );
}