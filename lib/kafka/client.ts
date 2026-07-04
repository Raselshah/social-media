import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { logger } from '@/lib/logger';

let kafka: Kafka | null = null;
let producer: Producer | null = null;

function getKafkaBrokers(): string[] | null {
  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) return null;
  return brokers.split(',').map((b) => b.trim());
}

export function getKafka(): Kafka | null {
  if (kafka) return kafka;

  const brokers = getKafkaBrokers();
  if (!brokers) {
    logger.warn('KAFKA_BROKERS not configured — event publishing disabled');
    return null;
  }

  kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'socialmedia-app',
    brokers,
    logLevel: process.env.NODE_ENV === 'production' ? logLevel.WARN : logLevel.INFO,
  });

  return kafka;
}

export async function getProducer(): Promise<Producer | null> {
  const instance = getKafka();
  if (!instance) return null;

  if (!producer) {
    producer = instance.producer({
      idempotent: true,
      maxInFlightRequests: 5,
    });
    await producer.connect();
    logger.info('Kafka producer connected');
  }

  return producer;
}

export async function createConsumer(groupId: string): Promise<Consumer | null> {
  const instance = getKafka();
  if (!instance) return null;

  const consumer = instance.consumer({ groupId });
  await consumer.connect();
  logger.info('Kafka consumer connected', { groupId });
  return consumer;
}

export async function disconnectKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}
