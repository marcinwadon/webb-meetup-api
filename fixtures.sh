#!/bin/bash

ASK=true

if [ "$1" == "-f" ]; then
  ASK=false
fi

while $ASK; do
  read -p "It will drop your database. Continue? [y/n] >" yn
  case $yn in
    [Yy]* ) break;;
    [Nn]* ) exit;;
    * ) echo "Please answer yes or no.";;
  esac
done

docker-compose exec -T mongo mongo --eval "db.dropDatabase()"

docker-compose exec -T mongo mongo --eval "db.mappoints.drop()"

docker-compose exec -T mongo \
  mongoimport --db test --collection mappoints --type json \
  --file /mocks/map.json --jsonArray

docker-compose exec -T mongo mongo --eval "db.users.drop()"

docker-compose exec -T mongo \
  mongoimport --db test --collection users --type json \
  --file /mocks/users.json --jsonArray

docker-compose exec -T mongo mongo --eval "db.sessions.drop()"

docker-compose exec -T mongo \
  mongoimport --db test --collection sessions --type json \
  --file /mocks/sessions.json --jsonArray

docker-compose exec -T mongo mongo --eval "db.speakerdetails.drop()"

docker-compose exec -T mongo \
  mongoimport --db test --collection speakerdetails --type json \
  --file /mocks/speakers.json --jsonArray
