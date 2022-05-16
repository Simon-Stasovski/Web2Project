const express = require("express");
const model = require("../models/userModel");
const router = express.Router();
const server = require("../server");
const routeRoot = "/";
module.exports = {
  router,
  routeRoot,
  showLoginPage,
};
function authenticateUser(request) {
  console.log(request)
  // If this request doesn't have any cookies, that means it isn't authenticated. Return null.
  if (!request.cookies) {
    return null;
  } // We can obtain the session token from the requests cookies, which come with every request
  const sessionId = request.cookies["sessionId"];
  console.log(sessionId);
  if (!sessionId) {
    // If the cookie is not set, return null
    return null;
  } // We then get the session of the user from our session map
  let userSession = sessions[sessionId];
  if (!userSession) {
    return null;
  } // If the session has expired, delete the session from our map and return null
  if (userSession.isExpired()) {
    delete sessions[sessionId];
    return null;
  }
  return { sessionId, userSession }; // Successfully validated.
}
function refreshSession(request, response) {
  const authenticatedSession = authenticateUser(request);
  if (!authenticatedSession) {
    response.sendStatus(401); // Unauthorized access
    return;
  } // Create and store a new Session object that will expire in 2 minutes.
  const newSessionId = createSession(
    authenticatedSession.userSession.username,
    2
  ); // Delete the old entry in the session map
  delete sessions[authenticatedSession.sessionId]; // Set the session cookie to the new id we generated, with a // renewed expiration time
  response.cookie("sessionId", newSessionId, {
    expires: sessions[newSessionId].expiresAt,
  });
  return newSessionId;
}
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
const sessions = {};
const uuid = require("uuid");
/**
 * Renders the default Home page of the website.
 * @param {*} request
 * @param {*} response
 */
function showLoginPage(request, response) {
  response.render("login.hbs");
}
router.post("/loginUser", async (request, response) => {
  let loginData = {
    AlertMessage: true,
    message: "Incorrect username or password",
  };
  const username = request.body.username;
  const password = request.body.password;
  if (await model.logInUser(username, password)) {
    const sessionId = createSession(username, 2); // Save cookie that will expire.
    response.cookie("sessionId", sessionId, {
      expires: sessions[sessionId].expiresAt,
    });
    response.cookie("userName", username, {
      expires: sessions[sessionId].expiresAt,
    });
    response.redirect("/userinfo");
  } else {
    response.render("login.hbs", loginData);
  }
});
router.get("/logout", (request, response) => {
  const authenticatedSession = authenticateUser(request);
  if (!authenticatedSession) {
    response.sendStatus(401); // Unauthorized access
    return;
  }
  delete sessions[authenticatedSession.sessionId];
  console.log("Logged out user " + authenticatedSession.userSession.username);
  response.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.
  response.cookie("userName", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.
  response.redirect("/home");
});

function showCreateAccountPage(request, response) {
  response.render("create_account.hbs");
}
async function createUser(request, response) {
  let loginDataUserExists = {
    AlertMessage: true,
    message: "The Username already exists",
  };
  let loginDataNotAccepted = {
    AlertMessage: true,
    message:
      "The Username must only consists of numbers and letters and the password must be at least 8 characters long with a capital letter and a special Character",
  };
  const username = request.body.username;
  const password1 = request.body.password1;
  const password2 = request.body.password2;
  const email = request.body.email;
  try {
    await model.addUser(username, password1, password2, email);
  } catch (error) {
    if (error instanceof model.InvalidInputError) {
      response.render("create_account.hbs", loginDataNotAccepted);
    }
    if (error instanceof model.UserAlreadyExistsError) {
      response.render("create_account.hbs", loginDataUserExists);
    }
    if (error instanceof model.DBConnectionError)
      response.render("create_account.hbs", {
        AlertMessage: true,
        message: "cannot conect to database",
      });
  }
}
async function showAccountDetails(request, response) {
  // const authenticatedSession = authenticateUser(request);
  // if(authenticatedSession!= null){
  let accountDetails = await model.getUser(request.query.username);
  //console.log(response.cookies);
  response.render("accountpage.hbs", accountDetails);
  // }
}
function showUserbalance(request, response) {
  let accountBalance = model.getUserBalance(request.body.username);
}
function updateUserBalance(request, response) {}
function updateUserPassword(request, response) {}
function deleteUser(request, response) {
  model.deleteUser(request.query.username);
}
router.post("/createUser", createUser);
router.get("/login", showLoginPage);
router.get("/create", showCreateAccountPage);
router.get("/userinfo", showAccountDetails);
router.get("/user/:username", showUserbalance);
router.put("/user/:username", updateUserPassword);
router.put("/user/:username/balance", updateUserBalance);
router.delete("/user/:username", deleteUser);
