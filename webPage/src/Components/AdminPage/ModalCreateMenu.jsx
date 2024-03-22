import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalCreateMenu = ({
  show,
  handleClose,
  handleCreate,
  resetForm,
  newMenu,
  setNewMenu,
}) => {
  return (
    <Modal show={show} onHide={handleClose} onEnter={resetForm}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Menú</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre del Menu</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Nombre del Menu"
              value={newMenu.nombre_plato}
              onChange={(e) =>
                setNewMenu({ ...newMenu, nombre_plato: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="formPrecio">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              required
              type="number"
              placeholder="Precio del Menu"
              value={newMenu.precio_colones}
              onChange={(e) =>
                setNewMenu({
                  ...newMenu,
                  precio_colones: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group controlId="formCalorias">
            <Form.Label>Calorías</Form.Label>
            <Form.Control
              required
              type="number"
              placeholder="Calorías del Menu"
              value={newMenu.calorias}
              onChange={(e) =>
                setNewMenu({
                  ...newMenu,
                  calorias: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group controlId="formTipo">
            <Form.Label>Tipo</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Tipo de Menu"
              value={newMenu.tipo}
              onChange={(e) =>
                setNewMenu({
                  ...newMenu,
                  tipo: e.target.value,
                })
              }
            />
          </Form.Group>
          <div
            className="d-flex justify-content-center mt-3"
            style={{ marginTop: "10px" }}
          >
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
          <Button variant="primary" type="button" onClick={handleCreate}>
            Crear
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCreateMenu;
