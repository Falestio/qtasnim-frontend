"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
} from "@nextui-org/react";
import axios from "axios";

interface JenisBarangTerjual {
  jenis_barang: string;
  total_terjual: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<JenisBarangTerjual[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch data function
  const fetchData = async (
    start?: string,
    end?: string,
    order: "asc" | "desc" = "desc"
  ) => {
    setLoading(true);
    try {
      const params: { [key: string]: string } = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      params.sort_order = order;

      console.log("Params", params);

      const response = await axios.get(
        "http://localhost:8000/api/v1/jenis_barang_terjual",
        { params }
      );

      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(startDate, endDate, sortOrder);
  };

  const handleSortTotalTerjual = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";(newSortOrder); 
    fetchData(startDate, endDate, newSortOrder); 
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Data Jenis Barang Terjual</h2>
      <form className="mb-4" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button type="submit">Filter</Button>
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table aria-label="Daftar Jenis Barang Terjual">
          <TableHeader>
            <TableColumn>Jenis Barang</TableColumn>
            <TableColumn
              onClick={handleSortTotalTerjual}
              style={{ cursor: "pointer" }}
            >
              Total Terjual {sortOrder === "asc" ? "↑" : "↓"}
            </TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.jenis_barang}>
                <TableCell>{item.jenis_barang}</TableCell>
                <TableCell>{item.total_terjual}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
