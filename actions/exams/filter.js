"use strict";
//Get the connection to the Elastic Search Client
const esClient = require("../../client");

// ==================================================================================================
// This function is used to get the distinct filters (their keys and values) from the request query.
// ==================================================================================================
const getFilters = query => {
  const result = query.split("::");
  let filters = [];
  result.forEach(element => {
    const filter_data = element.split(":");
    filters.push({
      id: filter_data[0],
      filter_values: filter_data[1]
    });
  });
  return filters;
};

// ==================================================================================================
// This function is used to create the filter terms to be used in elasticsearch for each filter attribute.
// Here we format them and create an array of all the filter atributes as per elasticsearch.
// ==================================================================================================
const createFilterTerms = filters => {
  let response = [];
  filters.forEach(filter => {
    response.push({
      terms: { [`${filter.id}.keyword`]: filter.filter_values.split(",") }
    });
  });
  return response;
};

const getCourses = async filter_terms => {
  for (const filter of filter_terms) {
    if (Object.keys(filter.terms).includes("streams.keyword")) {
      const response = await esClient.search({
        index: "stream_course",
        body: {
          // from: 0,
          size: 1000,
          _source: ["course_name"],
          query: {
            bool: {
              filter: [
                {
                  terms: {
                    "stream_name.keyword": [filter.terms["streams.keyword"][0]]
                  }
                }
              ]
            }
          }
        }
      });
      let included_courses = [];
      response.body.hits.hits.forEach(c => {
        included_courses.push(c._source.course_name);
      });
      // excludeCourses = excludeCourses.concat(stream_courses);
      return included_courses;
    }
  }
};

// ==================================================================================================
// This function is used to get the aggregated data of the index on the basis of the already selected
// filters. Here we aggregate the stats on the whole index not just the filtered results.
// ==================================================================================================
const index_aggregation = async filter_terms => {
  const excludeStreams = filter_terms.filter(
    t => !t.terms.hasOwnProperty("streams.keyword")
  );

  const excludeLanguages = filter_terms.filter(
    t => !t.terms.hasOwnProperty("languages.keyword")
  );

  let excludeCourses = filter_terms.filter(
    t => !t.terms.hasOwnProperty("courses.keyword")
  );

  const excludeSchoolBoards = filter_terms.filter(
    t => !t.terms.hasOwnProperty("school_boards.keyword")
  );

  const excludeExamModes = filter_terms.filter(
    t => !t.terms.hasOwnProperty("exam_modes.keyword")
  );

  let included_courses = ".*";
  if (filter_terms.length > excludeStreams.length) {
    included_courses = await getCourses(filter_terms);
  }

  return await esClient.search({
    index: "exams",
    body: {
      size: 0,
      aggs: {
        total_streams: {
          filter: { bool: { filter: excludeStreams } },
          aggs: {
            streams_count: {
              terms: {
                field: "streams.keyword"
              }
            }
          }
        },
        total_courses: {
          filter: {
            bool: {
              filter: excludeCourses
            }
          },
          aggs: {
            courses_count: {
              terms: {
                field: "courses.keyword",
                include: included_courses
              }
            }
          }
        },
        total_languages: {
          filter: { bool: { filter: excludeLanguages } },
          aggs: {
            languages_count: {
              terms: {
                field: "languages.keyword"
              }
            }
          }
        },
        total_school_boards: {
          filter: { bool: { filter: excludeSchoolBoards } },
          aggs: {
            school_boards_count: {
              terms: {
                field: "school_boards.keyword"
              }
            }
          }
        },
        total_exam_modes: {
          filter: { bool: { filter: excludeExamModes } },
          aggs: {
            exam_modes_count: {
              terms: {
                field: "exam_modes.keyword"
              }
            }
          }
        }
      }
    }
  });
};

const index_filter = async term => {
  const filters = getFilters(term);

  const filter_terms = createFilterTerms(filters);

  //Getting the data on the basis of filter.
  const data = await esClient.search({
    index: "exams",
    body: {
      // from: 0,
      // size: 0
      _source: ["short_name", "full_name", "slug", "url"],
      query: {
        bool: {
          filter: filter_terms
        }
      }
    }
  });

  //Getting aggregated data on the whole index and not just the filtered results
  const aggs = await index_aggregation(filter_terms);

  return { exams_data: data.body.hits, aggs: aggs.body.aggregations };
};

module.exports = { index_filter };
