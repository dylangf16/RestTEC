import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEditMenu = ({
  show,
  handleClose,
  handleUpdate,
  editedMenu,
  setEditedMenu,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Menu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre del Menu</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre del Menu"
              value={editedMenu.nombre_plato}
              onChange={(e) =>
                setEditedMenu((prevState) => ({
                  ...prevState,
                  nombre_plato: e.target.value,
                }))
              }
            />
          </Form.Group>
          <Form.Group controlId="formPrecio">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              placeholder="Precio del Menu"
              value={editedMenu.precio_colones}
              onChange={(e) =>
                setEditedMenu({
                  ...editedMenu,
                  precio_colones: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group controlId="formCalorias">
            <Form.Label>Calorías</Form.Label>
            <Form.Control
              type="number"
              placeholder="Calorías del Menu"
              value={editedMenu.calorias}
              onChange={(e) =>
                setEditedMenu({
                  ...editedMenu,
                  calorias: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group controlId="formTipo">
            <Form.Label>Tipo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Tipo de Menu"
              value={editedMenu.tipo}
              onChange={(e) =>
                setEditedMenu({
                  ...editedMenu,
                  tipo: e.target.value,
                })
              }
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleUpdate}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditMenu;
