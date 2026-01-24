import { DictionaryMinimal } from '@shared/types/dictionary';
import { SidebarContent, SidebarHeader } from '@renderer/components/Sidebar';
import { DictionaryFormDialog } from '@renderer/features/dictionary/components/DictionaryFormDialog';
import { useGetDictionaries } from '@renderer/features/dictionary/queries/getDictionaries.query';
import { cn } from '@renderer/lib/utils';
import { useDictionariesSidebarStore } from '@renderer/stores/useDictionariesSidebarStore';

export function DictionaryManager() {
  const { setSelectedDictionary } = useDictionariesSidebarStore();

  const { data: dictionaries } = useGetDictionaries();

  return (
    <>
      <SidebarHeader title="Dictionaries" />
      <SidebarContent>
        {dictionaries?.map((dictionary) => (
          <DictionaryItem
            key={dictionary.name}
            dictionary={dictionary}
            handleSelect={() => setSelectedDictionary(dictionary)}
          />
        ))}
      </SidebarContent>
      <DictionaryFormDialog open={true} mode="create" />
    </>
  );
}

interface DictionaryItemProps {
  dictionary: DictionaryMinimal;
  handleSelect: () => void;
}

function DictionaryItem({ dictionary, handleSelect }: DictionaryItemProps) {
  return (
    <div className="relative text-sm">
      <button
        type="button"
        className={cn(
          'hover:bg-muted flex w-full flex-col gap-2 rounded-sm border p-2 text-start hover:cursor-pointer'
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
