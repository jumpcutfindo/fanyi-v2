import { SiGithub } from '@icons-pack/react-simple-icons';
import { Settings } from 'lucide-react';

import { useGetAppVersionQuery } from '@shared/queries/getAppVersion.query';
import { useGetUserPreferences } from '@shared/queries/getUserPreferences.query';
import { useOpenExternalLinkMutation } from '@shared/queries/openExternalLink.mutation';
import { useSetUserPreferenceMutation } from '@shared/queries/setUserPreference.mutation';
import { OcrStatus } from '@renderer/components/OcrStatus';
import { Button } from '@renderer/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@renderer/components/ui/Dialog';
import { Separator } from '@renderer/components/ui/Separator';
import { Switch } from '@renderer/components/ui/Switch';

function SettingsDialog() {
  const { data: preferences } = useGetUserPreferences();
  const { data: appVersion } = useGetAppVersionQuery();

  const { mutate: setPreference } = useSetUserPreferenceMutation();
  const { mutate: openExternalLink } = useOpenExternalLinkMutation();

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
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-2">
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
          <div className="flex flex-row items-center gap-2">
            <div className="flex grow flex-col">
              <p className="text-sm">Wrap tabs</p>
              <span className="text-muted-foreground text-sm">
                Wraps the tabs if the tabs exceeds the screen width. Otherwise,
                the tabs are scrollable.
              </span>
            </div>
            <Switch
              id="darkMode"
              checked={preferences?.isWrapTabs}
              onCheckedChange={(checked) =>
                setPreference({
                  key: 'isWrapTabs',
                  value: checked,
                })
              }
            />
          </div>
        </div>
        <Separator />
        <div className="flex flex-row items-center gap-2">
          <OcrStatus />
          <span className="text-muted-foreground ms-auto text-xs">
            {appVersion ? `Fanyi ${appVersion}` : 'Fanyi'}
          </span>
          <Button
            variant="link"
            className="group size-4"
            onClick={() =>
              openExternalLink('https://github.com/jumpcutfindo/fanyi-v2')
            }
          >
            <SiGithub className="fill-muted-foreground group-hover:fill-accent" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SettingsDialog };
