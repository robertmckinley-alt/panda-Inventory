const { useState: useStateApp } = React;
const { Sidebar, PageHeader, StatCard, HeaderActions } = window.UI;
const { DaysRemainingChart, InventoryValuePie, UsageTrendChart, DailySummaryPanel } = window.Charts;

function Dashboard({ snapshot }) {
  const { inventory, summary, usageHistory } = snapshot;
  return (
    <main className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1480px] mx-auto">
      <PageHeader
        eyebrow="Operations · Packaging"
        title="Inventory dashboard"
        subtitle="Daily SKU visibility, reorder alerts, and invoice-matched cost — synced from Drive every morning."
        right={<HeaderActions/>}/>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total inventory value" value={'$'+summary.totalInventoryValue.toLocaleString(undefined,{maximumFractionDigits:0})} helper="Matched to latest invoice cost" icon={Icon.Dollar} tone="accent"/>
        <StatCard label="Total SKUs tracked" value={summary.totalSkus.toLocaleString()} helper={`${summary.warningCount} warning · ${summary.criticalCount} critical`} icon={Icon.Boxes}/>
        <StatCard label="SKUs below 90 days" value={summary.criticalCount.toLocaleString()} helper={summary.newCriticalSkus.length ? `${summary.newCriticalSkus.length} new since yesterday` : 'No new criticals today'} icon={Icon.Alert} tone="critical"/>
        <StatCard label="Avg days remaining" value={summary.averageDaysRemaining.toFixed(1)} helper="Across all packaging SKUs" icon={Icon.Gauge}/>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <DaysRemainingChart inventory={inventory}/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryValuePie inventory={inventory}/>
            <UsageTrendChart history={usageHistory}/>
          </div>
        </div>
        <div className="lg:col-span-1">
          <DailySummaryPanel summary={summary}/>
        </div>
      </section>
      <section className="mt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight">SKU control table</h2>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Sorted by lowest days remaining first.</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-medium" style={{ color: 'var(--accent)' }}>
            View all {inventory.length} SKUs <Icon.ArrowRight size={13}/>
          </span>
        </div>
        <InventoryTable inventory={inventory} preview showFilters={false} showExport={false}/>
      </section>
    </main>
  );
}

function SkusPage({ snapshot }) {
  return (
    <main className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1480px] mx-auto">
      <PageHeader eyebrow="Inventory" title="All SKUs"
        subtitle={`${snapshot.inventory.length} packaging SKUs · last synced ${new Date().toLocaleString()}`}/>
      <div className="mt-6"><InventoryTable inventory={snapshot.inventory}/></div>
    </main>
  );
}

function AlertsPage({ snapshot }) {
  const critical = snapshot.inventory.filter(s => s.status === 'critical');
  const recipients = window.ALERT_RECIPIENTS;
  const recipientsLine = `Sends to: ${recipients.join(', ')}`;
  return (
    <main className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1480px] mx-auto">
      <PageHeader
        eyebrow="Alerts"
        title="Reorder alerts"
        subtitle={`${critical.length} SKU${critical.length === 1 ? '' : 's'} below 90 days of cover · target rebuild is 120 days plus lead time.`}
        right={
          <div className="flex flex-col items-end gap-1.5">
            <button title={recipientsLine}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-md"
              style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
              <Icon.Send size={14} stroke="var(--on-accent)"/>Send email alerts
            </button>
            <span className="text-[11px] tabular text-right max-w-[420px]" style={{ color: 'var(--text-muted)' }}>
              {recipientsLine}
            </span>
          </div>
        }/>
      <div className="mt-6"><AlertsList inventory={snapshot.inventory}/></div>
    </main>
  );
}

function App() {
  const initial = (typeof location !== 'undefined' && location.hash.replace('#','')) || 'dashboard';
  const [route, setRoute] = useStateApp(['dashboard','skus','alerts'].includes(initial) ? initial : 'dashboard');
  React.useEffect(() => { history.replaceState(null,'','#'+route); }, [route]);
  const snapshot = window.SEED;
  return (
    <div className="flex min-h-screen">
      <Sidebar route={route} setRoute={setRoute}/>
      <div className="flex-1 min-w-0">
        {route === 'dashboard' ? <Dashboard snapshot={snapshot}/> : null}
        {route === 'skus' ? <SkusPage snapshot={snapshot}/> : null}
        {route === 'alerts' ? <AlertsPage snapshot={snapshot}/> : null}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
