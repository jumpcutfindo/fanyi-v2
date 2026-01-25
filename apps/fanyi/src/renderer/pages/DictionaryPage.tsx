import { ArrowLeft, SquarePen, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { DictionaryEntryList } from '@renderer/features/dictionary/components/DictionaryEntryList';
import { DictionaryFormDialog } from '@renderer/features/dictionary/components/DictionaryFormDialog';
import { DictionaryManager } from '@renderer/features/dictionary/components/DictionaryManager';
import { useDeleteDictionaryMutation } from '@renderer/features/dictionary/queries/deleteDictionary.mutation';
import { useDictionariesStore } from '@renderer/stores/useDictionariesStore';

export function DictionaryPage() {
  const { selectedDictionary, setSelectedDictionary } = useDictionariesStore();

  const { mutate: deleteDictionary } = useDeleteDictionaryMutation();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      <div className="flex w-full flex-col gap-4 p-4">
        <div className="flex h-6 flex-row items-center gap-2">
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
        <DictionaryEntryList />
      </div>
    </>
  );
}
