'use client';

import * as React from 'react';
import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/shared/lib/cn';

// Добавляем fallback изображение (можно создать или использовать data URL)
const DEFAULT_AVATAR = '/images/avatar-placeholder.png';

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

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt, src, ...props }, ref) => {
    // Используем fallback если src не предоставлен
    const imageSrc = src || DEFAULT_AVATAR;

    return (
      <Image
        ref={ref}
        className={cn('aspect-square h-full w-full', className)}
        alt={alt}
        src={imageSrc}
        fill
        style={{ objectFit: 'cover' }}
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
