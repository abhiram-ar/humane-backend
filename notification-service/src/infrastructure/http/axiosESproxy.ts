import axios from 'axios';

export const axiosESproxyService = axios.create({
   baseURL: 'http://elasticsearch-proxy-srv:3000',
});
