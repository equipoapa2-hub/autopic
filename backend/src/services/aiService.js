const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const databaseSchema = `
Tablas de la base de datos:

1. "Users" (Usuarios):
   - id: INTEGER (clave primaria)
   - name: STRING (nombre)
   - "lastName1": STRING (primer apellido)
   - "lastName2": STRING (segundo apellido, opcional)
   - email: STRING (email único)
   - phone: STRING (teléfono, opcional)
   - role: ENUM('user', 'admin') (rol)
   - "passwordHash": STRING (contraseña cifrada)
   - "createdAt": DATE
   - "updatedAt": DATE

2. "Vehicles" (Vehículos):
   - id: INTEGER (clave primaria)
   - plate: STRING (placa, única)
   - brand: STRING (marca)
   - model: STRING (modelo)
   - year: INTEGER (año)
   - color: STRING (color)
   - status: ENUM('disponible', 'en_uso', 'mantenimiento', 'deshabilitado')
   - "fuelType": ENUM('gasolina', 'diésel', 'eléctrico', 'híbrido')
   - capacity: INTEGER (capacidad de pasajeros)
   - "createdAt": DATE
   - "updatedAt": DATE

3. "VehicleUsages" (Uso de Vehículos):
   - id: INTEGER (clave primaria)
   - "userId": INTEGER (clave foránea a "Users".id)
   - "vehicleId": INTEGER (clave foránea a "Vehicles".id)
   - "startDate": DATE (fecha/hora inicio)
   - "endDate": DATE (fecha/hora fin, opcional)
   - status: ENUM('activo', 'completado')
   - "startMileage": INTEGER (kilometraje inicio)
   - "endMileage": INTEGER (kilometraje fin, opcional)
   - notes: TEXT (notas, opcional)
   - "createdAt": DATE
   - "updatedAt": DATE

Relaciones:
- "VehicleUsages"."userId" -> "Users".id
- "VehicleUsages"."vehicleId" -> "Vehicles".id

NOTA CRÍTICA: En PostgreSQL, los nombres de tablas y columnas con mayúsculas DEBEN ir entre comillas dobles.
`;

class AIService {
    constructor() {
        this.conversationContext = new Map();
    }

    async needsDatabaseQuery(userMessage, sessionId) {
        try {
            const context = this.getContext(sessionId);

            const prompt = `
            ${databaseSchema}

            Contexto previo:
            ${context}

            El usuario dice: "${userMessage}"

            Analiza si esta pregunta requiere consultar la base de datos para responderla accurateamente.

            Responde SOLO con "SI" o "NO":

            - Responde "SI" si la pregunta solicita información específica de los datos (conteos, listas, estados, información de usuarios, vehículos, usos)
            - Responde "NO" si es un saludo, pregunta general sobre el sistema, explicación de funcionalidades, o no requiere datos específicos

            Ejemplos:
            - "¿Cuántos usuarios hay?" → SI
            - "¿Cuántos vehículos rojos?" → SI  
            - "¿Qué hace este sistema?" → NO
            - "Hola, ¿cómo estás?" → NO
            - "Explícame cómo usar los vehículos" → NO
            - "¿Cuál es mi saldo?" → NO (no hay tabla de saldos)
            - "Lista los usuarios activos" → SI

            Respuesta:`;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Eres un analizador que decide si una pregunta requiere consultar la base de datos. Responde solo con SI o NO."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            });

            const decision = completion.choices[0].message.content.trim().toUpperCase();
            return decision === 'SI';
        } catch (error) {
            console.error('Error analizando necesidad de BD:', error);
            return false;
        }
    }

    async generateDirectResponse(userMessage, sessionId) {
        try {
            const context = this.getContext(sessionId);

            const prompt = `
            Eres AutoPic IA, un asistente inteligente para el sistema de gestión de vehículos y usuarios.

            Contexto de la conversación:
            ${context}

            El usuario pregunta: "${userMessage}"

            Responde de manera amigable y útil en español. Si es un saludo, saluda cordialmente. Si pregunta sobre funcionalidades del sistema, explícalas brevemente. Si no puedes ayudar con algo, sé honesto.

            Respuesta:`;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Eres AutoPic IA, un asistente amigable para el sistema de gestión de vehículos. Responde en español de manera clara y útil."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            });

            const response = completion.choices[0].message.content.trim();
            this.addToContext(sessionId, `Usuario: ${userMessage}\nIA: ${response}`);

            return response;
        } catch (error) {
            throw new Error(`Error generando respuesta directa: ${error.message}`);
        }
    }

