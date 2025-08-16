import { ScreenshotPreset } from '@shared/types/screenshot';

import { SidebarContainer, SidebarHeader } from '@renderer/components/Sidebar';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';

interface PresetEditorProps {
  mode: 'create' | 'edit';
  initialValues?: ScreenshotPreset;
}

export function PresetEditor({ mode, initialValues }: PresetEditorProps) {
  const setSidebarState = useSidebarStore((state) => state.setSidebarState);

  return (
    <SidebarContainer>
      <SidebarHeader
        title={mode === 'create' ? 'Create a preset' : 'Edit preset'}
        onBack={() => setSidebarState({ state: 'manager' })}
      />
    </SidebarContainer>
  );
}
