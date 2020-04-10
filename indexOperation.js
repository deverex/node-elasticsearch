const esClient = require("./client");

const createIndex = async function(indexName) {
  return await esClient.indices.create({
    index: indexName
  });
};

const insertDoc = async function(indexName, data) {
  return await esClient.index({
    index: indexName,
    id: _id,
    body: data
  });
};

const searchDoc = async function(indexName, payload) {
  return await esClient.search({
    index: indexName,
    body: payload
  });
};

module.exports = { createIndex, insertDoc, searchDoc };
