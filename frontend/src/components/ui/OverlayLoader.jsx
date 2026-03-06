export default function OverlayLoader({ message = "Loading..." }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 bg-white border border-[#CBD5E1] rounded-xl px-6 py-4 text-[14px] text-[#003366] shadow-xl">
                <div className="w-5 h-5 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
                {message}
            </div>
        </div>
    );
}