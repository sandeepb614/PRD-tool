const COLUMNS = [
  { key: 'product_name', label: 'Product',      width: 'w-48' },
  { key: 'category',     label: 'Category',     width: 'w-36' },
  { key: 'tier',         label: 'Tier',         width: 'w-20' },
  { key: 'camera_mp',    label: 'Camera MP',    width: 'w-24' },
  { key: 'video_res',    label: 'Video Res',    width: 'w-24' },
  { key: 'ai_tops',      label: 'AI TOPS',      width: 'w-20' },
  { key: 'battery_mah',  label: 'Battery (mAh)',width: 'w-28' },
  { key: 'ip_rating',    label: 'IP Rating',    width: 'w-20' },
  { key: 'fcc',          label: 'FCC',          width: 'w-14' },
  { key: 'ce',           label: 'CE',           width: 'w-14' },
  { key: 'cra',          label: 'CRA',          width: 'w-14' },
]

function SortIcon({ active, dir }) {
  if (!active) return <span className="ml-1 text-gray-300">↕</span>
  return <span className="ml-1 text-blue-600">{dir === 'asc' ? '↑' : '↓'}</span>
}

function cell(product, key) {
  const s = product.specs
  switch (key) {
    case 'product_name': return product.product_name
    case 'category':     return product.category.replace(/_/g, ' ')
    case 'tier':
      return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          product.tier === 'high'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {product.tier}
        </span>
      )
    case 'camera_mp':
      return s.camera?.photo_resolution_mp != null
        ? `${s.camera.photo_resolution_mp} MP`
        : <span className="text-gray-300">—</span>
    case 'video_res':
      return s.camera?.video_resolution ?? <span className="text-gray-300">—</span>
    case 'ai_tops':
      return s.ai?.ai_tops != null
        ? s.ai.ai_tops
        : <span className="text-gray-300">—</span>
    case 'battery_mah':
      return s.battery?.battery_capacity_mah != null
        ? s.battery.battery_capacity_mah.toLocaleString()
        : <span className="text-gray-300">—</span>
    case 'ip_rating':
      return s.physical?.ip_rating ?? <span className="text-gray-300">—</span>
    case 'fcc': return badge(s.compliance?.regional_radio?.fcc_part_15_compliant)
    case 'ce':  return badge(s.compliance?.regional_radio?.ce_mark_compliant)
    case 'cra': return badge(s.compliance?.cybersecurity?.cra_compliant)
    default:     return '—'
  }
}

function badge(val) {
  if (val === true)  return <span className="text-green-600 font-bold">✓</span>
  if (val === false) return <span className="text-red-400">✗</span>
  return <span className="text-gray-300">—</span>
}

export default function ProductTable({ products, sortKey, sortDir, onSort, onSelect }) {
  return (
    <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap ${col.width}`}
              >
                {col.label}
                <SortIcon active={sortKey === col.key} dir={sortDir} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="text-center py-12 text-gray-400">
                No products match your filters.
              </td>
            </tr>
          )}
          {products.map(p => (
            <tr
              key={p.id}
              onClick={() => onSelect(p)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
            >
              {COLUMNS.map(col => (
                <td key={col.key} className="px-3 py-2.5 whitespace-nowrap text-gray-700">
                  {cell(p, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