    async generateSQLQuery(userMessage, sessionId) {
        try {
            const context = this.getContext(sessionId);

            const prompt = `
            ${databaseSchema}

            Contexto previo de la conversación:
            ${context}

            El usuario pregunta: "${userMessage}"

            Basándote en el schema de la base de datos y el contexto, genera UNA SOLA consulta SQL válida para PostgreSQL que responda a la pregunta del usuario.

            Reglas importantes:
            - Solo genera la consulta SQL, sin explicaciones adicionales
            - Usa nombres de tablas y columnas exactos del schema
            - Incluye solo condiciones necesarias para responder la pregunta
            - Para fechas de hoy, usa CURRENT_DATE
            - Para contar registros, usa COUNT(*)
            - Para fechas, usa formato DATE para comparaciones de fecha

            Ejemplos:
            - Pregunta: "¿Cuántos usuarios hay?" → "SELECT COUNT(*) FROM Users;"
            - Pregunta: "¿Cuántos vehículos están disponibles?" → "SELECT COUNT(*) FROM Vehicles WHERE status = 'disponible';"
            - Pregunta: "¿Cuántos vehículos salieron hoy?" → "SELECT COUNT(*) FROM VehicleUsage WHERE DATE(startDate) = CURRENT_DATE;"

            Reglas IMPORTANTES de PostgreSQL:
            - Los nombres de tablas y columnas con mayúsculas DEBEN ir entre comillas dobles: "Users", "Vehicles", "VehicleUsages"
            - Los nombres en minúsculas NO necesitan comillas: users, vehicles (pero nuestras tablas tienen mayúsculas)
            - Usa las tablas y columnas EXACTAMENTE como están definidas arriba

            Ejemplos CORRECTOS:
            - "SELECT COUNT(*) FROM "Users";"
            - "SELECT * FROM "Vehicles" WHERE status = 'disponible';"
            - "SELECT COUNT(*) FROM "VehicleUsages" WHERE DATE("startDate") = CURRENT_DATE;"


            Consulta SQL:`;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Eres un asistente especializado en generar consultas SQL para PostgreSQL basadas en preguntas en lenguaje natural. Solo responde con la consulta SQL, sin explicaciones."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 200,
                temperature: 0.1
            });

            const sqlQuery = completion.choices[0].message.content.trim();

            if (!sqlQuery.toLowerCase().startsWith('select')) {
                throw new Error('Solo se permiten consultas SELECT por seguridad');
            }

            this.addToContext(sessionId, `Usuario: ${userMessage}\nSQL Generado: ${sqlQuery}`);

            return sqlQuery;
        } catch (error) {
            throw new Error(`Error generando consulta SQL: ${error.message}`);
        }
    }

    async generateNaturalResponse(userMessage, sqlResults, sessionId) {
        try {
            const context = this.getContext(sessionId);

            const prompt = `
            El usuario preguntó: "${userMessage}"

            Se ejecutó una consulta SQL y se obtuvieron estos resultados:
            ${JSON.stringify(sqlResults, null, 2)}

            Contexto de la conversación:
            ${context}

            Proporciona una respuesta clara y natural en español basada en los resultados. Sé conciso pero informativo. Si los resultados son numéricos, preséntalos de manera amigable. Si hay una lista, resúmela adecuadamente.

            Respuesta:`;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Eres un asistente amigable que explica resultados de bases de datos en lenguaje natural. Responde en español de manera clara y concisa."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            });

            const response = completion.choices[0].message.content.trim();
            this.addToContext(sessionId, `Respuesta: ${response}`);

            return response;
        } catch (error) {
            throw new Error(`Error generando respuesta natural: ${error.message}`);
        }
    }

    async processMessage(userMessage, sessionId) {
        try {
            const needsDB = await this.needsDatabaseQuery(userMessage, sessionId);

            if (!needsDB) {
                return {
                    needsDatabase: false,
                    response: await this.generateDirectResponse(userMessage, sessionId)
                };
            }

            const sqlQuery = await this.generateSQLQuery(userMessage, sessionId);
            return {
                needsDatabase: true,
                sqlQuery: sqlQuery
            };

        } catch (error) {
            throw new Error(`Error procesando mensaje: ${error.message}`);
        }
    }

    getContext(sessionId) {
        return this.conversationContext.get(sessionId) || '';
    }

    addToContext(sessionId, message) {
        const currentContext = this.getContext(sessionId);
        const newContext = currentContext ? `${currentContext}\n${message}` : message;

        const lines = newContext.split('\n');
        if (lines.length > 20) {
            lines.splice(0, lines.length - 20);
        }

        this.conversationContext.set(sessionId, lines.join('\n'));
    }

    clearContext(sessionId) {
        this.conversationContext.delete(sessionId);
    }
}

module.exports = new AIService();