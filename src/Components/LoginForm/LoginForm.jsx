import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

// ruta al jason
import usuariosData from "../Assets/usuarios.json";

//

// iconos
import { GrUserAdmin } from "react-icons/gr";
import { RiLockPasswordFill } from "react-icons/ri";

export const LoginForm = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const Navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const usuarioEncontrado = usuariosData.usuarios.find(
      (usuario) =>
        usuario.correo === correo && usuario.contrasena === contrasena
    );

    if (usuarioEncontrado) {
      if (usuarioEncontrado.rol === "chef") {
        Navigate("/chef", { state: { usuario: usuarioEncontrado } });
      } else if (usuarioEncontrado.rol === "administrador") {
        Navigate("/admin", { state: { usuario: usuarioEncontrado } });
      }
    } else {
      console.log("Credenciales incorrectas");
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleLogin}>
        <h1>RestTec</h1>
        <h2>Iniciar Sesión</h2>
        <div>
          <div className="input-box">
            <input
              type="text"
              placeholder="Correo"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <GrUserAdmin className="icon" />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            <RiLockPasswordFill className="icon" />
          </div>

          <div className="forget">
            <a href="#">Recuperar Contraseña</a>
          </div>

          <button type="submit">Iniciar Sesión</button>

          <div className="register">
            <a href="#">Registrarse</a>
          </div>
        </div>
      </form>
    </div>
  );
};
