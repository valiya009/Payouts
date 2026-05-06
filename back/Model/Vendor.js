import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  upi_id:       { type: String },
  bank_account: { type: String },
  ifsc:         { type: String },
  is_active:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
