FROM php:7.2-apache

# Debug editor
RUN apt update \
  && apt -y install vim

COPY src/ /var/www/
RUN chown -R www-data /var/www
