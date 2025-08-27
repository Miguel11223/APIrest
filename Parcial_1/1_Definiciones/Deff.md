# Definiciones de API y REST

## API (Interfaz de Programación de Aplicaciones)
Una API es un conjunto de reglas, herramientas y protocolos que permite que diferentes sistemas o aplicaciones se comuniquen entre sí. Actúa como un intermediario que facilita el intercambio de datos o funcionalidades entre dos o más programas, permitiendo que una aplicación solicite servicios o información de otra de manera estandarizada y segura.

- **Características principales**:
  - Proporciona una interfaz estructurada para acceder a funciones o datos de un sistema.
  - Puede ser utilizada en diferentes contextos, como aplicaciones web, móviles o sistemas embebidos.
  - Ejemplos comunes: API de Twitter para obtener tweets, API de Google Maps para geolocalización.

## REST (Representational State Transfer)
REST, o Transferencia de Estado Representacional, es un estilo arquitectónico para diseñar APIs que utiliza los principios del protocolo HTTP para la comunicación entre sistemas. Las APIs RESTful permiten la interacción con recursos (como datos o servicios) a través de métodos estándar como GET, POST, PUT y DELETE, siguiendo un enfoque basado en recursos identificados por URLs.

- **Características principales**:
  - **Sin estado**: Cada solicitud del cliente al servidor debe contener toda la información necesaria, sin depender de sesiones previas.
  - **Uso de recursos**: Los datos o servicios se representan como recursos accesibles mediante URLs.
  - **Métodos HTTP**: Utiliza métodos estándar (GET para obtener, POST para crear, PUT para actualizar, DELETE para eliminar).
  - **Formato de datos**: Comúnmente usa JSON o XML para el intercambio de datos.
  - **Escalabilidad**: Su diseño simple facilita la escalabilidad y el mantenimiento.

## APIRest 
Es una interfaz de programación de aplicaciones (API) que se ajusta a los principios de diseño del estilo arquitectónico de transferencia de estado representacional (REST), un estilo utilizado para conectar sistemas de hipermedia distribuidos.