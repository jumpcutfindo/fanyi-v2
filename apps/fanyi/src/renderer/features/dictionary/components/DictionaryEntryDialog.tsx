import { Loader2, Plus, Trash2 } from 'lucide-react';
import { pinyin } from 'pinyin-pro';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { DictionaryEntry } from '@shared/types/dictionary';
import { Button } from '@renderer/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/Dialog';
import { Input } from '@renderer/components/ui/Input';
import { Label } from '@renderer/components/ui/Label';
import { useCreateDictionaryEntryMutation } from '@renderer/features/dictionary/queries/createDictionaryEntry.mutation';
import { useDeleteDictionaryEntryMutation } from '@renderer/features/dictionary/queries/deleteDictionaryEntry.mutation';
import { s2t, t2s } from '@renderer/utils/translation.util';

interface DictionaryEntryForm {
  traditional: string;
  simplified: string;
  pinyin: string;
  definitions: string[];
}

interface BaseDictionaryEntryDialogProps {
  mode: 'create' | 'edit' | 'view';
  dictionaryId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface EditDictionaryEntryDialogProps
  extends BaseDictionaryEntryDialogProps {
  mode: 'edit';
  entry?: DictionaryEntry;
}

interface CreateDictionaryEntryDialogProps
  extends BaseDictionaryEntryDialogProps {
  mode: 'create';
}

interface ViewDictionaryEntryDialogProps
  extends BaseDictionaryEntryDialogProps {
  mode: 'view';
  entry?: DictionaryEntry;
}

type DictionaryEntryDialogProps =
  | EditDictionaryEntryDialogProps
  | CreateDictionaryEntryDialogProps
  | ViewDictionaryEntryDialogProps;

export function DictionaryEntryDialog(props: DictionaryEntryDialogProps) {
  const { dictionaryId, mode, isOpen, setIsOpen } = props;

  const {
    mutate: createDictionaryEntry,
    isPending: isCreatingDictionaryEntry,
    error: isCreatingDictionaryEntryError,
    reset: resetCreateDictionaryEntry,
  } = useCreateDictionaryEntryMutation();

  const {
    mutate: deleteDictionaryEntry,
    isPending: isDeletingDictionaryEntry,
    error: isDeletingDictionaryEntryError,
  } = useDeleteDictionaryEntryMutation();

  const { handleSubmit, register, setValue, formState, control, reset } =
    useForm<DictionaryEntryForm>({
      defaultValues:
        props.mode === 'edit' || props.mode === 'view'
          ? {
              traditional: props.entry?.traditional,
              simplified: props.entry?.simplified,
              pinyin: props.entry?.pinyin,
              definitions: props.entry?.definitions.map((d) => d.definition),
            }
          : {
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

  const onSubmit = (data: DictionaryEntryForm) => {
    switch (mode) {
      case 'create':
        return createDictionaryEntry(
          { dictionaryId, entry: data },
          {
            onSuccess: () => {
              setIsOpen(false);
            },
          }
        );
      default:
        return;
    }
  };

  useEffect(() => {
    // Add an empty entry if definitions array is empty
    if (definitions.length === 0) {
      addDefinition('');
    }
  });

  useEffect(() => {
    if ((props.mode === 'edit' || props.mode === 'view') && props.entry) {
      reset({
        traditional: props.entry.traditional,
        simplified: props.entry.simplified,
        pinyin: props.entry.pinyin,
        definitions: props.entry.definitions.map((d) => d.definition),
      });
    } else {
      reset({
        traditional: '',
        simplified: '',
        pinyin: '',
        definitions: [''],
      });
    }

    // Reset mutation on dialog open or close
    resetCreateDictionaryEntry();
  }, [
    isOpen,
    props.mode,
    (props as EditDictionaryEntryDialogProps).entry,
    reset,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? 'Add a new word'
              : mode === 'edit'
                ? `Edit word ${props.entry?.simplified}|${props.entry?.traditional}`
                : `View word ${props.entry?.simplified}|${props.entry?.traditional}`}
          </DialogTitle>
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
                  disabled={mode === 'view'}
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
              disabled={mode === 'view'}
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
              {mode !== 'view' ? (
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  onClick={() => addDefinition('')}
                >
                  <Plus />
                </Button>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto">
              {definitions.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`definitions.${index}`)}
                    placeholder={`Definition ${index + 1}`}
                    disabled={mode === 'view'}
                  />
                  {mode !== 'view' ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeDefinition(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
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
            {mode === 'view' ? (
              <Button
                variant="default"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            ) : null}
            {mode !== 'view' ? (
              <>
                <Button
                  variant="default"
                  type="submit"
                  disabled={isCreatingDictionaryEntry}
                >
                  {isCreatingDictionaryEntry ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Save'
                  )}
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
              </>
            ) : null}

            {mode === 'edit' ? (
              <Button
                variant="destructive"
                type="button"
                className="ms-auto"
                onClick={() => {
                  deleteDictionaryEntry({
                    dictionaryId,
                    entryId: props.entry!.id,
                  });

                  setIsOpen(false);
                }}
                disabled={isDeletingDictionaryEntry}
              >
                {isDeletingDictionaryEntry ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Delete'
                )}
              </Button>
            ) : null}
          </div>
        </form>
        {isCreatingDictionaryEntryError ? (
          <span className="text-destructive text-xs">
            {isCreatingDictionaryEntryError.message}
          </span>
        ) : null}
        {isDeletingDictionaryEntryError ? (
          <span className="text-destructive text-xs">
            {isDeletingDictionaryEntryError.message}
          </span>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
