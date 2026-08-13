// ======================================================
// CONFIGURACIÓN
// ======================================================

const URL_DATOS =
  "https://script.google.com/macros/s/AKfycbzXWgrSkF-V761R87WC4kkn08oXbzTD3VTt1tDsIJpBOE3kljG1PF3bVn1eP8xfU49Hlg/exec";

let datosOriginales = [];
let datosFiltrados = [];

let graficoIndeciRD = null;
let graficoRDGenex = null;
let graficoSectores = null;
let graficoRenovaciones = null;


// ======================================================
// INICIO
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

  configurarEventos();

  cargarDatos();

});


// ======================================================
// CARGAR DATOS DESDE GOOGLE SHEETS
// ======================================================

async function cargarDatos() {

  const textoConexion =
    document.getElementById("textoConexion");

  const indicador =
    document.getElementById("indicadorConexion");

  try {

    textoConexion.textContent =
      "Conectando con Google Sheets...";

    indicador.style.background = "#ffb300";


    const respuesta = await fetch(URL_DATOS + "?t=" + Date.now());

    if (!respuesta.ok) {

      throw new Error(
        "Error HTTP " + respuesta.status
      );

    }


    const datos = await respuesta.json();


    datosOriginales = Array.isArray(datos)
      ? datos
      : [];


    datosFiltrados = [...datosOriginales];


    textoConexion.textContent =
      "Google Sheets conectado";

    indicador.style.background =
      "#21c55d";


    document.getElementById(
      "cantidadSalas"
    ).textContent =
      datosOriginales.length;


    llenarFiltros();

    actualizarDashboard();


  } catch (error) {

    console.error(
      "Error cargando datos:",
      error
    );


    textoConexion.textContent =
      "Error de conexión";


    indicador.style.background =
      "#dc2626";


    document.getElementById(
      "tablaCuerpo"
    ).innerHTML = `

      <tr>

        <td
          colspan="11"
          class="sin-datos">

          ❌ No se pudieron cargar los datos
          de Google Sheets.

        </td>

      </tr>

    `;

  }

}


// ======================================================
// CONFIGURAR EVENTOS
// ======================================================

function configurarEventos() {

  const buscar =
    document.getElementById("buscarSala");

  const sector =
    document.getElementById("filtroSector");

  const mes =
    document.getElementById("filtroMes");

  const renovacion =
    document.getElementById("filtroRenovacion");


  buscar.addEventListener(
    "input",
    aplicarFiltros
  );


  sector.addEventListener(
    "change",
    aplicarFiltros
  );


  mes.addEventListener(
    "change",
    aplicarFiltros
  );


  renovacion.addEventListener(
    "change",
    aplicarFiltros
  );

}


// ======================================================
// LLENAR FILTROS
// ======================================================

function llenarFiltros() {

  const sectorSelect =
    document.getElementById("filtroSector");

  const mesSelect =
    document.getElementById("filtroMes");


  sectorSelect.innerHTML = `
    <option value="">
      Todos los sectores
    </option>
  `;


  mesSelect.innerHTML = `
    <option value="">
      Todos los meses
    </option>
  `;


  const sectores =
    [...new Set(

      datosOriginales

        .map(d =>
          String(d["SECTOR"] || "").trim()
        )

        .filter(Boolean)

    )]


    .sort();


  sectores.forEach(function (sector) {

    const option =
      document.createElement("option");

    option.value = sector;

    option.textContent = sector;

    sectorSelect.appendChild(option);

  });


  const meses =
    [...new Set(

      datosOriginales

        .map(d =>
          String(
            d["MES DE LA ULTIMA EMISIÓN RD"] || ""
          ).trim()
        )

        .filter(Boolean)

    )]


    .sort();


  meses.forEach(function (mes) {

    const option =
      document.createElement("option");

    option.value = mes;

    option.textContent = mes;

    mesSelect.appendChild(option);

  });

}


