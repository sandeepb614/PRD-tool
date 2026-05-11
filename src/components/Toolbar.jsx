export default function Toolbar({
  search, onSearch,
  categories, category, onCategory,
  tier, onTier,
  count, total,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Search products…"
        value={search}
        onChange={e => onSearch(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={category}
        onChange={e => onCategory(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All categories</option>
        {categories.map(c => (
          <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
        ))}
      </select>

      <select
        value={tier}
        onChange={e => onTier(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All tiers</option>
        <option value="high">High</option>
        <option value="low">Low</option>
      </select>

      {(search || category || tier) && (
        <button
          onClick={() => { onSearch(''); onCategory(''); onTier('') }}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear filters
        </button>
      )}

      <span className="ml-auto text-sm text-gray-500">
        Showing <strong>{count}</strong> of <strong>{total}</strong>
      </span>
    </div>
  )
}
