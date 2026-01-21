import { DictionaryMinimal } from '@shared/types/dictionary';
import { SidebarContent, SidebarHeader } from '@renderer/components/Sidebar';
import { Button } from '@renderer/components/ui/Button';
import { useGetDictionaries } from '@renderer/features/dictionary/queries/getDictionaries.query';
import { cn } from '@renderer/lib/utils';

export function DictionaryManager() {
  const { data: dictionaries } = useGetDictionaries();

  return (
    <>
      <SidebarHeader title="Dictionaries" />
      <SidebarContent>
        {dictionaries?.map((dictionary) => (
          <DictionaryItem key={dictionary.name} dictionary={dictionary} />
        ))}
      </SidebarContent>
    </>
  );
}

interface DictionaryItemProps {
  dictionary: DictionaryMinimal;
}

function DictionaryItem({ dictionary }: DictionaryItemProps) {
  return (
    <div className="relative text-sm">
      <button
        type="button"
        className={cn(
          'hover:bg-muted flex w-full flex-col gap-2 rounded-sm border p-2 text-start hover:cursor-pointer'
        )}
      >
        <span>{dictionary.name}</span>
        <span className="text-muted-foreground text-xs">
          {dictionary.wordCount} words
        </span>
      </button>
    </div>
  );
}
