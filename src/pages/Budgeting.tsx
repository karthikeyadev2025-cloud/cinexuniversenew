import { useState } from 'react'
import { Plus, Trash2, Download } from 'lucide-react'

interface BudgetItem {
  id: number
  category: string
  item: string
  estimated: number
  actual: number
}

const CATEGORIES = ['Pre-Production', 'Production', 'Post-Production', 'Marketing', 'Misc']

const INITIAL_ITEMS: BudgetItem[] = [
  { id: 1, category: 'Pre-Production', item: 'Script Development', estimated: 5000, actual: 4500 },
  { id: 2, category: 'Pre-Production', item: 'Location Scouting', estimated: 2000, actual: 1800 },
  { id: 3, category: 'Production', item: 'Camera Equipment Rental', estimated: 15000, actual: 14500 },
  { id: 4, category: 'Production', item: 'Crew Salaries', estimated: 25000, actual: 25000 },
  { id: 5, category: 'Production', item: 'Actor Fees', estimated: 20000, actual: 22000 },
  { id: 6, category: 'Post-Production', item: 'Editing', estimated: 8000, actual: 6000 },
  { id: 7, category: 'Post-Production', item: 'Sound Design', estimated: 5000, actual: 0 },
  { id: 8, category: 'Marketing', item: 'Festival Submissions', estimated: 3000, actual: 0 },
]

