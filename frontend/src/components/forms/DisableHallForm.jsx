import React, { useState, useEffect } from 'react';
import { fetchAllHalls, updateHallStatus } from '../../services/hallService';

const isHallActive = (hall) => {
    const v = hall.ISAVAILABLE;
    return v === 1 || v === true || (v?.data && v.data[0] === 1);
};

const DisableHallForm = ({ onSuccess }) => {
    const [halls, setHalls] = useState([]);
    const [selectedHall, setSelectedHall] = useState('');
    const [dates, setDates] = useState({ from: '', to: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    useEffect(() => { loadHalls(); }, []);

    const loadHalls = async () => {
        try {
            const data = await fetchAllHalls();
            setHalls(data);
        } catch (err) {
            console.error('Failed to load halls:', err);
        }
    };

    const currentHall = halls.find(h => String(h.HALLID) === String(selectedHall));
    const active = currentHall ? isHallActive(currentHall) : null;

    const handleDisable = async () => {
        if (!dates.from || !dates.to) {
            setStatus({ type: 'error', text: 'Please select both From and To dates.' });
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            await updateHallStatus({ hallId: selectedHall, fromDate: dates.from, toDate: dates.to });
            setStatus({ type: 'success', text: 'Hall disabled for maintenance. It will auto-enable after the maintenance window.' });
            setDates({ from: '', to: '' });
            setSelectedHall('');
            loadHalls();
            if (onSuccess) onSuccess();
        } catch (err) {
            setStatus({ type: 'error', text: err.message || 'Failed to disable hall.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-3">
                    <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                    Manage Hall Availability
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-5 italic">
                    Disable halls for maintenance. Re-enabling is automatic after the maintenance window.
                </p>
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${status.type === 'success'
                        ? 'bg-green-50 border-green-100 text-green-800'
                        : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-semibold">{status.text}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Hall Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#003366] ml-1">Select Hall</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#007BFF] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        value={selectedHall}
                        onChange={e => { setSelectedHall(e.target.value); setStatus(null); }}
                    >
                        <option value="">-- Choose a Hall --</option>
                        {halls.map(h => (
                            <option key={h.HALLID} value={h.HALLID}>
                                {h.HALLNAME} ({isHallActive(h) ? 'Active' : 'Under Maintenance'})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Hall-specific action */}
                {selectedHall && currentHall && (
                    <div>
                        {!active ? (
                            /* Hall is already under maintenance */
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                                <p className="font-bold text-amber-800">⏳ Hall is currently under maintenance</p>
                                {currentHall.DISABLED_FROM && (
                                    <p className="text-amber-700 text-xs mt-1">
                                        Period: {new Date(currentHall.DISABLED_FROM).toLocaleDateString('en-GB')} → {new Date(currentHall.DISABLED_TO).toLocaleDateString('en-GB')}
                                    </p>
                                )}
                                <p className="text-amber-600 text-xs mt-2">
                                    The system will automatically re-enable this hall after the maintenance window ends.
                                </p>
                            </div>
                        ) : (
                            /* Hall is active — show disable form */
                            <div className="space-y-5 border-t border-gray-100 pt-5">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Schedule Maintenance Window</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 ml-1">FROM DATE</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm focus:bg-white outline-none"
                                            value={dates.from}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setDates({ ...dates, from: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 ml-1">TO DATE</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm focus:bg-white outline-none"
                                            value={dates.to}
                                            min={dates.from || new Date().toISOString().split('T')[0]}
                                            onChange={e => setDates({ ...dates, to: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    disabled={loading || !dates.from || !dates.to}
                                    onClick={handleDisable}
                                    className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-700 transition disabled:bg-gray-200 disabled:shadow-none"
                                >
                                    {loading ? 'Processing...' : 'DISABLE FOR MAINTENANCE'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisableHallForm;

//error bit arrives as buffer this needs to converted before using