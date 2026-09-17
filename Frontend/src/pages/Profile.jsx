import React from 'react';
import { Mail, User as UserIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const email = user?.email || '';
    const displayName = email ? email.split('@')[0] : 'User';
    const initials = email ? email.slice(0, 2).toUpperCase() : '??';

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate('/login', { replace: true });
        }
    };

    const details = [
        { icon: UserIcon, label: 'Username', value: displayName || '—' },
        { icon: Mail, label: 'Email', value: email || '—' }
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header card */}
            <div className="bg-primary-600 rounded-2xl p-6 relative overflow-hidden shadow-card">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-white text-xl font-bold border border-white/20">
                        {initials}
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-xl text-white leading-tight">
                            {displayName}
                        </h2>
                        <p className="text-primary-100 text-sm mt-0.5">{email}</p>
                    </div>
                </div>
            </div>

            {/* Account details */}
            <div className="bg-white rounded-2xl shadow-card p-5">
                <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">
                    Account Details
                </h3>
                <div className="divide-y divide-slate-50">
                    {details.map((d) => (
                        <div key={d.label} className="flex items-center gap-3 py-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                                <d.icon size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">{d.label}</p>
                                <p className="text-sm font-medium text-slate-700">{d.value}</p>
                            </div>
                        </div>
                    ))}
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