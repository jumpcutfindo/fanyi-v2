import { Loader2Icon } from 'lucide-react';
import logo from '/images/logo.svg';

import { useGetOcrStatusQuery } from '@shared/queries/getOcrStatus.query';
import { Navbar } from '@renderer/components/Navbar';
import { Titlebar } from '@renderer/components/Titlebar';
import { DictionaryPage } from '@renderer/pages/DictionaryPage';
import { ScreenshotPage } from '@renderer/pages/ScreenshotPage';
import { useNavbarStore } from '@renderer/stores/useNavbarStore';

function App() {
  const { data: ocrStatus } = useGetOcrStatusQuery();

  const { navbarState } = useNavbarStore();

  const renderApp = () => {
    if (ocrStatus === 'startup') {
      return (
        <div className="flex h-full grow flex-col items-center justify-center gap-8 text-center">
          <img src={logo} className="size-36" />
          <Loader2Icon className="animate-spin" />
          <span>Loading resources...</span>
        </div>
      );
    }

    switch (navbarState) {
      case 'screenshot':
        return <ScreenshotPage />;
      case 'dictionaries':
        return <DictionaryPage />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Titlebar />
      <div className="flex h-0 grow flex-row">
        <Navbar />
        {renderApp()}
      </div>
    </div>
  );
}

export default App;
