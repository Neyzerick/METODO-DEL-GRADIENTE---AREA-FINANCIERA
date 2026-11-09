# FinLab — Simulador financiero con Gradientes Conjugados Precondicionados

Proyecto académico UMSA, Carrera de Informática, mención Desarrollo de Sistemas. Autor: Neyzer Erick Canaviri Sandoval.

## Objetivo

Simular ajustes presupuestarios de un pequeño café en compras, operación, innovación y reserva. Se minimiza una función de costo cuadrática que produce `Ax = b`, y se compara Gradiente Conjugado (GC), Gradiente Conjugado Precondicionado (GCP) con Jacobi y la solución directa de Cholesky.

Los datos son **simulados**, no proceden de un negocio real. Las variables son **ajustes** y no presupuestos totales. 1 unidad = Bs 100. No se aplican restricciones de flujo de caja, fondos disponibles ni no negatividad.

## Arquitectura

Sitio estático, sin backend ni claves. `index.html` contiene la interfaz, `styles.css` los estilos, `numerics.js` la formulación de los escenarios, las validaciones y los métodos numéricos y `app.js` conecta entradas, cálculos y gráficos SVG. Toda la lógica corre en el navegador.

## Estructura académica

La página distingue de forma explícita los diez módulos solicitados por el desafío:

1. Inicio.
2. Caso de estudio.
3. Formulación del sistema.
4. Entrada de datos.
5. Tres escenarios.
6. Solución numérica de referencia.
7. GCP frente a GC.
8. Análisis de errores y condicionamiento.
9. Pruebas de software QA.
10. Conclusiones y referencias.

La sección del caso también documenta el aporte específico de Desarrollo de Sistemas: arquitectura modular, componentes reactivos, validaciones matemáticas y pruebas funcionales.

## Uso local

La página puede abrirse directamente con doble clic sobre `index.html`; los cálculos y botones no dependen de un servidor. Para una ejecución equivalente a la publicación web, también puedes iniciar un servidor local:

```bash
python -m http.server 8000
```

Después visita http://localhost:8000. Alternativamente usa Live Server en VS Code. No requiere `npm install`.

Los resultados se recalculan al editar los campos. El botón **Calcular ahora** vuelve a ejecutar los métodos y desplaza la vista al resumen del escenario activo.

## Publicación en GitHub Pages

1. Sube los archivos a la raíz de un repositorio público en GitHub.
2. Ve a **Settings → Pages → Build and deployment**.
3. Elige **Deploy from a branch**, rama **main** y carpeta **/(root)**. Guarda.
4. Abre la URL indicada por GitHub cuando esté publicada y comprueba edición, gráficos y pruebas QA.

El nombre de la URL pública depende del usuario y del repositorio. No se ha realizado despliegue externo automáticamente.

## Modelo financiero

`J(x)=1/2 (x-t)^T W(x-t)+1/2 Σ cᵢⱼ(xᵢ-xⱼ)²`, con `W` diagonal positiva y relaciones `cᵢⱼ≥0`. De `∇J=0` se obtiene `(W+L)x=Wt`, donde `L` es un laplaciano ponderado. Así `A=W+L` es SPD por construcción. Se pueden editar matrices arbitrariamente, pero la aplicación comprueba simetría y Cholesky y bloquea los métodos si no cumplen SPD.

Escenarios: ideal `W=(4,3,2,1), t=(2,1,3,2), c12=2,c23=1,c34=0.5`; estrés conserva `W,c` y usa `t=(3,2,2,1)`; mal condicionado: `W=(0.01,0.01,10,10)`, `c12=0.99,c34=990` y `t=(2,1,3,2)`. El último es una prueba numérica artificial.

## Métodos e indicadores

- Cholesky: factorización triangular de A; resuelve dos sistemas triangulares para x_ref.
- GC: inicia en x₀, usa r=b-Ax, p=r, α=(rᵀr)/(pᵀAp), β=(r_nuevoᵀr_nuevo)/(rᵀr).
- GCP: aplica Jacobi M=diag(A), z=M⁻¹r, α=(rᵀz)/(pᵀAp), β=(r_nuevoᵀz_nuevo)/(rᵀz).
- Parada: `||b-Ax||₂ / ||b||₂ < tolerancia` con tolerancia inicial `1e-6`, o límite de iteraciones. Si b es nulo, se usa denominador 1 y el residuo absoluto; esto está documentado en la prueba QA.
- Error absoluto `|x_ref - x_GCP|`; relativo `abs/|x_ref|` (indefinido si la referencia es cero); porcentual `100×relativo`.
- `κ₂(A)` y `κ₂(M⁻¹A)` usan el cociente de valores singulares extremos, obtenidos de autovalores de `AᵀA` mediante rotaciones de Jacobi. Para matrices muy mal condicionadas, calcular singularidades por `AᵀA` puede perder precisión. Esta versión está acotada a n≤8.

## Pruebas
Desde la terminal, ejecuta `node test.mjs` (Node.js 18+). El módulo de pruebas de la página también permite ejecutar QA desde el navegador.

Para verificar también la conexión entre los botones y la interfaz, ejecuta `node ui-test.mjs`. Esta prueba carga `numerics.js` y `app.js` en el mismo contexto, activa los escenarios, calcula, restablece, reproduce el gráfico, ejecuta QA y comprueba la validación de matrices inválidas.


En **Pruebas** hay un botón que ejecuta de verdad QA-01 (tres escenarios), QA-02 (matrices inválidas), QA-03 (edición y recálculo), QA-04 (comparación de precondicionador), QA-05 (vector b nulo). Se muestran entrada, esperado, obtenido y conclusión, sin precalcular los estados.

## Limitaciones

- Los coeficientes son académicos. Los resultados no equivalen a asignaciones financieras factibles sin definir restricciones adicionales.
- La matriz original del escenario mal condicionado contiene fuerte acoplamiento: Jacobi corrige escalamiento pero podría no ofrecer mejoras estrictas en todos los casos o cambios de configuración.
- Las estimaciones de número de condición por `AᵀA` no son ideales para matrices extremadamente mal condicionadas; la interpretación debe tener en cuenta redondeo numérico.
- La matriz editable está limitada a dimensiones entre 4 y 8 para preservar legibilidad.
- La fuente tipográfica de Google puede requerir conexión; la app mantiene fuentes de reserva y los cálculos funcionan sin Internet una vez descargados los archivos.

## Referencias

- Suñagua S., P. (2020). *Método de Gradientes Conjugados Precondicionado*. Revista Boliviana de Matemática – UMSA, 04, 2–7.
- Golub, G. H. & Van Loan, C. F. (2013). *Matrix Computations*. Johns Hopkins University Press.
- Saad, Y. (2003). *Iterative Methods for Sparse Linear Systems*. SIAM.
