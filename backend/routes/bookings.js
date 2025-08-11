const express = require('express');
const { MovingBooking } = require('../models/MovingBooking.js');
const { DisposalBooking } = require('../models/DisposalBooking.js');
const { TransportBooking } = require('../models/TransportBooking.js');
const { requireAdmin } = require('../middleware/auth.js');

const router = express.Router();

// Create moving booking
router.post('/moving', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { company, ...otherData } = req.body;
    
    console.log('🔍 Moving booking creation request:', {
      userId,
      hasCompany: !!company,
      companyData: company,
      companyId: company?.id,
      companyType: company?.companyType,
      fullBody: req.body
    });

    let bookingData = { ...otherData, userId };
    
    // If company is selected (Book Service flow), assign to company
    if (company && company.id) {
      console.log('✅ Company selected, assigning booking to company:', company.id);
      console.log('📝 Company details:', {
        id: company.id,
        name: company.name,
        companyType: company.companyType
      });
      bookingData.companyId = company.id;
      bookingData.status = 'pending_company_approval'; // Company needs to approve
      bookingData.bookingType = 'company_booking';
    } else {
      console.log('📝 No company selected, this is a quote request');
      bookingData.status = 'pending'; // Admin needs to review
      bookingData.bookingType = 'quote_request';
    }
    
    console.log('📝 Final booking data:', bookingData);
    
    const booking = new MovingBooking(bookingData);
    await booking.save();
    
    console.log('✅ Moving booking created successfully:', booking._id);
    
    res.status(201).json({ 
      message: company ? 'Moving booking submitted to company for approval' : 'Moving quote request submitted successfully',
      booking: booking.toObject()
    });
  } catch (error) {
    console.error('❌ Moving booking creation error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to create moving booking' });
  }
});

// Create disposal booking
router.post('/disposal', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { company, ...otherData } = req.body;
    
    console.log('🔍 Disposal booking creation request:', {
      userId,
      hasCompany: !!company,
      companyData: company
    });

    let bookingData = { ...otherData, userId };
    
    // If company is selected (Book Service flow), assign to company
    if (company && company.id) {
      console.log('✅ Company selected, assigning disposal booking to company:', company.id);
      bookingData.companyId = company.id;
      bookingData.status = 'pending_company_approval'; // Company needs to approve
      bookingData.bookingType = 'company_booking';
    } else {
      console.log('📝 No company selected, this is a quote request');
      bookingData.status = 'pending'; // Admin needs to review
      bookingData.bookingType = 'quote_request';
    }
    
    console.log('📝 Final disposal booking data:', bookingData);
    
    const booking = new DisposalBooking(bookingData);
    await booking.save();
    
    console.log('✅ Disposal booking created successfully:', booking._id);
    
    res.status(201).json({ 
      message: company ? 'Disposal booking submitted to company for approval' : 'Disposal quote request submitted successfully',
      booking: booking.toObject()
    });
  } catch (error) {
    console.error('❌ Disposal booking creation error:', error);
    res.status(500).json({ error: 'Failed to create disposal booking' });
  }
});

// Create transport booking
router.post('/transport', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { company, ...otherData } = req.body;
    
    console.log('🔍 Transport booking creation request:', {
      userId,
      hasCompany: !!company,
      companyData: company
    });

    let bookingData = { ...otherData, userId };
    
    // If company is selected (Book Service flow), assign to company
    if (company && company.id) {
      console.log('✅ Company selected, assigning transport booking to company:', company.id);
      bookingData.companyId = company.id;
      bookingData.status = 'pending_company_approval'; // Company needs to approve
      bookingData.bookingType = 'company_booking';
    } else {
      console.log('📝 No company selected, this is a quote request');
      bookingData.status = 'pending'; // Admin needs to review
      bookingData.bookingType = 'quote_request';
    }
    
    console.log('📝 Final transport booking data:', bookingData);
    
    const booking = new TransportBooking(bookingData);
    await booking.save();
    
    console.log('✅ Transport booking created successfully:', booking._id);
    
    res.status(201).json({ 
      message: company ? 'Transport booking submitted to company for approval' : 'Transport quote request submitted successfully',
      booking: booking.toObject()
    });
  } catch (error) {
    console.error('❌ Transport booking creation error:', error);
    res.status(500).json({ error: 'Failed to create transport booking' });
  }
});

