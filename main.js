/**
 * $File: main.js $
 * $Date: 2018-09-27 16:02:42 $
 * $Revision: $
 * $Creator: Jen-Chieh Shen $
 * $Notice: See LICENSE.txt for modification and distribution information
 *                   Copyright © 2018 by Shen, Jen-Chieh $
 */

"use strict";

const fs = require('fs');
const path = require('path');

/* Include `express.js' */
const express = require('express');
const app = express();

/* `directory-tree' */
const dirTree = require('directory-tree');

const config = require('./config');



// Setup website directory.
app.use(express.static(config.WEBSITE_DIR));

/* Register all request. */
app.get('/blog_index_data', blog_index_data);

app.get('/search_blog/:search_keyword', search_blog);


// Error handler
app.use(function(err, req, res, next) {
  res.status(422).send({ error: err.message });
});;


app.set('port', process.env.PORT || config.PORT);

// Start listening..
const server = app.listen(app.get('port'), function () {
  console.log("Server active successfully... Port: " + app.get('port'));
});


//=============== functions ========================//

/**
 * Send the scripting reference index data.
 *
 * @param { typename } req : request handler.
 * @param { typename } res : response handler.
 * @param { typename } next : error handler.
 * @returns { JSON } : tree structure of the API.
 */
function blog_index_data(req, res, next) {
  let tree = getBlogTree();

  res.send(JSON.stringify(tree));
}

/**
 * Search the api files and return the all match result.
 *
 * @param { typename } req : request handler.
 * @param { typename } res : response handler.
 * @param { typename } next : error handler.
 * @returns { JSON } : Search result.
 */
function search_blog(req, res, next) {
  let data = req.params;  // get all params
  let searchKeyword = data.search_keyword;

  /* Conversion base on the rule. */
  searchKeyword = searchKeyword.replace(/-/g, ' ');


  let searchResults = [];
  let tree = getBlogTree();

  searchMatchPath(tree.children, searchKeyword, searchResults);

  res.send(JSON.stringify(searchResults));
}

/* Get the Blog tree. */
function getBlogTree() {
  const tree = dirTree(config.BLOG_DIR_PATH, { extensions: config.CONTENT_EXTENSION, normalizePath: true });

  // Modefied the `BLOG_DIR_PATH' to the correct format string.
  var removePath = config.BLOG_DIR_PATH;
  removePath = removePath.replace("./", "");

  removeLeadPath(tree.children, removePath);

  return tree;
}


/**
 * Remove the `BLOG_DIR_PATH', so when the client
 * receive the data would not need to care where is the api directory located.
 * @param { JSON } dir : directory JSON object.
 * @param { typename } rmPath : Param desc here..
 */
function removeLeadPath(dir, rmPath) {
  for (let index = 0;
       index < dir.length;
       ++index)
  {
    let pathObj = dir[index];

    if (pathObj.children != null && pathObj.children.length != 0) {
      removeLeadPath(pathObj.children, rmPath);
    }

    // Remove the `MANUAL_DIR_PATH' or `BLOG_DIR_PATH' path.
    pathObj.path = pathObj.path.replace(rmPath, "");
  }
}

/**
 * Search the match result.
 * @param { JSON } dir : directory JSON object.
 * @param { string } match : stirng check to match.
 * @param { array } arr : Array to store search result.
 */
function searchMatchPath(dir, match, arr) {
  for (let index = 0;
       index < dir.length;
       ++index)
  {
    let pathObj = dir[index];

    if (pathObj.children != null && pathObj.children.length != 0) {
      searchMatchPath(pathObj.children, match, arr);
    }

    /* Make it case insensitive. */
    let nameUpper = pathObj.name.toUpperCase();
    let matchUpper = match.toUpperCase();

    // If match add it to search result.
    if (nameUpper.includes(matchUpper) && pathObj.type == 'file') {
      arr.push(pathObj);
    }
  }
}
