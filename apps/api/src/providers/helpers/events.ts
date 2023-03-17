import { UserSession, SubscribersService } from '@novu/testing';
import { MessageEntity, SubscriberEntity } from '@novu/dal';
import { expect } from 'chai';
import { isSameDay } from 'date-fns';

import { MAILTRAP_EMAIL, TEMPLATE_IDENTIFIER } from './constants';

export const createSubscriber = async (session: UserSession): Promise<SubscriberEntity> => {
  const _environmentId = session.environment._id;
  const _organizationId = session.organization._id;
  const subscriberService = new SubscribersService(_organizationId, _environmentId);

  const createSubscriberPayload = {
    _environmentId,
    _organizationId,
    channels: [],
    email: MAILTRAP_EMAIL,
    firstName: 'Regression',
    lastName: 'Subscriber',
    phone: '+447070888999',
  } satisfies Omit<SubscriberEntity, '_id' | 'subscriberId' | 'deleted' | 'createdAt' | 'updatedAt'>;

  const subscriber = await subscriberService.createSubscriber(createSubscriberPayload);

  expect(subscriber).to.deep.include({
    _environmentId,
    _organizationId,
    channels: [],
    deleted: false,
    email: MAILTRAP_EMAIL,
    firstName: 'Regression',
    lastName: 'Subscriber',
    phone: '+447070888999',
  });

  expect(subscriber.subscriberId).to.be.ok;
  expect(isSameDay(new Date(subscriber.createdAt as string), new Date()));
  expect(isSameDay(new Date(subscriber.updatedAt as string), new Date()));

  return subscriber;
};

export const triggerEvent = async (
  session: UserSession,
  subscriberId: string,
  payload = {}
): Promise<Record<string, string>> => {
  const response = await session.testAgent.post('/v1/events/trigger').send({
    name: TEMPLATE_IDENTIFIER,
    to: subscriberId,
    payload,
  });

  //console.dir(response);

  expect(response.status).to.eql(201);
  expect(response.body.data).to.be.ok;

  return response.body.data;
};

export const findMessageIdByTransactionId = async (
  session: UserSession,
  transactionId: string
): Promise<MessageEntity[]> => {
  const _environmentId = session.environment._id;
  const _organizationId = session.organization._id;

  const messages = await session.messageService.findMessagesByTransactionId(
    _environmentId,
    _organizationId,
    transactionId
  );

  return messages;
};
