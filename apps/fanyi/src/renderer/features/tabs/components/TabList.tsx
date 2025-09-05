import { X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@renderer/lib/utils';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';
import { Tab, useTabStore } from '@renderer/stores/useTabStore';

export function TabList() {
  const sidebarState = useSidebarStore((state) => state.sidebarState);

  const tabs = useTabStore((state) => state.tabs);

  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const removeTab = useTabStore((state) => state.removeTab);

  const previewTab = useTabStore((state) => state.previewTab);

  return (
    <div className="divide-border grid grid-cols-5 divide-x-1 divide-y-1 divide-solid">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={activeTab?.id === tab.id}
          handleSelect={() => setActiveTab(tab.id)}
          handleClose={() => removeTab(tab.id)}
          disabled={sidebarState.state === 'editor'}
        />
      ))}
      {previewTab ? (
        <TabItem
          tab={previewTab}
          isActive={activeTab?.id === previewTab.id}
          handleSelect={() => setActiveTab(previewTab.id)}
          handleClose={() => removeTab(previewTab.id)}
          isPreview
          disabled={sidebarState.state === 'editor'}
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
  disabled?: boolean;
}

export function TabItem({
  tab,
  isActive,
  isPreview,
  handleSelect,
  handleClose,
  disabled,
}: TabItemProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="group relative h-8 w-full">
      <button
        type="button"
        className={cn(
          'bg-card hover:bg-muted flex h-8 w-full items-center truncate p-2 text-sm',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          disabled && !isPreview ? 'opacity-20' : '',
          isActive ? 'border-b-primary border-b' : 'opacity-50'
        )}
        onClick={handleSelect}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <span className={cn('max-w-[90%] truncate', isPreview ? 'italic' : '')}>
          {tab.title}
        </span>
      </button>

      {!disabled ? (
        <button
          className={cn(
            'hover:bg-muted absolute top-[50%] right-2 translate-y-[-50%] cursor-pointer rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100',
            isFocused ? 'opacity-100' : ''
          )}
          onClick={handleClose}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
