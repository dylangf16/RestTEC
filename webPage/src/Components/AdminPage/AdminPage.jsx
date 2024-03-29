import React, { useState, useEffect } from "react";
import "./AdminPage.css";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Container, Row, Tabs, Tab, Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ModalCreatePlato from "./ModalCreatePlato";
import ModalEditPlato from "./ModalEditPlato";
import ModalCreateMenu from "./ModalCreateMenu";
import ModalEditMenu from "./ModalEditMenu";
import { BsFillPencilFill } from "react-icons/bs";
import { BsFillTrash3Fill } from "react-icons/bs";

//en el botón "Guardar Cambios", enviar platos y menu actualizados y reescibirlos

import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

import { calcularTiempoRestante } from "../helpers/timeHelpers";

const AdminPage = () => {
  const location = useLocation();
  const { usuario } = location.state || {};
  const [activeTab, setActiveTab] = useState("pedidos-actuales");

  // acá se sacan los datos de los json
  const [orden, setOrden] = useState(null);

  const [menu, setMenu] = useState([]);
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch("/menu");
        if (!response.ok) {
          throw new Error("Error fetching menu");
        }
        const data = await response.json();
        setMenu(data.data); // set the fetched data to 'menu' state variable
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchMenuData();
  }, []);

  const [pedidos, setPedidos] = useState([]);
  useEffect(() => {
    const fetchPedidosData = async () => {
      try {
        const response = await fetch("/pedidos/admin");
        if (!response.ok) {
          throw new Error("Error fetching menu");
        }
        const data = await response.json();
        setPedidos(data.data); // set the fetched data to 'menu' state variable
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchPedidosData();
  }, []);

  const [clientes, setClientes] = useState([]);
  useEffect(() => {
    const fetchUsuariosData = async () => {
      try {
        const response = await fetch("/usuarios");
        if (!response.ok) {
          throw new Error("Error fetching menu");
        }
        const data = await response.json();
        setClientes(data.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUsuariosData();
  }, []);

  const [platos, setPlatos] = useState([]);
  useEffect(() => {
    const fetchPlatosData = async () => {
      try {
        const response = await fetch("/platos");
        if (!response.ok) {
          throw new Error("Error fetching menu");
        }
        const data = await response.json();
        setPlatos(data.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchPlatosData();
  }, []);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  function showJsons() {
    const menuPlatos = menu.map((plato) => plato.nombre_plato);
    const platosNombres = platos.map((plato) => plato.nombre);

    const allInPlatos = menuPlatos.every((nombre) => platosNombres.includes(nombre));
    const allInMenu = platosNombres.every((nombre) => menuPlatos.includes(nombre));
  
    console.log('Menu:', JSON.stringify(menu, null, 2));
    console.log('Platos:', JSON.stringify(platos, null, 2));
  

    if (allInPlatos && allInMenu) {
      console.log("Todo bien")
      fetch('/actualizar/jsons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menu, platos }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    } else {
      handleShow();
    }
  }

  const [showModal, setShowModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [editedPlato, setEditedPlato] = useState({});
  const [editedMenu, setEditedMenu] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateMenuModal, setShowCreateMenuModal] = useState(false);
  const [newPlato, setNewPlato] = useState({
    nombre: "",
    descripcion: "",
    tiempoEstimado: 0,
    vendidos: 0,
    feedback: 0,
  });

  const [newMenu, setNewMenu] = useState({
    nombre_plato: "",
    precio_colones: 0,
    calorias: 0,
    tipo: "",
  });

  const obtenerInfoPlato = (nombrePlato) => {
    return platos.find((platoO) => platoO.nombre === nombrePlato);
  };

  const generarFilasTabla = () => {
    let datosOrdenados = [...menu];
    if (orden === "vendidos") {
      datosOrdenados.sort(
        (a, b) =>
          obtenerInfoPlato(b.nombre_plato).vendidos -
          obtenerInfoPlato(a.nombre_plato).vendidos
      );
    } else if (orden === "ganancia") {
      datosOrdenados.sort((a, b) => {
        const gananciaA =
          a.precio_colones * obtenerInfoPlato(a.nombre_plato).vendidos;
        const gananciaB =
          b.precio_colones * obtenerInfoPlato(b.nombre_plato).vendidos;
        return gananciaB - gananciaA;
      });
    } else if (orden === "feedback") {
      datosOrdenados.sort(
        (a, b) =>
          obtenerInfoPlato(b.nombre_plato).feedback -
          obtenerInfoPlato(a.nombre_plato).feedback
      );
    }
    datosOrdenados = datosOrdenados.slice(0, 10);
    return datosOrdenados
      .map((item) => {
        const platoInfo = obtenerInfoPlato(item.nombre_plato);
        if (!platoInfo || platoInfo.vendidos === null) {
          return null;
        }
        return (
          <tr key={item.nombre_plato}>
            <td>{item.nombre_plato}</td>
            <td>{platoInfo.vendidos}</td>
            <td>{item.precio_colones * platoInfo.vendidos}</td>
            <td>{platoInfo.feedback}</td>
          </tr>
        );
      })
      .filter((item) => item !== null);
  };

  const cambiarOrden = (tipoOrden) => {
    if (orden === tipoOrden) {
      setOrden(null);
    } else {
      setOrden(tipoOrden);
    }
  };

  const obtenerIconoOrden = (tipoColumna) => {
    if (orden === tipoColumna) {
      return <FaSortUp />;
    } else if (orden === `-${tipoColumna}`) {
      return <FaSortDown />;
    } else {
      return <FaSort />;
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const deletePlato = (idx) => {
    const updatedPlatos = [...platos];
    const updatedMenu = [...menu];
    updatedMenu.splice(idx, 1);
    updatedPlatos.splice(idx, 1);
    setPlatos(updatedPlatos);
    setMenu(updatedMenu);
  };

  const deleteMenu = (idx) => {
    const updatedPlatos = [...platos];
    const updatedMenu = [...menu];
    updatedMenu.splice(idx, 1);
    updatedPlatos.splice(idx, 1);
    setPlatos(updatedPlatos);
    setMenu(updatedMenu);
  };

  const openEditModal = (idx) => {
    const platoToEdit = platos[idx];
    setEditedPlato({
      nombre: platoToEdit.nombre,
      descripcion: platoToEdit.descripcion,
      tiempoEstimado: platoToEdit.tiempoEstimado,
      vendidos: platoToEdit.vendidos,
      feedback: platoToEdit.feedback,
    });
    setShowModal(true);
  };

  const openEditMenuModal = (idx) => {
    const menuToEdit = menu[idx];
    setEditedMenu({
      nombre_plato: menuToEdit.nombre_plato,
      precio_colones: menuToEdit.precio_colones,
      calorias: menuToEdit.calorias,
      tipo: menuToEdit.tipo,
    });
    setShowEditMenuModal(true);
  };

  const closeEditModal = () => {
    setShowModal(false);
  };

  const closeEditMenuModal = () => {
    setShowEditMenuModal(false);
  };

  const updatePlato = () => {
    const updatedPlatos = [...platos];
    const idx = updatedPlatos.findIndex(
      (plato) => plato.nombre === editedPlato.nombre
    );
    updatedPlatos[idx] = editedPlato;
    setPlatos(updatedPlatos);
    closeEditModal();
  };

  const updateMenu = () => {
    const updatedMenu = [...menu];
    const idx = updatedMenu.findIndex(
      (menu) => menu.nombre_plato === editedMenu.nombre_plato
    );
    updatedMenu[idx] = editedMenu;
    setMenu(updatedMenu);
    closeEditMenuModal();
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const openCreateMenuModal = () => {
    setShowCreateMenuModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeCreateMenuModal = () => {
    setShowCreateMenuModal(false);
  };

  const resetCreateModal = () => {
    setNewPlato({
      nombre: "",
      descripcion: "",
      tiempoEstimado: 0,
      vendidos: 0,
      feedback: 0,
    });
  };

  const resetCreateMenuModal = () => {
    setNewMenu({
      nombre_plato: "",
      precio_colones: 0,
      calorias: 0,
      tipo: "",
    });
  };

  const createPlato = () => {
    const updatedPlatos = [...platos];
    updatedPlatos.push(newPlato);
    setPlatos(updatedPlatos);
    closeCreateModal();
  };

  const createMenu = () => {
    const updatedMenu = [...menu];
    updatedMenu.push(newMenu);
    setMenu(updatedMenu);
    closeCreateMenuModal();
  };

  let sortedClientes = [];

  if (clientes && clientes.usuarios && clientes.usuarios.length > 0) {
    sortedClientes = clientes.usuarios
      .sort((a, b) => b.numPedidos - a.numPedidos)
      .slice(0, 10);
  }

  // Use sortedClientes later in the function
  console.log(sortedClientes);

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
          <Tab eventKey="tab-1" title="Pedidos activos">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>N° de Orden</th>
                    <th>descripcion</th>
                    <th className="expand">tiempo restante</th>
                    <th>Id del chef Asignado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido, idx) => (
                    <tr key={idx}>
                      <td>{pedido.id_orden}</td>
                      <td>
                        {pedido.platos.map((plato, idx) => (
                          <span key={idx}>
                            {plato.cantidad} {plato.nombre_plato}
                            <br />
                          </span>
                        ))}
                      </td>
                      <td>
                        {calcularTiempoRestante(
                          pedido.orderTakenAt,
                          pedido.platos.reduce(
                            (total, plato) => total + plato.tiempoEstimado,
                            0
                          )
                        )}
                      </td>
                      <td>{pedido.id_chef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tab>
          <Tab eventKey="tab-2" title="Gestión de Platos">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Tiempo de preparación</th>
                    <th>Feedback</th>
                    <th>Vendidos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {platos.map((plato, idx) => (
                    <tr key={idx}>
                      <td>{plato.nombre}</td>
                      <td>{plato.descripcion}</td>
                      <td>{plato.tiempoEstimado}</td>
                      <td>{plato.feedback}</td>
                      <td>{plato.vendidos}</td>
                      <td className="fit">
                        <span className="actions">
                          <BsFillTrash3Fill
                            className="delete-btn"
                            onClick={() => deletePlato(idx)}
                          />
                          <BsFillPencilFill
                            className="edit-btn"
                            onClick={() => openEditModal(idx)}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="d-flex justify-content-center mt-3"
              style={{ marginTop: "10px" }}
            >
              <Button onClick={() => setShowCreateModal(true)}>Crear</Button>
            </div>
            <div
              className="d-flex justify-content-center mt-3"
              style={{ marginTop: "10px" }}
            >
              {" "}
              <Button onClick={showJsons}>Guardar Cambios</Button>
              <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Lo sentimos, el o los nuevos platillos tienen que estar en
                  Menu y Platos (verifica que estén escritos correctamente)
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
            <ModalCreatePlato
              show={showCreateModal}
              handleClose={() => setShowCreateModal(false)}
              handleCreate={createPlato}
              resetForm={resetCreateModal}
              newPlato={newPlato}
              setNewPlato={setNewPlato}
            />
            <ModalEditPlato
              show={showModal}
              handleClose={() => setShowModal(false)}
              handleUpdate={updatePlato}
              editedPlato={editedPlato}
              setEditedPlato={setEditedPlato}
            />
          </Tab>
          <Tab eventKey="tab-3" title="Gestión de Menú">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Calorías</th>
                    <th className="expand">Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.map((menu, idx) => (
                    <tr key={idx}>
                      <td>{menu.nombre_plato}</td>
                      <td>{menu.precio_colones}</td>
                      <td>{menu.calorias}</td>
                      <td>{menu.tipo}</td>
                      <td className="fit">
                        <span className="actions">
                          <BsFillTrash3Fill
                            className="delete-btn"
                            onClick={() => deleteMenu(idx)}
                          />
                          <BsFillPencilFill
                            className="edit-btn"
                            onClick={() => openEditMenuModal(idx)}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="d-flex justify-content-center mt-3"
              style={{ marginTop: "10px" }}
            >
              <Button onClick={openCreateMenuModal}>Crear</Button>
            </div>
            <div
              className="d-flex justify-content-center mt-3"
              style={{ marginTop: "10px" }}
            >
              {" "}
              <Button onClick={showJsons}>Guardar Cambios</Button>
              <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Lo sentimos, el o los nuevos platillos tienen que estar en
                  Menu y Platos (verifica que estén escritos correctamente)
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
            <ModalCreateMenu
              show={showCreateMenuModal}
              handleClose={() => setShowCreateMenuModal(false)}
              handleCreate={createMenu}
              resetForm={resetCreateMenuModal}
              newMenu={newMenu}
              setNewMenu={setNewMenu}
            />
            <ModalEditMenu
              show={showEditMenuModal}
              handleClose={() => setShowEditMenuModal(false)}
              handleUpdate={updateMenu}
              editedMenu={editedMenu}
              setEditedMenu={setEditedMenu}
            />
          </Tab>
          <Tab eventKey="tab-5" title="Reportes de platos">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Plato</th>
                    <th
                      onClick={() => cambiarOrden("vendidos")}
                      style={{ cursor: "pointer" }}
                      expand
                    >
                      Cantidad de Vendidos
                      {obtenerIconoOrden("vendidos")}
                    </th>
                    <th
                      onClick={() => cambiarOrden("ganancia")}
                      style={{ cursor: "pointer" }}
                    >
                      Ganancia Generada
                      {obtenerIconoOrden("ganancia")}
                    </th>
                    <th
                      onClick={() => cambiarOrden("feedback")}
                      style={{ cursor: "pointer" }}
                      className="expand"
                    >
                      Feedback
                      {obtenerIconoOrden("feedback")}
                    </th>
                  </tr>
                </thead>
                <tbody>{generarFilasTabla()}</tbody>
              </table>
            </div>
          </Tab>
          <Tab eventKey="tab-6" title="Top 10 Clientes">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Id Cliente</th>
                    <th>Nombre</th>
                    <th>Apellido 1</th>
                    <th>Apellido 2</th>
                    <th className="expand">Correo</th>
                    <th>Cantidad de Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClientes.map((cliente, idx) => (
                    <tr key={idx}>
                      <td>{cliente.id}</td>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.apellido1}</td>
                      <td>{cliente.apellido2}</td>
                      <td>{cliente.correo}</td>
                      <td>{cliente.numPedidos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tab>
        </Tabs>
      </Row>
    </Container>
  );
};

export default AdminPage;
