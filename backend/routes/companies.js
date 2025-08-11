const express = require('express');
const { Company } = require('../models/Company.js');
const { requireAdmin } = require('../middleware/auth.js');

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, companyType, services } = req.query;
    
    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add company type filter
    if (companyType) {
      query.companyType = companyType;
    }
    
    // Add services filter
    if (services) {
      const serviceArray = Array.isArray(services) ? services : [services];
      query.services = { $in: serviceArray };
    }
    
    const skip = (page - 1) * limit;
    
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Company.countDocuments(query);
    
    res.json({
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Companies fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Company fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create company profile
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      description,
      services,
      priceRange,
      companyType
    } = req.body;
    
    // Check if company already exists with this email
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company with this email already exists' });
    }
    
    const company = new Company({
      name,
      email,
      phone,
      address,
      description,
      services,
      priceRange,
      companyType
    });
    
    await company.save();
    
    res.status(201).json({
      message: 'Company profile created successfully',
      company
    });
  } catch (error) {
    console.error('Company creation error:', error);
    res.status(500).json({ error: 'Failed to create company profile' });
  }
});

// Update company profile
router.put('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Check if user has access to update this company
    if (req.user.role !== 'admin' && company.email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json({
      message: 'Company profile updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Company update error:', error);
    res.status(500).json({ error: 'Failed to update company profile' });
  }
});

// Delete company (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Company deletion error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Get company by email
router.get('/email/:email', async (req, res) => {
  try {
    const company = await Company.findOne({ email: req.params.email });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Company fetch by email error:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Get companies by type
router.get('/type/:companyType', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, services } = req.query;
    const { companyType } = req.params;
    
    let query = { companyType };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add services filter
    if (services) {
      const serviceArray = Array.isArray(services) ? services : [services];
      query.services = { $in: serviceArray };
    }
    
    const skip = (page - 1) * limit;
    
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Company.countDocuments(query);
    
    res.json({
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Companies by type fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch companies by type' });
  }
});

module.exports = router;
