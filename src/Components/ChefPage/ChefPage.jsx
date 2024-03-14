import React, { useState, useEffect } from "react";
import "./ChefPage.css";
import { useLocation } from "react-router-dom";

import DataTable from "react-data-table-component";

import { Container, Row, Tabs, Tab } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

//funciones
import { calcularTiempoRestante } from "../helpers/timeHelpers";

//json
import usuariosData from "../Assets/usuarios.json";

const ChefPage = () => {
  const location = useLocation();
  const { usuario } = location.state || {};

  const [chefData, setChefData] = useState(null);
  const [pedidosNoTomados, setPedidosNoTomados] = useState([]);
  const [activeTab, setActiveTab] = useState("pedidos-actuales");

  const eliminarOrden = (orderId) => {
    // Eliminar la orden del JSON
    const updatedPedidos = usuariosData.pedidos.filter(
      (pedido) => pedido.id !== orderId
    );
    usuariosData.pedidos = updatedPedidos;
    setChefData((prevData) => ({
      ...prevData,
      pedidos: updatedPedidos.filter((pedido) => pedido.chef_id === usuario.id),
    }));
  };

  const reasignarOrden = (orderId) => {
    // Cambiar el chef_id al id del chef actual
    const updatedPedidos = usuariosData.pedidos.map((pedido) => {
      if (pedido.id === orderId) {
        return { ...pedido, chef_id: usuario.id };
      }
      return pedido;
    });
    usuariosData.pedidos = updatedPedidos;
    setChefData((prevData) => ({
      ...prevData,
      pedidos: updatedPedidos.filter((pedido) => pedido.chef_id === usuario.id),
    }));
  };

  const prepararOrden = (orderId) => {
    // Cambiar el chef_id al id del chef actual
    const updatedPedidos = usuariosData.pedidos.map((pedido) => {
      if (pedido.id === orderId) {
        return { ...pedido, chef_id: usuario.id };
      }
      return pedido;
    });
    usuariosData.pedidos = updatedPedidos;

    // Actualizar la lista de pedidos no tomados
    const noTomados = updatedPedidos.filter((pedido) => pedido.chef_id === 0);
    setPedidosNoTomados(noTomados);

    // Actualizar el estado de chefData
    setChefData((prevData) => ({
      ...prevData,
      pedidos: updatedPedidos.filter((pedido) => pedido.chef_id === usuario.id),
    }));
  };

  const pedidos_actuales = [
    {
      name: "n° de orden",
      selector: (row) => row.id,
    },
    {
      name: "ID",
      selector: (row) => row.chef_id,
    },
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
    },
    {
      name: "Tiempo limite",
      selector: (row) =>
        calcularTiempoRestante(row.tiempo_limite, row.descripcion),
    },
    {
      name: "",
      cell: (row) => (
        <button className="btn btn-info" onClick={() => eliminarOrden(row.id)}>
          Orden Preparada
        </button>
      ),
    },
  ];

  const pedidos_de_otros_chef = [
    {
      name: "n° de orden",
      selector: (row) => row.id,
    },
    {
      name: "ID del chef encargado",
      selector: (row) => row.chef_id,
    },
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
    },
    {
      name: "Tiempo limite",
      selector: (row) =>
        calcularTiempoRestante(row.tiempo_limite, row.descripcion),
    },
    {
      name: "",
      cell: (row) => (
        <button
          className="btn btn-success"
          onClick={() => reasignarOrden(row.id)}
        >
          Reasignar orden
        </button>
      ),
    },
  ];

  const pedidos_no_tomados = [
    {
      name: "n° de orden",
      selector: (row) => row.id,
    },
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
    },
    {
      name: "Tiempo limite",
      selector: (row) =>
        calcularTiempoRestante(row.tiempo_limite, row.descripcion),
    },
    {
      name: "",
      cell: (row) => (
        <button
          className="btn btn-warning"
          onClick={() => prepararOrden(row.id)}
        >
          Preparar orden
        </button>
      ),
    },
  ];

  useEffect(() => {
    if (usuario) {
      const chefOrders = usuariosData.pedidos.filter(
        (pedido) => pedido.chef_id === usuario.id
      );
      setChefData({ usuario: usuario, pedidos: chefOrders });

      const noTomados = usuariosData.pedidos.filter(
        (pedido) => pedido.chef_id === 0
      );
      setPedidosNoTomados(noTomados);
    }
  }, [usuario]);

  if (!chefData) {
    return <div>Cargando...</div>;
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <Container className="py-4">
      <h1>Bienvenido {usuario.nombre}</h1>
      <Row className="justify-content-center">
        <Tabs
          justify
          variant="pills"
          defaultActiveKey="tab-1"
          className="mb-1 p-0"
        >
          <Tab eventKey="tab-1" title="Pedidos actuales">
            <DataTable columns={pedidos_actuales} data={chefData.pedidos} />
          </Tab>
          <Tab eventKey="tab-2" title="Pedidos de otros chefs">
            <DataTable
              columns={pedidos_de_otros_chef}
              data={usuariosData.pedidos.filter(
                (pedido) =>
                  pedido.chef_id !== usuario.id && pedido.chef_id !== 0
              )}
            />
          </Tab>
          <Tab eventKey="tab-3" title="Pedidos Pendientes">
            <DataTable columns={pedidos_no_tomados} data={pedidosNoTomados} />
          </Tab>
          <Tab></Tab>
        </Tabs>
      </Row>
    </Container>
  );
};

export default ChefPage;

/*  return (
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
  ); */
