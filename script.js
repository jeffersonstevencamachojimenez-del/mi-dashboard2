* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #f5f6fa;
  color: #333;
}

/* ENCABEZADO */

.encabezado {
  background: #b11226;
  color: white;
  padding: 25px;
  text-align: center;
}

.encabezado h1 {
  margin: 0;
  font-size: 28px;
}

.encabezado p {
  margin: 8px 0 0;
  opacity: 0.9;
}

/* CONTENEDOR */

.contenedor {
  width: 95%;
  max-width: 1400px;
  margin: 25px auto;
}

/* TARJETAS */

.tarjetas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.tarjeta {
  background: white;
  border-radius: 12px;
  padding: 22px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tarjeta .titulo {
  display: block;
  font-size: 14px;
  color: #777;
  margin-bottom: 10px;
}

.tarjeta strong {
  font-size: 32px;
  color: #b11226;
}

/* PANEL */

.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #eee;
}

.panel-header h2 {
  margin: 0;
}

/* BOTÓN */

button {
  border: none;
  background: #b11226;
  color: white;
  padding: 10px 18px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  opacity: 0.85;
}

/* TABLA */

.tabla-contenedor {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

th {
  background: #f0f0f0;
  padding: 13px;
  text-align: left;
  font-size: 13px;
  position: sticky;
  top: 0;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

tr:hover {
  background: #fafafa;
}

.sin-datos {
  text-align: center;
  color: #888;
  padding: 30px;
}

/* MÓVIL */

@media (max-width: 700px) {

  .tarjetas {
    grid-template-columns: 1fr;
  }

  .encabezado h1 {
    font-size: 22px;
  }

  .contenedor {
    width: 97%;
  }

}
