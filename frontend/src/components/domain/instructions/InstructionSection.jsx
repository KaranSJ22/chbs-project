export const Step = ({ number, title, children }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-black shadow">
            {number}
        </div>
        <div>
            <h4 className="font-bold text-[#003366] text-sm mb-1">{title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
        </div>
    </div>
);

export const Chip = ({ color, label, description }) => (
    <div className="flex items-center gap-3">
        <span className={`w-5 h-5 rounded flex-shrink-0 ${color}`} />
        <div>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            {description && <span className="text-xs text-slate-500 ml-2">— {description}</span>}
        </div>
    </div>
);

export const Note = ({ icon, children, color = 'blue' }) => {
    const styles = {
        blue: 'border-blue-200 bg-blue-50 text-blue-800',
        orange: 'border-orange-200 bg-orange-50 text-orange-800',
        red: 'border-red-200 bg-red-50 text-red-800',
        green: 'border-green-200 bg-green-50 text-green-800',
    };
    return (
        <div className={`flex gap-3 rounded-xl border p-4 text-sm ${styles[color]}`}>
            <span className="text-lg flex-shrink-0">{icon}</span>
            <p className="leading-relaxed">{children}</p>
        </div>
    );
};

export const Section = ({ id, icon, title, badge, children }) => (
    <section id={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#003366] to-[#005599] flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
                <h2 className="text-lg font-black text-white">{title}</h2>
                {badge && <span className="text-[10px] font-bold tracking-widest uppercase text-blue-200">{badge}</span>}
            </div>
        </div>
        <div className="px-6 py-6 space-y-5">{children}</div>
    </section>
);
