const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  manager_id: { type: String, required: true },
  id: { type: Number, required: true, unique: true },
  manager_name: { type: String, required: true },
  manager_visible_in_org_chart: { type: Boolean },
  taxonId: { type: Number, required: true},
  Nombre: { type: String, required: true },
  Vacante: { type: String, required: true },
  Tiempo: { type: Number, required: true },
  "Fecha de pedido": { type: String, required: true },
  "Fecha de inicio": { type: String, required: true },
  Seniority: { type: String, required: true },
  created_at: { type: Date, required: true, default: Date.now },
  delete_at: { type: Date },
  last_edited_by: { type: String },
  last_edited_on: { type: Date },
});

module.exports = model("Vacante", userSchema, "vacancie");  
