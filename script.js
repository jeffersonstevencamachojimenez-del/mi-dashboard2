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

let mapaPeru = null;
let marcadoresMapa = [];


// ======================================================
// PALETA DE COLORES PARA LAS BARRAS DE SECTORES
// ======================================================

const coloresSectores = [
  "#B72EB1",
  "#2E86DE",
  "#00A884",
  "#F39C12",
  "#E74C3C",
  "#8E44AD",
  "#16A085",
  "#D35400",
  "#2980B9",
  "#27AE60",
  "#C0392B",
  "#7F8C8D",
  "#9B59B6",
  "#1ABC9C",
  "#F1C40F",
  "#E67E22",
  "#3498DB",
  "#2ECC71",
  "#E91E63",
  "#795548"
];


// ======================================================
// CATÁLOGO DE UBICACIONES
// ======================================================

const UBICACIONES_SALAS = {

  "2 DE MAYO": [-12.0525, -77.0432],
  "ABANCAY": [-13.6339, -72.8814],
  "ANDAHUAYLAS": [-13.6556, -73.3872],
  "AREQUIPA": [-16.3989, -71.5369],
  "AYACUCHO": [-13.1588, -74.2232],
  "BAGUA GRANDE": [-5.7560, -78.4380],
  "BARRANCA": [-10.7525, -77.7600],
  "BARRANCO": [-12.1455, -77.0200],
  "BOLIVAR": [-12.0715, -77.0610],
  "CAJAMARCA": [-7.1617, -78.5128],
  "CHICLAYO": [-6.7714, -79.8409],
  "CHIMBOTE": [-9.0745, -78.5936],
  "CHINCHA": [-13.4098, -76.1328],
  "CHORRILLOS": [-12.1715, -77.0247],
  "CHOSICA": [-11.9350, -76.6950],
  "COLONIAL": [-12.0570, -77.0950],
  "COMAS": [-11.9430, -77.0620],
  "CUSCO": [-13.5319, -71.9675],
  "ELIO": [-12.0580, -77.0730],
  "GAMARRA": [-12.0660, -77.0130],
  "HUACHO": [-11.1070, -77.6050],
  "HUARAL": [-11.4950, -77.2070],
  "HUARAZ": [-9.5278, -77.5278],
  "HUARMEY": [-10.0680, -78.1530],
  "ICA": [-14.0678, -75.7286],
  "ILO": [-17.6394, -71.3375],
  "IQUITOS": [-3.7437, -73.2516],
  "JAEN": [-5.7073, -78.8078],
  "JULIACA": [-15.4997, -70.1333],
  "LAMBAYEQUE": [-6.7011, -79.9061],
  "LOS OLIVOS": [-11.9600, -77.0750],
  "LURIN": [-12.2760, -76.8700],
  "MANCO CAPAC": [-12.0660, -77.0130],
  "MOQUEGUA": [-17.1936, -70.9327],
  "MOYOBAMBA": [-6.0340, -76.9728],
  "PIURA": [-5.1945, -80.6328],
  "PUCALLPA": [-8.3791, -74.5539],
  "PUNO": [-15.8402, -70.0219],
  "SAN GERMAN": [-11.9900, -77.0700],
  "SAN JUAN": [-12.1630, -76.9630],
  "SAN MARTIN": [-12.0020, -77.0780],
  "SANTA ANITA": [-12.0430, -76.9720],
  "SULLANA": [-4.9039, -80.6853],
  "TACNA": [-18.0147, -70.2536],
  "TARAPOTO": [-6.4880, -76.3650],
  "TRUJILLO": [-8.1116, -79.0287],
  "TUMBES": [-3.5669, -80.4515],
  "VENTANILLA": [-11.8750, -77.1180],
  "VILLA": [-12.2160, -76.9380],
  "ZARATE": [-12.0180, -76.9970]

};


// ======================================================
// INICIO
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

  configurarEventos();

  inicializarMapa();

  cargarDatos();

});


// ======================================================
// INICIALIZAR MAPA
// ======================================================

