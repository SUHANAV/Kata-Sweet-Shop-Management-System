import { useState } from 'react';
import client from '../api/client';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await client.post('/auth/register', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      navigate('/');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full p-2 rounded bg-gray-700" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-700" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-red-400">{error}</div>}
        <button className="w-full p-2 bg-amber-500 rounded">Register</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link className="text-amber-400" to="/login">Login</Link></p>
    </div>
  );
}
