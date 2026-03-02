import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllHalls } from '../services/hallService';
import BookingTimeline from '../components/timeline/BookingTimeline';
import NavBar from '../components/common/NavBar';

function toInputValue(date) { return date.toISOString().split('T')[0]; }
function parseInputDate(val) {
    const [y, m, d] = val.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export default function TimelinePage() {
    const { user } = useAuth();


    const [selectedDate, setSelectedDate] = useState(new Date());
    const [halls, setHalls] = useState([]);
    const [hallsLoading, setHallsLoading] = useState(false);

    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;

    useEffect(() => {
        setHallsLoading(true);
        fetchAllHalls()
            .then(setHalls)
            .catch(() => setHalls([]))
            .finally(() => setHallsLoading(false));
    }, []);


    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <NavBar />
            <div className="sticky top-[52px] z-30 border-b border-[#CBD5E1] bg-[#003366] shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center gap-4">
                    {/* date picker */}
                    <input
                        type="date"
                        value={toInputValue(selectedDate)}
                        onChange={(e) => setSelectedDate(parseInputDate(e.target.value))}
                        className="h-9 px-3 rounded-lg border border-blue-400 bg-[#002244] text-white text-[13px] font-medium outline-none focus:border-[#FF6600] transition-colors cursor-pointer [color-scheme:dark]"
                    />

                </div>
            </div>
            {/* Main */}
            <main className="max-w-[1600px] mx-auto px-6 py-6">
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#003366]">{formattedDate}</h2>
                        <p className="text-[12px] text-[#64748B] mt-0.5">Click and drag on empty slots to book a hall</p>
                    </div>
                    <div className="flex items-center gap-5 text-[12px] text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#007BFF]/10 border border-[#007BFF]/30 hash-pattern" />
                            Reserved
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#007BFF]/20 border-2 border-[#007BFF]/50" />
                            Selection
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-full bg-rose-500" />
                            Now
                        </span>
                    </div>
                </div>

                {hallsLoading ? (
                    <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
                        <div className="w-4 h-4 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
                        Loading halls…
                    </div>
                ) : halls.length === 0 ? (
                    <p className="text-[13px] text-[#64748B]">No halls available for this date.</p>
                ) : (
                    <BookingTimeline key={dateStr} halls={halls} selectedDate={selectedDate} />
                )}
            </main>
        </div>
    );
}
