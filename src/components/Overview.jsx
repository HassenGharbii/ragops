import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import {
  FileCheck, TrendingUp, DollarSign, BarChart3,
  Download, MapPin, Users, Activity, Skull, AlertTriangle,
  Calendar, Filter, X, CheckCircle2
} from 'lucide-react';
import StatsCard from './StatsCard';

// Shared chart defaults
const chartBase = {
  toolbar: { show: false },
  background: 'transparent',
  fontFamily: 'Cairo, sans-serif',
};

const PALETTE = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#14b8a6', '#ec4899'];

/* ── Filter Bar ───────────────────────────────────────────── */
const FilterBar = ({ events, filters, setFilters }) => {
  const regions = useMemo(() => {
    const seen = new Set();
    events.forEach(e => { if (e.target?.trim()) seen.add(e.target.trim()); });
    return Array.from(seen).sort();
  }, [events]);

  const categories = useMemo(() => {
    const seen = new Set();
    events.forEach(e => { if (e.category) seen.add(e.category); });
    return Array.from(seen).sort();
  }, [events]);

  const hasFilters = filters.dateFrom || filters.dateTo || filters.region || filters.category;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '12px 18px', marginBottom: 22
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', flexShrink: 0 }}>
        <Filter size={15} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>تصفية</span>
      </div>

      {/* Date From */}
      <input
        type="date"
        value={filters.dateFrom}
        onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
        style={inputStyle}
        title="من تاريخ"
      />

      {/* Date To */}
      <input
        type="date"
        value={filters.dateTo}
        onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
        style={inputStyle}
        title="إلى تاريخ"
      />

      {/* Region */}
      <select
        value={filters.region}
        onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
        style={inputStyle}
      >
        <option value="">كل الأقاليم</option>
        {regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {/* Category */}
      <select
        value={filters.category}
        onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
        style={inputStyle}
      >
        <option value="">كل الفئات</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {hasFilters && (
        <button
          onClick={() => setFilters({ dateFrom: '', dateTo: '', region: '', category: '' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 13px', borderRadius: 8, border: '1px solid #f43f5e20',
            background: '#fff1f2', color: '#f43f5e', fontSize: 12,
            fontFamily: 'Cairo', fontWeight: 700, cursor: 'pointer', marginRight: 'auto'
          }}
        >
          <X size={13} /> إعادة ضبط
        </button>
      )}

      {hasFilters && (
        <span style={{
          fontSize: 11, color: '#6366f1', fontWeight: 700,
          background: '#e0e7ff', padding: '3px 10px', borderRadius: 20
        }}>
          فلترة نشطة
        </span>
      )}
    </div>
  );
};

const inputStyle = {
  padding: '7px 12px', borderRadius: 9, border: '1px solid var(--border)',
  background: 'var(--surface-2)', fontSize: 12, fontFamily: 'Cairo',
  color: 'var(--text-2)', outline: 'none', cursor: 'pointer'
};

/* ── Anomaly Alert Banner ──────────────────────────────────── */
const AnomalyBanner = ({ peakDay, avgPerDay, filteredTotal }) => {
  if (!peakDay?.date || !avgPerDay || avgPerDay === 0) return null;
  const ratio = peakDay.count / parseFloat(avgPerDay);
  if (ratio < 2) return null;

  const dateStr = new Date(peakDay.date).toLocaleDateString('ar-TN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
      border: '1px solid #fde68a', borderRadius: 14, padding: '14px 20px', marginBottom: 22
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: '#fef3c7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <AlertTriangle size={22} color="#f59e0b" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#92400e', margin: 0 }}>
          ⚡ تحذير: نشاط غير مألوف
        </p>
        <p style={{ fontSize: 13, color: '#78350f', marginTop: 3 }}>
          يوم <strong>{dateStr}</strong> سجّل <strong>{peakDay.count} حدثاً</strong> — أي{' '}
          <strong>{ratio.toFixed(1)}×</strong> المعدل اليومي ({avgPerDay} حدث/يوم)
        </p>
      </div>
      <span style={{
        fontSize: 13, fontWeight: 800, color: '#f59e0b',
        background: '#fef3c7', padding: '6px 14px', borderRadius: 10, flexShrink: 0
      }}>
        ذروة النشاط
      </span>
    </div>
  );
};