export default function Budgeting() {
  const [items, setItems] = useState<BudgetItem[]>(INITIAL_ITEMS)
  const [nextId, setNextId] = useState(9)
  const [newCategory, setNewCategory] = useState(CATEGORIES[0])
  const [newItem, setNewItem] = useState('')
  const [newEstimated, setNewEstimated] = useState('')

  const addItem = () => {
    if (!newItem.trim()) return
    const item: BudgetItem = {
      id: nextId,
      category: newCategory,
      item: newItem.trim(),
      estimated: Number(newEstimated) || 0,
      actual: 0,
    }
    setItems([...items, item])
    setNextId(nextId + 1)
    setNewItem('')
    setNewEstimated('')
  }

  const updateActual = (id: number, value: number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, actual: value } : i)))
  }

  const deleteItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id))
  }

  const totalEstimated = items.reduce((s, i) => s + i.estimated, 0)
  const totalActual = items.reduce((s, i) => s + i.actual, 0)
  const variance = totalActual - totalEstimated

  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    estimated: items.filter((i) => i.category === cat).reduce((s, i) => s + i.estimated, 0),
    actual: items.filter((i) => i.category === cat).reduce((s, i) => s + i.actual, 0),
  })).filter((c) => c.estimated > 0)

  const handleExport = () => {
    const csv = ['Category,Item,Estimated,Actual,Variance', ...items.map((i) => `${i.category},${i.item},${i.estimated},${i.actual},${i.actual - i.estimated}`), `,,Total,${totalEstimated},${totalActual},${variance}`].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'budget.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0] p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-white mb-1">Budget Tracker</h1>
            <p className="font-inter text-sm text-[#888888]">Track every rupee across your production</p>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 bg-[#D4A853] text-[#060606] px-4 py-2.5 rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111111] border border-[#242424] rounded-xl p-5">
            <p className="font-inter text-xs text-[#6B6B6B] mb-1">Total Estimated</p>
            <p className="font-cinzel text-2xl font-bold text-white">${totalEstimated.toLocaleString()}</p>
          </div>
          <div className="bg-[#111111] border border-[#242424] rounded-xl p-5">
            <p className="font-inter text-xs text-[#6B6B6B] mb-1">Total Actual</p>
            <p className="font-cinzel text-2xl font-bold text-white">${totalActual.toLocaleString()}</p>
          </div>
          <div className="bg-[#111111] border border-[#242424] rounded-xl p-5">
            <p className="font-inter text-xs text-[#6B6B6B] mb-1">Variance</p>
            <p className={`font-cinzel text-2xl font-bold ${variance > 0 ? 'text-[#E74C3C]' : 'text-[#27AE60]'}`}>
              {variance > 0 ? '+' : ''}${variance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111111] border border-[#242424] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#242424] text-left text-xs text-[#888888] uppercase">
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4 text-right">Estimated</th>
                      <th className="py-3 px-4 text-right">Actual</th>
                      <th className="py-3 px-4 text-right">Variance</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-[#1a1a1a] hover:bg-[#0D0D0D]">
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded bg-[#181818] text-[#A3A3A3] border border-[#242424]">{item.category}</span>
                        </td>
                        <td className="py-3 px-4 font-inter text-[#CCCCCC]">{item.item}</td>
                        <td className="py-3 px-4 text-right font-inter text-[#CCCCCC]">${item.estimated.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            value={item.actual}
                            onChange={(e) => updateActual(item.id, Number(e.target.value))}
                            className="w-24 bg-[#0D0D0D] border border-[#242424] rounded px-2 py-1 text-right text-sm text-white outline-none focus:border-[#D4A853]"
                          />
                        </td>
                        <td className={`py-3 px-4 text-right font-inter ${item.actual - item.estimated > 0 ? 'text-[#E74C3C]' : 'text-[#27AE60]'}`}>
                          {item.actual - item.estimated > 0 ? '+' : ''}${(item.actual - item.estimated).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded hover:bg-[#242424] text-[#6B6B6B] hover:text-[#E74C3C] transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Item */}
            <div className="bg-[#111111] border border-[#242424] rounded-xl p-5">
              <h3 className="font-space-grotesk text-sm font-semibold text-white mb-4">Add Budget Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4A853]"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
                />
                <input
                  type="number"
                  placeholder="Estimated cost"
                  value={newEstimated}
                  onChange={(e) => setNewEstimated(e.target.value)}
                  className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
                />
                <button
                  onClick={addItem}
                  className="flex items-center justify-center gap-2 bg-[#D4A853] text-[#060606] rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <div className="bg-[#111111] border border-[#242424] rounded-xl p-5">
              <h3 className="font-space-grotesk text-sm font-semibold text-white mb-4">By Category</h3>
              <div className="space-y-3">
                {byCategory.map((c) => (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-inter text-xs text-[#A3A3A3]">{c.category}</span>
                      <span className="font-inter text-xs text-white">${c.actual.toLocaleString()} / ${c.estimated.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-[#181818] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4A853] rounded-full" style={{ width: `${Math.min((c.actual / c.estimated) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart Visual */}
            <div className="bg-[#111111] border border-[#242424] rounded-xl p-5">
              <h3 className="font-space-grotesk text-sm font-semibold text-white mb-4">Budget Distribution</h3>
              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32 rounded-full" style={{
                  background: `conic-gradient(
                    #D4A853 ${(byCategory[0]?.estimated || 0) / totalEstimated * 100}%,
                    #2D9CDB ${(byCategory[0]?.estimated || 0) / totalEstimated * 100}% ${((byCategory[0]?.estimated || 0) + (byCategory[1]?.estimated || 0)) / totalEstimated * 100}%,
                    #27AE60 ${((byCategory[0]?.estimated || 0) + (byCategory[1]?.estimated || 0)) / totalEstimated * 100}% ${((byCategory[0]?.estimated || 0) + (byCategory[1]?.estimated || 0) + (byCategory[2]?.estimated || 0)) / totalEstimated * 100}%,
                    #9B59B6 0%
                  )`
                }} />
              </div>
              <div className="space-y-1.5">
                {byCategory.map((c, i) => {
                  const colors = ['#D4A853', '#2D9CDB', '#27AE60', '#9B59B6', '#E74C3C']
                  return (
                    <div key={c.category} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ background: colors[i % colors.length] }} />
                      <span className="font-inter text-xs text-[#A3A3A3]">{c.category}</span>
                      <span className="ml-auto font-inter text-xs text-white">{Math.round(c.estimated / totalEstimated * 100)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
