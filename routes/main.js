module.exports = function(app) {
     // default route
     app.get('/',function(req,res){
        res.render('index.ejs')//displays the first html page which is linked to the other pages 
    });
    app.get('/about',function(req,res){
        res.render('about.ejs')//displays the first html page which is linked to the other pages 
    });
    //lists posts route
    app.get('/posts',function(req,res){
        let sqlquery = `SELECT * 
                        FROM post
                        JOIN  topic
                        ON post.topic_id=topic.topic_id;`;
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            console.log(result)
            res.render('posts.ejs', {posts:result})
         });
       
    });
    app.get('/topics', function(req, res) {
        let sqlquery = "SELECT * FROM topic"; // Select the 'topic' column from the 'posts' table
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            } else {
                console.log(result);
                res.render('topics.ejs', {topics:result})
            }
        });
    });
    app.get('/topic/:topicId', function(req, res) {
        let topicId = req.params.topicId; //the topic id which is in url is used to find the posts under that topic within the posts table.
        let sqlQuery = "SELECT * FROM post WHERE topic_id = ?";
        //using the sql the posts are retrieved
        db.query(sqlQuery, [topicId], (err, posts) => {
            if (err) {
                console.error(err);
                // if there is an error this message will display
                res.send('Error fetching posts for the specified topic.');
            } else {
                // renders the html page and displayed all the posts associated with the topic selected
                res.render('postsForTopic.ejs', { posts: posts });
            }
        });
    });
    
    
    app.get('/users', function(req, res) {
        let sqlquery = "SELECT * FROM user"; // Select the 'topic' column from the 'posts' table
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            } else {
                console.log(result);
                res.render('users.ejs', {users:result})
            }
        });
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs');//displays the html page for register                                                       
    });                                                                                                 
    app.post('/registered', function (req,res) {
        // saving data in database
        let sqlquery = "INSERT INTO user (username, name, email) VALUES (?,?,?)";//inserts the new user data into the database
        // execute sql query
        let newuser = [req.body.username, req.body.name, req.body.email];
        db.query(sqlquery, newuser, (err, result) => {
          if (err) {
            return console.error(err.message);
          }
          else {
            res.send(' Welcome to the forum'+ req.body.username);
          }
        });
  });        
  app.get('/addpost', function(req, res) {
    let getTopicsQuery = "SELECT * FROM topic"; // Query to retrieve topics from the database
    db.query(getTopicsQuery, (err, topics) => {
        if (err) {
            // Handle the error
            console.error(err.message);
            res.send('An error occurred while retrieving topics.');
        } else {
            res.render('addpost.ejs', { topics: topics }); // Render the html with the topics
        }
    });
});                                                                                               
app.post('/postadded', function (req, res) {
    let username = req.body.username;
    let topic = req.body.topic;
    let userIdQuery = "SELECT user_id FROM user WHERE username = ?";
    let topicIdQuery = "SELECT topic_id FROM topic WHERE topicname = ?";
    //find the user_id with the username given
    db.query(userIdQuery, [username], (err, userResults) => {
        if (err) {
            return console.error(err.message);
        }
        //if the username is found then we can look for the topic next
        if (userResults.length > 0) {
            let user_id = userResults[0].user_id;
            //find the topic id using the topicname the given
            db.query(topicIdQuery, [topic], (err, topicResults) => {
                if (err) {
                    return console.error(err.message);
                }
                //if the topicname is found then we can add the post under that topic
                if (topicResults.length > 0) {
                    let topic_id = topicResults[0].topic_id;
                    let sqlquery = "INSERT INTO post (text, user_id, topic_id) VALUES (?, ?, ?)";
                    //using the user id and topic id the text can be inserted under the correct columns
                    let newpost = [req.body.text, user_id, topic_id];
                    db.query(sqlquery, newpost, (err, result) => {
                        if (err) {
                            return console.error(err.message);
                        } else {
                            res.send('New Post added to Posts by user: ' + username);
                        }
                    });
                } else {
                    //if the topic has not been found then create a new topic
                    let insertNewTopicQuery = "INSERT INTO topic (topicname) VALUES (?)";
                    db.query(insertNewTopicQuery, [topic], (err, insertResult) => {
                        if (err) {
                            return console.error(err.message);
                        }
                        //then add the text under the new topic name that has been created
                        let newTopicId = insertResult.insertId;
                        let sqlquery = "INSERT INTO post (text, user_id, topic_id) VALUES (?, ?, ?)";
                        let newpost = [req.body.text, user_id, newTopicId];
                        db.query(sqlquery, newpost, (err, result) => {
                            if (err) {
                                return console.error(err.message);
                            } else {
                                res.send('New topic created and new post added to Posts by user: ' + username);
                            }
                        });
                    });
                }
            });
        } else {
            res.send('User not found. If you have not registered please register.');
        }
    });
});

