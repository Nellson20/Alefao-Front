import React, { useEffect, useState } from 'react';
import { Package, Search, Filter, Calendar, MapPin, User, Clock, Loader2, ChevronRight, Plus, Edit2, Trash2, X, Save, AlertTriangle, FileText, Image as ImageIcon, Paperclip, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [activeFile, setActiveFile] = useState<any>(null);
  const [fullFileContent, setFullFileContent] = useState<string>('');
  
  const [formData, setFormData] = useState<any>({
    pickupAddress: '',
    deliveryAddress: '',
    pickupLat: '',
    pickupLng: '',
    deliveryLat: '',
    deliveryLng: '',
    clientName: '',
    clientPhone: '',
    clientNote: '',
    weight: '',
    packageType: 'OTHER',
    description: '',
    deliveryType: 'STANDARD',
    paymentMethod: 'CASH',
    price: '',
    requestedAt: new Date().toISOString().split('T')[0],
    deliveryTimeSlot: '',
    attachments: [],
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let response;
      if (user?.role === 'admin') {
        response = await orderService.getAllOrders();
      } else if (user?.role === 'vendor') {
        response = await orderService.getVendorOrders();
      } else if (user?.role === 'driver') {
        response = await orderService.getDriverOrders();
      }

      if (response) {
        setOrders(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleOpenModal = (order: any = null) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        pickupLat: order.pickupLat || '',
        pickupLng: order.pickupLng || '',
        deliveryLat: order.deliveryLat || '',
        deliveryLng: order.deliveryLng || '',
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        clientNote: order.clientNote || '',
        weight: order.weight || '',
        packageType: order.packageType,
        description: order.description || '',
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        price: order.price.toString(),
        requestedAt: new Date(order.requestedAt).toISOString().split('T')[0],
        deliveryTimeSlot: order.deliveryTimeSlot || '',
        attachments: order.attachments || [],
      });
    } else {
      setEditingOrder(null);
      setFormData({
        pickupAddress: '',
        deliveryAddress: '',
        pickupLat: '',
        pickupLng: '',
        deliveryLat: '',
        deliveryLng: '',
        clientName: '',
        clientPhone: '',
        clientNote: '',
        weight: '',
        packageType: 'OTHER',
        description: '',
        deliveryType: 'STANDARD',
        paymentMethod: 'CASH',
        price: '',
        requestedAt: new Date().toISOString().split('T')[0],
        deliveryTimeSlot: '',
        attachments: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        pickupLat: formData.pickupLat ? parseFloat(formData.pickupLat) : undefined,
        pickupLng: formData.pickupLng ? parseFloat(formData.pickupLng) : undefined,
        deliveryLat: formData.deliveryLat ? parseFloat(formData.deliveryLat) : undefined,
        deliveryLng: formData.deliveryLng ? parseFloat(formData.deliveryLng) : undefined,
      };

      if (editingOrder) {
        await orderService.updateOrder(editingOrder.id, payload);
      } else {
        await orderService.createOrder(payload);
      }
      
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to save order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (order: any) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    setIsSubmitting(true);
    try {
      await orderService.deleteOrder(orderToDelete.id);
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDFThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedarray = new Uint8Array(reader.result as ArrayBuffer);
          // @ts-ignore
          const pdfjsLib = window['pdfjsLib'];
          if (!pdfjsLib) {
            console.error('pdfjsLib not found on window');
            resolve('');
            return;
          }
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          const loadingTask = pdfjsLib.getDocument({ data: typedarray });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            resolve('');
            return;
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          resolve(canvas.toDataURL());
        } catch (e) {
          console.error('PDF preview failed:', e);
          resolve('');
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const generateOfficeThumbnail = async (file: File): Promise<string> => {
    const isWord = file.name.endsWith('.docx');
    const isExcel = file.name.endsWith('.xlsx');
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          let htmlSnippet = '';

          if (isWord) {
            // @ts-ignore
            if (!window.mammoth) {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
              document.head.appendChild(script);
              await new Promise(r => script.onload = r);
            }
            // @ts-ignore
            const result = await window.mammoth.convertToHtml({ arrayBuffer });
            htmlSnippet = result.value.substring(0, 500); // Take first 500 chars
          } else if (isExcel) {
            // @ts-ignore
            if (!window.XLSX) {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
              document.head.appendChild(script);
              await new Promise(r => script.onload = r);
            }
            // @ts-ignore
            const workbook = window.XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            // @ts-ignore
            htmlSnippet = window.XLSX.utils.sheet_to_html(firstSheet, { editable: false }).substring(0, 500);
          }

          // Render to Canvas via SVG
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve('');

          const data = `
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:8px; color: #94a3b8; background: #0f172a; padding: 10px; height: 100%; overflow: hidden;">
                  <div style="font-weight: bold; color: #38bdf8; margin-bottom: 5px;">${isWord ? 'WORD DOC' : 'EXCEL SHEET'}</div>
                  ${htmlSnippet}
                </div>
              </foreignObject>
            </svg>
          `;

          const img = new Image();
          const svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svg);

          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL());
          };
          img.src = url;
        } catch (e) {
          console.error('Office preview failed:', e);
          resolve('');
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isOffice = file.name.endsWith('.docx') || file.name.endsWith('.xlsx');
      
      let previewUrl = '';
      let originalUrl = '';

      if (isImage) {
        originalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        previewUrl = originalUrl;
      } else if (isPDF) {
        // Load PDF.js if needed
        // @ts-ignore
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          document.head.appendChild(script);
          await new Promise(r => script.onload = r);
        }
        originalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        previewUrl = await generatePDFThumbnail(file);
      } else if (isOffice) {
        originalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        previewUrl = await generateOfficeThumbnail(file);
      }

      setFormData((prev: any) => ({
        ...prev,
        attachments: [...prev.attachments, { 
          type: isImage ? 'image' : 'document', 
          url: previewUrl, 
          original: originalUrl,
          name: file.name,
          isPDF: isPDF,
          isOffice: isOffice
        }]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      attachments: prev.attachments.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleViewFile = async (file: any) => {
    setActiveFile(file);
    setFullFileContent('');

    if (file.isOffice) {
      const base64Data = file.original.split(',')[1];
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      if (file.name.endsWith('.docx')) {
        // @ts-ignore
        const result = await window.mammoth.convertToHtml({ arrayBuffer });
        setFullFileContent(result.value);
      } else if (file.name.endsWith('.xlsx')) {
        // @ts-ignore
        const workbook = window.XLSX.read(bytes, { type: 'array' });
        let fullHtml = '';
        workbook.SheetNames.forEach(name => {
          // @ts-ignore
          fullHtml += `<h2 class="text-primary-400 mt-8 mb-4 font-bold border-b border-white/10 pb-2">${name}</h2>`;
          // @ts-ignore
          fullHtml += window.XLSX.utils.sheet_to_html(workbook.Sheets[name]);
        });
        setFullFileContent(fullHtml);
      }
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CREATED': return 'secondary';
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'primary';
      case 'ASSIGNED': return 'primary';
      case 'PICKED_UP': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'primary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
          <p className="text-slate-500">{t('orders.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t('common.search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all w-full md:w-64"
            />
          </div>
          {user?.role === 'vendor' && (
            <Button icon={Plus} onClick={() => handleOpenModal()}>{t('orders.create_new')}</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <GlassCard key={order.id} className="hover:border-white/10 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
                {/* Order ID & Badge */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                      <Package size={20} />
                    </div>
                    <span className="font-bold text-lg">#{order.id.substring(0, 8)}</span>
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>{t(`orders.status.${order.status.toLowerCase()}`, { defaultValue: order.status })}</Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('orders.delivery')}</p>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin size={14} className="text-primary-400" />
                      <span className="text-sm font-medium truncate max-w-[150px]">{order.deliveryAddress}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('orders.vendor')}</p>
                    <div className="flex items-center gap-2 text-slate-300">
                      <User size={14} className="text-emerald-400" />
                      <span className="text-sm font-medium">{order.vendor?.shopName || t('common.no_data')}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('common.date')}</p>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock size={14} className="text-violet-400" />
                      <span className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('orders.amount')}</p>
                    <p className="text-lg font-black text-slate-100">${parseFloat(order.price).toFixed(2)}</p>
                  </div>
                </div>

                {/* Attachments Preview */}
                {order.attachments && order.attachments.length > 0 && (
                  <div className="flex gap-1">
                    {order.attachments.slice(0, 3).map((file: any, i: number) => (
                      <div key={i} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {(file.type === 'image' || file.isPDF || file.isOffice) && file.url ? (
                          <img src={file.url} alt="att" className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={14} className="text-primary-400" />
                        )}
                      </div>
                    ))}
                    {order.attachments.length > 3 && (
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{order.attachments.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {(user?.role === 'admin' || (user?.role === 'vendor' && order.status === 'CREATED')) && (
                    <>
                      <button 
                        onClick={() => handleOpenModal(order)}
                        className="p-3 rounded-xl hover:bg-white/10 transition-colors text-slate-400"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(order)}
                        className="p-3 rounded-xl hover:bg-rose-500/10 transition-colors text-rose-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  <Button 
                    variant="secondary" 
                    className="group-hover:bg-primary-500 group-hover:text-white transition-all"
                    onClick={() => setViewingOrder(order)}
                  >
                    {t('orders.details')}
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('orders.empty_title')}</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {t('orders.empty_subtitle')}
            </p>
          </GlassCard>
        )}
      </div>

      {/* Order Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <GlassCard className="relative w-full max-w-4xl z-10 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{editingOrder ? t('orders.edit_order') : t('orders.create_order')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Section: Customer Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-primary-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={16} /> {t('orders.customer_info')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.client_name')}</label>
                    <input 
                      type="text" required value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.client_phone')} 📞</label>
                    <input 
                      type="text" required value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      placeholder="+212 ..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.client_note')} (Optional)</label>
                    <textarea 
                      value={formData.clientNote}
                      onChange={(e) => setFormData({...formData, clientNote: e.target.value})}
                      placeholder="e.g. Call before arrival"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all h-20"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Locations & Geolocation */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={16} /> {t('orders.route_info')}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.pickup')}</label>
                    <input 
                      type="text" required value={formData.pickupAddress}
                      onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="any" value={formData.pickupLat} onChange={(e) => setFormData({...formData, pickupLat: e.target.value})} placeholder="Pickup Lat" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" />
                    <input type="number" step="any" value={formData.pickupLng} onChange={(e) => setFormData({...formData, pickupLng: e.target.value})} placeholder="Pickup Lng" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.delivery')}</label>
                    <input 
                      type="text" required value={formData.deliveryAddress}
                      onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="any" value={formData.deliveryLat} onChange={(e) => setFormData({...formData, deliveryLat: e.target.value})} placeholder="Delivery Lat" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" />
                    <input type="number" step="any" value={formData.deliveryLng} onChange={(e) => setFormData({...formData, deliveryLng: e.target.value})} placeholder="Delivery Lng" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" />
                  </div>
                </div>
              </div>

              {/* Section: Package Details */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Package size={16} /> {t('orders.package_details')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.weight_kg')} ⚖️</label>
                    <input 
                      type="number" step="0.1" value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="0.0"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.package_type')}</label>
                    <select 
                      value={formData.packageType}
                      onChange={(e) => setFormData({...formData, packageType: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all appearance-none"
                    >
                      <option value="DOCUMENT">Document</option>
                      <option value="FOOD">Food</option>
                      <option value="FRAGILE">Fragile</option>
                      <option value="ELECTRONICS">Electronics</option>
                      <option value="CLOTHING">Clothing</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('vendors.description')}</label>
                    <input 
                      type="text" value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="e.g. Nike shoes, XL box"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Timing & Pricing */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <h3 className="text-sm font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} /> {t('orders.timing_pricing')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.requested_at')}</label>
                    <input 
                      type="date" value={formData.requestedAt}
                      onChange={(e) => setFormData({...formData, requestedAt: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.amount')} ($) 💰</label>
                    <input 
                      type="number" step="0.01" required value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.delivery_type')}</label>
                    <select 
                      value={formData.deliveryType}
                      onChange={(e) => setFormData({...formData, deliveryType: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all appearance-none"
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium ⚡</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.payment_method')}</label>
                    <select 
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all appearance-none"
                    >
                      <option value="CASH">Cash on Delivery</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Attachments */}
              <div className="space-y-4 border-t border-white/5 pt-6 pb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Paperclip size={16} /> {t('orders.attachments')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {formData.attachments.map((file: any, index: number) => (
                    <div key={index} className="relative group w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      {(file.type === 'image' || file.isPDF || file.isOffice) && file.url ? (
                        <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                          <FileText size={20} className="text-primary-400 mb-1" />
                          <span className="text-[8px] text-slate-500 truncate w-full">{file.name}</span>
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/50 hover:bg-white/10 transition-all text-slate-500">
                    <Upload size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">{t('orders.add_file')}</span>
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-4 sticky bottom-0 bg-slate-950/50 backdrop-blur-md py-4 border-t border-white/10">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit" className="flex-1" icon={isSubmitting ? Loader2 : Save} disabled={isSubmitting}>
                  {isSubmitting ? t('common.saving') : (editingOrder ? t('orders.edit_order') : t('orders.create_order'))}
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
              
              <h2 className="text-2xl font-black mb-2">{t('orders.delete_title')}</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                {t('orders.delete_warning', { id: orderToDelete?.id.substring(0, 8) })}
              </p>

              <div className="flex gap-4 w-full">
                <Button 
                  variant="secondary" 
                  className="flex-1"
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
      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setViewingOrder(null)} />
          <GlassCard className="relative w-full max-w-4xl z-10 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t('orders.order_details')}</h2>
                  <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">#{viewingOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              {/* Column 1: Customer & Logistics */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-2">{t('orders.customer_info')}</h3>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-lg font-bold text-white mb-1">{viewingOrder.clientName}</p>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><User size={12} /></span>
                      {viewingOrder.clientPhone}
                    </p>
                    {viewingOrder.clientNote && (
                      <p className="mt-3 text-xs text-slate-500 italic bg-black/20 p-2 rounded-lg">"{viewingOrder.clientNote}"</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">{t('orders.delivery_type')}</h3>
                  <div className="flex gap-2">
                    <Badge variant={viewingOrder.deliveryType === 'PREMIUM' ? 'warning' : 'secondary'}>
                      {viewingOrder.deliveryType}
                    </Badge>
                    <Badge variant="primary">{t(`orders.types.${viewingOrder.paymentMethod.toLowerCase()}`, { defaultValue: viewingOrder.paymentMethod.replace('_', ' ') })}</Badge>
                  </div>
                </div>
              </div>

              {/* Column 2: Route & Timing */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] mb-2">{t('orders.timeline')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-violet-400 mt-1" />
                      <div>
                        <p className="text-xs text-slate-500 font-bold">{t('orders.requested_for')}</p>
                        <p className="text-sm font-semibold">{new Date(viewingOrder.requestedAt).toLocaleDateString()} {viewingOrder.deliveryTimeSlot}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-2">{t('orders.addresses')}</h3>
                  <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                    <div className="flex items-start gap-3 relative">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 z-10 mt-1" />
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{t('orders.pickup')}</p>
                        <p className="text-xs font-medium text-slate-300">{viewingOrder.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 relative">
                      <div className="w-4 h-4 rounded-full bg-rose-500/20 border-2 border-rose-500 z-10 mt-1" />
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{t('orders.delivery')}</p>
                        <p className="text-xs font-medium text-slate-300">{viewingOrder.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Package & Price */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">{t('orders.package_specs')}</h3>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{t('orders.package_type')}</span>
                      <span className="text-xs font-bold text-slate-200">{viewingOrder.packageType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{t('orders.weight_kg')}</span>
                      <span className="text-xs font-bold text-slate-200">{viewingOrder.weight || 'N/A'} kg</span>
                    </div>
                    <p className="text-xs text-slate-400 border-t border-white/5 pt-2 mt-2">{viewingOrder.description || 'No description provided.'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('orders.amount')}</h3>
                  <p className="text-4xl font-black text-primary-400 tracking-tighter">${parseFloat(viewingOrder.price).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('orders.evidence_docs')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {viewingOrder.attachments && viewingOrder.attachments.length > 0 ? (
                  viewingOrder.attachments.map((file: any, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => handleViewFile(file)}
                      className="group relative h-32 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all text-left"
                    >
                      {(file.type === 'image' || file.isPDF || file.isOffice) && file.url ? (
                        <img src={file.url} alt="att" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <FileText size={32} className="text-primary-400 mb-2" />
                          <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">{file.name}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-xs font-bold text-white px-3 py-1 bg-primary-500 rounded-full">{t('orders.view_full')}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Paperclip size={24} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-xs text-slate-500">{t('orders.no_attachments')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <Button onClick={() => setViewingOrder(null)}>{t('vendors.close_details')}</Button>
            </div>
          </GlassCard>
        </div>
      )}
      {/* Full Screen File Viewer Modal */}
      {activeFile && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setActiveFile(null)} />
          
          <div className="relative w-full max-w-6xl h-full flex flex-col z-10">
            <div className="flex items-center justify-between mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                  {activeFile.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{activeFile.name}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{activeFile.type}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a 
                  href={activeFile.original || activeFile.url} 
                  download={activeFile.name}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-300"
                  title="Download File"
                >
                  <Upload size={20} className="rotate-180" />
                </a>
                <button 
                  onClick={() => setActiveFile(null)} 
                  className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl overflow-auto p-4 md:p-8 custom-scrollbar">
              {activeFile.type === 'image' ? (
                <div className="flex items-center justify-center min-h-full">
                  <img src={activeFile.original || activeFile.url} alt="full" className="max-w-full h-auto rounded-xl shadow-2xl" />
                </div>
              ) : activeFile.isPDF ? (
                <iframe 
                  src={activeFile.original || activeFile.url} 
                  className="w-full h-full min-h-[70vh] rounded-xl bg-white"
                  title="pdf-viewer"
                />
              ) : activeFile.isOffice ? (
                <div 
                  className="prose prose-invert max-w-none office-preview-container"
                  dangerouslySetInnerHTML={{ __html: fullFileContent || '<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>' }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <FileText size={64} className="mb-4 opacity-20" />
                  <p>Preview not available for this file type.</p>
                  <a href={activeFile.original} download className="mt-4 text-primary-400 hover:underline">Download to view</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
