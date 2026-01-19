import icon from '/images/icon.svg';

import { useGetSystemOsQuery } from '@renderer/features/system/queries/getSystemOs.query';
import { cn } from '@renderer/lib/utils';
import { useNavbarStore } from '@renderer/stores/useNavbarStore';
import { useTabStore } from '@renderer/stores/useTabStore';

function Titlebar() {
  const currentPage = useNavbarStore((state) => state.navbarState);
  const currentTab = useTabStore((state) => state.activeTab);

  const { data: systemOs } = useGetSystemOsQuery();

  const getHelperText = () => {
    switch (currentPage) {
      case 'screenshot': {
        if (!currentTab) {
          return 'Screenshot';
        }

        switch (currentTab.type) {
          case 'translation':
            return `Translation (${currentTab.preset.name})`;
          case 'preview':
            return `Preview (${currentTab.activePreset?.name})`;
        }

        break;
      }
      case 'dictionaries':
        return 'Dictionaries';
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
