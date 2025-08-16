import { ArrowLeft } from 'lucide-react';

import { Button } from '@renderer/components/ui/Button';

type SidebarContainerProps = React.ComponentPropsWithRef<'div'>;

export function SidebarContainer({ children }: SidebarContainerProps) {
  return <div className="flex w-full flex-col gap-4">{children}</div>;
}

type SidebarContentProps = React.ComponentPropsWithRef<'div'>;

export function SidebarContent({ children }: SidebarContentProps) {
  return <div className="flex w-full flex-col gap-2">{children}</div>;
}

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
