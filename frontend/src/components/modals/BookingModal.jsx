import { useState, useEffect } from 'react';
import { minutesToTime } from '../../lib/bookingData';
import { fetchAllMeetingTypes } from '../../services/meetingTypeService';
import { ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

export default function BookingModal({
    hallName,
    date,
    startTime,
    endTime,
    onConfirm,
    onClose,
}) {
    const { isPA } = useAuth();

    const [title, setTitle] = useState('');
    // const [organizer, setOrganizer] = useState('');
    const [meetType, setMeetType] = useState('');
    const [linkReq, setLinkReq] = useState('NO');
    const [onBehalfOf, setOnBehalfOf] = useState('');

    const [meetingTypes, setMeetingTypes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [mtLoading, setMtLoading] = useState(true);
    const [empLoading, setEmpLoading] = useState(isPA);

    // Load meeting types
    useEffect(() => {
        fetchAllMeetingTypes()
            .then(setMeetingTypes)
            .catch(() => { })
            .finally(() => setMtLoading(false));
    }, []);

    // Load employees (only for PA)
    useEffect(() => {
        if (!isPA) return;
        fetch(`${ENDPOINTS.USERS}/all`, { credentials: 'include' })
            .then((r) => r.json())
            .then(setEmployees)
            .catch(() => { })
            .finally(() => setEmpLoading(false));
    }, [isPA]);

    const duration = endTime - startTime;
    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const isValid = title.trim() && meetType && (!isPA || onBehalfOf);

    const handleConfirm = () => {
        if (!isValid) return;
        onConfirm({
            title: title.trim(),
            meetType,
            linkRequired: linkReq,
            onBehalfOf: isPA ? onBehalfOf : null,
        });
    };

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    const inputCls = 'w-full h-10 bg-[#EEF2F8] border border-[#CBD5E1] rounded-lg px-3 text-[13px] text-[#003366] placeholder:text-[#64748B] outline-none focus:border-[#007BFF] transition-colors';
    const labelCls = 'block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleBackdrop}>
            <div className="modal-in bg-white border border-[#CBD5E1] rounded-2xl p-7 w-[460px] max-w-[calc(100vw-32px)] shadow-[0_20px_60px_rgba(0,51,102,0.2)] max-h-[90vh] overflow-y-auto">

                <h3 className="text-[17px] font-bold text-[#003366] mb-1">Confirm Booking</h3>
                <p className="text-[12px] text-[#64748B] mb-5">Fill in the details to reserve this time slot.</p>

                {/* Booking summary */}
                <div className="bg-[#EEF2F8] border border-[#CBD5E1] rounded-xl p-3.5 mb-5 space-y-2 text-[13px]">
                    <div className="flex items-center gap-2.5 text-[#003366]"><span>HALL :</span><span className="font-semibold">{hallName}</span></div>
                    <div className="flex items-center gap-2.5 text-[#64748B]"><span>DATE: </span><span>{formattedDate}</span></div>
                    <div className="flex items-center gap-2.5 text-[#64748B]">
                        <span>TIME: </span>
                        <span>{minutesToTime(startTime)} — {minutesToTime(endTime)} <span className="text-[11px]">({duration} min)</span></span>
                    </div>
                </div>

                {/* On Behalf Of — PA only */}
                {isPA && (
                    <div className="mb-4">
                        <label className={labelCls}>Book On Behalf Of <span className="text-rose-400">*</span></label>
                        <select value={onBehalfOf} onChange={(e) => setOnBehalfOf(e.target.value)} disabled={empLoading} className={`${inputCls} cursor-pointer`}>
                            <option value="">{empLoading ? 'Loading employees…' : '-- Select Officer --'}</option>
                            {employees.map((emp) => (
                                <option key={emp.EMPLOYEECODE} value={emp.EMPLOYEECODE}>
                                    {emp.EMPLOYEENAME} ({emp.EMPLOYEECODE})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Meeting Title */}
                <div className="mb-4">
                    <label className={labelCls}>Meeting Title <span className="text-rose-400">*</span></label>
                    <input autoFocus type="text" placeholder="e.g. Sprint Planning" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleConfirm()} className={inputCls} />
                </div>

                {/* Meeting Type */}
                <div className="mb-4">
                    <label className={labelCls}>Meeting Type <span className="text-rose-400">*</span></label>
                    <select value={meetType} onChange={(e) => setMeetType(e.target.value)} disabled={mtLoading} className={`${inputCls} cursor-pointer`}>
                        <option value="">{mtLoading ? 'Loading…' : '-- Select Type --'}</option>
                        {meetingTypes.map((t) => (
                            <option key={t.MEETID} value={t.MEETID}>{t.MEETNAME}</option>
                        ))}
                    </select>
                </div>

                {/* Conference Link */}
                <div className="mb-6">
                    <label className={labelCls}>Conference Link Required?</label>
                    <div className="flex gap-6 mt-1">
                        {['YES', 'NO'].map((v) => (
                            <label key={v} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="linkRequired" value={v} checked={linkReq === v} onChange={() => setLinkReq(v)} className="w-4 h-4 accent-[#007BFF] cursor-pointer" />
                                <span className="text-[13px] text-[#003366]">{v === 'YES' ? 'Yes' : 'No'}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="h-10 px-5 rounded-lg border border-[#CBD5E1] bg-transparent text-[#64748B] text-[13px] cursor-pointer hover:bg-[#EEF2F8] transition-colors">Cancel</button>
                    <button onClick={handleConfirm} disabled={!isValid} className="h-10 px-6 rounded-lg bg-[#003366] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#FF6600] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Book Now</button>
                </div>
            </div>
        </div>
    );
}
