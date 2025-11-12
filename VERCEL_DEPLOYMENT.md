# Vercel Deployment Guide for InfraFi Frontend

## Environment Variables Setup

To deploy the InfraFi frontend to Vercel successfully, you need to configure the following environment variables:

### Required Environment Variables

#### 1. Subgraph Endpoint
```
NEXT_PUBLIC_SUBGRAPH_URL
```

**Value for Both Development and Production:**
```
https://infrafi-subgraph.oortech.com/subgraphs/name/infrafi/infrafi-testnet
```

{% hint style="success" %}
**HTTPS Endpoint Available**: OORT now provides an HTTPS endpoint that works for both local development and production deployments!
{% endhint %}

### Using the OORT-Hosted Subgraph

The default configuration now uses the OORT-provided HTTPS endpoint, so no additional setup is required!

If you need to override it for a custom deployment:
```bash
NEXT_PUBLIC_SUBGRAPH_URL=https://your-custom-endpoint.com/subgraphs/name/infrafi/infrafi-testnet
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:
   - **Key**: `NEXT_PUBLIC_SUBGRAPH_URL`
   - **Value**: Your HTTPS subgraph endpoint
   - **Environments**: Select all (Production, Preview, Development)
4. Click **Save**
5. Redeploy your application

## Local Development Setup

Create a `.env.local` file in the `infrafi_frontend` directory:

```bash
# .env.local
NEXT_PUBLIC_SUBGRAPH_URL=http://34.150.61.246:8000/subgraphs/name/infrafi/infrafi-testnet
```

This file is gitignored and won't be committed.

## Testing

After configuring the environment variable:

1. **Local**: Run `npm run dev` and check the browser console for:
   ```
   🔗 Using subgraph URL: http://34.150.61.246:8000/subgraphs/name/infrafi/infrafi-testnet
   ```

2. **Vercel**: After deployment, open the browser console and verify:
   ```
   🔗 Using subgraph URL: https://your-https-endpoint.com/...
   ```

## Troubleshooting

### Error: "Failed to load analytics data: Failed to fetch"

**Cause**: HTTP endpoint being used on HTTPS site (mixed content blocking)

**Solution**: 
1. Check browser console for the subgraph URL being used
2. Ensure it's HTTPS
3. Verify the environment variable is set correctly in Vercel
4. Redeploy after making changes

### How to set up nginx proxy for your Graph Node (Quick Guide)

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://34.150.61.246:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Enable CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
    }
}
```

## Current Status

- ✅ Code updated to use environment variable
- ⏳ Needs HTTPS endpoint configuration
- ⏳ Needs Vercel environment variable setup

