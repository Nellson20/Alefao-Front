import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Loader2, X, Save, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

// Modules
import { useProducts } from '../modules/products/application/useProducts';
import { useProductActions } from '../modules/products/application/useProductActions';

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { products, isLoading, refresh } = useProducts();
  const { createProduct, updateProduct, deleteProduct, isSubmitting } = useProductActions(refresh);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    status: 'IN_STOCK',
    description: '',
    image: '🍔',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category || '',
        status: product.status,
        description: product.description || '',
        image: product.image || '🍔',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: '',
        status: 'IN_STOCK',
        description: '',
        image: '🍔',
      });
    }
    setIsModalOpen(true);
  };

  const confirmDelete = (product: any) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete.id);
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await createProduct(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('inventory.title')}</h1>
          <p className="text-slate-500">{t('inventory.subtitle')}</p>
        </div>
        <Button icon={Plus} onClick={() => handleOpenModal()}>{t('inventory.add_item')}</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <GlassCard key={product.id} className="hover:bg-white/5 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">
                  {product.image || '🍔'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg truncate">{product.name}</h3>
                    <Badge variant={product.status === 'IN_STOCK' ? 'success' : product.status === 'LOW_STOCK' ? 'warning' : 'error'}>
                      {t(`inventory.status.${product.status.toLowerCase()}`, { defaultValue: product.status.replace('_', ' ') })}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{product.category || t('common.no_category')} • {product.description || t('common.no_description')}</p>
                  <p className="text-lg font-black text-primary-400 sm:hidden">${parseFloat(product.price).toFixed(2)}</p>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-xl font-black text-primary-400">${parseFloat(product.price).toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(product)}
                    className="p-3 rounded-xl hover:bg-white/10 transition-colors text-slate-400"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => confirmDelete(product)}
                    className="p-3 rounded-xl hover:bg-rose-500/10 transition-colors text-rose-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
          {products.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
              <Package size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-500 font-medium">{t('inventory.empty')}</p>
              <button onClick={() => handleOpenModal()} className="text-primary-400 font-bold hover:underline mt-2">{t('inventory.add_first')}</button>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <GlassCard className="relative w-full max-w-lg z-10 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{editingProduct ? t('inventory.edit_item') : t('inventory.add_item_title')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('inventory.item_name')}</label>
                  <input 
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Double Cheeseburger"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('inventory.item_price')}</label>
                  <input 
                    type="number" step="0.01" required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('inventory.item_icon')}</label>
                  <input 
                    type="text" 
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('inventory.item_category')}</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Fast Food"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('inventory.item_status')}</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all appearance-none"
                  >
                    <option value="IN_STOCK">{t('inventory.status.in_stock')}</option>
                    <option value="LOW_STOCK">{t('inventory.status.low_stock')}</option>
                    <option value="OUT_OF_STOCK">{t('inventory.status.out_of_stock')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">{t('inventory.item_description')}</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all h-24"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <Button 
                  type="button" variant="secondary" className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" className="flex-1"
                  icon={isSubmitting ? Loader2 : Save}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.saving') : (editingProduct ? t('common.save') : t('common.confirm'))}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
          <GlassCard className="relative w-full max-w-md z-10 animate-fade-in-up border-rose-500/30 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent" />
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20 shadow-lg shadow-rose-500/5">
                <AlertTriangle size={40} className="text-rose-500" />
              </div>
              
              <h2 className="text-2xl font-black mb-2">{t('inventory.delete_title')}</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                {t('inventory.delete_warning', { name: productToDelete?.name })}
              </p>

              <div className="flex gap-4 w-full">
                <Button 
                  variant="secondary" className="flex-1"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  className="flex-1 !bg-rose-500 hover:!bg-rose-600 !text-white shadow-lg shadow-rose-500/20"
                  onClick={handleDelete}
                  icon={isSubmitting ? Loader2 : Trash2}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.deleting') : t('common.delete')}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
