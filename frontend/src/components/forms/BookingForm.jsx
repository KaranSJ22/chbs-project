import { useState, useEffect } from "react";
import { fetchAllHalls } from "../../services/hallService";
import { fetchAllMeetingTypes } from "../../services/meetingTypeService";
import { createBooking } from "../../services/bookingService";

const BookingForm = () => {
  const [halls, setHalls] = useState([]);
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hallsLoading, setHallsLoading] = useState(true);
  const [meetingTypesLoading, setMeetingTypesLoading] = useState(true);
  const [hallsError, setHallsError] = useState(null);
  const [meetingTypesError, setMeetingTypesError] = useState(null);
  const [status, setStatus] = useState(null);

  // Time selection state
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Available time slots (32 slots: 9:00 AM - 5:00 PM, 15-minute intervals)
  const availableSlots = [
    { id: 1, label: "09:00 - 09:15" },
    { id: 2, label: "09:15 - 09:30" },
    { id: 3, label: "09:30 - 09:45" },
    { id: 4, label: "09:45 - 10:00" },
    { id: 5, label: "10:00 - 10:15" },
    { id: 6, label: "10:15 - 10:30" },
    { id: 7, label: "10:30 - 10:45" },
    { id: 8, label: "10:45 - 11:00" },
    { id: 9, label: "11:00 - 11:15" },
    { id: 10, label: "11:15 - 11:30" },
    { id: 11, label: "11:30 - 11:45" },
    { id: 12, label: "11:45 - 12:00" },
    { id: 13, label: "12:00 - 12:15" },
    { id: 14, label: "12:15 - 12:30" },
    { id: 15, label: "12:30 - 12:45" },
    { id: 16, label: "12:45 - 13:00" },
    { id: 17, label: "13:00 - 13:15" },
    { id: 18, label: "13:15 - 13:30" },
    { id: 19, label: "13:30 - 13:45" },
    { id: 20, label: "13:45 - 14:00" },
    { id: 21, label: "14:00 - 14:15" },
    { id: 22, label: "14:15 - 14:30" },
    { id: 23, label: "14:30 - 14:45" },
    { id: 24, label: "14:45 - 15:00" },
    { id: 25, label: "15:00 - 15:15" },
    { id: 26, label: "15:15 - 15:30" },
    { id: 27, label: "15:30 - 15:45" },
    { id: 28, label: "15:45 - 16:00" },
    { id: 29, label: "16:00 - 16:15" },
    { id: 30, label: "16:15 - 16:30" },
    { id: 31, label: "16:30 - 16:45" },
    { id: 32, label: "16:45 - 17:00" },
  ];

  // Form State matching backend API contract
  const initialFormData = {
    hallId: "",
    empCode: "",
    date: "",
    title: "",
    meetType: "",
    slotIds: [],
    linkRequired: "NO"
  };

  const [formData, setFormData] = useState(initialFormData);

  // Helper function: Extract start time from label and convert to 12-hour format
  const extractStartTime = (label) => {
    const time = label.split(" - ")[0];
    return convertTo12Hour(time);
  };

  // Helper function: Extract end time from label and convert to 12-hour format
  const extractEndTime = (label) => {
    const time = label.split(" - ")[1];
    return convertTo12Hour(time);
  };

  // Helper function: Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function: Calculate slot IDs from start to end (inclusive)
  const calculateSlotIds = (startSlotId, endSlotId) => {
    if (!startSlotId || !endSlotId) return [];
    const start = parseInt(startSlotId);
    const end = parseInt(endSlotId);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Helper function: Get available end time options based on start time
  const getAvailableEndTimes = () => {
    if (!startTime) return [];
    return availableSlots.filter(slot => slot.id >= parseInt(startTime));
  };

  // Helper function: Calculate duration in minutes
  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    return (parseInt(endTime) - parseInt(startTime) + 1) * 15;
  };

  // Helper function: Format duration for display
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} minutes`;
  };

  // Load Halls on Mount
  useEffect(() => {
    setHallsLoading(true);
    fetchAllHalls()
      .then(data => {
        setHalls(data);
        setHallsError(null);
      })
      .catch(err => {
        setHallsError("Failed to load halls. Please refresh the page.");
        console.error("Error loading halls:", err);
      })
      .finally(() => {
        setHallsLoading(false);
      });
  }, []);

  // Load Meeting Types on Mount
  useEffect(() => {
    setMeetingTypesLoading(true);
    fetchAllMeetingTypes()
      .then(data => {
        setMeetingTypes(data);
        setMeetingTypesError(null);
      })
      .catch(err => {
        setMeetingTypesError("Failed to load meeting types. Please refresh the page.");
        console.error("Error loading meeting types:", err);
      })
      .finally(() => {
        setMeetingTypesLoading(false);
      });
  }, []);

  // Update slotIds whenever start or end time changes
  useEffect(() => {
    if (startTime && endTime) {
      const slotIds = calculateSlotIds(startTime, endTime);
      setFormData(prev => ({ ...prev, slotIds }));
    } else {
      setFormData(prev => ({ ...prev, slotIds: [] }));
    }
  }, [startTime, endTime]);

  // Handle start time change
  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);

    // Clear end time if it's before the new start time
    if (endTime && parseInt(endTime) < parseInt(newStartTime)) {
      setEndTime("");
    }
  };

  // Handle end time change
  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate meeting type selection
    if (!formData.meetType) {
      setStatus({
        type: 'error',
        text: 'Please select a meeting type'
      });
      return;
    }

    // Validate time selection
    if (!startTime || !endTime) {
      setStatus({
        type: 'error',
        text: 'Please select both start and end time'
      });
      return;
    }

    if (formData.slotIds.length === 0) {
      setStatus({
        type: 'error',
        text: 'Please select a valid time range'
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const result = await createBooking(formData);
      setStatus({
        type: 'success',
        text: `✅ Booking Confirmed! Booking ID: ${result.bookingId}`
      });

      // Reset form after successful submission
      setFormData(initialFormData);
      setStartTime("");
      setEndTime("");

    } catch (error) {
      setStatus({
        type: 'error',
        text: `❌ Booking Failed: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Conference Hall Booking</h2>
            <p className="text-sm text-gray-500">Reserve your meeting space</p>
          </div>
        </div>
      </div>

      {/* Halls Loading Error */}
      {hallsError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 font-medium">{hallsError}</p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status && (
        <div className={`border-l-4 p-4 mb-6 rounded-r-lg ${status.type === 'error'
          ? 'bg-red-50 border-red-500'
          : 'bg-green-50 border-green-500'
          }`}>
          <div className="flex items-center">
            {status.type === 'success' ? (
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className={`font-medium ${status.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
              {status.text}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column - Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Booking Details</h3>

            {/* Hall Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Conference Hall <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                  value={formData.hallId}
                  onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                  required
                  disabled={hallsLoading}
                >
                  <option value="">
                    {hallsLoading ? "Loading halls..." : "-- Select a Hall --"}
                  </option>
                  {halls.map(hall => (
                    <option key={hall.HALLID} value={hall.HALLID}>
                      {hall.HALLNAME} ({hall.HALLCODE}) - {hall.BUILDNAME}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Employee Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., HSFC101"
                  value={formData.empCode}
                  onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Project Review Meeting"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <select
                  className="w-full border border-gray-300 p-3 pl-10 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                  value={formData.meetType}
                  onChange={(e) => setFormData({ ...formData, meetType: e.target.value })}
                  required
                  disabled={meetingTypesLoading}
                >
                  <option value="">
                    {meetingTypesLoading ? "Loading meeting types..." : "-- Select Meeting Type --"}
                  </option>
                  {meetingTypes.map(type => (
                    <option key={type.MEETID} value={type.MEETID}>
                      {type.MEETNAME}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {meetingTypesError && (
                <p className="text-xs text-red-500 mt-1">{meetingTypesError}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Booking Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Video Link Required */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Video Conference Link Required?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="linkRequired"
                      value="YES"
                      checked={formData.linkRequired === "YES"}
                      onChange={(e) => setFormData({ ...formData, linkRequired: e.target.value })}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="linkRequired"
                      value="NO"
                      checked={formData.linkRequired === "NO"}
                      onChange={(e) => setFormData({ ...formData, linkRequired: e.target.value })}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Time Range Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Select Time Range</h3>
              <p className="text-xs text-gray-500 mt-2">Choose your meeting start and end time (15-minute intervals)</p>
            </div>

            {/* Start Time Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  className="w-full border border-gray-300 p-3 pl-10 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  required
                >
                  <option value="">-- Select Start Time --</option>
                  {availableSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {extractStartTime(slot.label)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* End Time Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  className="w-full border border-gray-300 p-3 pl-10 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  disabled={!startTime}
                  required
                >
                  <option value="">
                    {!startTime ? "Select start time first" : "-- Select End Time --"}
                  </option>
                  {getAvailableEndTimes().map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {extractEndTime(slot.label)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Time Range Summary */}
            {startTime && endTime && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Selected Time Range</h4>
                    <p className="text-lg font-bold text-blue-700">
                      {extractStartTime(availableSlots[parseInt(startTime) - 1].label)} - {extractEndTime(availableSlots[parseInt(endTime) - 1].label)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Duration: <strong>{formatDuration(calculateDuration())}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Slots: <strong>{formData.slotIds.length}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            type="submit"
            disabled={loading || hallsLoading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${loading || hallsLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Booking...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;