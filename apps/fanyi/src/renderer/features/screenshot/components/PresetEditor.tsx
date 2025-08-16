import { ScreenshotPreset, ScreenshotSource } from '@shared/types/screenshot';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
} from '@renderer/components/Sidebar';
import { Input } from '@renderer/components/ui/Input';
import { Label } from '@renderer/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/Select';
import { Separator } from '@renderer/components/ui/Separator';
import { Slider } from '@renderer/components/ui/Slider';
import { useGetScreenshotSources } from '@renderer/features/screenshot/queries/getScreenshotSources.query';
import { usePresetStore } from '@renderer/stores/usePresetStore';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';

interface PresetEditorProps {
  mode: 'create' | 'edit';
  initialValues?: ScreenshotPreset;
}

export function PresetEditor({ mode, initialValues }: PresetEditorProps) {
  const setSidebarState = useSidebarStore((state) => state.setSidebarState);
  const setActivePreset = usePresetStore((state) => state.setActivePreset);

  const { data: screenshotSources } = useGetScreenshotSources();

  const { control, register, watch, setValue } = useForm<ScreenshotPreset>({
    defaultValues: initialValues ?? {
      options: {
        type: 'screen',
        sourceId: '',
        crop: undefined,
      },
    },
    mode: 'onChange',
  });

  const selectedType = watch('options.type');
  const selectedSourceId = watch('options.sourceId');
  const selectedCrop = watch('options.crop');

  const selectedSource: ScreenshotSource | undefined = useMemo(() => {
    if (!screenshotSources) return null;

    return screenshotSources.find((s) => s.id === selectedSourceId);
  }, [screenshotSources, selectedSourceId]);

  const sourceOptions = useMemo(() => {
    if (!screenshotSources) return [];

    return screenshotSources.filter((s) => s.type === selectedType);
  }, [screenshotSources, selectedType]);

  // Update preview on form update
  useEffect(() => {
    if (selectedType && selectedSourceId) {
      setActivePreset(watch());
    } else {
      setActivePreset(null);
    }
  }, [
    setActivePreset,
    watch,
    selectedType,
    selectedSourceId,
    selectedCrop?.x,
    selectedCrop?.y,
    selectedCrop?.width,
    selectedCrop?.height,
  ]);

  // Handle switching between selected types
  useEffect(() => {
    // Check if existing source is still available
    const existingSource = sourceOptions.find((s) => s.id === selectedSourceId);
    if (existingSource) {
      return;
    } else {
      // If not, set source to first available
      const firstAvailableSource = sourceOptions[0];
      if (firstAvailableSource) {
        setValue('options.sourceId', firstAvailableSource.id);
      }
    }
  }, [selectedSourceId, setValue, sourceOptions]);

  // Handle switching between selected sources
  useEffect(() => {
    if (!selectedSource) {
      return;
    }

    setValue('options.crop', {
      x: 0,
      y: 0,
      width: selectedSource.size.width,
      height: selectedSource.size.height,
    });
  }, [selectedSource, setValue]);

  return (
    <SidebarContainer>
      <SidebarHeader
        title={mode === 'create' ? 'Create a preset' : 'Edit preset'}
        onBack={() => setSidebarState({ state: 'manager' })}
      />
      <SidebarContent className="gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="name">Name</Label>
          <Input className="text-sm" {...register('name')} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="description">Description</Label>
          <Input className="text-sm" {...register('description')} />
        </div>
        <Separator className="my-2" />
        <div className="flex flex-col gap-1">
          <Label htmlFor="type">Type</Label>
          <Controller
            control={control}
            name="options.type"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => {
              return (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screen">Screen</SelectItem>
                    <SelectItem value="window">Window</SelectItem>
                  </SelectContent>
                </Select>
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="source">Source</Label>
          <Controller
            control={control}
            name="options.sourceId"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => {
              return (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Label>Crop</Label>

          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <Label htmlFor="X">X</Label>
              <Input
                className="h-8 w-16 text-sm"
                {...register('options.crop.x')}
              />
            </div>
            <Controller
              control={control}
              name="options.crop.x"
              render={({ field: { value, onChange } }) => {
                return (
                  <Slider
                    min={0}
                    max={selectedSource?.size.width}
                    step={1}
                    value={[value]}
                    onValueChange={([num]) => onChange(num)}
                  />
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <Label htmlFor="X">Y</Label>
              <Input
                className="h-8 w-16 text-sm"
                {...register('options.crop.y')}
              />
            </div>
            <Controller
              control={control}
              name="options.crop.y"
              render={({ field: { value, onChange } }) => {
                return (
                  <Slider
                    min={0}
                    max={selectedSource?.size.height}
                    step={1}
                    value={[value]}
                    onValueChange={([num]) => onChange(num)}
                  />
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <Label htmlFor="X">Width</Label>
              <Input
                className="h-8 w-16 text-sm"
                {...register('options.crop.width')}
              />
            </div>
            <Controller
              control={control}
              name="options.crop.width"
              render={({ field: { value, onChange } }) => {
                return (
                  <Slider
                    min={0}
                    max={selectedSource?.size.width}
                    step={1}
                    value={[value]}
                    onValueChange={([num]) => onChange(num)}
                  />
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <Label htmlFor="X">Height</Label>
              <Input
                className="h-8 w-16 text-sm"
                {...register('options.crop.height')}
              />
            </div>
            <Controller
              control={control}
              name="options.crop.height"
              render={({ field: { value, onChange } }) => {
                return (
                  <Slider
                    min={0}
                    max={selectedSource?.size.height}
                    step={1}
                    value={[value]}
                    onValueChange={([num]) => onChange(num)}
                  />
                );
              }}
            />
          </div>
        </div>
      </SidebarContent>
    </SidebarContainer>
  );
}
