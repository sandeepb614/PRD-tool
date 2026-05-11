import { useState } from 'react'

const TABS = [
  { id: 'camera',       label: '📷 Camera' },
  { id: 'memory',       label: '💾 Memory' },
  { id: 'connectivity', label: '📶 Connectivity' },
  { id: 'battery',      label: '🔋 Battery & Power' },
  { id: 'ai',           label: '🤖 AI' },
  { id: 'physical',     label: '📦 Physical' },
  { id: 'compliance',   label: '✅ Compliance' },
]

function SpecRow({ label, value }) {
  if (value === null || value === undefined) return null
  let display = value
  if (typeof value === 'boolean') display = value ? '✓ Yes' : '✗ No'
  if (Array.isArray(value)) display = value.join(', ') || '—'
  if (display === '') display = '—'
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <dt className="text-xs text-gray-500 font-medium break-words">{label.replace(/_/g, ' ')}</dt>
      <dd className={`text-xs break-words ${
        value === true ? 'text-green-600 font-semibold' :
        value === false ? 'text-red-400' : 'text-gray-800'
      }`}>{String(display)}</dd>
    </div>
  )
}

function SpecGroup({ data }) {
  if (!data || typeof data !== 'object') return <p className="text-gray-400 text-sm">—</p>
  return (
    <dl className="space-y-0">
      {Object.entries(data).map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
    </dl>
  )
}

function ComplianceTab({ compliance }) {
  const [open, setOpen] = useState(null)
  if (!compliance) return <p className="text-gray-400 text-sm">—</p>
  return (
    <div className="space-y-2">
      {Object.entries(compliance).map(([group, data]) => (
        <div key={group} className="border border-gray-200 rounded-md overflow-hidden">
          <button
            onClick={() => setOpen(open === group ? null : group)}
            className="w-full flex justify-between items-center px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>{group.replace(/_/g, ' ')}</span>
            <span className="text-gray-400">{open === group ? '▲' : '▼'}</span>
          </button>
          {open === group && (
            <div className="px-3 py-2">
              <SpecGroup data={data} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TabContent({ tab, specs }) {
  switch (tab) {
    case 'camera':       return <SpecGroup data={specs.camera} />
    case 'memory':       return (
      <div className="space-y-4">
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Memory</h4><SpecGroup data={specs.memory} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">SD Card</h4><SpecGroup data={specs.sd_card} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Display</h4><SpecGroup data={specs.display} /></div>
      </div>
    )
    case 'connectivity': return (
      <div className="space-y-4">
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Connectivity</h4><SpecGroup data={specs.connectivity} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Modem</h4><SpecGroup data={specs.modem} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ports</h4><SpecGroup data={specs.ports} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Audio</h4><SpecGroup data={specs.audio} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sensors</h4><SpecGroup data={specs.sensors} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Cloud / Software</h4><SpecGroup data={specs.cloud_software} /></div>
      </div>
    )
    case 'battery':      return (
      <div className="space-y-4">
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Battery</h4><SpecGroup data={specs.battery} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Power</h4><SpecGroup data={specs.power} /></div>
      </div>
    )
    case 'ai':           return <SpecGroup data={specs.ai} />
    case 'physical':     return (
      <div className="space-y-4">
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Physical</h4><SpecGroup data={specs.physical} /></div>
        <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Performance</h4><SpecGroup data={specs.performance} /></div>
      </div>
    )
    case 'compliance':   return <ComplianceTab compliance={specs.compliance} />
    default:             return null
  }
}

export default function DetailDrawer({ product, onClose }) {
  const [tab, setTab] = useState('camera')

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-20 transition-opacity"
        onClick={onClose}
      />

      {/* drawer */}
      <div className="fixed top-0 right-0 h-full w-[480px] max-w-full bg-white shadow-2xl z-30 flex flex-col">
        {/* header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              {product.category.replace(/_/g, ' ')} · {product.tier}
            </p>
            <h2 className="text-lg font-semibold text-gray-800 mt-0.5">{product.product_name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light mt-1 leading-none"
          >
            ✕
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-0 border-b border-gray-200 overflow-x-auto flex-shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <TabContent tab={tab} specs={product.specs} />
        </div>
      </div>
    </>
  )
}
