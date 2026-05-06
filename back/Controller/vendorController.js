import Vendor from '../Model/Vendor.js';

// GET /vendors?search=...
export const getVendors = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { is_active: true };

    // Search by vendor name (case-insensitive partial match)
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, vendors });
  } catch (err) {
    next(err);
  }
};

// POST /vendors
export const createVendor = async (req, res, next) => {
  try {
    const { name, upi_id, bank_account, ifsc } = req.body;
    
    // Validations
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Valid vendor name (min 2 chars) is required' });
    }

    if (upi_id) {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(upi_id)) {
        return res.status(400).json({ success: false, message: 'Invalid UPI ID format (e.g. name@bank)' });
      }
    }

    if (bank_account) {
      if (!/^\d{9,18}$/.test(bank_account)) {
        return res.status(400).json({ success: false, message: 'Bank account must be 9-18 digits' });
      }
    }

    if (ifsc) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifsc)) {
        return res.status(400).json({ success: false, message: 'Invalid IFSC code format' });
      }
    }

    const vendor = await Vendor.create({ 
      name: name.trim(), 
      upi_id: upi_id?.trim(), 
      bank_account: bank_account?.trim(), 
      ifsc: ifsc?.trim()?.toUpperCase() 
    });

    return res.status(201).json({ success: true, vendor });
  } catch (err) {
    next(err);
  }
};

