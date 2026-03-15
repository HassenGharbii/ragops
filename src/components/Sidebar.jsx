import React from 'react';
import {
  LayoutDashboard, Droplet, Truck, Shield, Lock, ShoppingBag,
  Users, Settings, AlertTriangle, FileQuestion, Home, Siren,
  UserCog, ClipboardList
} from 'lucide-react';

const MENU = [
  { id: 'overview',    label: 'الرؤية الشاملة',              icon: LayoutDashboard },
  { id: 'drugs',       label: 'جرائم المخدرات',              icon: Droplet },
  { id: 'traffic',     label: 'أحداث مرورية',                icon: Truck },
  { id: 'border',      label: 'أمن الحدود',                  icon: Shield },
  { id: 'theft',       label: 'جرائم السرقات',               icon: Lock },
  { id: 'economic',    label: 'الجرائم الاقتصادية',          icon: ShoppingBag },
  { id: 'official',    label: 'الأنشطة الرسمية',             icon: Users },
  { id: 'property',    label: 'الاعتداء على الأملاك',        icon: Home },
  { id: 'regulatory',  label: 'أحداث التراتيب',              icon: ClipboardList },
  { id: 'terrorism',   label: 'أحداث إرهابية',               icon: Siren },
  { id: 'security',    label: 'أعوان الأمن',                 icon: UserCog },
  { id: 'unclassified',label: 'غير مصنف',                    icon: FileQuestion },
];

const Sidebar = ({ activeTab, onTabChange, categoryCounts = {} }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '28px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
          }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1 }}>سمارت</span>
            <span style={{ color: '#a5b4fc', fontWeight: 800, fontSize: 16 }}>OPS</span>
            <p style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>لوحة الاستخبارات الأمنية</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '8px 10px 4px', textTransform: 'uppercase' }}>القائمة الرئيسية</p>
        {MENU.map(item => {
          const active = activeTab === item.id;
          const count = categoryCounts[item.id];
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                border: 'none', marginBottom: 2,
                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: active ? '#a5b4fc' : '#64748b',
                fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 700 : 500,
                transition: 'all 0.18s', textAlign: 'right',
                position: 'relative'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
            >
              {active && <div style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: 20, background: '#6366f1', borderRadius: '0 3px 3px 0'
              }} />}
              <item.icon size={17} strokeWidth={1.8} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {count != null && (
                <span style={{
                  background: active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                  color: active ? '#c7d2fe' : '#64748b',
                  fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '1px 7px'
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
          background: 'rgba(245,158,11,0.1)', borderRadius: 10, marginBottom: 6
        }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <div>
            <p style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>مستوى التهديد</p>
            <p style={{ color: '#fde68a', fontSize: 10 }}>يقظة مرتفعة</p>
          </div>
        </div>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 10, border: 'none',
          background: 'transparent', color: '#475569',
          fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', textAlign: 'right'
        }}>
          <Settings size={16} strokeWidth={1.8} />
          الإعدادات
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
