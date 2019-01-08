const express = require('express');
const FollowerController = require('../controllers/follow');
const mdAuth = require('../middlewares/authenticated').ensureAuth;

const api = express.Router();

api.post('/follow', mdAuth, FollowerController.saveFollow);
api.delete('/follow/:id', mdAuth, FollowerController.deleteFollow);
api.get('/following/:id?/:page?', mdAuth, FollowerController.getFollowingUsers);
api.get('/followed/:id?/:page?', mdAuth, FollowerController.getFollowedUsers);
api.get('/get-my-follows/:followed?', mdAuth, FollowerController.getMyFollows);

module.exports = api;