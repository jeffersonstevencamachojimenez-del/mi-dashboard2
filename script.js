// ======================================================
// DASHBOARD DE PRODUCCIÓN
// VERSIÓN OPTIMIZADA
// ======================================================


// ======================================================
// 01. GOOGLE SHEETS
// ======================================================

const SHEET_ID =
  "1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY";

const SHEET_GID =
  "683959855";

const URL_DATOS =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;


// ======================================================
// 02. VARIABLES
// ======================================================

let datos = [];

let datosFiltrados = [];

let graficos = {};


// ======================================================
// 03. MESES
// ======================================================

const MESES = [

  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE"

];


// ======================================================
// 04. CONFIGURACIÓN DE INDICADORES
// ======================================================

const CONFIG_INDICADORES = {

  "COIN": {
    tipo: "total"
  },

  "COIN PROM": {
    tipo: "promedio"
  },

  "VENTA": {
    tipo: "total"
  },

  "VENTA PROM": {
    tipo: "promedio"
  },

  "NETWIN ($)": {
    tipo: "total"
  },

  "T.C": {
    tipo: "promedio"
  },

  "% PAGO": {
    tipo: "promedio"
  }

};


// ======================================================
// 05. INICIO
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  iniciar
);


function iniciar() {

  configurarEventos();

  cargarDatos();

}


// ======================================================
// 06. EVENTOS
// ======================================================

function configurarEventos() {

  const ids = [

    "filtroSala",
    "filtroMarca",
    "filtroSerie",
    "filtroJuego",
    "filtroMes",
    "filtroAnio",
    "filtroIndicador"

  ];


  ids.forEach(
    id => {

      const elemento =
        document.getElementById(id);

      if (elemento) {

        elemento.addEventListener(
          "change",
          manejarFiltro
        );

      }

    }
  );


  document
    .getElementById("btnLimpiar")
    ?.addEventListener(
      "click",
      limpiarFiltros
    );

}


// ======================================================
// 07. CARGAR GOOGLE SHEETS
// ======================================================

async function cargarDatos() {

  cambiarEstado(
    "Conectando con Google Sheets...",
    "#f59e0b"
  );


  try {

    const respuesta =
      await fetch(
        URL_DATOS +
        "&t=" +
        Date.now()
      );


    if (!respuesta.ok) {

      throw new Error(
        "HTTP " +
        respuesta.status
      );

    }


    const texto =
      await respuesta.text();


    datos =
      convertirGViz(texto);


    if (!datos.length) {

      throw new Error(
        "No se encontraron datos."
      );

    }


    datosFiltrados =
      datos;


    cambiarEstado(
      "Google Sheets conectado",
      "#16a34a"
    );


    llenarTodosLosFiltros();

    actualizarDashboard();

  }

  catch (error) {

    console.error(error);

    cambiarEstado(
      "Error al conectar con Google Sheets",
      "#dc2626"
    );

  }

}


// ======================================================
// 08. CONVERTIR GVIZ
// ======================================================

function convertirGViz(texto) {

  const inicio =
    texto.indexOf("{");

  const fin =
    texto.lastIndexOf("}");


  if (
    inicio === -1 ||
    fin === -1
  ) {

    throw new Error(
      "Respuesta inválida de Google Sheets."
    );

  }


  const json =
    JSON.parse(
      texto.substring(
        inicio,
        fin + 1
      )
    );


  const filas =
    json?.table?.rows || [];


  return filas.map(
    fila => {

      const c =
        fila.c || [];


      return {

        marca:
          celda(c, 0),

        serie:
          celda(c, 2),

        juego:
          celda(c, 5),

        coin:
          numero(celda(c, 7)),

        coinProm:
          numero(celda(c, 8)),

        venta:
          numero(celda(c, 9)),

        ventaProm:
          numero(celda(c, 10)),

        netwin:
          numero(celda(c, 11)),

        gplayed:
          numero(celda(c, 12)),

        pago:
          numero(celda(c, 13)),

        sala:
          celda(c, 15),

        mes:
          normalizarMes(
            celda(c, 16)
          ),

        anio:
          String(
            celda(c, 17)
          ).trim(),

        tc:
          numero(celda(c, 19))

      };

    }
  );

}


// ======================================================
// 09. CELDA
// ======================================================

function celda(columnas, indice) {

  const c =
    columnas[indice];

  if (!c) {

    return "";

  }

  if (
    c.v !== undefined &&
    c.v !== null
  ) {

    return c.v;

  }

  return c.f || "";

}


