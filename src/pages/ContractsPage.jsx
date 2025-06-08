"use client";

import { useEffect, useState } from "react";
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
  Popconfirm,
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
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const dispatch = useDispatch();
  const { contracts, loading, pagination } = useSelector(
    (state) => state.contracts
  );

  useEffect(() => {
    const loadContracts = async () => {
      try {
        await dispatch(getContracts()).unwrap();
      } catch (error) {
        console.error("Shartnomalarni yuklashda xato:", error);
        message.error("Ma'lumotlarni yuklashda xato yuz berdi");
      }
    };

    loadContracts();
  }, [dispatch]);

  const handleCreate = async (values) => {
    try {
      const formData = new FormData();
      formData.append("number", values.number);
      formData.append("valid_until", values.valid_until.format("YYYY-MM-DD"));

      if (values.file && values.file.fileList && values.file.fileList[0]) {
        formData.append("file", values.file.fileList[0].originFileObj);
      }

      await dispatch(createContract(formData)).unwrap();
      message.success("Договор успешно создан!");
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Ошибка при создании договора");
    }
  };

  const handleEdit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("number", values.number);
      formData.append("valid_until", values.valid_until.format("YYYY-MM-DD"));

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
    } catch (error) {
      message.error("Ошибка при обновлении договора");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteContract(id)).unwrap();
      message.success("Договор успешно удален!");
    } catch (error) {
      message.error("Ошибка при удалении договора");
    }
  };

  const handleView = (contract) => {
    if (contract.file) {
      window.open(contract.file, "_blank");
    } else {
      message.info("Фа��л договора не найден");
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
      valid_until: dayjs(contract.valid_until),
    });
    setEditModalVisible(true);
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
      dataIndex: "valid_until",
      key: "valid_until",
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
          <Popconfirm
            title="Удалить договор?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="text"
              danger
              icon={<FiTrash2 />}
              className="text-red-500 hover:text-red-600"
            />
          </Popconfirm>
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
            onClick={() => setCreateModalVisible(true)}
            className="bg-[#EEF2FF] create-contract p-7 border-[3px] rounded-xl border-[#6366F1] border-dashed text-lg font-semibold text-[#6366F1] items-center justify-center"
            style={{ display: "flex", width: "100%" }}
          >
            <FiPlus size={20} /> Добавить новый договор
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Список</h2>
        </div>

        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} договоров`,
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
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Номер договора"
            name="number"
            rules={[{ required: true, message: "Введите номер договора!" }]}
          >
            <Input placeholder="Введите номер договора" />
          </Form.Item>

          <Form.Item
            label="Дата заключения"
            name="valid_until"
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
              }}
            >
              Отмена
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Создать договор
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
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            label="Номер договора"
            name="number"
            rules={[{ required: true, message: "Введите номер договора!" }]}
          >
            <Input placeholder="Введите номер договора" />
          </Form.Item>

          <Form.Item
            label="Дата заключения"
            name="valid_until"
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
              }}
            >
              Отмена
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Сохранить изменения
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractsPage;
