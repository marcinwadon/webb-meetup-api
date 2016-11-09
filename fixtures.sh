#!/bin/bash

while true; do
  read -p "It will drop your database. Continue? [y/n] >" yn
  case $yn in
    [Yy]* ) break;;
    [Nn]* ) exit;;
    * ) echo "Please answer yes or no.";;
  esac
done

docker-compose exec -T mongo mongo --eval "db.mappoints.drop()"

docker-compose exec -T mongo \
  mongoimport --db test --collection mappoints --type json \
  --file /mocks/map.json --jsonArray


docker-compose exec -T mongo mongo --eval "db.users.drop()"

docker-compose exec -T mongo \
  mongoimport --db test --collection users --type json \
  --file /mocks/users.json --jsonArray
