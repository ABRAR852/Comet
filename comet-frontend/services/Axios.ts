import axios from "axios";
//https://comet-backend-858583538886.asia-south1.run.app
const api = axios.create({
        baseURL: 'https://oxidimetric-unsolicited-natashia.ngrok-free.dev',
        timeout: 600000,
});

export default api;