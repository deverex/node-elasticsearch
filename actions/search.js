const esClient = require("../client");

const index_search = async term => {
  return await esClient.search({
    index: ["colleges", "exams"],
    body: {
      // from: 0,
      // size: 10,
      query: {
        multi_match: {
          query: term,
          fields: ["short_name", "full_name"]
        }
      }
    }
  });
};

module.exports = { index_search };
