"use strict";

const router = (module.exports = require("express").Router());

const { index_search } = require("actions/search");

// const getIndex = query => {
//   if (query.search("college") > -1) {
//     return "college";
//   } else if (query.search("exam") > -1 || query.search("test") > -1) {
//     return "exam";
//   } else {
//     return "movies";
//   }
// };

// const college_search = async term => {
//   return await esClient.search({
//     index: "college",
//     body: {
//       // from: 0,
//       // size: 10,
//       query: {
//         multi_match: { query: term, fields: ["name"] }
//       }
//     }
//   });
// };

// const exam_search = async term => {
//   return await esClient.search({
//     index: "exam",
//     body: {
//       // from: 0,
//       // size: 10,
//       query: {
//         multi_match: { query: term, fields: ["name"] }
//       }
//     }
//   });
// };

// ==================================================================================================
// GET SEARCH DATA ==================================================================================
// ==================================================================================================
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    // const index = getIndex(search);

    const { body } = await index_search(search);

    // const { body: college_data } = await college_search(search);
    // const { body: exam_data } = await exam_search(search);
    // const {body:lising_data} = listing_search(search);

    // const data = {
    // college_data: college_data.hits.hits,
    // exam_data: exam_data.hits.hits
    // listing_data:listing_data.hits.hits,
    // };

    res.send(body.hits.hits).status(200);
  } catch (error) {
    console.log(error);
  }
});
