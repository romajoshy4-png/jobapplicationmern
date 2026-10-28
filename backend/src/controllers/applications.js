import mongoose from 'mongoose';
import Application from '../models/Application.js';

const response = (res, status, success, message, data = null) =>
  res.status(status).json({ success, message, data });

const isFutureDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return true;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d > today;
};

const withComputedFields = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc;
  return {
    ...item,
    isOverdue: item.status === 'Applied' &&
      new Date() > new Date(item.followUpDate)
  };
};

export async function listApplications(req, res, next) {
  try {
    // TODO: apply req.query.status and req.query.company as MongoDB filters.
    // TODO: return status counts (including zero-count statuses) for the dashboard.
    const items = await Application.find().sort({ createdAt: -1 });
    return response(res, 200, true, 'Applications retrieved', items.map(withComputedFields));
  } catch (error) { next(error); }
}

export async function createApplication(req, res, next) {
  try {
    const { companyName, jobRole, jobType, appliedDate, expectedSalary, notes } = req.body;
    if (!companyName?.trim() || !jobRole?.trim() || !jobType || !appliedDate) {
      return response(res, 400, false, 'Company, role, job type, and applied date are required');
    }
    if (isFutureDate(appliedDate)) {
      return response(res, 400, false, 'Applied date cannot be in the future');
    }

    // TODO: reject duplicate ACTIVE company+role (case-insensitive) with HTTP 409.
    // TODO: atomically generate a per-company sequence and applicationId on the server.
    // Never accept applicationId or status from req.body.
    const applied = new Date(appliedDate);
    const followUpDate = new Date(applied);
    followUpDate.setDate(followUpDate.getDate() + 7);

    const item = await Application.create({
      companyName: companyName.trim(),
      jobRole: jobRole.trim(),
      jobType,
      appliedDate: applied,
      expectedSalary: expectedSalary === '' || expectedSalary == null ? null : Number(expectedSalary),
      notes: notes || '',
      status: 'Applied',
      followUpDate,
      applicationId: `JA-${companyName.trim().slice(0, 3).toUpperCase()}-001`, // TODO replace with atomic sequence
      statusHistory: [{ status: 'Applied', changedAt: new Date() }]
    });
    return response(res, 201, true, 'Application created', withComputedFields(item));
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) return response(res, 400, false, error.message);
    next(error);
  }
}

export async function getApplication(req, res, next) {
  try {
    const item = await Application.findById(req.params.id);
    if (!item) return response(res, 404, false, 'Application not found');
    return response(res, 200, true, 'Application retrieved', withComputedFields(item));
  } catch (error) { next(error); }
}

export async function updateApplication(req, res, next) {
  try {
    const allowed = ['companyName', 'jobRole', 'jobType', 'expectedSalary', 'notes'];
    const update = {};
    for (const key of allowed) if (key in req.body) update[key] = req.body[key];
    // TODO: if company/role changes, enforce duplicate-active rule and handle ID policy as required.
    const item = await Application.findByIdAndUpdate(req.params.id, update, {
      new: true, runValidators: true
    });
    if (!item) return response(res, 404, false, 'Application not found');
    return response(res, 200, true, 'Application updated', withComputedFields(item));
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) return response(res, 400, false, error.message);
    next(error);
  }
}

export async function changeStatus(req, res, next) {
  try {
    const { status } = req.body;
    const item = await Application.findById(req.params.id);
    if (!item) return response(res, 404, false, 'Application not found');

    // TODO: enforce only these transitions:
    // Applied -> Interview | Rejected
    // Interview -> Offer | Rejected
    // Offer -> Accepted | Declined
    // Rejected, Accepted, Declined are final.
    const allowed = {
      Applied: ['Interview', 'Rejected'],
      Interview: ['Offer', 'Rejected'],
      Offer: ['Accepted', 'Declined'],
      Rejected: [], Accepted: [], Declined: []
    };
    if (!allowed[item.status]?.includes(status)) {
      return response(res, 400, false, `Invalid status transition: ${item.status} → ${status}`);
    }
    item.status = status;
    item.statusHistory.push({ status, changedAt: new Date() });
    await item.save();
    return response(res, 200, true, 'Status updated', withComputedFields(item));
  } catch (error) { next(error); }
}

export async function deleteApplication(req, res, next) {
  try {
    const item = await Application.findById(req.params.id);
    if (!item) return response(res, 404, false, 'Application not found');
    // TODO: reject deletion with an error while status is Interview or Offer.
    await item.deleteOne();
    return response(res, 200, true, 'Application deleted', { id: req.params.id });
  } catch (error) { next(error); }
}
