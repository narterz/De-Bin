import { GoFileBinary } from "react-icons/go";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ListItemContent, ListItem } from "./headerItem";

const helpMenuContent: ListItemContent[] = [
  {
    title: "Select your file(s)",
    description:
      "Drag your file into the large blue box or click the choose file button to select files.",
  },
  {
    title: "Limitations",
    description:
      "You can upload up to three compressed files at once, each no larger than 3MB.",
  },
  {
    title: "Download your files",
    description:
      "After uploading, press 'de-bin' to download the converted files.",
  },
];

const toolsMenuContent: ListItemContent[] = [
  {
    title: "Excel Decompression",
    description: "Converts XLSB files to XLSX format.",
  },
  {
    title: "Zip Decompression",
    description: "Decompress a standard ZIP archive.",
  },
  {
    title: "Gzip Decompression",
    description: "Decompress single .gz files.",
  },
];

export default function Header() {
  return (
    <div className="w-full h-full flex flex-row items-center justify-around">
      <div className="flex flex-col h-full w-1/4 justify-center items-center p-4">
        <GoFileBinary className="text-6xl" />
        <h1 className="text-xl font-semibold">De-Bin</h1>
      </div>

      <div className="flex flex-col h-full relative w-1/3 justify-center items-center p-4">
        <NavigationMenu className="w-full">
          <NavigationMenuList className="flex gap-4">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                Help
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-[24rem] p-4 bg-white shadow-lg rounded-md border border-gray-200">
                <ul className="grid gap-4">
                  {helpMenuContent.map((item, i) => (
                    <ListItem
                      title={item.title}
                      description={item.description}
                      key={i}
                    />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                Tools
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-[24rem] p-4 bg-white shadow-lg rounded-md border border-gray-200">
                <ul className="grid gap-4">
                  {toolsMenuContent.map((item, i) => (
                    <ListItem
                      title={item.title}
                      description={item.description}
                      key={i}
                    />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}