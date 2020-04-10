"use strict";

const router = (module.exports = require("express").Router());

const { getExams, getExamsMultiple } = require("actions/exams/filter_pages");

// ==================================================================================================
// GET SEARCH DATA ==================================================================================
// ==================================================================================================
router.get("/", async (req, res, next) => {
  try {
    const singleUrl = await getExams();
    // const combineUrl = await getExamsMultiple();
    res.send(singleUrl);
  } catch (error) {
    console.log(error);
  }
});
