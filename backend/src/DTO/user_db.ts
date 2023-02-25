const users = [
  {
    email: "adam@test.com",
    password: "adam123",
    name: "Adam Adamson",
  },
  {
    email: "ben@test.com",
    password: "ben123",
    name: "Ben Ten",
  },  
]

export const sessions: Record<
  string,
  {sessionID: string, email: string, name: string, valid: boolean}
> = {};

export function getSession(sessionID:string) {
  const session = sessions[sessionID];
  
  return session && session.valid ? session: null;
}

export function endSession(sessionID: string) {
  const session = sessions[sessionID];

  if (session) {
    sessions[sessionID].valid = false;
  }

  return sessions[sessionID];
}

export function createSession(email: string, name: string) {
  const sessionID = String(Object.keys(sessions).length+1);
  const session = {sessionID, email, name, valid: true};
  
  sessions[sessionID] = session;

  return session;
}

export function getUser(email: string) {
  return users.find((user) => user.email === email);
}
  