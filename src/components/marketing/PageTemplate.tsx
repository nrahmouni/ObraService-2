import React from 'react';
import { motion } from 'motion/react';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: string;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({ title, subtitle, children, accent = "#FF6600" }) => {
  return (
    <div className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">ObraService Professional</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
