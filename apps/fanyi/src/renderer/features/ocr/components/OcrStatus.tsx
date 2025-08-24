import { useGetOcrStatusQuery } from '@renderer/features/ocr/queries/getOcrStatus.query';
import { cn } from '@renderer/lib/utils';

export function OcrStatus() {
  const { data: ocrStatus } = useGetOcrStatusQuery();

  const getIndicatorClass = () => {
    switch (ocrStatus) {
      case 'startup':
      case 'shutdown':
        return 'bg-yellow-500';
      case 'available':
        return 'bg-green-500';
      case 'unavailable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getText = () => {
    switch (ocrStatus) {
      case 'startup':
        return 'Starting...';
      case 'shutdown':
        return 'Shutting down...';
      case 'available':
        return 'Available';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex flex-row items-center gap-2 text-xs">
      <div className={cn('size-2 rounded-full', getIndicatorClass())} /> OCR{' '}
      {getText()}
    </div>
  );
}
