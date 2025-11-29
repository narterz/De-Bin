"use client";

import { GoFileBinary } from "react-icons/go";
import { saveAs } from 'file-saver';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { helpBtnContent, toolsBtnContent, sampleBtnContent } from "../constants/navigationContent";

export default function Header() {
  const menuContent = [
    { name: "Help", content: helpBtnContent },
    { name: "Tools", content: toolsBtnContent },
    { name: "Download Samples", content: sampleBtnContent }
  ]

  const handleDownload = async  (file: string) => {
    const fileName = `file_example_${file}.${file.toLowerCase()}`;
    console.debug("Downloading file: ", fileName);
    const url = `/sample/${fileName}`
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file")
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch (err) {
      console.error(`Failed to download sample ${fileName}:`, err);
      // Open failure dialog here
    }
  }

  return (
    <div className="w-full h-full flex flex-row items-center justify-around">
      <div className="flex flex-col h-full w-1/4 justify-center items-center p-4">
        <GoFileBinary className="text-6xl" />
        <h1 className="text-xl font-semibold">De-Bin</h1>
      </div>

      <div className="flex flex-col h-full relative w-1/3 justify-center items-center p-4">
        <NavigationMenu className="w-full">
          <NavigationMenuList className="flex gap-4">
            {menuContent.map(btn => (
              <NavigationMenuItem key={btn.name}>
                <NavigationMenuTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                  {btn.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="min-w-[24rem] p-4 bg-white shadow-lg rounded-md border border-gray-200">
                  <ul className="grid gap-4">
                    {btn.content.map(row => (
                      <NavigationMenuList className="p-3 flex flex-col items-center space-evenly" key={row.title}>
                        <div className="flex flex-col justify-around h-1/3 w-full transition-opacity hover:opacity-50 cursor-pointer" onClick={() => row.file && handleDownload(row.file)}>
                          <h3 className="font-bold text-accent">{row.title}</h3>
                          <p className="font-light">{row.description}</p>
                        </div>
                      </NavigationMenuList>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}