import { useState, useEffect } from 'react';
import { fetchAvailableHalls } from '../../services/hallService';
import { fetchAllMeetingTypes } from '../../services/meetingTypeService';
import { createBooking } from '../../services/bookingService';
import { ENDPOINTS } from '../../config/api';
import BookingDetailsPanel from './BookingDetailsPanel';
import TimeRangePanel from './TimeRangePanel';

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

  // Load meeting types
  useEffect(() => {
    setMtLoading(true);
    fetchAllMeetingTypes()
      .then(setMeetingTypes)
      .catch(() => setError('Failed to load meeting types.'))
      .finally(() => setMtLoading(false));
  }, []);

  // Load employees for on-behalf dropdown (PA only)
  useEffect(() => {
    if (!isPA) return;
    setEmpLoading(true);
    fetch(`${ENDPOINTS.USERS}/all`, { credentials: 'include' })
      .then(r => r.json())
      .then(setEmployees)
      .catch(() => setError('Failed to load employee list.'))
      .finally(() => setEmpLoading(false));
  }, [isPA]);

  // Load halls when date is picked
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
        <div className={`border-l-4 p-4 mb-6 rounded-r-lg font-medium text-sm ${status.type === 'success'
            ? 'bg-green-50 border-green-500 text-green-800'
            : 'bg-red-50 border-red-500 text-red-800'
          }`}>
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BookingDetailsPanel
            formData={formData}
            set={set}
            halls={halls}
            hallsLoading={hallsLoading}
            meetingTypes={meetingTypes}
            mtLoading={mtLoading}
            employees={employees}
            empLoading={empLoading}
            isPA={isPA}
          />
          <TimeRangePanel
            formData={formData}
            set={set}
            SLOTS={SLOTS}
            endSlotOptions={endSlotOptions}
            durationMin={durationMin}
            fmtDuration={fmtDuration}
            halls={halls}
          />
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