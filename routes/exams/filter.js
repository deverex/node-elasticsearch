"use strict";

const router = (module.exports = require("express").Router());

const { index_filter, index_aggregation } = require("actions/colleges/filter");

// ==================================================================================================
// GET SEARCH DATA ==================================================================================
// ==================================================================================================
router.get("/", async (req, res, next) => {
  try {
    const { f } = req.query;
    // const index = getIndex(search);

    const result = await index_filter(f);
    // const result = await index_aggregation(f);

    // const { body: college_data } = await college_search(search);
    // const { body: exam_data } = await exam_search(search);
    // const {body:lising_data} = listing_search(search);

    // const data = {
    // college_data: college_data.hits.hits,
    // exam_data: exam_data.hits.hits
    // listing_data:listing_data.hits.hits,
    // };

    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
