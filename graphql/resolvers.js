const path = require('path');
const fs = require('fs');

const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const User = require('../models/user');
const Post = require('../models/post');
const Token = require('../models/token');
// const { clearImage } = require('../utils/file');
const sendMail = require('../utils/sendMail');

const isEmpty = require('../utils/is-empty');
const { JWT_KEY, CLIENT_URL } = process.env;

const checkAuthentication = (req) => {
  if (!req.isAuth) {
    const error = new Error('Not Authenticated');
    error.statusCode = 401;
    throw error;
  }
};

const checkUser = (user) => {
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
};

const checkPost = (post) => {
  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
};

const checkUserAccess = (post, req) => {
  if (post.creator._id.toString() !== req.userId.toString()) {
    const error = new Error('User not authorized to edit post');
    error.statusCode = 403;
    throw error;
  }
};

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];
    if (validator.isEmpty(userInput.name)) {
      errors.push('Name is required');
    }
    if (validator.isEmpty(userInput.email) || !validator.isEmail(userInput.email)) {
      errors.push('Invalid Email');
    }
    if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 6 })) {
      errors.push('Password should be atleast 6 characters long');
    }
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email: userInput.email });

    if (existingUser) {
      const error = new Error('A user with this email already exists, please try a different email');
      error.statusCode = 401;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      name: userInput.name,
      email: userInput.email,
      password: hashedPassword
    });

    const createdUser = await user.save();

    return {
      ...createdUser._doc,
      _id: createdUser._doc._id.toString()
    };
  },
  login: async function ({ loginInput }, req) {
    const errors = [];
    if (!validator.isEmail(loginInput.email)) {
      errors.push('Invalid email');
    }
    if (validator.isEmpty(loginInput.password) && !validator.isLength(loginInput.password, { min: 6 })) {
      errors.push('Password should be atleast 6 characters long');
    }
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findOne({ email: loginInput.email });
    checkUser(user);

    const isEqual = await bcrypt.compare(loginInput.password, user.password);
    if (!isEqual) {
      const error = new Error('Incorrect password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        name: user.name,
        email: user.email
      },
      JWT_KEY,
      { expiresIn: 14400 }
    );
    return {
      token: 'Bearer ' + token,
      userId: user._id.toString()
    }
  },
  createPost: async function ({ postInput }, req) {
    checkAuthentication(req);

    const errors = [];
    if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
      errors.push('Title should be atleast 5 characters long');
    }
    if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
      errors.push('Content should be atleast 5 characters long');
    }
    if (validator.isEmpty(postInput.imageUrl)) {
      errors.push('Image is required');
    }
    if (validator.isEmpty(postInput.alterText) || !validator.isLength(postInput.alterText, { min: 5 })) {
      errors.push('Alternative text should be atleast 5 characters long');
    }
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findById(req.userId);

    checkUser(user);

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      tags: postInput.tags,
      imageUrl: postInput.imageUrl.slice(14),
      alterText: postInput.alterText,
      creator: user._id
    });

    const createdPost = await post.save();

    user.posts.push(post);

    const updatedUser = await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._doc._id.toString(),
      createdAt: createdPost._doc.createdAt.toISOString(),
      updatedAt: createdPost._doc.updatedAt.toISOString(),
      creator: {
        ...updatedUser._doc,
        _id: updatedUser._doc._id.toString()
      }
    };
  },
  posts: async function ({ page }, req) {
    checkAuthentication(req);

    page = page || 1;
    const postPerPage = 100;

    const totalItems = await Post.find()
      .countDocuments();
    const posts = await Post.find({ creator: req.userId })
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);
    if (totalItems <= 0) {
      return {
        posts: [],
        totalPosts: totalItems || 0
      };
    }
    return {
      posts: posts.map(post => {
        return {
          ...post._doc,
          _id: post._doc._id.toString(),
          createdAt: post._doc.createdAt.toISOString(),
          updatedAt: post._doc.updatedAt.toISOString(),
          creator: {
            ...post._doc.creator._doc,
            _id: post._doc.creator._doc._id.toString()
          }
        };
      }),
      totalPosts: totalItems
    };
  },
  post: async function ({ postId }, req) {
    checkAuthentication(req);

    const post = await Post.findById(postId).populate('creator');
    checkPost(post);

    return {
      ...post._doc,
      _id: post._doc._id.toString(),
      createdAt: post._doc.createdAt.toISOString(),
      updatedAt: post._doc.updatedAt.toISOString(),
      creator: {
        ...post._doc.creator._doc,
        _id: post._doc.creator._doc._id.toString(),
        posts: post._doc.creator._doc.posts.map(post => post.toString())
      }
    };
  },
  updatePost: async function ({ postId, postInput }, req) {
    checkAuthentication(req);

    const post = await Post.findById(postId).populate('creator');
    checkPost(post);

    checkUserAccess(post, req);

    const errors = [];
    if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
      errors.push('Title should be atleast 5 characters long');
    }
    if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
      errors.push('Content should be atleast 5 characters long');
    }
    if (validator.isEmpty(postInput.alterText) || !validator.isLength(postInput.alterText, { min: 5 })) {
      errors.push('Alternative text should be atleast 5 characters long');
    }
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    post.title = postInput.title;
    post.content = postInput.content;
    post.tags = postInput.tags;

    if (postInput.imageUrl !== 'undefined') {
      post.imageUrl = postInput.imageUrl.slice(14);
    }

    post.alterText = postInput.alterText;

    const updatedPost = await post.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._doc._id.toString(),
      createdAt: updatedPost._doc.createdAt.toISOString(),
      updatedAt: updatedPost._doc.updatedAt.toISOString(),
      creator: {
        ...updatedPost._doc.creator._doc,
        _id: updatedPost._doc.creator._doc._id.toString()
      }
    };
  },
  deletePost: async function ({ postId }, req) {
    checkAuthentication(req);

    const post = await Post.findById(postId).populate('creator', '_id name');
    const imageUrl = post.imageUrl;

    checkUserAccess(post, req);

    await post.remove();

    const user = await User.findById(req.userId);
    checkUser(user);

    user.posts.pull(postId);
    await user.save();

    clearImage(imageUrl);

    return true;
  },
  user: async (args, req) => {
    checkAuthentication(req);

    const user = await User.findById(req.userId);
    checkUser(user);

    return {
      ...user._doc,
      _id: user._doc._id.toString()
    };
  },
  updateUser: async ({ userInput }, req) => {
    checkAuthentication(req);

    const user = await User.findById(req.userId);
    checkUser(user);

    if (userInput.name) {
      user.name = userInput.name;
    }
    if (userInput.email) {
      user.email = userInput.email;
    }
    if (userInput.password) {
      user.password = await bcrypt.hash(userInput.password, 12);
    }
    if (userInput.status) {
      user.status = userInput.status;
    }
    const updatedUser = await user.save();
    return {
      ...updatedUser._doc,
      _id: updatedUser._doc._id.toString()
    };
  },
  sendMail: async ({ email }, req) => {
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push('Invalid email');
    }

    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findOne({ email: email });

    if (isEmpty(user)) {
      const error = new Error('Email not registered!');
      error.statusCode = 400;
      throw error;
    }

    let token = await Token.findOne({ userId: user._id });

    if (!isEmpty(token)) await token.remove();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(resetToken, salt);

    const newToken = new Token({
      userId: user._id,
      token: hash
    });

    await newToken.save();

    const link = `${CLIENT_URL}/resetPassword/${user._id}/${resetToken}`;

    const result = await sendMail(user.email, "Password Reset Request", { link: link });

    console.log(result);

    return { msg: 'success' };
  },
  resetPassword: async ({ data }, req) => {
    const errors = [];

    if (validator.isEmpty(data.password) || !validator.isLength(data.password, { min: 6 })) {
      errors.push('Password should be atleast 6 characters long');
    } else if (!validator.equals(data.password, data.password2)) {
      errors.push('Password must match');
    }

    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const resetPwToken = await Token.findOne({ userId: data.userId });

    if (isEmpty(resetPwToken)) {
      const error = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      throw error;
    }

    const isValid = await bcrypt.compare(data.token, resetPwToken.token);

    if (!isValid) {
      const error = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);

    const newPw = await bcrypt.hash(req.body.password, salt);

    const user = await User.findOne({ id: data.userId });

    user.password = newPw;

    await user.save();

    await resetPwToken.remove();

    return true;
  }
};
