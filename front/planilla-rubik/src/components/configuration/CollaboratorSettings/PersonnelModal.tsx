"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import { FieldDef } from "./types";
import { createPersonnel, updatePersonnel } from "@/services/api";
import ModalComponent from "@/components/message/MessageModal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  basic: FieldDef[];
  extra: FieldDef[];
  editRecord?: any; // undefined = alta
}

const emptyForm = { idExterno: "", first_name: "", last_name: "", email: "" };

export default function PersonnelModal({
  open,
  onClose,
  onSaved,
  basic,
  extra,
  editRecord,
}: Props) {
  /* estado local */
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [openModal, setOpenModal] = useState(false);

  /* sincroniza al abrir o cambiar registro */
  useEffect(() => {
    if (open) {
      setForm(
        editRecord
          ? { ...editRecord, ...(editRecord.extraData ?? {}) }
          : emptyForm
      );
    }
  }, [open, editRecord]);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  /* inputs dinámicos */
  const renderField = (f: FieldDef) => {
    const val = form[f.key] ?? (f.type === "multiselect" ? [] : "");

    if (["string", "number"].includes(f.type))
      return (
        <TextField
          value={val}
          type={f.type === "number" ? "number" : "text"}
          onChange={(e) => {
            const v = e.target.value;
            set(f.key, v === "" ? undefined : v);
          }}
          fullWidth
        />
      );

    if (f.type === "date")
      return (
        <TextField
          value={val ? new Date(val).toISOString().slice(0, 10) : ""}
          type="date"
          onChange={(e) => {
            const v = e.target.value;
            set(f.key, v === "" ? undefined : v);
          }}
          fullWidth
        />
      );

    if (f.type === "boolean")
      return (
        <Select
          value={
            form[f.key] === undefined ? "" : form[f.key] // true o false
          }
          onChange={(e) => {
            const v = e.target.value;
            // "" → undefined  |  "true"/"false" → boolean
            set(f.key, v === "" ? undefined : v === "true");
          }}
          fullWidth
          displayEmpty
        >
          <MenuItem value="">
            <em>Sin selección</em>
          </MenuItem>
          <MenuItem value="true">Sí</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      );

    if (f.type === "select")
      return (
        <Select
          value={val === undefined ? "" : val}
          onChange={(e) =>
            set(f.key, e.target.value === "" ? undefined : e.target.value)
          }
          fullWidth
          displayEmpty
        >
          <MenuItem value="">
            <em>Sin selección</em>
          </MenuItem>
          {f.options?.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
      );
    if (f.type === "multiselect")
      return (
        <Select
          multiple
          value={Array.isArray(val) ? val : []}
          onChange={(e) => {
            const arr = e.target.value as string[];
            // si el usuario desmarca todo, arr.length === 0  → guardamos undefined
            set(f.key, arr.length ? arr : undefined);
          }}
          fullWidth
          renderValue={(selected) =>
            (selected as string[]).length
              ? (selected as string[]).join(", ")
              : "Sin selección"
          }
        >
          {f.options?.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
      );
  };

  /* guardar */
  async function handleSave() {
    const payload = {
      idExterno: form.idExterno || undefined,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      birthDate: form.birthDate,
      // extraData: extra.reduce((acc, f) => {
      //   if (form[f.key] !== undefined) acc[f.key] = form[f.key];
      //   return acc;
      // }, {} as Record<string, any>),
      extraData: extra.reduce((acc, f) => {
        const v = form[f.key];
        if (v !== undefined && !(Array.isArray(v) && !v.length)) acc[f.key] = v;
        return acc;
      }, {} as Record<string, any>),
    };

    const res = editRecord
      ? await updatePersonnel(editRecord._id, payload)
      : await createPersonnel(payload);

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const msg = await res.json();
      alert(msg.message || "Error al guardar");
    }
  }

  const allFields = [...basic, ...extra];

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editRecord ? "Editar personal" : "Nuevo personal"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {allFields.map((f) => (
              <div key={f.key}>
                <label>{f.label}</label>
                {renderField(f)}
              </div>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <ModalComponent
        open={openModal}
        variant="success"
        message="Personal guardado exitosamente"
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}
