import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEditPlato = ({
  show,
  handleClose,
  handleUpdate,
  editedPlato,
  setEditedPlato,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Plato</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre del plato"
              value={editedPlato.nombre}
              onChange={(e) =>
                setEditedPlato((prevState) => ({
                  ...prevState,
                  nombre: e.target.value,
                }))
              }
            />
          </Form.Group>
          <Form.Group controlId="formDescripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              type="text"
              placeholder="Descripción del plato"
              value={editedPlato.descripcion}
              onChange={(e) =>
                setEditedPlato({
                  ...editedPlato,
                  descripcion: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group controlId="formTiempoApprox">
            <Form.Label>Tiempo estimado de preparación en minutos</Form.Label>
            <Form.Control
              required
              type="number"
              placeholder="Tiempo estimado de preparación"
              value={editedPlato.tiempoEstimado}
              onChange={(e) =>
                setEditedPlato({
                  ...editedPlato,
                  tiempoEstimado: e.target.value,
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

export default ModalEditPlato;