// ======================================================
// APLICAR FILTROS
// ======================================================

function aplicarFiltros() {

  const texto =
    document.getElementById(
      "buscarSala"
    ).value
      .toLowerCase()
      .trim();


  const sector =
    document.getElementById(
      "filtroSector"
    ).value;


  const mes =
    document.getElementById(
      "filtroMes"
    ).value;


  const renovacion =
    document.getElementById(
      "filtroRenovacion"
    ).value;


  datosFiltrados =
    datosOriginales.filter(function (registro) {


      // BUSCAR SALA

      const sala =
        String(
          registro["SALAS"] || ""
        ).toLowerCase();


      if (
        texto &&
        !sala.includes(texto)
      ) {

        return false;

      }


      // SECTOR

      if (
        sector &&
        registro["SECTOR"] !== sector
      ) {

        return false;

      }


      // MES

      if (
        mes &&
        registro[
          "MES DE LA ULTIMA EMISIÓN RD"
        ] !== mes
      ) {

        return false;

      }


      // RENOVACIÓN

      if (renovacion) {

        const estado =
          obtenerEstadoRenovacion(
            registro[
              "RENOVACIÓN PARA INDECI"
            ]
          );


        if (
          estado.codigo !== renovacion
        ) {

          return false;

        }

      }


      return true;

    });


  actualizarDashboard();

}


// ======================================================
// LIMPIAR FILTROS
// ======================================================

function limpiarFiltros() {

  document.getElementById(
    "buscarSala"
  ).value = "";


  document.getElementById(
    "filtroSector"
  ).value = "";


  document.getElementById(
    "filtroMes"
  ).value = "";


  document.getElementById(
    "filtroRenovacion"
  ).value = "";


  datosFiltrados =
    [...datosOriginales];


  actualizarDashboard();

}


// ======================================================
// ACTUALIZAR TODO EL DASHBOARD
// ======================================================

function actualizarDashboard() {

  actualizarKPI();

  actualizarTabla();

  actualizarGraficos();

  document.getElementById(
    "contadorResultados"
  ).textContent =
    datosFiltrados.length +
    (
      datosFiltrados.length === 1
        ? " registro"
        : " registros"
    );

}


// ======================================================
// KPI
// ======================================================

function actualizarKPI() {

  const total =
    datosFiltrados.length;


  const espacios =
    sumarCampo(
      datosFiltrados,
      "ESPACIOS POR INDECI"
    );


  const rd =
    sumarCampo(
      datosFiltrados,
      "RD MAQ."
    );


  const genex =
    sumarCampo(
      datosFiltrados,
      "MAQUINAS GENEX"
    );


  const diferenciaIndeci =
    sumarCampo(
      datosFiltrados,
      "INDECI VS RD"
    );


  const diferenciaGenex =
    sumarCampo(
      datosFiltrados,
      "RD VS GENEX"
    );


  document.getElementById(
    "kpiSalas"
  ).textContent =
    formatearNumero(total);


  document.getElementById(
    "kpiEspacios"
  ).textContent =
    formatearNumero(espacios);


  document.getElementById(
    "kpiRD"
  ).textContent =
    formatearNumero(rd);


  document.getElementById(
    "kpiGenex"
  ).textContent =
    formatearNumero(genex);


  document.getElementById(
    "kpiDiferencia"
  ).textContent =
    formatearNumero(diferenciaIndeci);


  document.getElementById(
    "kpiDiferenciaGenex"
  ).textContent =
    formatearNumero(diferenciaGenex);

}


// ======================================================
// SUMAR CAMPO
// ======================================================

function sumarCampo(
  datos,
  campo
) {

  return datos.reduce(
    function (total, registro) {

      const valor =
        Number(
          registro[campo]
        );


      return total +
        (
          Number.isFinite(valor)
            ? valor
            : 0
        );

    },
    0
  );

}


// ======================================================
// TABLA
// ======================================================

