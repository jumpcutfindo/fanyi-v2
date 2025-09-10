import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@renderer/components/ui/ContextMenu';
import { cn } from '@renderer/lib/utils';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';
import { Tab, useTabStore } from '@renderer/stores/useTabStore';

export function TabList() {
  const sidebarState = useSidebarStore((state) => state.sidebarState);

  const tabs = useTabStore((state) => state.tabs);
  const previewTab = useTabStore((state) => state.previewTab);

  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const removeTab = useTabStore((state) => state.removeTab);

  const allTabs = useMemo(
    () => [...tabs, ...(previewTab ? [previewTab] : [])],
    [tabs, previewTab]
  );

  return (
    <div className="divide-border grid grid-cols-5 divide-x-1 divide-y-1 divide-solid md:grid-cols-7 lg:grid-cols-12">
      {allTabs.map((tab, index) => (
        <TabItem
          key={tab.id}
          tabIndex={index}
          tabCount={allTabs.length}
          tab={tab}
          isActive={activeTab?.id === tab.id}
          handleSelect={() => setActiveTab(tab.id)}
          handleClose={() => removeTab(tab.id)}
          disabled={sidebarState.state === 'editor'}
          contextMenu={{
            enabled: true,
            handleCloseOthers: () => {
              allTabs.slice(0, index).forEach((tab) => removeTab(tab.id));
              allTabs.slice(index + 1).forEach((tab) => removeTab(tab.id));
            },
            handleCloseLeft: () => {
              allTabs.slice(0, index).forEach((tab) => removeTab(tab.id));
            },
            handleCloseRight: () => {
              allTabs.slice(index + 1).forEach((tab) => removeTab(tab.id));
            },
            handleCloseAll: () => {
              allTabs.forEach((tab) => removeTab(tab.id));
            },
          }}
        />
      ))}
    </div>
  );
}

export interface TabItemProps {
  tab: Tab;
  tabIndex: number;
  tabCount: number;
  isActive: boolean;
  isPreview?: boolean;
  contextMenu:
    | {
        enabled: false;
      }
    | {
        enabled: true;
        handleCloseOthers: () => void;
        handleCloseLeft: () => void;
        handleCloseRight: () => void;
        handleCloseAll: () => void;
      };
  handleSelect: () => void;
  handleClose: () => void;
  disabled?: boolean;
}

export function TabItem({
  tab,
  tabIndex,
  tabCount,
  isActive,
  isPreview,
  contextMenu,
  handleSelect,
  handleClose,
  disabled,
}: TabItemProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild disabled={!contextMenu.enabled}>
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
            <span
              className={cn('max-w-[90%] truncate', isPreview ? 'italic' : '')}
            >
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
      </ContextMenuTrigger>
      {contextMenu.enabled ? (
        <ContextMenuContent className="w-52">
          <ContextMenuItem onSelect={handleClose}>Close</ContextMenuItem>
          <ContextMenuItem
            onSelect={contextMenu.handleCloseOthers}
            disabled={tabCount <= 1}
          >
            Close Others
          </ContextMenuItem>

          <ContextMenuItem
            onSelect={contextMenu.handleCloseLeft}
            disabled={tabIndex === 0}
          >
            Close to the Left
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={contextMenu.handleCloseRight}
            disabled={tabIndex === tabCount - 1}
          >
            Close to the Right
          </ContextMenuItem>

          <ContextMenuItem onSelect={contextMenu.handleCloseAll}>
            Close All
          </ContextMenuItem>
        </ContextMenuContent>
      ) : null}
    </ContextMenu>
  );
}
