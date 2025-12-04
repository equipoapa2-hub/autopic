const aiService = require('../services/aiService');
const { sequelize } = require('../config/database');

class AIController {
    async chat(req, res) {
        try {
            const { message, sessionId = 'default' } = req.body;

            if (!message) {
                return res.status(400).json({
                    error: 'El mensaje es requerido'
                });
            }

            const processingResult = await aiService.processMessage(message, sessionId);

            let finalResponse = processingResult.response;
            let sqlResults = null;
            
            if (processingResult.needsDatabase) {
                [sqlResults] = await sequelize.query(processingResult.sqlQuery);
                finalResponse = await aiService.generateNaturalResponse(message, sqlResults, sessionId);
            }

            res.json({
                success: true,
                response: finalResponse,
                needsDatabase: processingResult.needsDatabase,
                sqlQuery: processingResult.sqlQuery || null,
                results: sqlResults || null
            });

        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    async clearContext(req, res) {
        try {
            const { sessionId = 'default' } = req.body;
            aiService.clearContext(sessionId);

            res.json({
                success: true,
                message: 'Contexto limpiado correctamente'
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
}

module.exports = new AIController();
