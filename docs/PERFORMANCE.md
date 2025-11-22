# Performance Optimization Guide

This guide outlines performance optimization strategies and best practices for the HomeMore platform.

## Target Metrics

- **Lighthouse Score**: 90+ across all categories
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 50ms (p95)

---

## Frontend Optimization

### 1. Image Optimization

**Current State**: Using Next.js Image component

**Recommendations**:
```tsx
// Use Next.js Image with optimization
import Image from 'next/image';

<Image
  src="/property.jpg"
  alt="Property"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveTheFold}
  placeholder="blur"
  blurDataURL="data:image/..." // Generate blur placeholder
/>
```

**Additional Steps**:
- [ ] Configure image CDN (Cloudinary/Imgix) for dynamic resizing
- [ ] Implement WebP format with fallbacks
- [ ] Lazy load images below the fold
- [ ] Use responsive images with srcset
- [ ] Compress images (TinyPNG/ImageOptim)
- [ ] Target: < 100KB per image

### 2. Code Splitting

**Recommendations**:
```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/property/property-map'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Client-side only for map libraries
});

// Route-based code splitting (automatic with Next.js app router)
// Each page in app/ directory is automatically code-split
```

**Implementation**:
- [x] App Router automatically splits routes
- [ ] Dynamic import for heavy components (maps, charts, editors)
- [ ] Lazy load modals and dialogs
- [ ] Bundle analyzer to identify large dependencies

### 3. Asset Optimization

**CSS**:
```bash
# Tailwind CSS purge (already configured)
# Remove unused styles in production
```

**JavaScript**:
- [x] Minification (Next.js production build)
- [x] Tree shaking (automatic with ES modules)
- [ ] Remove console.log in production
- [ ] Use modern JS syntax (reduces polyfill size)

**Fonts**:
```tsx
// Use Next.js font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});
```

### 4. Caching Strategies

