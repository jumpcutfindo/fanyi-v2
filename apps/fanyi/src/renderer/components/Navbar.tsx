import { BookOpen, Camera, Moon, Sun } from 'lucide-react';

import { Button } from '@renderer/components/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { SettingsDialog } from '@renderer/features/preferences/components/SettingsDialog';
import { useDarkMode } from '@renderer/hooks/useDarkMode.hook';
import { useNavbarStore } from '@renderer/stores/useNavbarStore';

const buttonClassName = 'size-8 rounded-full p-2';

export function Navbar() {
  const { setNavbarState } = useNavbarStore();

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex h-full flex-col gap-2 border-r p-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={buttonClassName}
            onClick={() => setNavbarState('screenshot')}
          >
            <Camera />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Screenshot</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={buttonClassName}
            onClick={() => setNavbarState('dictionaries')}
          >
            <BookOpen />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Dictionaries</TooltipContent>
      </Tooltip>

      <div className="mt-auto flex flex-col justify-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={buttonClassName}
              onClick={() => toggleDarkMode()}
            >
              {isDarkMode ? (
                <Moon className="fill-foreground size-3.5" />
              ) : (
                <Sun className="fill-foreground size-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle theme</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <SettingsDialog />
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
