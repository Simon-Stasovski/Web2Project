const express = require("express");
var cookieParser = require('cookie-parser')
const model = require("../models/userModel");
const router = express.Router();
const server = require("../server");
const routeRoot = "/";

/** Error for 500-level issues */
class DBConnectionError extends Error {}
module.exports = {
  router,
  routeRoot,
  showLoginPage,
  authenticateUser,
  refreshSession,
};
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
const res = require("express/lib/response");
/**
 * Renders the default Home page of the website.
 * @param {*} request
 * @param {*} response
 */
function showLoginPage(request, response) {
  if(request.query.expired != null){
    response.render("login.hbs",{ AlertMessage: true,
      message: "Session expired Log in to continue",});
  }
  else{
    response.render("login.hbs");
  }
}
router.post("/loginUser", async (request, response) => {
  let loginData = {
    AlertMessage: true,
    message: "Incorrect username or password",
  };
  const username = request.body.username;
  const password = request.body.password;
  try{
  await model.logInUser(username, password)
    const sessionId = createSession(username, 2); // Save cookie that will expire.
    response.cookie("sessionId", sessionId, {
      expires: sessions[sessionId].expiresAt,
    });
    response.cookie("userName", username, {
      expires: sessions[sessionId].expiresAt,
    });
    response.redirect("/userinfo");
  }
catch(error){
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
  response.redirect("/login");
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
    response.redirect("/login");
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
   const authenticatedSession = authenticateUser(request);
   if(authenticatedSession!= null){
    refreshSession(request,response)
    let accountDetails = await model.getUser(request.cookies["userName"]);
    response.render("accountpage.hbs", accountDetails);
   }
   else{
    response.redirect("/login?expired=true");
   }
}
async function updateUserBalance(request, response) {
  const authenticatedSession = authenticateUser(request);
  if(authenticatedSession!= null){
  refreshSession(request,response);
  let username = request.cookies["userName"];
  try{
  await model.updateUserBalance(username,100);
    response.redirect("/userinfo");
  }
  catch (error){
    response.render("accountpage.hbs",{AlertMessage: true,message: "Balance was unchanged"}); 
  }
}
else{
 response.redirect("/login?expired=true");
}
}
function updateUserPassword(request, response) {
  let username = request.cookies["userName"];
  let oldPassword = request.body.oldpassword;
  let newPassword1 = request.body.newpassword1;
  let newPassword2 = request.body.newpassword2;
  const authenticatedSession = authenticateUser(request);
  if(authenticatedSession!= null){
   refreshSession(request,response)
    if(newPassword1 != oldPassword && newPassword1 === newPassword2){
      try{
        model.updateUserPassword(username,oldPassword, newPassword1);
        response.render("updatePassword.hbs",{AlertMessage: true,message: "Password was changed"});
      }
      catch (error){
        response.render("updatePassword.hbs",{AlertMessage: true,message: "Your Incorect original password"})
      }
    }
    else{
      response.render("updatePassword.hbs",{AlertMessage: true,message: "Passwords doesn't match"})
    }
  }
  else{
    response.redirect("/login?expired=true");
  }
}
function renderupdateUserPassword(request, response){
  response.render("updatePassword.hbs");
}
async function deleteUser(request, response) {
  const authenticatedSession = authenticateUser(request);
  if(authenticatedSession!= null){
  refreshSession(request,response)
  let username = request.cookies["userName"];
  let password = request.body.password;
  const authenticatedSession = authenticateUser(request);
  if(authenticatedSession!= null){
    try{
      await model.deleteUser(username, password);
      response.render("login.hbs",{ AlertMessage: true,message: "User deleted successfully"})
    }
    catch(err){
      response.render("deleteaccount.hbs",{
        AlertMessage: true,
        message: "Incorrect password please try again",
      });
    }
  }
  else{
    response.redirect("/login?expired=true");
   }
  }
}
function renderDeleteUser(request, response){
  response.render("deleteaccount.hbs");
}
async function makeAccountPrivate(request, response) {
const authenticatedSession = authenticateUser(request);
if(authenticatedSession!= null){
   refreshSession(request,response)
  let username = request.cookies["userName"];
  model.Updateprivacy(username,1)
  response.redirect("/userinfo");
}
else{
  response.redirect("/login?expired=true");
}
}
async function makeAccountPublic(request, response) {
  const authenticatedSession = authenticateUser(request);
  if(authenticatedSession!= null){
    let username = request.cookies["userName"];
    model.Updateprivacy(username,0)
    response.redirect("/userinfo");
  }
  else{
    response.redirect("/login?expired=true");
  }
}
router.post("/createUser", createUser);
router.get("/login", showLoginPage);
router.get("/create", showCreateAccountPage);
router.get("/userinfo", showAccountDetails);
router.post("/user/:password", updateUserPassword);
router.get("/user/:password", renderupdateUserPassword);
router.get("/user/:username/balance", updateUserBalance);
router.post("/userDeletion", deleteUser);
router.get("/userDeletion",renderDeleteUser);
router.post("/private",makeAccountPrivate);
router.post("/public",makeAccountPublic);