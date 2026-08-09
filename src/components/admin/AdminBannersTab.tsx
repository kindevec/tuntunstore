import React, { useState, useEffect } from 'react';
import { HeroSlide } from '../../types';
import { supabase, uploadBannerImage } from '../../supabaseClient';
import { Plus, Trash2, Edit3, Image as ImageIcon, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminBannersTabProps {
  // Props if needed in future
}

export const AdminBannersTab: React.FC<AdminBannersTabProps> = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error(error);
      setError('Error al cargar banners');
    } else {
      setSlides(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede pesar más de 5MB');
      return;
    }

    setIsUploading(true);
    const res = await uploadBannerImage(file);
    if (res.success && res.url) {
      setEditingSlide(prev => prev ? { ...prev, image_url: res.url! } : { image_url: res.url! });
    } else {
      alert('Error al subir imagen: ' + res.error);
    }
    setIsUploading(false);
  };

  const handleSaveSlide = async () => {
    if (!editingSlide?.image_url || !editingSlide?.title || !editingSlide?.subtitle || !editingSlide?.button_text) {
      alert('Por favor completa todos los campos (Imagen, Título, Subtítulo y Texto del Botón).');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const slideData = {
      image_url: editingSlide.image_url,
      title: editingSlide.title,
      subtitle: editingSlide.subtitle,
      button_text: editingSlide.button_text,
      active: editingSlide.active !== undefined ? editingSlide.active : true,
      order_index: editingSlide.order_index || slides.length,
    };

    if (editingSlide.id) {
      const { error } = await supabase
        .from('hero_slides')
        .update(slideData)
        .eq('id', editingSlide.id);
      
      if (error) setError(error.message);
      else setSuccessMsg('Banner actualizado exitosamente');
    } else {
      const { error } = await supabase
        .from('hero_slides')
        .insert([slideData]);
      
      if (error) setError(error.message);
      else setSuccessMsg('Nuevo banner creado exitosamente');
    }

    if (!error) {
      setEditingSlide(null);
      fetchSlides();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner? Esta acción no se puede deshacer.')) return;
    
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else fetchSlides();
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase.from('hero_slides').update({ active: !currentActive }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchSlides();
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-400 animate-pulse">Cargando banners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            Banners de Inicio (Hero)
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Gestiona las imágenes y textos del carrusel principal de publicidad.</p>
        </div>
        {!editingSlide && (
          <button
            onClick={() => setEditingSlide({ title: '', subtitle: '', button_text: '', active: true, order_index: slides.length })}
            className="bg-amber-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Añadir Banner
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {editingSlide ? (
        <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-white/10 bg-black/20">
            <h3 className="text-lg font-bold text-white">
              {editingSlide.id ? 'Editar Banner' : 'Crear Nuevo Banner'}
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">IMAGEN DE FONDO (PC Y MÓVIL)</label>
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-black/20 border border-white/10 border-dashed rounded-xl transition-all hover:bg-white/5 hover:border-amber-500/50">
                {editingSlide.image_url ? (
                  <div className="relative group w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img src={editingSlide.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-32 rounded-xl border-2 border-dashed border-white/20 bg-black/40 flex flex-col items-center justify-center text-zinc-500 shrink-0">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-wider">Sin imagen</span>
                  </div>
                )}
                
                <div className="flex-1 w-full text-center sm:text-left">
                  <label className="relative cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-white hover:text-amber-400 rounded-xl text-sm font-bold transition-all shadow-sm w-full sm:w-auto mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        Subir Imagen
                      </>
                    )}
                  </label>
                  <p className="text-zinc-500 text-xs mt-1">
                    Formatos: JPG, PNG, WEBP. Peso máximo: 5MB.<br/>
                    <span className="text-amber-500/70">Recomendado: 1920x600 px aprox.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Título Principal</label>
                <input
                  type="text"
                  value={editingSlide.title || ''}
                  onChange={e => setEditingSlide({...editingSlide, title: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Ej: RECUPERA TU PODER"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Subtítulo / Descripción</label>
                <textarea
                  rows={2}
                  value={editingSlide.subtitle || ''}
                  onChange={e => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                  placeholder="Ej: Equípate para la batalla con los mejores packs."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Texto del Botón</label>
                <input
                  type="text"
                  value={editingSlide.button_text || ''}
                  onChange={e => setEditingSlide({...editingSlide, button_text: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Ej: EXPLORAR PROMOCIONES"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Orden (Posición)</label>
                <input
                  type="number"
                  value={editingSlide.order_index ?? 0}
                  onChange={e => setEditingSlide({...editingSlide, order_index: parseInt(e.target.value) || 0})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end gap-3">
            <button
              onClick={() => setEditingSlide(null)}
              className="px-6 py-2.5 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveSlide}
              disabled={saving}
              className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {saving ? (
                 <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Guardando...' : 'Guardar Banner'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl text-zinc-500">
              No hay banners configurados.
            </div>
          ) : (
            slides.map(slide => (
              <div key={slide.id} className={`bg-zinc-900 rounded-2xl border ${slide.active ? 'border-white/10' : 'border-red-500/30'} overflow-hidden group`}>
                <div className="h-40 relative">
                  <img src={slide.image_url} className={`w-full h-full object-cover transition-all ${!slide.active && 'grayscale opacity-50'}`} alt={slide.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  
                  {!slide.active && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Inactivo</div>
                  )}
                  
                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="text-white font-black uppercase text-sm truncate drop-shadow-md">{slide.title}</h4>
                    <p className="text-amber-400 text-xs truncate font-bold">{slide.button_text}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-black/40 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium">Orden: {slide.order_index}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(slide.id, slide.active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${slide.active ? 'bg-zinc-800 text-zinc-300 hover:text-amber-500' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                    >
                      {slide.active ? 'Ocultar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => setEditingSlide(slide)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
