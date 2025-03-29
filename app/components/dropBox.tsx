import { FaFileArrowUp } from "react-icons/fa6";
import { IoIosImages } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Files } from "lucide-react";

export default function DropBox() {
  return (
    <div className="w-4/6 h-3/4 flex flex-col items-center justify-evenly border-dashed border-4 border-black bg-accent">
      <div className="dropbox-rows">
        <IoIosImages size={80} className="text-background" />
        <h3>Drag, drop, or select your files here</h3>
      </div>
      <div className="dropbox-rows">
        <Button>
          <Files className="text-accent cursor-pointer" /> Choose Files
        </Button>
        <small>See help to view all acceptable files.</small>
      </div>
    </div>
  );
}
