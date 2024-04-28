

#!/bin/bash

servicesList () {
  docker-compose ps --services
}

while ! nc -z localhost 5432; do
  echo "waiting for postgres"
  sleep 10
done


echo "Postgres service is up and running. 🚀 🚀 🚀"

echo "📚 HINT: You can use these commands. 'migrate', 'generate', 'updateDB' OR you can write your own command."

read -r -p "Enter prisma command:  " prismaCommand

if [[ $prismaCommand == migrate ]]; then
  docker-compose exec backend npx prisma migrate dev --name first_migration
elif [[ $prismaCommand == generate ]]; then
  docker-compose exec backend npx prisma generate
elif [[ $prismaCommand == updateDB ]]; then
  docker-compose exec backend npx prisma db push
else
  docker-compose exec backend $prismaCommand
fi
