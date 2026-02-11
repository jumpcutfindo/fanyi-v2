import { Plus, Trash2 } from 'lucide-react';
import { pinyin } from 'pinyin-pro';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@renderer/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@renderer/components/ui/Dialog';
import { Input } from '@renderer/components/ui/Input';
import { Label } from '@renderer/components/ui/Label';
import { s2t, t2s } from '@renderer/utils/translation.util';

interface AddDictionaryEntryForm {
  traditional: string;
  simplified: string;
  pinyin: string;
  definitions: string[];
}

export function AddDictionaryEntryDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const { handleSubmit, register, setValue, formState, control, reset } =
    useForm<AddDictionaryEntryForm>({
      defaultValues: {
        traditional: '',
        simplified: '',
        pinyin: '',
        definitions: [''],
      },
    });

  const {
    fields: definitions,
    append: addDefinition,
    remove: removeDefinition,
  } = useFieldArray({
    control,
    name: 'definitions' as never, // "as never" helps if TS gets picky with string arrays
    rules: {
      required: 'You minimally need one definition',
      validate: (value) => {
        // 1. Check if there is at least one entry
        if (value.length === 0) return 'You minimally need one definition';

        // 2. Check if at least one entry contains non-whitespace text
        const hasContent = value.some(
          (def) => def && (def as string).trim().length > 0
        );
        if (!hasContent) return 'At least one definition must have text';

        return true; // Validation passed
      },
    },
  });

  const onSubmit = (data: AddDictionaryEntryForm) => {
    console.log(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new word</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Simplified Chinese<span className="text-destructive">*</span>
            </Label>
            <Controller
              name="simplified"
              control={control}
              rules={{ required: 'Please provide the simplified Chinese word' }}
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val); // Update simplified field
                    setValue('traditional', s2t(val)); // Sync traditional field
                    setValue('pinyin', pinyin(val, { toneType: 'num' }));
                  }}
                />
              )}
            />
            {formState.errors.simplified && (
              <span className="text-destructive text-xs">
                {formState.errors.simplified.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Traditional Chinese<span className="text-destructive">*</span>
            </Label>
            <Controller
              name="traditional"
              control={control}
              rules={{
                required: 'Please provide the traditional Chinese word',
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val); // Update traditional field
                    setValue('simplified', t2s(val)); // Sync simplified field
                    setValue('pinyin', pinyin(val, { toneType: 'num' }));
                  }}
                />
              )}
            />
            {formState.errors.traditional && (
              <span className="text-destructive text-xs">
                {formState.errors.traditional.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Pinyin (auto-generated)</Label>
            <Input {...register('pinyin')} disabled />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>
                Definitions <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addDefinition('')}
              >
                <Plus />
              </Button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto">
              {definitions.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`definitions.${index}`)}
                    placeholder={`Definition ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeDefinition(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {formState.errors.definitions?.[index] && (
                    <span className="text-destructive text-[10px]">
                      This definition is required
                    </span>
                  )}
                </div>
              ))}
            </div>
            {formState.errors.definitions && (
              <span className="text-destructive text-xs">
                {formState.errors.definitions.root?.message ||
                  'Please provide at least one definition'}
              </span>
            )}
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="default" type="submit">
              Save
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                reset();
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
