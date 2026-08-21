let tieneLaboratorio = false;
let contadorEvaluaciones = 0;


// ===============================
// CAMBIAR DE PANTALLA
// ===============================

function mostrarPantalla(id) {

    document.querySelectorAll(".pantalla").forEach(pantalla => {
        pantalla.classList.remove("activa");
    });

    document.getElementById(id).classList.add("activa");
}


// ===============================
// ELEGIR LABORATORIO
// ===============================

function elegirLaboratorio(valor) {

    tieneLaboratorio = valor;

    mostrarPantalla("configuracion");

    agregarEvaluacion();
}


// ===============================
// AGREGAR EVALUACIÓN
// ===============================

function agregarEvaluacion() {

    contadorEvaluaciones++;

    const contenedor = document.getElementById("evaluaciones");

    const evaluacion = document.createElement("div");

    evaluacion.className = "evaluacion";

    evaluacion.innerHTML = `

        <div class="evaluacion-grid">

            <div>

                <label>
                    Nombre
                </label>

                <input
                    type="text"
                    class="nombre-evaluacion"
                    placeholder="Ej: Prueba 1"
                >

            </div>

            <div>

                <label>
                    Ponderación (%)
                </label>

                <input
                    type="number"
                    class="ponderacion"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="25"
                >

            </div>

        </div>

        <br>

        <label>
            Nota obtenida
        </label>

        <input
            type="number"
            class="nota"
            min="1"
            max="7"
            step="0.1"
            placeholder="Ej: 5.5"
        >

    `;

    contenedor.appendChild(evaluacion);
}


// ===============================
// CONTINUAR A RESULTADOS
// ===============================

function continuarResultados() {

    const nombre =
        document.getElementById("nombreRamo").value
        || "Mi ramo";

    const notaMinima =
        parseFloat(document.getElementById("notaMinima").value);

    const evaluaciones =
        document.querySelectorAll(".evaluacion");

    let suma = 0;
    let porcentajeUsado = 0;

    evaluaciones.forEach(evaluacion => {

        const ponderacion =
            parseFloat(
                evaluacion.querySelector(".ponderacion").value
            );

        const nota =
            parseFloat(
                evaluacion.querySelector(".nota").value
            );

        if (!isNaN(ponderacion) && !isNaN(nota)) {

            suma += nota * (ponderacion / 100);

            porcentajeUsado += ponderacion;
        }

    });

    document.getElementById("nombreRamoResultado").textContent =
        nombre;

    document.getElementById("promedioActual").textContent =
        suma.toFixed(2);

    calcularNotaNecesaria(
        suma,
        porcentajeUsado,
        notaMinima
    );

    calcularPosiblesResultados(
        suma,
        porcentajeUsado
    );

    mostrarPantalla("resultados");
}


// ===============================
// CALCULAR NOTA NECESARIA
// ===============================

function calcularNotaNecesaria(
    promedioActual,
    porcentajeUsado,
    notaMinima
) {

    const porcentajeFaltante =
        100 - porcentajeUsado;

    const resultado =
        document.getElementById("notaNecesaria");

    if (porcentajeFaltante <= 0) {

        if (promedioActual >= notaMinima) {

            resultado.innerHTML =
                `🎉 ¡Ya alcanzas la nota mínima!`;

        } else {

            resultado.innerHTML =
                `❌ No alcanzas la nota mínima.`;

        }

        return;
    }

    const notaNecesaria =
        (
            notaMinima -
            promedioActual
        ) /
        (porcentajeFaltante / 100);

    if (notaNecesaria <= 1) {

        resultado.innerHTML =
            `Con cualquier nota sobre 1,0
             deberías alcanzar ${notaMinima.toFixed(1)}.`;

    } else if (notaNecesaria > 7) {

        resultado.innerHTML =
            `😢 Necesitarías un
             <strong>${notaNecesaria.toFixed(2)}</strong>,
             por lo que no es posible alcanzar
             ${notaMinima.toFixed(1)} con una nota máxima de 7,0.`;

    } else {

        resultado.innerHTML =
            `Necesitas aproximadamente
             <strong>${notaNecesaria.toFixed(2)}</strong>
             en lo que falta.`;

    }
}


// ===============================
// POSIBLES RESULTADOS
// ===============================

function calcularPosiblesResultados(
    promedioActual,
    porcentajeUsado
) {

    const porcentajeFaltante =
        100 - porcentajeUsado;

    const contenedor =
        document.getElementById("posiblesResultados");

    if (porcentajeFaltante <= 0) {

        contenedor.innerHTML =
            "No quedan evaluaciones pendientes.";

        return;
    }

    let html = "<ul>";

    for (let nota = 1; nota <= 7; nota++) {

        const promedioFinal =
            promedioActual +
            nota * (porcentajeFaltante / 100);

        html += `
            <li>
                Si sacas un
                <strong>${nota.toFixed(1)}</strong>:
                ${promedioFinal.toFixed(2)}
            </li>
        `;
    }

    html += "</ul>";

    contenedor.innerHTML = html;
}


// ===============================
// VOLVER AL INICIO
// ===============================

function volverInicio() {

    document.getElementById("evaluaciones").innerHTML = "";

    contadorEvaluaciones = 0;

    document.getElementById("nombreRamo").value = "";

    mostrarPantalla("inicio");
}
