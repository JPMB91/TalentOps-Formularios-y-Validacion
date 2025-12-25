import { useEffect, useState } from "react";
import userSchema from "../utils/userSchema";
import { usuarioService } from "../services/usuarioService";
import { useFileUpload } from "../hooks/useFileUpload";
import { compressImage } from "../utils/compressImage";

export const FormularioRegistro = () => {
  const {
    uploadFile,
    progress,
    uploading,
    preview,
    createPreview,
    clearPreview,
  } = useFileUpload();

  const INITIAL_STATE = {
    formData: {
      nombre: "",
      email: "",
      password: "",
      repeatPassword: "",
      imagen: null,
      imagenFile: null,
    },
    fieldStates: {
      nombre: "idle",
      email: "idle",
      password: "idle",
      repeatPassword: "idle",
    },
    errors: {},
    touched: {},
  };

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    repeatPassword: "",
    imagen: null,
  });

  const [imagenFile, setImageFile] = useState(null);

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

  const resetForm = () => {
    setFormData(INITIAL_STATE.formData);
    setFieldStates(INITIAL_STATE.fieldStates);
    setErrors(INITIAL_STATE.errors);
    setTouched(INITIAL_STATE.touched);
    setEmailAvailable(null);
    clearPreview();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe ser menor a 5MB");
      return;
    }
    try {
      const imagenCompresa = await compressImage(file, 1920, 0.8);
      createPreview(imagenCompresa);
      setImageFile(imagenCompresa);
      setFormData((prev) => ({ ...prev, imagen: null }));
    } catch (error) {
      console.error("Error comprimiendo:", error);
      alert("Error comprimiendo la imagen");
    }
  };

  const removeImage = () => {
    clearPreview();
    setImageFile(null);
    setFormData((prev) => ({
      ...prev,
      imagen: null,
    }));
  };

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

    if (imagenFile) {
      try {
        const result = await uploadFile(imagenFile);
        formData.imagen = result.url;
      } catch (error) {
        alert("Error subiendo imagen");
        return;
      }
    }

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
      resetForm();
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

        {/* imagen */}
        <div className="upload-container">
          <label className="upload-label">Foto de Perfil</label>

          {!preview ? (
            <label className="upload-dropzone">
              <span className="upload-dropzone-text">
                Haz clic para subir imagen
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="upload-input-hidden"
              />
            </label>
          ) : (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button
                type="button"
                onClick={removeImage}
                className="remove-image-btn"
              >
                ✕
              </button>

              {uploading && (
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
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
