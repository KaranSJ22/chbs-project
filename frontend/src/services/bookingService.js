import { ENDPOINTS } from '../config/api';

export const createBooking = async (formData) => {
    const response = await fetch(ENDPOINTS.BOOKINGS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Server Error");
    return result;
};

export const getUserDashboard=async (empID)=>{
    const response=await fetch(ENDPOINTS.BOOKINGS+`/dashboard/${empID}`);
    const result=await response.json();
    if(!response.ok) throw new Error(result.message || "Server Error");
    return result;
};