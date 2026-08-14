"use client";
import React from 'react';

interface PremiumInputProps {
  label?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  [key: string]: any;
}

export const PremiumInput = ({ label, ...props }: PremiumInputProps) => (
  <div className="premium-input-wrapper">
    {label && <label>{label}</label>}
    <input className="border p-2" {...props} />
  </div>
);
