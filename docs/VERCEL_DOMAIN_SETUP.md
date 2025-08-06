# Vercel Domain Setup and TTL Configuration Guide

## Overview
This guide covers how to connect a custom domain to your Vercel deployment and configure optimal TTL (Time To Live) settings.

## Domain Connection Steps

### 1. Add Domain in Vercel Dashboard
1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`ptest`)
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain name (e.g., `yourdomain.com`)

### 2. DNS Configuration

#### For Root Domain (yourdomain.com):
```
Type: A
Name: @
Value: 76.76.19.36
TTL: 3600 (1 hour)
```

#### For WWW Subdomain (www.yourdomain.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (1 hour)
```

#### For API Subdomain (api.yourdomain.com):
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600 (1 hour)
```

## TTL Configuration Best Practices

### Initial Setup (Low TTL)
During initial setup and testing, use low TTL values for quick propagation:

```
TTL: 300 (5 minutes)
```

### Production (Standard TTL)
Once everything is working correctly, increase TTL for better performance:

```
TTL: 3600 (1 hour)
```

### High Traffic Sites (Longer TTL)
For high-traffic sites with stable configurations:

```
TTL: 86400 (24 hours)
```

## Domain Verification

### 1. Check DNS Propagation
Use these tools to verify DNS propagation:
- [whatsmydns.net](https://whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)
- [mxtoolbox.com](https://mxtoolbox.com)

### 2. SSL Certificate
Vercel automatically provisions SSL certificates:
- Let's Encrypt certificates are issued automatically
- Certificates are renewed automatically
- No manual configuration required

## Advanced Configuration

### Custom Headers (Already configured in vercel.json)
Your project already has custom headers configured:

```json
{
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

### Environment-Specific Domains
You can configure different domains for different environments:

- **Production**: `yourdomain.com`
- **Preview**: `preview.yourdomain.com`
- **Development**: `dev.yourdomain.com`

## Troubleshooting

### Common Issues

1. **DNS Not Propagated**
   - Wait for TTL to expire
   - Check with multiple DNS lookup tools
   - Verify DNS records are correct

2. **SSL Certificate Issues**
   - Wait 24-48 hours for certificate issuance
   - Ensure DNS is properly configured
   - Check for mixed content issues

3. **Domain Not Accessible**
   - Verify domain is added in Vercel dashboard
   - Check DNS records match Vercel requirements
   - Ensure domain is not blocked by firewall

### Verification Commands

```bash
# Check DNS records
nslookup yourdomain.com
dig yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check HTTP headers
curl -I https://yourdomain.com
```

## Performance Optimization

### CDN Configuration
Vercel automatically provides:
- Global CDN with 200+ edge locations
- Automatic image optimization
- Static asset caching

### Cache Headers
Your current configuration includes:
- Manifest files: 1 hour cache
- Icons: 24 hour cache
- Favicon: 24 hour cache

## Security Considerations

### HTTPS Enforcement
Vercel automatically:
- Redirects HTTP to HTTPS
- Provides HSTS headers
- Issues valid SSL certificates

### Domain Security
- Enable domain verification in Vercel
- Monitor for unauthorized domain additions
- Regular security audits

## Monitoring and Analytics

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Track Core Web Vitals
- Monitor error rates

### Custom Monitoring
Consider adding:
- Uptime monitoring (UptimeRobot, Pingdom)
- Performance monitoring (New Relic, DataDog)
- Error tracking (Sentry, LogRocket)

## Next Steps

1. Add your domain in Vercel dashboard
2. Configure DNS records with initial low TTL (300 seconds)
3. Verify propagation using DNS lookup tools
4. Test website functionality
5. Increase TTL to production values (3600 seconds)
6. Monitor performance and security
7. Set up monitoring and analytics

## Support Resources

- [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Vercel DNS Configuration](https://vercel.com/docs/concepts/projects/domains/domain-configuration)
- [Vercel Support](https://vercel.com/support) 