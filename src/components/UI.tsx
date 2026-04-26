import React from 'react';
import type { ReactNode } from 'react';

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const Button = ({ children, className = "", variant, size, ...props }: { children: ReactNode; className?: string; variant?: string; size?: string; [key: string]: any }) => (
  <button
    className={`px-4 py-2 rounded-xl border font-medium transition-all ${
      variant === "outline"
        ? "bg-white text-black border-gray-300 hover:bg-gray-50"
        : "bg-black text-white border-black hover:bg-gray-900"
    } ${
      size === "lg" ? "px-6 py-3 text-lg" : ""
    } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const Input = ({ className = "", ...props }: { className?: string; [key: string]: any }) => (
  <input
    className={`w-full border border-gray-300 bg-white text-black placeholder-gray-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${className}`}
    {...props}
  />
);

export const Select = ({ value, onValueChange, children }: { value: any; onValueChange: (val: string) => void; children: ReactNode }) => {
  const items = React.Children.toArray(children)
    .flatMap((child: any) => child?.props?.children || [])
    .filter(Boolean);

  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
    >
      {items}
    </select>
  );
};

export const SelectTrigger = ({ children }: { children: ReactNode }) => <>{children}</>;
export const SelectValue = ({ placeholder }: { placeholder: string }) => <option value="">{placeholder}</option>;
export const SelectContent = ({ children }: { children: ReactNode }) => <>{children}</>;
export const SelectItem = ({ value, children }: { value: string; children: ReactNode }) => <option value={value}>{children}</option>;
