Server hooksup to a relational database that has tables based on the transit API standard and containing the data of transit
Server accepts GET, POST and DELETE requests (and later PUT requests)
  POST requests should add a new route as specified 
  GET requests should return all routes in database
    (A GET request could also return a specific route, but probably eaiser to handle display client side)
  DELETE request deletes a route
  PUT request revises an existing route
When a server returns data it just returns it clean
