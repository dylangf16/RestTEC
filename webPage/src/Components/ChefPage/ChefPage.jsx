import React, { useState, useEffect } from "react";
import "./ChefPage.css";
import { useLocation } from "react-router-dom";

import DataTable from "react-data-table-component";

import { Container, Row, Tabs, Tab } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

//funciones
import { calcularTiempoRestante } from "../helpers/timeHelpers";

//json

const ChefPage = () => {
  const location = useLocation();
  const { usuario } = location.state || {};

  const [chefData, setChefData] = useState(null);
  const [pedidosNoTomados, setPedidosNoTomados] = useState([]);
  const [activeTab, setActiveTab] = useState("pedidos-actuales");
  const [pedidosData, setPedidosData] = useState(null);

  useEffect(() => {
    const fetchPedidosData = async () => {
      try {
        const response = await fetch("/pedidos");
        if (!response.ok) {
          throw new Error("Error fetching pedidos");
        }
        const data = await response.json();
        setPedidosData(data);
        console.log("pedidosData fetch: ", data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchPedidosData();
  }, []); // pedidosData removed from dependency array

  // mandar a eliminar
  const eliminarOrden = async (orderId) => {
    try {
      const response = await fetch(`/eliminar/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error deleting order");
      }

      const updatedPedidos = pedidosData.pedidos.filter(
        (pedido) => pedido.id_orden !== orderId
      );

      setPedidosData((prevData) => ({
        ...prevData,
        pedidos: updatedPedidos,
      }));

      setChefData((prevData) => ({
        ...prevData,
        pedidos: updatedPedidos.filter(
          (pedido) => pedido.id_chef === usuario.client_id
        ),
      }));

      console.log("Order deleted successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //mandar solicitud de id_chef
  const reasignarOrden = async (orderId) => {
    try {
      console.log("orderId:", orderId);
      console.log("usuario.client_id:", usuario.client_id);
      const response = await fetch(`/update/${orderId}/${usuario.client_id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error updating order");
      }

      const updatedPedidos = pedidosData.pedidos.map((pedido) => {
        if (pedido.id_orden === orderId) {
          return { ...pedido, id_chef: usuario.client_id };
        }
        return pedido;
      });

      setPedidosData((prevData) => ({
        ...prevData,
        pedidos: updatedPedidos,
      }));

      setChefData((prevData) => ({
        ...prevData,
        pedidos: updatedPedidos.filter(
          (pedido) => pedido.id_chef === usuario.client_id
        ),
      }));

      console.log("Order updated successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //x2 el de arriba
  const prepararOrden = async (orderId) => {
    try {
      console.log("orderId:", orderId);
      console.log("usuario.client_id:", usuario.client_id);
      const response = await fetch(`/update/${orderId}/${usuario.client_id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error updating order");
      }

      const updatedPedidos = pedidosData.pedidos.map((pedido) => {
        if (pedido.id_orden === orderId) {
          return { ...pedido, id_chef: usuario.client_id };
        }
        return pedido;
      });

      setPedidosData((prevData) => ({
        ...prevData,
        pedidos: updatedPedidos,
      }));

      setChefData((prevData) => ({
        ...prevData,
        pedidos: updatedPedidos.filter(
          (pedido) => pedido.id_chef === usuario.client_id
        ),
      }));

      console.log("Order updated successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const pedidos_actuales = [
    {
      name: "n° de orden",
      selector: (row) => row.id_orden,
      width: "15%",
    },
    {
      name: "ID del Chef",
      selector: (row) => row.id_chef,
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
      selector: (row) => {
        const tiempoTotal = row.platos.reduce(
          (total, plato) => total + plato.tiempoEstimado,
          0
        );

        const tiempoLimite = new Date(row.OrderTakenAt);
        tiempoLimite.setMinutes(tiempoLimite.getMinutes() + tiempoTotal);

        return calcularTiempoRestante(tiempoLimite.toISOString(), 0);
      },
      width: "32%",
    },
    {
      name: "",
      width: "25%",
      cell: (row) => (
        <button
          className="btn btn-info"
          onClick={() => eliminarOrden(row.id_orden)}
        >
          Orden Preparada
        </button>
      ),
    },
  ];

  const pedidos_de_otros_chef = [
    {
      name: "n° de orden",
      selector: (row) => row.id_orden,
      width: "15%",
    },
    {
      name: "ID del chef encargado",
      selector: (row) => row.id_chef,
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
      name: "Tiempo limite",
      selector: (row) => {
        const tiempoTotal = row.platos.reduce(
          (total, plato) => total + plato.tiempoEstimado,
          0
        );

        const tiempoLimite = new Date(row.OrderTakenAt);
        tiempoLimite.setMinutes(tiempoLimite.getMinutes() + tiempoTotal);

        return calcularTiempoRestante(tiempoLimite.toISOString(), 0);
      },
      width: "32%",
    },
    {
      name: "",
      width: "25%",
      cell: (row) => (
        <button
          className="btn btn-success"
          onClick={() => reasignarOrden(row.id_orden)}
        >
          Reasignar orden
        </button>
      ),
    },
  ];

  const pedidos_no_tomados = [
    {
      name: "n° de orden",
      selector: (row) => row.id_orden,
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
      selector: (row) => {
        const tiempoTotal = row.platos.reduce(
          (total, plato) => total + plato.tiempoEstimado,
          0
        );

        const tiempoLimite = new Date(row.OrderTakenAt);
        tiempoLimite.setMinutes(tiempoLimite.getMinutes() + tiempoTotal);

        return calcularTiempoRestante(tiempoLimite.toISOString(), 0);
      },
      width: "32%",
    },
    {
      name: "",
      cell: (row) => (
        <button
          className="btn btn-warning"
          onClick={() => prepararOrden(row.id_orden)}
        >
          Preparar orden
        </button>
      ),
    },
  ];

  useEffect(() => {
    console.log("pedidosData:", pedidosData);
    if (usuario && pedidosData && pedidosData.pedidos) {
      console.log("usuario:", usuario);
      const chefOrders = pedidosData.pedidos.filter(
        (pedido) => pedido.id_chef === usuario.client_id
      );
      setChefData({ usuario: usuario, pedidos: chefOrders });

      const noTomados = pedidosData.pedidos.filter(
        (pedido) => pedido.id_chef === 0
      );
      setPedidosNoTomados(noTomados);
    }
  }, [usuario, pedidosData]);

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
                  pedido.id_chef !== usuario.client_id && pedido.id_chef !== 0
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
