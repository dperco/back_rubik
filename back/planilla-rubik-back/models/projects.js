const { Schema, model } = require("mongoose");

const AssignedPersons= new Schema({
    name: { type: String },
    id: {type:String},
    rol: { type: String },
    horasAsignadas: { type: Number },
    tecnologias: { type: [String] },
    seniority: { type: String },
});

const projectSchema = new Schema({
    managerId: { type: String, required: true },
    managerName: { type: String, required: true },
    managerVisibleInOrgChart: { type: Boolean, required: true },
    taxonId: { type: Number, required: true},
    name: { type: String, required: true },
    client: { type: String, required: true },
    status: { type: String, required: true },
    phase: { type: String, required: true },
    projectType: { type: String, required: true },
    assignedPersons: { type: [AssignedPersons], default: [] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    image: { type: String },
    description: { type: String },
    created_at: { type: Date, default: Date.now },
    delete_at: { type: Date },
    last_edited_by: { type: String },
    last_edited_on: { type: Date },

});

// Exportar el modelo
module.exports = model("Project", projectSchema, "projects");