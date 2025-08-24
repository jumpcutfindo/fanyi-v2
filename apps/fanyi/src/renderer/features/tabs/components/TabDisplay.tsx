import { PreviewTabDisplay } from '@renderer/features/tabs/components/PreviewTabDisplay';
import { TranslationTabDisplay } from '@renderer/features/tabs/components/TranslationTabDisplay';
import { useTabStore } from '@renderer/stores/useTabStore';

const containerStyle = 'flex grow items-center justify-center';

export function TabDisplay() {
  const activeTab = useTabStore((state) => state.activeTab);
  const previewTab = useTabStore((state) => state.previewTab);

  if (!activeTab) {
    return (
      <div className={containerStyle}>
        <span className="text-muted-foreground text-center italic">
          No tab selected
        </span>
      </div>
    );
  }

  if (activeTab.type === 'preview' && previewTab) {
    if (!previewTab.activePreset) return null;

    return <PreviewTabDisplay preset={previewTab.activePreset} />;
  } else if (activeTab.type === 'translation') {
    return <TranslationTabDisplay tab={activeTab} />;
  }

  return (
    <div className={containerStyle}>
      {activeTab.title} ({activeTab.id}) selected
    </div>
  );
}
