import { MessageSquareMore, MessageSquareWarning } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { DictionaryEntry } from '@shared/types/dictionary';
import { OcrResult } from '@shared/types/ocr';
import { Button } from '@renderer/components/ui/Button';
import { ExternalTranslation } from '@renderer/features/translation/components/ExternalTranslation';
import { cn } from '@renderer/lib/utils';

const highlightClass = ['border-primary', 'bg-primary/10'];

interface TranslationListProps {
  ocrResult: OcrResult;
  translations: DictionaryEntry[];
}

export function TranslationList({ translations }: TranslationListProps) {
  const itemsRef = useRef<Record<string, HTMLButtonElement>>({});
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const uniqueEntries = useMemo(
    () => [...new Set(translations)],
    [translations]
  );

  const visibleIndices = useRef<{
    start: number;
    end: number;
  }>({
    start: 0,
    end: 0,
  });

  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [hoveredWord, setHoveredWord] = useState<DictionaryEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(
    null
  );

  const scrollToEntry = (index: number) => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
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
    <PanelGroup
      autoSaveId={'translation-list'}
      direction="horizontal"
      className="flex h-0 w-full grow flex-row"
    >
      <Panel
        className="@container flex h-full w-60 flex-col gap-2 overflow-y-auto p-2"
        minSize={16}
        defaultSize={16}
      >
        {uniqueEntries.length > 0 ? (
          <>
            <div className="text-muted-foreground flex h-10 flex-col gap-1 text-sm @min-[192px]:h-5 @min-[192px]:flex-row @min-[192px]:justify-between">
              <span className="">{uniqueEntries.length} words</span>
              <span className={!hoveredWord ? 'italic' : ''}>
                {hoveredWord
                  ? `${hoveredWord.simplified} (${hoveredWord.pinyin})`
                  : 'No word hovered'}
              </span>
            </div>
            <div className="grow overflow-x-clip overflow-y-auto">
              <div className="flex h-fit flex-row flex-wrap">
                {uniqueEntries.map((t, index) => (
                  <Button
                    key={`${t.simplified}-${index}`}
                    variant="outline"
                    className={cn(
                      'flex-1 px-2 py-1 text-lg font-normal',
                      activeWord === t.simplified ? 'border-primary' : ''
                    )}
                    onClick={() => {
                      setActiveWord(t.simplified);
                      scrollToEntry(index);
                    }}
                    onMouseOver={() => setHoveredWord(t)}
                    onMouseOut={() => setHoveredWord(null)}
                    onFocus={() => setHoveredWord(t)}
                    onBlur={() => setHoveredWord(null)}
                  >
                    {t.simplified}
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <MessageSquareWarning className="text-muted-foreground size-8" />
            <span className="text-muted-foreground w-[50%] text-center">
              No words found.
            </span>
          </div>
        )}
      </Panel>
      <PanelResizeHandle className="flex h-full items-center border-e hover:border-e-black/20" />
      <Panel
        className="flex h-full grow flex-col items-center justify-center gap-2 overflow-auto p-2"
        minSize={25}
        defaultSize={40}
      >
        {uniqueEntries.length > 0 ? (
          <Virtuoso
            ref={virtuosoRef}
            className="h-full w-full"
            totalCount={uniqueEntries.length}
            itemContent={(index) => {
              const entry = uniqueEntries[index];

              return (
                <TranslationItem
                  ref={(ref) => (itemsRef.current[entry.simplified] = ref)}
                  entry={entry}
                  isSelected={selectedEntry === entry}
                  handleSelect={setSelectedEntry}
                />
              );
            }}
          />
        ) : (
          <>
            <MessageSquareMore className="text-muted-foreground size-8" />
            <span className="text-muted-foreground w-[50%] text-center">
              No dictionary entries to display.
            </span>
          </>
        )}
      </Panel>
      <PanelResizeHandle className="flex h-full items-center border-e hover:border-e-black/20" />
      <Panel minSize={25} defaultSize={44} collapsible>
        <ExternalTranslation entry={selectedEntry} />
      </Panel>
    </PanelGroup>
  );
}

interface TranslationItemProps {
  ref: (ref: HTMLButtonElement) => void;
  entry: DictionaryEntry;
  isSelected: boolean;
  handleSelect: (entry: DictionaryEntry) => void;
}

function TranslationItem({
  ref,
  entry,
  isSelected,
  handleSelect,
}: TranslationItemProps) {
  return (
    <div className="pb-1">
      <button
        type="button"
        ref={ref}
        className={cn(
          'bg-card hover:bg-muted flex h-fit w-full cursor-pointer flex-row items-center gap-4 rounded-md border px-4 py-2 text-start transition-all',
          isSelected ? 'border-primary' : ''
        )}
        onClick={() => handleSelect(entry)}
      >
        <span className="flex-1 text-2xl">{entry.simplified}</span>
        <span className="text-muted-foreground flex-1 text-sm">
          {entry.pinyin}
        </span>
        <div className="flex-3 text-sm">{entry.definition}</div>
      </button>
    </div>
  );
}
