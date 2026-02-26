import React, { useState } from 'react';
import { addMeetType } from '../../services/meetingTypeService';

const AddMeetTypeForm = ({ onSuccess }) => { // Added onSuccess prop
    const [form, setForm] = useState({ meetName:'', meetDescription:'' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const result = await addMeetType(form);
            setStatus({ type: 'success', text: result.Status || 'Meet Type Added Successfully' });
            setForm({ meetName: '', meetDescription: '' });
            
            // Trigger Refresh on Right Section
            if (onSuccess) onSuccess();
        } catch (err) {
            setStatus({ type: 'error', text: err.message || 'Failed to add meet type.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-3">
                    <span className="w-2 h-8 bg-[#007BFF] rounded-full"></span>
                    New Meeting Category
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-5 italic">Define a new purpose for hall bookings</p>
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    status.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-semibold">{status.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#003366] ml-1">Meeting Type Name</label>
                    <input
                        type="text" required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#007BFF] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        placeholder="e.g. Stakeholder Review"
                        value={form.meetName}
                        onChange={e => setForm({ ...form, meetName: e.target.value })}
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#003366] ml-1">Short Description</label>
                    <input
                        type="text" required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#007BFF] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        placeholder="e.g. External client presentations"
                        value={form.meetDescription}
                        onChange={e => setForm({ ...form, meetDescription: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#003366] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#002244] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Meet Type'}
                </button>
            </form>
        </div>
    );
};

export default AddMeetTypeForm;