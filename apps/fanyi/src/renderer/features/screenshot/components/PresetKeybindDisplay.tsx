interface PresetKeybindDisplayProps {
  keybind?: string;
}

export function PresetKeybindDisplay({ keybind }: PresetKeybindDisplayProps) {
  if (!keybind) return null;

  const keys = keybind.split(' + ').map((k) => {
    if (k === 'Meta') {
      return '⌘';
    }

    return k;
  });

  return (
    <span className="flex flex-row gap-1">
      {keys.map((k) => (
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
