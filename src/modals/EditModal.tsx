import { motion } from 'framer-motion';
import { useState, ReactNode, FC } from 'react';
import { X, Edit3, Package, DollarSign, Hash, AlertTriangle, Save } from 'lucide-react';
import { PUT } from '@/services/api';
type ModalBackdropProps = {
  children: ReactNode;
  onClose: () => void;
};

const ModalBackdrop: FC<ModalBackdropProps> = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

type ItemType = {
  _id?: string;
  name: string;
  price: { $numberDecimal: string } | number;
  unit: string;
  description?: string;
};

type EditModalProps = {
  item?: ItemType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: ItemType) => void;
};

const EditModal: FC<EditModalProps> = ({ item, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<ItemType>({
    _id: item?._id,
    name: item?.name || '',
    price: item?.price || 0,
    unit: item?.unit || 'kg',
    description: item?.description || ''
  });
const getPrice = (price: { $numberDecimal: string } | number): number => {
        return typeof price === 'object' && '$numberDecimal' in price
            ? parseFloat(price.$numberDecimal)
            : Number(price);
    };
  const [errors, setErrors] = useState<Partial<Record<keyof ItemType, string>>>({});

  const units = ['kg', 'grams', 'liters', 'pieces', 'dozen', 'box', 'pack'];

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ItemType, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (getPrice(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        PUT(`/menu/edit/${item._id}`, formData);
      }
      catch(error) {
        console.error(error);
      }
      onSave({ ...item, ...formData });
      onClose();
    }
  };

  const handleChange = (field: keyof ItemType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full">
        {/* Clean Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Edit3 size={20} className="text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
                <p className="text-sm text-gray-500">Update item details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Simple Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-purple-500 ${
                  errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Price and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={getPrice(formData.price)}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-purple-500 ${
                    errors.price ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-purple-500"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-purple-500"
                rows={3}
                placeholder="Add description..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 border px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-purple-500"
              >
                <Save size={16} className='text-purple-500'/>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default EditModal;