// ======================================================
// 10. NÚMERO
// ======================================================

function numero(valor) {

  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {

    return 0;

  }


  if (
    typeof valor === "number"
  ) {

    return Number.isFinite(valor)
      ? valor
      : 0;

  }


  let t =
    String(valor)
      .trim()
      .replace(/%/g, "");


  if (
    t.includes(",") &&
    t.includes(".")
  ) {

    if (
      t.lastIndexOf(",") >
      t.lastIndexOf(".")
    ) {

      t =
        t
          .replace(/\./g, "")
          .replace(",", ".");

    }

    else {

      t =
        t.replace(/,/g, "");

    }

  }

  else if (
    t.includes(",")
  ) {

    const partes =
      t.split(",");


    if (
      partes.length === 2 &&
      partes[1].length <= 2
    ) {

      t =
        t.replace(",", ".");

    }

    else {

      t =
        t.replace(/,/g, "");

    }

  }


  t =
    t.replace(
      /[^0-9.-]/g,
      ""
    );


  const n =
    Number(t);


  return Number.isFinite(n)
    ? n
    : 0;

}


// ======================================================
// 11. NORMALIZAR TEXTO
// ======================================================

function texto(valor) {

  return String(
    valor ?? ""
  )
    .trim()
    .toUpperCase();

}


// ======================================================
// 12. NORMALIZAR MES
// ======================================================

function normalizarMes(valor) {

  let mes =
    texto(valor);


  const n =
    Number(mes);


  if (
    Number.isInteger(n) &&
    n >= 1 &&
    n <= 12
  ) {

    return MESES[n - 1];

  }


  const equivalencias = {

    ENE: "ENERO",
    FEB: "FEBRERO",
    MAR: "MARZO",
    ABR: "ABRIL",
    MAY: "MAYO",
    JUN: "JUNIO",
    JUL: "JULIO",
    AGO: "AGOSTO",
    SEP: "SEPTIEMBRE",
    SET: "SEPTIEMBRE",
    OCT: "OCTUBRE",
    NOV: "NOVIEMBRE",
    DIC: "DICIEMBRE"

  };


  return equivalencias[mes] || mes;

}


// ======================================================
// 13. ESTADO
// ======================================================

function cambiarEstado(
  mensaje,
  color
) {

  const textoConexion =
    document.getElementById(
      "textoConexion"
    );

  const punto =
    document.getElementById(
      "indicadorConexion"
    );


  if (textoConexion) {

    textoConexion.textContent =
      mensaje;

  }


  if (punto) {

    punto.style.background =
      color;

  }

}


// ======================================================
// 14. OBTENER FILTROS
// ======================================================

function filtrosActuales() {

  return {

    sala:
      valorFiltro("filtroSala"),

    marca:
      valorFiltro("filtroMarca"),

    serie:
      valorFiltro("filtroSerie"),

    juego:
      valorFiltro("filtroJuego"),

    mes:
      valorFiltro("filtroMes"),

    anio:
      valorFiltro("filtroAnio"),

    indicador:
      valorFiltro("filtroIndicador") ||
      "COIN"

  };

}


function valorFiltro(id) {

  return texto(
    document.getElementById(id)?.value
  );

}


// ======================================================
// 15. APLICAR FILTROS
// ======================================================

function obtenerFiltrados() {

  const f =
    filtrosActuales();


  return datos.filter(
    r => {

      if (
        f.sala &&
        texto(r.sala) !== f.sala
      ) {

        return false;

      }


      if (
        f.marca &&
        texto(r.marca) !== f.marca
      ) {

        return false;

      }


      if (
        f.serie &&
        texto(r.serie) !== f.serie
      ) {

        return false;

      }


      if (
        f.juego &&
        texto(r.juego) !== f.juego
      ) {

        return false;

      }


      if (
        f.mes &&
        texto(r.mes) !== f.mes
      ) {

        return false;

      }


      if (
        f.anio &&
        texto(r.anio) !== f.anio
      ) {

        return false;

      }


      return true;

    }
  );

}


// ======================================================
// 16. MANEJAR FILTRO
// ======================================================

function manejarFiltro() {

  datosFiltrados =
    obtenerFiltrados();


  actualizarDashboard();

}


// ======================================================
// 17. LLENAR FILTROS
// ======================================================

