import { Book, BookOpen, Camera, Moon, Sun } from 'lucide-react';

import { Button } from '@renderer/components/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { useDarkMode } from '@renderer/hooks/useDarkMode.hook';
import { useNavbarStore } from '@renderer/stores/useNavbarStore';

export function Navbar() {
  const { setNavbarState } = useNavbarStore();

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex h-full flex-col gap-2 border-r p-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="size-8 rounded-full p-2"
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
            className="size-8 rounded-full p-2"
            onClick={() => setNavbarState('dictionaries')}
          >
            <BookOpen />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Dictionaries</TooltipContent>
      </Tooltip>

      <div className="mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-8 rounded-full p-2"
              onClick={() => toggleDarkMode()}
            >
              {isDarkMode ? (
                <Moon className="fill-foreground size-3.5" />
              ) : (
                <Sun className="text-muted-foreground fill-muted-foreground size-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle theme</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
