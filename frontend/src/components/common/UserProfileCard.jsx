const UserProfileCard = ({ user, empCode, role = 'Employee' }) => (
    <div className="group relative w-full overflow-hidden rounded-2xl bg-white shadow-md">
        <div className="relative h-20 bg-gradient-to-r from-[#0b3d91] to-[#1a5bb8]">
            <div className="absolute bottom-0 h-1 w-full bg-orange-500" />
        </div>
        <div className="relative z-10 -mt-10 flex justify-center">
            <img
                src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=256"
                alt="Profile"
                className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg transition-transform duration-500 ease-out group-hover:scale-110"
            />
        </div>
        {/* Info */}
        <div className="px-4 py-3 pb-5 text-center">
            <h2 className="mb-0.5 text-base font-bold text-slate-800">
                {user?.name || empCode}
            </h2>
            <p className="mb-3 text-xs font-bold tracking-wide text-orange-600">
                EMP ID: {empCode || '—'}
            </p>
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#0b3d91]">
                    {role}
                </span>
            </div>
        </div>
    </div>
);

export default UserProfileCard;
