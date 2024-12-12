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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Form,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import axios from "axios";

import { formatDate } from "@/utils/formatDate";

interface JenisBarang {
  jenis_barang_id: number;
  jenis_barang: string;
}

interface Barang {
  id: number;
  nama_barang: string;
  stok: number;
  jenis_barang_id: number;
  created_at: string;
  updated_at: string;
  jenis_barang?: JenisBarang;
}

interface TransaksiTerkait {
  id: number;
  barang_id: number;
  jumlah_terjual: number;
  tanggal_transaksi: string;
  created_at: string;
  updated_at: string;
}

export default function BarangPage() {
  const [barangData, setBarangData] = useState<Barang[]>([]);
  const [jenisBarangData, setJenisBarangData] = useState<JenisBarang[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("nama_barang");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [relatedTransaksi, setRelatedTransaksi] = useState<TransaksiTerkait[]>(
    []
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onOpenChange: onOpenChangeDelete,
  } = useDisclosure();

  const {
    isOpen: isAddOpen,
    onOpen: onOpenAdd,
    onOpenChange: onOpenChangeAdd,
  } = useDisclosure();

  const [newBarang, setNewBarang] = useState<any>({
    nama_barang: "",
    stok: 0,
    jenis_barang_id: 0,
    created_at: "",
    updated_at: "",
  });

  const fetchData = async (
    page: number,
    query: string,
    sortBy: string,
    sortOrder: string
  ) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/barang?per_page=5&page=${page}&sort_order=${sortOrder}&sort_by=${sortBy}&query=${query}`
      );

      setBarangData(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const fetchJenisBarang = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/jenis_barang?isPaginated=false`
      );

      setJenisBarangData(response.data);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const fetchBarangDetails = async (id: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/barang/${id}`
      );

      setSelectedBarang(response.data);
      onOpen();
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const addBarang = async () => {
    try {
      await axios.post("http://localhost:8000/api/v1/barang", newBarang);
      fetchData(currentPage, searchQuery, sortBy, sortOrder);
      setNewBarang({
        nama_barang: "",
        stok: 0,
        jenis_barang_id: 0,
        created_at: "",
        updated_at: "",
      });
      onOpenChangeAdd();
      toast.success("Berhasil menambah barang");
    } catch (error) {
      toast.error(`Gagal menambah barang: ${error}`);
    }
  };

  const saveBarangDetails = async () => {
    console.log("saving barang:", selectedBarang);
    if (!selectedBarang) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/api/v1/barang/${selectedBarang.id}`,
        selectedBarang
      );

      toast.success("Berhasil mengubah barang");
      fetchData(currentPage, searchQuery, sortBy, sortOrder);
      onOpenChange();
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchQuery, sortBy, sortOrder);
    fetchJenisBarang();
  }, [currentPage, searchQuery, sortBy, sortOrder]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setCurrentPage(1);
      fetchData(1, searchQuery, sortBy, sortOrder);
    }
  };

  const handleSort = (column: string) => {
    if (column === sortBy) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
    fetchData(1, searchQuery, column, sortOrder);
  };

  const handleJenisBarangChange = (e: any) => {
    const selectedJenis = jenisBarangData.find(
      (jenis) => jenis.jenis_barang_id.toString() === e.target.value
    );

    if (selectedJenis) {
      setSelectedBarang((prev) => ({
        ...prev!,
        jenis_barang_id: selectedJenis.jenis_barang_id,
      }));
    }
  };

  const handleDeleteBarang = async (barang: Barang, isForce: boolean) => {
    setSelectedBarang(barang);
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/barang/${barang.id}${isForce ? "?isForce=true" : ""}`
      );

      fetchData(currentPage, searchQuery, sortBy, sortOrder);
      toast.success("Berhasil menghapus barang");
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setRelatedTransaksi(error.response.data.transaksi_terkait);
        onOpenDelete();
      } else {
        toast.error(`${error}`);
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Daftar Barang</h2>
      <Button onClick={onOpenAdd} className="mb-4">
        Tambah Barang
      </Button>{" "}
      {/* Button to open add modal */}
      <Input
        placeholder="Cari barang..."
        value={searchQuery}
        className="mb-4"
        onChange={handleSearchChange}
        onKeyPress={handleKeyPress}
      />
      <Table aria-label="Daftar Barang">
        <TableHeader>
          <TableColumn onClick={() => handleSort("id")}>ID</TableColumn>
          <TableColumn
            onClick={() => handleSort("nama_barang")}
            className="cursor-pointer"
          >
            Nama Barang {sortOrder === "asc" ? "↑" : "↓"}
          </TableColumn>
          <TableColumn>Stok</TableColumn>
          <TableColumn>Jenis Barang</TableColumn>
          <TableColumn>Dibuat pada</TableColumn>
          <TableColumn>Aksi</TableColumn>
        </TableHeader>
        <TableBody>
          {barangData.map((item: Barang) => (
            <TableRow
              key={item.id}
              className="hover:bg-gray-100 cursor-pointer rounded-lg"
              onClick={() => fetchBarangDetails(item.id)}
            >
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.nama_barang}</TableCell>
              <TableCell>{item.stok}</TableCell>
              <TableCell>{item.jenis_barang?.jenis_barang}</TableCell>
              <TableCell>{formatDate(item.created_at)}</TableCell>
              <TableCell>
                <Button
                  color="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBarang(item, false);
                  }}
                >
                  Hapus
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-center">
        <Pagination
          total={totalPages}
          initialPage={1}
          onChange={(page) => {
            setCurrentPage(page);
          }}
        />
      </div>
     <Modal
        isOpen={isOpen}
        isDismissable={false}
        style={{ minHeight: `500px` }}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Detail Barang
              </ModalHeader>
              <ModalBody>
                {selectedBarang ? (
                  <Form>
                    <div className="mb-4">
                      <Input
                        isRequired
                        id="barang-nama"
                        label="Nama Barang"
                        labelPlacement="outside"
                        name="nama_barang"
                        placeholder="Enter the name of the item"
                        type="text"
                        value={selectedBarang.nama_barang}
                        onChange={(e) =>
                          setSelectedBarang({
                            ...selectedBarang,
                            nama_barang: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <Input
                        isRequired
                        id="barang-stok"
                        label="Stok"
                        labelPlacement="outside"
                        name="stok"
                        placeholder="Enter the stock quantity"
                        type="number"
                        value={selectedBarang.stok.toString()}
                        onChange={(e) =>
                          setSelectedBarang({
                            ...selectedBarang,
                            stok: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <Autocomplete
                        label="Pilih Jenis Barang"
                        placeholder="Cari jenis barang..."
                        disabledKeys={["empty-state"]}
                        selectedKey={
                          selectedBarang?.jenis_barang_id.toString() || ""
                        }
                        onSelectionChange={(value) => {
                          setSelectedBarang((prev) => ({
                            ...prev!,
                            jenis_barang_id: Number(value),
                          }));
                        }}
                      >
                        {Array.isArray(jenisBarangData) &&
                        jenisBarangData.length > 0 ? (
                          jenisBarangData.map((jenis) => (
                            <AutocompleteItem
                              key={jenis.jenis_barang_id}
                              value={jenis.jenis_barang_id.toString()}
                            >
                              {jenis.jenis_barang}
                            </AutocompleteItem>
                          ))
                        ) : (
                          <AutocompleteItem key="empty-state">
                            Tidak ada jenis barang tersedia
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                    </div>
                  </Form>
                ) : (
                  <p>Loading...</p>
                )}
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={saveBarangDetails}>
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isAddOpen}
        onOpenChange={onOpenChangeAdd}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>Tambah Barang</ModalHeader>
          <ModalBody>
            <form>
              <div className="mb-4">
                <Input
                  required
                  label="Nama Barang"
                  placeholder="Masukkan nama barang"
                  value={newBarang.nama_barang}
                  onChange={(e) =>
                    setNewBarang({ ...newBarang, nama_barang: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <Autocomplete
                  required
                  label="Pilih Jenis Barang"
                  placeholder="Cari jenis barang..."
                  disabledKeys={["empty-state"]}
                  onSelectionChange={(value) => {
                    setNewBarang({
                      ...newBarang,
                      jenis_barang_id: Number(value),
                    });
                  }}
                >
                  {Array.isArray(barangData) && barangData.length > 0 ? (
                    jenisBarangData.map((jenisBarang) => (
                      <AutocompleteItem
                        key={jenisBarang.jenis_barang_id}
                        value={jenisBarang.jenis_barang_id.toString()}
                      >
                        {jenisBarang.jenis_barang}
                      </AutocompleteItem>
                    ))
                  ) : (
                    <AutocompleteItem key="empty-state">
                      Tidak ada jenis barang tersedia
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>
              <div className="mb-4">
                <Input
                  required
                  label="Stok"
                  type="number"
                  value={newBarang.stok.toString()}
                  onChange={(e) =>
                    setNewBarang({ ...newBarang, stok: Number(e.target.value) })
                  }
                />
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChangeAdd}>
              Tutup
            </Button>
            <Button color="primary" onPress={addBarang}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        style={{ minHeight: `500px` }}
        isDismissable={false}
        onOpenChange={onOpenChangeDelete}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Konfirmasi Hapus
              </ModalHeader>
              <ModalBody>
                <p>Jenis barang ini masih terkait dengan transaksi berikut:</p>
                <ul>
                  {relatedTransaksi.map((transaksi) => (
                    <li key={transaksi.id}>
                      Transaksi ID: {transaksi.id}, Jumlah Terjual:{" "}
                      {transaksi.jumlah_terjual}, Tanggal:{" "}
                      {transaksi.tanggal_transaksi}
                    </li>
                  ))}
                </ul>
                <p>Apakah Anda yakin ingin menghapusnya?</p>
                <p>Semua transaksi yang terkait akan terhapus.</p>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleDeleteBarang(selectedBarang!, true); // Force delete
                    onClose();
                  }}
                >
                  Hapus dengan Paksa
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
