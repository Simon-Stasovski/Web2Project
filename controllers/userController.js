const express = require("express");
const model = require("../models/userModel");
const router = express.Router();
const server = require("../server");
const routeRoot = "/";
module.exports = {
  router,
  routeRoot,
  showLoginPage
};

/**
 * Renders the default Home page of the website.
 * @param {*} request
 * @param {*} response
 */
function showLoginPage(request, response) {
  response.render("login.hbs");
}
function showCreateAccountPage(request, response) {
  response.render("create_account.hbs");
}
function showAccountDetails(request, response) {
  let accountDetails = model.getUser(request.body.username);
  response.render("account_details.hbs", accountDetails);
}

async function createUser(request, response) {
  const username = request.body.username; 
  const password1 = request.body.password1;
  const password2 = request.body.password2;
  const email = request.body.email;
  await model.addUser(username, password1, password2,email)
  response.redirect("/login");
}

router.get("/loginUser", (request, response) => {
  let loginData = {
    AlertMessage: true,
    Message: "Incorrect username or password",
  };

  const username = request.body.username; 
  const password = request.body.password;
  if (model.logInUser(username,password)) {
    const sessionId = server.createSession(username, 2); // Save cookie that will expire.
    response.cookie("sessionId", sessionId, {
      expires: server.sessions[sessionId].expiresAt,
    });
  } else {
    response.render("login.hbs", loginData);
  }
  response.redirect("/userinfo");
});
router.get("/logout", (request, response) => {
  const authenticatedSession = authenticateUser(request);
  if (!authenticatedSession) {
    response.sendStatus(401); // Unauthorized access
    return;
  }
  delete server.sessions[authenticatedSession.sessionId];
  console.log("Logged out user " + authenticatedSession.userSession.username);

  response.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.
  response.redirect("/");
});

function authenticateUser(request) {
  // If this request doesn't have any cookies, that means it isn't authenticated. Return null.
  if (!request.cookies) {
    return null;
  } // We can obtain the session token from the requests cookies, which come with every request
  const sessionId = request.cookies["sessionId"];
  if (!sessionId) {
    // If the cookie is not set, return null
    return null;
  } // We then get the session of the user from our session map
  let userSession = server.sessions[sessionId];
  if (!userSession) {
    return null;
  } // If the session has expired, delete the session from our map and return null
  if (userSession.isExpired()) {
    delete server.sessions[sessionId];
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
  const newSessionId = server.createSession(
    authenticatedSession.userSession.username,
    2
  ); // Delete the old entry in the session map
  delete server.sessions[authenticatedSession.sessionId]; // Set the session cookie to the new id we generated, with a // renewed expiration time
  response.cookie("sessionId", newSessionId, {
    expires: server.sessions[newSessionId].expiresAt,
  });
  return newSessionId;
}

router.get("/login", showLoginPage);
router.get("/create", showCreateAccountPage);
router.post("/createUser",createUser);
router.get("/userinfo", showAccountDetails);