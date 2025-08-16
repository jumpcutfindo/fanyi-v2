import { ScreenshotPreset, ScreenshotSource } from '@shared/types/screenshot';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';

import {
  SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@renderer/components/Sidebar';
import { Button } from '@renderer/components/ui/Button';
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
import { useAddScreenshotPresetMutation } from '@renderer/features/screenshot/queries/addScreenshotPreset.mutation';
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
  const { mutate: addScreenshotPreset } = useAddScreenshotPresetMutation();

  const { control, register, watch, setValue, handleSubmit } =
    useForm<ScreenshotPreset>({
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

  const debounceSetActivePreset = useDebouncedCallback(setActivePreset, 500);

  const onSubmit = (data: ScreenshotPreset) => {
    addScreenshotPreset(data);
  };

  const renderSliderWithInput = ({
    name,
    label,
    min,
    max,
  }: {
    name:
      | 'options.crop.x'
      | 'options.crop.y'
      | 'options.crop.width'
      | 'options.crop.height';
    label: string;
    min: number;
    max: number;
  }) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <Label htmlFor={name}>{label}</Label>
          <Input
            className="h-8 w-24 text-sm"
            value={watch(name)}
            {...register(name, {
              valueAsNumber: true,
            })}
          />
        </div>
        <Controller
          control={control}
          name={name}
          render={({ field: { value, onChange } }) => {
            return (
              <Slider
                min={min}
                max={max}
                step={1}
                value={[value]}
                onValueChange={([num]) => onChange(num)}
              />
            );
          }}
        />
      </div>
    );
  };

  // If initial value is provided, set active preset
  useEffect(() => {
    if (initialValues) {
      setActivePreset(initialValues);
    }
  }, [initialValues, setActivePreset]);

  // Update preview on form update
  useEffect(() => {
    if (selectedType && selectedSourceId) {
      debounceSetActivePreset(watch());
    } else {
      debounceSetActivePreset(null);
    }
  }, [
    debounceSetActivePreset,
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

    setValue('options.crop.x', 0);
    setValue('options.crop.y', 0);
    setValue('options.crop.width', selectedSource?.size.width || 0);
    setValue('options.crop.height', selectedSource?.size.height || 0);
  }, [selectedSource, setValue]);

  return (
    <SidebarContainer>
      <SidebarHeader
        title={mode === 'create' ? 'Create a preset' : 'Edit preset'}
        onBack={() => setSidebarState({ state: 'manager' })}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col">
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
            {renderSliderWithInput({
              label: 'X',
              name: 'options.crop.x',
              min: 0,
              max: selectedSource?.size.width || 0,
            })}
            {renderSliderWithInput({
              label: 'Y',
              name: 'options.crop.y',
              min: 0,
              max: selectedSource?.size.height || 0,
            })}
            {renderSliderWithInput({
              label: 'Width',
              name: 'options.crop.width',
              min: 0,
              max: selectedSource?.size.width || 0,
            })}
            {renderSliderWithInput({
              label: 'Height',
              name: 'options.crop.height',
              min: 0,
              max: selectedSource?.size.height || 0,
            })}
          </div>
        </SidebarContent>
        <SidebarFooter className="w-full justify-end">
          <Button type="submit">Save</Button>
        </SidebarFooter>
      </form>
    </SidebarContainer>
  );
}
