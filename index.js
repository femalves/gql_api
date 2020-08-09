import gql from "graphql-tag";
import express from "express";

import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from "graphql-iso-date";
import { allow } from "graphql-shield";
import { validators } from "./validators";

const port = process.env.PORT || 8080;

const isAuthorized = rule()(
  (obj, args, { authUser }, info) => authUser && true
);

// Define API
const typeDefs = gql`
  scalar Date
  scalar Time
  scalar DateTime
  type Query {
    sayHello(name: String!): String!
  }

  type Mutation {
    sayHello(name: String!): String!
  }
`;

// Define resolvers map

const resolvers = {
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime,
  Query: {
    sayHello: (obj, args, context, info) => {
      return `Hello ${args.name}!`;
    },
  },
  Mutation: {
    sayHello: (obj, args, context, info) => {
      return `Hello ${args.name}`;
    },
  },
};

// Permissions

export const permissions = {
  Query: {
    "*": isAuthorized,
    sayHello: allow,
  },

  Mutation: {
    "*": isAuthorized,
    sayHello: allow,
  },
};

// Express
const app = express();

// Build schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

const schemaWithMiddleware = applyMiddleware(
  schema,
  validators,
  shield(permissions, { allowExternalErrors: true })
);
// Build Apollo server
const apolloServer = new ApolloServer({ schemaWithMiddleware });
apolloServer.applyMiddleware({ app });

// Run server
app.listen({ port }, () => {
  console.log(
    `Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
});
