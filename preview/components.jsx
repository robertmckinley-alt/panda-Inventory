const { useState, useMemo, useEffect } = React;

function fmtNum(n) { return n.toLocaleString(); }
function fmtMoney(n) { return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function Sidebar({ route, setRoute }) {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: Icon.Dashboard },
    { id: 'skus', label: 'All SKUs', icon: Icon.Package },
    { id: 'alerts', label: 'Reorder Alerts', icon: Icon.Bell }
  ];
  const logoSrc = dark
    ? 'https://phatpanda.com/assets/img/logos/PP-WhiteGreen-Stacked.svg'
    : 'https://phatpanda.com/assets/img/logos/PP-BlackGreen-Square.svg';
  return (
    <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r"
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
      <div className="px-5 pt-6 pb-5 flex flex-col items-center gap-2.5">
        <img src={logoSrc} alt="Phat Panda" style={{ height: 64, width: 'auto', display: 'block' }} />
        <div className="wordmark text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Packaging Controls</div>
      </div>
      <nav className="px-3 flex-1 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = route === item.id;
          const IC = item.icon;
          return (
            <button key={item.id} onClick={() => setRoute(item.id)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition text-left relative"
              style={{
                background: active ? 'var(--accent-soft)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 500,
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                paddingLeft: active ? 10 : 12
              }}>
              <IC size={15} stroke={active ? 'var(--accent)' : 'currentColor'} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={toggle}
          className="w-full flex items-center justify-between rounded-md px-3 py-2 text-[12px]"
          style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-2">
            {dark ? <Icon.Moon size={14}/> : <Icon.Sun size={14}/>}
            {dark ? 'Dark' : 'Light'} mode
          </span>
          <span className="relative inline-flex h-4 w-7 rounded-full"
            style={{ background: dark ? 'var(--accent)' : 'var(--border-strong)' }}>
            <span className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition" style={{ left: dark ? '14px' : '2px' }} />
          </span>
        </button>
      </div>
    </aside>
  );
}

function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        {eyebrow ? <div className="h-eyebrow text-[10.5px] mb-2">{eyebrow}</div> : null}
        <h1 className="h-display text-[24px] md:text-[28px] leading-[1.05]">{title}</h1>
        {subtitle ? <p className="mt-2.5 text-[13.5px] max-w-[640px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

function StatCard({ label, value, helper, icon, tone = 'default' }) {
  const tint = tone === 'critical' ? 'var(--critical)' : tone === 'accent' ? 'var(--accent)' : 'var(--text-muted)';
  const IC = icon;
  return (
    <div className="panel-elev p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {IC ? <IC size={15} stroke={tint} /> : null}
      </div>
      <div className="text-[28px] leading-none font-semibold tabular tracking-tight">{value}</div>
      {helper ? <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{helper}</div> : null}
    </div>
  );
}

function StatusPill({ status }) {
  const c = status === 'critical' ? 'var(--critical)' : status === 'warning' ? 'var(--warning)' : 'var(--healthy)';
  const label = status[0].toUpperCase() + status.slice(1);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color: c, background: `color-mix(in oklab, ${c} 14%, transparent)`, border: `1px solid color-mix(in oklab, ${c} 28%, transparent)` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
      {label}
    </span>
  );
}

function HeaderActions() {
  const [syncing, setSyncing] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-2 rounded-md"
        style={{ background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)' }}>
        <Icon.Download size={14} />
        Export critical
      </button>
      <button onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1200); }}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-md text-white disabled:opacity-60"
        disabled={syncing}
        style={{ background: 'var(--accent)' }}>
        <span className={syncing ? 'animate-spin inline-flex' : 'inline-flex'}><Icon.Refresh size={14} /></span>
        {syncing ? 'Syncing…' : 'Sync now'}
      </button>
    </div>
  );
}

window.UI = { Sidebar, PageHeader, StatCard, StatusPill, HeaderActions, fmtNum, fmtMoney };
