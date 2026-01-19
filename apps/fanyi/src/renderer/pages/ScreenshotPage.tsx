import { Moon, Sun } from 'lucide-react';
import { useRef } from 'react';

import { Navbar } from '@renderer/components/Navbar';
import { SidebarContainer, SidebarFooter } from '@renderer/components/Sidebar';
import { Label } from '@renderer/components/ui/Label';
import { Switch } from '@renderer/components/ui/Switch';
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
  const { isDarkMode, setIsDarkMode } = useDarkMode();

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

  const renderSidebarFooter = () => {
    switch (sidebarState.state) {
      case 'editor':
        return null;
      default:
        return (
          <SidebarFooter className="flex flex-row justify-between">
            <div className="flex flex-row items-center justify-center gap-2">
              <Label htmlFor="darkMode">
                {isDarkMode ? (
                  <Moon className="fill-foreground size-3.5" />
                ) : (
                  <Sun className="text-muted-foreground fill-muted-foreground size-3.5" />
                )}
              </Label>
              <Switch
                id="darkMode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
            </div>
            <SettingsDialog />
          </SidebarFooter>
        );
    }
  };

  return (
    <>
      <div className="relative h-full min-w-70 gap-4">
        <SidebarContainer ref={sidebarRef} className="absolute h-full w-full">
          {renderSidebarContent()}
          {renderSidebarFooter()}
        </SidebarContainer>
      </div>
      <div className="flex h-full w-0 grow flex-col">
        <TabList />
        <TabDisplay />
      </div>
    </>
  );
}
