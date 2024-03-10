import React, { useState, useEffect } from "react";
import "./ChefPage.css";
import { useLocation } from "react-router-dom";

import usuariosData from "../Assets/usuarios.json";

const calcularTiempoRestante = (tiempo_limite) => {
  const ahora = new Date();

  // Convertimos el tiempo límite a un objeto Date
  const tiempoLimite = new Date(tiempo_limite);

  // Calculamos la diferencia en milisegundos entre la fecha actual y el tiempo límite
  const diferencia = tiempoLimite - ahora;

  // Convertimos la diferencia a días, horas, minutos y segundos
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor(
    (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

  // Retornamos el tiempo restante en un formato legible
  return `${dias} días, ${horas} horas, ${minutos} minutos y ${segundos} segundos`;
};

const ChefPage = () => {
  const location = useLocation(); // Usar useLocation para obtener la ubicación actual
  const { usuario } = location.state || {}; // Obtener los datos del usuario desde las props

  const [chefData, setChefData] = useState(null);
  const [pedidosNoTomados, setPedidosNoTomados] = useState([]);

  useEffect(() => {
    if (usuario) {
      const chefOrders = usuariosData.pedidos.filter(
        (pedido) => pedido.chef_id === usuario.id
      );
      setChefData({ usuario: usuario, pedidos: chefOrders });

      // Filtrar los pedidos no tomados
      const noTomados = usuariosData.pedidos.filter(
        (pedido) => pedido.chef_id === 0
      );
      setPedidosNoTomados(noTomados);
    }
  }, [usuario]);

  if (!chefData) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="chef-page">
      <h1>Bienvenido {usuario.nombre}</h1>
      <div className="current-orders">
        <h2>Pedidos actuales</h2>
        <ul>
          {chefData.pedidos.map((pedido) => (
            <li key={pedido.id}>
              {pedido.descripcion} - Tiempo restante:{" "}
              {calcularTiempoRestante(pedido.tiempo_limite)}
            </li>
          ))}
        </ul>
      </div>
      <div className="other-chefs-orders">
        <h2>Pedidos de otros chefs</h2>
        <ul>
          {usuariosData.pedidos
            .filter(
              (pedido) => pedido.chef_id !== usuario.id && pedido.chef_id !== 0
            )
            .map((pedido) => (
              <li key={pedido.id}>
                {pedido.descripcion} - Chef:{" "}
                {
                  usuariosData.usuarios.find(
                    (usuario) => usuario.id === pedido.chef_id
                  )?.nombre
                }
                - Tiempo restante:{" "}
                {calcularTiempoRestante(pedido.tiempo_limite)}
              </li>
            ))}
        </ul>
      </div>
      <div className="untaken-orders">
        <h2>Pedidos no tomados</h2>
        <ul>
          {pedidosNoTomados.map((pedido) => (
            <li key={pedido.id}>
              {pedido.descripcion} - Tiempo restante:{" "}
              {calcularTiempoRestante(pedido.tiempo_limite)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChefPage;
