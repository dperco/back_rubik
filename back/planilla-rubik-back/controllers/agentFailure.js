// controllers/agentFailure.js
'use strict'

const AgentFailure = require('../models/agentFailure');
const logger = require('../config/logger');

const controller = {
    // Obtener todas las fallas pendientes de revisión
    getPendingFailures: async (req, res) => {
        try {
            const failures = await AgentFailure.find({ status: 'pending_review' }).sort({ timestamp: -1 });
            if (!failures || failures.length === 0) {
                return res.status(404).send({ message: 'No hay fallos pendientes de revisión.' });
            }
            return res.status(200).send({ failures });
        } catch (error) {
            logger.error(`Error al obtener fallos pendientes: ${error}`);
            return res.status(500).send({ message: 'Error en el servidor al obtener los fallos.' });
        }
    },

    // Marcar un fallo como resuelto
    resolveFailure: async (req, res) => {
        const failureId = req.params.id;
        try {
            const failure = await AgentFailure.findByIdAndUpdate(failureId, { status: 'resolved' }, { new: true });
            if (!failure) {
                return res.status(404).send({ message: 'No se encontró el fallo con ese ID.' });
            }
            return res.status(200).send({ message: 'Fallo marcado como resuelto.', failure });
        } catch (error) {
            logger.error(`Error al resolver el fallo ${failureId}: ${error}`);
            return res.status(500).send({ message: 'Error en el servidor al actualizar el fallo.' });
        }
    }
};

module.exports = controller;