function inicializarMapa() {

  const contenedor =
    document.getElementById("mapaPeru");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  mapaPeru = L.map("mapaPeru", {

    zoomControl: true,

    scrollWheelZoom: true

  });

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {

      attribution:
        "&copy; OpenStreetMap contributors",

      maxZoom: 19

    }
  ).addTo(mapaPeru);

  mapaPeru.fitBounds([
    [-18.5, -81.5],
    [-0.5, -68.5]
  ]);

}


// ======================================================
// CARGAR DATOS DESDE GOOGLE SHEETS
// ======================================================

async function cargarDatos() {

  const textoConexion =
    document.getElementById("textoConexion");

  const indicador =
    document.getElementById("indicadorConexion");

  try {

    if (textoConexion) {
      textoConexion.textContent =
        "Conectando con Google Sheets...";
    }

    if (indicador) {
      indicador.style.background =
        "#ffb300";
    }

    const respuesta =
      await fetch(
        URL_DATOS + "?t=" + Date.now()
      );

    if (!respuesta.ok) {
      throw new Error(
        "Error HTTP " +
        respuesta.status
      );
    }

    const datos =
      await respuesta.json();

    datosOriginales =
      Array.isArray(datos)
        ? datos
        : [];

    datosFiltrados =
      [...datosOriginales];

    if (textoConexion) {
      textoConexion.textContent =
        "Google Sheets conectado";
    }

    if (indicador) {
      indicador.style.background =
        "#21c55d";
    }

    const cantidad =
      document.getElementById(
        "cantidadSalas"
      );

    if (cantidad) {
      cantidad.textContent =
        datosOriginales.length;
    }

    llenarFiltros();

    actualizarDashboard();

  } catch (error) {

    console.error(
      "Error cargando datos:",
      error
    );

    if (textoConexion) {
      textoConexion.textContent =
        "Error de conexión";
    }

    if (indicador) {
      indicador.style.background =
        "#dc2626";
    }

    const tabla =
      document.getElementById(
        "tablaCuerpo"
      );

    if (tabla) {

      tabla.innerHTML = `

        <tr>

          <td
            colspan="11"
            class="sin-datos">

            ❌ No se pudieron cargar
            los datos de Google Sheets.

          </td>

        </tr>

      `;

    }

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

  if (buscar) {
    buscar.addEventListener(
      "input",
      aplicarFiltros
    );
  }

  if (sector) {
    sector.addEventListener(
      "change",
      aplicarFiltros
    );
  }

  if (mes) {
    mes.addEventListener(
      "change",
      aplicarFiltros
    );
  }

  if (renovacion) {
    renovacion.addEventListener(
      "change",
      aplicarFiltros
    );
  }

}


// ======================================================
// LLENAR FILTROS
// ======================================================

function llenarFiltros() {

  const sectorSelect =
    document.getElementById(
      "filtroSector"
    );

  const mesSelect =
    document.getElementById(
      "filtroMes"
    );

  if (!sectorSelect || !mesSelect) {
    return;
  }

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
    [
      ...new Set(

        datosOriginales

          .map(
            d =>
              String(
                d["SECTOR"] || ""
              ).trim()
          )

          .filter(Boolean)

      )
    ]
      .sort();

  sectores.forEach(
    function (sector) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        sector;

      option.textContent =
        sector;

      sectorSelect.appendChild(
        option
      );

    }
  );

  const meses =
    [
      ...new Set(

        datosOriginales

          .map(
            d =>
              String(
                d[
                  "MES DE LA ULTIMA EMISIÓN RD"
                ] || ""
              ).trim()
          )

          .filter(Boolean)

      )
    ]
      .sort();

  meses.forEach(
    function (mes) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        mes;

      option.textContent =
        mes;

      mesSelect.appendChild(
        option
      );

    }
  );

}


// ======================================================
// APLICAR FILTROS
// ======================================================

