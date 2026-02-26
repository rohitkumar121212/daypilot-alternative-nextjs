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
# Build image with environment variables
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://aperfectstay.ai \
  --build-arg NEXT_PUBLIC_AUTH_URL=https://aperfectstay.ai \
  -t daypilot-app .

# Run container
docker run -p 3000:3000 daypilot-app
```

### Using Docker Compose

```bash
# Start
docker-compose up -d

# Stop
docker-compose down
```

### GCP Cloud Run Deployment

```bash
# Build and push to GCP Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/daypilot-app \
  --substitutions=_NEXT_PUBLIC_API_BASE_URL=https://aperfectstay.ai,_NEXT_PUBLIC_AUTH_URL=https://aperfectstay.ai

# Deploy to Cloud Run
gcloud run deploy daypilot-app \
  --image gcr.io/PROJECT_ID/daypilot-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Production Build

```bash
npm run build
npm start
```
