import { NavigationMenuList } from "@/components/ui/navigation-menu";

export interface ListItemContent {
  title: string;
  description: string;
}

export const ListItem = ({ title, description }: ListItemContent) => {
  return (
    <NavigationMenuList className="p-3 flex flex-col items-center space-evenly">
      <div className="flex flex-col justify-around h-1/3 w-full transition-opacity hover:opacity-50">
        <h3 className="font-bold text-accent">{title}</h3>
        <p className="font-light">{description}</p>
      </div>
    </NavigationMenuList>
  );
};
