import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides matchers like toBeInTheDocument
import AdminDashboard from '../pages/AdminDashboard';
import { adminService } from '../services/adminService';

// 1. MOCK THE SERVICE
// This tells Jest: "Do not use the real API. Use these fake functions I define below."
jest.mock('../services/adminService');

describe('AdminDashboard Component', () => {
    
    // SETUP: Reset mocks before every test to ensure a clean slate
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window.confirm to always return "true" (User clicked OK)
        jest.spyOn(window, 'confirm').mockImplementation(() => true);
    });

    // TEARDOWN: Clean up window mocks
    afterEach(() => {
        window.confirm.mockRestore();
    });

    // --- TEST 1: RENDER & LOAD DATA ---
    test('renders dashboard and loads pending bookings', async () => {
        // Define fake data for the service to return
        const mockBookings = [
            { 
                BOOKINGID: 'BK-101', 
                BOOKINGDATE: '2026-02-15T10:00:00Z', 
                SLOTSBOOKED: '10:00-11:00', 
                HALLNAME: 'Jupiter Hall', 
                BOOKEDBY: 'EMP001', 
                MEETTITLE: 'Project Kickoff' 
            }
        ];
        
        // Apply the mock
        adminService.getPendingBookings.mockResolvedValue(mockBookings);

        // Render the Page
        render(<AdminDashboard />);

        // Check Header
        expect(screen.getByText('Admin Console')).toBeInTheDocument();

        // Check if data loaded (Use findByText for async elements)
        expect(await screen.findByText('Project Kickoff')).toBeInTheDocument();
        expect(screen.getByText('Jupiter Hall')).toBeInTheDocument();
        expect(screen.getByText('EMP001')).toBeInTheDocument();
    });

    // --- TEST 2: TAB NAVIGATION ---
    test('switches tabs correctly (Approvals -> Halls -> Users)', async () => {
        // Mock empty list so we don't get distracted by data
        adminService.getPendingBookings.mockResolvedValue([]);
        
        render(<AdminDashboard />);

        // 1. Click "Manage Halls" tab
        const hallTab = screen.getByText('Manage Halls');
        fireEvent.click(hallTab);

        // Assert Hall Form is visible
        expect(await screen.findByText('Add New Conference Hall')).toBeInTheDocument();
        
        // 2. Click "Manage Users" tab
        const userTab = screen.getByText('Manage Users');
        fireEvent.click(userTab);

        // Assert User Form is visible
        expect(await screen.findByText('Register New User')).toBeInTheDocument();
    });

    // --- TEST 3: APPROVE ACTION ---
    test('calls API when Approve button is clicked', async () => {
        // Mock Data
        const mockBookings = [{ BOOKINGID: 'BK-101', MEETTITLE: 'Review Meeting' }];
        adminService.getPendingBookings.mockResolvedValue(mockBookings);
        adminService.decideBooking.mockResolvedValue({ message: 'Success' }); // Mock success response
        
        render(<AdminDashboard />);

        // Wait for row to appear
        await screen.findByText('Review Meeting');

        // Find Approve Button
        const approveBtn = screen.getByRole('button', { name: /Approve/i });
        fireEvent.click(approveBtn);

        // Verify API was called with correct ID and Status
        await waitFor(() => {
            expect(adminService.decideBooking).toHaveBeenCalledWith('BK-101', 'APPROVED');
        });

        // Verify window.confirm was shown
        expect(window.confirm).toHaveBeenCalled();
    });

    // --- TEST 4: ADD HALL FORM ---
    test('submits Hall Form with correct data', async () => {
        // Start on Dashboard
        adminService.getPendingBookings.mockResolvedValue([]);
        render(<AdminDashboard />);

        // Navigate to Halls Tab
        fireEvent.click(screen.getByText('Manage Halls'));

        // Fill out the Inputs (Using placeholders from AddHallForm.jsx)
        fireEvent.change(screen.getByPlaceholderText('e.g. Einstein Conference Room'), { target: { value: 'Mars Hall' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. Main Block, 3rd Floor'), { target: { value: 'Science Block' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. ECR-01'), { target: { value: 'MARS-01' } });

        // Mock the API success
        adminService.addHall.mockResolvedValue({ message: 'Created' });

        // Click Submit
        const submitBtn = screen.getByRole('button', { name: /Create Hall/i });
        fireEvent.click(submitBtn);

        // Verify API Call
        await waitFor(() => {
            expect(adminService.addHall).toHaveBeenCalledWith({
                name: 'Mars Hall',
                building: 'Science Block',
                code: 'MARS-01'
            });
        });
    });

    // --- TEST 5: ADD USER FORM ---
    test('submits User Form with correct data', async () => {
        // Start on Dashboard
        adminService.getPendingBookings.mockResolvedValue([]);
        render(<AdminDashboard />);

        // Navigate to Users Tab
        fireEvent.click(screen.getByText('Manage Users'));

        // Fill Inputs (Using placeholders from AddUserForm.jsx)
        fireEvent.change(screen.getByPlaceholderText('e.g. EMP001'), { target: { value: 'EMP500' } });
        fireEvent.change(screen.getByPlaceholderText('Set initial password'), { target: { value: 'password123' } });
        
        // Select Dropdowns (Role & Status)
        // Note: For select/options, we often select by display value or find the select element
        // Since we didn't add IDs/Labels strictly, we assume default or use generic access
        
        // Since defaults are ROLE_EMP and ACTIVE, let's just submit with those defaults + text inputs
        // Or if you want to change them:
        // fireEvent.change(screen.getByDisplayValue('Employee'), { target: { value: 'ROLE_ADMIN' } });

        // Mock API success
        adminService.addUser.mockResolvedValue({ message: 'Created' });

        // Click Submit
        const submitBtn = screen.getByRole('button', { name: /Create User/i });
        fireEvent.click(submitBtn);

        // Verify API Call
        await waitFor(() => {
            expect(adminService.addUser).toHaveBeenCalledWith({
                empCode: 'EMP500',
                password: 'password123',
                role: 'ROLE_EMP',   // Default value
                status: 'ACTIVE'    // Default value
            });
        });
    });

});