const InstructionsSidebar = ({ navItems, activeSection, onNavigate }) => (
    <aside className="lg:w-52 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sticky top-4">
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 px-3 pb-2 border-b border-slate-100 mb-2">
                Jump To
            </p>
            {navItems.map(({ id, label }) => (
                <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
            ${activeSection === id
                            ? 'bg-[#003366] text-white'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-[#003366]'
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    </aside>
);

export default InstructionsSidebar;
