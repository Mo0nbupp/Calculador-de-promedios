/* =========================================================
   CALCULADORA DE PROMEDIOS
   Versión inicial
========================================================= */


/* =========================================================
   DATOS
========================================================= */

let ramos = JSON.parse(localStorage.getItem("ramosCalculadora")) || [];

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

    return Date.now().toString() +
        Math.random().toString(36).substring(2, 8);

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


/* =========================================================
   CAMBIO DE PANTALLAS
========================================================= */

function mostrarPantalla(id) {

    document
        .querySelectorAll(".pantalla")
        .forEach(pantalla => {

            pantalla.classList.remove("activa");

        });


    const pantalla =
        document.getElementById(id);


    if (pantalla) {

        pantalla.classList.add("activa");

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
        document.getElementById("lista-ramos");


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
                ${obtenerEstadoRamo(ramo)}
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

        input.focus();

        return;

    }


    ramoActualId = generarId();


    const nuevo = {

        id: ramoActualId,

        nombre,

        tieneLaboratorio: false,

        porcentajeTeoria: 100,

        porcentajeLaboratorio: 0,

        evaluaciones: [],

        evaluacionesTeoria: [],

        evaluacionesLaboratorio: [],

        notaMinima: 4,

        tienePAR: false,

        porcentajePresentacion: 70,

        porcentajeExamen: 30,

        objetivo: null

    };


    ramos.push(nuevo);


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


function seleccionarLaboratorio(tieneLaboratorio) {

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

        ramo.porcentajeTeoria = 100;

        ramo.porcentajeLaboratorio = 0;


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


    if (total !== 100) {

        mensaje.className =
            "mensaje-validacion mensaje-advertencia";


        mensaje.textContent =
            `La división suma ${total}%. Debe sumar 100%.`;


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


    const ramo =
        obtenerRamoActual();


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
   EVALUACIONES
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

function agregarEvaluacion(tipo = null) {

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


    document.querySelector(
        'input[name="tiene-subnotas"][value="no"]'
    ).checked = true;


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

function mostrarSubnotas(mostrar) {

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

    }

}


function agregarSubnota() {

    const lista =
        document.getElementById(
            "lista-subnotas"
        );


    const id =
        generarId();


    const div =
        document.createElement("div");


    div.className =
        "evaluacion-card";


    div.dataset.id =
        id;


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


    lista.appendChild(div);


    actualizarTotalSubnotas();

}


function actualizarTotalSubnotas() {

    const elementos =
        document.querySelectorAll(
            "#lista-subnotas .evaluacion-card"
        );


    let total = 0;


    elementos.forEach(elemento => {

        const valor =
            Number(
                elemento.querySelector(
                    ".subnota-ponderacion"
                ).value
            );


        if (!isNaN(valor)) {

            total += valor;

        }

    });


    const mensaje =
        document.getElementById(
            "total-subnotas"
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
        (isNaN(nota) || nota < 1 || nota > 7)
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


    const tieneSubnotas =
        document.querySelector(
            'input[name="tiene-subnotas"]:checked'
        ).value === "si";


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


        elementos.forEach(elemento => {

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

                throw new Error(
                    "Todas las subnotas necesitan un nombre."
                );

            }


            if (
                !pendienteSubnota &&
                (
                    isNaN(notaSubnota) ||
                    notaSubnota < 1 ||
                    notaSubnota > 7
                )
            ) {

                throw new Error(
                    "Hay una subnota con una nota inválida."
                );

            }


            if (
                isNaN(ponderacionSubnota) ||
                ponderacionSubnota <= 0
            ) {

                throw new Error(
                    "Hay una subnota con una ponderación inválida."
                );

            }


            totalSubnotas +=
                ponderacionSubnota;


            subnotas.push({

                id: generarId(),

                nombre:
                    nombreSubnota,

                nota:
                    notaSubnota,

                pendiente:
                    pendienteSubnota,

                ponderacion:
                    ponderacionSubnota

            });

        });


        if (totalSubnotas !== 100) {

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
            tipoEvaluacionActual === "teoria"
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


    evaluaciones.forEach(evaluacion => {

        const card =
            document.createElement("div");


        card.className =
            "evaluacion-card";


        let notaTexto =
            evaluacion.pendiente
                ? "Pendiente"
                : formatearNumero(
                    calcularNotaEvaluacion(
                        evaluacion
                    )
                );


        card.innerHTML = `

            <h3>
                ${escaparHTML(evaluacion.nombre)}
            </h3>

            <div class="evaluacion-info">

                <span>
                    Nota:
                    <strong class="${
                        evaluacion.pendiente
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


        contenedor.appendChild(card);

    });

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
            (suma, evaluacion) =>
                suma + Number(
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
   CÁLCULOS
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
        !evaluacion.subnotas?.length
    ) {

        return evaluacion.nota;

    }


    const subnotas =
        evaluacion.subnotas;


    const disponibles =
        subnotas.filter(
            subnota =>
                !subnota.pendiente &&
                subnota.nota !== null
        );


    if (
        disponibles.length !==
        subnotas.length
    ) {

        return null;

    }


    let total = 0;


    subnotas.forEach(subnota => {

        total +=
            subnota.nota *
            (
                subnota.ponderacion / 100
            );

    });


    return redondear(total);

}


function calcularPromedioLista(
    evaluaciones
) {

    if (!evaluaciones.length) {

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
                    evaluacion.ponderacion;

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


    modoEdicion = false;


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


    const promedioElemento =
        document.getElementById(
            "promedio-actual"
        );


    promedioElemento.textContent =
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


function renderizarResumenEvaluaciones(
    ramo
) {

    const contenedor =
        document.getElementById(
            "resumen-evaluaciones"
        );


    contenedor.innerHTML = "";


    let grupos = [];


    if (ramo.tieneLaboratorio) {

        grupos.push({

            titulo: "Teoría",

            evaluaciones:
                ramo.evaluacionesTeoria

        });


        grupos.push({

            titulo: "Laboratorio",

            evaluaciones:
                ramo.evaluacionesLaboratorio

        });

    } else {

        grupos.push({

            titulo: null,

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
   QUÉ NECESITAS PARA APROBAR
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


function calcularQueNecesitas(
    ramo
) {

    const contenedor =
        document.getElementById(
            "resultado-aprobar"
        );


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
                        ${formatearNumero(promedio)}
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


    if (resultado === null) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                Aún tienes evaluaciones pendientes.

            </div>

        `;

        return;

    }


    if (resultado <= 1) {

        contenedor.innerHTML = `

            <div class="mensaje-exito">

                Con tus notas actuales,
                ya tienes el promedio necesario
                para aprobar.

            </div>

        `;

        return;

    }


    if (resultado > 7) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                Con las evaluaciones pendientes,
                no es posible alcanzar
                el promedio mínimo de
                ${formatearNumero(objetivo)}
                solamente con ellas.

            </div>

        `;

        return;

    }


    contenedor.innerHTML = `

        <p>
            Necesitas obtener aproximadamente
            <strong>
                ${formatearNumero(resultado)}
            </strong>
            en las evaluaciones pendientes
            para alcanzar
            <strong>
                ${formatearNumero(objetivo)}
            </strong>.
        </p>

    `;

}


function obtenerEvaluacionesPendientes(
    ramo
) {

    const todas =
        obtenerEvaluacionesRamo(
            ramo
        );


    return todas.filter(
        evaluacion =>
            calcularNotaEvaluacion(
                evaluacion
            ) === null
    );

}


function calcularNotaNecesaria(
    ramo,
    objetivo
) {

    const evaluaciones =
        obtenerEvaluacionesRamo(
            ramo
        );


    if (!evaluaciones.length) {

        return null;

    }


    let pesoCompletado = 0;

    let aporteActual = 0;

    let pesoPendiente = 0;


    evaluaciones.forEach(
        evaluacion => {

            const nota =
                calcularNotaEvaluacion(
                    evaluacion
                );


            if (nota === null) {

                pesoPendiente +=
                    evaluacion.ponderacion;

            } else {

                aporteActual +=
                    nota *
                    (
                        evaluacion.ponderacion /
                        100
                    );


                pesoCompletado +=
                    evaluacion.ponderacion;

            }

        }
    );


    if (
        pesoPendiente <= 0
    ) {

        return null;

    }


    const necesario =
        (
            objetivo -
            aporteActual
        ) /
        (
            pesoPendiente /
            100
        );


    return redondear(
        necesario
    );

}


/* =========================================================
   OBJETIVO PERSONALIZADO
========================================================= */

function cambiarObjetivo() {

    const ramo =
        obtenerRamoActual();


    const opcion =
        document.querySelector(
            'input[name="objetivo"]:checked'
        );


    const campo =
        document.getElementById(
            "campo-otro-objetivo"
        );


    if (
        opcion?.value === "otro"
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


    if (
        !ramo ||
        isNaN(objetivo) ||
        objetivo < 1 ||
        objetivo > 7
    ) {

        return;

    }


    const resultado =
        calcularNotaNecesaria(
            ramo,
            objetivo
        );


    const contenedor =
        document.getElementById(
            "resultado-objetivo"
        );


    if (resultado === null) {

        contenedor.innerHTML =
            "No hay evaluaciones pendientes.";

        return;

    }


    if (resultado > 7) {

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
            ${formatearNumero(resultado)}
        </strong>
        en las evaluaciones pendientes.

    `;

}


function cargarObjetivo(
    ramo
) {

    const minimo =
        document.querySelector(
            'input[name="objetivo"][value="minimo"]'
        );


    minimo.checked = true;


    document.getElementById(
        "campo-otro-objetivo"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "resultado-objetivo"
    ).innerHTML = "";

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


    if (
        !ramo
    ) return;


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
                (
                    radio.value ===
                    (
                        ramo.tienePAR
                            ? "si"
                            : "no"
                    )
                );

        }
    );


    if (
        !ramo.tienePAR
    ) {

        document.getElementById(
            "contenido-par"
        ).classList.add(
            "oculto"
        );

        return;

    }


    document.getElementById(
        "contenido-par"
    ).classList.remove(
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


    if (!evaluaciones.length) {

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
                () => calcularPAR(
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
        ramo.notaMinima;


    /*
        Aquí dejamos preparado el cálculo
        de la nota PAR necesaria.

        La PAR reemplaza la nota seleccionada.
    */


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
                ${formatearNumero(objetivo)}.

            </div>

        `;

        return;

    }


    contenedor.innerHTML = `

        <div class="mensaje-exito">

            Para alcanzar
            <strong>
                ${formatearNumero(objetivo)}
            </strong>
            reemplazando
            <strong>
                ${escaparHTML(seleccionada.nombre)}
            </strong>
            (${formatearNumero(notaActual)}),
            necesitarías aproximadamente:

            <br><br>

            <strong>
                ${formatearNumero(notaNecesaria)}
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

        return;

    }


    if (
        necesario > 7
    ) {

        contenedor.innerHTML = `

            <div class="mensaje-advertencia">

                Incluso con una nota 7,0 en el examen
                no alcanzarías el promedio mínimo.

            </div>

        `;

        return;

    }


    contenedor.innerHTML = `

        Para terminar con
        <strong>
            ${formatearNumero(minimo)}
        </strong>,
        necesitas aproximadamente
        <strong>
            ${formatearNumero(necesario)}
        </strong>
        en el examen.

    `;


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


    modoEdicion = true;


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
        ramo?.tieneLaboratorio
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
   ESTADOS
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
   FORMATO
========================================================= */

function formatearNumero(
    numero
) {

    if (
        numero === null ||
        isNaN(numero)
    ) {

        return "—";

    }


    return Number(numero)
        .toFixed(2)
        .replace(".", ",");

}


function escaparHTML(
    texto
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;

}


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderizarRamos();

    }
);
