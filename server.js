const app = require("./app.js");
const port = 1339;
const sessions = {};
app.listen(port);
const uuid = require('uuid');

class Session {
  constructor(username, expiresAt) {
    this.username = username;
    this.expiresAt = expiresAt;
  }
  isExpired() {
    this.expiresAt < new Date();
  }
}
function createSession(username, numMinutes) {
  // Generate a random UUID as the sessionId
  const sessionId = uuid.v4(); // Set the expiry time as numMinutes (in milliseconds) after the current time
  const expiresAt = new Date(Date.now() + numMinutes * 60000); // Create a session object containing information about the user and expiry time
  const thisSession = new Session(username, expiresAt); // Add the session information to the sessions map, using sessionId as the key
  sessions[sessionId] = thisSession;
  return sessionId;
}

module.exports = {
    Session,
    createSession,
    sessions
};