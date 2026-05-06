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
    if (!name) return res.status(400).json({ success: false, message: 'Vendor name is required' });

    const vendor = await Vendor.create({ name, upi_id, bank_account, ifsc });
    return res.status(201).json({ success: true, vendor });
  } catch (err) {
    next(err);
  }
};
