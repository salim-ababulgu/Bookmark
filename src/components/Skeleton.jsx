import React from 'react';

// Composant Skeleton de base
export const Skeleton = ({
  className = '',
  width,
  height,
  rounded = 'rounded-md',
  animate = true,
  variant = 'default' // 'default', 'shimmer', 'wave'
}) => {
  const getAnimationClass = () => {
    if (!animate) return '';

    switch (variant) {
      case 'shimmer':
        return 'skeleton-shimmer';
      case 'wave':
        return 'skeleton-wave';
      default:
        return 'animate-pulse bg-muted/50';
    }
  };

  return (
    <div
      className={`
        ${variant === 'default' ? 'bg-muted/50' : ''}
        ${rounded}
        ${getAnimationClass()}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

// Skeleton pour ligne de texte
export const SkeletonText = ({
  lines = 1,
  className = '',
  lastLineWidth = '75%'
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
};

// Skeleton pour avatar/image
export const SkeletonAvatar = ({
  size = 'w-10 h-10',
  className = ''
}) => {
  return (
    <Skeleton
      className={`${size} ${className}`}
      rounded="rounded-full"
    />
  );
};

// Skeleton pour bouton
export const SkeletonButton = ({
  className = '',
  width = 'w-20'
}) => {
  return (
    <Skeleton
      className={`h-8 ${width} ${className}`}
      rounded="rounded-md"
    />
  );
};

// Skeleton pour carte de favori
export const BookmarkCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col h-full ${className}`}>
      {/* Image skeleton */}
      <div className="relative aspect-video bg-muted flex items-center justify-center">
        <Skeleton className="w-full h-full" rounded="rounded-none" />
        {/* Favicon skeleton */}
        <div className="absolute top-2 left-2 p-1 bg-background/80 rounded-md backdrop-blur-sm">
          <Skeleton className="w-5 h-5" rounded="rounded-sm" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Title */}
        <SkeletonText lines={2} lastLineWidth="60%" />

        {/* Description */}
        <SkeletonText lines={2} className="text-sm" lastLineWidth="80%" />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <Skeleton className="h-6 w-12" rounded="rounded-full" />
          <Skeleton className="h-6 w-16" rounded="rounded-full" />
          <Skeleton className="h-6 w-10" rounded="rounded-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6" rounded="rounded-full" />
            <Skeleton className="w-6 h-6" rounded="rounded-full" />
            <Skeleton className="w-6 h-6" rounded="rounded-full" />
            <Skeleton className="w-6 h-6" rounded="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton pour élément de liste de favoris
export const BookmarkListSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 flex items-center gap-4 ${className}`}>
      {/* Favicon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
        <Skeleton className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <SkeletonText lines={1} className="mb-1" />
        <SkeletonText lines={1} className="text-sm" lastLineWidth="70%" />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Skeleton className="h-5 w-12" rounded="rounded-full" />
          <Skeleton className="h-5 w-16" rounded="rounded-full" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8" rounded="rounded-full" />
        <Skeleton className="w-8 h-8" rounded="rounded-full" />
      </div>
    </div>
  );
};

// Skeleton pour tableau de bord
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="w-8 h-8" rounded="rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent bookmarks */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookmarkCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton pour modal
export const ModalSkeleton = () => {
  return (
    <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Form fields */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}

        {/* Description field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-6 border-t border-border">
        <SkeletonButton width="flex-1" />
        <SkeletonButton width="flex-1" />
      </div>
    </div>
  );
};

export default Skeleton;