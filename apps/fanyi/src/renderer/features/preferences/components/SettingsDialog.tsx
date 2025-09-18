import { Settings } from 'lucide-react';

import { Button } from '@renderer/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@renderer/components/ui/Dialog';
import { Switch } from '@renderer/components/ui/Switch';
import { useGetUserPreferences } from '@renderer/features/preferences/queries/getUserPreferences.query';
import { useSetUserPreferenceMutation } from '@renderer/features/preferences/queries/setUserPreference.mutation';

function SettingsDialog() {
  const { data: preferences } = useGetUserPreferences();

  const { mutate: setPreference } = useSetUserPreferenceMutation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="text-muted-foreground size-6 rounded-full"
          variant="ghost"
          type="button"
        >
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="sr-only">Settings</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <div className="flex flex-row items-center">
            <div className="flex grow flex-col">
              <p className="text-sm">Dark mode</p>
              <span className="text-muted-foreground text-sm">
                Toggles whether dark mode is enabled
              </span>
            </div>
            <Switch
              id="darkMode"
              checked={preferences?.isDarkMode}
              onCheckedChange={(checked) =>
                setPreference({
                  key: 'isDarkMode',
                  value: checked,
                })
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SettingsDialog };
