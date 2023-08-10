const fn = require("../functions");

exports.errorNotFound = (res, msg = "Not Found") => fn.setError(res, msg, 404);

exports.errorFieldsMissing = (res, msg = "Missing required field(s)") => fn.setError(res, msg, 422);

exports.errorIdMissing = (res, msg = "No valid ID") => fn.setError(res, msg, 422);