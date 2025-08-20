export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOTel } = await import('@vercel/otel')
    
    registerOTel({
      serviceName: 'portfolio-app',
    })
    
    console.log('OpenTelemetry instrumentation registered for portfolio-app')
  }
}