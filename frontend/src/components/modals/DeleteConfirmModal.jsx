export default function DeleteConfirmModal({ booking, onCancel, onConfirm }) {
    if (!booking) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 border-4 border-rose-50">
                    <span className="text-rose-600 text-2xl">⚠️</span>
                </div>
                <h3 className="font-bold text-lg text-[#003366] mb-2">Cancel Booking?</h3>
                <p className="text-[14px] text-[#64748B] mb-6">
                    Are you sure you want to cancel the booking <strong className="text-[#003366]">"{booking.title}"</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={onCancel} className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[#003366] hover:bg-gray-50 text-sm font-medium transition-colors w-full">Keep It</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-white text-sm font-medium transition-colors w-full shadow-sm">Yes, Cancel It</button>
                </div>
            </div>
        </div>
    );
}