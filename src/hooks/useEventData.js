import { useState, useEffect, useMemo } from 'react';

const API_URL = 'http://localhost:9905/events?limit=5000';

export const useEventData = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data initially and setup polling
  useEffect(() => {
    let isMounted = true;
    
    const fetchEvents = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        if (isMounted) {
          // the api returns { "count": X, "results": [...] }
          setRawData(Array.isArray(data) ? data : (data.results || []));
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch events:', err);
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchEvents(); // Initial fetch
    
    // Poll every 10 seconds for "live" updates
    const interval = setInterval(fetchEvents, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const events = useMemo(() => {
    return rawData.map(event => ({
      ...event,
      // Parse details if it comes as a string from DB
      parsedDetails: (() => {
        try {
          return typeof event.details === 'string'
            ? JSON.parse(event.details)
            : (event.details || {});
        } catch {
          return {};
        }
      })()
    }));
  }, [rawData]);

  const stats = useMemo(() => {
    const total = events.length;
    const withDetails = events.filter(e => e.parsedDetails && e.parsedDetails.summary).length;
    const captureRate = total > 0 ? ((withDetails / total) * 100).toFixed(1) : 0;

    const warrants = events.reduce((acc, e) => {
      const legal = e.parsedDetails?.legal_actions || [];
      return acc + legal.length;
    }, 0);

    const suspects = events.reduce((acc, e) => {
      const persons = e.parsedDetails?.persons || [];
      return acc + (persons.filter(p => !p.role || p.role !== 'متضرر').length);
    }, 0);

    const warrantHitRate = suspects > 0 ? ((warrants / suspects) * 100).toFixed(1) : 0;

    // Monetary value extraction
    const totalValue = events.reduce((acc, e) => {
      const val = e.parsedDetails?.monetary_value;
      if (!val) return acc;
      const num = parseFloat(String(val).replace(/[^\d.]/g, ''));
      return isNaN(num) ? acc : acc + num;
    }, 0);

    const categoryCounts = events.reduce((acc, e) => {
      if (e.category) {
        acc[e.category] = (acc[e.category] || 0) + 1;
      }
      return acc;
    }, {});

    // ── Daily trend (group by date) ──
    const dailyMap = {};
    events.forEach(e => {
      const rawDate = e.parsedDetails?.date || e.created_at;
      if (!rawDate) return;
      try {
        const d = new Date(String(rawDate).replace(/\//g, '-').split('و')[0].trim());
        if (isNaN(d.getTime())) return;
        const dateKey = d.toISOString().slice(0, 10);
        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1;
      } catch { return; }
    });
    const dailyTrend = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const peakDay = dailyTrend.reduce(
      (best, d) => (d.count > best.count ? d : best),
      { date: null, count: 0 }
    );

    const avgPerDay = dailyTrend.length > 0
      ? (total / dailyTrend.length).toFixed(1)
      : 0;

    // ── Casualties ──
    const totalCasualties = events.reduce(
      (acc, e) => ({
        dead: acc.dead + (e.parsedDetails?.casualties_dead || 0),
        injured: acc.injured + (e.parsedDetails?.casualties_injured || 0),
      }),
      { dead: 0, injured: 0 }
    );

    // ── Region counts (by target field) ──
    const regionCounts = events.reduce((acc, e) => {
      const region = (e.target || '').trim();
      if (region) acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    // ── Classified percentage ──
    const unclassified = categoryCounts['غير مصنف'] || 0;
    const classifiedPct = total > 0
      ? Math.round(((total - unclassified) / total) * 100)
      : 0;

    return {
      loading,
      error,
      total,
      captureRate,
      warrantHitRate,
      totalValue: totalValue.toLocaleString() + ' DT',
      categoryCounts,
      events,
      dailyTrend,
      peakDay,
      avgPerDay,
      totalCasualties,
      regionCounts,
      classifiedPct,
    };
  }, [events, loading, error]);

  return stats;
};
