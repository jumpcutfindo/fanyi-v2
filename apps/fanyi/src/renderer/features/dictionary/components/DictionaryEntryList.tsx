import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useDebounce } from 'use-debounce';

import { DictionaryEntry } from '@shared/types/dictionary';
import { DictionaryEntryCard } from '@renderer/components/DictionaryEntryCard';
import { Input } from '@renderer/components/ui/Input';
import { Separator } from '@renderer/components/ui/Separator';
import { useSearchDictionaries } from '@renderer/features/dictionary/queries/searchDictionaries.query';
import { cn } from '@renderer/lib/utils';
import { useDictionariesStore } from '@renderer/stores/useDictionariesStore';

interface DictionaryEntryListProps {
  handleSelectEntry?: (entry: DictionaryEntry) => void;
}

export function DictionaryEntryList({
  handleSelectEntry,
}: DictionaryEntryListProps) {
  const { selectedDictionary } = useDictionariesStore();

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearchQuery] = useDebounce(inputValue, 300);

  const {
    data: searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useSearchDictionaries(debouncedSearchQuery, {
    space: selectedDictionary ? 'specific' : 'all',
    dictionaryId: selectedDictionary?.id ?? '',
    offset: 0,
    limit: 1000,
  });

  const allEntries = searchResults?.pages.flat();

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col gap-2 px-4">
        <Input
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search for a word, pinyin or definition..."
        />
        {!isPending ? (
          <span className="text-muted-foreground text-xs">
            Showing {allEntries?.length} result(s)
          </span>
        ) : null}
      </div>
      <Separator className="mt-3" />
      <div className="bg-muted flex grow items-center justify-center">
        {isPending ? (
          <div className="grow justify-items-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : null}
        {!isPending && allEntries && allEntries.length ? (
          <Virtuoso
            className="grow"
            data={allEntries}
            endReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            itemContent={(idx) => (
              <DictionaryEntryCard
                className={cn(
                  'px-4',
                  idx === 0 ? 'pt-4' : '',
                  idx === allEntries.length - 1 ? 'pb-4' : ''
                )}
                entry={allEntries[idx]}
                handleSelect={handleSelectEntry}
              />
            )}
            components={{
              Footer: () =>
                isFetchingNextPage ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : null,
            }}
          />
        ) : null}
        {!isPending && allEntries && allEntries.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <span className="text-muted-foreground italic">
              No entries found
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
