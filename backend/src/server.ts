import app from './app';
import { env } from './config/env';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Image Upload System API Backend running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`📡 Healthcheck available at http://localhost:${PORT}/health`);
});