function actualizarTabla() {

  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  cuerpo.innerHTML = "";


  if (
    datosFiltrados.length === 0
  ) {

    cuerpo.innerHTML = `

      <tr>

        <td
          colspan="11"
          class="sin-datos">

          No hay registros
          con los filtros seleccionados.

        </td>

      </tr>

    `;

    return;

  }


  datosFiltrados.forEach(
    function (registro) {


      const fila =
        document.createElement("tr");


      const renovacion =
        obtenerEstadoRenovacion(
          registro[
            "RENOVACIÓN PARA INDECI"
          ]
        );


      fila.innerHTML = `

        <td>
          ${escaparHTML(
            registro["SECTOR"]
          )}
        </td>


        <td>
          <strong>
            ${escaparHTML(
              registro["SALAS"]
            )}
          </strong>
        </td>


        <td>
          ${formatearNumero(
            registro[
              "ESPACIOS POR INDECI"
            ]
          )}
        </td>


        <td>
          ${formatearNumero(
            registro["RD MAQ."]
          )}
        </td>


        <td>
          ${mostrarDiferencia(
            registro[
              "INDECI VS RD"
            ]
          )}
        </td>


        <td>
          ${formatearNumero(
            registro[
              "MAQUINAS GENEX"
          ])}
        </td>


        <td>
          ${mostrarDiferencia(
            registro[
              "RD VS GENEX"
            ]
          )}
        </td>


        <td>
          ${formatearNumero(
            registro["AFORO"]
          )}
        </td>


        <td>
          ${formatearFecha(
            registro[
              "RENOVACIÓN PARA INDECI"
            ]
          )}
        </td>


        <td>
          ${escaparHTML(
            registro[
              "MES DE LA ULTIMA EMISIÓN RD"
            ]
          )}
        </td>


        <td>

          <span
            class="estado ${renovacion.clase}">

            ${renovacion.texto}

          </span>

        </td>

      `;


      fila.addEventListener(
        "click",
        function () {

          abrirModal(registro);

        }
      );


      cuerpo.appendChild(fila);

    }
  );

}


// ======================================================
// DIFERENCIA
// ======================================================

function mostrarDiferencia(valor) {

  const numero =
    Number(valor) || 0;


  if (numero === 0) {

    return `
      <span class="diferencia-cero">
        0
      </span>
    `;

  }


  if (numero > 0) {

    return `
      <span class="diferencia-positiva">
        +${formatearNumero(numero)}
      </span>
    `;

  }


  return `
    <span class="diferencia-negativa">
      ${formatearNumero(numero)}
    </span>
  `;

}


// ======================================================
// ESTADO DE RENOVACIÓN
// ======================================================

function obtenerEstadoRenovacion(
  fecha
) {

  if (!fecha) {

    return {
      codigo: "VIGENTE",
      texto: "SIN FECHA",
      clase: "vigente"
    };

  }


  const fechaRenovacion =
    convertirFecha(fecha);


  if (!fechaRenovacion) {

    return {
      codigo: "VIGENTE",
      texto: "SIN FECHA",
      clase: "vigente"
    };

  }


  const hoy =
    new Date();


  hoy.setHours(
    0,
    0,
    0,
    0
  );


  const dias =
    Math.ceil(
      (
        fechaRenovacion - hoy
      ) /
      (
        1000 *
        60 *
        60 *
        24
      )
    );


  if (dias < 0) {

    return {

      codigo: "VENCIDA",

      texto: "VENCIDA",

      clase: "vencida"

    };

  }


  if (dias <= 90) {

    return {

      codigo: "PROXIMA",

      texto:
        "PRÓXIMA (" +
        dias +
        " días)",

      clase: "proxima"

    };

  }


  return {

    codigo: "VIGENTE",

    texto: "VIGENTE",

    clase: "vigente"

  };

}


// ======================================================
// GRÁFICOS
// ======================================================

