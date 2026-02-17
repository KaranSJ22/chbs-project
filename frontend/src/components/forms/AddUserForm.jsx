import React, { useState } from 'react';
import { adminService } from '../../services/adminService'

const AddUserForm = () => {
    const [form, setForm] = useState({ empCode: '', password: '', role: 'ROLE_EMP', status: 'ACTIVE' });
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error', text: '...' }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg(null);

        try {
            const result = await adminService.addUser(form);
            setStatusMsg({ type: 'success', text: result.message || 'User created successfully!' });
            setForm({ empCode: '', password: '', role: 'ROLE_EMP', status: 'ACTIVE' });
        } catch (err) {
            setStatusMsg({ type: 'error', text: err.message || 'Failed to create user.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Register New User</h2>

            {statusMsg && (
                <div className={`mb-4 p-3 rounded border text-sm font-medium flex items-center gap-2 ${statusMsg.type === 'success'
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
                    <span className="font-bold">{statusMsg.type === 'success' ? 'Success:' : 'Error:'}</span>
                    <span>{statusMsg.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Employee Code</label>
                    <input
                        type="text" required
                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. EMP001"
                        value={form.empCode}
                        onChange={e => setForm({ ...form, empCode: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1 font-medium">Password</label>
                    <input
                        type="password" required
                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Set initial password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Role</label>
                        <select
                            className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="ROLE_EMP">Employee</option>
                            <option value="ROLE_ADMIN">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-wait' : ''
                        }`}
                >
                    {loading ? 'Creating...' : 'Create User'}
                </button>
            </form>
        </div>
    );
};

export default AddUserForm;