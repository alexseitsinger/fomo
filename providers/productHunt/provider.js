const axios = require("axios")
const { get } = require("lodash")

const API_URL = "https://api.producthunt.com/v2/api/graphql"
const fetchTypes = {
  TOP_RANKING: "top_ranking",
  TOP_VOTES: "top_votes",
  FEATURED: "featured",
  NEW: "new"
}

async function getProducts(numOfPosts = 10, type, cursor) {
  const query = `query ($count: Int!, $order:PostsOrder!, $fromDate: DateTime!, $after: String) {
    posts(first: $count, order: $order, postedAfter: $fromDate, after: $after) {
      edges {
        node {
          name
          description
          votesCount
          website
        }
        cursor
      }
    }
  }`

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - 14) // last two weeks

  const typeToOrderMap = {
    [fetchTypes.TOP_RANKING]: "RANKING",
    [fetchTypes.TOP_VOTES]: "VOTES",
    [fetchTypes.FEATURED]: "FEATURED_AT",
    [fetchTypes.NEW]: "NEWEST"
  }

  const variables = {
    count: numOfPosts,
    order: typeToOrderMap[type],
    fromDate: fromDate.toISOString(),
    after: cursor || ""
  }

  const result = await _executePHRequest(query, variables)
  return _buildPHResponse(result)
}

async function _executePHRequest(query, variables) {
  const response = await axios.post(
    API_URL,
    {
      query,
      variables
    },
    {
      headers: {
        Authorization: "Bearer _3NMUwQjYs-twKJiz12DYXeTvATJoO6wFAQxMA5Iy8c",
        "Content-Type": "application/json"
      }
    }
  )

  return response.data
}

function _buildPHResponse(queryResult) {
  const rawData = get(queryResult, "data.posts.edges", [])
  const data = rawData.map((post) => post.node)

  return data
}

module.exports = {
  getProducts,
  fetchTypes
}
