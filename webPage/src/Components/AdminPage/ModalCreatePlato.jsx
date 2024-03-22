import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalCreatePlato = ({
  show,
  handleClose,
  handleCreate,
  resetForm,
  newPlato,
  setNewPlato,
}) => {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      handleCreate();
      resetForm();
    }
    setValidated(true);
  };

  return (
    <Modal show={show} onHide={handleClose} onEnter={resetForm}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Plato</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Nombre del plato"
              value={newPlato.nombre}
              onChange={(e) =>
                setNewPlato({ ...newPlato, nombre: e.target.value })
              }
            />
            <Form.Control.Feedback type="invalid">
              Por favor ingresa el nombre del plato.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formDescripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Descripción del plato"
              value={newPlato.descripcion}
              onChange={(e) =>
                setNewPlato({
                  ...newPlato,
                  descripcion: e.target.value,
                })
              }
            />
            <Form.Control.Feedback type="invalid">
              Por favor ingresa la descripción del plato.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formTiempoApprox">
            <Form.Label>Tiempo estimado de preparación en minutos</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Tiempo estimado de preparación"
              value={newPlato.tiempoEstimado}
              onChange={(e) =>
                setNewPlato({
                  ...newPlato,
                  tiempoEstimado: e.target.value,
                })
              }
            />
            <Form.Control.Feedback type="invalid">
              Por favor ingresa el tiempo estimado de preparación.
            </Form.Control.Feedback>
          </Form.Group>
          <div
            className="d-flex justify-content-center mt-3"
            style={{ marginTop: "10px" }}
          >
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
          <Button variant="primary" type="button" onClick={handleSubmit}>
            Crear
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCreatePlato;
