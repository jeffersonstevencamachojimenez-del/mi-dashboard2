// ========================================
// DATOS DE PRUEBA
// ========================================

const datos = [
  {
    sala: "Chincha 1",
    estado: "PENDIENTE",
    fecha: "12/08/2026",
    observacion: "Revisar mantenimiento"
  },
  {
    sala: "Pucallpa 2",
    estado: "EN PROCESO",
    fecha: "12/08/2026",
    observacion: "Trabajo en ejecución"
  },
  {
    sala: "Trujillo 1",
    estado: "COMPLETADO",
    fecha: "11/08/2026",
    observacion: "Trabajo terminado"
  }
];


// ========================================
// CARGAR DATOS
// ========================================

function cargarDatos() {

  const cuerpo = document.getElementById("tablaCuerpo");

  cuerpo.innerHTML = "";

  if (datos.length === 0) {

    cuerpo.innerHTML = `
      <tr>
        <td colspan="4" class="sin-datos">
          No hay datos disponibles
        </td>
      </tr>
    `;

    actualizarResumen();

    return;
  }


  datos.forEach(function(registro) {

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${registro.sala}</td>
      <td>${registro.estado}</td>
      <td>${registro.fecha}</td>
      <td>${registro.observacion}</td>
    `;

    cuerpo.appendChild(fila);

  });


  actualizarResumen();
}


// ========================================
// RESUMEN
// ========================================

function actualizarResumen() {

  const total = datos.length;

  const pendientes = datos.filter(function(registro) {
    return registro.estado === "PENDIENTE";
  }).length;

  const completados = datos.filter(function(registro) {
    return registro.estado === "COMPLETADO";
  }).length;


  document.getElementById("totalRegistros").textContent = total;

  document.getElementById("pendientes").textContent = pendientes;

  document.getElementById("completados").textContent = completados;
}


// ========================================
// INICIAR DASHBOARD
// ========================================

document.addEventListener("DOMContentLoaded", function() {

  cargarDatos();

});
