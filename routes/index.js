"use strict";

const router = (module.exports = require("express").Router());

router.use("/search", require("./search"));
router.use("/indices", require("./indices"));
router.use("/exams/filter", require("./exams/filter"));
router.use("/exams/filter_pages", require("./exams/filter_pages"));
router.use("/colleges/filter", require("./colleges/filter"));
// router.use("/colleges/filter_pages", require("./colleges/filter_pages"));
