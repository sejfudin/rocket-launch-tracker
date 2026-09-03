import { clsx } from "clsx";

export interface ImageProps {
  url: string | null | undefined;
  alt?: string;
  className?: string;
  fallbackUrl?: string;
}

export const Image = ({ url, alt = "", className = "" }: ImageProps) => {
  if (!url) {
    return null;
  }

  return (
    <div
      className={clsx("relative w-full overflow-hidden rounded-m", className)}
      role="img"
      aria-label={alt}
    >
      <div
        className="h-full w-full bg-center bg-cover transition-opacity duration-300"
        style={{
          backgroundImage: `url(${url})`,
        }}
      />
    </div>
  );
};
