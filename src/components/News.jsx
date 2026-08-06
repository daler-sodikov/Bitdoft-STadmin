import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { 
    FiPlus, 
    FiTrash2, 
    FiImage, 
    FiYoutube, 
    FiLayers, 
    FiLoader, 
    FiCheck,
    FiFileText,
    FiUploadCloud,
    FiX,
    FiEdit2 
} from 'react-icons/fi';

const NewsImageSlider = ({ images, title, youtubeId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const mediaItems = [];
    if (youtubeId) mediaItems.push({ type: 'video', id: youtubeId });
    if (images) images.forEach((src) => mediaItems.push({ type: 'image', src }));

    const total = mediaItems.length;

    useEffect(() => {
        if (total <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % total);
        }, 5000);
        return () => clearInterval(interval);
    }, [total]);

    if (total === 0) {
        return <div className="flex items-center justify-center w-full h-full bg-slate-100"><FiImage className="text-slate-300" size={32} /></div>;
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-900">
            {mediaItems.map((item, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                    }`}
                >
                    {item.type === 'video' ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1&loop=1&playlist=${item.id}&controls=0&showinfo=0&rel=0`}
                            className="w-full h-full pointer-events-none"
                            style={{ border: 0 }}
                            allow="autoplay; encrypted-media"
                            title={`${title} - video`}
                        />
                    ) : (
                        <img
                            src={item.src}
                            alt={`${title} - ${index + 1}`}
                            className="object-cover w-full h-full"
                        />
                    )}
                </div>
            ))}
            {total > 1 && (
                <div className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-sm">
                    {mediaItems[currentIndex]?.type === 'video' ? (
                        <FiYoutube size={12} className="text-red-400" />
                    ) : (
                        <FiImage size={12} className="text-blue-400" />
                    )}
                    <span>{currentIndex + 1} / {total}</span>
                </div>
            )}
        </div>
    );
};

