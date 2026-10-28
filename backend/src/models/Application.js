import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted', 'Declined'],
    required: true
  },
  changedAt: { type: Date, default: Date.now, required: true }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true, index: true },
  companyName: { type: String, required: true, trim: true },
  jobRole: { type: String, required: true, trim: true },
  jobType: { type: String, enum: ['Full-time', 'Internship', 'Contract'], required: true },
  appliedDate: { type: Date, required: true },
  expectedSalary: { type: Number, min: 0, default: null },
  notes: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted', 'Declined'],
    default: 'Applied',
    required: true
  },
  followUpDate: { type: Date, required: true },
  statusHistory: { type: [historySchema], default: [] }
}, { timestamps: true });

applicationSchema.index({ companyName: 1, jobRole: 1, status: 1 });
export default mongoose.model('Application', applicationSchema);
