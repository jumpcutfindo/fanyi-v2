import { ArrowLeft } from 'lucide-react';

import { Button } from '@renderer/components/ui/Button';
import { cn } from '@renderer/lib/utils';

type SidebarContainerProps = React.ComponentProps<'div'>;

export function SidebarContainer({
  children,
  className,
  ...props
}: SidebarContainerProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col gap-4 overflow-y-auto border-r',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type SidebarContentProps = React.ComponentProps<'div'>;

export function SidebarContent({
  children,
  className,
  ...props
}: SidebarContentProps) {
  return (
    <div
      className={cn(
        'flex w-full grow flex-col gap-2 overflow-y-auto px-4 pb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarHeaderProps {
  title: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

export function SidebarHeader({ title, children, onBack }: SidebarHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between px-4 pt-4">
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

export function SidebarFooter({
  children,
  className,
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('bg-card sticky bottom-0 flex border-t p-4', className)}>
      {children}
    </div>
  );
}
