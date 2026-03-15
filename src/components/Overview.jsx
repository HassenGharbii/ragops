import React from 'react';
import Chart from 'react-apexcharts';
import { FileCheck, TrendingUp, DollarSign, BarChart3, Search, Download, MapPin, Users } from 'lucide-react';
import StatsCard from './StatsCard';

// Shared chart defaults
const chartBase = {
  toolbar: { show: false },
  background: 'transparent',
  fontFamily: 'Cairo, sans-serif',
};

const Overview = ({ stats }) => {
  const categoryKeys = Object.keys(stats.categoryCounts);
  const categoryVals = Object.values(stats.categoryCounts);

  /* ── Bar Chart: Category Distribution ── */
  const barOpts = {
    chart: { ...chartBase, type: 'bar' },
    colors: ['#6366f1'],
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: '55%', distributed: true }
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    xaxis: {
      categories: categoryKeys,
      labels: {
        style: { fontFamily: 'Cairo', fontSize: '11px', colors: '#94a3b8' },
        rotate: -25, rotateAlways: true
      },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { labels: { style: { fontFamily: 'Cairo', colors: '#94a3b8' } }, opposite: true },
    tooltip: { theme: 'light', y: { title: { formatter: () => 'عدد الأحداث:' } } },
    colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9'],
  };
  const barSeries = [{ name: 'الأحداث', data: categoryVals }];

  /* ── Donut Chart: Category Share ── */
  const donutOpts = {
    chart: { ...chartBase, type: 'donut' },
    labels: categoryKeys,
    colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9'],
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
              formatter: () => stats.total
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
  const radarSeries = [{ name: 'تكرار الأحداث', data: categoryVals }];

  /* ── Warrant-watch data ── */
  const warrantsData = stats.events
    .flatMap(e => (e.parsedDetails?.legal_actions || []).map(la => ({
      ...la,
      eventSummary: e.event_summary?.slice(0, 60) + '...',
      date: e.created_at
    })))
    .filter(w => w.warrant_number)
    .slice(0, 8);

  const totalSuspects = stats.events.reduce((acc, e) => acc + (e.parsedDetails?.persons || []).length, 0);
  const totalWarrants = stats.events.reduce((acc, e) => acc + (e.parsedDetails?.legal_actions || []).length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">

      {/* ── KPI Row ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
        <StatsCard title="معدل استخراج البيانات" value={`${stats.captureRate}%`} icon={FileCheck} color="indigo" trend={12.4} subtext="استخراج ناجح مقابل السجلات" />
        <StatsCard title="معدل مطابقة المناشير" value={`${stats.warrantHitRate}%`} icon={TrendingUp} color="emerald" trend={5.2} subtext="لكل 100 مشتبه به" />
        <StatsCard title="إجمالي المشتبه بهم" value={totalSuspects} icon={Users} color="violet" subtext={`موزّعون على ${stats.total} حدث`} />
        <StatsCard title="إجمالي الأحداث" value={stats.total} icon={BarChart3} color="rose" subtext={`${totalWarrants} إجراء قانوني مسجّل`} />
      </div>

      {/* ── Charts Row ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Bar */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>توزيع الأحداث حسب الفئة</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>تصنيف السجلات الأمنية</p>
            </div>
            <span className="badge badge-neutral">{stats.total} حدث</span>
          </div>
          <Chart options={barOpts} series={barSeries} type="bar" height={280} />
        </div>
        {/* Donut */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>الحصص النسبية</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>الكثافة لكل فئة جريمة</p>
          <Chart options={donutOpts} series={categoryVals} type="donut" height={280} />
        </div>
      </div>

      {/* ── Radar + Warrant Table ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Radar */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>مصفوفة المخاطر</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>مقارنة الكثافة بين الفئات</p>
          <Chart options={radarOpts} series={radarSeries} type="radar" height={280} />
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
              fontSize: 12, fontFamily: 'Cairo', color: 'var(--text-2)', cursor: 'pointer',
              fontWeight: 600
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
                      <td style={{ maxWidth: 160 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.charges || '—'}</span></td>
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

      {/* ── Daily Briefing Feed ──────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>موجز الأحداث اليومي</h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>آخر 10 أحداث ذات أولوية</p>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>الفئة</th>
              <th>ملخص الحدث</th>
              <th>الموقع</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {stats.events.slice(0, 10).map((event, i) => (
              <tr key={i}>
                <td>
                  <span style={{
                    background: '#e0e7ff', color: '#4f46e5',
                    fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 8px',
                    whiteSpace: 'nowrap'
                  }}>{event.category}</span>
                </td>
                <td style={{ maxWidth: 340 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                    {event.event_summary}
                  </span>
                </td>
                <td style={{ color: 'var(--text-2)' }}>{event.location || '—'}</td>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--text-3)' }}>{new Date(event.created_at).toLocaleDateString('ar-TN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Global Location Heatmap ──── */}
      <GlobalLocationPanel events={stats.events} />

      {/* ── Profession / Nationality Row ─ */}
      <ProfessionNationalityPanel events={stats.events} />
    </div>
  );
};

/* Global Location Chart */
const GLPALETTE = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#14b8a6', '#ec4899'];

const GlobalLocationPanel = ({ events }) => {
  const locs = {};
  events.forEach(e => {
    const detail = e.parsedDetails?.location_details;
    const main = e.location;
    const key = (detail && detail !== main) ? detail : main;
    if (key) locs[key] = (locs[key] || 0) + 1;
  });

  const entries = Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (!entries.length) return null;

  const barOpts = {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'Cairo, sans-serif', type: 'bar' },
    colors: GLPALETTE,
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
    tooltip: { theme: 'light', y: { title: { formatter: () => 'عدد الأحداث:' } } },
    legend: { show: false }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>خريطة التوزيع الجغرافي للأحداث</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>أكثر المواقع تسجيلاً عبر جميع الفئات الأمنية</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {entries.slice(0, 3).map(([loc, cnt], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
              borderRadius: 8, background: GLPALETTE[i] + '12', border: `1px solid ${GLPALETTE[i]}30`
            }}>
              <MapPin size={11} color={GLPALETTE[i]} />
              <span style={{ fontSize: 11, fontWeight: 700, color: GLPALETTE[i] }}>{loc}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: GLPALETTE[i] }}>({cnt})</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, alignItems: 'center' }}>
        <Chart
          options={barOpts}
          series={[{ name: 'عدد الأحداث', data: entries.map(([, v]) => v) }]}
          type="bar"
          height={Math.max(240, entries.length * 38)}
        />
        {/* Top 5 ranked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.slice(0, 5).map(([loc, cnt], i) => {
            const max = entries[0][1];
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: GLPALETTE[i],
                      background: GLPALETTE[i] + '15', width: 22, height: 22,
                      borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: GLPALETTE[i], flexShrink: 0, marginRight: 4 }}>{cnt}</span>
                </div>
                <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                  <div style={{ height: 5, width: `${(cnt / max) * 100}%`, background: GLPALETTE[i], borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* Sub-panel: Global Identity & Professional Analytics (spec §9) */
const ProfessionNationalityPanel = ({ events }) => {
  const profMap = {};
  const natMap = {};

  events.forEach(e => {
    (e.parsedDetails?.persons || []).forEach(p => {
      if (p.profession) profMap[p.profession] = (profMap[p.profession] || 0) + 1;
      if (p.nationality && p.nationality !== 'تونسية') natMap[p.nationality] = (natMap[p.nationality] || 0) + 1;
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
              const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9'];
              const max = natEntries[0][1];
              return (
                <div key={nat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{nat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: colors[i % colors.length] }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                    <div style={{ height: 5, width: `${(count / max) * 100}%`, background: colors[i % colors.length], borderRadius: 99 }} />
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

export default Overview;
