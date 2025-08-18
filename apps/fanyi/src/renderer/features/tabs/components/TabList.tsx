import { X } from 'lucide-react';

import { cn } from '@renderer/lib/utils';
import { Tab, useTabStore } from '@renderer/stores/useTabStore';

export function TabList() {
  const tabs = useTabStore((state) => state.tabs);

  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const removeTab = useTabStore((state) => state.removeTab);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-5">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={activeTab?.id === tab.id}
          handleSelect={() => setActiveTab(tab)}
          handleClose={() => removeTab(tab.id)}
        />
      ))}
    </div>
  );
}

export interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  handleSelect: () => void;
  handleClose: () => void;
}

export function TabItem({
  tab,
  isActive,
  handleSelect,
  handleClose,
}: TabItemProps) {
  return (
    <div className="group relative w-full">
      <button
        type="button"
        className={cn(
          'bg-card not-last:border-e-muted hover:bg-muted flex h-8 w-full items-center truncate border-e border-e-transparent p-2 text-sm hover:cursor-pointer',
          isActive ? 'border-b-primary border-b' : ''
        )}
        onClick={handleSelect}
      >
        <span className="max-w-[90%] truncate">{tab.title}</span>
      </button>

      <button
        className="hover:bg-muted absolute top-[50%] right-2 translate-y-[-50%] cursor-pointer rounded-full opacity-0 group-hover:opacity-100"
        onClick={handleClose}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
