FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o saily-backend .

FROM alpine:latest

RUN apk add --no-cache ca-certificates wget

# Create a non-root user
RUN addgroup -S sailygroup && adduser -S sailyuser -G sailygroup

WORKDIR /pb

COPY --from=builder /app/saily-backend /pb/saily-backend

# Ensure data directory is owned by the non-root user
RUN mkdir -p /pb/pb_data && chown -R sailyuser:sailygroup /pb

USER sailyuser

EXPOSE 8092

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8092/api/health || exit 1

CMD ["/pb/saily-backend", "serve", "--http=0.0.0.0:8092", "--dir=/pb/pb_data"]
