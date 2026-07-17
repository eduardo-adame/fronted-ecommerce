const API_URL = "http://localhost:8080/api/v1/";

//Metodo para manejo de errores de la api
const handleResponse = async (response) => {
  if (response.status === 204) return null; 

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = "Error en la solicitud a la API";
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

//Función para realizar solicitudes 
export const apiService = {

     isAuthenticated: () => {
          
            return !!localStorage.getItem('token');
        },
    getProductos: async () => {
        const response = await fetch(
            `${API_URL}productos/`,
            
        );
        return await handleResponse(response);
    },
    getCategorias: async () => {
        const response = await fetch(
            `${API_URL}categorias/`,
        );
        return await handleResponse(response);
    },
    getProducto: async (id) => {
        const response = await fetch(
            `${API_URL}productos/${id}`,
        );
        return await handleResponse(response);
    },
    crearProducto: async (producto) => {
        const response = await fetch(`${API_URL}productos/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(producto),
        });
        return await handleResponse(response);
    },
    actualizarProducto: async (id, producto) => {
        const response = await fetch(`${API_URL}productos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(producto),
        });
        return await handleResponse(response);
    },
    eliminarProducto: async (id) => {
        const response = await fetch(`${API_URL}productos/${id}`, {
            method: "DELETE",
        });
        return await handleResponse(response);
    },
    login: async (username, password) => {
        const response = await fetch(`${API_URL}auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await handleResponse(response);
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('nombre', data.nombre);
            localStorage.setItem('rol', data.rol || data.role || 'ROLE_CLIENTE');
        }
        return data;    
    },
    registro: async (payload) => {
        const response = await fetch(`${API_URL}auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    },
    logout: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('nombre');
        localStorage.removeItem('rol');
    },

    //Clientes
    getClientes: async () => {
        const response = await fetch(`${API_URL}clientes/`);
        return await handleResponse(response);
    },
    getCliente: async (id) => {
        const response = await fetch(`${API_URL}clientes/${id}`);
        return await handleResponse(response);
    },
    crearCliente: async (cliente) => {
        const response = await fetch(`${API_URL}clientes/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cliente),
        });
        return await handleResponse(response);
    },
    actualizarCliente: async (id, cliente) => {
        const response = await fetch(`${API_URL}clientes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cliente),
        });
        return await handleResponse(response);
    },
    eliminarCliente: async (id) => {
        const response = await fetch(`${API_URL}clientes/${id}`, {
            method: "DELETE",
        });
        return await handleResponse(response);
    },

    //Proveedores
    getProveedores: async () => {
        const response = await fetch(`${API_URL}proveedores/`);
        return await handleResponse(response);
    },
    getProveedor: async (id) => {
        const response = await fetch(`${API_URL}proveedores/${id}`);
        return await handleResponse(response);
    },
    crearProveedor: async (proveedor) => {
        const response = await fetch(`${API_URL}proveedores/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(proveedor),
        });
        return await handleResponse(response);
    },
    actualizarProveedor: async (id, proveedor) => {
        const response = await fetch(`${API_URL}proveedores/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(proveedor),
        });
        return await handleResponse(response);
    },
    eliminarProveedor: async (id) => {
        const response = await fetch(`${API_URL}proveedores/${id}`, {
            method: "DELETE",
        });
        return await handleResponse(response);
    },

    //Ventas
    getVentas: async () => {
        const response = await fetch(`${API_URL}ventas/`);
        return await handleResponse(response);
    },
    getVenta: async (id) => {
        const response = await fetch(`${API_URL}ventas/${id}`);
        return await handleResponse(response);
    },
    crearVenta: async (venta) => {
        const response = await fetch(`${API_URL}ventas/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(venta),
        });
        return await handleResponse(response);
    },
    actualizarVenta: async (id, venta) => {
        const response = await fetch(`${API_URL}ventas/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(venta),
        });
        return await handleResponse(response);
    },
    eliminarVenta: async (id) => {
        const response = await fetch(`${API_URL}ventas/${id}`, {
            method: "DELETE",
        });
        return await handleResponse(response);
    },

    
}

    

