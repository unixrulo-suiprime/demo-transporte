import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import loginBg from '../assets/images/login-bg.png';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Ingresa tu correo y contraseña'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message ?? 'Credenciales inválidas');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 scale-105"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6) contrast(1.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-black/60" />
      </div>

      {/* Animated Light Trails Overlay (SVG/CSS) */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1 bg-blue-500/20 blur-3xl rotate-12 animate-pulse-subtle" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1 bg-orange-500/10 blur-3xl -rotate-12 animate-pulse-subtle" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6 animate-float">
        <div className="glass-premium rounded-3xl p-10 text-white border border-white/10">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              LogiCore
            </h1>
            <p className="text-gray-300 text-sm font-medium uppercase tracking-widest">
              TMS Enterprise System
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative group">
                <Input
                  label=""
                  placeholder="Usuario / Correo"
                  icon={<User className="text-blue-400" size={20} />}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:ring-blue-500 transition-all duration-300 h-14 rounded-xl"
                />
              </div>
              <div className="relative group">
                <Input
                  type="password"
                  label=""
                  placeholder="Contraseña"
                  icon={<Lock className="text-blue-400" size={20} />}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:ring-blue-500 transition-all duration-300 h-14 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center group cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" />
                <span className="ml-2 text-gray-300 group-hover:text-white transition-colors">Recordarme</span>
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">¿Olvidaste tu contraseña?</a>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">{error}</p>
            )}

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transform active:scale-[0.98] transition-all group"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
              {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} © Nexura | LogiCore TMS v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10 hidden sm:flex">
        <div className="text-white/40 text-[10px] uppercase tracking-tighter">
          Platform version 2.4.0-stable
        </div>
        <div className="flex gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <div className="text-white/40 text-[10px] uppercase tracking-tighter">System Online</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