function llenarTodosLosFiltros() {

  llenarSelect(
    "filtroSala",
    "sala",
    "Todas las salas"
  );


  llenarSelect(
    "filtroMarca",
    "marca",
    "Todas las marcas"
  );


  llenarSelect(
    "filtroSerie",
    "serie",
    "Todas las series"
  );


  llenarSelect(
    "filtroJuego",
    "juego",
    "Todos los juegos"
  );


  llenarSelect(
    "filtroAnio",
    "anio",
    "Todos los años"
  );


  const mes =
    document.getElementById(
      "filtroMes"
    );


  if (mes) {

    mes.innerHTML =
      `<option value="">
        Todos los meses
      </option>`;

    MESES.forEach(
      m => {

        mes.innerHTML +=
          `<option value="${m}">
            ${m}
          </option>`;

      }
    );

  }

}


// ======================================================
// 18. SELECT
// ======================================================

function llenarSelect(
  id,
  campo,
  inicial
) {

  const select =
    document.getElementById(id);


  if (!select) {

    return;

  }


  const anterior =
    select.value;


  const valores =
    [
      ...new Set(

        datos

          .map(
            r => texto(
              r[campo]
            )
          )

          .filter(Boolean)

      )
    ];


  valores.sort(
    (a, b) =>
      a.localeCompare(
        b,
        "es",
        {
          numeric: true
        }
      )
  );


  select.innerHTML =
    `<option value="">
      ${inicial}
    </option>`;


  valores.forEach(
    v => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        v;

      option.textContent =
        v;

      select.appendChild(
        option
      );

    }
  );


  if (
    valores.includes(
      anterior
    )
  ) {

    select.value =
      anterior;

  }

}


// ======================================================
// 19. FILTROS ENCADENADOS
// ======================================================

function actualizarFiltrosEncadenados() {

  const f =
    filtrosActuales();


  const campos = {

    filtroSala: "sala",

    filtroMarca: "marca",

    filtroSerie: "serie",

    filtroJuego: "juego",

    filtroMes: "mes",

    filtroAnio: "anio"

  };


  Object.entries(campos)
    .forEach(
      ([id, campo]) => {

        const otros =
          Object.entries(f)
            .filter(
              ([clave]) => {

                const mapa = {

                  sala: "filtroSala",
                  marca: "filtroMarca",
                  serie: "filtroSerie",
                  juego: "filtroJuego",
                  mes: "filtroMes",
                  anio: "filtroAnio"

                };

                return mapa[clave] !== id;

              }
            )
            .filter(
              ([, valor]) =>
                valor !== ""
            );


        let lista =
          datos;


        otros.forEach(
          ([clave, valor]) => {

            lista =
              lista.filter(
                r =>
                  texto(
                    r[clave]
                  ) === valor
              );

          }
        );


        const valores =
          [
            ...new Set(

              lista

                .map(
                  r =>
                    texto(
                      r[campo]
                    )
                )

                .filter(Boolean)

            )
          ];


        valores.sort(
          (a, b) =>
            a.localeCompare(
              b,
              "es",
              {
                numeric: true
              }
            )
        );


        const select =
          document.getElementById(
            id
          );


        const anterior =
          select.value;


        select.innerHTML =
          `<option value="">
            ${select.options[0]?.textContent || ""}
          </option>`;


        valores.forEach(
          v => {

            const op =
              document.createElement(
                "option"
              );

            op.value =
              v;

            op.textContent =
              v;

            select.appendChild(
              op
            );

          }
        );


        if (
          valores.includes(
            anterior
          )
        ) {

          select.value =
            anterior;

        }

      }
    );

}


// ======================================================
// 20. DASHBOARD
// ======================================================

function actualizarDashboard() {

  actualizarKPIs();

  actualizarGraficos();

  actualizarIndicador();

  actualizarMapa();

  actualizarTabla();

}


// ======================================================
// 21. KPI
// ======================================================

function actualizarKPIs() {

  let coin = 0;

  let venta = 0;

  let netwin = 0;

  let pago = 0;


  datosFiltrados.forEach(
    r => {

      coin +=
        r.coin;

      venta +=
        r.venta;

      netwin +=
        r.netwin;

      pago +=
        r.pago;

    }
  );


  const cantidad =
    datosFiltrados.length;


  pago =
    cantidad
      ? pago / cantidad
      : 0;


  poner(
    "kpiCoin",
    formato(coin)
  );


  poner(
    "kpiVenta",
    formato(venta)
  );


  poner(
    "kpiNetwin",
    formato(netwin)
  );


  poner(
    "kpiPago",
    pago.toFixed(2) + "%"
  );


  poner(
    "kpiRegistros",
    formatoEntero(cantidad)
  );

}


