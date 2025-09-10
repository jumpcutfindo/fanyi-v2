interface PresetKeybindDisplayProps {
  keybind?: string;
}

export function PresetKeybindDisplay({ keybind }: PresetKeybindDisplayProps) {
  if (!keybind) return null;

  return (
    <span className="flex flex-row gap-1">
      {keybind.split(' + ').map((k) => (
        <span
          key={`${k}`}
          className="border-muted-foreground text-muted-foreground rounded-sm border px-1 text-xs"
        >
          {k}
        </span>
      ))}
    </span>
  );
}
