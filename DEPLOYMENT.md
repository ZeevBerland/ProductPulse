# ProductPulse Deployment Guide

## Option A: Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account (code already at: https://github.com/ZeevBerland/ProductPulse)
- Vercel account (free at vercel.com)
- Convex account (for backend)
- Google Gemini API key

### Step 1: Set Up Convex Production

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Create a new production deployment (or use existing)
3. Note down your production deployment URL
4. Set the Gemini API key:
   ```bash
   npx convex env set GEMINI_API_KEY your_key_here --prod
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import the `ZeevBerland/ProductPulse` repository
4. Configure environment variables:
   - `NEXT_PUBLIC_CONVEX_URL` = Your Convex production URL
   - `CONVEX_DEPLOYMENT` = Your Convex deployment name
5. Click "Deploy"

### Step 3: Verify Deployment

1. Open the Vercel URL (e.g., `productpulse-xxx.vercel.app`)
2. Create a test project
3. Verify AI suggestions work
4. Verify fetch and analysis work

---

## Option B: Share Local Demo (If Deployment Issues)

If you encounter deployment issues, you can:

1. Run locally with `npm run dev`
2. Record a comprehensive video demo
3. Share the GitHub repository link
4. Explain in your submission that a live demo video is provided

---

## Environment Variables Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex backend URL | Convex Dashboard |
| `CONVEX_DEPLOYMENT` | Deployment name | Convex Dashboard |
| `GEMINI_API_KEY` | Google AI API key | [Google AI Studio](https://aistudio.google.com/apikey) |

---

## Troubleshooting

### "Failed to fetch" errors
- Check Convex deployment is running
- Verify environment variables are set correctly

### AI features not working
- Ensure `GEMINI_API_KEY` is set in Convex environment
- Check Convex logs for errors

### Build fails on Vercel
- Check Node.js version (needs 18+)
- Verify all dependencies are in package.json
