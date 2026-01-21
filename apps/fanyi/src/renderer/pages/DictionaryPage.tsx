import { SidebarContainer } from '@renderer/components/Sidebar';
import { DictionaryManager } from '@renderer/features/dictionary/components/DictionaryManager';

export function DictionaryPage() {
  return (
    <>
      <SidebarContainer className="min-w-70">
        <DictionaryManager />
      </SidebarContainer>
      <div className="bg-secondary"></div>
    </>
  );
}