/* ── Time Series Chart ─────────────────────────────────────── */
const TimeSeriesPanel = ({ dailyTrend, peakDay, avgPerDay }) => {
  if (!dailyTrend || dailyTrend.length < 2) return null;

  const dates = dailyTrend.map(d => d.date);
  const counts = dailyTrend.map(d => d.count);
  const peakIdx = dailyTrend.findIndex(d => d.date === peakDay?.date);

  const areaOpts = {
    chart: { ...chartBase, type: 'area', animations: { enabled: true, speed: 600 } },
    colors: ['#6366f1'],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] }
    },
    stroke: { curve: 'smooth', width: 2.5 },
    markers: { size: 3, colors: ['#6366f1'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 6 } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    xaxis: {
      categories: dates,
      labels: {
        style: { fontFamily: 'Cairo', fontSize: '10px', colors: '#94a3b8' },
        rotate: -20, rotateAlways: true,
        formatter: (val) => {
          try { return new Date(val).toLocaleDateString('ar-TN', { month: 'short', day: 'numeric' }); }
          catch { return val; }
        }
      },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { fontFamily: 'Cairo', colors: '#94a3b8' }, opposite: true }
    },
    tooltip: {
      theme: 'light',
      x: { formatter: (val) => { try { return new Date(val).toLocaleDateString('ar-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch { return val; } } },
      y: { title: { formatter: () => 'عدد الأحداث:' } }
    },
    annotations: {
      points: peakIdx >= 0 ? [{
        x: dates[peakIdx],
        y: counts[peakIdx],
        marker: { size: 8, fillColor: '#f59e0b', strokeColor: '#fff', strokeWidth: 2, radius: 2 },
        label: {
          borderColor: '#f59e0b', offsetY: 0,
          style: { color: '#fff', background: '#f59e0b', fontFamily: 'Cairo', fontSize: '11px', fontWeight: 700 },
          text: 'ذروة'
        }
      }] : [],
      yaxis: avgPerDay > 0 ? [{
        y: parseFloat(avgPerDay),
        borderColor: '#10b981', strokeDashArray: 5,
        label: {
          borderColor: '#10b981',
          style: { color: '#fff', background: '#10b981', fontFamily: 'Cairo', fontSize: '10px' },
          text: `متوسط: ${avgPerDay}`
        }
      }] : []
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            مسار الأحداث الزمني
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
            توزيع الأحداث عبر الأيام — الخط الأخضر يمثّل المتوسط اليومي
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {peakDay?.date && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 8, background: '#fef3c720', border: '1px solid #fde68a'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>
                ذروة: {peakDay.count} حدث
              </span>
            </div>
          )}
        </div>
      </div>
      <Chart options={areaOpts} series={[{ name: 'الأحداث', data: counts }]} type="area" height={220} />
    </div>
  );
};

/* ── Region Breakdown Chart ────────────────────────────────── */
const RegionPanel = ({ regionCounts }) => {
  const entries = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  if (!entries.length) return null;

  const barOpts = {
    chart: { ...chartBase, type: 'bar' },
    colors: PALETTE,
    plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '60%', distributed: true } },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'], fontFamily: 'Cairo', fontSize: '11px', fontWeight: 700 },
      formatter: v => v
    },
    xaxis: {
      categories: entries.map(([k]) => k),
      labels: { style: { fontFamily: 'Cairo', colors: '#94a3b8', fontSize: '11px' } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { labels: { style: { fontFamily: 'Cairo', colors: '#475569', fontSize: '12px' } } },
    grid: { borderColor: '#f1f5f9', xaxis: { lines: { show: true } } },
    tooltip: { theme: 'light', y: { title: { formatter: () => 'الأحداث:' } } },
    legend: { show: false }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            توزيع الأحداث حسب الإقليم
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
            الأقاليم الأكثر نشاطاً من خلال حقل الهدف
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {entries.slice(0, 3).map(([region, cnt], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
              borderRadius: 8, background: PALETTE[i] + '15', border: `1px solid ${PALETTE[i]}30`
            }}>
              <MapPin size={11} color={PALETTE[i]} />
              <span style={{ fontSize: 11, fontWeight: 700, color: PALETTE[i] }}>{region}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: PALETTE[i] }}>({cnt})</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, alignItems: 'center' }}>
        <Chart
          options={barOpts}
          series={[{ name: 'الأحداث', data: entries.map(([, v]) => v) }]}
          type="bar"
          height={Math.max(240, entries.length * 38)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.slice(0, 6).map(([region, cnt], i) => {
            const max = entries[0][1];
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: PALETTE[i % PALETTE.length],
                      background: PALETTE[i % PALETTE.length] + '15', width: 20, height: 20,
                      borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {region}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: PALETTE[i % PALETTE.length], flexShrink: 0, marginRight: 4 }}>
                    {cnt}
                  </span>
                </div>
                <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                  <div style={{ height: 5, width: `${(cnt / max) * 100}%`, background: PALETTE[i % PALETTE.length], borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Profession / Nationality Panel ─────────────────────────── */
const ProfessionNationalityPanel = ({ events }) => {
  const profMap = {};
  const natMap = {};

  events.forEach(e => {
    (e.parsedDetails?.persons || []).forEach(p => {
      if (p.profession) profMap[p.profession] = (profMap[p.profession] || 0) + 1;
      if (p.nationality && p.nationality !== 'تونسي' && p.nationality !== 'تونسية') {
        natMap[p.nationality] = (natMap[p.nationality] || 0) + 1;
      }
    });
  });

  const profEntries = Object.entries(profMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const natEntries = Object.entries(natMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const barOpts = {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'Cairo' },
    colors: ['#8b5cf6'],
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '65%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f5f9' },
    xaxis: { labels: { style: { fontFamily: 'Cairo', colors: '#94a3b8' } }, axisBorder: { show: false } },
    yaxis: { labels: { style: { fontFamily: 'Cairo', colors: '#475569' } } },
    tooltip: { theme: 'light' }
  };
  const barSeries = [{ name: 'عدد الضالعين', data: profEntries.map(([, v]) => v) }];

  if (profEntries.length === 0 && natEntries.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>تحليل المهن الأكثر انخراطاً</h3>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>توزيع الضالعين حسب المهنة</p>
        <Chart
          options={{ ...barOpts, xaxis: { ...barOpts.xaxis, categories: profEntries.map(([k]) => k) } }}
          series={barSeries} type="bar" height={260}
        />
      </div>
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>الجنسيات الأجنبية المسجلة</h3>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>المشتبه بهم غير التونسيين</p>
        {natEntries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {natEntries.map(([nat, count], i) => {
              const max = natEntries[0][1];
              return (
                <div key={nat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{nat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE[i % PALETTE.length] }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                    <div style={{ height: 5, width: `${(count / max) * 100}%`, background: PALETTE[i % PALETTE.length], borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 40 }}>لا توجد بيانات</p>
        )}
      </div>
    </div>
  );
};

/* ── Main Overview Component ──────────────────────────────── */
const Overview = ({ stats }) => {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', region: '', category: '' });

  // Apply filters to the events
  const filteredEvents = useMemo(() => {
    return stats.events.filter(e => {
      if (filters.region && (e.target || '').trim() !== filters.region) return false;
      if (filters.category && e.category !== filters.category) return false;
      if (filters.dateFrom || filters.dateTo) {
        const rawDate = e.parsedDetails?.date || e.created_at;
        if (!rawDate) return false;
        try {
          const d = new Date(String(rawDate).replace(/\//g, '-').split('و')[0].trim());
          if (isNaN(d.getTime())) return false;
          const ds = d.toISOString().slice(0, 10);
          if (filters.dateFrom && ds < filters.dateFrom) return false;
          if (filters.dateTo && ds > filters.dateTo) return false;
        } catch { return false; }
      }
      return true;
    });
  }, [stats.events, filters]);

  const isFiltered = filters.dateFrom || filters.dateTo || filters.region || filters.category;

  // Recompute derived stats from filtered events
  const filteredStats = useMemo(() => {
    const total = filteredEvents.length;
    const dead = filteredEvents.reduce((a, e) => a + (e.parsedDetails?.casualties_dead || 0), 0);
    const injured = filteredEvents.reduce((a, e) => a + (e.parsedDetails?.casualties_injured || 0), 0);
    const suspects = filteredEvents.reduce((a, e) => a + (e.parsedDetails?.persons || []).filter(p => p.role !== 'متضرر').length, 0);
    const warrants = filteredEvents.reduce((a, e) => a + (e.parsedDetails?.legal_actions || []).length, 0);

    const dailyMap = {};
    filteredEvents.forEach(e => {
      const rawDate = e.parsedDetails?.date || e.created_at;
      if (!rawDate) return;
      try {
        const d = new Date(String(rawDate).replace(/\//g, '-').split('و')[0].trim());
        if (isNaN(d.getTime())) return;
        const dk = d.toISOString().slice(0, 10);
        dailyMap[dk] = (dailyMap[dk] || 0) + 1;
      } catch { return; }
    });
    const dailyTrend = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
    const peakDay = dailyTrend.reduce((best, d) => d.count > best.count ? d : best, { date: null, count: 0 });
    const avgPerDay = dailyTrend.length > 0 ? (total / dailyTrend.length).toFixed(1) : 0;
    const regionCounts = filteredEvents.reduce((acc, e) => {
      const r = (e.target || '').trim(); if (r) acc[r] = (acc[r] || 0) + 1; return acc;
    }, {});
    const categoryCounts = filteredEvents.reduce((acc, e) => {
      if (e.category) acc[e.category] = (acc[e.category] || 0) + 1; return acc;
    }, {});
    const unclassified = categoryCounts['غير مصنف'] || 0;
    const classifiedPct = total > 0 ? Math.round(((total - unclassified) / total) * 100) : 0;

    return { total, dead, injured, suspects, warrants, dailyTrend, peakDay, avgPerDay, regionCounts, categoryCounts, classifiedPct };
  }, [filteredEvents]);

  const categoryKeys = Object.keys(filteredStats.categoryCounts);
  const categoryVals = Object.values(filteredStats.categoryCounts);

  /* ── Bar Chart: Category Distribution ── */
  const barOpts = {
    chart: { ...chartBase, type: 'bar' },
    colors: PALETTE,
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    xaxis: {
      categories: categoryKeys,
      labels: { style: { fontFamily: 'Cairo', fontSize: '11px', colors: '#94a3b8' }, rotate: -25, rotateAlways: true },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { labels: { style: { fontFamily: 'Cairo', colors: '#94a3b8' }, opposite: true } },
    tooltip: { theme: 'light', y: { title: { formatter: () => 'عدد الأحداث:' } } },
  };

  /* ── Donut Chart: Category Share ── */
  const donutOpts = {
    chart: { ...chartBase, type: 'donut' },
    labels: categoryKeys,
    colors: PALETTE,
    legend: { position: 'bottom', fontFamily: 'Cairo', fontSize: '12px' },
    dataLabels: { style: { fontFamily: 'Cairo' } },
    stroke: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true, label: 'الإجمالي', fontFamily: 'Cairo', fontSize: '13px', color: '#94a3b8',
              formatter: () => filteredStats.total
            }
          }
        }
      }
    },
    tooltip: { style: { fontFamily: 'Cairo' } }
  };

  /* ── Radar Chart: Category Risk ── */
  const radarOpts = {
    chart: { ...chartBase, type: 'radar' },
    colors: ['#6366f1'],
    fill: { opacity: 0.18 },
    stroke: { width: 2 },
    markers: { size: 4 },
    xaxis: { categories: categoryKeys, labels: { style: { fontFamily: 'Cairo', colors: '#475569', fontSize: '11px' } } },
    yaxis: { show: false },
    tooltip: { style: { fontFamily: 'Cairo' } },
    plotOptions: { radar: { polygons: { strokeColors: '#e8ecf4' } } }
  };

  /* ── Warrant-watch data ── */
  const warrantsData = filteredEvents
    .flatMap(e => (e.parsedDetails?.legal_actions || []).map(la => ({
      ...la,
      date: e.created_at
    })))
    .filter(w => w.warrant_number)
    .slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="fade-up">

      {/* ── Filter Bar ──────────────────────────── */}
      <FilterBar events={stats.events} filters={filters} setFilters={setFilters} />

      {/* ── Anomaly Alert ──────────────────────── */}
      <AnomalyBanner
        peakDay={filteredStats.peakDay}
        avgPerDay={filteredStats.avgPerDay}
        filteredTotal={filteredStats.total}
      />

      {/* ── KPI Row — 6 cards ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>
        <StatsCard
          title="إجمالي الأحداث"
          value={filteredStats.total}
          icon={BarChart3}
          color="indigo"
          subtext={isFiltered ? 'ضمن الفلتر المحدد' : 'كامل الأرشيف'}
        />
        <StatsCard
          title="متوسط الأحداث / يوم"
          value={filteredStats.avgPerDay}
          icon={Calendar}
          color="sky"
          subtext="متوسط النشاط اليومي"
        />
        <StatsCard
          title="إجمالي الإصابات"
          value={filteredStats.injured}
          icon={Activity}
          color="amber"
          subtext="مصاب مسجّل"
        />
        <StatsCard
          title="إجمالي الوفيات"
          value={filteredStats.dead}
          icon={Skull}
          color="rose"
          subtext="حالة وفاة مسجّلة"
        />
        <StatsCard
          title="إجراءات قانونية"
          value={filteredStats.warrants}
          icon={TrendingUp}
          color="emerald"
          subtext={`على ${filteredStats.suspects} مشتبه`}
        />
        <StatsCard
          title="نسبة التصنيف"
          value={`${filteredStats.classifiedPct}%`}
          icon={CheckCircle2}
          color="violet"
          subtext="من مجموع الأحداث"
        />
      </div>

      {/* ── Time Series ─────────────────────────── */}
      <TimeSeriesPanel
        dailyTrend={filteredStats.dailyTrend}
        peakDay={filteredStats.peakDay}
        avgPerDay={filteredStats.avgPerDay}
      />

      {/* ── Bar + Donut ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>توزيع الأحداث حسب الفئة</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>تصنيف السجلات الأمنية</p>
            </div>
            <span className="badge badge-neutral">{filteredStats.total} حدث</span>
          </div>
          <Chart options={barOpts} series={[{ name: 'الأحداث', data: categoryVals }]} type="bar" height={280} />
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>الحصص النسبية</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>الكثافة لكل فئة جريمة</p>
          <Chart options={donutOpts} series={categoryVals} type="donut" height={280} />
        </div>
      </div>

      {/* ── Radar + Warrant Table ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>مصفوفة المخاطر</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>مقارنة الكثافة بين الفئات</p>
          <Chart options={radarOpts} series={[{ name: 'تكرار الأحداث', data: categoryVals }]} type="radar" height={280} />
        </div>

        {/* Warrant Watch */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>مراقبة المناشير القضائية</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>قائمة المناشير المسجلة في الأحداث</p>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)',
              fontSize: 12, fontFamily: 'Cairo', color: 'var(--text-2)', cursor: 'pointer', fontWeight: 600
            }}>
              <Download size={13} /> تصدير
            </button>
          </div>
          {warrantsData.length > 0 ? (
            <div style={{ overflowY: 'auto', maxHeight: 260 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>رقم المنشور</th>
                    <th>الجهة المُصدِرة</th>
                    <th>التهمة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {warrantsData.map((w, i) => (
                    <tr key={i}>
                      <td><span style={{ fontWeight: 700, color: '#6366f1' }}>{w.warrant_number}</span></td>
                      <td>{w.issuer || '—'}</td>
                      <td style={{ maxWidth: 160 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {w.charges || '—'}
                        </span>
                      </td>
                      <td>{new Date(w.date).toLocaleDateString('ar-TN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>لا توجد مناشير مسجلة</div>
          )}
        </div>
      </div>

      {/* ── Region Breakdown ────────────────────── */}
      <RegionPanel regionCounts={filteredStats.regionCounts} />

      {/* ── Daily Briefing Feed ─────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>موجز الأحداث</h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>آخر 10 أحداث</p>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>الفئة</th>
              <th>ملخص الحدث</th>
              <th>المصدر</th>
              <th>الهدف</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.slice(0, 10).map((event, i) => (
              <tr key={i}>
                <td>
                  <span style={{
                    background: '#e0e7ff', color: '#4f46e5',
                    fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 8px',
                    whiteSpace: 'nowrap', display: 'inline-block'
                  }}>{event.category}</span>
                </td>
                <td style={{ maxWidth: 300 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                    {event.event_summary}
                  </span>
                </td>
                <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{event.source || '—'}</td>
                <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{event.target || '—'}</td>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--text-3)' }}>{new Date(event.created_at).toLocaleDateString('ar-TN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Profession / Nationality ────────────── */}
      <ProfessionNationalityPanel events={filteredEvents} />
    </div>
  );
};

export default Overview;
