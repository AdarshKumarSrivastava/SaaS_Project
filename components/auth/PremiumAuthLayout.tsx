"use client";
import React from 'react';
export const PremiumAuthLayout = ({children, title, subtitle, backLink, visualUrl}: any) => (
  <div className="premium-auth-layout">
    <h1>{title}</h1>
    <p>{subtitle}</p>
    {children}
  </div>
);
