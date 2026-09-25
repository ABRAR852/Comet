import api from "./Axios";


export async function userQuery (conversationId: string | null, content: string) {
    try {
        const response = await api.post
            ('/User/askQuery', {conversationId: conversationId ?? '', content});

        return response.data;
    } catch (error) {
        console.log("USERQUERY ERROR: ", error);
        throw error;
    }
}

export async function getConv () {
    try {
        const response = await api.get('/User/get-conv');
        return response.data;
    } catch (error) {
        console.log("USERQUERY ERROR: ", error);
        throw error;
    }
}

export async function getMgs (convId: string) {
    try {
        const response = await api.get(`/User/get-msg/${convId}`);
        return response;
    } catch (error) {
        console.log("USERQUERY ERROR: ", error);
        throw error;
    }
}