import axios from 'axios';

const baseUrl = "http://localhost:8000/api/games/";

export async function saveGame(gridData) {
    try {
        const response = await axios.post(baseUrl+"save", gridData);
        return response;
    } catch (error) {

    }
}
