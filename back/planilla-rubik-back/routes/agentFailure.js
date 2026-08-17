// routes/agentFailure.js
'use strict'

const express = require('express');
const AgentFailureController = require('../controllers/agentFailure');

const router = express.Router();

// Rutas para el "Humano en el Bucle"
router.get('/agent-failures/pending', AgentFailureController.getPendingFailures);
router.put('/agent-failures/:id/resolve', AgentFailureController.resolveFailure); // Usamos PUT para actualizar

module.exports = router;  