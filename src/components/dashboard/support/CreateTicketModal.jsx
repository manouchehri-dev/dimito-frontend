"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Upload, FileText, AlertCircle, Trash2 } from "lucide-react";
import { useCreateTicket, useUploadAttachment } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const t = useTranslations("support");

  const createTicketMutation = useCreateTicket({
    onSuccess: async (newTicket) => {
      toast.success(t("ticketCreatedSuccess"));
      
      // Upload attachments if any
      if (selectedFiles.length > 0) {
        toast.loading(t("uploadingAttachments", { count: selectedFiles.length }));
        try {
          await uploadAttachments(newTicket.id);
          toast.dismiss();
          toast.success(t("attachmentsUploadedSuccess"));
        } catch (error) {
          toast.dismiss();
          toast.error(t("attachmentsUploadError"));
        }
      }
      
      onTicketCreated();
      resetForm();
    },
    onError: (error) => {
      toast.error(t("ticketCreatedError"));
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  });

  const uploadAttachmentMutation = useUploadAttachment();

  const uploadAttachments = async (ticketId) => {
    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file.file);
        if (file.description) {
          formData.append('description', file.description);
        }

        console.log('Uploading file:', {
          fileName: file.file.name,
          fileSize: file.file.size,
          fileType: file.file.type,
          ticketId,
          description: file.description,
          isFileObject: file.file instanceof File
        });

        // Debug FormData contents
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(key, ':', value instanceof File ? `File(${value.name})` : value);
        }

        await uploadAttachmentMutation.mutateAsync({ ticketId, formData });
      } catch (error) {
        console.error(`Error uploading file ${file.file.name}:`, error);
        toast.error(t("fileUploadError", { fileName: file.file.name }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t("validation.titleRequired");
    if (!formData.description.trim()) newErrors.description = t("validation.descriptionRequired");
    if (!formData.category) newErrors.category = t("validation.categoryRequired");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createTicketMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: parseInt(formData.category),
      priority: formData.priority
    });
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    console.log('Files selected:', files.length, files);
    const maxSize = 150 * 1024 * 1024; // 150MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip', 'application/x-zip-compressed'
    ];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(t("fileTooLarge", { fileName: file.name }));
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(t("fileTypeNotAllowed", { fileName: file.name }));
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      description: ''
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileDescription = (fileId, description) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, description } : f
    ));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: '', priority: 'MEDIUM' });
    setSelectedFiles([]);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t("createTicket")}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.title")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder={t("form.titlePlaceholder")}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("form.category")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{t("form.selectCategory")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {t(`categories.${cat.name}`) || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("form.priority")}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="LOW">{t("priority.low")}</option>
                  <option value="MEDIUM">{t("priority.medium")}</option>
                  <option value="HIGH">{t("priority.high")}</option>
                  <option value="CRITICAL">{t("priority.critical")}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.description")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder={t("form.descriptionPlaceholder")}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.attachments")}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={createTicketMutation.isPending}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-gray-600 hover:text-orange-600"
                >
                  <Upload className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-medium">{t("form.uploadFiles")}</p>
                    <p className="text-sm">{t("form.uploadHint")}</p>
                  </div>
                </label>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((fileItem) => (
                    <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <input
                          type="text"
                          placeholder={t("form.fileDescription")}
                          value={fileItem.description}
                          onChange={(e) => updateFileDescription(fileItem.id, e.target.value)}
                          className="mt-1 w-full text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                          disabled={createTicketMutation.isPending}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(fileItem.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        disabled={createTicketMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {createTicketMutation.isPending ? t("creating") : t("createTicket")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
