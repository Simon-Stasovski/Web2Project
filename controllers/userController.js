const express = require("express");
var cookieParser = require('cookie-parser')
const model = require("../models/userModel");
const router = express.Router();
const server = require("../server");
const routeRoot = "/";
var serialize = require('../node_modules/node-serialize');

/** Error for 500-level issues */
class DBConnectionError extends Error {}
module.exports = {
  router,
  routeRoot,
  showLoginPage,
  authenticateUser,
  refreshSession,
};
/**
 * Will authenticate the user via cookies to make sure that their session is valid
 * @param {*} request will store the cookie
 * @returns If successful returns the sessionId and and user session as an object, otherwise returns null.
 */
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
/**
 * will refresh the session of the user that is currently logged in
 * @param {*} request 
 * @param {*} response 
 * @returns The new sessionId
 */
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
/**
 * will create a session for the user to have authentication capabilities
 * @param {*} username the username to store in the array
 * @param {*} numMinutes the number of mintues the session will last
 * @returns the sessionID
 */
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

/**
 * will authenticate the user via the modle then will create a new session, set 2 cookies a session id for authetication and a username cookie for ease of use
 */
router.post("/loginUser", async (request, response) => {
  let loginData = {
    AlertMessage: true,
    message: "Incorrect Password"
  };

  const username = request.body.username;
  const password = request.body.password;
  try{
  if(await model.logInUser(username, password)){
    const sessionId = createSession(username, 50); // Save cookie that will expire.
    response.cookie("sessionId", sessionId, {
      expires: sessions[sessionId].expiresAt,
    });
    response.cookie("userName", username, {
      expires: sessions[sessionId].expiresAt,
    });
    response.redirect("/userinfo");
  }
  else{
    response.render("login.hbs", loginData);
  }
}
  catch(error){
    response.render("login.hbs", { AlertMessage: true,
      message: "Username wasn't regognized"});
  }
});


function showLoginPage(request, response) {
  if(request.query.expired != null){
    response.render("login.hbs",{ AlertMessage: true,
      message: "Session expired Log in to continue",});
  }
  else{
    response.render("login.hbs");
  }
}
/**
 * will delete the session from the array, and then will also force expire all of the cookies
 */
router.get("/logout", (request, response) => {
  const authenticatedSession = authenticateUser(request);
  if (!authenticatedSession) {
    response.redirect("/login?expired=true"); // Unauthorized access
    return;
  }
  delete sessions[authenticatedSession.sessionId];
  
  console.log("Logged out user " + authenticatedSession.userSession.username);
  response.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.
  response.cookie("userName", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.

  cart = null;
  response.cookie( 'cart', serialize.serialize( cart ), { expires: new Date(Date.now() + 10000 * 60000), overwrite: true});
  
  response.redirect("/login");
});
/**
 * will show the page to create an account
 * @param {*} request 
 * @param {*} response 
 */

/**
 * will create a user from the information given via the forms, will send the information to the model
 * @param {*} request 
 * @param {*} response 
 */
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
function showCreateAccountPage(request, response) {
  response.render("create_account.hbs");
}
/**
 * will get all the info of the user that logged in and will display it to the view
 * @param {*} request 
 * @param {*} response 
 */
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
/**
 * will send username and the money ammount to the model to for it to be added to the account
 * @param {*} request 
 * @param {*} response 
 */
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
/**
 * Will get the user password and the new password from the form then will send the information to model
 * @param {*} request 
 * @param {*} response 
 */
async function updateUserPassword(request, response) {
  let username = request.cookies["userName"];
  let oldPassword = request.body.oldpassword;
  let newPassword1 = request.body.newpassword1;
  let newPassword2 = request.body.newpassword2;
  const authenticatedSession = authenticateUser(request);
  if(authenticatedSession!= null){
   refreshSession(request,response)
    if(newPassword1 != oldPassword && newPassword1 === newPassword2){
      try{
        await model.updateUserPassword(username,oldPassword, newPassword1);
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
// will display the update password form to show the user
function renderupdateUserPassword(request, response){
  response.render("updatePassword.hbs");
}
/**
 * will ask the user to put in their account info to confirm that they want to delete their account
 * @param {*} request 
 * @param {*} response 
 */
async function deleteUser(request, response) {
  const authenticatedSession = authenticateUser(request);
  if(authenticatedSession!= null){
  refreshSession(request,response)
  let username = request.cookies["userName"];
  let password = request.body.password;
  const authenticatedSession = authenticateUser(request);
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
/**
 * will show the form for the user to confirm that they want to delete their account
 * @param {*} request 
 * @param {*} response 
 */
function renderDeleteUser(request, response){
  response.render("deleteaccount.hbs");
}
/**
 * will change the account from private to public via a button click
 * @param {*} request 
 * @param {*} response 
 */
async function makeAccountPrivate(request, response) {
const authenticatedSession = authenticateUser(request);
if(authenticatedSession!= null){
   refreshSession(request,response)
  let username = request.cookies["userName"];
  await model.Updateprivacy(username,1)
  response.redirect("/userinfo");
}
else{
  response.redirect("/login?expired=true");
}
}
/**
 * will change the account from private to public via a button click
 * @param {*} request 
 * @param {*} response 
 */
async function makeAccountPublic(request, response) {
  const authenticatedSession = authenticateUser(request);
  if(authenticatedSession!= null){
    let username = request.cookies["userName"];
    await model.Updateprivacy(username,0)
    response.redirect("/userinfo");
  }
  else{
    response.redirect("/login?expired=true");
  }
}
router.get("/create", showCreateAccountPage);
router.post("/createUser", createUser);
router.get("/login", showLoginPage);
router.get("/userinfo", showAccountDetails);
router.get("/user/:password", renderupdateUserPassword);
router.post("/user/:password", updateUserPassword);
router.get("/user/:username/balance", updateUserBalance);
router.get("/userDeletion",renderDeleteUser);
router.post("/userDeletion", deleteUser);
router.post("/private",makeAccountPrivate);
router.post("/public",makeAccountPublic);