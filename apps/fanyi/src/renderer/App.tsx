import { useEffect, useRef, useState } from 'react';

import { PresetEditor } from '@renderer/features/screenshot/components/PresetEditor';
import { PresetManager } from '@renderer/features/screenshot/components/PresetManager';
import { TabDisplay } from '@renderer/features/tabs/components/TabDisplay';
import { TabList } from '@renderer/features/tabs/components/TabList';
import { usePasteImageReceiver } from '@renderer/hooks/usePasteImageReceiver.hook';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';

function App() {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sidebarState = useSidebarStore((state) => state.sidebarState);

  // Use a state hook to manage the dark mode, defaulting to a system preference or light mode
  const [isDarkMode] = useState<boolean>(() => {
    // Check if a preference is already saved in local storage
    const savedMode = localStorage.getItem('theme');
    if (savedMode) {
      return savedMode === 'dark';
    }
    // If not, check the user's system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // useEffect hook to handle the dark mode class on the html element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle pasting of images globally
  usePasteImageReceiver();

  const renderSidebar = () => {
    switch (sidebarState.state) {
      case 'manager':
        return <PresetManager />;
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
      <div className="flex h-full flex-row">
        <div className="relative h-full min-w-70 gap-4">
          <div ref={sidebarRef} className="absolute h-full w-full">
            {renderSidebar()}
          </div>
        </div>
        <div className="flex h-full grow flex-col">
          <TabList />
          <TabDisplay />
        </div>
      </div>
    </>
  );
}

export default App;
