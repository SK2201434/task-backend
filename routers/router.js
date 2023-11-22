const express = require('express');
const router = express.Router();
const { getusers, registerUser, getFriendRequests,processFriendRequest,Welcome,newsfeed,creatpost,PostComments,loggin } = require('../controllers/controllers');
const valitadeToken = require('../jwttokenhandeler')
router.route("/").get(Welcome)
router.route("/getallusers").get(getusers);
router.route("/creatusers").post(registerUser);
router.route("/getFriendRequest").get(getFriendRequests);
router.route("/AcceptORReject").post(processFriendRequest);
router.route("/newsfeed").get(newsfeed);
router.route("/postcreation").post(creatpost);
router.route("/comment/:id").post(PostComments);
router.route("/loggin").post(loggin);

module.exports = router;
