export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.KAFKA_BROKERS) {
    const { startConsumers } = await import('@/modules/consumers');
    await startConsumers().catch((err) => {
      console.error('Failed to start Kafka consumers:', err);
    });
  }
}
