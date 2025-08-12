import {
  ScreenshotOptions,
  ScreenshotSource,
  ScreenshotSourceType,
} from '@shared/types/screenshot';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { Label } from '@renderer/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/RadioGroup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/Select';

export function ScreenshotSettings() {
  const [selectedOptions, setSelectedOptions] = useState<ScreenshotOptions>({
    type: 'screen',
    id: '',
    preset: undefined,
  });

  const { data: sources } = useQuery({
    queryKey: ['screenshot-sources'],
    queryFn: () => {
      return window.api.getScreenshotSources();
    },
  });

  const screenSources = useMemo(() => {
    return sources?.filter((s) => s.type === 'screen');
  }, [sources]);

  const windowSources = useMemo(() => {
    return sources?.filter((s) => s.type === 'window');
  }, [sources]);

  const handleOptionsChange = (options?: ScreenshotOptions) => {
    if (!options) {
      return;
    }

    if (options.type !== selectedOptions.type) {
      setSelectedOptions({
        ...options,
        id:
          options.type === 'screen'
            ? screenSources?.[0]?.id
            : windowSources?.[0]?.id || '',
      });
      return;
    }

    setSelectedOptions(options);
  };

  const renderSourceItem = (source: ScreenshotSource) => {
    return (
      <SelectItem key={source.id} value={source.id}>
        {source.name}
      </SelectItem>
    );
  };

  return (
    <div className="flex w-full flex-col gap-2 text-sm">
      <h1 className="font-medium">Screenshot Options</h1>
      <RadioGroup
        className="flex flex-row"
        value={selectedOptions.type}
        onValueChange={(value) =>
          handleOptionsChange({
            ...selectedOptions,
            type: value as ScreenshotSourceType,
            preset: undefined,
          })
        }
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem id="screen" value="screen" />
          <Label htmlFor="screen">Screen</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="window" value="window" />
          <Label htmlFor="window">Window</Label>
        </div>
      </RadioGroup>

      <Select
        value={selectedOptions.id}
        onValueChange={(value) =>
          handleOptionsChange({ ...selectedOptions, id: value })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={`Select a ${selectedOptions?.type === 'screen' ? 'screen' : 'window'}`}
          />
        </SelectTrigger>
        <SelectContent>
          {selectedOptions.type === 'screen'
            ? screenSources?.map(renderSourceItem)
            : windowSources?.map(renderSourceItem)}
        </SelectContent>
      </Select>
    </div>
  );
}
