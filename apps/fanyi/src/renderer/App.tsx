import { Button } from '@renderer/components/ui/Button';
import { Label } from '@renderer/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@renderer/components/ui/Select';

function App() {
  return (
    <div className="flex h-full flex-row">
      <div className="flex w-72 flex-col gap-4 p-4">
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
        <Button variant="outline">Take Screenshot</Button>
      </div>
      <div className="h-full w-full"></div>
    </div>
  );
}

export default App;
