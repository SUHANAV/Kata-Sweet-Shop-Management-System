import * as sweetRepository from '../repositories/sweetRepository';

export type SweetInput = {
  name: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

export function create(data: SweetInput) {
  return sweetRepository.create(data);
}

export function list() {
  return sweetRepository.listAll();
}

export function search(query: {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  return sweetRepository.search(query);
}

export function update(id: number, data: Partial<SweetInput>) {
  return sweetRepository.update(id, data);
}

export function remove(id: number) {
  return sweetRepository.remove(id);
}

export function purchase(id: number, quantity: number = 1) {
  if (quantity <= 0) throw new Error('Quantity must be positive');
  return sweetRepository.decrementQuantity(id, quantity);
}

export function restock(id: number, quantity: number = 1) {
  if (quantity <= 0) throw new Error('Quantity must be positive');
  return sweetRepository.incrementQuantity(id, quantity);
}
