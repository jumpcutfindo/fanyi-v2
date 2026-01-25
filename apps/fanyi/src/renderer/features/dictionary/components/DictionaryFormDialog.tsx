import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@renderer/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@renderer/components/ui/Dialog';
import { Input } from '@renderer/components/ui/Input';
import { Label } from '@renderer/components/ui/Label';
import { useCreateDictionaryMutation } from '@renderer/features/dictionary/queries/createDictionary.mutation';
import { useUpdateDictionaryMutation } from '@renderer/features/dictionary/queries/updateDictionary.mutation';
import { useDictionariesStore } from '@renderer/stores/useDictionariesStore';

interface DictionaryForm {
  name: string;
  url?: string;
}

interface DictionaryFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: 'create' | 'edit';

  initialState?: DictionaryForm & { id: string };
}

export function DictionaryFormDialog({
  open,
  setOpen,
  mode,
  initialState,
}: DictionaryFormDialogProps) {
  const { selectedDictionary, setSelectedDictionary } = useDictionariesStore();

  const { mutate: createDictionary } = useCreateDictionaryMutation();
  const { mutate: updateDictionary } = useUpdateDictionaryMutation();

  const { register, handleSubmit, reset, formState } = useForm<DictionaryForm>({
    defaultValues: initialState,
  });

  const handleClose = () => {
    if (mode === 'create') {
      reset();
    }

    setOpen(false);
  };

  const onSubmit = (data: DictionaryForm) => {
    switch (mode) {
      case 'create':
        return createDictionary(data, {
          onSuccess: () => {
            handleClose();
            toast.success('Dictionary created!');
          },
        });
      case 'edit':
        if (!initialState) {
          return;
        }

        return updateDictionary(
          { ...data, id: initialState.id },
          {
            onSuccess: (newDictionary) => {
              handleClose();
              toast.success('Dictionary updated!');

              if (selectedDictionary?.id === initialState.id) {
                setSelectedDictionary(newDictionary);
              }
            },
          }
        );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }

        setOpen(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          {mode === 'create' ? 'Create new dictionary' : 'Edit dictionary'}
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Name<span className="text-destructive">*</span>
            </Label>
            <Input type="text" {...register('name', { required: true })} />
            {formState.errors.name ? (
              <span className="text-destructive text-xs">
                Please provide a name for this dictionary
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">URL</Label>
            <Input type="text" {...register('url')} />
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="default" type="submit">
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
