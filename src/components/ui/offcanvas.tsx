"use client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface OffcanvasProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Offcanvas({ open, onClose, title, children }: OffcanvasProps) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      // Next frame baru animate ke 0, biar transisi ke-trigger
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    } else {
      setAnimate(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`relative w-80 h-full glass backdrop-blur-xl border-l border-white/5 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${animate ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 text-sm text-zinc-300 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function FloatingGuideButton({ onClick, open }: { onClick: () => void; open: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`fixed right-4 bottom-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-105 ${open ? "bg-slate-700 hover:bg-slate-600 rotate-90" : "bg-blue-600 hover:bg-blue-700"}`}
      aria-label={open ? "Tutup panduan" : "Buka panduan"}
    >
      {open ? <X className="w-5 h-5 transition-transform duration-300" /> : <span className="text-lg transition-transform duration-300">?</span>}
    </button>
  );
}
