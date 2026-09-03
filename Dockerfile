# Production Dockerfile

ARG NODE_VERSION=24.10.0
ARG RELEASE=unknown
ARG NODE_OPTIONS="--max-old-space-size=1024"

FROM node:${NODE_VERSION}-slim AS base

COPY ./apps/be/scripts /app/apps/be/scripts/
RUN /app/apps/be/scripts/docker-install.d/install.sh

COPY ./yarn.lock ./package.json /.yarnrc.yml /app/
COPY ./.yarn/releases /app/.yarn/releases

COPY ./apps/be/package.json /app/apps/be/
COPY ./apps/be/nest-cli.json /app/apps/be/
COPY ./apps/be/prisma.config.ts /app/apps/be/
COPY ./apps/be/tsconfig.json /app/apps/be/

COPY ./apps/fe/package.json /app/apps/fe/
COPY ./apps/storybook/package.json /app/apps/storybook/

FROM base AS build

WORKDIR /app
ARG RELEASE=unknown
ARG STAGE
ARG NODE_OPTIONS
ENV RELEASE=$RELEASE
ENV STAGE=$STAGE
ENV NODE_ENV=production
ENV NODE_OPTIONS=$NODE_OPTIONS
ENV DO_NOT_TRACK=true

# copy sources and dependencies
COPY . /app/

# install all packages with cache
#RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable
RUN yarn install --immutable
RUN yarn bootstrap && yarn build


FROM base AS final

WORKDIR /app
ARG RELEASE=unknown
ARG STAGE
ARG NODE_OPTIONS
ENV RELEASE=$RELEASE
ENV STAGE=$STAGE
ENV NODE_ENV=production
ENV NODE_OPTIONS=$NODE_OPTIONS
ENV DO_NOT_TRACK=true

# install prod packages with cache
#RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn workspaces focus --production be povio-turborepo
RUN yarn workspaces focus --production be povio-turborepo

# copy configs and scripts
COPY --from=build /app/apps/be/.config /app/apps/be/.config
COPY --from=build /app/scripts /app/scripts

# copy the built application
COPY --from=build /app/apps/be/dist /app/apps/be/dist
COPY --from=build /app/apps/be/resources /app/apps/be/resources

# static
COPY --from=build /app/apps/storybook/storybook-static /app/apps/storybook/storybook-static
COPY --from=build /app/apps/fe/dist /app/apps/fe/dist

# start app
EXPOSE 3000
WORKDIR /app/apps/be

# run the application
ENTRYPOINT ["/app/apps/be/scripts/docker-start.d/start.sh"]