function actualizarGraficos() {

  crearGraficoIndeciRD();

  crearGraficoRDGenex();

  crearGraficoSectores();

  crearGraficoRenovaciones();

}


// ======================================================
// GRÁFICO INDECI VS RD
// ======================================================

function crearGraficoIndeciRD() {

  const ctx =
    document.getElementById(
      "graficoIndeciRD"
    );


  if (graficoIndeciRD) {

    graficoIndeciRD.destroy();

  }


  const totalIndeci =
    sumarCampo(
      datosFiltrados,
      "ESPACIOS POR INDECI"
    );


  const totalRD =
    sumarCampo(
      datosFiltrados,
      "RD MAQ."
    );


  graficoIndeciRD =
    new Chart(
      ctx,
      {

        type: "bar",

        data: {

          labels: [
            "INDECI",
            "RD MAQ."
          ],

          datasets: [{

            data: [
              totalIndeci,
              totalRD
            ],

            borderWidth: 1

          }]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              display: false
            }

          },

          scales: {

            y: {
              beginAtZero: true
            }

          }

        }

      }
    );

}


// ======================================================
// GRÁFICO RD VS GENEX
// ======================================================

function crearGraficoRDGenex() {

  const ctx =
    document.getElementById(
      "graficoRDGenex"
    );


  if (graficoRDGenex) {

    graficoRDGenex.destroy();

  }


  const rd =
    sumarCampo(
      datosFiltrados,
      "RD MAQ."
    );


  const genex =
    sumarCampo(
      datosFiltrados,
      "MAQUINAS GENEX"
    );


  graficoRDGenex =
    new Chart(
      ctx,
      {

        type: "bar",

        data: {

          labels: [
            "RD MAQ.",
            "GENEX"
          ],

          datasets: [{

            data: [
              rd,
              genex
            ],

            borderWidth: 1

          }]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              display: false
            }

          },

          scales: {

            y: {
              beginAtZero: true
            }

          }

        }

      }
    );

}


// ======================================================
// GRÁFICO POR SECTOR
// ======================================================

function crearGraficoSectores() {

  const ctx =
    document.getElementById(
      "graficoSectores"
    );


  if (graficoSectores) {

    graficoSectores.destroy();

  }


  const sectores = {};


  datosFiltrados.forEach(
    function (registro) {

      const sector =
        String(
          registro["SECTOR"] ||
          "SIN SECTOR"
        );


      sectores[sector] =
        (
          sectores[sector] ||
          0
        ) + 1;

    }
  );


  const ordenados =
    Object.entries(sectores)
      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  graficoSectores =
    new Chart(
      ctx,
      {

        type: "bar",

        data: {

          labels:
            ordenados.map(
              item => item[0]
            ),

          datasets: [{

            label: "Salas",

            data:
              ordenados.map(
                item => item[1]
              ),

            borderWidth: 1

          }]

        },

        options: {

          indexAxis: "y",

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              display: false
            }

          },

          scales: {

            x: {
              beginAtZero: true
            }

          }

        }

      }
    );

}


// ======================================================
// GRÁFICO RENOVACIONES
// ======================================================

function crearGraficoRenovaciones() {

  const ctx =
    document.getElementById(
      "graficoRenovaciones"
    );


  if (graficoRenovaciones) {

    graficoRenovaciones.destroy();

  }


  let vencidas = 0;

  let proximas = 0;

  let vigentes = 0;


  datosFiltrados.forEach(
    function (registro) {

      const estado =
        obtenerEstadoRenovacion(
          registro[
            "RENOVACIÓN PARA INDECI"
          ]
        );


      if (
        estado.codigo ===
        "VENCIDA"
      ) {

        vencidas++;

      }


      else if (
        estado.codigo ===
        "PROXIMA"
      ) {

        proximas++;

      }


      else {

        vigentes++;

      }

    }
  );


  graficoRenovaciones =
    new Chart(
      ctx,
      {

        type: "doughnut",

        data: {

          labels: [
            "Vigentes",
            "Próximas",
            "Vencidas"
          ],

          datasets: [{

            data: [
              vigentes,
              proximas,
              vencidas
            ],

            borderWidth: 1

          }]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {

              position: "bottom"

            }

          }

        }

      }
    );

}


