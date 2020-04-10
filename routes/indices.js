"use strict";

const router = (module.exports = require("express").Router());
const jsonfile = require("jsonfile");
const esClient = require("../client");

const bulkIndex = (index, rawData) => {
  let bulkBody = [];
  for (let i = 0; i < rawData.length; i++) {
    bulkBody.push({
      index: {
        _index: index
      }
    });
    bulkBody.push(rawData[i]);
  }
  esClient
    .bulk({ body: bulkBody })
    .then(response => {
      response.body.items.forEach(item => {
        if (item.index && item.index.error) {
          console.error(item.index.error);
        }
      });
      console.log("Successfully indexed.");
    })
    .catch(err => console.error(err));
};

// ==================================================================================================
// CREATE NEW INDEX =================================================================================
// ==================================================================================================
// router.post("/", async (req, res) => {
//   try {
//     const { index_name } = req.body;
//     await esClient.index({
//       index: index_name
//     });

//     res.send(`Index ${index_name} created!`).status(201);
//   } catch (error) {
//     console.log(error);
//   }
// });

// ==================================================================================================
// ADD NEW DOCUMENT TO INDEX ========================================================================
// ==================================================================================================
router.post("/add", async (req, res) => {
  try {
    const { index_name, document } = req.body;
    await esClient.index({
      index: index_name,
      body: document
    });

    res.send("Document inserted!").status(200);
  } catch (error) {
    console.log(error);
  }
});

// ==================================================================================================
// ADD BULK DATA ====================================================================================
// ==================================================================================================
router.post("/bulk", async (req, res) => {
  try {
    const rawData = jsonfile.readFileSync("./college_all_data.json");
    await bulkIndex("colleges", rawData);
    res.send("Done");
  } catch (error) {
    console.log(error);
  }
});
