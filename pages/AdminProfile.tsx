import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Building2, Shield, LogOut, ArrowLeft, School as SchoolIcon, Calendar } from 'lucide-react';
import { getCurrentUser, User as UserType } from '../services/api';
import { getCurrentUser as getCachedUser, clearAuth, isAuthenticated } from '../services/authService';
import { fetchSchoolById } from '../services/api';
import { School } from '../types';
import Button from '../components/Button';

const AdminProfile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType | null>(null);
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (!isAuthenticated()) {
                navigate('/admin-login');
                return;
            }

            try {
                setLoading(true);
                // Try to get user from cache first
                const cachedUser = getCachedUser();
                if (cachedUser) {
                    setUser(cachedUser);
                    // Then fetch fresh data
                    const freshUser = await getCurrentUser();
                    setUser(freshUser);

                    // Fetch school information if user has a school_id
                    if (freshUser.school_id) {
                        try {
                            const schoolData = await fetchSchoolById(freshUser.school_id);
                            setSchool(schoolData);
                        } catch (err) {
                            console.error('Error fetching school:', err);
                        }
                    }
                } else {
                    // No cached user, fetch from API
                    const freshUser = await getCurrentUser();
                    setUser(freshUser);

                    if (freshUser.school_id) {
                        try {
                            const schoolData = await fetchSchoolById(freshUser.school_id);
                            setSchool(schoolData);
                        } catch (err) {
                            console.error('Error fetching school:', err);
                        }
                    }
                }
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load profile');
                // If authentication fails, redirect to login
                if (err.message.includes('Not authenticated') || err.message.includes('401')) {
                    clearAuth();
                    navigate('/admin-login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    const handleLogout = () => {
        clearAuth();
        navigate('/admin-login');
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen py-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="bg-slate-50 min-h-screen py-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link to="/admin-login" className="text-emerald-600 hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-emerald-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-full">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="text-emerald-200">Administrator Profile</p>
                            {user.role === 'superadmin' && (
                                <div className="mt-2">
                                    <a href="/superadmin" className="text-sm text-white/90 underline">Open Superadmin Portal</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* User Information Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Shield className="h-6 w-6 text-emerald-600" />
                                Account Information
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Mail className="h-5 w-5 mr-3 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500">Email Address</p>
                                        <p className="text-slate-900 font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <User className="h-5 w-5 mr-3 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500">Full Name</p>
                                        <p className="text-slate-900 font-medium">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Shield className="h-5 w-5 mr-3 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500">Role</p>
                                        <p className="text-slate-900 font-medium capitalize">
                                            {user.role === 'administrator' ? 'Administrator' : 'Superadmin'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 mr-3 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500">Member Since</p>
                                        <p className="text-slate-900 font-medium">
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* School Information Card */}
                        {school ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <SchoolIcon className="h-6 w-6 text-emerald-600" />
                                    Your School
                                </h2>
                                <div className="flex items-start gap-6">
                                    {school.image && (
                                        <img 
                                            src={school.image} 
                                            alt={school.name}
                                            className="w-24 h-24 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-slate-900 mb-2">{school.name}</h3>
                                        <p className="text-slate-600 mb-4">{school.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500">Location: </span>
                                                <span className="text-slate-900">{school.location}, {school.county}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Type: </span>
                                                <span className="text-slate-900">{school.type}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Link to={`/admin/manage-school/${school.id}`}>
                                            <Button variant="outline" size="sm">
                                                Manage School
                                            </Button>
                                        </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Building2 className="h-6 w-6 text-slate-400" />
                                    School Assignment
                                </h2>
                                <p className="text-slate-600">
                                    You are not currently assigned to a school. Please contact the system administrator.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                {school && (
                                    <Link to={`/admin/manage-school/${school.id}`}>
                                        <Button className="w-full" variant="outline">
                                            Manage School
                                        </Button>
                                    </Link>
                                )}
                                <Button 
                                    className="w-full" 
                                    variant="outline"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Log Out
                                </Button>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                            <h3 className="font-semibold text-emerald-900 mb-2">Account Status</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <span className="text-emerald-900 font-medium">
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;