// ======================================================
// MODAL
// ======================================================

function abrirModal(registro) {

  const modal =
    document.getElementById(
      "modalDetalle"
    );


  const titulo =
    document.getElementById(
      "modalTitulo"
    );


  const contenido =
    document.getElementById(
      "modalDatos"
    );


  titulo.textContent =
    registro["SALAS"] ||
    "Detalle de sala";


  contenido.innerHTML = "";


  const campos = [

    ["SECTOR", "Sector"],

    ["SALAS", "Sala"],

    [
      "RENOVACIÓN PARA INDECI",
      "Renovación INDECI"
    ],

    [
      "ESPACIOS POR INDECI",
      "Espacios INDECI"
    ],

    [
      "RD MAQ.",
      "RD Máquinas"
    ],

    [
      "RD MEMORIAS",
      "RD Memorias"
    ],

    [
      "INDECI VS RD",
      "INDECI vs RD"
    ],

    [
      "MAQUINAS GENEX",
      "Máquinas GENEX"
    ],

    [
      "RD VS GENEX",
      "RD vs GENEX"
    ],

    ["AFORO", "Aforo"],

    [
      "MES DE LA ULTIMA EMISIÓN RD",
      "Última emisión RD"
    ],

    [
      "OBSERVACIONES",
      "Observaciones"
    ]

  ];


  campos.forEach(
    function (campo) {

      const valor =
        registro[campo[0]];


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "modal-item";


      let valorMostrar =
        valor;


      if (
        campo[0] ===
        "RENOVACIÓN PARA INDECI"
      ) {

        valorMostrar =
          formatearFecha(valor);

      }


      if (
        valorMostrar ===
        null ||
        valorMostrar ===
        undefined ||
        valorMostrar === ""
      ) {

        valorMostrar =
          "—";

      }


      item.innerHTML = `

        <strong>
          ${campo[1]}
        </strong>

        <span>
          ${escaparHTML(
            String(valorMostrar)
          )}
        </span>

      `;


      contenido.appendChild(item);

    }
  );


  modal.classList.add(
    "activo"
  );

}


// ======================================================
// CERRAR MODAL
// ======================================================

function cerrarModal() {

  document
    .getElementById(
      "modalDetalle"
    )
    .classList.remove(
      "activo"
    );

}


document.addEventListener(
  "click",
  function (event) {

    const modal =
      document.getElementById(
        "modalDetalle"
      );


    if (
      event.target === modal
    ) {

      cerrarModal();

    }

  }
);


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFecha(valor) {

  const fecha =
    convertirFecha(valor);


  if (!fecha) {

    return "—";

  }


  return fecha.toLocaleDateString(
    "es-PE",
    {

      day: "2-digit",

      month: "2-digit",

      year: "numeric"

    }
  );

}


// ======================================================
// CONVERTIR FECHA
// ======================================================

function convertirFecha(valor) {

  if (!valor) {

    return null;

  }


  const fecha =
    new Date(valor);


  if (
    !isNaN(fecha.getTime())
  ) {

    return fecha;

  }


  return null;

}


// ======================================================
// FORMATO NÚMERO
// ======================================================

function formatearNumero(valor) {

  const numero =
    Number(valor) || 0;


  return numero.toLocaleString(
    "es-PE"
  );

}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escaparHTML(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return String(valor)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// ======================================================
// ACTUALIZACIÓN AUTOMÁTICA
// ======================================================

// Actualiza los datos cada 5 minutos.

setInterval(
  function () {

    cargarDatos();

  },
  5 * 60 * 1000
);
