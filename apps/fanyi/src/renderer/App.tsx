import { useRef } from 'react';

import { PresetEditor } from '@renderer/features/screenshot/components/PresetEditor';
import { PresetManager } from '@renderer/features/screenshot/components/PresetManager';
import { TabDisplay } from '@renderer/features/tabs/components/TabDisplay';
import { TabList } from '@renderer/features/tabs/components/TabList';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';

function App() {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sidebarState = useSidebarStore((state) => state.sidebarState);

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
    <div className="flex h-full flex-row">
      <div className="relative h-full min-w-70 gap-4">
        <div ref={sidebarRef} className="absolute h-full w-full">
          {renderSidebar()}
        </div>
      </div>
      <div className="bg-muted flex h-full w-0 grow flex-col">
        <TabList />
        <TabDisplay />
      </div>
    </div>
  );
}

export default App;
