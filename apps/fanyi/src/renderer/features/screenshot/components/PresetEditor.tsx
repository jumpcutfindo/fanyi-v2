import { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import { ScreenshotPreset, ScreenshotSource } from '@shared/types/screenshot';
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
import { useDeleteScreenshotPresetMutation } from '@renderer/features/screenshot/queries/deleteScreenshotPreset.mutation';
import { useGetScreenshotSources } from '@renderer/features/screenshot/queries/getScreenshotSources.query';
import { useGetUsedKeybindsQuery } from '@renderer/features/screenshot/queries/getUsedKeybinds.query';
import { useUpdateScreenshotPresetMutation } from '@renderer/features/screenshot/queries/updateScreenshotPreset.mutation';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';
import { useTabStore } from '@renderer/stores/useTabStore';

interface PresetEditorProps {
  mode: 'create' | 'edit';
  initialValues?: ScreenshotPreset;
}

export function PresetEditor({ mode, initialValues }: PresetEditorProps) {
  const setSidebarState = useSidebarStore((state) => state.setSidebarState);

  const previewTab = useTabStore((state) => state.previewTab);
  const setPreviewTab = useTabStore((state) => state.setPreviewTab);
  const removeTab = useTabStore((state) => state.removeTab);

  const { data: screenshotSources } = useGetScreenshotSources();
  const { data: usedKeybinds } = useGetUsedKeybindsQuery();

  const { mutate: addScreenshotPreset } = useAddScreenshotPresetMutation();
  const { mutate: updateScreenshotPreset } =
    useUpdateScreenshotPresetMutation();
  const { mutate: deleteScreenshotPreset } =
    useDeleteScreenshotPresetMutation();

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ScreenshotPreset>({
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

  const debounceSetActivePreset = useDebouncedCallback((preset) => {
    setPreviewTab(
      {
        ...previewTab!,
        activePreset: preset,
      },
      {
        setActive: true,
      }
    );
  }, 500);

  const onSubmit = (data: ScreenshotPreset) => {
    if (mode === 'create') {
      addScreenshotPreset(data, {
        onSuccess: () => {
          setSidebarState({ state: 'manager' });
          toast.success(`Preset "${data.name}" created`);

          setPreviewTab(
            {
              title: 'Preview',
              type: 'preview',
              activePreset: data,
            },
            {
              setActive: true,
            }
          );

          reset(data, { keepDirty: false });
        },
      });
    } else if (mode === 'edit') {
      updateScreenshotPreset(data, {
        onSuccess: () => {
          toast.success('Preset updated');

          setPreviewTab(
            {
              title: 'Preview',
              type: 'preview',
              activePreset: data,
            },
            {
              setActive: true,
            }
          );

          reset(data, { keepDirty: false });
        },
      });
    }
  };

  const handleDelete = () => {
    if (mode === 'edit' && initialValues) {
      deleteScreenshotPreset(initialValues.id, {
        onSuccess: () => {
          toast.success('Preset deleted');
        },
      });

      setSidebarState({ state: 'manager' });

      removeTab(previewTab!.id);
    }
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

  useEffect(() => {
    if (!selectedSource || initialValues) {
      return;
    }

    setValue('options.crop.x', 0);
    setValue('options.crop.y', 0);
    setValue('options.crop.width', selectedSource?.size.width || 0);
    setValue('options.crop.height', selectedSource?.size.height || 0);
  }, [mode, selectedSource, initialValues, setValue]);

  return (
    <SidebarContainer>
      <SidebarHeader
        title={mode === 'create' ? 'Create a preset' : 'Edit preset'}
        onBack={() => {
          setSidebarState({ state: 'manager' });

          if (!initialValues && previewTab?.id) {
            removeTab(previewTab?.id);
          } else if (isDirty && initialValues && initialValues !== watch()) {
            // Reset to the original preset
            setPreviewTab({ ...previewTab!, activePreset: initialValues });
          }
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col">
        <SidebarContent className="grow gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Name</Label>
            <Input
              className="text-sm"
              {...register('name', { required: true })}
            />
            {errors.name && <p className="text-xs text-red-500">Required</p>}
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
                  <>
                    <Select value={value} onValueChange={onChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="screen">Screen</SelectItem>
                        <SelectItem value="window">Window</SelectItem>
                      </SelectContent>
                    </Select>

                    {errors.options?.sourceId ? (
                      <p className="text-xs text-red-500">Required</p>
                    ) : null}
                  </>
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
                  <>
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
                    {errors.options?.sourceId ? (
                      <p className="text-xs text-red-500">Required</p>
                    ) : null}
                  </>
                );
              }}
            />
          </div>
          <Separator className="my-2" />
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
          <Separator className="my-2" />
          <div className="flex flex-col gap-1">
            <Label>Keybind</Label>
            <Controller
              name="keybind"
              control={control}
              render={({ field }) => (
                <KeybindInput
                  keybind={field.value}
                  setKeybind={field.onChange}
                />
              )}
              rules={{
                validate: (value) => {
                  if (value) {
                    return (
                      !usedKeybinds?.includes(value) || 'Keybind already in use'
                    );
                  }
                },
              }}
            />
            {errors.keybind ? (
              <p className="text-xs text-red-500">{errors.keybind.message}</p>
            ) : null}
          </div>
        </SidebarContent>
        <SidebarFooter className="w-full justify-end gap-2">
          <Button type="submit">{mode === 'create' ? 'Create' : 'Save'}</Button>
          {mode === 'edit' ? (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          ) : null}
        </SidebarFooter>
      </form>
    </SidebarContainer>
  );
}

interface KeybindInputProps {
  keybind: string | undefined;
  setKeybind: React.Dispatch<React.SetStateAction<string>>;
}

function KeybindInput({ keybind, setKeybind }: KeybindInputProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent default browser behavior for common keybinds
      // to ensure our component captures the event.
      e.preventDefault();

      // Use a Set to store unique key parts and maintain order.
      // The Set automatically handles duplicates.
      const keys = new Set<string>();

      // Add modifier keys if they are pressed.
      if (e.ctrlKey) keys.add('Ctrl');
      if (e.shiftKey) keys.add('Shift');
      if (e.altKey) keys.add('Alt');
      if (e.metaKey) keys.add('Meta');

      // Get the key name. We check for a few special cases.
      let keyName = e.key;
      if (keyName === ' ') keyName = 'Space';
      if (keyName === 'Enter') keyName = 'Enter';

      // Ensure the key is not a modifier itself and is not a special key like Tab.
      const isModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);
      if (!isModifier) {
        // Capitalize the key name before adding it to the set.
        keys.add(keyName.toUpperCase());
      }

      // Format the keybind string with a " + " separator.
      const newKeybind = Array.from(keys).join(' + ');

      setKeybind(newKeybind);
    },
    [setKeybind]
  );

  // Handler to clear the input value.
  const handleClear = useCallback(() => {
    setKeybind('');
  }, [setKeybind]);

  return (
    <div className="flex flex-row gap-2">
      <Input type="text" readOnly value={keybind} onKeyDown={handleKeyDown} />
      <Button type="button" onClick={handleClear}>
        Clear
      </Button>
    </div>
  );
}
