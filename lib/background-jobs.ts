type SocialEventName =
  | 'post.created'
  | 'post.reaction.toggled'
  | 'comment.created'
  | 'comment.reaction.toggled'
  | 'reply.created'
  | 'reply.reaction.toggled';

type SocialEventPayload = Record<string, string | number | boolean | null | undefined>;

interface SocialEvent {
  name: SocialEventName;
  payload: SocialEventPayload;
  occurredAt: string;
}

const exchangeName = process.env.RABBITMQ_EXCHANGE || 'socialmedia.events';

async function publishToRabbitMq(event: SocialEvent) {
  if (!process.env.RABBITMQ_URL) {
    return false;
  }

  try {
    const imported = await new Function('specifier', 'return import(specifier)')('amqplib');
    const connection = await imported.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    channel.publish(
      exchangeName,
      event.name,
      Buffer.from(JSON.stringify(event)),
      {
        contentType: 'application/json',
        persistent: true,
      }
    );

    await channel.close();
    await connection.close();
    return true;
  } catch (error) {
    console.warn('RabbitMQ publish failed, falling back to local log', error);
    return false;
  }
}

export async function enqueueSocialEvent(
  name: SocialEventName,
  payload: SocialEventPayload
) {
  const event: SocialEvent = {
    name,
    payload,
    occurredAt: new Date().toISOString(),
  };

  const published = await publishToRabbitMq(event);
  if (!published && process.env.NODE_ENV !== 'production') {
    console.info('[background-job]', event);
  }
}
