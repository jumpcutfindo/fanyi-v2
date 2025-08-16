import { ArrowLeft } from 'lucide-react';

import { Button } from '@renderer/components/ui/Button';

interface SidebarHeaderProps {
  title: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

export function SidebarHeader({ title, children, onBack }: SidebarHeaderProps) {
  return (
    <div className="flex h-6 flex-row items-center justify-between">
      <span className="flex h-full flex-row items-center gap-2">
        {onBack ? (
          <Button
            className="size-6 rounded-full"
            onClick={onBack}
            variant="ghost"
            type="button"
          >
            <ArrowLeft />
          </Button>
        ) : null}
        <h1 className="text-sm font-bold">{title}</h1>
      </span>
      {children}
    </div>
  );
}
