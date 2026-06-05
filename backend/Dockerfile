FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o saily-backend .

FROM alpine:latest

WORKDIR /pb

COPY --from=builder /app/saily-backend /pb/saily-backend

EXPOSE 8092

CMD ["/pb/saily-backend", "serve", "--http=0.0.0.0:8092"]
