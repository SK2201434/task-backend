const express = require('express');
const router = express.Router();
const { getusers, registerUser, sendFriendRequest,getFriendRequests,processFriendRequest,Welcome } = require('../controllers/controllers');

router.route("/").get(Welcome)
router.route("/getallusers").get(getusers);
router.route("/creatusers").post(registerUser);
router.route("/friendrequest").post(sendFriendRequest);
// router.route("/getFriendRequest/:id").get(getFriendRequests);
router.route("/AcceptORReject/:id").post(processFriendRequest);
router.route("/login").post(getFriendRequests);


module.exports = router;