export default function News() {
    const [loading, setLoading] = useState(false);
    const [allNews, setAllNews] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [editingNews, setEditingNews] = useState(null);
    const [newsData, setNewsData] = useState({ title: '', description: '', videoId: '' });
    const [images, setImages] = useState([]); 
    const [previews, setPreviews] = useState([]); 
    const [existingImages, setExistingImages] = useState([]);

    const handleChange = (e) => setNewsData({ ...newsData, [e.target.name]: e.target.value });

    const getAllNews = useCallback(async () => {
        try {
            const response = await api.get('/news');
            setAllNews(Array.isArray(response.data) ? response.data : response.data.news || []);
        } catch (error) { 
    }
    }, []);

    const deleteNews = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту новость?")) return;
        try {
            await api.delete(`/news/${id}`);
            setAllNews(allNews.filter(item => item.id !== id));
        } catch (error) { 
            alert("Ошибка при удалении"); 
        }
    };

    useEffect(() => { getAllNews(); }, [getAllNews]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newImages = [...images, ...files];
        setImages(newImages);
        const newPreviews = newImages.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
        setPreviews(previews.filter((_, index) => index !== indexToRemove));
    };

    const removeExistingImage = (indexToRemove) => {
        setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
    };

    const startEdit = (item) => {
        setEditingNews(item);
        setNewsData({
            title: item.title || '',
            description: item.desc || '',
            videoId: item.youtubeId || ''
        });
        setExistingImages(item.imageUrl || []);
        setImages([]);
        setPreviews([]);
        setIsModalOpen(true);
    };

    const cancelEdit = () => {
        setEditingNews(null);
        setNewsData({ title: '', description: '', videoId: '' });
        setImages([]);
        setPreviews([]);
        setExistingImages([]);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', newsData.title);
        formData.append('desc', newsData.description);
        formData.append('youtubeId', newsData.videoId);
        
        if (editingNews) {
            formData.append('existingImages', JSON.stringify(existingImages));
        }
        
        images.forEach((image) => {
            formData.append('images', image); 
        });

        setLoading(true);
        try {
            if (editingNews) {
                await api.put(`/news/${editingNews.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/news', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setNewsData({ title: '', description: '', videoId: '' });
            setImages([]); 
            setPreviews([]); 
            setExistingImages([]);
            setEditingNews(null);
            setIsModalOpen(false); 
            getAllNews();
        } catch (error) { 
            alert("Ошибка при сохранении"); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50 p-4 lg:p-8 font-[Inter] text-gray-700">
            <div className="max-w-[1400px] mx-auto">
                
                {/* HEADER */}
                <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200">
                            <FiLayers size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Управление новостями</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Пресс-центр и обновления платформы</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => { setEditingNews(null); setNewsData({ title: '', description: '', videoId: '' }); setImages([]); setPreviews([]); setExistingImages([]); setIsModalOpen(true); }}
                            className="flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all shadow-md bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 active:scale-95"
                        >
                            <FiPlus size={16} />
                            Добавить новость
                        </button>

                        <div className="bg-white border border-gray-100 px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Всего</p>
                                <p className="text-lg font-black text-gray-900">{allNews.length}</p>
                            </div>
                            <div className="w-px h-8 bg-gray-100"></div>
                            <FiFileText className="text-gray-300" size={20} />
                        </div>
                    </div>
                </div>

                {/* NEWS GRID */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {allNews.map((item) => (
                        <div key={item.id} className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:shadow-gray-100/80 group">
                            <div className="relative overflow-hidden h-52 shrink-0">
                                <NewsImageSlider 
                                    images={item.imageUrl || []} 
                                    title={item.title} 
                                    youtubeId={item.youtubeId}
                                />
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-900/80 to-transparent"></div>

                                <div className="absolute flex gap-2 transition-all opacity-0 top-4 right-4 group-hover:opacity-100">
                                    <button 
                                        onClick={() => startEdit(item)}
                                        className="flex items-center justify-center text-white border rounded-lg w-9 h-9 bg-white/10 backdrop-blur-md hover:bg-indigo-600 border-white/20"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => deleteNews(item.id)}
                                        className="flex items-center justify-center text-white border rounded-lg w-9 h-9 bg-white/10 backdrop-blur-md hover:bg-red-600 border-white/20"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="absolute text-white bottom-4 left-4 right-4">
                                    <h3 className="text-base font-bold leading-tight line-clamp-1">{item.title}</h3>
                                    <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Опубликовано</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between flex-1 p-6">
                                <p className="mb-6 text-sm italic leading-relaxed text-gray-500 line-clamp-4">
                                    {item.desc}
                                </p>
                                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">Новость</span>
                                        {item.youtubeId && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-widest">
                                                <FiYoutube size={10} /> Video
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-medium text-gray-300">ID: {item.id.substring(0, 8)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {allNews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 bg-white border-2 border-gray-100 border-dashed rounded-2xl">
                        <FiFileText className="mb-4 text-gray-200" size={48} />
                        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Публикаций пока нет</p>
                    </div>
                )}

                {/* CREATE/EDIT NEWS MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white border border-gray-100 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
                            
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30">
                                <div className="flex items-center gap-2">
                                    {editingNews ? <FiEdit2 className="text-gray-500" /> : <FiPlus className="text-gray-500" />}
                                    <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase">
                                        {editingNews ? 'Редактировать новость' : 'Создать новость'}
                                    </h2>
                                </div>
                                <button onClick={cancelEdit} className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-200/50">
                                    <FiX size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                <div>
                                    <label className="block mb-2 ml-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">Заголовок</label>
                                    <input 
                                        type="text" name="title" value={newsData.title} onChange={handleChange} required
                                        className="w-full px-4 py-3 text-sm font-semibold transition-all border border-gray-200 outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                        placeholder="Введите заголовок..."
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 ml-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">Контент новости</label>
                                    <textarea 
                                        name="description" value={newsData.description} onChange={handleChange} required
                                        className="w-full h-32 px-4 py-3 text-sm font-semibold transition-all border border-gray-200 outline-none resize-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                        placeholder="Текст новости..."
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 ml-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">Обложка(и)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {existingImages.map((src, index) => (
                                            <div key={`existing-${index}`} className="relative h-20 overflow-hidden border border-gray-100 shadow-sm rounded-xl group">
                                                <img src={src} className="object-cover w-full h-full" alt="Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                                                >
                                                    <FiX size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        {previews.map((src, index) => (
                                            <div key={`new-${index}`} className="relative h-20 overflow-hidden border border-indigo-200 shadow-sm rounded-xl group">
                                                <img src={src} className="object-cover w-full h-full" alt="Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                                                >
                                                    <FiX size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="relative flex items-center justify-center h-20 overflow-hidden transition-colors border border-gray-300 border-dashed cursor-pointer bg-gray-50 rounded-xl group hover:border-indigo-400">
                                            <div className="text-center">
                                                <FiUploadCloud size={16} className="mx-auto text-gray-300 mb-0.5" />
                                                <p className="text-[8px] font-bold text-gray-400 uppercase">Добавить</p>
                                            </div>
                                            <input type="file" multiple onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </label>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-1 mb-2 ml-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                        <FiYoutube className="text-red-500" /> YouTube Video ID
                                    </label>
                                    <input 
                                        type="text" name="videoId" value={newsData.videoId} onChange={handleChange}
                                        className="w-full px-4 py-3 font-mono text-xs border border-gray-200 outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Напр: dQw4w9WgXcQ"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 bg-white border-t border-gray-100">
                                    <button type="button" onClick={cancelEdit} className="px-5 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase transition-colors border border-gray-200 hover:bg-gray-50 rounded-xl">
                                        Отмена
                                    </button>
                                    <button 
                                        type="submit" disabled={loading}
                                        className="flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all shadow-md bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50"
                                    >
                                        {loading ? <FiLoader className="animate-spin" /> : <>{editingNews ? <><FiCheck /> Сохранить</> : <><FiCheck /> Опубликовать</>}</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        
        </div>
    );
}
