import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useDebounce } from 'use-debounce';

import { DictionaryEntryCard } from '@renderer/components/DictionaryEntryCard';
import { Input } from '@renderer/components/ui/Input';
import { useSearchDictionaries } from '@renderer/features/dictionary/queries/searchDictionaries.query';
import { useDictionariesSidebarStore } from '@renderer/stores/useDictionariesSidebarStore';

export function DictionaryEntryList() {
  const { selectedDictionary } = useDictionariesSidebarStore();

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearchQuery] = useDebounce(inputValue, 300);

  const { data: searchResults, isPending } =
    useSearchDictionaries(debouncedSearchQuery);

  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <div className="flex flex-col gap-2">
        <Input onChange={(e) => setInputValue(e.target.value)} />
        {!isPending ? (
          <span className="text-muted-foreground text-xs">
            {searchResults?.length} result(s)
          </span>
        ) : null}
      </div>
      {isPending ? (
        <div className="my-4 grow justify-items-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : null}
      {!isPending && searchResults ? (
        <Virtuoso
          className="grow"
          totalCount={searchResults.length}
          itemContent={(index) => {
            const entry = searchResults[index];
            return <DictionaryEntryCard entry={entry} />;
          }}
        />
      ) : null}
    </div>
  );
}
