import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '../utils';

interface IconifyIconProps {
  icon: string;
  className?: string;
  color?: string;
  size?: number;
}

/**
 * Optimized icon renderer using the official Iconify library.
 * Preserves 3D colors and handles cloud loading automatically.
 */
export const IconifyIcon: React.FC<IconifyIconProps> = ({ 
  icon, 
  className, 
  color, 
  size = 24 
}) => {
  return (
    <div 
      className={cn("inline-flex items-center justify-center shrink-0 transition-transform duration-300", className)}
      style={{ width: size, height: size }}
    >
      <Icon 
        icon={icon} 
        width={size} 
        height={size} 
        color={color} // Only applies to monochrome icons; 3D icons stay colorful
      />
    </div>
  );
};
