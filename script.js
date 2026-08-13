const URL_DATOS =
  "https://script.google.com/macros/s/AKfycbzXWgrSkF-V761R87WC4kkn08oXbzTD3VTt1tDsIJpBOE3kljG1PF3bVn1eP8xfU49Hlg/exec";


async function cargarDatos() {

  const cuerpo = document.getElementById("tablaCuerpo");

  cuerpo.innerHTML = `
    <tr>
      <td colspan="4" class="sin-datos">
        Cargando datos...
      </td>
    </tr>
  `;

  try {

    const respuesta = await fetch(URL_DATOS);

    if (!respuesta.ok) {
      throw new Error("Error HTTP " + respuesta.status);
    }

    const datos = await respuesta.json();

    console.log("Datos recibidos:", datos);

    mostrarDatos(datos);

  } catch (error) {

    console.error("Error:", error);

    cuerpo.innerHTML = `
      <tr>
        <td colspan="4" class="sin-datos">
          ❌ Error al conectar con Google Sheets
        </td>
      </tr>
    `;

  }
}


function mostrarDatos(datos) {

  const cuerpo = document.getElementById("tablaCuerpo");

  cuerpo.innerHTML = "";

  datos.forEach(function(registro) {

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${registro["SALA"] || ""}</td>
      <td>${registro["ESTADO"] || ""}</td>
      <td>${registro["FECHA INOPERATIVIDAD"] || ""}</td>
      <td>${registro["OBSERVACIÓN"] || ""}</td>
    `;

    cuerpo.appendChild(fila);

  });


  actualizarResumen(datos);

}


function actualizarResumen(datos) {

  const total = datos.length;

  const pendientes = datos.filter(function(registro) {

    return String(registro["ESTADO"] || "")
      .toUpperCase()
      .includes("PENDIENT");

  }).length;


  const completados = datos.filter(function(registro) {

    return String(registro["ESTADO"] || "")
      .toUpperCase()
      .includes("COMPLET");

  }).length;


  document.getElementById("totalRegistros").textContent = total;

  document.getElementById("pendientes").textContent = pendientes;

  document.getElementById("completados").textContent = completados;

}


document.addEventListener("DOMContentLoaded", function() {

  cargarDatos();

});
