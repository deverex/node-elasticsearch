"use strict";
//Get the connection to the Elastic Search Client
const esClient = require("../../client");

const attributes = [
  { name: "streams", urlConverter: /[.()]/g, sub: "" },
  { name: "courses", urlConverter: /[^[]*\[([^)]+)\][^()]*/, sub: "$1" }
];
// const urlConverter = /[.()]/g
// const urlConverter = /\[([^(]+)\]/g

const getAllValuesForColumn = async column => {
  const {
    body: {
      aggregations: {
        [`${column}_count`]: { buckets: values }
      }
    }
  } = await esClient.search({
    index: "exams",
    body: {
      from: 0,
      size: 0,
      aggs: {
        [`${column}_count`]: {
          terms: {
            field: `${column}.keyword`,
            size: 10000
          }
        }
      }
    }
  });

  let allValues = [];
  values.forEach(element => {
    allValues.push(element.key);
  });

  return allValues;
};

const getExams = async () => {
  let allExams = [];

  for (const attribute of attributes) {
    const values = await getAllValuesForColumn(attribute.name);

    let data = [];

    for (const value of values) {
      const reg = /\[(.*?)\]/g;
      data.push({
        url: `/${value
          .toLowerCase()
          .replace(/[.()+&]/g, "")
          .replace(/ /g, "-")
          .replace(attribute.urlConverter, attribute.sub)
          .replace(/(\-+)/g, "-")}-exams`,
        title: `Top ${value} Exams`,
        description: `This is the list of the Top Exams for ${value}`,
        filter: [
          {
            terms: { [`${attribute.name}.keyword`]: `${value}` }
          }
        ]
      });
    }

    allExams.push({
      data
    });
  }
  return allExams;
};

module.exports = { getExams };
