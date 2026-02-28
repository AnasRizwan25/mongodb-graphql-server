import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { connectToDatabase } from './database/connection.js';

async function startServer() {
  try {

    await connectToDatabase();

    const app = express();

    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    await server.start();

    app.use(cors());
    app.use(express.json());
    // app.use(bodyParser.json());

    app.use((req, res, next) => {
      console.log("RAW BODY:", req.body);
      next();
    });

    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => ({ req }),
      })
    );

    const PORT = process.env.PORT;
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

    console.log(`Server ready at http://localhost:${PORT}/graphql`);

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();