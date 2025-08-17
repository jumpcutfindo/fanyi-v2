import { Tab, useTabStore } from '@renderer/stores/useTabStore';

export function TabList() {
  const tabs = useTabStore((state) => state.tabs);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="no-scrollbar flex h-8 w-full flex-row overflow-x-scroll">
      {tabs.map((tab) => TabItem({ tab }))}
    </div>
  );
}

export interface TabItemProps {
  tab: Tab;
}

export function TabItem({ tab }: TabItemProps) {
  return (
    <button
      type="button"
      className="bg-card not-last:border-e-muted hover:bg-muted flex h-8 min-w-fit items-center truncate border-e border-e-transparent p-2 text-sm hover:cursor-pointer"
    >
      {tab.title}
    </button>
  );
}
