const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const Post = require("../../models/Post.js");
const Profile = require("../../models/Profile.js");
const router = express.Router(); //use router instead of app

const validatePostInput = require("../../validation/post.js");

//actually goes to api/users because of config in server.js
// @route   GET api/posts/test
// @desc    Tests post route
// @access  public
router.get("/test", (req, res) => {
  res.json({
    msg: "Post Test Message"
  }); //automatic 200 status
});

// @route   POST api/posts
// @desc    create post
// @access  private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(400).json(err));
  }
);

// @route   GET api/posts
// @desc    get all posts
// @access  public
router.get("/", (req, res) => {
  Post.find({})
    .sort({ date: -1 })
    .then(posts => {
      res.json(posts);
    })
    .then(err => res.status(400).json({ nopostsfound: "No posts found" }));
});

// @route   GET api/posts/:id
// @desc    get post by id
// @access  public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if (!post) {
        res.status(404).json({ nopostfound: "post does not exist" });
      }
      res.json(post);
    })
    .then(err => res.status(400).json(err));
});

// @route   DEL api/posts/:id
// @desc    delete by id
// @access  private
router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOneAndDelete({ user: req.user.id, _id: req.params.post_id })
      .then(post => {
        if (post) {
          return res.json(post);
        }
        return res.status(400).json({ success: false });
      })
      .catch(err => res.status(400).json({ postnotfound: "no post found" }));
  }
);

// @route   POST api/posts/like/:post_id
// @desc    Like the post
// @access  private

router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (!post) {
          return res.status(404).json({ postnotfound: "post doesn't exist" });
        }
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length != 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User already liked ths post" });
        }
        post.likes.unshift({ user: req.user.id });
        post.save().then(post => {
          res.json(post);
        });
      })
      .catch(err => res.status(400).json({ postnotfound: "post not found" }));
  }
);

// @route   POST api/posts/unlike/:post_id
// @desc    Unlike the post
// @access  private

router.post(
  "/unlike/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (!post) {
          return res.status(404).json({ postnotfound: "post doesn't exist" });
        }
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User hasn't liked this post" });
        }
        const removeI = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);
        post.likes.splice(removeI, 1);
        post.save().then(post => {
          res.json(post);
        });
      })
      .catch(err => res.status(400).json({ postnotfound: "post not found" }));
  }
);

// @route   POST api/posts/comment/:post_id
// @desc    Add comment to post
// @access  private
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.post_id)
      .then(post => {
        if (!post) {
          return res
            .status(404)
            .json({ postnotfound: "cannot find post with given id" });
        }
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        post.comments.push(newComment);
        post
          .save()
          .then(post => {
            return res.json(post);
          })
          .catch(err =>
            res.status(400).json({ postnotfound: "no post found" })
          );
      })
      .catch(err => res.status(400).json({ success: false }));
  }
);

// @route   DEL api/posts/comment/:post_id/:comment_id
// @desc    delete comment from post
// @access  private
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (!post) {
          return res.status(404).json({ postnotfound: "post not found" });
        }
        if (
          post.comments.filter(
            comment => comment._id.toString() == req.params.comment_id
          ).length == 0
        ) {
          //Comment doesnt exist
          return res
            .status(404)
            .json({ commentnotfound: "comment does not exist" });
        }
        const removeIndex = post.comments
          .map(comment => comment._id.toString())
          .indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        post
          .save()
          .then(post => res.json(post))
          .catch(err => res.status(400).json({ success: false }));
      })
      .catch(err => res.status(400).json({ success: false }));
  }
);

module.exports = router;
