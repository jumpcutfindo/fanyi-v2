import { getSystemOsQuery } from '@renderer/features/system/queries/getSystemOs.query';
import { cn } from '@renderer/lib/utils';
import { useTabStore } from '@renderer/stores/useTabStore';

import icon from '/images/icon.svg';

function Titlebar() {
  const currentTab = useTabStore((state) => state.activeTab);

  const { data: systemOs } = getSystemOsQuery();

  const getHelperText = () => {
    if (!currentTab) {
      return 'Fanyi';
    }

    if (currentTab.type === 'preview') {
      return `Preview (${currentTab.activePreset?.name})`;
    }

    if (currentTab.type === 'translation') {
      return `Translation (${currentTab.preset.name})`;
    }
  };

  const isMacintosh = systemOs === 'darwin';

  return (
    <div
      className={cn(
        'bg-card relative flex h-9 flex-row items-center border-b px-2 text-xs',
        isMacintosh ? 'flex-row-reverse' : 'flex-row'
      )}
      // @ts-expect-error Valid css property in electron
      style={{ appRegion: 'drag' }}
    >
      <img src={icon} className="size-5" />
      <span className="grow text-center">{getHelperText()}</span>
    </div>
  );
}
export { Titlebar };
