import React from 'react';
import Chart from 'react-apexcharts';
import {
  ChevronLeft, AlertCircle, Package, Users as UsersIcon,
  DollarSign, ShieldCheck, Skull, Activity, Truck,
  Search, CheckCircle, XCircle, Shield, MapPin, Calendar
} from 'lucide-react';
import StatsCard from './StatsCard';

const CF = 'Cairo, sans-serif';
const BASE = { toolbar: { show: false }, background: 'transparent', fontFamily: CF };
const PALETTE = ['#6366f1','#8b5cf6','#10b981','#f59e0b','#f43f5e','#0ea5e9','#14b8a6','#ec4899'];

/* ── Shared helpers ─────────────────────────────────────────── */

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{children}</h4>
    {sub && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{sub}</p>}
  </div>
);

/* Ranked list with colored progress bars */
const RankedList = ({ items, color = '#6366f1', label = 'عدد' }) => {
  if (!items.length) return <Empty />;
  const max = items[0][1];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(([key, val], i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 8 }}>{key}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>{val}</span>
          </div>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: 6, width: `${(val / max) * 100}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

/* Person alert card */
const PersonCard = ({ person, color = '#f43f5e', bg = '#ffe4e6' }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: bg, borderRadius: 10, marginBottom: 8 }}>
    <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <UsersIcon size={16} color={color} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name || 'مجهول الهوية'}</p>
      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
        {[person.profession, person.nationality, person.cin ? `ب.ت: ${person.cin}` : null].filter(Boolean).join(' · ')}
      </p>
    </div>
    {person.role && <span style={{ fontSize: 10, fontWeight: 700, background: color + '20', color, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>{person.role}</span>}
  </div>
);

/* Empty placeholder */
const Empty = ({ msg = 'لا توجد بيانات مسجلة لهذا القسم' }) => (
  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-3)' }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
      <AlertCircle size={22} color="#cbd5e1" />
    </div>
    <p style={{ fontSize: 13 }}>{msg}</p>
  </div>
);

/* ── Location Heatmap Panel ───────────────────────────────── */
const LocationPanel = ({ data }) => {
  const locs = {};
  data.forEach(e => {
    const main = e.location;
    const detail = e.parsedDetails?.location_details;
    if (detail && detail !== main) {
      locs[detail] = (locs[detail] || 0) + 1;
    } else if (main) {
      locs[main] = (locs[main] || 0) + 1;
    }
  });

  const entries = Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (!entries.length) return null;

  const barOpts = {
    chart: { ...BASE, type: 'bar' },
    colors: PALETTE,
    plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '60%', distributed: true } },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'], fontFamily: CF, fontSize: '11px', fontWeight: 700 },
      formatter: v => v
    },
    xaxis: {
      categories: entries.map(([k]) => k),
      labels: { style: { fontFamily: CF, colors: '#94a3b8', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { labels: { style: { fontFamily: CF, colors: '#475569', fontSize: '12px' } } },
    grid: { borderColor: '#f1f5f9', xaxis: { lines: { show: true } } },
    tooltip: { theme: 'light', y: { title: { formatter: () => 'عدد الأحداث:' } } },
    legend: { show: false }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <SectionTitle sub="أكثر المواقع تسجيلاً للأحداث">خريطة التوزيع الجغرافي</SectionTitle>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {entries.slice(0, 3).map(([loc, cnt], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 8,
              background: PALETTE[i] + '15', border: `1px solid ${PALETTE[i]}30`
            }}>
              <MapPin size={11} color={PALETTE[i]} />
              <span style={{ fontSize: 11, fontWeight: 700, color: PALETTE[i] }}>{loc}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: PALETTE[i] }}>({cnt})</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        <Chart
          options={barOpts}
          series={[{ name: 'عدد الأحداث', data: entries.map(([, v]) => v) }]}
          type="bar"
          height={Math.max(220, entries.length * 38)}
        />
        {/* Top 5 ranked list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
          {entries.slice(0, 5).map(([loc, cnt], i) => {
            const max = entries[0][1];
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: PALETTE[i], background: PALETTE[i] + '15', width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: PALETTE[i], flexShrink: 0, marginRight: 4 }}>{cnt}</span>
                </div>
                <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                  <div style={{ height: 5, width: `${(cnt / max) * 100}%`, background: PALETTE[i], borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* Timeline event feed */
const EventFeed = ({ data, limit = 8 }) => (
  <div className="card">
    <SectionTitle sub={`عرض آخر ${Math.min(limit, data.length)} سجل`}>سجل الأحداث التفصيلي</SectionTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {data.slice(0, limit).map((e, i) => (
        <div key={i} style={{
          display: 'flex', gap: 14, padding: '14px 0',
          borderBottom: i < Math.min(limit, data.length) - 1 ? '1px solid var(--border)' : 'none'
        }}>
          {/* Timeline dot */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length], marginBottom: 4 }} />
            {i < Math.min(limit, data.length) - 1 && <div style={{ width: 1, flex: 1, background: '#e8ecf4' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '1.55', margin: '0 0 6px' }}>{e.event_summary}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {e.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)' }}>
                  <MapPin size={11} /> {e.location}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)' }}>
                <Calendar size={11} /> {new Date(e.created_at).toLocaleDateString('ar-TN')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* Two-column chart card */
const ChartCard = ({ title, sub, chart, height = 280 }) => (
  <div className="card">
    <SectionTitle sub={sub}>{title}</SectionTitle>
    {chart}
  </div>
);

/* Category back button */
const BackBtn = ({ onBack, category, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
    <button onClick={onBack} style={{
      width: 40, height: 40, borderRadius: 11, border: '1px solid var(--border)',
      background: 'var(--surface)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)',
      transition: 'background 0.15s'
    }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
      <ChevronLeft size={20} />
    </button>
    <div>
      <h2 style={{ fontSize: 21, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{category}</h2>
      <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '2px 0 0' }}>{count} سجل مرصود في هذه الفئة</p>
    </div>
  </div>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ① DRUGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const DrugsDashboard = ({ data }) => {
  const seizures = {};
  const suspects = [];
  const drugTypes = {};

  data.forEach(e => {
    const qd = e.parsedDetails?.quantity_details || {};
    Object.entries(qd).forEach(([k, v]) => {
      if (!seizures[k]) seizures[k] = { count: 0, samples: [] };
      seizures[k].count++;
      seizures[k].samples.push(v);
    });
    (e.parsedDetails?.persons || []).forEach(p => suspects.push({ ...p }));
    const t = e.parsedDetails?.event_type_details;
    if (t) drugTypes[t] = (drugTypes[t] || 0) + 1;
  });

  const seizureEntries = Object.entries(seizures).sort((a, b) => b[1].count - a[1].count);
  const drugTypeEntries = Object.entries(drugTypes).sort((a, b) => b[1] - a[1]);

  const donutOpts = {
    chart: { ...BASE, type: 'donut' },
    colors: PALETTE,
    labels: drugTypeEntries.map(([k]) => k),
    stroke: { show: false },
    legend: { position: 'bottom', fontFamily: CF, fontSize: '12px' },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '72%', labels: {
      show: true,
      total: { show: true, label: 'إجمالي', fontFamily: CF, color: '#94a3b8', formatter: () => data.length }
    }}}},
    tooltip: { theme: 'light' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatsCard title="إجمالي المحاضر"    value={data.length}                     icon={Package}     color="indigo" subtext="الملفات المفتوحة" />
        <StatsCard title="المشتبه بهم"        value={suspects.length}                  icon={UsersIcon}   color="rose"   subtext="الأفراد المسجلون" />
        <StatsCard title="أنواع المضبوطات"    value={Object.keys(seizures).length}    icon={ShieldCheck} color="violet" subtext="تنوع المواد" />
        <StatsCard title="أنواع الجرائم"      value={drugTypeEntries.length}          icon={Activity}    color="amber"  subtext="ترويج / حيازة / غير ذلك" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Seizure ranked list */}
        <div className="card">
          <SectionTitle sub="ترتيب المواد حسب تكرار الضبط">جرد المواد المضبوطة</SectionTitle>
          {seizureEntries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 16px', paddingBottom: 8, borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>المادة</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>حجم العيّنة</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>الأحداث</span>
              </div>
              {seizureEntries.slice(0, 8).map(([drug, info], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 16px', padding: '10px 0', borderBottom: i < 7 ? '1px solid #f8f9fc' : 'none', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{drug}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>{info.samples[0] || '—'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE[i % PALETTE.length], textAlign: 'left', minWidth: 28 }}>{info.count}</span>
                </div>
              ))}
            </div>
          ) : <Empty msg="لم يتم تسجيل مواد مضبوطة" />}
        </div>

        {/* Drug type donut */}
        <div className="card">
          <SectionTitle sub="تصنيف الجرائم: ترويج / حيازة / استهلاك">توزيع أنواع الجرائم</SectionTitle>
          {drugTypeEntries.length > 0
            ? <Chart options={donutOpts} series={drugTypeEntries.map(([,v]) => v)} type="donut" height={300} />
            : <Empty msg="لم يتم تصنيف أنواع الجرائم" />}
        </div>
      </div>

      {/* Suspects with persona */}
      {suspects.length > 0 && (
        <div className="card">
          <SectionTitle sub="قائمة الأشخاص المسجلين في الملفات">الأشخاص المشتبه بهم</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {suspects.slice(0, 6).map((p, i) => <PersonCard key={i} person={p} color={PALETTE[i % 3]} bg={['#e0e7ff','#ffe4e6','#d1fae5'][i % 3]} />)}
          </div>
        </div>
      )}

      <LocationPanel data={data} />
      <EventFeed data={data} />
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ② TRAFFIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const TrafficDashboard = ({ data }) => {
  const dead = data.reduce((a, e) => a + (e.parsedDetails?.casualties_dead || 0), 0);
  const injured = data.reduce((a, e) => a + (e.parsedDetails?.casualties_injured || 0), 0);
  const vehicles = data.flatMap(e => e.parsedDetails?.vehicles || []);
  const causeCounts = {};
  data.forEach(e => { const t = e.parsedDetails?.event_type_details; if (t) causeCounts[t] = (causeCounts[t] || 0) + 1; });
  const causeEntries = Object.entries(causeCounts).sort((a,b)=>b[1]-a[1]);

  const donutOpts = {
    chart: { ...BASE, type: 'donut' },
    colors: ['#f43f5e','#f59e0b','#8b5cf6','#10b981','#0ea5e9'],
    labels: causeEntries.map(([k]) => k),
    stroke: { show: false },
    legend: { position: 'bottom', fontFamily: CF },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '70%' } } },
    tooltip: { theme: 'light' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatsCard title="إجمالي الحوادث"    value={data.length}     icon={Truck}     color="indigo" />
        <StatsCard title="الوفيات المسجلة"    value={dead}            icon={Skull}     color="rose"   subtext="حالات الوفاة" />
        <StatsCard title="الإصابات"           value={injured}         icon={Activity}  color="amber"  subtext="المصابون في الحوادث" />
        <StatsCard title="المركبات المعنية"   value={vehicles.length} icon={Package}   color="sky"    />
      </div>

      {/* Casualty highlight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg,#fff1f2,#fff5f5)', borderColor: '#fecdd3', textAlign: 'center', padding: '28px 16px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Skull size={24} color="#f43f5e" />
          </div>
          <p style={{ fontSize: 38, fontWeight: 900, color: '#f43f5e', lineHeight: 1 }}>{dead}</p>
          <p style={{ fontSize: 13, color: '#9f1239', fontWeight: 600, marginTop: 6 }}>حالة وفاة</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg,#fffbeb,#fef9e7)', borderColor: '#fde68a', textAlign: 'center', padding: '28px 16px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Activity size={24} color="#f59e0b" />
          </div>
          <p style={{ fontSize: 38, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{injured}</p>
          <p style={{ fontSize: 13, color: '#92400e', fontWeight: 600, marginTop: 6 }}>إصابة مسجلة</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '28px 16px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Truck size={24} color="#6366f1" />
          </div>
          <p style={{ fontSize: 38, fontWeight: 900, color: '#6366f1', lineHeight: 1 }}>{vehicles.length}</p>
          <p style={{ fontSize: 13, color: '#4338ca', fontWeight: 600, marginTop: 6 }}>مركبة متورطة</p>
        </div>
      </div>

      {/* Vehicle + Cause */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <SectionTitle sub="المركبات المُوثّقة في الملفات">سجل المركبات المتورطة</SectionTitle>
          {vehicles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {vehicles.slice(0, 8).map((v, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: i % 2 === 0 ? 'var(--surface-2)' : 'transparent', borderRadius: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={14} color="#6366f1" />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{v.type || 'مركبة'}</span>
                  </div>
                  <span style={{ fontSize: 13, fontFamily: 'Inter, monospace', fontWeight: 700, color: '#6366f1' }}>{v.registration || '—'}</span>
                </div>
              ))}
            </div>
          ) : <Empty msg="لم يتم تسجيل مركبات" />}
        </div>

        <div className="card">
          <SectionTitle sub="توزيع أسباب الحوادث">تحليل أسباب الحوادث</SectionTitle>
          {causeEntries.length > 0
            ? causeEntries.length <= 2
              ? <RankedList items={causeEntries} color="#f43f5e" />
              : <Chart options={donutOpts} series={causeEntries.map(([,v]) => v)} type="donut" height={280} />
            : <Empty msg="لم يتم تصنيف الأسباب" />}
        </div>
      </div>

      <LocationPanel data={data} />
      <EventFeed data={data} />
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ③ BORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const BorderDashboard = ({ data }) => {
  const locationCounts = {};
  const smuggledGoods = {};
  const wantedPersons = [];

  data.forEach(e => {
    const loc = e.parsedDetails?.location_details || e.location;
    if (loc) locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    const qd = e.parsedDetails?.quantity_details || {};
    Object.entries(qd).forEach(([k, v]) => { smuggledGoods[k] = (smuggledGoods[k] || 0) + 1; });
    (e.parsedDetails?.persons || []).forEach(p => {
      if (p.role === 'مهرب' || p.role?.includes('مشتبه')) wantedPersons.push({ ...p });
    });
  });

  const locEntries = Object.entries(locationCounts).sort((a,b)=>b[1]-a[1]);
  const goodsEntries = Object.entries(smuggledGoods).sort((a,b)=>b[1]-a[1]);

  const barOpts = {
    chart: { ...BASE, type: 'bar' },
    colors: ['#f59e0b'],
    plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '60%', distributed: true } },
    colors: PALETTE,
    dataLabels: { enabled: false },
    xaxis: {
      categories: locEntries.map(([k]) => k),
      labels: { style: { fontFamily: CF, colors: '#94a3b8', fontSize: '11px' } },
      axisBorder: { show: false }
    },
    yaxis: { labels: { style: { fontFamily: CF, colors: '#475569' } } },
    grid: { borderColor: '#f1f5f9' },
    tooltip: { theme: 'light' },
    legend: { show: false }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatsCard title="إجمالي الحوادث"         value={data.length}             icon={Shield}   color="indigo" />
        <StatsCard title="نقاط العبور"             value={locEntries.length}       icon={MapPin}   color="amber"  />
        <StatsCard title="أنواع البضائع المهربة"   value={goodsEntries.length}     icon={Package}  color="violet" />
        <StatsCard title="أشخاص مشتبه بهم"         value={wantedPersons.length}    icon={Search}   color="rose"   />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
        <div className="card">
          <SectionTitle sub="عدد الحوادث لكل نقطة عبور">أداء نقاط العبور</SectionTitle>
          {locEntries.length > 0
            ? <Chart options={barOpts} series={[{ name: 'عدد الحوادث', data: locEntries.map(([,v]) => v) }]} type="bar" height={280} />
            : <Empty />}
        </div>

        <div className="card">
          <SectionTitle sub="تصنيف البضائع المضبوطة">البضائع المهربة المضبوطة</SectionTitle>
          {goodsEntries.length > 0
            ? <RankedList items={goodsEntries.slice(0,8)} color="#8b5cf6" />
            : <Empty msg="لم يتم تسجيل بضائع" />}
        </div>
      </div>

      {/* Wanted persons */}
      {wantedPersons.length > 0 && (
        <div className="card">
          <SectionTitle sub="قائمة المشتبه بهم من الملفات الحدودية">تنبيهات المشتبه بهم</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {wantedPersons.slice(0, 6).map((p, i) => <PersonCard key={i} person={p} color="#f43f5e" bg="#fff1f2" />)}
          </div>
        </div>
      )}

      <LocationPanel data={data} />
      <EventFeed data={data} />
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ④ THEFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const TheftDashboard = ({ data }) => {
  const withRecovery = data.filter(e => (e.parsedDetails?.seized_objects || []).length > 0).length;
  const recoveryRate = data.length > 0 ? Math.round((withRecovery / data.length) * 100) : 0;

  const targets = {};
  const stolenGoods = {};
  data.forEach(e => {
    const t = e.parsedDetails?.event_type_details;
    if (t) targets[t] = (targets[t] || 0) + 1;
    (e.parsedDetails?.seized_objects || []).forEach(obj => {
      stolenGoods[obj] = (stolenGoods[obj] || 0) + 1;
    });
  });

  const gaugeOpts = {
    chart: { ...BASE, type: 'radialBar' },
    colors: [recoveryRate > 50 ? '#10b981' : recoveryRate > 25 ? '#f59e0b' : '#f43f5e'],
    plotOptions: { radialBar: {
      hollow: { size: '60%' },
      dataLabels: {
        name: { show: true, color: '#94a3b8', fontFamily: CF, fontSize: '12px', offsetY: 18 },
        value: { show: true, color: '#0f172a', fontFamily: 'Inter', fontSize: '30px', fontWeight: 900, offsetY: -12,
          formatter: v => `${v}%` }
      }
    }},
    labels: ['معدل الاسترداد']
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        <StatsCard title="إجمالي قضايا السرقة" value={data.length}                     icon={Package}     color="indigo" />
        <StatsCard title="مع استرداد"           value={withRecovery}                    icon={CheckCircle} color="emerald" subtext="ملفات مع مضبوطات" />
        <StatsCard title="بدون استرداد"         value={data.length - withRecovery}      icon={XCircle}     color="rose"   subtext="دون مضبوطات مسجلة" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* Recovery Gauge */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle sub="نسبة الملفات مع مضبوطات">كفاءة الاسترداد</SectionTitle>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Chart options={gaugeOpts} series={[recoveryRate]} type="radialBar" height={240} />
          </div>
          <div style={{ display: 'flex', justify: 'center', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#10b981', margin: 0 }}>{withRecovery}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>مع استرداد</p>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#f43f5e', margin: 0 }}>{data.length - withRecovery}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>دون استرداد</p>
            </div>
          </div>
        </div>

        {/* Target types ranked */}
        <div className="card">
          <SectionTitle sub="تصنيف أنواع الأهداف المتضررة">الأهداف المستهدفة</SectionTitle>
          {Object.entries(targets).length > 0
            ? <RankedList items={Object.entries(targets).sort((a,b)=>b[1]-a[1]).slice(0,8)} color="#8b5cf6" />
            : <Empty msg="لم يتم تسجيل أنواع أهداف" />}
        </div>
      </div>

      <LocationPanel data={data} />
      <EventFeed data={data} />
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ⑤ ECONOMIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const EconomicDashboard = ({ data }) => {
  const violations = {};
  let adminActions = 0;
  const totalValue = data.reduce((a, e) => {
    const v = e.parsedDetails?.monetary_value;
    return a + (v ? (parseFloat(v.replace(/[^\d.]/g, '')) || 0) : 0);
  }, 0);

  data.forEach(e => {
    const vt = e.parsedDetails?.violation_type || e.parsedDetails?.event_type_details;
    if (vt) violations[vt] = (violations[vt] || 0) + 1;
    (e.parsedDetails?.legal_actions || []).forEach(la => {
      if (['إيقاف نشاط', 'محضر'].some(kw => (la.action_type || '').includes(kw))) adminActions++;
    });
  });

  const vioEntries = Object.entries(violations).sort((a,b)=>b[1]-a[1]);

  const barOpts = {
    chart: { ...BASE, type: 'bar' },
    colors: PALETTE,
    plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '60%', distributed: true } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: vioEntries.map(([k]) => k),
      labels: { style: { fontFamily: CF, colors: '#94a3b8', fontSize: '11px' } },
      axisBorder: { show: false }
    },
    yaxis: { labels: { style: { fontFamily: CF, colors: '#475569' } } },
    grid: { borderColor: '#f1f5f9' },
    tooltip: { theme: 'light' },
    legend: { show: false }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatsCard title="إجمالي الجرائم الاقتصادية" value={data.length}                          icon={Package}     color="indigo" />
        <StatsCard title="القيمة المالية الكلية"       value={`${Math.round(totalValue).toLocaleString()} DT`} icon={DollarSign} color="amber" subtext="مجموع المحجوزات" />
        <StatsCard title="أنواع المخالفات"             value={vioEntries.length}                   icon={Activity}    color="violet" />
        <StatsCard title="إجراءات إدارية"              value={adminActions}                        icon={ShieldCheck} color="rose"   />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
        <div className="card">
          <SectionTitle sub="توزيع أنواع المخالفات وكثافتها">أنواع المخالفات الاقتصادية</SectionTitle>
          {vioEntries.length > 0
            ? <Chart options={barOpts} series={[{ name: 'عدد المخالفات', data: vioEntries.map(([,v]) => v) }]} type="bar" height={280} />
            : <Empty />}
        </div>
        <div className="card">
          <SectionTitle sub="ترتيب المخالفات حسب التكرار">أبرز المخالفات</SectionTitle>
          {vioEntries.length > 0
            ? <RankedList items={vioEntries.slice(0, 7)} color="#f59e0b" />
            : <Empty />}
        </div>
      </div>

      <LocationPanel data={data} />
      <EventFeed data={data} />
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ⑥ OFFICIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const OfficialDashboard = ({ data }) => {
  const impactTags = { سلمي: 0, عنيف: 0, 'إغلاق طريق': 0 };
  const orgMap = {};

  data.forEach(e => {
    const txt = (e.event_summary || '') + (e.parsedDetails?.summary || '');
    if (txt.includes('سلمي')) impactTags['سلمي']++;
    if (txt.includes('عنيف') || txt.includes('مواجهة')) impactTags['عنيف']++;
    if (txt.includes('طريق') || txt.includes('قطع')) impactTags['إغلاق طريق']++;
    const org = e.parsedDetails?.event_type_details;
    if (org) orgMap[org] = (orgMap[org] || 0) + 1;
  });

  const impactStyles = {
    'سلمي':        { color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
    'عنيف':        { color: '#f43f5e', bg: '#ffe4e6', icon: AlertCircle },
    'إغلاق طريق': { color: '#f59e0b', bg: '#fef3c7', icon: Truck }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatsCard title="إجمالي الأحداث"   value={data.length}            icon={Package}     color="indigo" />
        <StatsCard title="أحداث سلمية"       value={impactTags['سلمي']}     icon={CheckCircle} color="emerald" />
        <StatsCard title="مواجهات عنيفة"     value={impactTags['عنيف']}     icon={AlertCircle} color="rose"   />
        <StatsCard title="إغلاق طرق"         value={impactTags['إغلاق طريق']} icon={Truck}    color="amber"  />
      </div>

      {/* Impact assessment visual cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {Object.entries(impactStyles).map(([label, s]) => {
          const count = impactTags[label];
          const pct = data.length > 0 ? Math.round((count / data.length) * 100) : 0;
          return (
            <div key={label} className="card" style={{ border: `1px solid ${s.color}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', gap: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={24} color={s.color} />
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{count}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{label}</p>
              <div style={{ width: '100%', height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                <div style={{ height: 5, width: `${pct}%`, background: s.color, borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>{pct}% من الإجمالي</p>
            </div>
          );
        })}
      </div>

      {/* Organizer ranked list */}
      <div className="card">
        <SectionTitle sub="الجهات والأنواع الأكثر تسجيلاً">الجهات المنظِّمة وأنواع الأحداث</SectionTitle>
        {Object.keys(orgMap).length > 0
          ? <RankedList items={Object.entries(orgMap).sort((a,b)=>b[1]-a[1]).slice(0,10)} color="#6366f1" />
          : <Empty msg="لم يتم تسجيل جهات منظِّمة" />}
      </div>

      <LocationPanel data={data} />
      <EventFeed data={data} />
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONTROLLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const CategoryDashboard = ({ category, data, onBack }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card fade-up" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={30} color="#cbd5e1" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>لا توجد بيانات لهذه الفئة</h3>
        <p style={{ color: 'var(--text-3)', marginBottom: 28, maxWidth: 300, margin: '0 auto 28px' }}>لم يُعثَر على أحداث مسجلة ضمن فئة "{category}" في الأرشيف.</p>
        <button onClick={onBack} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontFamily: 'Cairo', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>العودة للرئيسية</button>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <BackBtn onBack={onBack} category={category} count={data.length} />
      {category === 'جرائم المخدرات'             && <DrugsDashboard    data={data} />}
      {category === 'أحداث مرورية'               && <TrafficDashboard  data={data} />}
      {category === 'أمن الحدود'                 && <BorderDashboard   data={data} />}
      {category === 'جرائم السرقات'              && <TheftDashboard    data={data} />}
      {category === 'جرائم اقتصادية ومالية'      && <EconomicDashboard data={data} />}
      {category === 'الأنشطة الرسمية والتظاهرات' && <OfficialDashboard data={data} />}
    </div>
  );
};

export default CategoryDashboard;
