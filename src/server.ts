/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { app } from './app';

const start = async () => {
  try {
    await app.listen({
      port: 3000,
    });
    console.log('Server running on port 3000');
  } catch (error) {
    app.log.error(error);
  }
};

start();
