# pool

build docker
````
docker-compose up --build -d
```

ssh -i ~/.ssh/jsoto-ec2.pem ubuntu@18.223.110.194

# Run
```
npm run main bellevue
```


# Tests
```
npm run test
```


# watch & debug tests
```
npm run debug-test
```

Install docer 
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
 sudo usermod -aG docker ubuntu
 git clone https://github.com/jsotogaviard/pool
 cd pool
 git pull && docker-compose up --build -d && docker-compose logs -f

 ## TODO
 When error proper ending