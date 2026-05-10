const { useState: useStateT, useMemo: useMemoT } = React;

function InventoryTable({ inventory, preview = false, showFilters = true, showExport = true, defaultFilter = 'all' }) {
  const [filter, setFilter] = useStateT(defaultFilter);
  const [query, setQuery] = useStateT('');
  const [sortKey, setSortKey] = useStateT('daysRemaining');
  const [sortDir, setSortDir] = useStateT('asc');

  const rows = useMemoT(() => {
    let r = inventory;
    if (filter !== 'all') r = r.filter(s => s.status === filter);
    const q = query.trim().toLowerCase();
    if (q) r = r.filter(s =>
      s.sku.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.subcategory||'').toLowerCase().includes(q));
    const dir = sortDir === 'asc' ? 1 : -1;
    r = [...r].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return preview ? r.slice(0, 8) : r;
  }, [inventory, filter, query, sortKey, sortDir, preview]);

  function toggleSort(k) {
    if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir(k === 'daysRemaining' ? 'asc' : 'desc'); }
  }

  const counts = useMemoT(() => ({
    all: inventory.length,
    critical: inventory.filter(s => s.status === 'critical').length,
    warning: inventory.filter(s => s.status === 'warning').length,
    healthy: inventory.filter(s => s.status === 'healthy').length
  }), [inventory]);

  const chips = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'critical', label: 'Critical', count: counts.critical },
    { key: 'warning', label: 'Warning', count: counts.warning },
    { key: 'healthy', label: 'Healthy', count: counts.healthy }
  ];

  const Th = ({ label, k, right }) => {
    const active = k && sortKey === k;
    return (
      <th className={`px-4 py-2.5 font-medium ${right ? 'text-right' : 'text-left'}`}
        style={{ borderBottom: '1px solid var(--border)' }}>
        {k ? (
          <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1"
            style={{ color: active ? 'var(--text)' : 'inherit' }}>
            {label}
            <Icon.ArrowUpDown size={11} />
            {active ? <span className="text-[9px]">{sortDir === 'asc' ? '↑' : '↓'}</span> : null}
          </button>
        ) : label}
      </th>
    );
  };

  return (
    <div className="panel-elev overflow-hidden">
      {showFilters ? (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-1.5">
            {chips.map(c => {
              const active = filter === c.key;
              return (
                <button key={c.key} onClick={() => setFilter(c.key)}
                  className="text-[12px] px-2.5 py-1 rounded-md transition"
                  style={{
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active ? 'var(--on-accent)' : 'var(--text-muted)',
                    border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                    fontWeight: active ? 600 : 500
                  }}>
                  {c.label}<span className="ml-1.5 tabular" style={{ color: active ? 'rgba(10,12,10,0.7)' : 'var(--text-subtle)' }}>{c.count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <Icon.Search size={13} stroke="var(--text-muted)" />
              <input value={query} onChange={(e)=>setQuery(e.target.value)}
                placeholder="Search SKU, name, category…"
                className="bg-transparent outline-none text-[12px] w-56" style={{ color: 'var(--text)' }}/>
            </div>
            {showExport ? (
              <button className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-md"
                style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                <Icon.Download size={13}/>Export CSV
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1100px] text-left text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}>
              <Th label="SKU" k="sku"/>
              <Th label="Description" k="name"/>
              <Th label="Category" k="category"/>
              <Th label="On hand" k="currentInventory" right/>
              <Th label="On order" right/>
              <Th label="Daily burn" k="averageDailyUsage" right/>
              <Th label="Days left" k="daysRemaining" right/>
              <Th label="Unit cost" right/>
              <Th label="Value" k="totalValue" right/>
              <Th label="Reorder qty" k="recommendedReorderQty" right/>
              <Th label="Status"/>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => {
              const daysColor = s.status === 'critical' ? 'var(--critical)' : s.status === 'warning' ? 'var(--warning)' : 'var(--text)';
              return (
                <tr key={s.sku} className="border-t" style={{ borderColor: 'var(--border)', background: i%2===0 ? 'transparent' : 'color-mix(in oklab, var(--bg) 55%, transparent)' }}>
                  <td className="px-4 py-3 font-mono text-[11.5px]">{s.sku}</td>
                  <td className="px-4 py-3 max-w-[280px] truncate" title={s.name}>{s.name}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{s.category}</span>
                    {s.subcategory ? <span style={{ color: 'var(--text-subtle)' }}> · {s.subcategory}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular">{s.currentInventory.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular" style={{ color: s.onOrder ? 'var(--text)' : 'var(--text-subtle)' }}>{s.onOrder ? s.onOrder.toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-right tabular">{s.averageDailyUsage.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular font-semibold" style={{ color: daysColor }}>{s.daysRemaining >= 365 ? '365+' : s.daysRemaining.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right tabular" style={{ color: 'var(--text-muted)' }}>${s.costPerUnit.toFixed(3)}</td>
                  <td className="px-4 py-3 text-right tabular">${s.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3 text-right tabular" style={{ color: s.recommendedReorderQty > 0 ? 'var(--text)' : 'var(--text-subtle)' }}>{s.recommendedReorderQty > 0 ? s.recommendedReorderQty.toLocaleString() : '—'}</td>
                  <td className="px-4 py-3"><UI.StatusPill status={s.status}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.InventoryTable = InventoryTable;
