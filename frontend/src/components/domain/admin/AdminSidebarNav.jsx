const MenuBtn = ({ label, active, isRecords, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
      ${active
                ? 'bg-[#FF6600] text-white shadow-md'
                : isRecords
                    ? 'text-gray-600 hover:bg-blue-50 hover:text-[#003366]'
                    : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-white' : isRecords ? 'bg-[#007BFF]' : 'bg-[#FF6600]'}`} />
        {label}
    </button>
);

const AdminSidebarNav = ({ views, activeView, onSelect }) => (
    <nav className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
        <h2 className="text-[10px] font-bold uppercase text-gray-400 px-3 mb-2 border-b pb-1">
            Actions &amp; Records
        </h2>
        {views.map(v => (
            <MenuBtn
                key={v.key}
                label={v.label}
                active={activeView === v.key}
                isRecords={v.type === 'records'}
                onClick={() => onSelect(v.key)}
            />
        ))}
    </nav>
);

export default AdminSidebarNav;
