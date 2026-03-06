export default function Toast({ toast }) {
    if (!toast) return null;

    const colors = {
        error: 'border-l-rose-500',
        warn: 'border-l-amber-500',
        success: 'border-l-[#007BFF]'
    };

    return (
        <div className={`modal-in fixed bottom-6 right-6 z-[9999] flex items-start gap-3 bg-white border border-[#CBD5E1] rounded-xl px-5 py-4 shadow-xl max-w-xs pointer-events-none border-l-4 ${colors[toast.type] || colors.success}`}>
            <div>
                <p className="text-[13px] font-semibold text-[#003366]">{toast.title}</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">{toast.sub}</p>
            </div>
        </div>
    );
}