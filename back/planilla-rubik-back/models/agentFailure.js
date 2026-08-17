// models/agentFailure.js
'use strict'

const { Schema, model } = require('mongoose');

const AgentFailureSchema = new Schema({
    user_query: { type: String, required: true },
    agent_thought_process: { type: String },
    error_traceback: { type: String },
    timestamp: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['pending_review', 'in_progress', 'resolved'],
        default: 'pending_review'
    }
});

module.exports = model('AgentFailure', AgentFailureSchema, 'agent_failures');