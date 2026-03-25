# Dictation App

Esto es una aplicación de Dictado bastante básica con Login/Registro, subida de archivos, implementación de la _API_ de **SpeechMatics** (tanto con su paquete para dictado real como usando fetch), así como un _Test File_ para cada parte (tanto **FE** como **BE**). Esto último, hubiera preferido usar _vitest_, la verdad.

Para hacer funcionar la aplicación hay que tener tanto el **BE** como el **FE** _running_. `npm run dev` en el directorio base debería bastar. Hay que hacer _install_ previamente con `npm run prepare` (también desde el base). También he integrado **Husky** con **Prettier** y **Lint**.

Login se hace nativamente (y no es muy seguro, pero esto es una prueba técnica así que...), sin el uso de **AWS Cognito** (no me apetecía crearme una cuenta de **AWS** para esto). También he manejado las _store_ con **Pinia**, porque me parece _cute_.

_Also_, y como puntualización final, se ha usado _Copilot Agent_ para mucho _boilerplate_. Aunque el resultado final ha sido editado manualmente y cohesionado por mí. A fin de cuentas, la "_IA_" es buena para hacerte un 60-70% del camino.