function aplicarFiltros() {

  const buscar =
    document.getElementById(
      "buscarSala"
    );

  const sectorSelect =
    document.getElementById(
      "filtroSector"
    );

  const mesSelect =
    document.getElementById(
      "filtroMes"
    );

  const renovacionSelect =
    document.getElementById(
      "filtroRenovacion"
    );

  const texto =
    buscar
      ? buscar.value
          .toLowerCase()
          .trim()
      : "";

  const sector =
    sectorSelect
      ? sectorSelect.value
      : "";

  const mes =
    mesSelect
      ? mesSelect.value
      : "";

  const renovacion =
    renovacionSelect
      ? renovacionSelect.value
      : "";

  datosFiltrados =
    datosOriginales.filter(
      function (registro) {

        const sala =
          String(
            registro["SALAS"] || ""
          )
            .toLowerCase();

        if (
          texto &&
          !sala.includes(texto)
        ) {
          return false;
        }

        if (
          sector &&
          registro["SECTOR"] !== sector
        ) {
          return false;
        }

        if (
          mes &&
          registro[
            "MES DE LA ULTIMA EMISIÓN RD"
          ] !== mes
        ) {
          return false;
        }

        if (renovacion) {

          const estado =
            obtenerEstadoRenovacion(
              registro[
                "RENOVACIÓN PARA INDECI"
              ]
            );

          if (
            estado.codigo !==
            renovacion
          ) {
            return false;
          }

        }

        return true;

      }
    );

  actualizarDashboard();

}


// ======================================================
// LIMPIAR FILTROS
// ======================================================

function limpiarFiltros() {

  const buscar =
    document.getElementById(
      "buscarSala"
    );

  const sector =
    document.getElementById(
      "filtroSector"
    );

  const mes =
    document.getElementById(
      "filtroMes"
    );

  const renovacion =
    document.getElementById(
      "filtroRenovacion"
    );

  if (buscar) buscar.value = "";

  if (sector) sector.value = "";

  if (mes) mes.value = "";

  if (renovacion) renovacion.value = "";

  datosFiltrados =
    [...datosOriginales];

  actualizarDashboard();

}


// ======================================================
// ACTUALIZAR TODO
// ======================================================

function actualizarDashboard() {

  actualizarKPI();

  actualizarTabla();

  actualizarGraficos();

  actualizarMapa();

  const contador =
    document.getElementById(
      "contadorResultados"
    );

  if (contador) {

    contador.textContent =
      datosFiltrados.length +
      (
        datosFiltrados.length === 1
          ? " registro"
          : " registros"
      );

  }

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

  const kpiSalas =
    document.getElementById(
      "kpiSalas"
    );

  const kpiEspacios =
    document.getElementById(
      "kpiEspacios"
    );

  const kpiRD =
    document.getElementById(
      "kpiRD"
    );

  const kpiGenex =
    document.getElementById(
      "kpiGenex"
    );

  const kpiDiferencia =
    document.getElementById(
      "kpiDiferencia"
    );

  const kpiDiferenciaGenex =
    document.getElementById(
      "kpiDiferenciaGenex"
    );

  if (kpiSalas) {
    kpiSalas.textContent =
      formatearNumero(total);
  }

  if (kpiEspacios) {
    kpiEspacios.textContent =
      formatearNumero(espacios);
  }

  if (kpiRD) {
    kpiRD.textContent =
      formatearNumero(rd);
  }

  if (kpiGenex) {
    kpiGenex.textContent =
      formatearNumero(genex);
  }

  if (kpiDiferencia) {
    kpiDiferencia.textContent =
      formatearNumero(
        diferenciaIndeci
      );
  }

  if (kpiDiferenciaGenex) {
    kpiDiferenciaGenex.textContent =
      formatearNumero(
        diferenciaGenex
      );
  }

}


// ======================================================
// SUMAR CAMPO
// ======================================================

