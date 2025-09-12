import { useTabStore } from '@renderer/stores/useTabStore';

function Titlebar() {
  const currentTab = useTabStore((state) => state.activeTab);

  return (
    <div
      className="bg-card relative flex h-9 flex-row items-center border-b px-4 text-xs"
      // @ts-expect-error Valid css property in electron
      style={{ appRegion: 'drag' }}
    >
      <span>Fanyi {currentTab ? `(${currentTab.title})` : null}</span>
    </div>
  );
}
export { Titlebar };
