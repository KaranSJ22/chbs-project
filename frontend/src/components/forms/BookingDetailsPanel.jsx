// Left panel of BookingForm — booking details: date, hall, title, meeting type, link, on-behalf-of
import SelectField from '../ui/SelectField';

const BookingDetailsPanel = ({
    formData,
    set,
    halls,
    hallsLoading,
    meetingTypes,
    mtLoading,
    employees,
    empLoading,
    isPA,
}) => (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Booking Details</h3>

        {/* On Behalf Of — PA only */}
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
                {!formData.date
                    ? 'Select a date first'
                    : hallsLoading
                        ? 'Loading halls...'
                        : halls.length === 0
                            ? 'No halls available for this date'
                            : '-- Select a Hall --'}
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

        {/* Conference Link */}
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
);

export default BookingDetailsPanel;
