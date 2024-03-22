import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

// iconos
import { GrUserAdmin } from "react-icons/gr";
import { RiLockPasswordFill } from "react-icons/ri";

export const LoginForm = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const Navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const userData = {
      correo: correo,
      contrasena: contrasena,
    };

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid username or password");
        } else if (response.status === 500) {
          throw new Error("Invalid JSON file format");
        } else {
          throw new Error("Unknown error");
        }
      }

      const usuarioEncontrado = await response.json();
      console.log(usuarioEncontrado);

      if (usuarioEncontrado.role === "chef") {
        Navigate("/chef", { state: { usuario: usuarioEncontrado } });
      } else if (usuarioEncontrado.role === "administrador") {
        Navigate("/admin", { state: { usuario: usuarioEncontrado } });
      } else {
        setError("Role not allowed");
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
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
          {error && <p className="error-message">{error}</p>}{" "}
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