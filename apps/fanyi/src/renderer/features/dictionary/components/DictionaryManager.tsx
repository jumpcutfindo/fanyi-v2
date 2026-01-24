import { Plus } from 'lucide-react';
import { useState } from 'react';

import { DictionaryMinimal } from '@shared/types/dictionary';
import { SidebarContent, SidebarHeader } from '@renderer/components/Sidebar';
import { Button } from '@renderer/components/ui/Button';
import { DictionaryFormDialog } from '@renderer/features/dictionary/components/DictionaryFormDialog';
import { useGetDictionaries } from '@renderer/features/dictionary/queries/getDictionaries.query';
import { cn } from '@renderer/lib/utils';
import { useDictionariesSidebarStore } from '@renderer/stores/useDictionariesSidebarStore';

export function DictionaryManager() {
  const { selectedDictionary, setSelectedDictionary } =
    useDictionariesSidebarStore();

  const { data: dictionaries } = useGetDictionaries();

  const [dictionaryDialogOpen, setDictionaryDialogOpen] = useState(false);

  return (
    <>
      <SidebarHeader title="Dictionaries">
        <Button
          variant="ghost"
          type="button"
          className="size-6 rounded-full"
          onClick={() => setDictionaryDialogOpen(true)}
        >
          <Plus />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {dictionaries?.map((dictionary) => (
          <DictionaryItem
            key={dictionary.name}
            dictionary={dictionary}
            handleSelect={() => {
              if (selectedDictionary?.id === dictionary.id) {
                setSelectedDictionary(null);
                return;
              }

              setSelectedDictionary(dictionary);
            }}
          />
        ))}
      </SidebarContent>
      <DictionaryFormDialog
        open={dictionaryDialogOpen}
        setOpen={setDictionaryDialogOpen}
        mode="create"
      />
    </>
  );
}

interface DictionaryItemProps {
  dictionary: DictionaryMinimal;
  handleSelect: () => void;
}

function DictionaryItem({ dictionary, handleSelect }: DictionaryItemProps) {
  const { selectedDictionary } = useDictionariesSidebarStore();

  return (
    <div className="relative text-sm">
      <button
        type="button"
        className={cn(
          'hover:bg-muted flex w-full flex-col gap-2 rounded-sm border p-2 text-start hover:cursor-pointer',
          selectedDictionary?.id === dictionary.id
            ? 'border-primary bg-secondary'
            : ''
        )}
        onClick={handleSelect}
      >
        <span>{dictionary.name}</span>
        <span className="text-muted-foreground text-xs">
          {dictionary.wordCount} words
        </span>
      </button>
    </div>
  );
}
