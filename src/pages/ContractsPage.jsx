// src/pages/ContractsPage.jsx - Client-side pagination with all data loaded

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  message,
  Space,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiFileText,
} from "react-icons/fi";
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
} from "../store/slices/contractSlice";
import dayjs from "dayjs";

const ContractsPage = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  // Local pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const dispatch = useDispatch();

  // Get all data from Redux store
  const { contracts, loading } = useSelector((state) => state.contracts);

  // Load ALL contracts when component mounts
  useEffect(() => {
    // Load all contracts without pagination parameters
    dispatch(getContracts());
    console.log(contracts);
  }, [dispatch]);

  // Calculate paginated data on client side
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return contracts.slice(startIndex, endIndex);
  }, [contracts, currentPage, pageSize]);

  // Calculate total for pagination
  const total = contracts.length;

  // Handle pagination change (client-side only)
  const handleTableChange = (paginationInfo) => {
    setCurrentPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  // Validation for create form
  const validateCreateForm = () => {
    const values = form.getFieldsValue();
    const isValid =
      values.number && values.number.trim() !== "" && values.signed_date;
    setIsFormValid(isValid);
  };

  // Validation for edit form
  const validateEditForm = () => {
    const values = editForm.getFieldsValue();
    const isValid =
      values.number && values.number.trim() !== "" && values.signed_date;
    setIsEditFormValid(isValid);
  };

  // Direct delete without dependency check
  const handleDeleteClick = (contract) => {
    Modal.confirm({
      title: "Удалить договор?",
      content: `Вы уверены, что хотите удалить договор "${contract.number}"?`,
      okText: "Да, удалить",
      cancelText: "Отмена",
      okType: "danger",
      onOk: () => handleDelete(contract.id),
    });
  };

  const handleCreate = async (values) => {
    try {
      const formData = new FormData();
      formData.append("number", values.number.trim());
      formData.append("signed_date", values.signed_date.format("YYYY-MM-DD"));

      if (values.file && values.file.fileList && values.file.fileList[0]) {
        formData.append("file", values.file.fileList[0].originFileObj);
      }

      await dispatch(createContract(formData)).unwrap();
      message.success("Договор успешно создан!");
      setCreateModalVisible(false);
      form.resetFields();
      setIsFormValid(false);

      // Reload all contracts to get fresh data
      dispatch(getContracts());

      // Go to first page to see new contract
      setCurrentPage(1);
    } catch (error) {
      message.error("Ошибка при создании договора");
    }
  };

  const handleEdit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("number", values.number.trim());
      formData.append("signed_date", values.signed_date.format("YYYY-MM-DD"));

      if (values.file && values.file.fileList && values.file.fileList[0]) {
        formData.append("file", values.file.fileList[0].originFileObj);
      }

      await dispatch(
        updateContract({
          id: selectedContract.id,
          data: formData,
        })
      ).unwrap();

      message.success("Договор успешно обновлен!");
      setEditModalVisible(false);
      setSelectedContract(null);
      editForm.resetFields();
      setIsEditFormValid(false);

      // Reload all contracts to get fresh data
      dispatch(getContracts());
    } catch (error) {
      message.error("Ошибка при обновлении договора");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteContract(id)).unwrap();
      message.success("Договор успешно удален!");

      // Reload all contracts to get fresh data
      dispatch(getContracts());

      // Check if we need to go to previous page after deletion
      const newTotal = total - 1;
      const maxPage = Math.ceil(newTotal / pageSize);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (error) {
      message.error("Ошибка при удалении договора");
    }
  };

  const handleView = (contract) => {
    if (contract.file) {
      window.open(contract.file, "_blank");
    } else {
      message.info("Файл договора не найден");
    }
  };

  const handleDownload = (contract) => {
    if (contract.file) {
      const link = document.createElement("a");
      link.href = contract.file;
      link.download = `contract_${contract.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.info("Файл договора не найден");
    }
  };

  const openEditModal = (contract) => {
    setSelectedContract(contract);
    editForm.setFieldsValue({
      number: contract.number,
      signed_date: dayjs(contract.signed_date),
    });
    setEditModalVisible(true);
    // Validate initial form state
    setTimeout(validateEditForm, 0);
  };

  const openCreateModal = () => {
    setCreateModalVisible(true);
    setIsFormValid(false);
  };

  const columns = [
    {
      title: "Номер договора",
      dataIndex: "number",
      key: "number",
      render: (text) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FiFileText className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">{text}</span>
        </div>
      ),
    },
    {
      title: "Дата заключения",
      dataIndex: "signed_date",
      key: "signed_date",
      render: (date) => (
        <span className="text-gray-600">
          {dayjs(date).format("DD.MM.YYYY")}
        </span>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<FiEye />}
            onClick={() => handleView(record)}
            className="text-indigo-500 hover:text-indigo-600"
          />
          <Button
            type="text"
            icon={<FiEdit />}
            onClick={() => openEditModal(record)}
            className="text-orange-500 hover:text-orange-600"
          />
          <Button
            type="text"
            danger
            icon={<FiTrash2 />}
            onClick={() => handleDeleteClick(record)}
            className="text-red-500 hover:text-red-600"
          />
          <Button
            type="text"
            icon={<FiDownload />}
            onClick={() => handleDownload(record)}
            className="text-green-500 hover:text-green-600"
          />
        </Space>
      ),
    },
  ];

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: ".pdf,.doc,.docx",
  };

  return (
    <div>
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={openCreateModal}
            className="bg-[#EEF2FF] create-contract p-7 border-[3px] rounded-xl border-[#6366F1] border-dashed text-lg font-semibold text-[#6366F1] items-center justify-center"
            style={{ display: "flex", width: "100%" }}
          >
            <FiPlus size={20} /> Добавить новый договор
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Список ({total} договоров)
          </h2>
        </div>

        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} договоров`,
            pageSizeOptions: ["5", "10", "20", "50", "100"],
          }}
          className="border rounded-lg"
        />
      </Card>

      {/* Create Contract Modal */}
      <Modal
        title="Добавить новый договор"
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setIsFormValid(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          onFieldsChange={validateCreateForm}
        >
          <Form.Item
            label="Номер договора"
            name="number"
            rules={[
              { required: true, message: "Введите номер договора!" },
              {
                validator: (_, value) => {
                  if (value && value.trim() === "") {
                    return Promise.reject(
                      new Error("Номер договора не может быть пустым!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Введите номер договора" />
          </Form.Item>

          <Form.Item
            label="Дата заключения"
            name="signed_date"
            rules={[{ required: true, message: "Выберите дату заключения!" }]}
          >
            <DatePicker
              placeholder="Выберите дату"
              className="w-full"
              format="DD.MM.YYYY"
            />
          </Form.Item>

          <Form.Item label="Файл договора" name="file" valuePropName="file">
            <Upload {...uploadProps} listType="text">
              <Button icon={<FiUpload />}>Выберите файл</Button>
            </Upload>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
                setIsFormValid(false);
              }}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!isFormValid}
            >
              {loading ? "Создание..." : "Создать договор"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Contract Modal */}
      <Modal
        title="Редактировать договор"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedContract(null);
          editForm.resetFields();
          setIsEditFormValid(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          onFieldsChange={validateEditForm}
        >
          <Form.Item
            label="Номер договора"
            name="number"
            rules={[
              { required: true, message: "Введите номер договора!" },
              {
                validator: (_, value) => {
                  if (value && value.trim() === "") {
                    return Promise.reject(
                      new Error("Номер договора не может быть пустым!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Введите номер договора" />
          </Form.Item>

          <Form.Item
            label="Дата заключения"
            name="signed_date"
            rules={[{ required: true, message: "Выберите дату заключения!" }]}
          >
            <DatePicker
              placeholder="Выберите дату"
              className="w-full"
              format="DD.MM.YYYY"
            />
          </Form.Item>

          <Form.Item label="Файл договора" name="file" valuePropName="file">
            <Upload {...uploadProps} listType="text">
              <Button icon={<FiUpload />}>Выберите новый файл</Button>
            </Upload>
            {selectedContract?.file && (
              <div className="mt-2 text-sm text-gray-500">
                Текущий файл: {selectedContract.file.split("/").pop()}
              </div>
            )}
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setSelectedContract(null);
                editForm.resetFields();
                setIsEditFormValid(false);
              }}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!isEditFormValid}
            >
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractsPage;
