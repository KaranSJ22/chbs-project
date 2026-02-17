const adminController = require('../src/controllers/adminController');
const { callSP } = require('../src/queries/spWrapper');

//  mocking our spwrapper
jest.mock('../src/queries/spWrapper');

describe('Admin controller (with spWrapper)', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // get pending Bookings
    test('getpendingBookings should return data from SP', async () => {
        const mockData = [{ BOOKINGID: '101', STATUS: 'PENDING' }];
        
        // we mock callSP to return our data
        callSP.mockResolvedValue(mockData);

        await adminController.getPendingBookings(req, res);

        expect(callSP).toHaveBeenCalled(); // verifyy wrapper was called
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockData);
    });

    //booking success
    test('decideBooking should call SP with correct parameters', async () => {
        req.body = { bookingId: 'UUID-55', status: 'APPROVED' };
        
        callSP.mockResolvedValue([]); // SP usually returns nothing on update

        await adminController.decideBooking(req, res);

        expect(callSP).toHaveBeenCalledWith(
            expect.any(String), // Procedure Name
            { p_BookingID: 'UUID-55', p_Status: 'APPROVED' }
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    //add new hall
    test('addHall fun should return the new Hall ID', async () => {
        req.body = { name: 'Grand Hall', building: 'Main Block', code: 'GH' };

        callSP.mockResolvedValue([{ CreatedHallID: 'HALL999' }]);

        await adminController.addHall(req, res);

        expect(callSP).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ hallId: 'HALL999' })
        );
    });

    test('handling wrapper errors gracefully', async () => {
        req.body = { bookingId: '123', status: 'APPROVED' };
        
        // We force the wrapper to throw an Error
        callSP.mockRejectedValue(new Error('Database Connection Failed'));

        await adminController.decideBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "Failed to update booking status" })
        );
    });
});