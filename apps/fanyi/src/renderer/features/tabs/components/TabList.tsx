import { cn } from '@renderer/lib/utils';
import { Tab, useTabStore } from '@renderer/stores/useTabStore';

export function TabList() {
  const tabs = useTabStore((state) => state.tabs);

  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="no-scrollbar flex h-8 w-full flex-row overflow-x-scroll">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={activeTab?.id === tab.id}
          handleSelect={() => setActiveTab(tab)}
        />
      ))}
    </div>
  );
}

export interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  handleSelect: () => void;
}

export function TabItem({ tab, isActive, handleSelect }: TabItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'bg-card not-last:border-e-muted hover:bg-muted flex h-8 min-w-fit items-center truncate border-e border-e-transparent p-2 text-sm hover:cursor-pointer',
        isActive ? 'border-b-primary border-b' : ''
      )}
      onClick={handleSelect}
    >
      {tab.title}
    </button>
  );
}
