import packageInfo from '../package.json';
import env from './env';

const app = {
  version: packageInfo.version,
  name: 'Taskiyo',
  logoUrl: '/logo-taskiyo.svg',
  url: env.appUrl,
};

export default app;
