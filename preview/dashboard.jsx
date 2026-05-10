const R = window.Recharts;
const tooltipStyle = {
  background: 'var(--panel-elev)',
  border: '1px solid var(--border-strong)',
  borderRadius: 8, fontSize: 12, color: 'var(--text)', padding: '8px 10px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
};
const STATUS_COLOR = { healthy: '#10b981', warning: '#f59e0b', critical: '#ef4444' };
const PIE_PALETTE = ['#72BC44','#8FD158','#4a8f2c','#d4a843','#ef4444','#6b7280','#94a3b8','#cbd5e1'];

function ChartCard({ title, subtitle, height = 280, children }) {
  return (
    <div className="panel-elev p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold tracking-tight">{title}</h3>
        {subtitle ? <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p> : null}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

function DaysRemainingChart({ inventory }) {
  const data = [...inventory].sort((a,b)=>a.daysRemaining-b.daysRemaining).slice(0,20)
    .map(s => ({ sku: s.sku, name: s.name, days: Math.min(s.daysRemaining, 365), status: s.status }));
  return (
    <ChartCard title="Lowest 20 SKUs by days remaining" subtitle="Color-coded against the 90 / 120 day thresholds" height={320}>
      <R.ResponsiveContainer width="100%" height="100%">
        <R.BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
          <R.CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <R.XAxis dataKey="sku" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} interval={0} angle={-35} textAnchor="end" height={56}/>
          <R.YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} width={42}/>
          <R.Tooltip cursor={{ fill: 'var(--accent-soft)' }} contentStyle={tooltipStyle}
            formatter={(v) => [v.toFixed(1) + ' days', 'Days remaining']}
            labelFormatter={(_, p) => p?.[0]?.payload?.name ?? ''} />
          <R.Bar dataKey="days" radius={[4,4,0,0]}>
            {data.map((d,i) => <R.Cell key={i} fill={STATUS_COLOR[d.status]} />)}
          </R.Bar>
        </R.BarChart>
      </R.ResponsiveContainer>
    </ChartCard>
  );
}

function InventoryValuePie({ inventory }) {
  const byCat = {};
  inventory.forEach(i => {
    const k = i.subcategory || i.category;
    byCat[k] = (byCat[k] || 0) + i.totalValue;
  });
  const data = Object.entries(byCat).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a,b)=>b.value-a.value).slice(0,8);
  const total = data.reduce((s,d)=>s+d.value,0);
  return (
    <ChartCard title="Inventory value by category" subtitle={`$${total.toLocaleString(undefined,{maximumFractionDigits:0})} on hand · top 8`} height={320}>
      <R.ResponsiveContainer width="100%" height="100%">
        <R.PieChart>
          <R.Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={1}
            stroke="var(--panel-elev)" strokeWidth={2}>
            {data.map((_,i)=> <R.Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
          </R.Pie>
          <R.Tooltip contentStyle={tooltipStyle} formatter={(v)=>['$'+v.toLocaleString(undefined,{maximumFractionDigits:0}), 'Value']} />
          <R.Legend verticalAlign="bottom" iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
        </R.PieChart>
      </R.ResponsiveContainer>
    </ChartCard>
  );
}

function UsageTrendChart({ history }) {
  const data = history.map(p => ({ date: p.date, usage: p.totalUsage }));
  return (
    <ChartCard title="Usage trend · last 90 days" subtitle="Total daily burn across all SKUs" height={320}>
      <R.ResponsiveContainer width="100%" height="100%">
        <R.AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#72BC44" stopOpacity={0.5}/>
              <stop offset="100%" stopColor="#72BC44" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <R.CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <R.XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'var(--border)' }}
            tickFormatter={(d)=>{ const dt=new Date(d); return (dt.getMonth()+1)+'/'+dt.getDate(); }} minTickGap={28}/>
          <R.YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} width={48}
            tickFormatter={(v)=> v>=1000 ? Math.round(v/1000)+'k' : ''+v} />
          <R.Tooltip cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={tooltipStyle}
            formatter={(v)=>[v.toLocaleString()+' units','Daily burn']} labelFormatter={(d)=>new Date(d).toDateString()} />
          <R.Area type="monotone" dataKey="usage" stroke="#72BC44" strokeWidth={2} fill="url(#usageFill)" />
        </R.AreaChart>
      </R.ResponsiveContainer>
    </ChartCard>
  );
}

function DailySummaryPanel({ summary }) {
  const Stat = ({ icon, label, value, tone }) => (
    <div className="rounded-md p-3"
      style={{ background: `color-mix(in oklab, ${tone} 8%, transparent)`, border: `1px solid color-mix(in oklab, ${tone} 16%, transparent)` }}>
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{icon}{label}</div>
      <div className="mt-1 text-[18px] font-semibold tabular leading-none">{value}</div>
    </div>
  );
  const Section = ({ title, children }) => (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2.5" style={{ color: 'var(--text-muted)' }}>{title}</div>
      {children}
    </div>
  );
  return (
    <div className="panel-elev p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight">Daily summary</h3>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {new Date(summary.date).toLocaleDateString(undefined,{ weekday:'long', month:'long', day:'numeric' })}
          </p>
        </div>
        <span className="text-[10.5px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-md"
          style={{ background: 'color-mix(in oklab, var(--healthy) 14%, transparent)', color: 'var(--healthy)' }}>Live</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Icon.ArrowDownCircle size={13} stroke="var(--healthy)" />} label="Inbound (on order)" value={summary.inboundUnits.toLocaleString()} tone="var(--healthy)"/>
        <Stat icon={<Icon.ArrowUpCircle size={13} stroke="var(--accent)" />} label="Outbound today" value={summary.outboundUnits.toLocaleString()} tone="#72BC44"/>
        <Stat icon={<Icon.Alert size={13} stroke="var(--critical)" />} label="New critical SKUs" value={summary.newCriticalSkus.length} tone="var(--critical)"/>
        <Stat icon={<Icon.Truck size={13} stroke="var(--warning)" />} label="Reorders pending" value={(summary.criticalCount + summary.warningCount).toLocaleString()} tone="var(--warning)"/>
      </div>
      <Section title="Top movers">
        <ul className="space-y-2">
          {summary.topMovers.map(m => (
            <li key={m.sku} className="flex items-center gap-3 text-[12.5px]">
              <Icon.Flame size={13} stroke="var(--warning)" />
              <span className="font-mono text-[11.5px] shrink-0" style={{ color: 'var(--text-muted)' }}>{m.sku}</span>
              <span className="truncate flex-1" title={m.name}>{m.name}</span>
              <span className="tabular shrink-0 font-semibold">{m.averageDailyUsage.toLocaleString()}<span className="ml-1 font-normal" style={{ color: 'var(--text-subtle)' }}>/day</span></span>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Most urgent reorders">
        {summary.mostUrgent.length ? (
          <ul className="space-y-2">
            {summary.mostUrgent.map(s => (
              <li key={s.sku} className="flex items-center gap-3 text-[12.5px]">
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--critical)' }}/>
                <span className="font-mono text-[11.5px] shrink-0" style={{ color: 'var(--text-muted)' }}>{s.sku}</span>
                <span className="truncate flex-1">{s.name}</span>
                <span className="tabular shrink-0 font-semibold" style={{ color: 'var(--critical)' }}>{s.daysRemaining.toFixed(1)}d</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No SKUs in the critical band today.</p>}
      </Section>
    </div>
  );
}

window.Charts = { DaysRemainingChart, InventoryValuePie, UsageTrendChart, DailySummaryPanel };
