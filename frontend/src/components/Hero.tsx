type HeroProps = {
  onCTAClick: () => void;
  totalSkus: number;
  readyToShip: number;
};

export default function Hero({ onCTAClick, totalSkus, readyToShip }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-amber-500/30 via-rose-500/20 to-slate-900/50 p-10 text-white shadow-2xl shadow-black/40">
      <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-amber-300/40 blur-3xl" />
      <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-rose-400/40 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="accent-pill w-fit border-white/20 text-white/80">Fresh drop - Edition 07</p>
          <div>
            <h1 className="font-display text-4xl leading-tight md:text-5xl">Heirloom sweets tempered overnight & dispatched at dawn.</h1>
            <p className="mt-4 text-lg text-amber-50/80">
              Small-batch laddoos, roasted nut brittles, and saffron caramels crafted inside KATA's atelier. Each box ships
              with tasting notes, reheating rituals, and a QR story from our chefs.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={onCTAClick} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5">
              Shop the atelier &gt;
            </button>
            <a href="mailto:concierge@katashop.com" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white hover:text-white">
              Talk to a concierge
            </a>
          </div>
          <div className="flex flex-wrap gap-8 text-sm text-amber-50/80">
            <div>
              <p className="text-3xl font-semibold text-white">{readyToShip}</p>
              <p className="uppercase tracking-[0.3em] text-xs">Ready to ship</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">{totalSkus}</p>
              <p className="uppercase tracking-[0.3em] text-xs">Seasonal SKUs</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">24h</p>
              <p className="uppercase tracking-[0.3em] text-xs">Pan-India courier</p>
            </div>
          </div>
        </div>
        <div className="rounded-[32px] border border-white/20 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between text-sm text-white/80">
            <p>Chef's tasting flight</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.4em]">New</span>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            {['Roasted pistachio + jaggery brittle', 'Ghee-roasted besan pearls', 'Rose-coconut dragees'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-white/80">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-100">White glove delivery</p>
            <p className="mt-2">Cold-chain shipping, SMS concierge, and eco-friendly packaging with hand-tied fabric wraps.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
