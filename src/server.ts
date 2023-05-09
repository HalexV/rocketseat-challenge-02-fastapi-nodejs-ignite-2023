/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { app } from './app';
import { env } from './env';

const start = async () => {
  try {
    await app.listen({
      port: env.PORT,
    });
    console.log(`Server running on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error);
  }
};

start();
