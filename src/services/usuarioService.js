
import axios from "axios";


const API_URL = "http://localhost:3001/usuarios";

export const usuarioService = {
  obtenerUsuarios: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  obtenerUsuarioPorId: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  obtenerUsuarioPorEmail: async(email) =>{
     const response = await axios.get(`${API_URL}?email=${email}`);
    return response.data;
  },

  eliminarUsuario: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  },
  actualizarUsuario: async (id, producto) => {
    const response = await axios.put(`${API_URL}/${id}`, producto);
    return response.data;
  },

  crearUsuario: async (producto) => {
    const response = await axios.post(API_URL,producto);
    return response.data;
  },
};