// ======================================================
// 22. ACTUALIZAR GRÁFICOS
// ======================================================

function actualizarGraficos() {

  const indicador =
    valorFiltro(
      "filtroIndicador"
    ) || "COIN";


  const evolucion =
    agrupar(
      datosFiltrados,
      "mes",
      indicador
    );


  const salas =
    ranking(
      datosFiltrados,
      "sala",
      indicador,
      12
    );


  const juegos =
    ranking(
      datosFiltrados,
      "juego",
      indicador,
      12
    );


  const marcas =
    ranking(
      datosFiltrados,
      "marca",
      indicador,
      12
    );


  crearOActualizarLinea(
    "graficoEvolucion",
    evolucion.labels,
    evolucion.values,
    "#2563eb",
    indicador
  );


  crearOActualizarBarra(
    "graficoSalas",
    salas.labels,
    salas.values,
    "#b91c1c",
    indicador
  );


  crearOActualizarBarra(
    "graficoJuegos",
    juegos.labels,
    juegos.values,
    "#059669",
    indicador
  );


  crearOActualizarBarra(
    "graficoMarcas",
    marcas.labels,
    marcas.values,
    "#7c3aed",
    indicador
  );


  poner(
    "subtituloEvolucion",
    indicador +
    " por mes"
  );

}


// ======================================================
// 23. AGRUPAR
// ======================================================

function agrupar(
  registros,
  campo,
  indicador
) {

  const mapa =
    new Map();


  registros.forEach(
    r => {

      const clave =
        r[campo] || "SIN DATO";


      const valor =
        valorIndicador(
          r,
          indicador
        );


      if (
        !mapa.has(clave)
      ) {

        mapa.set(
          clave,
          []
        );

      }


      mapa
        .get(clave)
        .push(valor);

    }
  );


  let labels =
    Array.from(
      mapa.keys()
    );


  labels.sort(
    (a, b) => {

      return MESES.indexOf(a) -
        MESES.indexOf(b);

    }
  );


  return {

    labels,

    values:
      labels.map(
        mes =>
          calcular(
            mapa.get(mes),
            indicador
          )
      )

  };

}


// ======================================================
// 24. RANKING
// ======================================================

function ranking(
  registros,
  campo,
  indicador,
  limite
) {

  const mapa =
    new Map();


  registros.forEach(
    r => {

      const clave =
        r[campo] || "SIN DATO";


      const valor =
        valorIndicador(
          r,
          indicador
        );


      if (
        !mapa.has(clave)
      ) {

        mapa.set(
          clave,
          []
        );

      }


      mapa
        .get(clave)
        .push(valor);

    }
  );


  const resultado =
    Array.from(
      mapa.entries()
    )
    .map(
      ([nombre, valores]) => {

        return {

          nombre,

          valor:
            calcular(
              valores,
              indicador
            )

        };

      }
    )
    .sort(
      (a, b) =>
        b.valor - a.valor
    )
    .slice(
      0,
      limite
    );


  return {

    labels:
      resultado.map(
        x => abreviar(
          x.nombre,
          16
        )
      ),

    nombres:
      resultado.map(
        x => x.nombre
      ),

    values:
      resultado.map(
        x => x.valor
      )

  };

}


// ======================================================
// 25. OBTENER INDICADOR
// ======================================================

function valorIndicador(
  r,
  indicador
) {

  switch (indicador) {

    case "COIN":
      return r.coin;

    case "COIN PROM":
      return r.coinProm;

    case "VENTA":
      return r.venta;

    case "VENTA PROM":
      return r.ventaProm;

    case "NETWIN ($)":
      return r.netwin;

    case "T.C":
      return r.tc;

    case "% PAGO":
      return r.pago;

    default:
      return r.coin;

  }

}


// ======================================================
// 26. CALCULAR
// ======================================================

function calcular(
  valores,
  indicador
) {

  if (
    !valores ||
    !valores.length
  ) {

    return 0;

  }


  const config =
    CONFIG_INDICADORES[
      indicador
    ];


  if (
    config?.tipo ===
    "promedio"
  ) {

    return valores.reduce(
      (a, b) => a + b,
      0
    ) / valores.length;

  }


  return valores.reduce(
    (a, b) => a + b,
    0
  );

}


