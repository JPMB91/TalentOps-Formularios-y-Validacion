import { useState } from "react";
import userSchema from "../utils/userSchema";

export const FormularioRegistro = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = {};

      result.error.issues.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });

      setErrors(formattedErrors);
      return;
    }

    setErrors({});

    try {
      // await apiClient.post("/auth/register", formData);

      alert("Registro exitoso");
    } catch (apiError) {
      setErrors({
        error: "Error al registrar usuario",
      });
    }
  };

  return (
    <div className="login-container">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Usuario:</label>
          <input
            id="nombre"
            name="nombre"
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
          {errors.nombre && <p className="error">{errors.nombre}</p>}
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="repeatPassword">Repetir contraseña:</label>
          <input
            id="repeatPassword"
            name="repeatPassword"
            type="password"
            onChange={(e) =>
              setFormData({ ...formData, repeatPassword: e.target.value })
            }
          />
          {errors.repeatPassword && (
            <p className="error">{errors.repeatPassword}</p>
          )}
        </div>

        <button type="submit">Registrar</button>
      </form>

      <div>
        <h3>¿Ya tienes cuenta?</h3>
        <a href="/login">Iniciar sesión</a>
      </div>
    </div>
  );
};
