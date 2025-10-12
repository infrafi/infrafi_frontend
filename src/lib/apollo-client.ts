import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

// GraphQL endpoint for InfraFi subgraph on OORT testnet
const SUBGRAPH_URL = 'http://34.150.61.246:8000/subgraphs/name/infrafi/infrafi-testnet'

const httpLink = new HttpLink({
  uri: SUBGRAPH_URL,
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
})

