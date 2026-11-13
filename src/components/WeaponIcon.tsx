import React from 'react';
import { WeaponId } from '../types/game';

interface WeaponIconProps {
  weaponId: WeaponId;
  className?: string;
}

export const WeaponIcon: React.FC<WeaponIconProps> = ({ weaponId, className = 'w-16 h-8' }) => {
  if (weaponId === 'fists') {
    return (
      <svg viewBox="0 0 64 32" fill="none" className={className} aria-hidden="true">
        <path
          d="M21 12C21 9.8 22.8 8 25 8H27V15H21V12ZM28 7C28 5.3 29.3 4 31 4H33V15H28V7ZM34 5C34 3.6 35.1 2.5 36.5 2.5H38.5V15H34V5ZM39.5 7C39.5 5.6 40.6 4.5 42 4.5H44V16H39.5V7ZM21 16H44V23C44 26.3 41.3 29 38 29H27C23.7 29 21 26.3 21 23V16Z"
          fill="#CBD5E1"
          stroke="#475569"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (weaponId === 'pistol') {
    return (
      <svg viewBox="0 0 80 40" fill="none" className={className} aria-hidden="true">
        {/* Slide */}
        <path d="M12 10H64V16H12V10Z" fill="#94A3B8" stroke="#334155" strokeWidth="1.2" />
        {/* Front sight & serrations */}
        <rect x="59" y="8" width="3" height="2" fill="#CBD5E1" />
        <path d="M16 11V15M19 11V15M22 11V15" stroke="#334155" strokeWidth="1" />
        {/* Frame & Barrel tip */}
        <path d="M14 16H56V20H32L27 34H17L20 20H14V16Z" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
        {/* Trigger guard */}
        <path d="M32 20H41V25H31" stroke="#64748B" strokeWidth="1.5" />
        <path d="M35 20L34 24" stroke="#CBD5E1" strokeWidth="1.2" />
      </svg>
    );
  }

  if (weaponId === 'smg') {
    return (
      <svg viewBox="0 0 96 44" fill="none" className={className} aria-hidden="true">
        {/* Folding stock */}
        <path d="M8 14H22V19H12L10 23H8V14Z" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
        {/* Receiver & shrouded barrel */}
        <rect x="22" y="12" width="42" height="10" rx="1" fill="#64748B" stroke="#1E293B" strokeWidth="1.2" />
        <rect x="64" y="14" width="22" height="5" fill="#94A3B8" stroke="#334155" strokeWidth="1" />
        {/* Sight */}
        <rect x="36" y="8" width="10" height="4" fill="#334155" />
        {/* Stick magazine */}
        <path d="M44 22H51L48 39H41L44 22Z" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
        {/* Grip */}
        <path d="M26 22H33L29 35H23L26 22Z" fill="#334155" stroke="#1E293B" strokeWidth="1.2" />
      </svg>
    );
  }

  if (weaponId === 'shotgun') {
    return (
      <svg viewBox="0 0 110 40" fill="none" className={className} aria-hidden="true">
        {/* Walnut stock */}
        <path d="M6 20L28 15V22L10 29L6 20Z" fill="#78492A" stroke="#3E2312" strokeWidth="1.2" />
        {/* Receiver */}
        <rect x="28" y="13" width="26" height="9" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
        {/* Long barrel */}
        <rect x="54" y="13" width="48" height="4" fill="#94A3B8" stroke="#334155" strokeWidth="1" />
        {/* Magazine tube */}
        <rect x="54" y="18" width="38" height="3.5" fill="#64748B" stroke="#1E293B" strokeWidth="1" />
        {/* Pump forend */}
        <rect x="60" y="17.5" width="19" height="6" rx="1" fill="#334155" stroke="#0F172A" strokeWidth="1.2" />
      </svg>
    );
  }

  // MK-18 Tactical Carbine Rifle
  return (
    <svg viewBox="0 0 116 44" fill="none" className={className} aria-hidden="true">
      {/* Buttstock */}
      <path d="M6 14H24V22H12L8 27H6V14Z" fill="#334155" stroke="#0F172A" strokeWidth="1.2" />
      {/* Receiver & railed handguard */}
      <rect x="24" y="13" width="34" height="10" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
      <rect x="58" y="14" width="26" height="7" fill="#64748B" stroke="#1E293B" strokeWidth="1.2" />
      {/* Barrel & flash hider */}
      <rect x="84" y="15.5" width="20" height="3.5" fill="#94A3B8" />
      <rect x="104" y="14.5" width="6" height="5.5" fill="#475569" />
      {/* Holographic optic */}
      <rect x="34" y="8" width="13" height="5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
      <circle cx="40.5" cy="10.5" r="1.3" fill="#EF4444" />
      {/* Curved 30rd magazine */}
      <path d="M47 23H55L58 38H50L47 23Z" fill="#64748B" stroke="#1E293B" strokeWidth="1.2" />
      {/* Pistol grip */}
      <path d="M27 23H34L30 35H24L27 23Z" fill="#334155" stroke="#0F172A" strokeWidth="1.2" />
    </svg>
  );
};