function sumarCampo(
  datos,
  campo
) {

  return datos.reduce(
    function (
      total,
      registro
    ) {

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

  if (!cuerpo) return;

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
        document.createElement(
          "tr"
        );

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
            ]
          )}
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

          abrirModal(
            registro
          );

        }
      );

      cuerpo.appendChild(
        fila
      );

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
// ESTADO RENOVACIÓN
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

  fechaRenovacion.setHours(
    0,
    0,
    0,
    0
  );

  const dias =
    Math.ceil(

      (
        fechaRenovacion -
        hoy
      )
      /
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
// MAPA
// ======================================================

function obtenerUbicacionSala(
  nombre
) {

  if (!nombre) return null;

  let sala =
    String(nombre)
      .toUpperCase()
      .trim();

  sala =
    sala.replace(
      /\s+/g,
      " "
    );

  sala =
    sala.replace(
      /\s*\(.*?\)\s*/g,
      ""
    )
    .trim();

  if (
    UBICACIONES_SALAS[sala]
  ) {

    return {

      centro:
        UBICACIONES_SALAS[sala],

      ciudad:
        sala

    };

  }

  const claves =
    Object.keys(
      UBICACIONES_SALAS
    );

  for (
    let i = 0;
    i < claves.length;
    i++
  ) {

    const clave =
      claves[i];

    if (
      sala === clave ||
      sala.startsWith(
        clave + " "
      )
    ) {

      return {

        centro:
          UBICACIONES_SALAS[clave],

        ciudad:
          clave

      };

    }

  }

  return null;

}


// ======================================================
// GENERAR SEPARACIÓN DE PUNTOS
// ======================================================

function calcularPosicionMarcador(
  centro,
  indice,
  total
) {

  if (
    !centro ||
    total <= 1
  ) {

    return [
      centro[0],
      centro[1]
    ];

  }

  const radio =
    0.006;

  const angulo =
    (
      2 *
      Math.PI *
      indice
    )
    /
    total;

  const lat =
    centro[0] +
    Math.cos(
      angulo
    ) *
    radio;

  const lng =
    centro[1] +
    Math.sin(
      angulo
    ) *
    radio
    /
    Math.cos(
      centro[0] *
      Math.PI /
      180
    );

  return [
    lat,
    lng
  ];

}


// ======================================================
// CREAR ICONO DEL MARCADOR
// ======================================================

function crearIconoSala(
  estado
) {

  let color =
    "#16803c";

  if (
    estado.codigo ===
    "VENCIDA"
  ) {

    color =
      "#c62828";

  }

  else if (
    estado.codigo ===
    "PROXIMA"
  ) {

    color =
      "#f59e0b";

  }

  return L.divIcon({

    className:
      "icono-marcador-sala",

    html: `

      <div
        style="
          width:18px;
          height:18px;
          background:${color};
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,.45);
        ">
      </div>

    `,

    iconSize: [
      18,
      18
    ],

    iconAnchor: [
      9,
      9
    ],

    popupAnchor: [
      0,
      -10
    ]

  });

}


// ======================================================
// ACTUALIZAR MAPA
// ======================================================

function actualizarMapa() {

  if (!mapaPeru) return;

  marcadoresMapa.forEach(
    function (marcador) {

      mapaPeru.removeLayer(
        marcador
      );

    }
  );

  marcadoresMapa = [];

  const grupos = {};

  datosFiltrados.forEach(
    function (registro) {

      const nombre =
        String(
          registro["SALAS"] || ""
        ).trim();

      const ubicacion =
        obtenerUbicacionSala(
          nombre
        );

      if (!ubicacion) return;

      const clave =
        ubicacion.ciudad;

      if (!grupos[clave]) {
        grupos[clave] = [];
      }

      grupos[clave].push({

        registro:
          registro,

        ubicacion:
          ubicacion

      });

    }
  );

  let cantidadMapa = 0;

  Object.keys(
    grupos
  ).forEach(
    function (ciudad) {

      const grupo =
        grupos[ciudad];

      grupo.forEach(
        function (
          item,
          indice
        ) {

          const registro =
            item.registro;

          const centro =
            item.ubicacion.centro;

          const posicion =
            calcularPosicionMarcador(
              centro,
              indice,
              grupo.length
            );

          const estado =
            obtenerEstadoRenovacion(
              registro[
                "RENOVACIÓN PARA INDECI"
              ]
            );

          const marcador =
            L.marker(
              posicion,
              {
                icon:
                  crearIconoSala(
                    estado
                  )
              }
            );

          const nombre =
            registro["SALAS"] ||
            "Sin nombre";

          const sector =
            registro["SECTOR"] ||
            "—";

          const espacios =
            registro[
              "ESPACIOS POR INDECI"
            ];

          const rd =
            registro["RD MAQ."];

          const genex =
            registro[
              "MAQUINAS GENEX"
            ];

          const aforo =
            registro["AFORO"];

          const renovacion =
            formatearFecha(
              registro[
                "RENOVACIÓN PARA INDECI"
              ]
            );

          let colorEstado =
            "#16803c";

          if (
            estado.codigo ===
            "VENCIDA"
          ) {

            colorEstado =
              "#c62828";

          }

          else if (
            estado.codigo ===
            "PROXIMA"
          ) {

            colorEstado =
              "#f59e0b";

          }

          const popup = `

            <div
              class="popup-sala"
              style="
                min-width:220px;
                font-family:Arial,Helvetica,sans-serif;
              ">

              <h3
                style="
                  margin:0 0 8px;
                  color:#b11226;
                  font-size:16px;
                ">

                ${escaparHTML(
                  String(nombre)
                )}

              </h3>

              <p>
                <strong>Sector:</strong>
                ${escaparHTML(
                  String(sector)
                )}
              </p>

              <p>

                <strong>Estado:</strong>

                <span
                  style="
                    color:${colorEstado};
                    font-weight:bold;
                  ">

                  ${escaparHTML(
                    estado.texto
                  )}

                </span>

              </p>

              <p>

                <strong>
                  Renovación:
                </strong>

                ${escaparHTML(
                  renovacion
                )}

              </p>

              <hr
                style="
                  border:0;
                  border-top:1px solid #eee;
                  margin:8px 0;
                "
              >

              <p>

                <strong>
                  Espacios INDECI:
                </strong>

                ${formatearNumero(
                  espacios
                )}

              </p>

              <p>

                <strong>
                  RD Máquinas:
                </strong>

                ${formatearNumero(
                  rd
                )}

              </p>

              <p>

                <strong>
                  GENEX:
                </strong>

                ${formatearNumero(
                  genex
                )}

              </p>

              <p>

                <strong>
                  Aforo:
                </strong>

                ${formatearNumero(
                  aforo
                )}

              </p>

            </div>

          `;

          marcador
            .bindPopup(
              popup
            )
            .addTo(
              mapaPeru
            );

          marcador.on(
            "dblclick",
            function () {

              abrirModal(
                registro
              );

            }
          );

          marcadoresMapa.push(
            marcador
          );

          cantidadMapa++;

        }
      );

    }
  );

  const contador =
    document.getElementById(
      "salasMapa"
    );

  if (contador) {
    contador.textContent =
      cantidadMapa;
  }

  if (
    marcadoresMapa.length > 0
  ) {

    const grupo =
      L.featureGroup(
        marcadoresMapa
      );

    mapaPeru.fitBounds(
      grupo.getBounds(),
      {
        padding: [
          40,
          40
        ],
        maxZoom: 12
      }
    );

  }

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

  if (!ctx) return;

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

            backgroundColor: [
              "#B72EB1",
              "#2E86DE"
            ],

            borderColor: [
              "#B72EB1",
              "#2E86DE"
            ],

            borderWidth: 1,

            borderRadius: 6

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

  if (!ctx) return;

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

            backgroundColor: [
              "#2E86DE",
              "#00A884"
            ],

            borderColor: [
              "#2E86DE",
              "#00A884"
            ],

            borderWidth: 1,

            borderRadius: 6

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
// GRÁFICO SECTORES
// ======================================================

function crearGraficoSectores() {

  const ctx =
    document.getElementById(
      "graficoSectores"
    );

  if (!ctx) return;

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
        ).trim();

      sectores[sector] =
        (
          sectores[sector] ||
          0
        ) + 1;

    }
  );

  const ordenados =
    Object.entries(
      sectores
    )
      .sort(
        function (a, b) {

          return b[1] - a[1];

        }
      );


  // ====================================================
  // AQUÍ SE GENERA UN COLOR DIFERENTE PARA CADA BARRA
  // ====================================================

  const coloresBarras =
    ordenados.map(
      function (item, indice) {

        return coloresSectores[
          indice %
          coloresSectores.length
        ];

      }
    );


  graficoSectores =
    new Chart(
      ctx,
      {

        type: "bar",

        data: {

          labels:
            ordenados.map(
              function (item) {

                return item[0];

              }
            ),

          datasets: [{

            label: "Salas",

            data:
              ordenados.map(
                function (item) {

                  return item[1];

                }
              ),

            backgroundColor:
              coloresBarras,

            borderColor:
              coloresBarras,

            borderWidth: 1,

            borderRadius: 6,

            borderSkipped: false

          }]

        },

        options: {

          indexAxis: "y",

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {

              display: false

            },

            tooltip: {

              callbacks: {

                label:
                  function (context) {

                    return (
                      " " +
                      context.raw +
                      (
                        context.raw === 1
                          ? " sala"
                          : " salas"
                      )
                    );

                  }

              }

            }

          },

          scales: {

            x: {

              beginAtZero: true,

              ticks: {

                precision: 0

              }

            },

            y: {

              ticks: {

                autoSkip: false

              }

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

  if (!ctx) return;

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

            backgroundColor: [
              "#21C55D",
              "#F59E0B",
              "#DC2626"
            ],

            borderColor: [
              "#ffffff",
              "#ffffff",
              "#ffffff"
            ],

            borderWidth: 2

          }]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {

              position:
                "bottom"

            }

          }

        }

      }
    );

}


