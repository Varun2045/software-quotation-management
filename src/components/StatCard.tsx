import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'violet';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 text-blue-600 border-blue-100',
    iconBg: 'bg-blue-600 text-white',
    trend: 'text-blue-600',
  },
  indigo: {
    bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
    trend: 'text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
    trend: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50 text-amber-600 border-amber-100',
    iconBg: 'bg-amber-600 text-white',
    trend: 'text-amber-600',
  },
  violet: {
    bg: 'bg-violet-50 text-violet-600 border-violet-100',
    iconBg: 'bg-violet-600 text-white',
    trend: 'text-violet-600',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            {value}
          </p>
        </div>
        <div className={`p-3.5 rounded-xl shadow-sm ${styles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
          {trend && (
            <span className={`font-semibold ${styles.trend}`}>
              {trend.value}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
