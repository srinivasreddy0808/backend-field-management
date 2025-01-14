const Field = require("../models/fieldModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllFields = catchAsync(async (req, res, next) => {
  const fields = await Field.find({
    user: req.user._id,
  });
  res.status(200).json({
    status: "success",
    data: {
      fields,
    },
  });
});

exports.createField = catchAsync(async (req, res, next) => {
  const field = await Field.create(req.body);
  res.status(200).json({
    status: "success",
    data: {
      field,
    },
  });
});

exports.updateField = catchAsync(async (req, res, next) => {
  const fieldId = req.params.fieldId;
  const newField = await Field.findByIdAndUpdate(fieldId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      field: newField,
    },
  });
});

exports.deleteField = catchAsync(async (req, res, next) => {
  const fieldId = req.params.fieldId;
  await Field.findByIdAndDelete(fieldId);
  res.status(200).json({
    status: "success",
    data: null,
  });
});
