import { useRef } from 'react';

import { SidebarContainer, SidebarFooter } from '@renderer/components/Sidebar';
import { SettingsDialog } from '@renderer/features/preferences/components/SettingsDialog';
import { PresetEditor } from '@renderer/features/screenshot/components/PresetEditor';
import { PresetManager } from '@renderer/features/screenshot/components/PresetManager';
import { TabDisplay } from '@renderer/features/tabs/components/TabDisplay';
import { TabList } from '@renderer/features/tabs/components/TabList';
import { useDarkMode } from '@renderer/hooks/useDarkMode.hook';
import { usePasteImageReceiver } from '@renderer/hooks/usePasteImageReceiver.hook';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';

export function ScreenshotPage() {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sidebarState = useSidebarStore((state) => state.sidebarState);
  useDarkMode();

  // Handle pasting of images
  usePasteImageReceiver();

  const renderSidebarContent = () => {
    switch (sidebarState.state) {
      case 'manager':
        return (
          <>
            <PresetManager />
          </>
        );
      case 'editor':
        return (
          <PresetEditor
            mode={sidebarState.options?.mode}
            initialValues={sidebarState.options?.initialPreset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="relative h-full min-w-70 gap-4">
        <SidebarContainer ref={sidebarRef} className="absolute h-full w-full">
          {renderSidebarContent()}
        </SidebarContainer>
      </div>
      <div className="flex h-full w-0 grow flex-col">
        <TabList />
        <TabDisplay />
      </div>
    </>
  );
}
