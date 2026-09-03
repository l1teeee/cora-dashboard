# Roadmap del panel de CORA

## Fase 1 — Autogestion del agente (pendiente de implementar)

Endpoints de Vapi ya verificados contra su documentacion:

| Funcionalidad | Endpoint |
| --- | --- |
| Voz y modelo | `PATCH /assistant/{id}` con los objetos `voice` y `model` completos |
| Numero de escalacion | `PATCH /assistant/{id}` (`assistantOverrides.variableValues` o inyeccion en el prompt) |
| Versionado | `GET /assistant/{id}` antes de cada PATCH, snapshot en `historial_asistente` |
| Llamada de prueba | Web SDK `@vapi-ai/web` en el navegador, con **public key**, no la privada |
| Structured outputs | `GET/POST/PATCH/DELETE /structured-output`, con `assistantIds` para vincular |

Rangos reales de la voz de ElevenLabs en Vapi (no los supuestos):
`stability` 0-1 · `similarityBoost` 0-1 · `style` 0-1 · **`speed` 0.7-1.2**

## Fase 2 — Anotado, sin implementar

### Selector multi-asistente
Hoy `VAPI_ASSISTANT_ID` es una sola variable. Con varios clientes hace falta una tabla
`asistentes` (id de Vapi, nombre, cliente) y un selector que fije el contexto activo. Afecta a
todas las rutas de administracion: pasarian a recibir el id en vez de leerlo del entorno.

### Mensajes del sistema secundarios
`voicemailMessage`, `endCallMessage` e idle messages son campos del propio objeto assistant, asi
que entran en el mismo `PATCH` que ya se usa. Es sobre todo trabajo de formulario.

### Limite de costo y concurrencia
`maxDurationSeconds` por llamada vive en el assistant. El limite de concurrencia y el presupuesto
son de organizacion, no de assistant: requieren endpoints distintos y probablemente un job que
vigile el gasto acumulado, no solo un formulario.

### Diccionario de pronunciacion
Se resuelve con reemplazos fonéticos en el texto o con SSML de ElevenLabs. Necesita una tabla
propia (`termino`, `pronunciacion`) y aplicarlo en el prompt o en el chunk plan de la voz. Ojo:
tocar esto degrada la naturalidad si se abusa.

### Alertas por tasa alta de "Transfer Failed"
Ya tenemos `razon_finalizacion` en cada llamada, asi que el dato existe. Falta un job periodico
que calcule la tasa en una ventana movil y avise (email o webhook) al superar un umbral. Es la
unica de la lista que necesita algo que hoy no existe: ejecucion programada.
