import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { formatINR } from '../utils/currency';

type SweetPayload = {
  name: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

type Sweet = SweetPayload & { id: number };

const inputClass = 'w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-300/60';
const labelClass = 'flex flex-col gap-1 text-xs uppercase tracking-[0.3em] text-slate-400';
type StatusMessage = { type: 'success' | 'error'; message: string } | null;

const isValidUrl = (value: string) => {
  if (!value) return true;
  if (value.startsWith('/uploads/')) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

type ImageUploadHandler = (file: File) => Promise<string>;

function SweetForm({ onSubmit, onImageUpload }: { onSubmit: (payload: SweetPayload) => void; onImageUpload: ImageUploadHandler }) {
  const [form, setForm] = useState({ name: '', category: '', price: '', quantity: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    return Boolean(
      form.name &&
      form.category &&
      !Number.isNaN(price) &&
      price >= 0 &&
      Number.isInteger(quantity) &&
      quantity >= 0 &&
      isValidUrl(form.imageUrl.trim())
    );
  }, [form]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const imageUrl = form.imageUrl.trim();
    onSubmit({
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      imageUrl: imageUrl ? imageUrl : undefined,
    });
    setForm({ name: '', category: '', price: '', quantity: '', imageUrl: '' });
    setUploadError(null);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err: any) {
      setUploadError(err?.response?.data?.error ?? 'Upload failed. Try a smaller JPEG/PNG.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className={labelClass}>
        Name
        <input className={inputClass} placeholder="Rose-pista praline" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
      </label>
      <label className={labelClass}>
        Category
        <input className={inputClass} placeholder="Festive" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
      </label>
      <label className={labelClass}>
        Image URL
        <input className={inputClass} placeholder="https://" value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
        {form.imageUrl && !isValidUrl(form.imageUrl.trim()) && <span className="text-[10px] text-rose-200">Enter a valid URL</span>}
      </label>
      <div className="flex flex-col gap-2 text-xs text-slate-400">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Upload image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
        {uploading && <span className="text-amber-200">Uploading...</span>}
        {uploadError && <span className="text-rose-200">{uploadError}</span>}
        {form.imageUrl && (
          <button type="button" className="text-left text-xs text-rose-200 underline" onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}>
            Remove image
          </button>
        )}
      </div>
      {form.imageUrl.trim() && isValidUrl(form.imageUrl.trim()) && (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img src={form.imageUrl} alt="Sweet preview" className="h-48 w-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Price (INR)
          <input className={inputClass} placeholder="480" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
        </label>
        <label className={labelClass}>
          Quantity
          <input className={inputClass} placeholder="24" value={form.quantity} onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))} />
        </label>
      </div>
      <button className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition ${canSubmit ? 'bg-amber-300 text-slate-900 hover:bg-amber-200' : 'cursor-not-allowed bg-white/10 text-slate-500'}`} onClick={handleSubmit} disabled={!canSubmit}>
        Add to catalog
      </button>
    </div>
  );
}

function EditableSweetCard({ sweet, onSave, onDelete, onRestock, onImageUpload }: { sweet: Sweet; onSave: (id: number, payload: SweetPayload) => void; onDelete: (id: number) => void; onRestock: (id: number, qty: number) => void; onImageUpload: ImageUploadHandler }) {
  const [form, setForm] = useState({
    name: sweet.name,
    category: sweet.category,
    price: String(sweet.price),
    quantity: String(sweet.quantity),
    imageUrl: sweet.imageUrl ?? '',
  });
  const [restockQty, setRestockQty] = useState('5');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      name: sweet.name,
      category: sweet.category,
      price: String(sweet.price),
      quantity: String(sweet.quantity),
      imageUrl: sweet.imageUrl ?? '',
    });
    setRestockQty('5');
  }, [sweet.id, sweet.name, sweet.category, sweet.price, sweet.quantity, sweet.imageUrl]);

  const dirty = useMemo(() => {
    return (
      form.name.trim() !== sweet.name ||
      form.category.trim() !== sweet.category ||
      Number(form.price) !== Number(sweet.price) ||
      Number(form.quantity) !== Number(sweet.quantity) ||
      form.imageUrl.trim() !== (sweet.imageUrl ?? '')
    );
  }, [form, sweet]);

  const canSave = useMemo(() => {
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    return (
      dirty &&
      form.name.trim() &&
      form.category.trim() &&
      !Number.isNaN(price) &&
      price >= 0 &&
      Number.isInteger(quantity) &&
      quantity >= 0 &&
      isValidUrl(form.imageUrl.trim())
    );
  }, [dirty, form]);

  const handleSave = () => {
    if (!canSave) return;
    onSave(sweet.id, {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      imageUrl: form.imageUrl.trim() ? form.imageUrl.trim() : null,
    });
  };

  const canRestock = () => {
    const qty = Number(restockQty);
    return Number.isInteger(qty) && qty > 0;
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err: any) {
      setUploadError(err?.response?.data?.error ?? 'Upload failed. Try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="glass-panel space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">SKU #{sweet.id}</p>
          <h3 className="text-xl font-semibold text-white">{sweet.name}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{sweet.category}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          Name
          <input className={inputClass} value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </label>
        <label className={labelClass}>
          Category
          <input className={inputClass} value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
        </label>
        <label className={labelClass}>
          Price
          <input className={inputClass} value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
        </label>
        <label className={labelClass}>
          Quantity
          <input className={inputClass} value={form.quantity} onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))} />
        </label>
        <label className={`md:col-span-2 ${labelClass}`}>
          Image URL
          <input className={inputClass} value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} placeholder="https://" />
          {form.imageUrl && !isValidUrl(form.imageUrl.trim()) && <span className="text-[10px] text-rose-200">Enter a valid URL</span>}
        </label>
      </div>
      <div className="flex flex-col gap-2 text-xs text-slate-400">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Upload new image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
        {uploading && <span className="text-amber-200">Uploading...</span>}
        {uploadError && <span className="text-rose-200">{uploadError}</span>}
        {form.imageUrl && (
          <button type="button" className="text-left text-xs text-rose-200 underline" onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}>
            Remove image
          </button>
        )}
      </div>
      {form.imageUrl.trim() && isValidUrl(form.imageUrl.trim()) && (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img src={form.imageUrl} alt={`${form.name || sweet.name} preview`} className="h-48 w-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button className={`rounded-full px-4 py-2 text-sm font-semibold transition ${canSave ? 'bg-blue-500 text-white hover:bg-blue-400' : 'cursor-not-allowed bg-white/10 text-slate-500'}`} onClick={handleSave} disabled={!canSave}>
          Save changes
        </button>
        <button className="rounded-full border border-rose-400/40 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-300" onClick={() => onDelete(sweet.id)}>
          Delete batch
        </button>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm">
          <input className="w-20 bg-transparent text-white outline-none" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="Qty" />
          <button className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${canRestock() ? 'bg-amber-300 text-slate-900' : 'cursor-not-allowed bg-white/10 text-slate-500'}`} onClick={() => canRestock() && onRestock(sweet.id, Number(restockQty))} disabled={!canRestock()}>
            Restock
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [status, setStatus] = useState<StatusMessage>(null);
  const queryClient = useQueryClient();
  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['sweets-admin'],
    queryFn: async () => (await client.get('/sweets')).data,
    onError: (err: any) => setStatus({ type: 'error', message: err?.response?.data?.error ?? 'Unable to load sweets.' }),
  });
  const uploadImage: ImageUploadHandler = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data: uploadResponse } = await client.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return uploadResponse.url as string;
  };

  const createMutation = useMutation({
    mutationFn: async (payload: SweetPayload) => (await client.post('/sweets', payload)).data,
    onSuccess: () => {
      setStatus({ type: 'success', message: 'Sweet added to catalog.' });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
    },
    onError: (err: any) => setStatus({ type: 'error', message: err?.response?.data?.error ?? 'Could not add sweet.' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: SweetPayload }) => (await client.put(`/sweets/${id}`, payload)).data,
    onSuccess: () => {
      setStatus({ type: 'success', message: 'Batch updated.' });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
    },
    onError: (err: any) => setStatus({ type: 'error', message: err?.response?.data?.error ?? 'Could not update batch.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await client.delete(`/sweets/${id}`)).data,
    onSuccess: () => {
      setStatus({ type: 'success', message: 'Sweet removed from catalog.' });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
    },
    onError: (err: any) => setStatus({ type: 'error', message: err?.response?.data?.error ?? 'Could not delete sweet.' }),
  });

  const restockMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => (await client.post(`/sweets/${id}/restock`, { quantity })).data,
    onSuccess: () => {
      setStatus({ type: 'success', message: 'Inventory topped up.' });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
    },
    onError: (err: any) => setStatus({ type: 'error', message: err?.response?.data?.error ?? 'Could not restock batch.' }),
  });

  useEffect(() => {
    if (!status) return;
    const timeout = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timeout);
  }, [status]);

  const sweets = data ?? [];
  const totalInventory = sweets.reduce((sum, sweet) => sum + Number(sweet.quantity), 0);
  const averagePrice = sweets.length ? sweets.reduce((sum, sweet) => sum + Number(sweet.price), 0) / sweets.length : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Chef's console</p>
        <h1 className="text-3xl font-semibold text-white">Oversee inventory, batches, and dispatch</h1>
        <p className="text-sm text-slate-400">Track every SKU from prep table to courier. Adjust pricing, top up inventory, or archive seasonal specials here.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">SKUs online</p>
            <p className="text-2xl font-semibold text-white">{sweets.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total boxes on hand</p>
            <p className="text-2xl font-semibold text-white">{totalInventory}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Avg price</p>
            <p className="text-2xl font-semibold text-white">{formatINR(averagePrice || 0)}</p>
          </div>
        </div>
      </header>
      {status && (
        <div className={`rounded-3xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100' : 'border-rose-400/40 bg-rose-500/10 text-rose-100'}`}>
          {status.message}
        </div>
      )}
      {error && <div className="rounded-3xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">Unable to load sweets. Check your session or API.</div>}
      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="glass-panel space-y-6 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Add a batch</p>
            <h2 className="text-2xl font-semibold text-white">New kitchen drop</h2>
          </div>
          <SweetForm onSubmit={(p) => createMutation.mutate(p)} onImageUpload={uploadImage} />
        </section>
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Manage sweets</h2>
            {isLoading && <span className="text-sm text-slate-400">Loading...</span>}
          </div>
          <div className="space-y-4">
            {sweets.map((sweet: Sweet) => (
              <EditableSweetCard
                key={sweet.id}
                sweet={sweet}
                onSave={(id, payload) => updateMutation.mutate({ id, payload })}
                onDelete={(id) => deleteMutation.mutate(id)}
                onRestock={(id, quantity) => restockMutation.mutate({ id, quantity })}
                onImageUpload={uploadImage}
              />
            ))}
            {!isLoading && !sweets.length && <div className="rounded-3xl border border-dashed border-white/15 px-6 py-10 text-center text-slate-400">No sweets online right now. Add one to get the shelves moving.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
