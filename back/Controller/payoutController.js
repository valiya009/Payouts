import Payout from '../Model/Payout.js';
import Audit from '../Model/Audit.js';
import Vendor from '../Model/Vendor.js';

const addAudit = (payout_id, action, user_id) =>
  Audit.create({ payout_id, action, user_id, timestamp: new Date() });

// POST /payouts — OPS only
export const createPayout = async (req, res, next) => {
  try {
    const { vendor_id, amount, mode, note } = req.body;

    // Validations
    if (!vendor_id) return res.status(400).json({ success: false, message: 'Vendor is required' });
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    const validModes = ['UPI', 'IMPS', 'NEFT'];
    if (!mode || !validModes.includes(mode)) {
      return res.status(400).json({ success: false, message: 'Payment mode must be UPI, IMPS, or NEFT' });
    }

    if (note && note.length > 500) {
      return res.status(400).json({ success: false, message: 'Note is too long (max 500 chars)' });
    }

    const payout = await Payout.create({ vendor_id, amount, mode, note, status: 'Draft' });
    await addAudit(payout._id, 'CREATED', req.user.id);


    // Populate vendor info before returning
    const populated = await Payout.findById(payout._id).populate('vendor_id', 'name upi_id');
    return res.status(201).json({ success: true, payout: populated });
  } catch (err) {
    next(err);
  }
};

// GET /payouts?status=...&vendor_id=...&search=...&page=1&limit=10
export const getPayouts = async (req, res, next) => {
  try {
    const { status, vendor_id, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (vendor_id && vendor_id !== 'All') filter.vendor_id = vendor_id;

    // Search by vendor name — find matching vendor IDs first
    if (search && search.trim()) {
      const matchingVendors = await Vendor.find({
        name: { $regex: search.trim(), $options: 'i' },
      }).select('_id');
      const vendorIds = matchingVendors.map(v => v._id);
      filter.vendor_id = filter.vendor_id
        ? { $in: vendorIds.filter(id => id.toString() === filter.vendor_id) }
        : { $in: vendorIds };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [payouts, total] = await Promise.all([
      Payout.find(filter)
        .populate('vendor_id', 'name upi_id')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Payout.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      payouts,
    });
  } catch (err) {
    next(err);
  }
};

// GET /payouts/stats
export const getStats = async (req, res, next) => {
  try {
    const [totalVendors, totalPayouts, pendingPayouts, approvedPayouts, recentPayouts] = await Promise.all([
      Vendor.countDocuments({ is_active: true }),
      Payout.countDocuments(),
      Payout.countDocuments({ status: 'Submitted' }),
      Payout.find({ status: 'Approved' }).select('amount'),
      Payout.find().populate('vendor_id', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

    const approvedAmount = approvedPayouts.reduce((acc, p) => acc + p.amount, 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalVendors,
        totalPayouts,
        pendingPayouts,
        approvedAmount,
        recentPayouts,
      },
    });
  } catch (err) {
    next(err);
  }
};



// GET /payouts/:id — payout + audit trail
export const getPayoutById = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id).populate('vendor_id', 'name upi_id bank_account ifsc');
    if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

    const audit = await Audit.find({ payout_id: payout._id }).populate('user_id', 'email role').sort({ timestamp: 1 });

    return res.status(200).json({ success: true, payout, audit });
  } catch (err) {
    next(err);
  }
};

// POST /payouts/:id/submit — OPS only, Draft → Submitted
export const submitPayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });
    if (payout.status !== 'Draft')
      return res.status(400).json({ success: false, message: `Cannot submit. Current status: ${payout.status}` });

    payout.status = 'Submitted';
    await payout.save();
    await addAudit(payout._id, 'SUBMITTED', req.user.id);

    const populated = await Payout.findById(payout._id).populate('vendor_id', 'name upi_id');
    return res.status(200).json({ success: true, message: 'Payout submitted', payout: populated });
  } catch (err) {
    next(err);
  }
};

// POST /payouts/:id/approve — FINANCE only, Submitted → Approved
export const approvePayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });
    if (payout.status !== 'Submitted')
      return res.status(400).json({ success: false, message: `Cannot approve. Current status: ${payout.status}` });

    payout.status = 'Approved';
    await payout.save();
    await addAudit(payout._id, 'APPROVED', req.user.id);

    const populated = await Payout.findById(payout._id).populate('vendor_id', 'name upi_id');
    return res.status(200).json({ success: true, message: 'Payout approved', payout: populated });
  } catch (err) {
    next(err);
  }
};

// POST /payouts/:id/reject — FINANCE only, Submitted → Rejected
export const rejectPayout = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'A substantial rejection reason (min 10 chars) is required' });
    }


    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });
    if (payout.status !== 'Submitted')
      return res.status(400).json({ success: false, message: `Cannot reject. Current status: ${payout.status}` });

    payout.status = 'Rejected';
    payout.decision_reason = reason;
    await payout.save();
    await addAudit(payout._id, 'REJECTED', req.user.id);

    const populated = await Payout.findById(payout._id).populate('vendor_id', 'name upi_id');
    return res.status(200).json({ success: true, message: 'Payout rejected', payout: populated });
  } catch (err) {
    next(err);
  }
};
