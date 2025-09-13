import icon from '/images/icon.svg';

import { useTabStore } from '@renderer/stores/useTabStore';

function Titlebar() {
  const currentTab = useTabStore((state) => state.activeTab);

  const getHelperText = () => {
    if (!currentTab) {
      return '';
    }

    if (currentTab.type === 'preview') {
      return `Preview (${currentTab.activePreset?.name})`;
    }

    if (currentTab.type === 'translation') {
      return `Translation (${currentTab.preset.name})`;
    }
  };

  return (
    <div
      className="bg-card relative flex h-9 flex-row items-center border-b px-2 text-xs"
      // @ts-expect-error Valid css property in electron
      style={{ appRegion: 'drag' }}
    >
      <img src={icon} className="size-5" />
      <span className="grow text-center">{getHelperText()}</span>
    </div>
  );
}
export { Titlebar };
