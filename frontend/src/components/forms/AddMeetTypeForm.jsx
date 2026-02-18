import React, { useState } from 'react';

import { addMeetType } from '../../services/meetingTypeService';

const AddMeetTypeForm = () => {
    const [form, setForm] = useState({ meetType:'', meetDescription:'' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const result = await addMeetType(form);
            console.log(result);
            setStatus({ type: 'success', text: result.message || 'Hall created successfully!' });
            setForm({ name: '', meetDescription: '' });
        } catch (err) {
            setStatus({ type: 'error', text: err.message || 'Failed to create hall.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Add New Meet Type</h2>

            {status && (
                <div className={`mb-4 p-3 rounded border text-sm font-medium flex items-center gap-2 ${status.type === 'success'
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
                    <span className="font-bold">{status.type === 'success' ? 'Success:' : 'Error:'}</span>
                    <span>{status.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Meet Type</label>
                    <input
                        type="text" required
                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Conference Hall"
                        value={form.meetType}
                        onChange={e => setForm({ ...form, meetType: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Meet Description</label>
                    <input
                        type="text" required
                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Main Block, 3rd Floor"
                        value={form.meetDescription}
                        onChange={e => setForm({ ...form, meetDescription: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-wait' : ''
                        }`}
                >
                    {loading ? 'Creating...' : 'Create Meet Type'}
                </button>
            </form>
        </div>
    );
};

export default AddMeetTypeForm;
