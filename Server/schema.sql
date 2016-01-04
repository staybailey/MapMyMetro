/* should eventually have functionality that allows us to make databases for different agencies/people?*/
/* Currently database assumes valid input from KCM*/
CREATE DATABASE kcm;

USE kcm;
/* agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url */
CREATE TABLE agency (
  agency_id INT(11), agency_url VARCHAR(255), agency_timezone VARCHAR(255), agency_lang VARCHAR(255), agency_phone VARCHAR(255), agency_fare_url VARCHAR(255), PRIMARY KEY (agency_id)
);

/* stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,stop_timezone */
CREATE TABLE stops (
  stop_id INT(11), stop_code INT(11), stop_name VARCHAR(255), stop_desc VARCHAR(255), stop_lat VARCHAR(255), stop_lon VARCHAR(255), zone_id INT(11), stop_url VARCHAR(255), location_type INT(11), parent_station VARCHAR(255), stop_timezone VARCHAR(255)
);

CREATE TABLE routes (

);
