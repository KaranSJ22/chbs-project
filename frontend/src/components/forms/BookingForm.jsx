import { useState, useEffect } from 'react';
import { fetchAvailableHalls } from '../../services/hallService';
import { fetchAllMeetingTypes } from '../../services/meetingTypeService';
import { createBooking } from '../../services/bookingService';
import { ENDPOINTS } from '../../config/api';

// 32 × 15-minute slots: 9:00 → 17:00
const SLOTS = Array.from({ length: 32 }, (_, i) => {
  const totalMin = i * 15;
  const h = 9 + Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const pad = (n) => String(n).padStart(2, '0');
  const to12 = (h, m) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${pad(m)} ${ampm}`;
  };
  return { id: i + 1, label: `${to12(h, m)}` };
});

const INITIAL_FORM = {
  hallId: '',
  date: '',
  startSlot: '',
  endSlot: '',
  title: '',
  meetType: '',
  onBehalfOf: '',
  linkRequired: 'NO',
};

const BookingForm = ({ isPA = false }) => {
  const [halls, setHalls] = useState([]);
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [hallsLoading, setHallsLoading] = useState(false);
  const [mtLoading, setMtLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  // Load meeting type
  useEffect(() => {
    setMtLoading(true);
    fetchAllMeetingTypes()
      .then(setMeetingTypes)
      .catch(() => setError('Failed to load meeting types.'))
      .finally(() => setMtLoading(false));
  }, []);

  //  Load employees for on-behalf dropdown
  useEffect(() => {
    if (!isPA) return;
    setEmpLoading(true);
    fetch(`${ENDPOINTS.USERS}/all`, { credentials: 'include' })
      .then(r => r.json())
      .then(setEmployees)
      .catch(() => setError('Failed to load employee list.'))
      .finally(() => setEmpLoading(false));
  }, [isPA]);

  //  Load halls when date is picked 
  useEffect(() => {
    if (!formData.date) { setHalls([]); return; }
    setHallsLoading(true);
    setFormData(prev => ({ ...prev, hallId: '' })); 
    fetchAvailableHalls(formData.date)
      .then(setHalls)
      .catch(() => setError('Failed to load available halls for this date.'))
      .finally(() => setHallsLoading(false));
  }, [formData.date]);

  const endSlotOptions = formData.startSlot
    ? SLOTS.filter(s => s.id >= parseInt(formData.startSlot))
    : [];

  const durationMin = formData.startSlot && formData.endSlot
    ? (parseInt(formData.endSlot) - parseInt(formData.startSlot) + 1) * 15
    : 0;

  const fmtDuration = (min) => {
    if (!min) return '';
    const h = Math.floor(min / 60), m = min % 60;
    return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
  };

  const set = (field) => (e) =>
    setFormData(prev => {
      const next = { ...prev, [field]: e.target.value };
      if (field === 'startSlot' && next.endSlot && parseInt(next.endSlot) < parseInt(next.startSlot)) {
        next.endSlot = '';
      }
      return next;
    });

  // Submit 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!formData.startSlot || !formData.endSlot) {
      return setError('Please select both start and end time.');
    }
    if (isPA && !formData.onBehalfOf) {
      return setError('Please select the officer you are booking on behalf of.');
    }

    setLoading(true);
    try {
      const payload = {
        hallId: formData.hallId,
        date: formData.date,
        startSlot: parseInt(formData.startSlot),
        endSlot: parseInt(formData.endSlot),
        title: formData.title,
        meetType: formData.meetType,
        onBehalfOf: formData.onBehalfOf || null,
        linkRequired: formData.linkRequired,
      };

      const result = await createBooking(payload);
      const isPending = result.status === 'PENDING';
      setStatus({
        type: 'success',
        text: isPending
          ? ` Booking submitted! ID: ${result.bookingId} — awaiting admin approval.`
          : ` Booking confirmed! ID: ${result.bookingId}`
      });
      setFormData(INITIAL_FORM);
    } catch (err) {
      setStatus({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // ── Shared select wrapper ───────────────────────────────────────────────────
  const SelectField = ({ label, required, children, ...props }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );

  //  Render
  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Conference Hall Booking</h2>
            <p className="text-sm text-gray-500">
              {isPA ? 'Book on behalf of an officer' : 'Reserve your meeting space'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg text-red-800 font-medium text-sm">
          {error}
        </div>
      )}
      {status && (
        <div className={`border-l-4 p-4 mb-6 rounded-r-lg font-medium text-sm ${status.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
          }`}>
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Booking Details ── */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Booking Details</h3>

            {/* On Behalf Of */}
            {isPA && (
              <SelectField
                label="Book On Behalf Of"
                required
                value={formData.onBehalfOf}
                onChange={set('onBehalfOf')}
                disabled={empLoading}
              >
                <option value="">{empLoading ? 'Loading employees...' : '-- Select Officer --'}</option>
                {employees.map(emp => (
                  <option key={emp.EMPLOYEECODE} value={emp.EMPLOYEECODE}>
                    {emp.EMPLOYEENAME} ({emp.EMPLOYEECODE})
                  </option>
                ))}
              </SelectField>
            )}

            {/* Date — must be picked BEFORE hall to filter available halls */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Booking Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.date}
                onChange={set('date')}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Hall — filtered by date */}
            <SelectField
              label="Conference Hall"
              required
              value={formData.hallId}
              onChange={set('hallId')}
              disabled={!formData.date || hallsLoading}
            >
              <option value="">
                {!formData.date ? 'Select a date first' : hallsLoading ? 'Loading halls...' : halls.length === 0 ? 'No halls available for this date' : '-- Select a Hall --'}
              </option>
              {halls.map(hall => (
                <option key={hall.HALLID} value={hall.HALLID}>
                  {hall.HALLNAME} ({hall.HALLCODE}) — {hall.BUILDNAME}
                  {hall.ISDIRECTORHALL ? ' ★' : ''}
                </option>
              ))}
            </SelectField>

            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Project Review Meeting"
                value={formData.title}
                onChange={set('title')}
                maxLength={150}
                required
              />
            </div>

            {/* Meeting Type */}
            <SelectField
              label="Meeting Type"
              required
              value={formData.meetType}
              onChange={set('meetType')}
              disabled={mtLoading}
            >
              <option value="">{mtLoading ? 'Loading...' : '-- Select Type --'}</option>
              {meetingTypes.map(t => (
                <option key={t.MEETID} value={t.MEETID}>{t.MEETNAME}</option>
              ))}
            </SelectField>

            {/* Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                 Conference Link Required?
              </label>
              <div className="flex gap-6">
                {['YES', 'NO'].map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="linkRequired"
                      value={v}
                      checked={formData.linkRequired === v}
                      onChange={set('linkRequired')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{v === 'YES' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Select Time Range</h3>
              <p className="text-xs text-gray-500 mt-2">15-minute intervals, 9:00 AM – 5:00 PM</p>
            </div>

            {/* Start Time */}
            <SelectField
              label="Start Time"
              required
              value={formData.startSlot}
              onChange={set('startSlot')}
            >
              <option value="">-- Select Start Time --</option>
              {SLOTS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </SelectField>

            {/* End Time */}
            <SelectField
              label="End Time"
              required
              value={formData.endSlot}
              onChange={set('endSlot')}
              disabled={!formData.startSlot}
            >
              <option value="">{!formData.startSlot ? 'Select start time first' : '-- Select End Time --'}</option>
              {endSlotOptions.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </SelectField>

            {/* Duration summary */}
            {formData.startSlot && formData.endSlot && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Selected Range</p>
                <p className="text-lg font-bold text-blue-700">
                  {SLOTS[parseInt(formData.startSlot) - 1].label}
                  {' → '}
                  {SLOTS[parseInt(formData.endSlot) - 1].label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Duration: <strong>{fmtDuration(durationMin)}</strong>
                  {' · '}
                  Slots: <strong>{parseInt(formData.endSlot) - parseInt(formData.startSlot) + 1}</strong>
                </p>
                {halls.find(h => h.HALLID == formData.hallId)?.ISDIRECTORHALL === 1 && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded mt-2 px-2 py-1">
                    ★ Director Hall — booking will require admin approval regardless of availability.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            type="submit"
            disabled={loading || hallsLoading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${loading || hallsLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isPA ? 'Submit Booking on Behalf of Officer' : 'Confirm Booking'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;