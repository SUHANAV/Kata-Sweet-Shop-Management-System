import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import * as userRepository from '../repositories/userRepository';

export function register(email: string, password: string) {
  const existing = userRepository.findByEmail(email);
  if (existing) throw new Error('Email already in use');
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = userRepository.create(email, passwordHash);
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user: { id: user.id, email: user.email, role: user.role }, token };
}

export function login(email: string, password: string) {
  const user = userRepository.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) throw new Error('Invalid credentials');
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user: { id: user.id, email: user.email, role: user.role }, token };
}