// Get user's bookings
router.get('/', async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    let query = {};
    let model;
    
    // Determine which model to use based on type
    switch (type) {
      case 'moving':
        model = MovingBooking;
        query.userId = userId;
        break;
      case 'disposal':
        model = DisposalBooking;
        query.userId = userId;
        break;
      case 'transport':
        model = TransportBooking;
        query.userId = userId;
        break;
      default:
        // If no type specified, get all types
        const [movingBookings, disposalBookings, transportBookings] = await Promise.all([
          MovingBooking.find({ userId }).sort({ createdAt: -1 }),
          DisposalBooking.find({ userId }).sort({ createdAt: -1 }),
          TransportBooking.find({ userId }).sort({ createdAt: -1 })
        ]);
        
        // Combine and sort by creation date
        const allBookings = [
          ...movingBookings.map(b => ({ ...b.toObject(), type: 'moving' })),
          ...disposalBookings.map(b => ({ ...b.toObject(), type: 'disposal' })),
          ...transportBookings.map(b => ({ ...b.toObject(), type: 'transport' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const skip = (page - 1) * limit;
        const paginatedBookings = allBookings.slice(skip, skip + parseInt(limit));
        
        return res.json({
          bookings: paginatedBookings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: allBookings.length,
            pages: Math.ceil(allBookings.length / limit)
          }
        });
    }
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const bookings = await model.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await model.countDocuments(query);
    
    res.json({
      bookings: bookings.map(b => ({ ...b.toObject(), type })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get company's bookings (for company users)
router.get('/company', async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Access denied. Company role required.' });
    }
    
    const { type, status, page = 1, limit = 20 } = req.query;
    const companyId = req.user.userId;
    
    let query = { companyId };
    let model;
    
    // Determine which model to use based on type
    switch (type) {
      case 'moving':
        model = MovingBooking;
        break;
      case 'disposal':
        model = DisposalBooking;
        break;
      case 'transport':
        model = TransportBooking;
        break;
      default:
        // If no type specified, get all types
        const [movingBookings, disposalBookings, transportBookings] = await Promise.all([
          MovingBooking.find({ companyId }).sort({ createdAt: -1 }),
          DisposalBooking.find({ companyId }).sort({ createdAt: -1 }),
          TransportBooking.find({ companyId }).sort({ createdAt: -1 })
        ]);
        
        // Combine and sort by creation date
        const allBookings = [
          ...movingBookings.map(b => ({ ...b.toObject(), type: 'moving' })),
          ...disposalBookings.map(b => ({ ...b.toObject(), type: 'disposal' })),
          ...transportBookings.map(b => ({ ...b.toObject(), type: 'transport' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const skip = (page - 1) * limit;
        const paginatedBookings = allBookings.slice(skip, skip + parseInt(limit));
        
        return res.json({
          bookings: paginatedBookings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: allBookings.length,
            pages: Math.ceil(allBookings.length / limit)
          }
        });
    }
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const bookings = await model.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await model.countDocuments(query);
    
    res.json({
      bookings: bookings.map(b => ({ ...b.toObject(), type })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Company bookings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch company bookings' });
  }
});

// Get specific booking
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Try to find booking in each model
    let booking = await MovingBooking.findById(id);
    let type = 'moving';
    
    if (!booking) {
      booking = await DisposalBooking.findById(id);
      type = 'disposal';
    }
    
    if (!booking) {
      booking = await TransportBooking.findById(id);
      type = 'transport';
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has access to this booking
    if (userRole === 'admin' || 
        booking.userId?.toString() === userId || 
        booking.companyId?.toString() === userId) {
      
      res.json({ ...booking.toObject(), type });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Booking fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Try to find booking in each model
    let booking = await MovingBooking.findById(id);
    let model = MovingBooking;
    
    if (!booking) {
      booking = await DisposalBooking.findById(id);
      model = DisposalBooking;
    }
    
    if (!booking) {
      booking = await TransportBooking.findById(id);
      model = TransportBooking;
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has access to update this booking
    if (userRole === 'admin' || 
        booking.userId?.toString() === userId || 
        booking.companyId?.toString() === userId) {
      
      const updatedBooking = await model.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      
      res.json({ 
        message: 'Booking status updated successfully',
        booking: updatedBooking
      });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Booking status update error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Try to find booking in each model
    let booking = await MovingBooking.findById(id);
    let model = MovingBooking;
    
    if (!booking) {
      booking = await DisposalBooking.findById(id);
      model = DisposalBooking;
    }
    
    if (!booking) {
      booking = await TransportBooking.findById(id);
      model = TransportBooking;
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has access to delete this booking
    if (userRole === 'admin' || 
        booking.userId?.toString() === userId) {
      
      await model.findByIdAndDelete(id);
      
      res.json({ message: 'Booking deleted successfully' });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Booking deletion error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;
