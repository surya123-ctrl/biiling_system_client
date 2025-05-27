
import { useState, ReactNode, FC } from 'react';
import { X, Trash2 } from 'lucide-react';
import { DELETE } from '@/services/api';
type ModalBackdropProps = {
  children: ReactNode;
  onClose: () => void;
};

const ModalBackdrop: FC<ModalBackdropProps> = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

type ItemType = {
  _id?: string;
  name: string;
  price: { $numberDecimal: string } | number;
  unit: string;
  description?: string;
};

type DeleteModalProps = {
  item: ItemType;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id?: string) => void;
};

const DeleteModal: FC<DeleteModalProps> = ({ item, isOpen, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setTimeout(() => {
      onConfirm(item?._id);
      DELETE(`/menu/delete/${item._id}`)
      setIsDeleting(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;
  
  const getPrice = (price: { $numberDecimal: string } | number): number => {
    return typeof price === 'object' && '$numberDecimal' in price
      ? parseFloat(price.$numberDecimal)
      : Number(price);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full mx-4">
        {/* Clean Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Delete Item</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-1">{item?.name}</h3>
            <p className="text-sm text-gray-600">
              ₹{getPrice(item?.price)} per {item?.unit}
            </p>
            {item?.description && (
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">
              Are you sure you want to delete "<span className="font-medium">{item?.name}</span>"? 
              This will permanently remove the item and cannot be undone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 text-purple-500 border px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};
export default DeleteModal;
