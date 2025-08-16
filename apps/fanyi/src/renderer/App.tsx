import { useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { PresetEditor } from '@renderer/features/screenshot/components/PresetEditor';
import { PresetManager } from '@renderer/features/screenshot/components/PresetManager';
import { useGetScreenshotWithPreset } from '@renderer/features/screenshot/queries/getScreenshotWithPreset.query';
import { usePresetStore } from '@renderer/stores/usePresetStore';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';

function App() {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sidebarState = useSidebarStore((state) => state.sidebarState);
  const activePreset = usePresetStore((state) => state.activePreset);

  const { data: screenshot } = useGetScreenshotWithPreset(activePreset);

  const imageString = screenshot
    ? btoa(
        new Uint8Array(screenshot).reduce(function (data, byte) {
          return data + String.fromCharCode(byte);
        }, '')
      )
    : null;

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
      <div className="relative min-w-70 gap-4">
        <TransitionGroup>
          <CSSTransition
            key={sidebarState.state}
            nodeRef={sidebarRef}
            timeout={200}
            classNames="sidebar"
          >
            <div ref={sidebarRef} className="absolute w-full transition-all">
              {renderSidebar()}
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
      <div className="h-full w-full">
        {imageString ? (
          <img src={`data:image/png;base64,${imageString}`} alt="Captured" />
        ) : null}
      </div>
    </div>
  );
}

export default App;
