/* =========================================================
   CALCULADORA DE PROMEDIOS
   Versión 1.0
========================================================= */


/* =========================================================
   DATOS
========================================================= */

let ramos =
    JSON.parse(
        localStorage.getItem("ramosCalculadora")
    ) || [];

let ramoActualId = null;

let modoEdicion = false;

let tipoEvaluacionActual = null;


/* =========================================================
   GUARDADO
========================================================= */

function guardarDatos() {

    localStorage.setItem(
        "ramosCalculadora",
        JSON.stringify(ramos)
    );

}


/* =========================================================
   UTILIDADES
========================================================= */

function generarId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


function obtenerRamoActual() {

    return ramos.find(
        ramo => ramo.id === ramoActualId
    );

}


function redondear(numero) {

    return Math.round(
        numero * 100
    ) / 100;

}


function formatearNumero(numero) {

    if (
        numero === null ||
        numero === undefined ||
        isNaN(numero)
    ) {

        return "—";

    }

    return Number(numero)
        .toFixed(2)
        .replace(".", ",");

}


function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}


/* =========================================================
   CAMBIO DE PANTALLAS
========================================================= */

function mostrarPantalla(id) {

    document
        .querySelectorAll(".pantalla")
        .forEach(pantalla => {

            pantalla.classList.remove(
                "activa"
            );

        });


    const pantalla =
        document.getElementById(id);


    if (pantalla) {

        pantalla.classList.add(
            "activa"
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   MIS RAMOS
========================================================= */

function renderizarRamos() {

    const contenedor =
        document.getElementById(
            "lista-ramos"
        );


    if (!contenedor) return;


    if (!ramos.length) {

        contenedor.innerHTML = `

            <div class="sin-ramos">

                <p>
                    Todavía no tienes ramos guardados.
                </p>

                <span>
                    Agrega tu primer ramo para comenzar.
                </span>

            </div>

        `;

        return;

    }


    contenedor.innerHTML = "";


    ramos.forEach(ramo => {

        const promedio =
            calcularPromedioRamo(ramo);


        const card =
            document.createElement("div");


        card.className =
            "ramo-card";


        card.innerHTML = `

            <h3>
                ${escaparHTML(ramo.nombre)}
            </h3>

            <p>
                ${escaparHTML(
                    obtenerEstadoRamo(ramo)
                )}
            </p>

            <div class="ramo-promedio">

                ${
                    promedio === null
                        ? "—"
                        : formatearNumero(promedio)
                }

            </div>

        `;


        card.addEventListener(
            "click",
            () => abrirRamo(ramo.id)
        );


        contenedor.appendChild(card);

    });

}


/* =========================================================
   CREAR RAMO
========================================================= */

function nuevoRamo() {

    modoEdicion = false;

    ramoActualId = null;


    document.getElementById(
        "nombre-nuevo-ramo"
    ).value = "";


    mostrarPantalla(
        "pantalla-nuevo-ramo"
    );

}


function guardarNombreRamo() {

    const input =
        document.getElementById(
            "nombre-nuevo-ramo"
        );


    const nombre =
        input.value.trim();


    if (!nombre) {

        alert(
            "Escribe el nombre del ramo."
        );

        input.focus();

        return;

    }


    /*
        Si estamos editando, solamente
        actualizamos el nombre.
    */

    if (modoEdicion) {

        const ramo =
            obtenerRamoActual();


        if (!ramo) return;


        ramo.nombre =
            nombre;


        guardarDatos();


        prepararPantallaEvaluaciones();


        mostrarPantalla(
            "pantalla-evaluaciones"
        );


        return;

    }


    ramoActualId =
        generarId();


    const nuevoRamo = {

        id:
            ramoActualId,

        nombre,

        tieneLaboratorio:
            false,

        porcentajeTeoria:
            100,

        porcentajeLaboratorio:
            0,

        evaluaciones:
            [],

        evaluacionesTeoria:
            [],

        evaluacionesLaboratorio:
            [],

        notaMinima:
            4,

        tienePAR:
            false,

        porcentajePresentacion:
            70,

        porcentajeExamen:
            30,

        objetivo:
            null

    };


    ramos.push(
        nuevoRamo
    );


    guardarDatos();


    mostrarPantalla(
        "pantalla-laboratorio"
    );

}


/* =========================================================
   LABORATORIO
========================================================= */

function volverNuevoRamo() {

    mostrarPantalla(
        "pantalla-nuevo-ramo"
    );

}


function seleccionarLaboratorio(
    tieneLaboratorio
) {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    ramo.tieneLaboratorio =
        tieneLaboratorio;


    if (tieneLaboratorio) {

        mostrarPantalla(
            "pantalla-division"
        );

    } else {

        ramo.porcentajeTeoria =
            100;

        ramo.porcentajeLaboratorio =
            0;


        prepararPantallaEvaluaciones();


        mostrarPantalla(
            "pantalla-evaluaciones"
        );

    }

}


function volverLaboratorio() {

    mostrarPantalla(
        "pantalla-laboratorio"
    );

}


function guardarDivision() {

    const teoria =
        Number(
            document.getElementById(
                "porcentaje-teoria"
            ).value
        );


    const laboratorio =
        Number(
            document.getElementById(
                "porcentaje-laboratorio"
            ).value
        );


    const mensaje =
        document.getElementById(
            "mensaje-division"
        );


    const total =
        teoria + laboratorio;


    if (
        isNaN(teoria) ||
        isNaN(laboratorio)
    ) {

        mensaje.className =
            "mensaje-validacion mensaje-peligro";

        mensaje.textContent =
            "Ingresa ambos porcentajes.";

        return;

    }


    if (
        teoria < 0 ||
        laboratorio < 0
    ) {

        mensaje.className =
            "mensaje-validacion mensaje-peligro";

        mensaje.textContent =
            "Los porcentajes no pueden ser negativos.";

        return;

    }


    if (total !== 100) {

        mensaje.className =
            "mensaje-validacion mensaje-advertencia";

        mensaje.textContent =
            `La división suma ${total}%. Debe sumar 100%.`;

        return;

    }


    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    ramo.porcentajeTeoria =
        teoria;

    ramo.porcentajeLaboratorio =
        laboratorio;


    guardarDatos();


    prepararPantallaEvaluaciones();


    mostrarPantalla(
        "pantalla-evaluaciones"
    );

}


/* =========================================================
   CONFIGURACIÓN DE EVALUACIONES
========================================================= */

function prepararPantallaEvaluaciones() {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    const bloqueNormal =
        document.getElementById(
            "bloque-evaluaciones"
        );


    const bloqueTeoria =
        document.getElementById(
            "bloque-teoria"
        );


    const bloqueLaboratorio =
        document.getElementById(
            "bloque-laboratorio"
        );


    if (ramo.tieneLaboratorio) {

        bloqueNormal.classList.add(
            "oculto"
        );

        bloqueTeoria.classList.remove(
            "oculto"
        );

        bloqueLaboratorio.classList.remove(
            "oculto"
        );


        renderizarEvaluaciones(
            ramo.evaluacionesTeoria,
            "lista-teoria"
        );


        renderizarEvaluaciones(
            ramo.evaluacionesLaboratorio,
            "lista-laboratorio"
        );


        actualizarTotalPonderaciones(
            ramo.evaluacionesTeoria,
            "total-teoria"
        );


        actualizarTotalPonderaciones(
            ramo.evaluacionesLaboratorio,
            "total-laboratorio"
        );

    } else {

        bloqueNormal.classList.remove(
            "oculto"
        );

        bloqueTeoria.classList.add(
            "oculto"
        );

        bloqueLaboratorio.classList.add(
            "oculto"
        );


        renderizarEvaluaciones(
            ramo.evaluaciones,
            "lista-evaluaciones"
        );


        actualizarTotalPonderaciones(
            ramo.evaluaciones,
            "total-ponderaciones"
        );

    }


    document.getElementById(
        "nota-minima"
    ).value =
        ramo.notaMinima ?? 4;

}


/* =========================================================
   AGREGAR EVALUACIÓN
========================================================= */

function agregarEvaluacion(
    tipo = null
) {

    tipoEvaluacionActual =
        tipo;


    document.getElementById(
        "nombre-evaluacion"
    ).value = "";


    document.getElementById(
        "nota-evaluacion"
    ).value = "";


    document.getElementById(
        "ponderacion-evaluacion"
    ).value = "";


    document.getElementById(
        "nota-pendiente"
    ).checked = false;


    const radioNo =
        document.querySelector(
            'input[name="tiene-subnotas"][value="no"]'
        );


    if (radioNo) {

        radioNo.checked = true;

    }


    document.getElementById(
        "seccion-subnotas"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "lista-subnotas"
    ).innerHTML = "";


    document.getElementById(
        "total-subnotas"
    ).textContent = "";


    cambiarEstadoNota();


    document.getElementById(
        "modal-evaluacion"
    ).classList.remove(
        "oculto"
    );

}


function cerrarModalEvaluacion() {

    document.getElementById(
        "modal-evaluacion"
    ).classList.add(
        "oculto"
    );

}


function cambiarEstadoNota() {

    const pendiente =
        document.getElementById(
            "nota-pendiente"
        ).checked;


    const nota =
        document.getElementById(
            "nota-evaluacion"
        );


    nota.disabled =
        pendiente;


    if (pendiente) {

        nota.value = "";

    }

}


/* =========================================================
   SUBNOTAS
========================================================= */

function mostrarSubnotas(
    mostrar
) {

    const seccion =
        document.getElementById(
            "seccion-subnotas"
        );


    if (mostrar) {

        seccion.classList.remove(
            "oculto"
        );

    } else {

        seccion.classList.add(
            "oculto"
        );


        document.getElementById(
            "lista-subnotas"
        ).innerHTML = "";


        document.getElementById(
            "total-subnotas"
        ).textContent = "";

    }

}


function agregarSubnota() {

    const lista =
        document.getElementById(
            "lista-subnotas"
        );


    const div =
        document.createElement("div");


    div.className =
        "evaluacion-card";


    div.dataset.id =
        generarId();


    div.innerHTML = `

        <label>
            Nombre
        </label>

        <input
            type="text"
            class="subnota-nombre"
            placeholder="Ej: Prueba escrita"
        >


        <label>
            Nota
        </label>

        <input
            type="number"
            class="subnota-nota"
            placeholder="Ej: 5,5"
            min="1"
            max="7"
            step="0.1"
        >


        <label class="checkbox">

            <input
                type="checkbox"
                class="subnota-pendiente"
            >

            Aún no tengo esta nota

        </label>


        <label>
            Ponderación
        </label>

        <input
            type="number"
            class="subnota-ponderacion"
            placeholder="Ej: 50"
            min="0"
            max="100"
        >

    `;


    lista.appendChild(
        div
    );


    const ponderacion =
        div.querySelector(
            ".subnota-ponderacion"
        );


    ponderacion.addEventListener(
        "input",
        actualizarTotalSubnotas
    );


    actualizarTotalSubnotas();

}


function actualizarTotalSubnotas() {

    const elementos =
        document.querySelectorAll(
            "#lista-subnotas .evaluacion-card"
        );


    let total = 0;


    elementos.forEach(
        elemento => {

            const valor =
                Number(
                    elemento.querySelector(
                        ".subnota-ponderacion"
                    ).value
                );


            if (!isNaN(valor)) {

                total += valor;

            }

        }
    );


    const mensaje =
        document.getElementById(
            "total-subnotas"
        );


    if (!mensaje) return;


    if (total === 100) {

        mensaje.className =
            "mensaje-validacion mensaje-exito";

        mensaje.textContent =
            "Ponderación configurada: 100% ✓";

    } else if (total < 100) {

        mensaje.className =
            "mensaje-validacion mensaje-advertencia";

        mensaje.textContent =
            `Ponderación configurada: ${total}%. Aún falta asignar ${100 - total}%.`;

    } else {

        mensaje.className =
            "mensaje-validacion mensaje-peligro";

        mensaje.textContent =
            `Ponderación configurada: ${total}%. Revisa las ponderaciones ingresadas.`;

    }

}


/* =========================================================
   GUARDAR EVALUACIÓN
========================================================= */

function guardarEvaluacion() {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    const nombre =
        document.getElementById(
            "nombre-evaluacion"
        ).value.trim();


    const pendiente =
        document.getElementById(
            "nota-pendiente"
        ).checked;


    const nota =
        pendiente
            ? null
            : Number(
                document.getElementById(
                    "nota-evaluacion"
                ).value
            );


    const ponderacion =
        Number(
            document.getElementById(
                "ponderacion-evaluacion"
            ).value
        );


    if (!nombre) {

        alert(
            "Escribe el nombre de la evaluación."
        );

        return;

    }


    if (
        !pendiente &&
        (
            isNaN(nota) ||
            nota < 1 ||
            nota > 7
        )
    ) {

        alert(
            "Ingresa una nota válida entre 1,0 y 7,0."
        );

        return;

    }


    if (
        isNaN(ponderacion) ||
        ponderacion <= 0 ||
        ponderacion > 100
    ) {

        alert(
            "Ingresa una ponderación válida."
        );

        return;

    }


    const radioSubnotas =
        document.querySelector(
            'input[name="tiene-subnotas"]:checked'
        );


    const tieneSubnotas =
        radioSubnotas &&
        radioSubnotas.value === "si";


    let subnotas = [];


    if (tieneSubnotas) {

        const elementos =
            document.querySelectorAll(
                "#lista-subnotas .evaluacion-card"
            );


        if (!elementos.length) {

            alert(
                "Agrega al menos una subnota."
            );

            return;

        }


        let totalSubnotas = 0;


        for (
            const elemento of elementos
        ) {

            const nombreSubnota =
                elemento.querySelector(
                    ".subnota-nombre"
                ).value.trim();


            const pendienteSubnota =
                elemento.querySelector(
                    ".subnota-pendiente"
                ).checked;


            const notaSubnota =
                pendienteSubnota
                    ? null
                    : Number(
                        elemento.querySelector(
                            ".subnota-nota"
                        ).value
                    );


            const ponderacionSubnota =
                Number(
                    elemento.querySelector(
                        ".subnota-ponderacion"
                    ).value
                );


            if (!nombreSubnota) {

                alert(
                    "Todas las subnotas necesitan un nombre."
                );

                return;

            }


            if (
                !pendienteSubnota &&
                (
                    isNaN(notaSubnota) ||
                    notaSubnota < 1 ||
                    notaSubnota > 7
                )
            ) {

                alert(
                    "Hay una subnota con una nota inválida."
                );

                return;

            }


            if (
                isNaN(ponderacionSubnota) ||
                ponderacionSubnota <= 0 ||
                ponderacionSubnota > 100
            ) {

                alert(
                    "Hay una subnota con una ponderación inválida."
                );

                return;

            }


            totalSubnotas +=
                ponderacionSubnota;


            subnotas.push({

                id:
                    generarId(),

                nombre:
                    nombreSubnota,

                nota:
                    notaSubnota,

                pendiente:
                    pendienteSubnota,

                ponderacion:
                    ponderacionSubnota

            });

        }


        if (
            totalSubnotas !== 100
        ) {

            alert(
                `Las ponderaciones de las subnotas deben sumar 100%. Actualmente suman ${totalSubnotas}%.`
            );

            return;

        }

    }


    const evaluacion = {

        id:
            generarId(),

        nombre,

        nota,

        pendiente,

        ponderacion,

        tieneSubnotas,

        subnotas

    };


    if (ramo.tieneLaboratorio) {

        if (
            tipoEvaluacionActual ===
            "teoria"
        ) {

            ramo.evaluacionesTeoria.push(
                evaluacion
            );

        } else {

            ramo.evaluacionesLaboratorio.push(
                evaluacion
            );

        }

    } else {

        ramo.evaluaciones.push(
            evaluacion
        );

    }


    guardarDatos();


    cerrarModalEvaluacion();


    prepararPantallaEvaluaciones();

}


/* =========================================================
   RENDERIZAR EVALUACIONES
========================================================= */

function renderizarEvaluaciones(
    evaluaciones,
    idContenedor
) {

    const contenedor =
        document.getElementById(
            idContenedor
        );


    if (!contenedor) return;


    contenedor.innerHTML = "";


    if (!evaluaciones.length) {

        contenedor.innerHTML = `

            <div class="sin-ramos">

                <p>
                    Todavía no hay evaluaciones.
                </p>

                <span>
                    Agrega una para comenzar.
                </span>

            </div>

        `;

        return;

    }


    evaluaciones.forEach(
        evaluacion => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "evaluacion-card";


            const nota =
                calcularNotaEvaluacion(
                    evaluacion
                );


            const notaTexto =
                nota === null
                    ? "Pendiente"
                    : formatearNumero(
                        nota
                    );


            card.innerHTML = `

                <h3>
                    ${escaparHTML(
                        evaluacion.nombre
                    )}
                </h3>

                <div class="evaluacion-info">

                    <span>
                        Nota:
                        <strong class="${
                            nota === null
                                ? "pendiente"
                                : ""
                        }">
                            ${notaTexto}
                        </strong>
                    </span>

                    <span>
                        Ponderación:
                        <strong>
                            ${evaluacion.ponderacion}%
                        </strong>
                    </span>

                </div>

            `;


            contenedor.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   PONDERACIONES
========================================================= */

function actualizarTotalPonderaciones(
    evaluaciones,
    idMensaje
) {

    const mensaje =
        document.getElementById(
            idMensaje
        );


    if (!mensaje) return;


    const total =
        evaluaciones.reduce(
            (
                suma,
                evaluacion
            ) =>
                suma +
                Number(
                    evaluacion.ponderacion
                ),
            0
        );


    if (total === 100) {

        mensaje.className =
            "mensaje-validacion mensaje-exito";

        mensaje.textContent =
            "Ponderación configurada: 100% ✓";

    } else if (total < 100) {

        mensaje.className =
            "mensaje-validacion mensaje-advertencia";

        mensaje.textContent =
            `Ponderación configurada: ${total}%. Aún falta asignar ${100 - total}%.`;

    } else {

        mensaje.className =
            "mensaje-validacion mensaje-peligro";

        mensaje.textContent =
            `Ponderación configurada: ${total}%. Revisa las ponderaciones ingresadas.`;

    }

}


/* =========================================================
   CÁLCULO DE UNA EVALUACIÓN
========================================================= */

function calcularNotaEvaluacion(
    evaluacion
) {

    if (
        evaluacion.pendiente
    ) {

        return null;

    }


    if (
        !evaluacion.tieneSubnotas ||
        !evaluacion.subnotas ||
        !evaluacion.subnotas.length
    ) {

        return evaluacion.nota;

    }


    const disponibles =
        evaluacion.subnotas.filter(
            subnota =>
                !subnota.pendiente &&
                subnota.nota !== null
        );


    if (
        disponibles.length !==
        evaluacion.subnotas.length
    ) {

        return null;

    }


    let total = 0;


    evaluacion.subnotas.forEach(
        subnota => {

            total +=
                subnota.nota *
                (
                    subnota.ponderacion /
                    100
                );

        }
    );


    return redondear(total);

}


/* =========================================================
   PROMEDIO DE UNA LISTA
========================================================= */

function calcularPromedioLista(
    evaluaciones
) {

    if (
        !evaluaciones.length
    ) {

        return null;

    }


    let total = 0;

    let ponderacionDisponible = 0;


    evaluaciones.forEach(
        evaluacion => {

            const nota =
                calcularNotaEvaluacion(
                    evaluacion
                );


            if (nota !== null) {

                total +=
                    nota *
                    (
                        evaluacion.ponderacion /
                        100
                    );


                ponderacionDisponible +=
                    Number(
                        evaluacion.ponderacion
                    );

            }

        }
    );


    if (
        ponderacionDisponible === 0
    ) {

        return null;

    }


    return redondear(
        total *
        (
            100 /
            ponderacionDisponible
        )
    );

}


/* =========================================================
   PROMEDIO DEL RAMO
========================================================= */

function calcularPromedioRamo(
    ramo
) {

    if (
        ramo.tieneLaboratorio
    ) {

        const teoria =
            calcularPromedioLista(
                ramo.evaluacionesTeoria
            );


        const laboratorio =
            calcularPromedioLista(
                ramo.evaluacionesLaboratorio
            );


        let total = 0;

        let peso = 0;


        if (teoria !== null) {

            total +=
                teoria *
                (
                    ramo.porcentajeTeoria /
                    100
                );

            peso +=
                ramo.porcentajeTeoria;

        }


        if (laboratorio !== null) {

            total +=
                laboratorio *
                (
                    ramo.porcentajeLaboratorio /
                    100
                );

            peso +=
                ramo.porcentajeLaboratorio;

        }


        if (!peso) {

            return null;

        }


        return redondear(
            total *
            (
                100 /
                peso
            )
        );

    }


    return calcularPromedioLista(
        ramo.evaluaciones
    );

}


/* =========================================================
   RESUMEN DEL RAMO
========================================================= */

function abrirRamo(id) {

    ramoActualId =
        id;

    modoEdicion =
        false;


    renderizarResumenRamo();


    mostrarPantalla(
        "pantalla-ramo"
    );

}


function renderizarResumenRamo() {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    document.getElementById(
        "titulo-ramo"
    ).textContent =
        ramo.nombre;


    const promedio =
        calcularPromedioRamo(
            ramo
        );


    document.getElementById(
        "promedio-actual"
    ).textContent =
        promedio === null
            ? "—"
            : formatearNumero(
                promedio
            );


    document.getElementById(
        "estado-ramo"
    ).textContent =
        obtenerEstadoRamo(
            ramo
        );


    renderizarResumenEvaluaciones(
        ramo
    );


    calcularQueNecesitas(
        ramo
    );


    cargarObjetivo(
        ramo
    );


    cargarConfiguracionExamen();


    prepararPAR(
        ramo
    );

}


/* =========================================================
   RESUMEN DE EVALUACIONES
========================================================= */

function renderizarResumenEvaluaciones(
    ramo
) {

    const contenedor =
        document.getElementById(
            "resumen-evaluaciones"
        );


    if (!contenedor) return;


    contenedor.innerHTML = "";


    const grupos = [];


    if (ramo.tieneLaboratorio) {

        grupos.push({

            titulo:
                "Teoría",

            evaluaciones:
                ramo.evaluacionesTeoria

        });


        grupos.push({

            titulo:
                "Laboratorio",

            evaluaciones:
                ramo.evaluacionesLaboratorio

        });

    } else {

        grupos.push({

            titulo:
                null,

            evaluaciones:
                ramo.evaluaciones

        });

    }


    grupos.forEach(
        grupo => {

            if (grupo.titulo) {

                const titulo =
                    document.createElement(
                        "h3"
                    );


                titulo.textContent =
                    grupo.titulo;


                contenedor.appendChild(
                    titulo
                );

            }


            grupo.evaluaciones.forEach(
                evaluacion => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "evaluacion-card";


                    const nota =
                        calcularNotaEvaluacion(
                            evaluacion
                        );


                    const notaTexto =
                        nota === null
                            ? "Pendiente"
                            : formatearNumero(
                                nota
                            );


                    card.innerHTML = `

                        <h3>
                            ${escaparHTML(
                                evaluacion.nombre
                            )}
                        </h3>

                        <div class="evaluacion-info">

                            <span>
                                Nota:
                                <strong class="${
                                    nota === null
                                        ? "pendiente"
                                        : ""
                                }">
                                    ${notaTexto}
                                </strong>
                            </span>

                            <span>
                                Ponderación:
                                <strong>
                                    ${evaluacion.ponderacion}%
                                </strong>
                            </span>

                        </div>

                    `;


                    contenedor.appendChild(
                        card
                    );

                }
            );

        }
    );

}


/* =========================================================
   EVALUACIONES PENDIENTES
========================================================= */

function obtenerEvaluacionesRamo(
    ramo
) {

    if (
        !ramo.tieneLaboratorio
    ) {

        return ramo.evaluaciones;

    }


    return [
        ...ramo.evaluacionesTeoria,
        ...ramo.evaluacionesLaboratorio
    ];

}


function obtenerEvaluacionesPendientes(
    ramo
) {

    return obtenerEvaluacionesRamo(
        ramo
    ).filter(
        evaluacion =>
            calcularNotaEvaluacion(
                evaluacion
            ) === null
    );

}


/* =========================================================
   QUÉ NECESITAS PARA APROBAR
========================================================= */

function calcularQueNecesitas(
    ramo
) {

    const contenedor =
        document.getElementById(
            "resultado-aprobar"
        );


    if (!contenedor) return;


    const objetivo =
        Number(
            ramo.notaMinima
        );


    const promedio =
        calcularPromedioRamo(
            ramo
        );


    const pendientes =
        obtenerEvaluacionesPendientes(
            ramo
        );


    if (!pendientes.length) {

        if (
            promedio !== null &&
            promedio >= objetivo
        ) {

            contenedor.innerHTML = `

                <div class="mensaje-exito">

                    ¡Lo lograste!

                    <br>

                    Tu promedio final es
                    <strong>
                        ${formatearNumero(
                            promedio
                        )}
                    </strong>.

                </div>

            `;

        } else {

            contenedor.innerHTML = `

                <div class="mensaje-peligro">

                    Esta vez no alcanzaste el objetivo.

                    <br>

                    Tu promedio final es
                    <strong>
                        ${
                            promedio === null
                                ? "—"
                                : formatearNumero(
                                    promedio
                                )
                        }
                    </strong>.

                </div>

            `;

        }

        return;

    }


    const resultado =
        calcularNotaNecesaria(
            ramo,
            objetivo
        );


    if (
        resultado === null
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                Aún tienes evaluaciones pendientes.

            </div>

        `;

        return;

    }


    if (
        resultado <= 1
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-exito">

                Con tus notas actuales,
                ya tienes el promedio necesario
                para aprobar.

            </div>

        `;

        return;

    }


    if (
        resultado > 7
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                Con las evaluaciones pendientes,
                no es posible alcanzar
                el promedio mínimo de
                ${formatearNumero(
                    objetivo
                )}
                solamente con ellas.

            </div>

        `;

        return;

    }


    contenedor.innerHTML = `

        <p>

            Necesitas obtener aproximadamente
            <strong>
                ${formatearNumero(
                    resultado
                )}
            </strong>

            en las evaluaciones pendientes
            para alcanzar

            <strong>
                ${formatearNumero(
                    objetivo
                )}
            </strong>.

        </p>

    `;

}


function calcularNotaNecesaria(
    ramo,
    objetivo
) {

    /*
        Para ramos sin laboratorio,
        el cálculo utiliza directamente
        las ponderaciones.

        Para ramos con laboratorio,
        se calcula respetando la división
        teoría/laboratorio.
    */

    if (
        !ramo.tieneLaboratorio
    ) {

        return calcularNotaNecesariaLista(
            ramo.evaluaciones,
            objetivo
        );

    }


    const teoria =
        calcularNotaNecesariaLista(
            ramo.evaluacionesTeoria,
            objetivo
        );


    const laboratorio =
        calcularNotaNecesariaLista(
            ramo.evaluacionesLaboratorio,
            objetivo
        );


    const promedioTeoria =
        calcularPromedioLista(
            ramo.evaluacionesTeoria
        );


    const promedioLaboratorio =
        calcularPromedioLista(
            ramo.evaluacionesLaboratorio
        );


    const pendientesTeoria =
        obtenerPendientesLista(
            ramo.evaluacionesTeoria
        );


    const pendientesLaboratorio =
        obtenerPendientesLista(
            ramo.evaluacionesLaboratorio
        );


    /*
        Si no hay pendientes en ninguno
        de los dos bloques, no hay cálculo
        que realizar.
    */

    if (
        !pendientesTeoria.length &&
        !pendientesLaboratorio.length
    ) {

        return null;

    }


    /*
        Si hay pendientes solamente en teoría.
    */

    if (
        pendientesTeoria.length &&
        !pendientesLaboratorio.length
    ) {

        const objetivoTeoria =
            (
                objetivo -
                (
                    promedioLaboratorio *
                    ramo.porcentajeLaboratorio /
                    100
                )
            ) /
            (
                ramo.porcentajeTeoria /
                100
            );


        return calcularNotaNecesariaLista(
            ramo.evaluacionesTeoria,
            objetivoTeoria
        );

    }


    /*
        Si hay pendientes solamente
        en laboratorio.
    */

    if (
        !pendientesTeoria.length &&
        pendientesLaboratorio.length
    ) {

        const objetivoLaboratorio =
            (
                objetivo -
                (
                    promedioTeoria *
                    ramo.porcentajeTeoria /
                    100
                )
            ) /
            (
                ramo.porcentajeLaboratorio /
                100
            );


        return calcularNotaNecesariaLista(
            ramo.evaluacionesLaboratorio,
            objetivoLaboratorio
        );

    }


    /*
        Si existen pendientes tanto
        en teoría como en laboratorio,
        mostramos un cálculo aproximado
        considerando que se obtiene la
        misma nota en todas las pendientes.
    */

    let aporteActual = 0;

    let pesoPendiente = 0;


    const procesarLista =
        (
            lista,
            pesoBloque
        ) => {

            lista.forEach(
                evaluacion => {

                    const nota =
                        calcularNotaEvaluacion(
                            evaluacion
                        );


                    const peso =
                        Number(
                            evaluacion.ponderacion
                        ) /
                        100 *
                        (
                            pesoBloque /
                            100
                        );


                    if (
                        nota === null
                    ) {

                        pesoPendiente +=
                            peso;

                    } else {

                        aporteActual +=
                            nota *
                            peso;

                    }

                }
            );

        };


    procesarLista(
        ramo.evaluacionesTeoria,
        ramo.porcentajeTeoria
    );


    procesarLista(
        ramo.evaluacionesLaboratorio,
        ramo.porcentajeLaboratorio
    );


    if (
        pesoPendiente <= 0
    ) {

        return null;

    }


    return redondear(
        (
            objetivo -
            aporteActual
        ) /
        pesoPendiente
    );

}


function calcularNotaNecesariaLista(
    evaluaciones,
    objetivo
) {

    if (
        !evaluaciones.length
    ) {

        return null;

    }


    let aporteActual = 0;

    let pesoPendiente = 0;


    evaluaciones.forEach(
        evaluacion => {

            const nota =
                calcularNotaEvaluacion(
                    evaluacion
                );


            const peso =
                Number(
                    evaluacion.ponderacion
                ) /
                100;


            if (
                nota === null
            ) {

                pesoPendiente +=
                    peso;

            } else {

                aporteActual +=
                    nota *
                    peso;

            }

        }
    );


    if (
        pesoPendiente <= 0
    ) {

        return null;

    }


    return redondear(
        (
            objetivo -
            aporteActual
        ) /
        pesoPendiente
    );

}


function obtenerPendientesLista(
    evaluaciones
) {

    return evaluaciones.filter(
        evaluacion =>
            calcularNotaEvaluacion(
                evaluacion
            ) === null
    );

}


/* =========================================================
   OBJETIVO PERSONALIZADO
========================================================= */

function cambiarObjetivo() {

    const opcion =
        document.querySelector(
            'input[name="objetivo"]:checked'
        );


    const campo =
        document.getElementById(
            "campo-otro-objetivo"
        );


    if (
        opcion &&
        opcion.value === "otro"
    ) {

        campo.classList.remove(
            "oculto"
        );


        calcularObjetivo();

    } else {

        campo.classList.add(
            "oculto"
        );


        document.getElementById(
            "resultado-objetivo"
        ).innerHTML = "";

    }

}


function calcularObjetivo() {

    const ramo =
        obtenerRamoActual();


    const objetivo =
        Number(
            document.getElementById(
                "otro-objetivo"
            ).value
        );


    const contenedor =
        document.getElementById(
            "resultado-objetivo"
        );


    if (
        !ramo ||
        isNaN(objetivo) ||
        objetivo < 1 ||
        objetivo > 7
    ) {

        contenedor.innerHTML = "";

        return;

    }


    const resultado =
        calcularNotaNecesaria(
            ramo,
            objetivo
        );


    if (
        resultado === null
    ) {

        contenedor.innerHTML =
            "No hay evaluaciones pendientes.";

        return;

    }


    if (
        resultado <= 1
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-exito">

                Ya tienes lo necesario
                para alcanzar ese promedio.

            </div>

        `;

        return;

    }


    if (
        resultado > 7
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                Con las evaluaciones pendientes
                no es posible alcanzar
                ese promedio.

            </div>

        `;

        return;

    }


    contenedor.innerHTML = `

        Necesitas aproximadamente
        <strong>
            ${formatearNumero(
                resultado
            )}
        </strong>

        en las evaluaciones pendientes.

    `;

}


function cargarObjetivo() {

    const minimo =
        document.querySelector(
            'input[name="objetivo"][value="minimo"]'
        );


    if (minimo) {

        minimo.checked = true;

    }


    document.getElementById(
        "campo-otro-objetivo"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "resultado-objetivo"
    ).innerHTML = "";


    document.getElementById(
        "otro-objetivo"
    ).value = "";

}


/* =========================================================
   PAR
========================================================= */

function mostrarPAR(
    mostrar
) {

    const contenido =
        document.getElementById(
            "contenido-par"
        );


    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    ramo.tienePAR =
        mostrar;


    guardarDatos();


    if (mostrar) {

        contenido.classList.remove(
            "oculto"
        );


        prepararPAR(
            ramo
        );

    } else {

        contenido.classList.add(
            "oculto"
        );


        document.getElementById(
            "resultado-par"
        ).innerHTML = "";

    }

}


function prepararPAR(
    ramo
) {

    const radios =
        document.querySelectorAll(
            'input[name="tiene-par"]'
        );


    radios.forEach(
        radio => {

            radio.checked =
                radio.value ===
                (
                    ramo.tienePAR
                        ? "si"
                        : "no"
                );

        }
    );


    const contenido =
        document.getElementById(
            "contenido-par"
        );


    if (
        !ramo.tienePAR
    ) {

        contenido.classList.add(
            "oculto"
        );

        return;

    }


    contenido.classList.remove(
        "oculto"
    );


    const evaluaciones =
        obtenerEvaluacionesRamo(
            ramo
        ).filter(
            evaluacion =>
                calcularNotaEvaluacion(
                    evaluacion
                ) !== null
        );


    const contenedor =
        document.getElementById(
            "notas-reemplazables"
        );


    contenedor.innerHTML = "";


    document.getElementById(
        "resultado-par"
    ).innerHTML = "";


    if (
        !evaluaciones.length
    ) {

        contenedor.innerHTML =
            "<p>Aún no tienes notas disponibles para reemplazar.</p>";

        return;

    }


    evaluaciones.forEach(
        evaluacion => {

            const nota =
                calcularNotaEvaluacion(
                    evaluacion
                );


            const boton =
                document.createElement(
                    "button"
                );


            boton.className =
                "opcion";


            boton.textContent =
                `${evaluacion.nombre} — ${formatearNumero(nota)}`;


            boton.addEventListener(
                "click",
                () =>
                    calcularPAR(
                        evaluacion.id
                    )
            );


            contenedor.appendChild(
                boton
            );

        }
    );

}


function calcularPAR(
    evaluacionId
) {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    const evaluaciones =
        obtenerEvaluacionesRamo(
            ramo
        );


    const seleccionada =
        evaluaciones.find(
            evaluacion =>
                evaluacion.id ===
                evaluacionId
        );


    if (!seleccionada) return;


    const notaActual =
        calcularNotaEvaluacion(
            seleccionada
        );


    const objetivo =
        Number(
            ramo.notaMinima
        );


    /*
        Este cálculo corresponde a ramos
        sin laboratorio.
    */

    if (
        !ramo.tieneLaboratorio
    ) {

        let aporteSinNota = 0;


        evaluaciones.forEach(
            evaluacion => {

                if (
                    evaluacion.id ===
                    evaluacionId
                ) return;


                const nota =
                    calcularNotaEvaluacion(
                        evaluacion
                    );


                if (nota !== null) {

                    aporteSinNota +=
                        nota *
                        (
                            evaluacion.ponderacion /
                            100
                        );

                }

            }
        );


        const pesoNota =
            seleccionada.ponderacion /
            100;


        const notaNecesaria =
            (
                objetivo -
                aporteSinNota
            ) /
            pesoNota;


        mostrarResultadoPAR(
            seleccionada,
            notaActual,
            notaNecesaria,
            objetivo
        );


        return;

    }


    /*
        Para laboratorio calculamos
        respetando teoría/laboratorio.
    */

    let aporteSinNota = 0;

    let pesoSeleccionada = 0;


    const procesar =
        (
            lista,
            pesoBloque
        ) => {

            lista.forEach(
                evaluacion => {

                    const peso =
                        (
                            evaluacion.ponderacion /
                            100
                        ) *
                        (
                            pesoBloque /
                            100
                        );


                    if (
                        evaluacion.id ===
                        evaluacionId
                    ) {

                        pesoSeleccionada =
                            peso;

                        return;

                    }


                    const nota =
                        calcularNotaEvaluacion(
                            evaluacion
                        );


                    if (nota !== null) {

                        aporteSinNota +=
                            nota *
                            peso;

                    }

                }
            );

        };


    procesar(
        ramo.evaluacionesTeoria,
        ramo.porcentajeTeoria
    );


    procesar(
        ramo.evaluacionesLaboratorio,
        ramo.porcentajeLaboratorio
    );


    const notaNecesaria =
        (
            objetivo -
            aporteSinNota
        ) /
        pesoSeleccionada;


    mostrarResultadoPAR(
        seleccionada,
        notaActual,
        notaNecesaria,
        objetivo
    );

}


function mostrarResultadoPAR(
    seleccionada,
    notaActual,
    notaNecesaria,
    objetivo
) {

    const contenedor =
        document.getElementById(
            "resultado-par"
        );


    if (
        notaNecesaria <= 1
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-exito">

                Con la PAR puedes alcanzar
                el promedio mínimo incluso
                con una nota mínima.

            </div>

        `;

        return;

    }


    if (
        notaNecesaria > 7
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                La PAR por sí sola no sería
                suficiente para alcanzar
                ${formatearNumero(
                    objetivo
                )}.

            </div>

        `;

        return;

    }


    contenedor.innerHTML = `

        <div class="mensaje-exito">

            Para alcanzar
            <strong>
                ${formatearNumero(
                    objetivo
                )}
            </strong>

            reemplazando
            <strong>
                ${escaparHTML(
                    seleccionada.nombre
                )}
            </strong>

            (${formatearNumero(
                notaActual
            )}),

            necesitarías aproximadamente:

            <br><br>

            <strong>
                ${formatearNumero(
                    notaNecesaria
                )}
            </strong>

            en la PAR.

        </div>

    `;

}


/* =========================================================
   EXAMEN
========================================================= */

function cargarConfiguracionExamen() {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    document.getElementById(
        "porcentaje-presentacion"
    ).value =
        ramo.porcentajePresentacion;


    document.getElementById(
        "porcentaje-examen"
    ).value =
        ramo.porcentajeExamen;


    calcularExamen();

}


function calcularExamen() {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    const presentacion =
        calcularPromedioRamo(
            ramo
        );


    const porcentajePresentacion =
        Number(
            document.getElementById(
                "porcentaje-presentacion"
            ).value
        );


    const porcentajeExamen =
        Number(
            document.getElementById(
                "porcentaje-examen"
            ).value
        );


    const contenedor =
        document.getElementById(
            "resultado-examen"
        );


    if (
        isNaN(porcentajePresentacion) ||
        isNaN(porcentajeExamen) ||
        porcentajePresentacion +
        porcentajeExamen !==
        100
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                Los porcentajes del examen
                deben sumar 100%.

            </div>

        `;

        return;

    }


    if (
        porcentajePresentacion < 0 ||
        porcentajeExamen < 0
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-peligro">

                Los porcentajes no pueden
                ser negativos.

            </div>

        `;

        return;

    }


    if (
        presentacion === null
    ) {

        contenedor.innerHTML =
            "Aún no hay una nota de presentación disponible.";

        return;

    }


    const minimo =
        Number(
            ramo.notaMinima
        );


    const necesario =
        (
            minimo -
            (
                presentacion *
                (
                    porcentajePresentacion /
                    100
                )
            )
        ) /
        (
            porcentajeExamen /
            100
        );


    if (
        necesario <= 1
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-exito">

                Ya alcanzas el promedio mínimo
                sin considerar el examen.

            </div>

        `;

    } else if (
        necesario > 7
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                Incluso con una nota 7,0 en el examen
                no alcanzarías el promedio mínimo.

            </div>

        `;

    } else {

        contenedor.innerHTML = `

            Para terminar con
            <strong>
                ${formatearNumero(
                    minimo
                )}
            </strong>,

            necesitas aproximadamente
            <strong>
                ${formatearNumero(
                    necesario
                )}
            </strong>

            en el examen.

        `;

    }


    ramo.porcentajePresentacion =
        porcentajePresentacion;


    ramo.porcentajeExamen =
        porcentajeExamen;


    guardarDatos();

}


/* =========================================================
   EDITAR RAMO
========================================================= */

function editarRamo() {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    modoEdicion =
        true;


    document.getElementById(
        "nombre-nuevo-ramo"
    ).value =
        ramo.nombre;


    document.getElementById(
        "nota-minima"
    ).value =
        ramo.notaMinima;


    if (
        ramo.tieneLaboratorio
    ) {

        document.getElementById(
            "porcentaje-teoria"
        ).value =
            ramo.porcentajeTeoria;


        document.getElementById(
            "porcentaje-laboratorio"
        ).value =
            ramo.porcentajeLaboratorio;

    }


    /*
        Vamos directamente a evaluaciones.
        El nombre se puede modificar desde
        la pantalla de nuevo ramo.
    */

    prepararPantallaEvaluaciones();


    mostrarPantalla(
        "pantalla-evaluaciones"
    );

}


/* =========================================================
   GUARDAR CONFIGURACIÓN
========================================================= */

function guardarConfiguracion() {

    const ramo =
        obtenerRamoActual();


    if (!ramo) return;


    const notaMinima =
        Number(
            document.getElementById(
                "nota-minima"
            ).value
        );


    if (
        isNaN(notaMinima) ||
        notaMinima < 1 ||
        notaMinima > 7
    ) {

        alert(
            "Ingresa una nota mínima válida entre 1,0 y 7,0."
        );

        return;

    }


    ramo.notaMinima =
        notaMinima;


    guardarDatos();


    renderizarResumenRamo();


    mostrarPantalla(
        "pantalla-ramo"
    );

}


/* =========================================================
   ELIMINAR RAMO
========================================================= */

function confirmarEliminarRamo() {

    const confirmar =
        confirm(
            "¿Quieres eliminar este ramo?\n\nSe borrarán sus evaluaciones y notas guardadas."
        );


    if (!confirmar) return;


    ramos =
        ramos.filter(
            ramo =>
                ramo.id !==
                ramoActualId
        );


    guardarDatos();


    ramoActualId =
        null;


    renderizarRamos();


    mostrarPantalla(
        "pantalla-inicio"
    );

}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function volverMisRamos() {

    renderizarRamos();


    mostrarPantalla(
        "pantalla-inicio"
    );

}


function volverAnteriorConfiguracion() {

    const ramo =
        obtenerRamoActual();


    if (
        ramo &&
        ramo.tieneLaboratorio
    ) {

        mostrarPantalla(
            "pantalla-division"
        );

    } else {

        mostrarPantalla(
            "pantalla-laboratorio"
        );

    }

}


/* =========================================================
   ESTADO DEL RAMO
========================================================= */

function obtenerEstadoRamo(
    ramo
) {

    const promedio =
        calcularPromedioRamo(
            ramo
        );


    if (
        promedio === null
    ) {

        return "Todavía no tienes notas ingresadas.";

    }


    const pendientes =
        obtenerEvaluacionesPendientes(
            ramo
        );


    if (
        pendientes.length
    ) {

        return "Aún tienes evaluaciones pendientes.";

    }


    if (
        promedio >=
        ramo.notaMinima
    ) {

        return "¡Lo lograste!";

    }


    return "Esta vez no alcanzaste el objetivo.";

}


/* =========================================================
   MENÚ LATERAL
========================================================= */

function abrirMenu() {

    const menu =
        document.getElementById(
            "menu-lateral"
        );


    const fondo =
        document.getElementById(
            "fondo-menu"
        );


    if (menu) {

        menu.classList.add(
            "abierto"
        );

    }


    if (fondo) {

        fondo.classList.add(
            "activo"
        );

    }

}


function cerrarMenu() {

    const menu =
        document.getElementById(
            "menu-lateral"
        );


    const fondo =
        document.getElementById(
            "fondo-menu"
        );


    if (menu) {

        menu.classList.remove(
            "abierto"
        );

    }


    if (fondo) {

        fondo.classList.remove(
            "activo"
        );

    }

}


/* =========================================================
   OPCIONES DEL MENÚ
========================================================= */

function irAMisRamos() {

    cerrarMenu();

    cerrarPanelMenu();

    volverMisRamos();

}


function irComoFunciona() {

    cerrarMenu();

    abrirPanelMenu(
        "panel-como-funciona"
    );

}


function irSugerencias() {

    cerrarMenu();

    abrirPanelMenu(
        "panel-sugerencias"
    );

}


function irTemas() {

    cerrarMenu();

    abrirPanelMenu(
        "panel-temas"
    );

}


function irVersion() {

    cerrarMenu();

    abrirPanelMenu(
        "panel-version"
    );

}


/* =========================================================
   PANELES DEL MENÚ
========================================================= */

function abrirPanelMenu(
    idPanel
) {

    cerrarPanelMenu();


    const panel =
        document.getElementById(
            idPanel
        );


    if (!panel) return;


    panel.classList.remove(
        "oculto"
    );


    document.body.classList.add(
        "panel-abierto"
    );

}


function cerrarPanelMenu() {

    document
        .querySelectorAll(
            ".panel-menu"
        )
        .forEach(
            panel => {

                panel.classList.add(
                    "oculto"
                );

            }
        );


    document.body.classList.remove(
        "panel-abierto"
    );

}


/*
    Permite cerrar el panel haciendo clic
    en el fondo, pero no cuando se hace
    clic dentro del contenido.
*/

function cerrarPanelDesdeFondo(
    evento
) {

    if (
        evento.target ===
        evento.currentTarget
    ) {

        cerrarPanelMenu();

    }

}


/* =========================================================
   TEMAS
========================================================= */

function cambiarTema(
    tema
) {

    const temasPermitidos = [
        "lila",
        "verde",
        "celeste",
        "rosa"
    ];


    if (
        !temasPermitidos.includes(
            tema
        )
    ) {

        return;

    }


    document.body.dataset.tema =
        tema;


    localStorage.setItem(
        "temaCalculadora",
        tema
    );

}


function cargarTema() {

    const tema =
        localStorage.getItem(
            "temaCalculadora"
        ) || "lila";


    document.body.dataset.tema =
        tema;

}


/* =========================================================
   SUGERENCIAS
========================================================= */

function enviarSugerencia() {

    const tipo =
        document.getElementById(
            "tipo-sugerencia"
        ).value;


    const ramo =
        document.getElementById(
            "ramo-sugerencia"
        ).value.trim();


    const mensaje =
        document.getElementById(
            "mensaje-sugerencia"
        ).value.trim();


    if (
        !tipo ||
        !mensaje
    ) {

        alert(
            "Completa el tipo de sugerencia y el mensaje."
        );

        return;

    }


    /*
        Actualmente las sugerencias
        solamente muestran una confirmación.

        Más adelante esta función se puede
        conectar con Supabase.
    */

    console.log(
        "Sugerencia:",
        {
            tipo,
            ramo,
            mensaje
        }
    );


    alert(
        "¡Gracias por tu sugerencia!"
    );


    document.getElementById(
        "tipo-sugerencia"
    ).value = "";


    document.getElementById(
        "ramo-sugerencia"
    ).value = "";


    document.getElementById(
        "mensaje-sugerencia"
    ).value = "";


    cerrarPanelMenu();

}


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key !==
            "Escape"
        ) {

            return;

        }


        /*
            Si hay un modal abierto,
            se cierra primero.
        */

        const modalEvaluacion =
            document.getElementById(
                "modal-evaluacion"
            );


        if (
            modalEvaluacion &&
            !modalEvaluacion.classList.contains(
                "oculto"
            )
        ) {

            cerrarModalEvaluacion();

            return;

        }


        const modalSalir =
            document.getElementById(
                "modal-salir"
            );


        if (
            modalSalir &&
            !modalSalir.classList.contains(
                "oculto"
            )
        ) {

            cerrarModalSalir();

            return;

        }


        /*
            Después cerramos paneles.
        */

        const algunPanelAbierto =
            document.querySelector(
                ".panel-menu:not(.oculto)"
            );


        if (algunPanelAbierto) {

            cerrarPanelMenu();

            return;

        }


        /*
            Finalmente cerramos el menú lateral.
        */

        cerrarMenu();

    }
);


/* =========================================================
   MODAL DE SALIDA
========================================================= */

function cerrarModalSalir() {

    const modal =
        document.getElementById(
            "modal-salir"
        );


    if (!modal) return;


    modal.classList.add(
        "oculto"
    );

}


function salirSinGuardar() {

    cerrarModalSalir();

    /*
        Esta función queda preparada
        para futuras ediciones más avanzadas.
    */

    mostrarPantalla(
        "pantalla-ramo"
    );

}


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarTema();

        renderizarRamos();

    }
);
