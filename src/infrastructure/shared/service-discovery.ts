import {
  ServiceDiscoveryClient,
  DiscoverInstancesCommand,
} from '@aws-sdk/client-servicediscovery';

export interface DiscoveredService {
  ip: string;
  port: string;
}

export const discoverService =  async (
  namespaceName: string,
  serviceName: string
): Promise<DiscoveredService> => {
  const client = new ServiceDiscoveryClient({ region: 'eu-central-1' });

  const params = {
    NamespaceName: namespaceName,
    ServiceName: serviceName,
  };
  const command = new DiscoverInstancesCommand(params);

  try {
    const response = await client.send(command);

    if (!response)
      throw new Error(
        `Service discovery for service ${serviceName} did not return a response`
      );
    if (!response.Instances)
      throw new Error(`Service instances for ${serviceName} not available`);
    if (!response.Instances.length)
      throw new Error(`No service instances exist for ${serviceName}`);

    const attributes = response.Instances[0].Attributes;
    if (!attributes)
      throw new Error(`Attributes for ${serviceName} instance do not exist`);

    return {
      ip: attributes.AWS_INSTANCE_IPV4,
      port: attributes.AWS_INSTANCE_PORT,
    };
  } catch (error: any) {
    return Promise.reject(typeof error === 'string' ? error : error.message);
  }
};
