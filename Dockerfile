FROM andig/evcc

RUN apk --no-cache add nodejs npm git

#WORKDIR /evcc-id3-charger

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
