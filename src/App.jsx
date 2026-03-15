import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Overview from './components/Overview'
import CategoryDashboard from './components/CategoryDashboard'
import { useEventData } from './hooks/useEventData'
import { Search, Bell } from 'lucide-react'
import './App.css'

const TAB_NAMES = {
  overview: 'الرؤية العملياتية الشاملة',
  drugs:    'تحليل جرائم المخدرات',
  traffic:  'تقرير الحوادث المرورية',
  border:   'منظومة أمن الحدود',
  theft:    'متابعة جرائم السرقات',
  economic: 'الجرائم الاقتصادية والمالية',
  official: 'الأنشطة الرسمية والتظاهرات',
};

const CAT_MAP = {
  drugs:    'جرائم المخدرات',
  traffic:  'أحداث مرورية',
  border:   'أمن الحدود',
  theft:    'جرائم السرقات',
  economic: 'جرائم اقتصادية ومالية',
  official: 'الأنشطة الرسمية والتظاهرات',
};

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const stats = useEventData()

  // Build sidebar counts by tab id
  const sidebarCounts = Object.fromEntries(
    Object.entries(CAT_MAP).map(([id, cat]) => [id, stats.categoryCounts[cat] ?? 0])
  );

  const activeCategory = CAT_MAP[activeTab];
  const categoryData = activeTab !== 'overview'
    ? stats.events.filter(e => e.category === activeCategory)
    : [];

  return (
    <div dir="rtl" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Main content — occupies remaining grid space */}
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0 // Prevent flex blowout
      }}>
        {/* Top Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(244,246,251,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 32px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
              {TAB_NAMES[activeTab]}
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
              مصفوفة الاستخبارات الأمنية · {new Date().toLocaleDateString('ar-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Live badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              background: 'var(--surface)', borderRadius: 10,
              border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-2)', fontWeight: 600
            }}>
              <span className="pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              تغذية مباشرة
            </div>
            {/* Notification bell */}
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={17} color="var(--text-2)" />
            </div>
            {/* User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>م</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>المشرف</p>
                <p style={{ fontSize: 10, color: 'var(--text-3)' }}>مشرف النظام</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {stats.loading && stats.events.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e0e7ff', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--text-3)', fontSize: 14 }}>جارٍ تحميل البيانات...</p>
            </div>
          ) : stats.error && stats.events.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
              <p style={{ color: '#f43f5e', fontWeight: 700, fontSize: 16 }}>تعذّر الاتصال بالخادم</p>
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>{stats.error}</p>
            </div>
          ) : activeTab === 'overview' ? (
            <Overview stats={stats} />
          ) : (
            <CategoryDashboard
              category={activeCategory}
              data={categoryData}
              onBack={() => setActiveTab('overview')}
            />
          )}
        </div>
      </main>

      {/* Fixed Sidebar — placed in the 2nd grid column (right side in RTL) */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} categoryCounts={sidebarCounts} />
    </div>
  )
}

export default App
