import React from 'react';

const COLORS = {
  indigo: { bg: '#e0e7ff', text: '#4f46e5', icon: '#6366f1' },
  emerald: { bg: '#d1fae5', text: '#065f46', icon: '#10b981' },
  amber: { bg: '#fef3c7', text: '#92400e', icon: '#f59e0b' },
  rose: { bg: '#ffe4e6', text: '#9f1239', icon: '#f43f5e' },
  violet: { bg: '#ede9fe', text: '#5b21b6', icon: '#8b5cf6' },
  sky: { bg: '#e0f2fe', text: '#0369a1', icon: '#0ea5e9' },
};

const TrendBadge = ({ value }) => {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span className={`badge ${up ? 'badge-up' : 'badge-down'}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        {up
          ? <path d="M5 1 L9 9 L1 9 Z" fill="currentColor" />
          : <path d="M5 9 L9 1 L1 1 Z" fill="currentColor" />}
      </svg>
      {Math.abs(value)}%
    </span>
  );
};

const StatsCard = ({ title, value, subtext, icon: Icon, trend, color = 'indigo' }) => {
  const c = COLORS[color] || COLORS.indigo;

  return (
    <div className="stat-card fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="icon-box" style={{ background: c.bg }}>
          {Icon && <Icon size={22} color={c.icon} strokeWidth={1.8} />}
        </div>
        <TrendBadge value={trend} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, marginBottom: 6 }}>{title}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{value}</p>
        {subtext && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{subtext}</p>}
      </div>
    </div>
  );
};

export { COLORS, TrendBadge };
export default StatsCard;
