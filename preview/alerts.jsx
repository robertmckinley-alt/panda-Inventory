const ALERT_RECIPIENTS = [
  "tylerm@growopfarms.com",
  "doviatt@growopfarms.com",
  "charles@finishedgoods.com",
  "luke@finishedgoods.com"
];

function AlertsList({ inventory }) {
  const critical = inventory.filter(s => s.status === 'critical').sort((a,b) => a.daysRemaining - b.daysRemaining);
  return (
    <div className="space-y-3">
      {critical.map(s => {
        const urgency = s.daysRemaining < 30 ? 'extreme' : s.daysRemaining < 60 ? 'high' : 'elevated';
        const c = urgency === 'extreme' ? 'var(--critical)' : urgency === 'high' ? '#f97316' : 'var(--warning)';
        const Stat = ({ label, value, accent }) => (
          <div className="text-right md:text-left">
            <div className="text-[10.5px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <div className="text-[15px] font-semibold tabular mt-0.5" style={{ color: accent || 'var(--text)' }}>{value}</div>
          </div>
        );
        return (
          <div key={s.sku} className="panel-elev p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="hidden md:grid place-items-center w-10 h-10 rounded-md shrink-0"
              style={{ background: `color-mix(in oklab, ${c} 14%, transparent)`, border: `1px solid color-mix(in oklab, ${c} 28%, transparent)`, color: c }}>
              <Icon.Alert size={16} stroke={c} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-[12px]" style={{ color: 'var(--text-muted)' }}>{s.sku}</span>
                <span className="text-[14px] font-semibold tracking-tight">{s.name}</span>
              </div>
              <div className="mt-1 text-[12px] flex items-center gap-3 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                <span>{s.category} · {s.subcategory}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Icon.Clock size={11}/>Lead time {s.leadTimeDays}d</span>
                {s.lastInvoiceNumber ? (<><span>·</span><span>Last PO {s.lastInvoiceNumber} ({s.lastInvoiceDate})</span></>) : null}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 shrink-0">
              <Stat label="Days left" value={s.daysRemaining.toFixed(1)} accent={c}/>
              <Stat label="On hand" value={s.currentInventory.toLocaleString()}/>
              <Stat label="Recommended PO" value={s.recommendedReorderQty.toLocaleString()}/>
              <Stat label="PO value" value={'$'+(s.recommendedReorderQty*s.costPerUnit).toLocaleString(undefined,{maximumFractionDigits:0})}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.AlertsList = AlertsList;
window.ALERT_RECIPIENTS = ALERT_RECIPIENTS;
