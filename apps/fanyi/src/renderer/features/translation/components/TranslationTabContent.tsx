import { Loader2Icon } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { TranslationImage } from './TranslationImage';

import { useGetOcrWithPresetQuery } from '@renderer/features/screenshot/queries/getOcrWithPreset.query';
import { TranslationList } from '@renderer/features/translation/components/TranslationList';
import { cn } from '@renderer/lib/utils';
import { TranslationTab } from '@renderer/stores/useTabStore';

interface TranslationTabContentProps {
  tab: TranslationTab;
}

export function TranslationTabContent({ tab }: TranslationTabContentProps) {
  const { id, preset, screenshot } = tab;

  const translationListRef = useRef<ImperativePanelHandle>(null);

  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const { data: ocrResponse, isPending: isOcrTextPending } =
    useGetOcrWithPresetQuery(id, preset);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {isOcrTextPending ? (
        <div className="flex flex-col items-center gap-8">
          <img
            src={screenshot}
            className={cn(
              'max-h-120 w-full bg-black/20 object-scale-down lg:max-h-180'
            )}
          />
          <Loader2Icon className="animate-spin" />
          <span>Reading and translating image...</span>
        </div>
      ) : (
        <PanelGroup
          autoSaveId="translation-tab"
          direction="vertical"
          className="flex h-full w-full flex-col"
        >
          <Panel defaultValue={25}>
            <TranslationImage
              ocrResult={ocrResponse.ocrResult}
              screenshot={screenshot}
              isExpanded={isImageExpanded}
              toggleExpanded={() => {
                if (!translationListRef.current) {
                  return;
                }

                if (translationListRef.current.isExpanded()) {
                  setIsImageExpanded(true);
                  translationListRef.current.collapse();
                } else {
                  translationListRef.current.expand();
                  setIsImageExpanded(false);
                }
              }}
            />
          </Panel>
          <PanelResizeHandle className="flex w-full items-center border-t hover:border-t-black/20" />
          <Panel
            ref={translationListRef}
            defaultValue={75}
            minSize={50}
            collapsible
          >
            <TranslationList
              ocrResult={ocrResponse.ocrResult}
              translations={ocrResponse.translations}
            />
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}
