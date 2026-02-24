This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

## Docker Deployment

### Build and Run

```bash
# Build image
docker build -t daypilot-app .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://aperfectstay.ai \
  -e NEXT_PUBLIC_AUTH_URL=https://aperfectstay.ai \
  daypilot-app
```

### Using Docker Compose

```bash
# Start
docker-compose up -d

# Stop
docker-compose down
```

## Production Build

```bash
npm run build
npm start
```
