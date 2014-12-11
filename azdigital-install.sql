CREATE DATABASE IF NOT EXISTS azdigital;
 
USE azdigital;

--
-- Table structure for table `clients`
--

CREATE TABLE IF NOT EXISTS `clients` (
  `clientNumber` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` varchar(256) NOT NULL,
  `cell` varchar(50) DEFAULT NULL,
  `city` varchar(50) NOT NULL,
  `postalCode` varchar(15) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `province` varchar(50) NOT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `gender` varchar(16) NOT NULL,
  `homeType` varchar(50) DEFAULT NULL,
  `notes` varchar(1028) DEFAULT NULL,
  `referalType` varchar(128) DEFAULT NULL,
  `referalText` varchar(2028) DEFAULT NULL,
  PRIMARY KEY (`clientNumber`)
);

--
-- Table structure for table `services`
--

CREATE TABLE IF NOT EXISTS `services` (
  `serviceNumber` int(11) NOT NULL AUTO_INCREMENT,
  `clientNumber` int(11) NOT NULL,
  `invoiceNumber` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `provider` varchar(256) DEFAULT NULL,
  `deviceType` varchar(50) DEFAULT NULL,
  `deviceSubtype` varchar(50) DEFAULT NULL,
  `monthlyCharge` decimal(10,2) DEFAULT NULL,
  `activationCost` decimal(10,2) DEFAULT NULL,
  `numUnits` int(11) DEFAULT NULL,
  `unitCost` decimal(10,2) DEFAULT NULL,
  `totalCost` decimal(10,2) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `deactivationDate` date DEFAULT NULL,
  `notes` varchar(2028) DEFAULT NULL,
  PRIMARY KEY (`serviceNumber`)
);

--
-- Table structure for table `cards`
--

CREATE TABLE IF NOT EXISTS `cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clientNumber` int(11) NOT NULL,
  `name` varchar(128) NOT NULL,
  `number` varchar(64) NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `security` varchar(16) NOT NULL,
  PRIMARY KEY (`id`)
);

--
-- Table structure for table `invoces`
--

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentID` int(11) DEFAULT NULL,
  `clientNumber` int(11) NOT NULL,
  `amountDue` decimal(10,2) NOT NULL,
  `amountPaid` decimal(10,2) NOT NULL DEFAULT 0,
  `method` varchar(128) NOT NULL,
  `dueDate` date DEFAULT NULL,
  `paidDate` date DEFAULT NULL,
  `billingCycle` varchar(128) NOT NULL,
  `createdTime` timestamp default current_timestamp,
  `paidBy` varchar(128) DEFAULT NULL,
  `createdBy` varchar(128) NOT NULL,
  `notes` varchar(2028) DEFAULT NULL,
  PRIMARY KEY (`id`)
);


--
-- Table structure for users `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  `firstname` varchar(256) DEFAULT NULL,
  `lastname` varchar(256) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
);


INSERT INTO `users` VALUES (1, 'admin', SHA1('123'), 'Administrator', '1', '3');