import { cn } from "@/lib/utils";

type CategoryTabsProps = {
  items: { id: string; name: string }[];
  activeId: string;
};

export function CategoryTabs({ items, activeId }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <span
            key={item.id}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold",
              active ? "bg-brand text-white" : "text-brand",
            )}
          >
            {item.name}
          </span>
        );
      })}
    </div>
  );
}
