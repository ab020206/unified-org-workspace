import React from 'react';
import { BarChart3, CheckCircle2, User, Zap, Key, Ticket, Search, Package, Tag } from 'lucide-react';

interface Props {
  title: string;
  value: number;
  icon: React.ReactNode | string;
  gradient: string;
  subtitle?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, icon, gradient, subtitle, onClick }: Props) {
  const renderIcon = () => {
    if (typeof icon !== 'string') return icon;
    switch (icon) {
      case '📊': return <BarChart3 className="w-5 h-5" />;
      case '🟢': return <CheckCircle2 className="w-5 h-5" />;
      case '👤': return <User className="w-5 h-5" />;
      case '⚡': return <Zap className="w-5 h-5" />;
      case '🔑': return <Key className="w-5 h-5" />;
      case '🎫': return <Ticket className="w-5 h-5" />;
      case '🔍': return <Search className="w-5 h-5" />;
      case '📦': return <Package className="w-5 h-5" />;
      case '🏷️': return <Tag className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-border p-4 bg-card shadow-2xs hover:shadow-xs transition-all duration-180 ${
        onClick ? 'cursor-pointer hover:border-primary/50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-foreground font-mono mt-1">
            {value.toLocaleString()}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${gradient}`}
        >
          {renderIcon()}
        </div>
      </div>
    </div>
  );
}
