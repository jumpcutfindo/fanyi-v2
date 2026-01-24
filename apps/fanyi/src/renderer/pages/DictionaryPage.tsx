import { ArrowLeft, X } from 'lucide-react';

import { SidebarContainer } from '@renderer/components/Sidebar';
import { Button } from '@renderer/components/ui/Button';
import { DictionaryEntryList } from '@renderer/features/dictionary/components/DictionaryEntryList';
import { DictionaryManager } from '@renderer/features/dictionary/components/DictionaryManager';
import { useDictionariesSidebarStore } from '@renderer/stores/useDictionariesSidebarStore';

export function DictionaryPage() {
  const { selectedDictionary, setSelectedDictionary } =
    useDictionariesSidebarStore();

  return (
    <>
      <SidebarContainer className="min-w-70">
        <DictionaryManager />
      </SidebarContainer>
      <div className="flex w-full flex-col gap-4 p-4">
        <div className="flex h-6 flex-row items-center gap-2">
          {selectedDictionary ? (
            <Button
              variant="ghost"
              type="button"
              className="size-6 rounded-full"
              onClick={() => setSelectedDictionary(null)}
            >
              <X />
            </Button>
          ) : null}
          <span className="text-sm">
            Selected:{' '}
            <span className="font-semibold">
              {selectedDictionary
                ? selectedDictionary.name
                : 'All dictionaries'}
            </span>
          </span>
        </div>
        <DictionaryEntryList />
      </div>
    </>
  );
}
