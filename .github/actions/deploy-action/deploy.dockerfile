FROM docker:latest
COPY .. .
RUN apk add --update bash nodejs npm jq
CMD ["bash", "deploy.sh"]
