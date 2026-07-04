type LogoMarkProps = {
  className?: string;
  alt?: string;
};

export default function LogoMark({ className = "h-10 w-10", alt = "SafeReach logo" }: LogoMarkProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`${className} rounded-xl object-cover shrink-0`}
    />
  );
}
