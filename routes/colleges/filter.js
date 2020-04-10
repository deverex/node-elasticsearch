"use strict";

const router = (module.exports = require("express").Router());

const { index_filter } = require("actions/colleges/filter");

// ==================================================================================================
// GET SEARCH DATA ==================================================================================
// ==================================================================================================
router.get("/", async (req, res, next) => {
  try {
    const { f } = req.query;

    const result = await index_filter(f);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
