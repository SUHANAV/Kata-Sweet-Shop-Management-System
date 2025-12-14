const stats = [
  { label: 'Families served weekly', value: '480+', detail: 'Recurring subscriptions & gifting' },
  { label: 'Average rating', value: '4.9', detail: 'Across 1200+ handwritten reviews' },
  { label: 'Ingredient partners', value: '37', detail: 'Single-origin farms & co-ops' },
  { label: 'Same-day pickups', value: '12 cities', detail: 'COCO studio pickups before 7PM' },
];

export default function StatsStrip() {
  return (
    <section className="glass-panel grid gap-6 px-6 py-5 text-sm text-slate-200 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 border-white/5 md:border-l md:pl-6 first-of-type:border-0 first-of-type:pl-0">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{stat.label}</p>
          <p className="text-2xl font-semibold text-white">{stat.value}</p>
          <p className="text-xs text-slate-400">{stat.detail}</p>
        </div>
      ))}
    </section>
  );
}
