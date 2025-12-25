import { useEffect, useState } from "react";
import userSchema from "../utils/userSchema";
import { usuarioService } from "../services/usuarioService";

export const FormularioRegistro = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [fieldStates, setFieldStates] = useState({
    nombre: "idle",
    email: "idle",
    password: "idle",
    repeatPassword: "idle",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);

  //validacion email en tiempo real
  useEffect(() => {
    if (formData.email && formData.email.includes("@") && touched.email) {
      setIsCheckingEmail(true);
      setEmailAvailable(null);

      const timer = setTimeout(async () => {
        try {
          const usuarios = await usuarioService.obtenerUsuarioPorEmail(
            formData.email
          );
          const emailDisponible = usuarios.length === 0;
          setEmailAvailable(emailDisponible);

          if (!emailDisponible) {
            setErrors((prev) => ({
              ...prev,
              email: "Este email ya está registrado",
            }));
            setFieldStates((prev) => ({ ...prev, email: "error" }));
          } else {
            const emailValido = userSchema.shape.email.safeParse(
              formData.email
            );
            if (emailValido.success) {
              setErrors((prev) => ({ ...prev, email: null }));
              setFieldStates((prev) => ({
                ...prev,
                email: "success",
              }));
            }
          }
        } catch (error) {
          console.error("Error verificando el email: ", error);
        } finally {
          setIsCheckingEmail(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.email, touched.email]);

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
      await usuarioService.crearUsuario(formData);

      alert("Registro exitoso");
    } catch (apiError) {
      setErrors({
        error: "Error al registrar usuario",
      });
    }
  };

  // entra en un campo
  const handleFocus = (field) => {
    setFieldStates((prev) => ({ ...prev, [field]: "focus" }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    //email validado aparte
    if (field === "email") return;

    //validacion de campos
    const validacion = userSchema.shape[field];
    if (validacion) {
      const result = validacion.safeParse(formData[field]);

      if (!result.success) {
        setFieldStates((prev) => ({
          ...prev,
          [field]: "error",
        }));

        setErrors((prev) => ({
          ...prev,
          [field]: result.error.issues[0].message,
        }));
      } else {
        setFieldStates((prev) => ({ ...prev, [field]: "success" }));
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    }
  };

  const getInputClasses = (field) => {
    const state = fieldStates[field];
    let classes = "input-base";
    //  clase según estado
    switch (state) {
      case "focus":
        classes += " input-focus";
        break;
      case "error":
        classes += " input-error";
        break;
      case "success":
        classes += " input-success";
        break;
      default:
        classes += " input-idle";
    }
    return classes;
  };

  return (
    <div className="login-container">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            onFocus={() => handleFocus("nombre")}
            onBlur={() => handleBlur("nombre")}
            className={getInputClasses("nombre")}
          />

          {errors.nombre && touched.nombre && (
            <p className="error">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            value={formData.email}
            type="email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            onFocus={() => handleFocus("email")}
            onBlur={() => handleBlur("email")}
            className={getInputClasses("email")}
          />

          {errors.email && touched.email && (
            <p className="error">{errors.email}</p>
          )}
          {emailAvailable && !errors.email && (
            <p className="success">Email disponible</p>
          )}
        </div>

        <div>
          <label htmlFor="password">Contraseña:</label>

          <input
            id="password"
            name="password"
            value={formData.password}
            type="password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            onFocus={() => handleFocus("password")}
            onBlur={() => handleBlur("password")}
            className={getInputClasses("password")}
          />

          {errors.password && touched.password && (
            <p className="error">{errors.password}</p>
          )}
        </div>
        <div>
          <label htmlFor="repeatPassword">Repetir contraseña:</label>
          <input
            id="repeatPassword"
            name="repeatPassword"
            value={formData.repeatPassword}
            type="password"
            onChange={(e) =>
              setFormData({ ...formData, repeatPassword: e.target.value })
            }
            onFocus={() => handleFocus("repeatPassword")}
            onBlur={() => handleBlur("repeatPassword")}
            className={getInputClasses("repeatPassword")}
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
