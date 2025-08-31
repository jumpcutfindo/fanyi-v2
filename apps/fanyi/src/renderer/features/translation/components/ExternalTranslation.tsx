import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { DictionaryEntry } from '@shared/types/dictionary';
import { cn } from '@renderer/lib/utils';

interface ExternalTranslationProps {
  entry: DictionaryEntry | null;
}

function ExternalTranslation({ entry }: ExternalTranslationProps) {
  const [previousEntry, setPreviousEntry] = useState<DictionaryEntry | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const getYoudao = () => {
    if (!entry) {
      return '';
    }

    return `https://youdao.com/m/result?word=${encodeURIComponent(entry.simplified)}&lang=en`;
  };

  useEffect(() => {
    if (previousEntry !== entry) {
      setPreviousEntry(entry);
      setIsLoading(true);
    }
  }, [entry]);

  if (!entry) {
    // Return placeholder
    return (
      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
        Click on an entry to open Youdao!
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2
        className={cn('animate-spin', isLoading ? 'opacity-100' : 'hidden')}
      />
      <iframe
        className={cn('h-full w-full', isLoading ? 'hidden' : 'opacity-100')}
        src={getYoudao()}
        onLoad={() => {
          setIsLoading(false);
        }}
      />
    </div>
  );
}

export { ExternalTranslation };
