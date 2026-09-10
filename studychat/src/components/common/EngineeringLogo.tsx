import React from 'react';
import { ENGIHUB_LOGO_DATA_URI } from '../../assets/logoDataUri';

interface EngineeringLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: boolean;
}

export const EngineeringLogo: React.FC<EngineeringLogoProps> = ({
  size = 'md',
  className = '',
  rounded = true,
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${dimensions} ${className}`}
    >
      <img
        src={ENGIHUB_LOGO_DATA_URI}
        alt="ENGIHUB — All Engineering Departments Logo"
        className={`w-full h-full object-cover shadow-md transition-transform duration-200 ${
          rounded ? 'rounded-full ring-2 ring-blue-500/30' : 'rounded-xl'
        }`}
        loading="eager"
      />
    </div>
  );
};

export default EngineeringLogo;
