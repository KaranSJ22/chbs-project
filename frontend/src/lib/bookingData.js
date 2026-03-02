export const TIMELINE_START = 540;   // 9:00 AM (minutes from midnight)
export const TIMELINE_END = 1020;  // 5:00 PM
export const SLOT_DURATION = 15;    // minutes per slot
export const TOTAL_SLOTS = (TIMELINE_END - TIMELINE_START) / SLOT_DURATION; // 32
export const SLOT_WIDTH = 64;    // px wide per slot





// Helper 
export function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
