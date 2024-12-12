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
} from "@nextui-org/react";
import axios from "axios";

interface JenisBarang {
  jenis_barang_id: number;
  jenis_barang: string;
}

interface BarangTerkait {
  id: number;
  nama_barang: string;
  stok: number;
  jenis_barang_id: number;
  created_at: string;
  updated_at: string;
}

export default function JenisBarangPage() {
  const [jenisBarangData, setJenisBarangData] = useState<JenisBarang[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJenisBarang, setSelectedJenisBarang] =
    useState<JenisBarang | null>(null);
  const [relatedItems, setRelatedItems] = useState<BarangTerkait[]>([]);

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

  const fetchJenisBarang = async (page: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/jenis_barang?per_page=5&page=${page}`
      );
      setJenisBarangData(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const handleAddJenisBarang = async () => {
    if (selectedJenisBarang) {
      try {
        await axios.post(`http://localhost:8000/api/v1/jenis_barang`, {
          jenis_barang: selectedJenisBarang.jenis_barang,
        });
        fetchJenisBarang(currentPage);
        onOpenChangeAdd();
        toast.success(`Berhasil menambah jenis barang.`);
      } catch (error) {
        toast.error(`${error}`);
      }
    }
  };

  const handleUpdateJenisBarang = async () => {
    if (selectedJenisBarang) {
      try {
        await axios.put(
          `http://localhost:8000/api/v1/jenis_barang/${selectedJenisBarang.jenis_barang_id}`,
          {
            jenis_barang: selectedJenisBarang.jenis_barang,
          }
        );
        fetchJenisBarang(currentPage);
        onOpenChangeEdit();
        toast.success(`Berhasil mengubah jenis barang.`);
      } catch (error) {
        toast.error(`${error}`);
      }
    }
  };

  const handleDeleteJenisBarang = async (id: number, isForce: boolean) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/jenis_barang/${id}${isForce ? "?isForce=true" : ""}`
      );

      fetchJenisBarang(currentPage);
      toast.success(`Berhasil menghapus jenis barang.`);
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setRelatedItems(error.response.data.barang_terkait);
        onOpenDelete();
      } else {
        toast.error(`${error}`);
      }
    }
  };

  useEffect(() => {
    fetchJenisBarang(currentPage);
  }, [currentPage]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Daftar Jenis Barang</h2>
      <Button className="mb-4" onPress={onOpenAdd}>
        Tambah Jenis Barang
      </Button>
      <Table aria-label="Daftar Jenis Barang">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Jenis Barang</TableColumn>
          <TableColumn>Aksi</TableColumn>
        </TableHeader>
        <TableBody>
          {jenisBarangData.map((item: JenisBarang) => (
            <TableRow
              key={item.jenis_barang_id}
              className="hover:bg-gray-100 cursor-pointer rounded-lg"
              onClick={() => {
                setSelectedJenisBarang(item);
                onOpenEdit();
              }}
            >
              <TableCell>{item.jenis_barang_id}</TableCell>
              <TableCell>{item.jenis_barang}</TableCell>
              <TableCell>
                <Button
                  color="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJenisBarang(item);
                    handleDeleteJenisBarang(item.jenis_barang_id, false);
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
        isOpen={isAddOpen}
        style={{ minHeight: `500px` }}
        isDismissable={false}
        onOpenChange={onOpenChangeAdd}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Tambah Jenis Barang
              </ModalHeader>
              <ModalBody>
                <form>
                  <div className="mb-4">
                    <Input
                      required
                      id="jenis_barang"
                      label="Jenis Barang"
                      labelPlacement="outside"
                      name="jenis_barang"
                      placeholder="Enter the type of item"
                      type="text"
                      value={selectedJenisBarang?.jenis_barang || ""}
                      onChange={(e) =>
                        setSelectedJenisBarang({
                          jenis_barang_id: 0,
                          jenis_barang: e.target.value,
                        })
                      }
                    />
                  </div>
                </form>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleAddJenisBarang}>
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        style={{ minHeight: `500px` }}
        isDismissable={false}
        onOpenChange={onOpenChangeEdit}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Jenis Barang
              </ModalHeader>
              <ModalBody>
                <form>
                  <div className="mb-4">
                    <Input
                      id="jenis_barang"
                      isRequired
                      label="Jenis Barang"
                      labelPlacement="outside"
                      name="jenis_barang"
                      placeholder="Enter the type of item"
                      type="text"
                      value={selectedJenisBarang?.jenis_barang || ""}
                      onChange={(e) =>
                        setSelectedJenisBarang({
                          jenis_barang_id:
                            selectedJenisBarang?.jenis_barang_id ?? 0,
                          jenis_barang: e.target.value,
                        })
                      }
                    />
                  </div>
                </form>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleUpdateJenisBarang}>
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
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
                <p>
                  Jenis barang ini masih terkait dengan barang-barang berikut:
                </p>
                <ul>
                  {relatedItems.map((item) => (
                    <li key={item.id}>
                      {item.nama_barang} (Stok: {item.stok})
                    </li>
                  ))}
                </ul>
                <p>Apakah Anda yakin ingin menghapusnya?</p>
                <p>Semua barang yang terkait akan terhapus</p>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleDeleteJenisBarang(
                      selectedJenisBarang?.jenis_barang_id ?? 0,
                      true
                    );
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