// ======================================================
// 27. GRÁFICO DE LÍNEA
// ======================================================

function crearOActualizarLinea(
  id,
  labels,
  values,
  color,
  indicador
) {

  const canvas =
    document.getElementById(id);


  if (!canvas) {

    return;

  }


  if (
    graficos[id]
  ) {

    graficos[id].data.labels =
      labels;

    graficos[id]
      .data
      .datasets[0]
      .data =
      values;

    graficos[id]
      .data
      .datasets[0]
      .label =
      indicador;

    graficos[id].update(
      "none"
    );

    return;

  }


  graficos[id] =
    new Chart(
      canvas,
      {

        type:
          "line",

        data: {

          labels,

          datasets: [{

            label:
              indicador,

            data:
              values,

            borderColor:
              color,

            backgroundColor:
              color,

            borderWidth:
              2.5,

            pointRadius:
              3,

            pointHoverRadius:
              6,

            tension:
              .25,

            fill:
              false

          }]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          animation:
            false,

          interaction: {

            mode:
              "index",

            intersect:
              false

          },

          plugins: {

            legend: {

              display:
                true

            },

            tooltip: {

              callbacks: {

                label:
                  context =>
                    " " +
                    indicador +
                    ": " +
                    formato(
                      context.raw
                    )

              }

            }

          },

          scales: {

            x: {

              grid: {

                display:
                  false

              }

            },

            y: {

              beginAtZero:
                false,

              grid: {

                color:
                  "#eef2f6"

              },

              ticks: {

                callback:
                  valor =>
                    abreviarNumero(
                      valor
                    )

              }

            }

          }

        }

      }
    );

}


// ======================================================
// 28. GRÁFICO DE BARRAS
// ======================================================

function crearOActualizarBarra(
  id,
  labels,
  values,
  color,
  indicador
) {

  const canvas =
    document.getElementById(id);


  if (!canvas) {

    return;

  }


  if (
    graficos[id]
  ) {

    graficos[id]
      .data.labels =
      labels;

    graficos[id]
      .data
      .datasets[0]
      .data =
      values;

    graficos[id]
      .data
      .datasets[0]
      .label =
      indicador;

    graficos[id].update(
      "none"
    );

    return;

  }


  graficos[id] =
    new Chart(
      canvas,
      {

        type:
          "bar",

        data: {

          labels,

          datasets: [{

            label:
              indicador,

            data:
              values,

            backgroundColor:
              color,

            borderRadius:
              5,

            borderSkipped:
              false

          }]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          animation:
            false,

          plugins: {

            legend: {

              display:
                false

            },

            tooltip: {

              callbacks: {

                title:
                  context => {

                    return context[0]
                      ?.label || "";

                  },

                label:
                  context =>
                    " " +
                    indicador +
                    ": " +
                    formato(
                      context.raw
                    )

              }

            }

          },

          scales: {

            x: {

              grid: {

                display:
                  false

              },

              ticks: {

                maxRotation:
                  0,

                minRotation:
                  0,

                autoSkip:
                  true,

                font: {

                  size:
                    9

                }

              }

            },

            y: {

              beginAtZero:
                true,

              grid: {

                color:
                  "#eef2f6"

              },

              ticks: {

                callback:
                  valor =>
                    abreviarNumero(
                      valor
                    )

              }

            }

          }

        }

      }
    );

}


// ======================================================
// 29. INDICADOR GRANDE
// ======================================================

function actualizarIndicador() {

  const indicador =
    valorFiltro(
      "filtroIndicador"
    ) || "COIN";


  const valores =
    datosFiltrados.map(
      r =>
        valorIndicador(
          r,
          indicador
        )
    );


  const valor =
    calcular(
      valores,
      indicador
    );


  poner(
    "nombreIndicador",
    indicador
  );


  poner(
    "valorIndicador",
    indicador === "% PAGO"
      ? valor.toFixed(2) + "%"
      : formato(valor)
  );

}


// ======================================================
// 30. MAPA
// ======================================================

function actualizarMapa() {

  const salas =
    new Set(
      datosFiltrados.map(
        r =>
          texto(
            r.sala
          )
      )
    );


  const ciudades = {

    "LIMA":
      "puntoLima",

    "TRUJILLO":
      "puntoTrujillo",

    "CHICLAYO":
      "puntoChiclayo",

    "CHINCHA":
      "puntoChincha",

    "PUCALLPA":
      "puntoPucallpa"

  };


  Object.entries(
    ciudades
  )
  .forEach(
    ([ciudad, id]) => {

      const punto =
        document.getElementById(
          id
        );


      if (!punto) {

        return;

      }


      const visible =
        Array.from(
          salas
        )
        .some(
          sala =>
            sala.includes(
              ciudad
            )
        );


      punto.style.opacity =
        visible
          ? "1"
          : ".18";

    }
  );

}


