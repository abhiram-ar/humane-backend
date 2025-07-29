import { ENV } from '@config/env';
import axios from 'axios';

export const ESproxyAPIClient = axios.create({
   baseURL: ENV.ELASTICSEARCH_PROXY_BASE_URL,
});