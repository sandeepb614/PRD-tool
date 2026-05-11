import { useState, useEffect, useMemo } from 'react'
import Toolbar from './components/Toolbar.jsx'
import ProductTable from './components/ProductTable.jsx'
import DetailDrawer from './components/DetailDrawer.jsx'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [sortKey, setSortKey] = useState('product_name')
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch('/data.json')
      .then(r => r.json())
      .then(d => { setProducts(d.products); setLoading(false) })
  }, [])

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category))].sort(),
    [products]
  )

  const filtered = useMemo(() => {
    let list = products
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
    if (categoryFilter) list = list.filter(p => p.category === categoryFilter)
    if (tierFilter) list = list.filter(p => p.tier === tierFilter)

    list = [...list].sort((a, b) => {
      const av = getValue(a, sortKey)
      const bv = getValue(b, sortKey)
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [products, search, categoryFilter, tierFilter, sortKey, sortDir])

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500 text-lg">
      Loading…
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">📡</span>
        <h1 className="text-xl font-semibold text-gray-800">Device Features Viewer</h1>
        <span className="ml-auto text-sm text-gray-400">{products.length} products · 26 categories</span>
      </header>

      <div className="flex-1 px-6 py-4 overflow-hidden flex flex-col gap-4">
        <Toolbar
          search={search} onSearch={setSearch}
          categories={categories} category={categoryFilter} onCategory={setCategoryFilter}
          tier={tierFilter} onTier={setTierFilter}
          count={filtered.length} total={products.length}
        />
        <ProductTable
          products={filtered}
          sortKey={sortKey} sortDir={sortDir}
          onSort={handleSort}
          onSelect={setSelected}
        />
      </div>

      {selected && (
        <DetailDrawer product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function getValue(product, key) {
  const s = product.specs
  switch (key) {
    case 'product_name': return product.product_name
    case 'category':     return product.category
    case 'tier':         return product.tier
    case 'camera_mp':    return s.camera?.photo_resolution_mp
    case 'video_res':    return s.camera?.video_resolution
    case 'ai_tops':      return s.ai?.ai_tops
    case 'battery_mah':  return s.battery?.battery_capacity_mah
    case 'ip_rating':    return s.physical?.ip_rating
    case 'fcc':          return s.compliance?.regional_radio?.fcc_part_15_compliant ? 1 : 0
    case 'ce':           return s.compliance?.regional_radio?.ce_mark_compliant ? 1 : 0
    case 'cra':          return s.compliance?.cybersecurity?.cra_compliant ? 1 : 0
    default:             return null
  }
}
