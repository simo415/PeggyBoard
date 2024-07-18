FROM php:7.2-apache

# Debug editor & sql client
RUN apt update \
  && apt -y install vim \
  && apt -y install sqlite3

COPY src/ /var/www/
RUN chown -R www-data /var/www