// ======================================================
// 31. TABLA
// ======================================================

function actualizarTabla() {

  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  if (!cuerpo) {

    return;

  }


  /*
    Para evitar que 61,000 filas
    hagan pesada la página,
    mostramos máximo 500 filas.
  */

  const MAX_FILAS =
    500;


  const fragmento =
    document.createDocumentFragment();


  const limite =
    Math.min(
      datosFiltrados.length,
      MAX_FILAS
    );


  for (
    let i = 0;
    i < limite;
    i++
  ) {

    const r =
      datosFiltrados[i];


    const tr =
      document.createElement(
        "tr"
      );


    tr.innerHTML = `

      <td>${escapar(r.marca)}</td>

      <td>${escapar(r.serie)}</td>

      <td>${escapar(r.juego)}</td>

      <td>${formato(r.coin)}</td>

      <td>${formato(r.coinProm)}</td>

      <td>${formato(r.venta)}</td>

      <td>${formato(r.ventaProm)}</td>

      <td>${formato(r.netwin)}</td>

      <td>${formato(r.gplayed)}</td>

      <td>${r.pago.toFixed(2)}%</td>

      <td>${escapar(r.sala)}</td>

      <td>${escapar(r.mes)}</td>

      <td>${escapar(r.anio)}</td>

      <td>${r.tc.toFixed(2)}</td>

    `;


    fragmento.appendChild(
      tr
    );

  }


  cuerpo.innerHTML = "";

  cuerpo.appendChild(
    fragmento
  );

}


// ======================================================
// 32. LIMPIAR
// ======================================================

function limpiarFiltros() {

  [

    "filtroSala",
    "filtroMarca",
    "filtroSerie",
    "filtroJuego",
    "filtroMes",
    "filtroAnio"

  ].forEach(
    id => {

      const elemento =
        document.getElementById(
          id
        );

      if (elemento) {

        elemento.value =
          "";

      }

    }
  );


  document.getElementById(
    "filtroIndicador"
  ).value =
    "COIN";


  datosFiltrados =
    datos;


  actualizarDashboard();

}


// ======================================================
// 33. ABREVIAR NOMBRES DEL EJE X
// ======================================================

function abreviar(
  valor,
  maximo
) {

  const t =
    String(
      valor || ""
    );


  if (
    t.length <= maximo
  ) {

    return t;

  }


  return (
    t.substring(
      0,
      maximo - 3
    ) +
    "..."
  );

}


// ======================================================
// 34. ABREVIAR NÚMEROS
// ======================================================

function abreviarNumero(
  valor
) {

  const n =
    Number(valor) || 0;


  if (
    Math.abs(n) >= 1000000
  ) {

    return (
      (n / 1000000)
        .toFixed(1)
      +
      " M"
    );

  }


  if (
    Math.abs(n) >= 1000
  ) {

    return (
      (n / 1000)
        .toFixed(1)
      +
      " K"
    );

  }


  return n.toLocaleString(
    "es-PE",
    {
      maximumFractionDigits:
        1
    }
  );

}


// ======================================================
// 35. FORMATO
// ======================================================

function formato(
  valor
) {

  return Number(
    valor || 0
  )
  .toLocaleString(
    "es-PE",
    {
      maximumFractionDigits:
        2
    }
  );

}


function formatoEntero(
  valor
) {

  return Number(
    valor || 0
  )
  .toLocaleString(
    "es-PE",
    {
      maximumFractionDigits:
        0
    }
  );

}


// ======================================================
// 36. TEXTO HTML SEGURO
// ======================================================

function escapar(
  valor
) {

  return String(
    valor ?? ""
  )
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
// 37. PONER TEXTO
// ======================================================

function poner(
  id,
  valor
) {

  const elemento =
    document.getElementById(
      id
    );


  if (elemento) {

    elemento.textContent =
      valor;

  }

}


// ======================================================
// 38. ACTUALIZACIÓN AUTOMÁTICA
// ======================================================

setInterval(
  cargarDatos,
  5 * 60 * 1000
);
