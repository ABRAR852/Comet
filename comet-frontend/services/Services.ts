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