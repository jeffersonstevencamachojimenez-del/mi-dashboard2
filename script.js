const URL_SHEET =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDiUWbgHCJ6tZKNZlp8sHUnXKH7TMMEerEQh5aKT4Uytz2dnxhBYAA_Gb2zFIPCLwJ7Sc55c5xDVON/pub?output=csv&gid=909592397";

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
    const respuesta = await fetch(URL_SHEET);

    if (!respuesta.ok) {
      throw new Error("No se pudo acceder al Google Sheet");
    }

    const texto = await respuesta.text();

    console.log("Datos recibidos:", texto);

    const filas = convertirCSV(texto);

    if (filas.length <= 1) {
      cuerpo.innerHTML = `
        <tr>
          <td colspan="4" class="sin-datos">
            No hay datos disponibles
          </td>
        </tr>
      `;
      return;
    }

    const encabezados = filas[0];

    const datos = filas.slice(1).map(function(fila) {
      let registro = {};

      encabezados.forEach(function(encabezado, indice) {
        registro[encabezado.trim()] =
          fila[indice] ? fila[indice].trim() : "";
      });

      return registro;
    });

    mostrarDatos(datos);

  } catch (error) {

    console.error("Error:", error);

    cuerpo.innerHTML = `
      <tr>
        <td colspan="4" class="sin-datos">
          Error al cargar los datos
        </td>
      </tr>
    `;
  }
}


function convertirCSV(texto) {

  const filas = [];
  let fila = [];
  let campo = "";
  let dentroComillas = false;

  for (let i = 0; i < texto.length; i++) {

    const caracter = texto[i];
    const siguiente = texto[i + 1];

    if (caracter === '"' && dentroComillas && siguiente === '"') {

      campo += '"';
      i++;

    } else if (caracter === '"') {

      dentroComillas = !dentroComillas;

    } else if (caracter === "," && !dentroComillas) {

      fila.push(campo);
      campo = "";

    } else if (
      (caracter === "\n" || caracter === "\r") &&
      !dentroComillas
    ) {

      if (caracter === "\r" && siguiente === "\n") {
        i++;
      }

      fila.push(campo);

      if (
        fila.some(function(valor) {
          return valor.trim() !== "";
        })
      ) {
        filas.push(fila);
      }

      fila = [];
      campo = "";

    } else {

      campo += caracter;

    }
  }

  if (campo !== "" || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }

  return filas;
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

    return (registro["ESTADO"] || "")
      .toUpperCase() === "PENDIENTE";

  }).length;

  const completados = datos.filter(function(registro) {

    return (registro["ESTADO"] || "")
      .toUpperCase() === "COMPLETADO";

  }).length;

  document.getElementById("totalRegistros").textContent = total;

  document.getElementById("pendientes").textContent = pendientes;

  document.getElementById("completados").textContent = completados;
}


document.addEventListener("DOMContentLoaded", function() {

  cargarDatos();

});
