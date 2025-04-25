import { GoFileBinary } from "react-icons/go";
import { MdKeyboardArrowDown } from "react-icons/md";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuList, 
  NavigationMenuItem,   
  NavigationMenuTrigger, 
  navigationMenuTriggerStyle 
} from "@/components/ui/navigation-menu";

interface NavigationMenuItems {
  title: string;
  description: string;
  isSelected?: boolean;
}

const helpMenuContent: NavigationMenuItems[] = [
  {
    title: "",
    description: "",
  },
  {
    title: "",
    description: "",
  }
]

const toolsMenuContent: NavigationMenuItems[] = [
  {
    title: "",
    description: "",
    isSelected: true
  },
  {
    title: "",
    description: "",
    isSelected: false
  },
  {
    title: "",
    description: "",
    isSelected: false
  },
  {
    title: "",
    description: "",
    isSelected: false
  },
  {
    title: "",
    description: "",
    isSelected: false
  },
]

export default function Header() {
  return (
    <div className="w-full h-full flex flex-row items-center justify-around ">
      <div className="flex flex-col h-full w-1/4 justify-center items-center p-4">
        <GoFileBinary className="text-6xl" />
        <h1>De-Bin</h1>
      </div>
      <NavigationMenu className="h-full flex items-center justify-around w-1/4 p-4">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger> <h3>Help</h3> </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {helpMenuContent.map((content) => (
                  <ListItem></ListItem>
                ))}
              </ul>
            </NavigationMenuContent>

          </NavigationMenuItem>
        </NavigationMenuList>
        {/* <div className="header-item hover-text">
          <h3>Help</h3>
          <MdKeyboardArrowDown size={20}/>
        </div>
        <div className="header-item hover-text">
          <h3>Tools</h3>
          <MdKeyboardArrowDown size={20}/>
        </div> */}
      </NavigationMenu>
    </div>
  );
}