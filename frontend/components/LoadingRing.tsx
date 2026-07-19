'use client';

type LoadingRingProps = {
  size?: 'sm' | 'md' | 'lg';
};

export default function LoadingRing({ size = 'md' }: LoadingRingProps) {
  const sizeClass = size === 'lg' ? 'safe-loading-lg' : size === 'sm' ? 'safe-loading-sm' : 'safe-loading-md';
  return (
    <div className="safe-loading-center" role="status" aria-label="Loading">
      <div className={`safe-loading-ring ${sizeClass}`}>
        <img src="/logo.png" alt="" className="safe-loading-logo" />
      </div>
    </div>
  );
}
