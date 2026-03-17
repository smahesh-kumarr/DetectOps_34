import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/authApi';
import { Leaf, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('inspector');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await registerUser({ name, email, password, role });
      login(data.token, data.user.role, data.user.id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary-400/20 rounded-full blur-3xl mix-blend-multiply opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-3xl mix-blend-multiply opacity-40"></div>

      <div className="max-w-md w-full z-10 [animation:fade-in-up_0.6s_ease-out]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-primary-500/10 flex items-center justify-center mx-auto mb-6 transform -rotate-3">
            <Leaf className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">
            Create account
          </h2>
          <p className="mt-3 text-surface-500 font-medium">
            Join the civic network to keep the city clean
          </p>
        </div>

        <div className="glass-card p-8 md:p-10 border-t-8 border-primary-500 shadow-2xl">
          {error && (
             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-pulse">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
               <p className="font-semibold text-sm">{error}</p>
             </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="label-text" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="label-text" htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="jane@city.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="label-text" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="role">Account Role</label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  className="input-field appearance-none cursor-pointer border border-surface-200"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="inspector">Inspector (Can upload reports)</option>
                  <option value="officer">Officer (Can resolve violations)</option>
                </select>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-surface-400">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex justify-center items-center gap-2 mt-2 text-lg"
            >
              {isLoading ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <><UserPlus className="w-5 h-5"/> Register Account</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-surface-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 hover:underline transition-all">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
