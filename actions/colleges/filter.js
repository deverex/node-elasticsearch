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

// ==================================================================================================
// This function gets the courses of the stream if any selected in the filter.
// ==================================================================================================
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
// This function gets the cities of the state if any selected in the filter.
// ==================================================================================================
const getCities = async filter_terms => {
  for (const filter of filter_terms) {
    if (Object.keys(filter.terms).includes("state.keyword")) {
      const response = await esClient.search({
        index: "state_city",
        body: {
          // from: 0,
          size: 1000,
          _source: ["city"],
          query: {
            bool: {
              filter: [
                {
                  terms: {
                    "state.keyword": [filter.terms["state.keyword"][0]]
                  }
                }
              ]
            }
          }
        }
      });
      let included_cities = [];
      response.body.hits.hits.forEach(c => {
        included_cities.push(c._source.city);
      });
      // excludeCourses = excludeCourses.concat(stream_courses);
      return included_cities;
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

  let excludeCourses = filter_terms.filter(
    t => !t.terms.hasOwnProperty("courses.keyword")
  );

  let excludeStates = filter_terms.filter(
    t => !t.terms.hasOwnProperty("state.keyword")
  );

  let excludeCities = filter_terms.filter(
    t => !t.terms.hasOwnProperty("city.keyword")
  );

  let included_courses = ".*";
  if (filter_terms.length > excludeStreams.length) {
    included_courses = await getCourses(filter_terms);
  }

  let included_cities = ".*";
  if (filter_terms.length > excludeStates.length) {
    included_cities = await getCities(filter_terms);
  }

  return await esClient.search({
    index: "colleges",
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
        total_states: {
          filter: { bool: { filter: excludeStates } },
          aggs: {
            states_count: {
              terms: {
                field: "state.keyword"
              }
            }
          }
        },
        total_cities: {
          filter: {
            bool: {
              filter: excludeCities
            }
          },
          aggs: {
            cities_count: {
              terms: {
                field: "city.keyword",
                include: included_cities
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
    index: "colleges",
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

  return { colleges_data: data.body.hits, aggs: aggs.body.aggregations };
};

module.exports = { index_filter };
