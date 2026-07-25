import { Throttle } from '@nestjs/throttler';

//for payment rate limit
export const StrictThrottle = () =>
  Throttle({
    default: {
      limit: 1,
      ttl: 60000,
    },
  });

//for order rate limit
export const ModerateThrottle = () =>
  Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  });

export const RelaxedThrottle = () =>
  Throttle({
    default: {
      limit: 20,
      ttl: 60000,
    },
  });
