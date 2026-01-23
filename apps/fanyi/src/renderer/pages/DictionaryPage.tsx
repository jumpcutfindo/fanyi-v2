import { SidebarContainer } from '@renderer/components/Sidebar';
import { DictionaryEntryList } from '@renderer/features/dictionary/components/DictionaryEntryList';
import { DictionaryManager } from '@renderer/features/dictionary/components/DictionaryManager';

export function DictionaryPage() {
  return (
    <>
      <SidebarContainer className="min-w-70">
        <DictionaryManager />
      </SidebarContainer>
      <DictionaryEntryList />
    </>
  );
}
