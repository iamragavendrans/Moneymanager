import React, { useState, useEffect } from 'react';
import { cn } from '../utils';
import { CATEGORY_ICON_MAP } from '../utils/categories';
import { IconifyIcon } from './IconifyIcon';

interface CategoryIconProps {
  icon: string;
  color?: string;
  size?: number;
  className?: string;
  withContainer?: boolean;
  onClick?: () => void;
}

/**
 * Elite Category Icon Engine v2
 * 1. AUTO-LOCAL: Checks if a file exists in /icons/elite/ matching the icon name
 * 2. CLOUD 3D: Falls back to Fluent Emoji
 * 3. LEGACY: Falls back to emojis
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  icon, 
  color, 
  size = 24, 
  className,
  withContainer = false,
  onClick
}) => {
  const [useLocal, setUseLocal] = useState(false);
  const [localTested, setLocalTested] = useState(false);

  if (!icon) return null;

  // Extract the slug (e.g. "food" from "elite:food" or just "food")
  const slug = icon.includes(':') ? icon.split(':')[1] : icon;
  const localPath = `/icons/elite/${slug}.png`;

  // Check if local file exists (only once per icon/slug)
  useEffect(() => {
    const img = new Image();
    img.onload = () => { setUseLocal(true); setLocalTested(true); };
    img.onerror = () => { setUseLocal(false); setLocalTested(true); };
    img.src = localPath;
  }, [localPath]);

  const isIconify = icon && icon.includes(':');
  const is3D = isIconify && icon.startsWith('fluent-emoji:');

  let content;

  if (useLocal) {
    content = (
      <img 
        src={localPath} 
        alt={slug}
        className={cn("object-contain transition-all duration-500", !withContainer && className)}
        style={{ width: size, height: size }}
      />
    );
  } else if (isIconify) {
    content = (
      <div 
        className={cn(
          "inline-flex items-center justify-center transition-all duration-300", 
          is3D && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]",
          !withContainer && className
        )} 
        style={{ width: size, height: size }}
      >
        <IconifyIcon icon={icon} color={color} size={size} />
      </div>
    );
  } else {
    // Legacy / Internal Map
    const emojiIcon = CATEGORY_ICON_MAP[icon];
    if (emojiIcon && emojiIcon.includes(':')) {
       // Recursive render if the map points to an iconify icon
       return <CategoryIcon icon={emojiIcon} color={color} size={size} className={className} withContainer={withContainer} />;
    }
    content = (
      <span 
        className={cn("inline-flex items-center justify-center shrink-0", !withContainer && className)} 
        style={{ fontSize: size * 0.8, width: size, height: size }}
      >
        {emojiIcon || icon || "📦"}
      </span>
    );
  }

  if (withContainer) {
    const bgColor = color ? `${color}15` : 'rgba(99, 102, 241, 0.08)';
    return (
      <div 
        onClick={onClick}
        className={cn(
          "flex items-center justify-center rounded-2xl transition-all duration-300",
          "bg-white border border-white/50",
          onClick && "cursor-pointer active:scale-95 hover:shadow-lg hover:border-indigo-200",
          className
        )}
        style={{ 
          width: size * 2.2, 
          height: size * 2.2,
          backgroundColor: bgColor,
          boxShadow: `0 8px 32px -4px ${color || '#6366f1'}25`
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div onClick={onClick} className={cn(onClick && "cursor-pointer")}>
      {content}
    </div>
  );
};
