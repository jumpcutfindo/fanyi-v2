import { X } from 'lucide-react';

import { cn } from '@renderer/lib/utils';
import { Tab, useTabStore } from '@renderer/stores/useTabStore';

export function TabList() {
  const tabs = useTabStore((state) => state.tabs);

  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const removeTab = useTabStore((state) => state.removeTab);

  const previewTab = useTabStore((state) => state.previewTab);
  const setPreviewTab = useTabStore((state) => state.setPreviewTab);

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
      {previewTab ? (
        <TabItem
          tab={previewTab}
          isActive={activeTab?.id === previewTab.id}
          handleSelect={() => setActiveTab(previewTab)}
          handleClose={() => setPreviewTab(null)}
          isPreview
        />
      ) : null}
    </div>
  );
}

export interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  isPreview?: boolean;
  handleSelect: () => void;
  handleClose: () => void;
}

export function TabItem({
  tab,
  isActive,
  isPreview,
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
        <span className={cn('max-w-[90%] truncate', isPreview ? 'italic' : '')}>
          {tab.title}
        </span>
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
