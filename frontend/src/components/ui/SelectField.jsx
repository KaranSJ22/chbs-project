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

export default SelectField;
