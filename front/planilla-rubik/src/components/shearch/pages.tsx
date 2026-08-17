import React, { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
interface SearchProps {
  onSearch: (searchTerm: string) => void;
}
export default function Search({ onSearch }: SearchProps) {
  const [, setSearchTerm] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term); // Pasamos el valor al padre
  };

  return (
    <TextField
      placeholder="Buscar"
      variant="standard"
      InputProps={{
        disableUnderline: true,
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: "1.9rem" }} />
          </InputAdornment>
        ),
      }}
      className="search-card-toggle-search-input"
      onChange={handleSearchChange}
    />
  );
}
