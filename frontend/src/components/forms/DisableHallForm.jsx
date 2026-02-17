import React, { useState, useEffect } from 'react';
import { fetchAllHalls, updateHallStatus } from '../../services/hallService';

const DisableHallForm = () => {
    const [halls, setHalls] = useState([]);
    const [selectedHall, setSelectedHall] = useState('');
    const [dates, setDates] = useState({ from: '', to: '' });
    const [loading, setLoading] = useState(false);

    // Load actual halls on mount
    useEffect(() => {
        loadHalls();
    }, []);

    const loadHalls = async () => {
        try {
            const data = await fetchAllHalls();
            setHalls(data);
        } catch (err) {
            console.error(err);
        }
    };

    const currentHall = halls.find(h => h.HALLID === selectedHall);

    const handleAction = async (action) => {
        setLoading(true);
        try {
            const payload = {
                hallId: selectedHall,
                action: action, // 'DISABLE' or 'ENABLE'
                fromDate: action === 'DISABLE' ? dates.from : null,
                toDate: action === 'DISABLE' ? dates.to : null
            };

            await updateHallStatus(payload);
            alert(`Hall successfully ${action === 'ENABLE' ? 'Enabled' : 'Disabled'}`);
            loadHalls();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md bg-white p-6 rounded shadow border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Manage Hall Availability</h2>
            
            <div className="space-y-6">
                {/* 1. Selection */}
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Select Hall</label>
                    <select 
                        className="w-full border border-gray-300 rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedHall}
                        onChange={(e) => setSelectedHall(e.target.value)}
                    >
                        <option value="">-- Choose a Hall --</option>
                        {halls.map(h => (
                            <option key={h.HALLID} value={h.HALLID}>
                                {h.HALLNAME} ({h.isAvailable ? 'Active' : 'Maintenance'})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedHall && (
                    <div className="animate-in fade-in duration-300 space-y-4">
                        {/* 2. Logic: Toggle Only for Enabling */}
                        {!currentHall?.isAvailable ? (
                            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Hall is currently under Maintenance</p>
                                    <p className="text-xs text-blue-700">Click toggle to enable early</p>
                                </div>
                                <button 
                                    onClick={() => handleAction('ENABLE')}
                                    className="w-12 h-6 bg-blue-600 rounded-full relative transition-all"
                                >
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                </button>
                            </div>
                        ) : (
                            /* 3. Logic: Form Only for Disabling */
                            <div className="space-y-4 border-t pt-4">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Schedule Maintenance</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">From Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full border border-gray-300 rounded p-2 text-sm"
                                            value={dates.from}
                                            onChange={e => setDates({...dates, from: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">To Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full border border-gray-300 rounded p-2 text-sm"
                                            value={dates.to}
                                            onChange={e => setDates({...dates, to: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button 
                                    disabled={loading || !dates.from || !dates.to}
                                    onClick={() => handleAction('DISABLE')}
                                    className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition disabled:bg-gray-300"
                                >
                                    Disable for Maintenance
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