CREATE DATABASE myforum;

USE myforum;

CREATE TABLE `membership` (
  `user_id` int NOT NULL,
  `topic_id` int NOT NULL
);

CREATE TABLE `topic` (
  `topic_id` int NOT NULL AUTO_INCREMENT,
  `topicname` varchar(45) NOT NULL,
  PRIMARY KEY (`topic_id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
);

CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
);

CREATE TABLE `post` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `text` varchar(500) DEFAULT 'empty',
  `user_id` int NOT NULL,
  `topic_id` int NOT NULL,
  `postcol` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `FK_post_user_idx` (`user_id`),
  KEY `FK_post_topic_idx` (`topic_id`),
  CONSTRAINT `FK_post_topic` FOREIGN KEY (`topic_id`) REFERENCES `topic` (`topic_id`),
  CONSTRAINT `FK_post_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
);

CREATE USER IF NOT EXISTS 'forumuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON myforum.* TO 'forumuser'@'localhost';