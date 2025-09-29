'use client';

import * as React from 'react';
import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/shared/lib/utils/cn';

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

interface AvatarImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  src?: string | StaticImageData | null;
  alt: string;
}

// src/shared/ui/avatar.tsx - улучшенная обработка изображений
const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt, src, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const handleError = () => {
      setImageError(true);
    };

    if (!src || imageError) {
      return null; // Показываем только fallback
    }

    return (
      <Image
        ref={ref}
        className={cn('aspect-square h-full w-full', className)}
        alt={alt}
        src={src}
        fill
        style={{ objectFit: 'cover' }}
        onError={handleError}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
