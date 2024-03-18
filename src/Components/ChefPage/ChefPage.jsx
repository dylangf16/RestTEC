import React, { useState, useEffect } from "react";
import "./ChefPage.css";
import { useLocation } from "react-router-dom";

import DataTable from "react-data-table-component";

import { Container, Row, Tabs, Tab } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

//funciones
import { calcularTiempoRestante } from "../helpers/timeHelpers";

//json
import pedidosData from "../Assets/pedidos.json";

const ChefPage = () => {
  const location = useLocation();
  const { usuario } = location.state || {};

  const [chefData, setChefData] = useState(null);
  const [pedidosNoTomados, setPedidosNoTomados] = useState([]);
  const [activeTab, setActiveTab] = useState("pedidos-actuales");

  const eliminarOrden = (orderId) => {
    const updatedPedidos = pedidosData.pedidos.filter(
      (pedido) => pedido.id_pedido !== orderId
    );
    pedidosData.pedidos = updatedPedidos;
    setChefData((prevData) => ({
      ...prevData,
      pedidos: updatedPedidos.filter((pedido) => pedido.chef_id === usuario.id),
    }));
  };

  const reasignarOrden = (orderId) => {
    const updatedPedidos = pedidosData.pedidos.map((pedido) => {
      if (pedido.id_pedido === orderId) {
        return { ...pedido, chef_id: usuario.id };
      }
      return pedido;
    });
    pedidosData.pedidos = updatedPedidos;
    setChefData((prevData) => ({
      ...prevData,
      pedidos: updatedPedidos.filter((pedido) => pedido.chef_id === usuario.id),
    }));
  };

  const prepararOrden = (orderId) => {
    // Cambiar el chef_id al id del chef actual
    const updatedPedidos = pedidosData.pedidos.map((pedido) => {
      if (pedido.id_pedido === orderId) {
        return { ...pedido, chef_id: usuario.id };
      }
      return pedido;
    });
    pedidosData.pedidos = updatedPedidos;

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
      selector: (row) => row.id_pedido,
      width: "15%",
    },
    {
      name: "ID del Chef",
      selector: (row) => row.chef_id,
      width: "15%",
    },
    {
      name: "Descripción",
      width: "20%",
      selector: (row) => {
        const descripciones = [];

        row.platos.forEach((plato) => {
          const descripcionPlato = `${plato.cantidad} ${plato.nombre_plato}`;

          descripciones.push(descripcionPlato);
        });

        return descripciones.map((descripcion, index) => (
          <span key={index}>
            {descripcion}
            <br />
          </span>
        ));
      },
    },
    {
      name: "Tiempo limite",
      selector: (row) => calcularTiempoRestante(row.fecha_hora),
      width: "32%",
    },
    {
      name: "",
      width: "25%",
      cell: (row) => (
        <button
          className="btn btn-info"
          onClick={() => eliminarOrden(row.id_pedido)}
        >
          Orden Preparada
        </button>
      ),
    },
  ];

  const pedidos_de_otros_chef = [
    {
      name: "n° de orden",
      selector: (row) => row.id_pedido,
      width: "15%",
    },
    {
      name: "ID del chef encargado",
      selector: (row) => row.chef_id,
      width: "15%",
    },
    {
      name: "Descripción",
      width: "15%",
      selector: (row) => {
        // Crear un array para almacenar las descripciones de los platos
        const descripciones = [];

        // Iterar sobre los platos en el pedido
        row.platos.forEach((plato) => {
          // Construir la descripción del plato con la cantidad y nombre
          const descripcionPlato = `${plato.cantidad} ${plato.nombre_plato}`;

          // Agregar la descripción del plato al array
          descripciones.push(descripcionPlato);
        });

        // Unir todas las descripciones en una sola cadena separada por comas
        return descripciones.map((descripcion, index) => (
          <span key={index}>
            {descripcion}
            <br />
          </span>
        ));
      },
    },
    {
      width: "32%",
      name: "Tiempo limite",
      selector: (row) => calcularTiempoRestante(row.fecha_hora),
    },
    {
      name: "",
      width: "25%",
      cell: (row) => (
        <button
          className="btn btn-success"
          onClick={() => reasignarOrden(row.id_pedido)}
        >
          Reasignar orden
        </button>
      ),
    },
  ];

  const pedidos_no_tomados = [
    {
      name: "n° de orden",
      selector: (row) => row.id_pedido,
    },
    {
      name: "Descripción",
      selector: (row) => {
        // Crear un array para almacenar las descripciones de los platos
        const descripciones = [];

        // Iterar sobre los platos en el pedido
        row.platos.forEach((plato) => {
          // Construir la descripción del plato con la cantidad y nombre
          const descripcionPlato = `${plato.cantidad} ${plato.nombre_plato}`;

          // Agregar la descripción del plato al array
          descripciones.push(descripcionPlato);
        });

        // Unir todas las descripciones en una sola cadena separada por comas
        return descripciones.map((descripcion, index) => (
          <span key={index}>
            {descripcion}
            <br />
          </span>
        ));
      },
    },
    {
      name: "Tiempo limite",
      selector: (row) => calcularTiempoRestante(row.fecha_hora),
    },
    {
      name: "",
      cell: (row) => (
        <button
          className="btn btn-warning"
          onClick={() => prepararOrden(row.id_pedido)}
        >
          Preparar orden
        </button>
      ),
    },
  ];

  useEffect(() => {
    if (usuario) {
      const chefOrders = pedidosData.pedidos.filter(
        (pedido) => pedido.chef_id === usuario.id
      );
      setChefData({ usuario: usuario, pedidos: chefOrders });

      const noTomados = pedidosData.pedidos.filter(
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
            <div className="table-container">
              <DataTable columns={pedidos_actuales} data={chefData.pedidos} />
            </div>
          </Tab>
          <Tab eventKey="tab-2" title="Pedidos de otros chefs">
            <DataTable
              columns={pedidos_de_otros_chef}
              data={pedidosData.pedidos.filter(
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
