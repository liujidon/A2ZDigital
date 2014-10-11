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
  `referalText` varchar(1028) DEFAULT NULL,
  PRIMARY KEY (`clientNumber`)
);

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`clientNumber`, `firstName`, `lastName`, `phone`, `address`, `cell`, `city`, `postalCode`, `email`, `province`, `dateOfBirth`, `gender`,
						`homeType`, `notes`, `referalType`, `referalText`) VALUES
(1, 'Bill', 'Liu', '416-123-4567', '123 Test Street', '905-123-4567', 'Toronto', 'A1B 2C3', 'test@gmail.com', 'Ontario', '1990-11-23', 'Male', 'Apartment', 'special stuff here', 'Facebook', null),
(2, 'Bill2', 'Liu2', '416-123-4567', '123 Test Street', '905-123-4567', 'Toronto', 'A1B 2C3', 'test@gmail.com', 'Ontario', '1990-10-24', 'Male', 'Apartment', 'special stuff here', 'Facebook', null);

