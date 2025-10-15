import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

// GraphQL endpoint for InfraFi subgraph on OORT testnet
const SUBGRAPH_URL = 'http://34.150.61.246:8000/subgraphs/name/infrafi/infrafi-testnet'

const httpLink = new HttpLink({
  uri: SUBGRAPH_URL,
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    // Define type policies to ensure stable references for arrays
    typePolicies: {
      User: {
        // User entity uses 'address' as the primary key in the subgraph
        keyFields: ['address'],
      },
      Protocol: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      // Use cache-first to prevent unnecessary re-fetches
      fetchPolicy: 'cache-first',
      // Only refetch when explicitly requested or on reconnect
      nextFetchPolicy: 'cache-first',
    },
    query: {
      // Use cache-first for initial queries to prevent infinite loops
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

