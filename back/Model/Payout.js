import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  vendor_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  amount:          { type: Number, required: true },
  mode:            { type: String, enum: ['UPI', 'IMPS', 'NEFT'], required: true },
  note:            { type: String },
  status:          { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Draft' },
  decision_reason: { type: String },
}, { timestamps: true });

export default mongoose.model('Payout', payoutSchema);
