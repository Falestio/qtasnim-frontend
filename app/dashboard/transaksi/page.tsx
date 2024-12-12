"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Autocomplete,
  AutocompleteItem,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";

interface Transaksi {
  id: number;
  barang_id: number;
  barang: any;
  jumlah_terjual: number;
  tanggal_transaksi: string;
}

interface Barang {
  id: number;
  nama_barang: string;
}

export default function TransaksiPage() {
  const [transaksiData, setTransaksiData] = useState<Transaksi[]>([]);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [barangData, setBarangData] = useState<Barang[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newTransaksi, setNewTransaksi] = useState<any>({
    barang_id: 0,
    jumlah_terjual: 0,
    tanggal_transaksi: "",
  });

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    isOpen: isAddOpen,
    onOpen: onOpenAdd,
    onOpenChange: onOpenChangeAdd,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onOpenEdit,
    onOpenChange: onOpenChangeEdit,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onOpenChange: onOpenChangeDelete,
  } = useDisclosure();

  const fetchTransaksi = async (page: number, order: "asc" | "desc") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/transaksi?per_page=5&page=${page}&sort_order=${order}`
      );

      setTransaksiData(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarang = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/barang?isPaginated=false"
      );
      setBarangData(response.data);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const fetchTransaksiDetails = async (id: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/transaksi/${id}`
      );

      setSelectedTransaksi(response.data);
      onOpenEdit();
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const createTransaksi = async () => {
    try {
      await axios.post("http://localhost:8000/api/v1/transaksi", newTransaksi);
      fetchTransaksi(currentPage, sortOrder);
      setNewTransaksi({
        barang_id: 0,
        jumlah_terjual: 0,
        tanggal_transaksi: "",
      });
      onOpenChangeAdd();
      toast.success("Berhasil menambah transaksi");
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const updateTransaksi = async () => {
    if (!selectedTransaksi) return;
    try {
      await axios.put(
        `http://localhost:8000/api/v1/transaksi/${selectedTransaksi.id}`,
        selectedTransaksi
      );
      fetchTransaksi(currentPage, sortOrder);
      onOpenChangeEdit();
      toast.success("Berhasil mengubah transaksi");
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  // Delete a transaction
  const deleteTransaksi = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/transaksi/${id}`);
      fetchTransaksi(currentPage, sortOrder);
      onOpenChangeDelete();
      toast.success("Berhasil menghapus transaksi");
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  useEffect(() => {
    fetchTransaksi(currentPage, sortOrder);
    fetchBarang();
  }, [currentPage, sortOrder]);

  const handleSortTanggalTransaksi = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    fetchTransaksi(currentPage, newSortOrder);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Daftar Transaksi</h2>
      <Button onClick={onOpenAdd} className="mb-4">
        Tambah Transaksi
      </Button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table aria-label="Daftar Transaksi">
          <TableHeader>
            <TableColumn>Barang</TableColumn>
            <TableColumn>Jumlah Terjual</TableColumn>
            <TableColumn
              onClick={handleSortTanggalTransaksi}
              className="cursor-pointer"
            >
              Tanggal Transaksi {sortOrder === "asc" ? "↑" : "↓"}
            </TableColumn>
            <TableColumn>Aksi</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"Tidak ada transaksi"}>
            {(Array.isArray(transaksiData) ? transaksiData : []).map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-gray-100 cursor-pointer rounded-lg"
                onClick={() => fetchTransaksiDetails(item.id)}
              >
                <TableCell>{item.barang.nama_barang}</TableCell>
                <TableCell>{item.jumlah_terjual}</TableCell>
                <TableCell>{item.tanggal_transaksi}</TableCell>
                <TableCell>
                  <Button
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTransaksi(item);
                      onOpenDelete();
                    }}
                  >
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="mt-4 flex justify-center">
        <Pagination
          total={totalPages}
          initialPage={1}
          onChange={(page) => {
            setCurrentPage(page);
            fetchTransaksi(page, sortOrder);
          }}
        />
      </div>

      <Modal
        isOpen={isAddOpen}
        onOpenChange={onOpenChangeAdd}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>Tambah Transaksi</ModalHeader>
          <ModalBody>
            <form>
              <div className="mb-4">
                <Autocomplete
                  label="Pilih Barang"
                  placeholder="Cari barang..."
                  disabledKeys={["empty-state"]}
                  onSelectionChange={(value) => {
                    setNewTransaksi({
                      ...newTransaksi,
                      barang_id: Number(value),
                    });
                  }}
                >
                  {Array.isArray(barangData) && barangData.length > 0 ? (
                    barangData.map((barang) => (
                      <AutocompleteItem
                        key={barang.id}
                        value={barang.id.toString()}
                      >
                        {barang.nama_barang}
                      </AutocompleteItem>
                    ))
                  ) : (
                    <AutocompleteItem key="empty-state">
                      Tidak ada barang tersedia
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>
              <div className="mb-4">
                <Input
                  label="Jumlah Terjual"
                  type="number"
                  value={newTransaksi.jumlah_terjual.toString()}
                  onChange={(e) =>
                    setNewTransaksi({
                      ...newTransaksi,
                      jumlah_terjual: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Tanggal Transaksi"
                  type="date"
                  value={newTransaksi.tanggal_transaksi}
                  onChange={(e) =>
                    setNewTransaksi({
                      ...newTransaksi,
                      tanggal_transaksi: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChangeAdd}>
              Close
            </Button>
            <Button color="primary" onPress={createTransaksi}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onOpenChange={onOpenChangeEdit}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>Edit Transaksi</ModalHeader>
          <ModalBody>
            {selectedTransaksi ? (
              <form>
                <div className="mb-4">
                  <Autocomplete
                    label="Pilih Barang"
                    placeholder="Cari barang..."
                    disabledKeys={["empty-state"]}
                    selectedKey={selectedTransaksi.barang_id.toString()}
                    onSelectionChange={(value) => {
                      setSelectedTransaksi({
                        ...selectedTransaksi,
                        barang_id: Number(value),
                      });
                    }}
                  >
                    {Array.isArray(barangData) && barangData.length > 0 ? (
                      barangData.map((barang) => (
                        <AutocompleteItem
                          key={barang.id}
                          value={barang.id.toString()}
                        >
                          {barang.nama_barang}
                        </AutocompleteItem>
                      ))
                    ) : (
                      <AutocompleteItem key="empty-state">
                        Tidak ada barang tersedia
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
                <div className="mb-4">
                  <Input
                    label="Jumlah Terjual"
                    type="number"
                    value={selectedTransaksi.jumlah_terjual.toString()}
                    onChange={(e) =>
                      setSelectedTransaksi({
                        ...selectedTransaksi,
                        jumlah_terjual: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    label="Tanggal Transaksi"
                    type="date"
                    value={selectedTransaksi.tanggal_transaksi}
                    onChange={(e) =>
                      setSelectedTransaksi({
                        ...selectedTransaksi,
                        tanggal_transaksi: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </form>
            ) : (
              <p>Loading...</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChangeEdit}>
              Close
            </Button>
            <Button color="primary" onPress={updateTransaksi}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onOpenChangeDelete}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>Konfirmasi Hapus</ModalHeader>
          <ModalBody>
            <p>Apakah Anda yakin ingin menghapus transaksi ini?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChangeDelete}>
              Batal
            </Button>
            <Button
              color="primary"
              onPress={() => {
                if (selectedTransaksi) {
                  deleteTransaksi(selectedTransaksi.id);
                }
              }}
            >
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
