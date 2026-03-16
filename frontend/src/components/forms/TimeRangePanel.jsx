// Right panel of BookingForm — time slot selection and duration summary
import SelectField from '../ui/SelectField';

const TimeRangePanel = ({
    formData,
    set,
    SLOTS,
    endSlotOptions,
    durationMin,
    fmtDuration,
    halls,
}) => (
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
);

export default TimeRangePanel;
