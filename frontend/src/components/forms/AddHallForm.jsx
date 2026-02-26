import React, { useState } from 'react';
import { adminService } from '../../services/adminService';

const AddHallForm = () => {
    const [form, setForm] = useState({ name: '', building: '', code: '', isDirectorHall: false });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const result = await adminService.addHall(form);
            setStatus({ type: 'success', text: result.message || 'Hall created successfully!' });
            setForm({ name: '', building: '', code: '', isDirectorHall: false });
        } catch (err) {
            setStatus({ type: 'error', text: err.message || 'Failed to create hall.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-3">
                    <span className="w-2 h-8 bg-[#FF6600] rounded-full"></span>
                    Add New Conference Hall
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-5 italic">Register a new venue into the booking system</p>
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${status.type === 'success'
                        ? 'bg-green-50 border-green-100 text-green-800'
                        : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-semibold">{status.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">

                    {/* Hall Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#003366] ml-1">Hall Name</label>
                        <input
                            type="text" required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#007BFF] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                            placeholder="e.g. Vikram Sarabhai Main Hall"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    {/* Building */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#003366] ml-1">Building Name / Location</label>
                        <input
                            type="text" required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#007BFF] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                            placeholder="e.g. Main Block, 3rd Floor"
                            value={form.building}
                            onChange={e => setForm({ ...form, building: e.target.value })}
                        />
                    </div>

                    {/* Hall Code */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#003366] ml-1">Hall Identification Code</label>
                        <input
                            type="text" required maxLength="10"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono uppercase focus:bg-white focus:border-[#007BFF] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                            placeholder="e.g. H-01"
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                        />
                    </div>

                    {/* Director Hall Toggle */}
                    <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <input
                            type="checkbox"
                            id="isDirectorHall"
                            className="mt-0.5 w-4 h-4 text-amber-600 border-gray-300 rounded cursor-pointer"
                            checked={form.isDirectorHall}
                            onChange={e => setForm({ ...form, isDirectorHall: e.target.checked })}
                        />
                        <div>
                            <label htmlFor="isDirectorHall" className="text-sm font-bold text-amber-800 cursor-pointer">
                                Director Hall
                            </label>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Bookings for Director Halls always require admin approval, regardless of slot availability.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full overflow-hidden rounded-xl bg-[#003366] px-8 py-4 text-white transition-all hover:bg-[#002244] active:scale-[0.98] ${loading ? 'opacity-70 cursor-wait' : 'shadow-lg shadow-blue-900/10'
                        }`}
                >
                    <div className="relative flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span className="font-bold tracking-wide text-sm uppercase">Registering...</span>
                            </>
                        ) : (
                            <span className="font-bold tracking-wide text-sm uppercase">Create Conference Hall</span>
                        )}
                    </div>
                </button>
            </form>
        </div>
    );
};

export default AddHallForm;