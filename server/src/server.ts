import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, env.host, () => {
  console.log(`API server is running on http://localhost:${env.port}`);
});
