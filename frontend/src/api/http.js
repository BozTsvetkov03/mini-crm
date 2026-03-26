import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000
})

export default http;