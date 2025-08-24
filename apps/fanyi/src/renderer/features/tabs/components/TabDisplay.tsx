import { PreviewTabContent } from '@renderer/features/screenshot/components/PreviewTabContent';
import { TranslationTabContent } from '@renderer/features/translation/components/TranslationTabContent';
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
        return <PreviewTabContent preset={activeTab.activePreset!} />;
      case 'translation':
        return <TranslationTabContent tab={activeTab} />;
      default:
        return null;
    }
  };

  return <div className={containerStyle}>{renderTabContent()}</div>;
}
