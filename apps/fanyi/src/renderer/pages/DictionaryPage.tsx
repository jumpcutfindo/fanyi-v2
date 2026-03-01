import { ArrowLeft, Plus, SquarePen, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DictionaryEntry } from '@shared/types/dictionary';
import { SidebarContainer } from '@renderer/components/Sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@renderer/components/ui/AlertDialog';
import { Button } from '@renderer/components/ui/Button';
import { Separator } from '@renderer/components/ui/Separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { DictionaryEntryDialog } from '@renderer/features/dictionary/components/DictionaryEntryDialog';
import { DictionaryEntryList } from '@renderer/features/dictionary/components/DictionaryEntryList';
import { DictionaryFormDialog } from '@renderer/features/dictionary/components/DictionaryFormDialog';
import { DictionaryManager } from '@renderer/features/dictionary/components/DictionaryManager';
import { useDeleteDictionaryMutation } from '@renderer/features/dictionary/queries/deleteDictionary.mutation';
import { useDictionariesStore } from '@renderer/stores/useDictionariesStore';

export function DictionaryPage() {
  const { selectedDictionary, setSelectedDictionary } = useDictionariesStore();

  const { mutate: deleteDictionary } = useDeleteDictionaryMutation();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [entryDialogState, setEntryDialogState] = useState<{
    isOpen: boolean;
    entry?: DictionaryEntry;
    mode: 'create' | 'edit' | 'view';
  }>({
    isOpen: false,
    mode: 'create',
    entry: undefined,
  });

  const canModifyDictionary =
    selectedDictionary !== null && selectedDictionary.type !== 'system';

  const handleDelete = () => {
    if (selectedDictionary) {
      deleteDictionary(selectedDictionary.id, {
        onSuccess: () => {
          toast.success('Dictionary deleted!');
          setSelectedDictionary(null);
        },
      });
    }
  };

  // Handle 'Esc' key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedDictionary) {
        setSelectedDictionary(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setSelectedDictionary]);

  return (
    <>
      <SidebarContainer className="min-w-70">
        <DictionaryManager />
      </SidebarContainer>
      <div className="flex w-full flex-col gap-4">
        <div className="mx-4 mt-4 flex h-6 flex-row items-center gap-2">
          {selectedDictionary ? (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setSelectedDictionary(null)}
            >
              <ArrowLeft />
            </Button>
          ) : null}
          <span className="text-sm">
            Selected:{' '}
            <span className="font-semibold">
              {selectedDictionary
                ? selectedDictionary.name
                : 'All dictionaries'}
            </span>
          </span>
          {canModifyDictionary ? (
            <>
              <div className="ms-auto flex flex-row justify-end gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setEntryDialogState({
                          isOpen: true,
                          mode: 'create',
                          entry: undefined,
                        })
                      }
                    >
                      <Plus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add a new word</TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditDialogOpen(true)}
                    >
                      <SquarePen />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit dictionary information</TooltipContent>
                </Tooltip>
                <AlertDialog>
                  <Tooltip>
                    <AlertDialogTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash />
                        </Button>
                      </TooltipTrigger>
                    </AlertDialogTrigger>
                    <TooltipContent>Delete dictionary</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete dictionary &quot;{selectedDictionary.name}&quot;?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this dictionary? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <DictionaryFormDialog
                mode="edit"
                open={isEditDialogOpen}
                setOpen={setIsEditDialogOpen}
                initialState={selectedDictionary}
              />
            </>
          ) : null}
        </div>
        <DictionaryEntryList
          handleSelectEntry={(entry) => {
            setEntryDialogState({
              mode: canModifyDictionary ? 'edit' : 'view',
              isOpen: true,
              entry,
            });
          }}
        />
      </div>

      <DictionaryEntryDialog
        isOpen={entryDialogState.isOpen}
        setIsOpen={(isOpen) => {
          setEntryDialogState((prev) => ({
            ...prev,
            isOpen,
          }));
        }}
        mode={entryDialogState.mode}
        dictionaryId={selectedDictionary?.id ?? ''}
        entry={entryDialogState.entry}
      />
    </>
  );
}
