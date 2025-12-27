import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { Lock, AlertCircle } from 'lucide-react';
import { login } from '../services/api';
import { saveAuth } from '../services/authService';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
                const response = await login({ email, password });
                saveAuth(response);
                // if next param was provided, navigate there
                const params = new URLSearchParams(location.search);
                const next = params.get('next');
                if (next) {
                    navigate(next);
                } else {
                    navigate('/admin/profile');
                }
            } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                   <div className="bg-emerald-900 p-2.5 sm:p-3 rounded-full text-white">
                       <Lock className="h-7 w-7 sm:h-8 sm:w-8" />
                   </div>
                </div>
                <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Administrator Login
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Or <Link to="/" className="font-medium text-emerald-600 hover:text-emerald-500">return to home</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow-md sm:rounded-lg border border-slate-200">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700 text-sm">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <form className="space-y-5 sm:space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base transition-colors"
                                    placeholder="admin@school.edu.lr"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>
                                Sign in
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <p className="text-xs sm:text-sm text-center text-slate-500 leading-relaxed px-2">
                            Don't have an account? Contact your school administrator to register.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;