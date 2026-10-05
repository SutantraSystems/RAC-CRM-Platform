import React, { useState } from 'react';
import { Mail, User as UserIcon, LogOut, Pencil, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authApi';
import Toast from '../components/ui/Toast';

export default function Profile() {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const fullName = user?.full_name || '';
    const email = user?.email || '';
    const initials = fullName
        ? fullName.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : (email ? email.slice(0, 2).toUpperCase() : '??');

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate('/login', { replace: true });
        }
    };

    const startEditing = () => {
        setNameInput(fullName);
        setError('');
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setError('');
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const cleaned = nameInput.trim().replace(/\s+/g, ' ');

        if (!cleaned) {
            setError('Full name is required.');
            return;
        }

        if (cleaned.length > 150) {
            setError('Full name must be 150 characters or fewer.');
            return;
        }

        // Nothing changed — just close the editor.
        if (cleaned === fullName) {
            setIsEditing(false);
            return;
        }

        try {
            setSaving(true);
            setError('');

            const updatedUser = await updateProfile({
                full_name: cleaned,
            });

            setUser(updatedUser);

            setIsEditing(false);
            setToast({
                type: 'success',
                message: 'Profile updated successfully.',
            });
        } catch (err) {
            console.error('Profile update failed:', err);

            setError(
                err.response?.data?.full_name?.[0] ||
                err.response?.data?.detail ||
                'Could not update your profile. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header card */}
            <div className="bg-primary-600 rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-card">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-white text-xl font-bold border border-white/20">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-display font-bold text-lg sm:text-xl text-white leading-tight break-words">
                            {fullName || 'User'}
                        </h2>
                        <p className="text-primary-100 text-sm mt-0.5 break-all">{email}</p>
                    </div>
                </div>
            </div>

            {/* Account details */}
            <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <h3 className="font-display font-semibold text-slate-800 text-sm">
                        Account Details
                    </h3>

                    {!isEditing && (
                        <button
                            onClick={startEditing}
                            className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                        >
                            <Pencil size={13} />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="divide-y divide-slate-50">
                    {/* Full Name */}
                    <div className="flex items-start gap-3 py-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                            <UserIcon size={16} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400">Full Name</p>

                            {isEditing ? (
                                <form onSubmit={handleSave} className="mt-1.5">
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') cancelEditing();
                                        }}
                                        autoFocus
                                        maxLength={150}
                                        placeholder="Enter your full name"
                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${error ? 'border-red-400' : 'border-slate-200'
                                            }`}
                                    />

                                    {error && (
                                        <p className="text-xs text-danger mt-1">{error}</p>
                                    )}

                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Check size={13} />
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                        >
                                            <X size={13} />
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <p className="text-sm font-medium text-slate-700 break-words">
                                    {fullName || '—'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Email (read-only) */}
                    <div className="flex items-start gap-3 py-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                            <Mail size={16} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400">Email</p>
                            <p className="text-sm font-medium text-slate-700 break-all">
                                {email || '—'}
                            </p>
                            
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-danger bg-red-50 hover:bg-red-100 transition-colors"
                >
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </div>
    );
}