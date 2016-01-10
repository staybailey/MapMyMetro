DROP DATABASE IF EXISTS kcm;

CREATE DATABASE kcm;

USE kcm;
/* agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url */
/*
CREATE TABLE agency ( 
  agency_id VARCHAR(255) NOT NULL, agency_url VARCHAR(255), agency_timezone VARCHAR(255), agency_lang VARCHAR(255), agency_phone VARCHAR(255), agency_fare_url VARCHAR(255)
);
*/
/* stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,stop_timezone */

CREATE TABLE stops (
  stop_id INT(11) NOT NULL, stop_code INT(11), stop_name VARCHAR(255), stop_desc VARCHAR(255), stop_lat VARCHAR(255), stop_lon VARCHAR(255), zone_id INT(11), stop_url VARCHAR(255), location_type INT(11), parent_station VARCHAR(255), stop_timezone VARCHAR(255), PRIMARY KEY (stop_id)
);

/* route_id,agency_id,route_short_name,route_long_name,route_desc, route_type,route_url,route_color,route_text_color */


CREATE TABLE routes (
  route_id INT(11) NOT NULL, agency_id VARCHAR(255), route_short_name VARCHAR(255), route_long_name VARCHAR(255), route_desc VARCHAR(255), route_type INT(11), route_url VARCHAR(255), route_color VARCHAR(255), route_text_color VARCHAR(255), PRIMARY KEY (route_id)
);

/* route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id */

/* trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type,shape_dist_traveled,fare_period_id */

CREATE TABLE shapes (
  id INT(11) NOT NULL AUTO_INCREMENT, shape_id INT(11), shape_pt_lat FLOAT, shape_pt_lon FLOAT, shape_pt_sequence INT(11), shape_dist_traveled INT(11), PRIMARY KEY (id)
);

CREATE TABLE trips (
  route_id INT(11), service_id INT(11), trip_id INT(11) NOT NULL, trip_headsign VARCHAR(255), trip_short_name VARCHAR(255), direction_id INT(11), block_id INT(11), shape_id INT(11), PRIMARY KEY (trip_id), FOREIGN KEY (route_id) REFERENCES routes(route_id)
);

CREATE TABLE stop_times (
  id INT(11) NOT NULL AUTO_INCREMENT, trip_id INT(11), arrival_time TIME, departure_time TIME, stop_id INT(11), stop_sequence INT(11), stop_headsign VARCHAR(255), pickup_type INT(11), drop_off_type INT(11), shape_dist_traveled FLOAT, fare_period_id INT(11), PRIMARY KEY (id), FOREIGN KEY (trip_id) REFERENCES trips(trip_id), FOREIGN KEY (stop_id) REFERENCES stops(stop_id)
);
/* May prove gratuitous and service spans maybe should be times*/
CREATE TABLE simpleroutes (
  id INT(11) NOT NULL AUTO_INCREMENT, route_id INT(11), route_short_name VARCHAR(255), trip_headsign VARCHAR(255), peak_frequency INT(11), daytime_frequency INT(11), offhours_frequency INT(11), service_start INT(11), service_end INT(11), PRIMARY KEY (id)
);




