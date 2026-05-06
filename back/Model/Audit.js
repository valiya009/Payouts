import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  payout_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout', required: true },
  action:    { type: String, enum: ['CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED'], required: true },
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Audit', auditSchema);
