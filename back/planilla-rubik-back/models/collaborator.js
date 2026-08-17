const { Schema, model } = require("mongoose");
const Proyectoinfo = new Schema({
  rol: { type: String },
  Proyectos: { type: String },
  tecnologias: { type: String},
  horasAsignadas: { type: Number },
  seniority: { type: String },
},{_id: false});

const RolSeniorityInfo = new Schema({
  rol: { type: String, required: true },
  seniority: { type: String, required: true },
}, { _id: false });

const userSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  Proyectos: { type: [Proyectoinfo], default: [] },
  tecnologias: { type: [String], default: [] },
  estado: { type: String, required: true },
  "Fin de Contrato": { type: Date },
  horasAsignadas: { type: Number },
  observacion: { type: Number },
  created_at: { type: Date, required: true, default: Date.now },
  delete_at: { type: Date },
  last_edited_by: { type: String },
  last_edited_on: { type: Date },
  roles: { type: [RolSeniorityInfo], default: [] },
});
module.exports = model("Colab", userSchema, "collaborator");