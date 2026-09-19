import axios from "axios";

const api = axios.create({
        baseURL: 'https://oxidimetric-unsolicited-natashia.ngrok-free.dev',
        timeout: 60000,
});

export default api;