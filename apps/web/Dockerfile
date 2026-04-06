FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json /app/package.json
COPY apps/web/package.json /app/apps/web/package.json
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . /app
RUN npm --workspace apps/web run build

FROM node:22-alpine AS runner
WORKDIR /app/apps/web
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next /app/apps/web/.next
COPY --from=builder /app/apps/web/package.json /app/apps/web/package.json
COPY --from=builder /app/apps/web/next.config.mjs /app/apps/web/next.config.mjs
COPY --from=builder /app/apps/web/public /app/apps/web/public
COPY --from=builder /app/node_modules /app/node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
