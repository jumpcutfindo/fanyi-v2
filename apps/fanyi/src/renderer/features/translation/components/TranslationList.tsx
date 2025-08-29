import { DictionaryEntry } from '@shared/types/dictionary';
import { OcrResult } from '@shared/types/ocr';
import { useMemo, useRef, useState } from 'react';
import { List, RowComponentProps, useListRef } from 'react-window';

import { Button } from '@renderer/components/ui/Button';
import { cn } from '@renderer/lib/utils';

const highlightClass = ['border-primary', 'bg-primary/10'];

interface TranslationListProps {
  ocrResult: OcrResult;
  translations: DictionaryEntry[];
}

export function TranslationList({ translations }: TranslationListProps) {
  const virtualListRef = useListRef(null);
  const itemsRef = useRef<Record<string, HTMLDivElement>>({});

  const uniqueEntries = useMemo(
    () => [...new Set(translations)],
    [translations]
  );

  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [hoveredEntry, setHoveredEntry] = useState<DictionaryEntry | null>(
    null
  );
  const visibleIndices = useRef<{
    start: number;
    end: number;
  }>({
    start: 0,
    end: 0,
  });

  const scrollToEntry = (index: number) => {
    if (virtualListRef.current) {
      virtualListRef.current.scrollToRow({
        index,
        align: 'center',
        behavior: 'smooth',
      });
    }

    // Handle highlighting
    // We need some delay before adding the highlight due to the virtual list
    //
    // The delay is calculated based on the distance from current position to
    // the new position
    // - If the index lies within the visible range, the delay is 0
    // - If the index lies outside the visible range, the delay is calculated

    const hasHighlightDelay =
      index <= visibleIndices.current.start ||
      index > visibleIndices.current.end;

    const highlightDelay = hasHighlightDelay
      ? Math.min(
          Math.max(
            Math.abs(
              (visibleIndices.current.end + visibleIndices.current.start) / 2 -
                index
            ) * 20,
            500
          ),
          900
        )
      : 0;

    setTimeout(() => {
      if (itemsRef.current[uniqueEntries[index].simplified]) {
        const element = itemsRef.current[uniqueEntries[index].simplified];

        requestAnimationFrame(() => {
          // Add highlight to element
          element.classList.add(...highlightClass);

          // Remove after some delay
          setTimeout(() => {
            element.classList.remove(...highlightClass);
          }, 1500);
        });
      }
    }, highlightDelay);
  };

  return (
    <div className="flex h-0 w-full grow flex-row">
      <div className="flex h-full w-60 flex-col gap-2 overflow-auto py-2 ps-2">
        <div className="text-muted-foreground flex h-6 flex-row justify-between text-sm">
          <span className="">{uniqueEntries.length} words</span>
          {hoveredEntry ? (
            <span>
              {hoveredEntry.simplified} ({hoveredEntry.pinyin})
            </span>
          ) : null}
        </div>
        <div className="grow overflow-auto">
          <div className="flex h-fit flex-row flex-wrap">
            {uniqueEntries.map((t, index) => (
              <Button
                variant="outline"
                className={cn(
                  'flex-1 px-2 py-1 text-lg font-normal',
                  activeWord === t.simplified ? 'border-primary' : ''
                )}
                onClick={() => {
                  setActiveWord(t.simplified);
                  scrollToEntry(index);
                }}
                onMouseOver={() => setHoveredEntry(t)}
                onMouseOut={() => setHoveredEntry(null)}
              >
                {t.simplified}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex grow flex-col items-center gap-2 overflow-auto p-2">
        <List
          listRef={virtualListRef}
          className="w-full"
          rowComponent={TranslationItem}
          rowCount={uniqueEntries.length}
          rowHeight={112}
          rowProps={{
            setRef: (key: string, ref: HTMLDivElement) => {
              if (!ref) return;
              itemsRef.current[key] = ref;
            },
            entries: uniqueEntries,
          }}
          onRowsRendered={({ startIndex, stopIndex }) => {
            visibleIndices.current = {
              start: startIndex,
              end: stopIndex,
            };
          }}
        />
      </div>
    </div>
  );
}

type TranslationItemProps = RowComponentProps<{
  setRef: (key: string, ref: HTMLDivElement) => void;
  entries: DictionaryEntry[];
}>;

function TranslationItem({
  setRef,
  entries,
  index,
  style,
}: TranslationItemProps) {
  const entry = entries[index];

  return (
    <div className="mb-1" style={style}>
      <div
        ref={(ref) => {
          if (!ref) return;
          setRef(entry.simplified, ref);
        }}
        className="bg-card flex h-fit w-full flex-col rounded-md border p-4 transition-all"
      >
        <span className="text-2xl">{entry.simplified}</span>
        <span className="text-sm">{entry.pinyin}</span>
        <div>{entry.definition}</div>
      </div>
    </div>
  );
}
