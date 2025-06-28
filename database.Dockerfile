# syntax=docker.io/docker/dockerfile:1

FROM oven/bun:alpine AS prismacli
COPY ./prisma /prisma
# Generate initial database schema
RUN bunx prisma migrate diff --from-empty --to-schema-datamodel /prisma/schema.prisma --script -o /init.sql

FROM postgres:latest AS database
COPY --from=prismacli /init.sql /docker-entrypoint-initdb.d/init.sql