**Static Assets**:
```js
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

**API Caching**:
```tsx
// Use React Query with stale-while-revalidate
const { data } = useQuery({
  queryKey: ['properties'],
  queryFn: fetchProperties,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

### 5. React Performance

**Memoization**:
```tsx
// Use React.memo for expensive components
const PropertyCard = React.memo(({ property }) => {
  return <Card>{/* ... */}</Card>;
});

// Use useMemo for expensive calculations
const sortedProperties = useMemo(() => {
  return properties.sort((a, b) => b.price - a.price);
}, [properties]);

// Use useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
```

**Virtualization**:
```tsx
// Use react-window for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={properties.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <PropertyCard property={properties[index]} />
    </div>
  )}
</FixedSizeList>
```

### 6. Prefetching & Preloading

```tsx
// Prefetch next page routes
import Link from 'next/link';

<Link href="/property/123" prefetch={true}>
  View Property
</Link>

// Preload critical data
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
  });
}, [id]);
```

---

## Backend Optimization

### 1. Database Query Optimization

**Prisma Query Optimization**:
```typescript
// Bad: N+1 query problem
const properties = await prisma.property.findMany();
for (const property of properties) {
  const landlord = await prisma.user.findUnique({
    where: { id: property.landlordId },
  });
}

// Good: Use include to eager load
const properties = await prisma.property.findMany({
  include: {
    landlord: {
      select: { id: true, profile: true },
    },
    photos: {
      take: 1,
      orderBy: { order: 'asc' },
    },
  },
});
```

**Indexing**:
```prisma
// Add indexes for frequently queried fields
model Property {
  id          String   @id @default(cuid())
  city        String   @index // Add index
  price       Int      @index // Add index
  status      PropertyStatus @index // Add index
  landlordId  String   @index // Add index

  @@index([city, price]) // Composite index
  @@index([status, createdAt]) // Composite index
}
```

**Pagination**:
```typescript
// Use cursor-based pagination for better performance
const properties = await prisma.property.findMany({
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  where: { status: 'ACTIVE' },
  orderBy: { createdAt: 'desc' },
});
```

### 2. Caching with Redis

**Implementation**:
```typescript
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in service
async findById(id: string) {
  // Try cache first
  const cached = await this.cache.get<Property>(`property:${id}`);
  if (cached) return cached;

  // Query database
  const property = await this.prisma.property.findUnique({
    where: { id },
    include: { photos: true, landlord: true },
  });

  // Cache result
  await this.cache.set(`property:${id}`, property, 3600); // 1 hour

  return property;
}
```

**Cache Strategy**:
- Cache frequently accessed data (property details, user profiles)
- Set appropriate TTL based on data volatility
- Invalidate cache on updates/deletes
- Use cache warming for popular properties

### 3. Rate Limiting

**Already Configured**:
```typescript
// ThrottlerModule is configured in app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100, // 100 requests per minute
    }),
  ],
})
```

**Fine-tune per endpoint**:
```typescript
@Throttle(10, 60) // 10 requests per minute for this endpoint
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### 4. Connection Pooling

**Prisma Configuration**:
```env
# DATABASE_URL with connection pooling
DATABASE_URL="postgresql://user:password@localhost:5432/homemore?connection_limit=20&pool_timeout=10"
```

**PgBouncer** (for production):
```bash
# Use PgBouncer for connection pooling
DATABASE_URL="postgresql://user:password@pgbouncer:6432/homemore"
DATABASE_URL_UNPOOLED="postgresql://user:password@postgres:5432/homemore"
```

### 5. API Response Optimization

**Compression**:
```typescript
// main.ts
import compression from 'compression';

app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Compression level (1-9)
}));
```

**Pagination & Filtering**:
```typescript
// Always paginate large datasets
@Get('properties')
async findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  // Limit max page size
  const maxLimit = Math.min(limit, 100);

  return this.propertiesService.findAll({
    skip: (page - 1) * maxLimit,
    take: maxLimit,
  });
}
```

**Field Selection**:
```typescript
// Allow clients to select only needed fields
@Get('properties')
async findAll(@Query('fields') fields?: string) {
  const select = fields ?
    fields.split(',').reduce((acc, field) => ({
      ...acc,
      [field]: true,
    }), {}) :
    undefined;

  return this.prisma.property.findMany({ select });
}
```

---

## Monitoring & Measurement

### 1. Performance Monitoring

**Frontend**:
```tsx
// Web Vitals reporting
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics
  analytics.event('web_vitals', {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

**Backend**:
```typescript
// Request timing middleware
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        console.log(`${request.method} ${request.url} - ${duration}ms`);

        // Send to monitoring
        if (duration > 1000) {
          console.warn(`Slow request: ${request.url} took ${duration}ms`);
        }
      }),
    );
  }
}
```

### 2. Tools

**Lighthouse CI**:
```bash
# Run Lighthouse in CI/CD
npm install -g @lhci/cli
lhci autorun --collect.numberOfRuns=3 --assert.preset=lighthouse:recommended
```

**Bundle Analyzer**:
```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({...});

# Run with
ANALYZE=true npm run build
```

**K6 Load Testing**:
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 100 }, // Stay at 100
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% < 200ms
    http_req_failed: ['rate<0.01'],   // < 1% errors
  },
};

export default function () {
  const res = http.get('http://api.homemore.pl/properties');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

---

## Production Checklist

- [ ] Enable production builds (`NODE_ENV=production`)
- [ ] Configure CDN for static assets
- [ ] Enable gzip/brotli compression
- [ ] Set up database connection pooling (PgBouncer)
- [ ] Configure Redis caching
- [ ] Add database indexes for common queries
- [ ] Implement rate limiting
- [ ] Set up monitoring (Datadog/New Relic)
- [ ] Configure error tracking (Sentry)
- [ ] Run Lighthouse tests (score > 90)
- [ ] Run load tests (K6)
- [ ] Optimize images (WebP, compression)
- [ ] Set cache headers for static assets
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Configure SSL/TLS
- [ ] Set up log aggregation
- [ ] Create performance dashboard

---

## References

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [NestJS Performance](https://docs.nestjs.com/techniques/performance)
