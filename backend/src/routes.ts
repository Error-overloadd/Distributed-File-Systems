import { Express } from "express";
import { createSessionHandler, deleteSessionHandler, getSessionHandler } from "./Controller/SessionController";

function routes(app: Express) {
  // login
  app.post('/api/session', createSessionHandler);

  // get current session
  app.get('/api/session', getSessionHandler);

  // logout
  app.delete('/api/session', deleteSessionHandler);
}

export default routes;