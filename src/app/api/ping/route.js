/**
 * Simple Ping API Route
 * 
 * Minimal health check endpoint for quick alive/dead status.
 * Used for basic monitoring and load balancer health checks.
 * 
 * GET /api/ping
 * 
 * Returns: Simple "pong" response
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString()
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

// Support HEAD requests for minimal overhead checks
export async function HEAD(request) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
