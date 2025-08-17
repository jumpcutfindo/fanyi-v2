import { useTabStore } from '@renderer/stores/useTabStore';

const containerStyle = 'flex grow items-center justify-center';

export function TabDisplay() {
  const activeTab = useTabStore((state) => state.activeTab);

  if (!activeTab) {
    return (
      <div className={containerStyle}>
        <span className="text-muted-foreground text-center italic">
          No tab selected
        </span>
      </div>
    );
  }

  return (
    <div className={containerStyle}>
      {activeTab.title} ({activeTab.id}) selected
    </div>
  );
}
