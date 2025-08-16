import { PresetEditor } from '@renderer/features/screenshot/components/PresetEditor';
import { PresetManager } from '@renderer/features/screenshot/components/PresetManager';
import { useGetScreenshotWithPreset } from '@renderer/features/screenshot/queries/getScreenshotWithPreset.query';
import { usePresetStore } from '@renderer/stores/usePresetStore';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';

function App() {
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
      <div className="flex min-w-70 flex-col gap-4 p-4">{renderSidebar()}</div>
      <div className="h-full w-full">
        {imageString ? (
          <img src={`data:image/png;base64,${imageString}`} alt="Captured" />
        ) : null}
      </div>
    </div>
  );
}

export default App;
