import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/common/NavBar';

const Step = ({ number, title, children }) => (
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

const Chip = ({ color, label, description }) => (
    <div className="flex items-center gap-3">
        <span className={`w-5 h-5 rounded flex-shrink-0 ${color}`} />
        <div>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            {description && <span className="text-xs text-slate-500 ml-2">— {description}</span>}
        </div>
    </div>
);

const Note = ({ icon, children, color = 'blue' }) => {
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

const Section = ({ id, icon, title, badge, children }) => (
    <section id={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section header */}
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


export default function InstructionsPage() {
    const [activeSection, setActiveSection] = useState(null);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(id);
    };

    const navItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'booking', label: 'Book a Hall' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'calendar', label: 'Calendar' },
        { id: 'rules', label: 'Rules & Policy' },
    ];

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans">
            <NavBar />

            {/* Hero banner */}
            <div className="bg-gradient-to-br from-[#003366] via-[#004488] to-[#0055AA] text-white px-6 py-12 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#FF6600] animate-pulse" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-blue-100">HSFC · Hall Booking System</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-3">User Instructions Guide</h1>
                <p className="text-blue-200 max-w-xl mx-auto text-sm leading-relaxed">
                    Everything you need to know to book conference halls, manage your bookings, and navigate the HSFC Hall Booking System.
                </p>
            </div>

            <div className="max-w-5xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-6">


                <aside className="lg:w-52 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sticky top-4">
                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 px-3 pb-2 border-b border-slate-100 mb-2">
                            Jump To
                        </p>
                        {navItems.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => scrollTo(id)}
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

                <main className="flex-1 space-y-6">


                    <Section id="overview" icon="🏛️" title="Overview" badge="Start Here">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            The <strong className="text-[#003366]">HSFC Hall Booking System (CHBS)</strong> allows ISRO employees to reserve conference halls at the Human Space Flight Centre. Bookings can be made through the <strong>Timeline Page</strong> for a visual slot-based view, or through the <strong>Book Hall Form</strong> for a structured form submission.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { icon: '📅', title: 'Book Hall', desc: 'Submit a booking request via a step-by-step form', to: '/book' },
                                { icon: '🕐', title: 'Timeline', desc: 'Drag to book directly on the visual hall grid', to: '/timeline' },
                                { icon: '📊', title: 'Dashboard', desc: 'Track pending, confirmed & past bookings', to: '/dashboard' },
                            ].map(({ icon, title, desc, to }) => (
                                <Link key={title} to={to}
                                    className="flex flex-col items-center text-center p-4 rounded-xl border border-slate-200 hover:border-[#003366] hover:shadow-md transition-all group">
                                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</span>
                                    <span className="text-sm font-bold text-[#003366]">{title}</span>
                                    <span className="text-xs text-slate-500 mt-1">{desc}</span>
                                </Link>
                            ))}
                        </div>
                    </Section>

                    <Section id="booking" icon="📋" title="Booking via Book Hall Form" badge="Step-by-step form">
                        <div className="space-y-4">
                            <Step number={1} title="Select a Date">
                                Use the date picker to choose your desired booking date. Dates in the past and holidays are blocked automatically.
                            </Step>
                            <Step number={2} title="Choose a Hall">
                                The system shows only halls <strong>available</strong> on your selected date. Halls under maintenance are automatically excluded.
                            </Step>
                            <Step number={3} title="Select Time Slots">
                                Pick a start time and end time from the available 15-minute slots. The duration is calculated automatically and displayed.
                            </Step>
                            <Step number={4} title="Fill in Meeting Details">
                                Enter a meeting title, select the meeting type, and specify if a video link is required.
                            </Step>
                            <Step number={5} title="Submit the Request">
                                Click <strong>Book Hall</strong>. If booking a Director Hall, your request goes into a <em>Pending</em> state for admin approval. Other halls are confirmed immediately if no conflict exists.
                            </Step>
                        </div>
                        <Note icon="ℹ️" color="blue">
                            PA (Personal Assistants) can book halls on behalf of an employee by selecting the employee from the <strong>On Behalf Of</strong> dropdown after login.
                        </Note>
                    </Section>

                    <Section id="timeline" icon="🕐" title="Timeline Page" badge="Visual drag-to-book">
                        <p className="text-sm text-slate-600">
                            The Timeline gives you a visual, real-time grid of all halls for a selected date — a quick overview of what's booked and what's free.
                        </p>

                        <div className="space-y-4">
                            <Step number={1} title="Pick a Date">
                                Use the date input at the top of the Timeline page. The grid refreshes automatically.
                            </Step>
                            <Step number={2} title="Drag to Select a Slot">
                                Click and drag across empty cells on any hall row to highlight your desired time range. The selection snaps to 15-minute intervals and auto-stops at existing bookings.
                            </Step>
                            <Step number={3} title="Confirm in the Pop-up">
                                After dragging, a booking confirmation modal appears — enter the meeting title, type, and link requirement, then click <strong>Confirm Booking</strong>.
                            </Step>
                            <Step number={4} title="Right-Click to View Details (Your Bookings)">
                                Right-click on any booking block that belongs to <strong>you</strong> to see its full details in a popup card.
                            </Step>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                            <p className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2">Legend</p>
                            <Chip color="bg-[#007BFF]/10 border border-[#007BFF]/30 hash-pattern" label="Booked Block" description="An existing confirmed booking" />
                            <Chip color="bg-[#007BFF]/20 border-2 border-[#007BFF]/50" label="Your Selection" description="Active drag selection" />
                            <Chip color="bg-rose-500 rounded-full w-3 h-3" label="Now Indicator" description="Current time marker (red dot)" />
                        </div>

                        <Note icon="⚠️" color="orange">
                            You cannot drag over existing bookings. The selection automatically clamps to the nearest free boundary.
                        </Note>
                    </Section>

                    <Section id="dashboard" icon="📊" title="My Dashboard" badge="Manage your bookings">
                        <p className="text-sm text-slate-600">
                            Your dashboard shows two panels side-by-side:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-xl border-l-4 border-[#FF6600] bg-orange-50 p-4">
                                <h4 className="font-bold text-[#003366] text-sm mb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#FF6600]" /> Pending Bookings
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed">Shows bookings that are awaiting admin approval (Director Hall requests). You can cancel a pending booking at any time.</p>
                            </div>
                            <div className="rounded-xl border-l-4 border-[#007BFF] bg-blue-50 p-4">
                                <h4 className="font-bold text-[#003366] text-sm mb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#007BFF]" /> Booking History &amp; Confirmed
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed">Shows all confirmed upcoming bookings and past booking history. You can cancel a confirmed upcoming booking here.</p>
                            </div>
                        </div>
                        <Note icon="🗑️" color="red">
                            <strong>Cancellation Policy:</strong> You can only cancel bookings with a date <strong>strictly in the future</strong> (tomorrow or later). Today's and past bookings cannot be cancelled.
                        </Note>
                    </Section>

                    <Section id="calendar" icon="📆" title="Calendar Page" badge="Availability heatmap">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            The Calendar shows a monthly heatmap of booking activity. Each day is colour-coded based on hall availability so you can quickly identify free days before making a booking.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {[
                                { color: 'bg-green-100 border border-green-300', label: 'Available', desc: 'Halls have free slots' },
                                { color: 'bg-amber-100 border border-amber-300', label: 'Partial', desc: 'Some slots taken' },
                                { color: 'bg-red-100 border border-red-300', label: 'Full', desc: 'All slots booked' },
                                { color: 'bg-slate-200 border border-slate-400', label: 'Holiday', desc: 'No bookings allowed' },
                                { color: 'bg-white border-2 border-[#003366]', label: 'Today', desc: 'Current date' },
                            ].map(({ color, label, desc }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <span className={`w-5 h-5 rounded flex-shrink-0 ${color}`} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{label}</p>
                                        <p className="text-[10px] text-slate-500">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Note icon="💡" color="green">
                            Click on any day in the calendar to see the booking load detail for that date. On a <strong>PARTIAL</strong> day, check the Timeline page for exact slot availability.
                        </Note>
                    </Section>

                    <Section id="rules" icon="📜" title="Rules & Booking Policy" badge="Please read carefully">
                        <ul className="space-y-3">
                            {[
                                { icon: '📅', text: 'Bookings can only be made for future dates. Same-day and past bookings are not permitted.' },
                                { icon: '🏛️', text: 'Director Halls require admin approval and will show as PENDING until reviewed.' },
                                { icon: '🚫', text: 'Bookings on public holidays are automatically rejected by the system.' },
                                { icon: '⏱️', text: 'Booking slots are in 15-minute increments between 09:00 and 17:00.' },
                                { icon: '🔁', text: 'You may cancel a confirmed or pending booking up to (but not including) the booking date.' },
                                { icon: '🔒', text: 'You can only cancel your own bookings. Admins may cancel any booking on your behalf.' },
                                { icon: '📧', text: 'If you need a virtual conferencing link, select "Yes" for Link Required when booking.' },
                            ].map(({ icon, text }, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                    <span className="text-base flex-shrink-0">{icon}</span>
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <div className="text-center text-xs text-slate-400 pb-8">
                        For technical issues, contact the HSFC IT. · CHBS v1.0
                    </div>

                </main>
            </div>
        </div>
    );
}
