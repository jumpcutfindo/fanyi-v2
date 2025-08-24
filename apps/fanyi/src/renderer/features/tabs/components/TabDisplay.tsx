import { PreviewTabDisplay } from '@renderer/features/tabs/components/PreviewTabDisplay';
import { TranslationTabDisplay } from '@renderer/features/tabs/components/TranslationTabDisplay';
import { useTabStore } from '@renderer/stores/useTabStore';

const containerStyle =
  'flex grow h-0 items-center justify-center overflow-auto bg-black/5';

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

  const renderTabContent = () => {
    if (!activeTab) {
      return (
        <span className="text-muted-foreground text-center italic">
          No tab selected
        </span>
      );
    }

    switch (activeTab.type) {
      case 'preview':
        return <PreviewTabDisplay preset={activeTab.activePreset!} />;
      case 'translation':
        return <TranslationTabDisplay tab={activeTab} />;
      default:
        return null;
    }
  };

  return <div className={containerStyle}>{renderTabContent()}</div>;
}