app.get('/search',function(req,res){
    res.render("search.ejs");//displays the html page for search
});
 app.get('/search-result', function(req, res) {
    let sqlquery = `SELECT * FROM post
                    JOIN topic 
                    ON post.topic_id = topic.topic_id
                    WHERE post.text LIKE ?`;
    // execute sql query
    const keyword = req.query.keyword;
    db.query(sqlquery, [`%${keyword}%`], (err, result) => {
        if (err) {
            res.redirect('./'); 
        }
        if (result.length === 0) {//if there are no posts found that match the search result then the message below in res.send is displayed
            res.send("Cannot find the post you are looking for.");
        }
        let searchData = Object.assign({}, {posts:result});
        console.log(searchData)
        let response = 'You have searched for: ' + keyword + '. Currently Found:';
        result.forEach((post) => {//compares each element in the array to the keyword
        response += ` ${post.text}`;//displays the post names and the topics next to it
    });
        res.render("searchresult.ejs", searchData)

     });
     
});
app.get('/usersearch',function(req,res){
    res.render("usersearch.ejs");//displays the html page for search
});
 app.get('/usersearch-result', function(req, res) {
    let sqlquery = "SELECT * FROM user WHERE username LIKE ?"; // query database to get all the users with the inputted username
    // execute sql query
    const keyword = req.query.keyword;
    db.query(sqlquery, [`%${keyword}%`], (err, result) => {
        if (err) {
            res.redirect('./'); 
        }
        if (result.length === 0) {//if there are no users found that match the search result then the message below in res.send is displayed
            res.send("Cannot find the user you are looking for.");
        }
        let userData = Object.assign({}, {users:result});
        console.log(userData)
        let response = 'You have searched for: ' + keyword + '. Currently Found:';
        result.forEach((user) => {//compares each element in the array to the keyword
        response += ` ${user.username}`;//displays the usernames
    });
        res.render("usersearch-result.ejs", userData)//displays the html page for list to list the usernames that match or are similar
     });
});

app.get('/topicsearch',function(req,res){
    res.render("topicsearch.ejs");//displays the html page for search
});
 app.get('/topicsearch-result', function(req, res) {
    let sqlquery = "SELECT * FROM topic WHERE topicname LIKE ?";
    // execute sql query
    const keyword = req.query.keyword;
    db.query(sqlquery, [`%${keyword}%`], (err, result) => {
        if (err) {
            res.redirect('./'); 
        }
        if (result.length === 0) {//if there are no topics found that match the search result then the message below in res.send is displayed
            res.send("Cannot find the topic you are looking for.");
        }
        let topicData = Object.assign({}, {topics:result});
        console.log(topicData)
        let response = 'You have searched for: ' + keyword + '. Currently Found:';
        result.forEach((topic) => {//compares each element in the array to the keyword
        response += ` ${topic.topicname}`;//displays the topic names
    });
        res.render("topicsearch-result.ejs", topicData)//displays the html page for the result of the different topics that match the search 
     });
});

}