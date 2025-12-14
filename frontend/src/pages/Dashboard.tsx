import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import client from '../api/client';
import SweetCard, { Sweet } from '../components/SweetCard';
import Hero from '../components/Hero';
import StatsStrip from '../components/StatsStrip';
import Testimonials from '../components/Testimonials';
import CategoryPills from '../components/CategoryPills';
import CartPanel, { CartItem } from '../components/CartPanel';
import { formatINR } from '../utils/currency';

async function fetchSweets(params: Record<string, any>) {
  const qp = new URLSearchParams(params as any).toString();
  const url = qp ? `/sweets/search?${qp}` : '/sweets';
  const res = await client.get(url);
  return res.data as Sweet[];
}

type StatusMessage = { type: 'success' | 'error'; message: string } | null;

export default function Dashboard() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const storeRef = useRef<HTMLDivElement>(null);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['sweets', name, category, minPrice, maxPrice],
    queryFn: () => fetchSweets({ name, category, minPrice, maxPrice }),
  });

  const filteredData = useMemo(() => data ?? [], [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((sweet) => { if (sweet.category) set.add(sweet.category); });
    return ['All', ...Array.from(set)];
  }, [data]);

  const seasonalSpotlight = useMemo(() => filteredData.slice(0, 3), [filteredData]);
  const totalSkus = data?.length ?? 0;
  const readyToShip = (data ?? []).filter((sweet) => sweet.quantity > 0).length;

  useEffect(() => {
    if (!status) return;
    const timeout = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(timeout);
  }, [status]);

  const addToCart = (sweet: Sweet, quantity: number) => {
    if (quantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.sweet.id === sweet.id);
      if (existing) {
        const nextQuantity = Math.min(sweet.quantity, existing.quantity + quantity);
        return prev.map((item) => item.sweet.id === sweet.id ? { ...item, quantity: nextQuantity } : item);
      }
      return [...prev, { sweet, quantity: Math.min(quantity, sweet.quantity) }];
    });
    setStatus({ type: 'success', message: `${sweet.name} tucked into your hamper.` });
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    setCart((prev) => {
      const next = prev.map((item) => {
        if (item.sweet.id !== id) return item;
        const max = Math.max(0, item.sweet.quantity);
        if (max === 0) return { ...item, quantity: 0 };
        const clamped = Math.min(Math.max(quantity, 1), max);
        return { ...item, quantity: clamped };
      });
      return next.filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.sweet.id !== id));
  };

  const checkout = async () => {
    if (!cart.length) {
      setStatus({ type: 'error', message: 'Add at least one sweet before checking out.' });
      return;
    }
    setIsCheckingOut(true);
    try {
      for (const item of cart) {
        await client.post(`/sweets/${item.sweet.id}/purchase`, { quantity: item.quantity });
      }
      setCart([]);
      setStatus({ type: 'success', message: 'Order confirmed. We will share courier tracking shortly.' });
      await refetch();
    } catch (error: any) {
      setStatus({ type: 'error', message: error?.response?.data?.error ?? 'Unable to complete order.' });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const quickPurchase = async (id: number) => {
    try {
      await client.post(`/sweets/${id}/purchase`, {});
      setStatus({ type: 'success', message: 'Box reserved. We will notify you once dispatched.' });
      await refetch();
    } catch (error: any) {
      setStatus({ type: 'error', message: error?.response?.data?.error ?? 'Unable to reserve box.' });
    }
  };

  return (
    <div className="space-y-12">
      <Hero onCTAClick={() => storeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} totalSkus={totalSkus} readyToShip={readyToShip} />
      <StatsStrip />
      <section ref={storeRef} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <div className="glass-panel grid gap-4 p-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Search sweets</label>
              <input className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" placeholder="Name, flavor, style" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Free-form category</label>
                <input className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" placeholder="e.g. Pistachio" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Availability</p>
                <p>All batches are visible. Sold-out sweets stay listed for waitlists.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <input className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
            <button className="rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-amber-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/40" onClick={() => refetch()}>
              Refine search
            </button>
          </div>
          <CategoryPills categories={categories} selected={category || 'All'} onSelect={(value) => setCategory(value === 'All' ? '' : value)} />
          {status && (
            <div className={`rounded-2xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100' : 'border-rose-400/40 bg-rose-500/10 text-rose-100'}`}>
              {status.message}
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-72 animate-pulse rounded-[32px] border border-white/5 bg-white/5" />
              ))
            ) : filteredData.length ? (
              filteredData.map((sweet) => (
                <SweetCard key={sweet.id} sweet={sweet} onAddToCart={addToCart} onQuickBuy={quickPurchase} />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/20 p-10 text-center text-slate-400 md:col-span-2">
                We could not find a batch that matches those filters. Try widening your search.
              </div>
            )}
          </div>
          {!!seasonalSpotlight.length && (
            <section className="rounded-[32px] border border-amber-200/20 bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-amber-700/30 p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-100">Seasonal atelier picks</p>
                  <h3 className="text-2xl font-semibold text-white">Chef-selected boxes for gifting</h3>
                  <p className="text-sm text-amber-50/80">Curated in micro batches each dawn. Limited pieces per day.</p>
                </div>
                <div className="grid gap-3 md:w-1/2">
                  {seasonalSpotlight.map((sweet) => (
                    <div key={sweet.id} className="flex items-center justify-between rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-white">{sweet.name}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-100">{sweet.category}</p>
                      </div>
                      <div className="text-right text-amber-200">
                        <p>{formatINR(Number(sweet.price))}</p>
                        <p className="text-xs text-white/70">{sweet.quantity} left</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
        <CartPanel
          items={cart}
          onQuantityChange={updateCartQuantity}
          onRemove={removeFromCart}
          onCheckout={checkout}
          isCheckingOut={isCheckingOut}
          status={status}
        />
      </section>
      <Testimonials />
    </div>
  );
}
