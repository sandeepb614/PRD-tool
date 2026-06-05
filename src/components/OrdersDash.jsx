import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6']
const STATUS_COLORS = { Completed: '#10b981', Returned: '#ef4444', Cancelled: '#f59e0b', Pending: '#6366f1' }

function fmt(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function KPI({ label, value, sub, color = 'indigo' }) {
  const ring = {
    indigo: 'border-indigo-400', green: 'border-emerald-400',
    amber: 'border-amber-400', red: 'border-red-400', blue: 'border-blue-400'
  }[color]
  return (
    <div className={`bg-white rounded-xl border-l-4 ${ring} px-5 py-4 shadow-sm`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, prefix = '$' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff' }}>
          {p.name}: {prefix === '$' ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function OrdersDash() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}orders_analytics.json`)
      .then(r => r.json())
      .then(setData)
  }, [])

  if (!data) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading analytics…</div>
  )

  const { summary, by_region, by_category, by_channel, by_segment,
    by_status, monthly, top_customers, return_rate_by_cat, data_quality } = data

  const regionData = Object.entries(by_region).map(([k, v]) => ({ name: k, revenue: v }))
  const catData = Object.entries(by_category).map(([k, v]) => ({ name: k, revenue: v }))
  const channelData = Object.entries(by_channel).map(([k, v]) => ({ name: k, revenue: v }))
  const segData = Object.entries(by_segment).map(([k, v]) => ({ name: k, revenue: v }))
  const statusData = Object.entries(by_status).map(([k, v]) => ({ name: k, value: v }))
  const returnData = Object.entries(return_rate_by_cat).map(([k, v]) => ({ name: k, rate: v }))
  const topCustData = [...top_customers].reverse()

  const dqTotal = data_quality.total
  const dqFlagged = data_quality.flagged
  const dqClean = dqTotal - dqFlagged
  const dqFlags = data_quality.flags

  return (
    <div className="overflow-y-auto pb-8 space-y-4">

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI label="Total Revenue" value={fmt(summary.total_revenue)} sub={`${summary.clean_orders.toLocaleString()} orders`} color="indigo" />
        <KPI label="Avg Order Value" value={fmt(summary.avg_order_value)} sub="clean orders only" color="blue" />
        <KPI label="Return Rate" value={`${summary.return_rate.toFixed(1)}%`} sub="of completed orders" color="red" />
        <KPI label="Avg Satisfaction" value={summary.avg_satisfaction.toFixed(2)} sub="out of 5.00" color="green" />
        <KPI label="Data Quality" value={`${((dqClean / dqTotal) * 100).toFixed(1)}%`} sub={`${dqFlagged.toLocaleString()} rows flagged`} color="amber" />
      </div>

      {/* ── Monthly trend ── */}
      <Section title="Monthly Revenue Trend (2023 – 2025)">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={m => m.slice(2)} interval={2} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} width={42} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2">
          Range: {fmt(Math.min(...monthly.map(m => m.revenue)))} – {fmt(Math.max(...monthly.map(m => m.revenue)))} / month. No clear seasonality — revenue is remarkably flat across 36 months, suggesting steady demand rather than holiday spikes.
        </p>
      </Section>

      {/* ── Region + Status ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Revenue by Region">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={regionData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={88} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 3, 3, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">Regions are within 10% of each other (~$42–47M). Asia Pacific leads narrowly. No single region dominates — healthy geographic spread.</p>
        </Section>

        <Section title="Order Status Breakdown">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                  dataKey="value" nameKey="name" paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s.name] }} />
                  <span className="text-gray-600 flex-1">{s.name}</span>
                  <span className="font-semibold text-gray-800">{s.value.toLocaleString()}</span>
                  <span className="text-gray-400">({(s.value / summary.clean_orders * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">74.6% completion rate. Returns (10.4%) and cancellations (7.9%) together represent ~$22M in lost/reversed revenue.</p>
        </Section>
      </div>

      {/* ── Category + Channel ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Revenue by Category">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={catData} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]} name="Revenue">
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">All five categories within 8% of each other ($43–47M). Electronics leads, but the spread is negligible — portfolio is well-balanced.</p>
        </Section>

        <Section title="Revenue by Channel">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={channelData} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]} name="Revenue">
                {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">Direct Sales leads ($57.6M, ~25%). Online is lowest at $53.9M — potential to invest in digital conversion given it's the cheapest channel to operate.</p>
        </Section>
      </div>

      {/* ── Segment + Return Rate ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Revenue by Customer Segment">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={segData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 3, 3, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">Government is the biggest segment ($64.5M, 29%) — 33% more than Enterprise. Strong public-sector dependency worth monitoring for budget cycle risk.</p>
        </Section>

        <Section title="Return Rate by Category">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={returnData} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} width={32} domain={[0, 15]} />
              <Tooltip formatter={(v) => [`${v}%`, 'Return Rate']} />
              <Bar dataKey="rate" radius={[3, 3, 0, 0]} name="Return Rate">
                {returnData.map((entry) => (
                  <Cell key={entry.name} fill={entry.rate > 11 ? '#ef4444' : entry.rate > 10 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">Office Supplies has the highest return rate (12.2%) — worth investigating quality or expectation mismatch. Furniture is the best at 9.2%.</p>
        </Section>
      </div>

      {/* ── Top Customers ── */}
      <Section title="Top 10 Customers by Revenue">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topCustData} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 3, 3, 0]} name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2">Top customer (Pat Hall) at $2.19M is ~43% above #10 ($1.54M). No extreme concentration — top 10 customers represent ~7.7% of total revenue, healthy spread.</p>
      </Section>

      {/* ── Data Quality ── */}
      <Section title="Data Quality Audit">
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-500">{((dqClean / dqTotal) * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Clean rows</p>
          </div>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="h-3 rounded-full bg-emerald-400 transition-all" style={{ width: `${(dqClean / dqTotal) * 100}%` }} />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-500">{((dqFlagged / dqTotal) * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Flagged</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Missing customer', count: dqFlags.missing_customer, color: 'bg-amber-100 text-amber-700' },
            { label: 'Satisfaction issues', count: dqFlags.satisfaction, color: 'bg-amber-100 text-amber-700' },
            { label: 'Date anomalies', count: dqFlags.date_issues, color: 'bg-red-100 text-red-700' },
            { label: 'Duplicate IDs', count: dqFlags.duplicate_ids, color: 'bg-red-100 text-red-700' },
            { label: 'Negative quantity', count: dqFlags.negative_qty, color: 'bg-red-100 text-red-700' },
            { label: 'Zero unit price', count: dqFlags.zero_price, color: 'bg-orange-100 text-orange-700' },
            { label: 'Geo mismatch', count: dqFlags.geo_mismatch, color: 'bg-orange-100 text-orange-700' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`rounded-lg px-3 py-2 ${color}`}>
              <p className="text-lg font-bold">{count.toLocaleString()}</p>
              <p className="text-xs">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Discounts already normalised (351 values divided ÷100). Region labels standardised (198 rows). Satisfaction out-of-range values cleared. Remaining flags preserved as columns in orders_cleaned.csv for manual review.</p>
      </Section>

    </div>
  )
}
