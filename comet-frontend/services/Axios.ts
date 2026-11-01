import axios from "axios";
//https://oxidimetric-unsolicited-natashia.ngrok-free.dev
const api = axios.create({
        baseURL: 'https://comet-backend-858583538886.asia-south1.run.app',
        timeout: 600000,
});

export default api;