// ======================================================
// MODAL
// ======================================================

function abrirModal(
  registro
) {

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

  if (
    !modal ||
    !titulo ||
    !contenido
  ) {
    return;
  }

  titulo.textContent =
    registro["SALAS"] ||
    "Detalle de sala";

  contenido.innerHTML = "";

  const campos = [

    [
      "SECTOR",
      "Sector"
    ],

    [
      "SALAS",
      "Sala"
    ],

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

    [
      "AFORO",
      "Aforo"
    ],

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
        registro[
          campo[0]
        ];

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
          formatearFecha(
            valor
          );

      }

      if (
        valorMostrar === null ||
        valorMostrar === undefined ||
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
            String(
              valorMostrar
            )
          )}
        </span>

      `;

      contenido.appendChild(
        item
      );

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

  const modal =
    document.getElementById(
      "modalDetalle"
    );

  if (!modal) return;

  modal.classList.remove(
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
      modal &&
      event.target === modal
    ) {

      cerrarModal();

    }

  }
);


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFecha(
  valor
) {

  const fecha =
    convertirFecha(
      valor
    );

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

function convertirFecha(
  valor
) {

  if (!valor) {
    return null;
  }

  if (
    valor instanceof Date
  ) {

    return isNaN(
      valor.getTime()
    )
      ? null
      : valor;

  }

  const texto =
    String(valor)
      .trim();

  if (!texto) {
    return null;
  }

  let coincidencia =
    texto.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

  if (coincidencia) {

    const dia =
      Number(
        coincidencia[1]
      );

    const mes =
      Number(
        coincidencia[2]
      ) - 1;

    const año =
      Number(
        coincidencia[3]
      );

    const fecha =
      new Date(
        año,
        mes,
        dia
      );

    return isNaN(
      fecha.getTime()
    )
      ? null
      : fecha;

  }

  coincidencia =
    texto.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

  if (coincidencia) {

    const año =
      Number(
        coincidencia[1]
      );

    const mes =
      Number(
        coincidencia[2]
      ) - 1;

    const dia =
      Number(
        coincidencia[3]
      );

    const fecha =
      new Date(
        año,
        mes,
        dia
      );

    return isNaN(
      fecha.getTime()
    )
      ? null
      : fecha;

  }

  const fecha =
    new Date(
      texto
    );

  if (
    !isNaN(
      fecha.getTime()
    )
  ) {

    return fecha;

  }

  return null;

}


// ======================================================
// FORMATO NÚMERO
// ======================================================

function formatearNumero(
  valor
) {

  const numero =
    Number(valor) || 0;

  return numero.toLocaleString(
    "es-PE"
  );

}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escaparHTML(
  valor
) {

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

setInterval(
  function () {

    cargarDatos();

  },
  5 * 60 * 1000
);
