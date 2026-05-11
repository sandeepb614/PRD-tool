import { useState, useMemo, Fragment } from 'react'

function buildSpecRows(product) {
  const rows = []
  for (const [group, groupData] of Object.entries(product.specs)) {
    if (group === 'compliance') {
      for (const [subgroup, subData] of Object.entries(groupData)) {
        if (subData && typeof subData === 'object' && !Array.isArray(subData)) {
          for (const field of Object.keys(subData)) {
            rows.push({ section: `compliance / ${subgroup}`, group: 'compliance', subgroup, field })
          }
        }
      }
    } else if (groupData && typeof groupData === 'object' && !Array.isArray(groupData)) {
      for (const field of Object.keys(groupData)) {
        rows.push({ section: group, group, subgroup: null, field })
      }
    }
  }
  return rows
}

function getVal(product, row) {
  if (!product) return undefined
  const s = product.specs
  return row.subgroup
    ? s.compliance?.[row.subgroup]?.[row.field]
    : s[row.group]?.[row.field]
}

function CellVal({ v }) {
  if (v === null || v === undefined) return <span className="text-gray-300">—</span>
  if (v === true)  return <span className="text-green-600 font-bold">✓</span>
  if (v === false) return <span className="text-red-400">✗</span>
  if (Array.isArray(v)) return <span>{v.length ? v.join(', ') : <span className="text-gray-300">—</span>}</span>
  return <span>{String(v)}</span>
}

export default function PrdView({ products }) {
  const [groupFilter, setGroupFilter] = useState('')

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category))].sort(),
    [products]
  )

  const specRows = useMemo(
    () => products[0] ? buildSpecRows(products[0]) : [],
    [products]
  )

  const sections = useMemo(
    () => [...new Set(specRows.map(r => r.section))],
    [specRows]
  )

  const productMap = useMemo(() => {
    const m = new Map()
    for (const p of products) m.set(`${p.category}__${p.tier}`, p)
    return m
  }, [products])

  const filteredRows = groupFilter
    ? specRows.filter(r => r.section === groupFilter)
    : specRows

  const totalCols = 2 + categories.length * 2

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All spec groups</option>
          {sections.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {groupFilter && (
          <button onClick={() => setGroupFilter('')} className="text-sm text-blue-600 hover:underline">
            Clear
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">
          <strong>{filteredRows.length}</strong> specs &middot; <strong>{categories.length}</strong> categories &middot; 2 tiers
        </span>
      </div>

      {/* table */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-max text-xs border-collapse">
          <thead>
            {/* row 1 – category headers */}
            <tr className="h-10">
              <th className="sticky left-0 z-30 bg-gray-100 border-b-2 border-r border-gray-300 px-2 text-left font-semibold text-gray-600 w-28 min-w-[7rem]">
                Group
              </th>
              <th className="sticky left-28 z-30 bg-gray-100 border-b-2 border-r-2 border-gray-300 px-2 text-left font-semibold text-gray-600 w-44 min-w-[11rem]">
                Spec
              </th>
              {categories.map(cat => (
                <th
                  key={cat}
                  colSpan={2}
                  className="bg-blue-50 border-b-2 border-r-2 border-gray-300 px-2 text-center font-semibold text-gray-700 whitespace-nowrap"
                >
                  {cat.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
            {/* row 2 – tier headers */}
            <tr>
              <th className="sticky left-0 z-30 top-10 bg-gray-100 border-b border-r border-gray-200 px-2 py-1" />
              <th className="sticky left-28 z-30 top-10 bg-gray-100 border-b border-r-2 border-gray-300 px-2 py-1" />
              {categories.map(cat => (
                <Fragment key={cat}>
                  <th className="top-10 bg-blue-50 border-b border-r border-gray-200 px-2 py-1 text-center font-medium text-blue-600 whitespace-nowrap">
                    High
                  </th>
                  <th className="top-10 bg-gray-50 border-b border-r-2 border-gray-300 px-2 py-1 text-center font-medium text-gray-400 whitespace-nowrap">
                    Low
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => {
              const isNewSection = i === 0 || filteredRows[i - 1].section !== row.section
              return (
                <Fragment key={`${row.section}__${row.field}`}>
                  {isNewSection && (
                    <tr className="bg-gray-100">
                      <td
                        colSpan={totalCols}
                        className="px-3 py-1 font-semibold text-gray-500 uppercase tracking-wide border-b border-t border-gray-200"
                      >
                        {row.section.replace(/_/g, ' ')}
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-amber-50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white border-b border-r border-gray-100 px-2 py-1.5 text-gray-400 whitespace-nowrap">
                      {row.section.replace(/_/g, ' ')}
                    </td>
                    <td className="sticky left-28 z-10 bg-white border-b border-r-2 border-gray-200 px-2 py-1.5 font-medium text-gray-700 whitespace-nowrap">
                      {row.field.replace(/_/g, ' ')}
                    </td>
                    {categories.map(cat => (
                      <Fragment key={cat}>
                        <td className="border-b border-r border-gray-100 px-2 py-1.5 text-center bg-blue-50/20 whitespace-nowrap">
                          <CellVal v={getVal(productMap.get(`${cat}__high`), row)} />
                        </td>
                        <td className="border-b border-r-2 border-gray-200 px-2 py-1.5 text-center whitespace-nowrap">
                          <CellVal v={getVal(productMap.get(`${cat}__low`), row)} />
                        </td>
                      </Fragment>
                    ))}
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
