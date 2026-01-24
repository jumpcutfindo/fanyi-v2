import { ArrowLeft, Trash, X } from 'lucide-react';
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
import { DictionaryEntryList } from '@renderer/features/dictionary/components/DictionaryEntryList';
import { DictionaryManager } from '@renderer/features/dictionary/components/DictionaryManager';
import { useDeleteDictionaryMutation } from '@renderer/features/dictionary/queries/deleteDictionary.mutation';
import { useDictionariesSidebarStore } from '@renderer/stores/useDictionariesSidebarStore';

export function DictionaryPage() {
  const { selectedDictionary, setSelectedDictionary } =
    useDictionariesSidebarStore();

  const { mutate: deleteDictionary } = useDeleteDictionaryMutation();

  const canDeleteDictionary =
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
              <X />
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
          {canDeleteDictionary ? (
            <div className="ms-auto flex flex-row justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash />
                  </Button>
                </AlertDialogTrigger>
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
          ) : null}
        </div>
        <DictionaryEntryList />
      </div>
    </>
  );
}
