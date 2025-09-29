/**
 * Health Check API Route
 * 
 * This endpoint provides a simple health check for the Next.js application.
 * Used for monitoring, load balancers, and deployment verification.
 * 
 * GET /api/health
 * 
 * Returns:
 * - 200: Service is healthy
 * - 500: Service has issues
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Basic health check information
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'DiMiTo Frontend API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      checks: {
        api: 'ok',
        database: await checkDatabaseConnection(),
        external_services: await checkExternalServices()
      }
    };

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'DiMiTo Frontend API',
      error: error.message,
      checks: {
        api: 'error'
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

/**
 * Check database connection (Django backend)
 */
async function checkDatabaseConnection() {
  try {
    const DJANGO_API_BASE = process.env.DJANGO_API_BASE || 'http://localhost:8000/api';
    
    // Simple ping to Django backend
    const response = await fetch(`${DJANGO_API_BASE}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout for health checks
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return 'connected';
    } else {
      return `error_${response.status}`;
    }
  } catch (error) {
    console.warn('Database health check failed:', error.message);
    return 'disconnected';
  }
}

/**
 * Check external services
 */
async function checkExternalServices() {
  try {
    const checks = {};
    
    // Check OIDC provider
    try {
      const oidcResponse = await fetch('https://lenoauth.com/o/.well-known/openid_configuration', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      checks.oidc_provider = oidcResponse.ok ? 'ok' : 'error';
    } catch (error) {
      checks.oidc_provider = 'timeout';
    }

    return checks;
  } catch (error) {
    return { external_services: 'error' };
  }
}

// Also support HEAD requests for simple alive checks
export async function HEAD(request) {
  try {
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
