DROP DATABASE IF EXISTS kcm;

CREATE DATABASE kcm;

USE kcm;
/* Eventually shapes should reference nodes for point_type, lat and lon */
CREATE TABLE shapes (
  id INT(11) NOT NULL AUTO_INCREMENT, shape_id INT(11), shape_pt_lat FLOAT, shape_pt_lon FLOAT, shape_pt_sequence INT(11), shape_dist_traveled INT(11), point_type VARCHAR (255), PRIMARY KEY (id)
);

/* May prove gratuitous and service spans maybe should be times*/
CREATE TABLE simpleroutes (
  id INT(11) NOT NULL AUTO_INCREMENT, name VARCHAR(255), description VARCHAR(255), peak_frequency INT(11), daytime_frequency INT(11), offhours_frequency INT(11), service_start INT(11), service_end INT(11), shape_id_0 INT(11), shape_id_1 INT(11), subway BOOLEAN, PRIMARY KEY (id)
);

CREATE TABLE nodes (
  id INT(11) NOT NULL AUTO_INCREMENT, point_type VARCHAR(255), lat FLOAT, lon FLOAT, PRIMARY KEY (id)
);

CREATE TABLE edges (
  id INT(11) NOT NULL AUTO_INCREMENT, start_node INT(11), end_node INT(11), weight INT(11), PRIMARY KEY (id), FOREIGN KEY (start_node) REFERENCES nodes(id), FOREIGN KEY (start_node) REFERENCES nodes(id)
);
