FROM node:15.11.0

# Install everything that is necessary to run crons and bluetooth
RUN apt-get update && apt-get -y install cron nano less vim bluetooth bluez libbluetooth-dev libudev-dev libcap2-bin gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Mandatory from https://github.com/abandonware/noble#linux
RUN setcap cap_net_raw+eip $(eval readlink -f `which node`)

# Cron to retrieve sensor data and push it to influx
RUN (crontab -l ; echo "* * * * * PATH="$PATH:/usr/local/bin" /usr/local/bin/npm --prefix /usr/src/app run main bellevue >> /var/log/cron.log 2>&1") | crontab
RUN (crontab -l ; echo "* * * * * PATH="$PATH:/usr/local/bin" /usr/local/bin/npm --prefix /usr/src/app run main castex >> /var/log/cron.log 2>&1") | crontab
 
# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Create app directory to run node js app
WORKDIR /usr/src/app

# Copy source files
COPY package*.json ./
COPY src src
COPY slots slots

RUN mkdir data

# Install dependencies
RUN npm install

# Start cron and log the result
CMD cron && tail -f /var/log/cron.log