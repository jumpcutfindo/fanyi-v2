import { Book, BookOpen, Camera } from 'lucide-react';

import { Button } from '@renderer/components/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { useNavbarStore } from '@renderer/stores/useNavbarStore';

export function Navbar() {
  const { setNavbarState } = useNavbarStore();

  return (
    <div className="flex flex-col gap-2 border-r p-2">
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
    </div>
  );
}
