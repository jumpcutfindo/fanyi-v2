import { useState } from 'react';

import { Button } from '@renderer/components/ui/Button';
import { Label } from '@renderer/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@renderer/components/ui/Select';
import { ScreenshotSettings } from '@renderer/features/screenshot/components/ScreenshotSettings';

function App() {
  const [imageString, setImageString] = useState('');

  const handleScreenshot = async () => {
    const screenshotBuffer = await window.api.screenshot();

    const imageB64 = btoa(
      new Uint8Array(screenshotBuffer).reduce(function (data, byte) {
        return data + String.fromCharCode(byte);
      }, '')
    );

    setImageString(imageB64);
  };

  const handleOcr = async () => {
    const ocrResult = await window.api.performOcr();

    console.log(ocrResult);
  };

  return (
    <div className="flex h-full flex-row">
      <div className="flex w-72 flex-col gap-4 p-4">
        <ScreenshotSettings />
        <div className="flex flex-col gap-2">
          <Label>Presets</Label>
          <Select>
            <SelectTrigger className="w-full">Trigger</SelectTrigger>
            <SelectContent>
              <SelectItem value="item-1">Item 1</SelectItem>
              <SelectItem value="item-1">Item 2</SelectItem>
              <SelectItem value="item-1">Item 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleScreenshot}>
          Take Screenshot
        </Button>
        <Button variant="outline" onClick={handleOcr}>
          Take OCR
        </Button>
      </div>
      <div className="h-full w-full">
        {imageString ? (
          <img src={`data:image/png;base64,${imageString}`} alt="Captured" />
        ) : null}
      </div>
    </div>
  );
}

export default App;
