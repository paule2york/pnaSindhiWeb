'use client';
import { useState } from 'react';
import Drawer from './Drawer';

export default function DrawerOpener() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-30 md:hidden bg-brand text-white rounded-lg px-3 py-2 shadow-lg"
        aria-label="کھولیو"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
