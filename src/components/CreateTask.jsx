import React, { useState } from 'react';
import api from '../api/axios';
import TaskList from './TaskList';
import { 
    FiPlus, 
    FiUploadCloud, 
    FiTrash2, 
    FiInfo,
    FiZap,
    FiFileText,
    FiLayers,
    FiLoader,
    FiCheck,
    FiCode,
    FiVideo,
    FiAlignLeft,
    FiX
} from 'react-icons/fi';

export default function CreateTask() {
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState("");
    const [level, setLevel] = useState("easy");
    const [topic, setTopic] = useState("");
    const [desc, setDesc] = useState("");
    
    // Bosqich turi: 'text' | 'code' | 'image' | 'video'
    const [stepType, setStepType] = useState('text');
    
    // Har bir obyekt: { desc, code, youtubeId, hasImage, file }
    const [learn, setLearn] = useState([]); 
    const [currentStepDescription, setCurrentStepDescription] = useState(''); 
    const [currentStepCode, setCurrentStepCode] = useState(''); 
    const [currentStepVideo, setCurrentStepVideo] = useState(''); // YouTube ID uchun state 📺
    const [currentStepFile, setCurrentStepFile] = useState(null); // Tanlangan rasm fayli

    // Tozalash funksiyasi
    const resetStepInputs = () => {
        setCurrentStepDescription('');
        setCurrentStepCode('');
        setCurrentStepVideo('');
        setCurrentStepFile(null);
    };

    // Bosqichni qo'shish (Barcha turlar uchun yagona validator)
    const handleAddStep = () => {
        if (!currentStepDescription.trim()) {
            alert("Пожалуйста, введите описание этапа!");
            return;
        }

        const baseStep = {
            desc: currentStepDescription.trim(),
            code: "",
            youtubeId: null,
            hasImage: false,
            file: null
        };

        if (stepType === 'code') {
            if (!currentStepCode.trim()) return alert("Введите код!");
            baseStep.code = currentStepCode.trim();
        } 
        
        else if (stepType === 'video') {
            if (!currentStepVideo.trim()) return alert("Введите YouTube Video ID!");
            baseStep.youtubeId = currentStepVideo.trim();
        } 
        
        else if (stepType === 'image') {
            if (!currentStepFile) return alert("Выберите или вставьте изображение!");
            baseStep.hasImage = true;
            baseStep.file = currentStepFile;
        }

        setLearn(prev => [...prev, baseStep]);
        resetStepInputs();
    };

    // Rasm Ctrl+V (Paste) qilinganda ishlash
    const handlePaste = (e) => {
        if (stepType !== 'image') return; // Faqat image rejimida rasm tashlash ishlasin
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) setCurrentStepFile(file);
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setCurrentStepFile(file);
        e.target.value = null;
    };

    const handleRemoveLearn = (index) => {
        setLearn(learn.filter((_, i) => i !== index));
    };

    const handlePostTask = async () => {
        if (!title || !topic) return alert("Заполните заголовок и тему урока!");
        if (learn.length === 0) return alert("Добавьте хотя бы один этап обучения!");

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('topic', topic); 
        formData.append('desc', desc); 

        const stepsToSubmit = learn.map(step => {
            
            if (step.file) {

                formData.append('images', step.file); // Backend uchun fayl
                return { desc: step.desc, code: "", youtubeId: null, hasImage: true };
            }
            return { 
                desc: step.desc, 
                code: step.code, 
                youtubeId: step.youtubeId, 
                hasImage: false 
            };
        });

        formData.append('steps', JSON.stringify(stepsToSubmit));

        try {
            await api.post('/learn', formData);
            alert('Урок успешно опубликован!');
            setTitle(""); setTopic(""); setDesc(""); setLearn([]); resetStepInputs();
            setStepType('text');
            setShowCreateModal(false);
        } catch (error) {
            alert('Ошибка при сохранении');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50 p-4 lg:p-8 font-[Inter] text-gray-700">
            <div className="max-w-[1400px] mx-auto">
                
                {/* PAGE HEADER */}
                <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <FiLayers size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Конструктор уроков</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Создание обучающего контента</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 active:scale-95"
                    >
                        <FiPlus size={16} />
                        Добавить урок
                    </button>
                </div>

                {/* CREATE LESSON MODAL */}
                {showCreateModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-[1400px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                    {/* Modal Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-indigo-50/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                <FiLayers size={16} className="text-white" />
                            </div>
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Создание нового урока</h2>
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden mb-4">
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                        
                        {/* LEFT: GENERAL SETTINGS */}
                        <div className="p-8 lg:w-3/5 space-y-8">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <FiFileText className="text-gray-400" />
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Основная информация</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 ml-1">Название урока</label>
                                    <input 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        type="text" 
                                        placeholder="Напр: Введение в Redux Toolkit" 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 ml-1">Тема (ID)</label>
                                        <input 
                                            value={topic} 
                                            onChange={(e) => setTopic(e.target.value)} 
                                            type="text" 
                                            placeholder="React / JavaScript" 
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 ml-1">Сложность</label>
                                        <select 
                                            value={level} 
                                            onChange={(e) => setLevel(e.target.value)} 
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                        >
                                            <option value="easy">Easy (Легко)</option>
                                            <option value="medium">Medium (Средне)</option>
                                            <option value="hard">Hard (Сложно)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 ml-1">Краткое вступление</label>
                                    <textarea 
                                        value={desc} 
                                        onChange={(e) => setDesc(e.target.value)} 
                                        placeholder="Опишите цель этого урока в нескольких предложениях..." 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none h-32 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: BUILDER STEPS */}
                        <div className="p-8 lg:w-2/5 bg-gray-50/50">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                                <FiZap className="text-amber-500" />
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Этапы обучения</h2>
                            </div>
                            
                            {/* MEDIA TYPE SELECTOR TABS */}
                            <div className="grid grid-cols-4 gap-1 mb-4 p-1 bg-gray-200/60 rounded-xl">
                                <button 
                                    type="button"
                                    onClick={() => { setStepType('text'); resetStepInputs(); }}
                                    className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all ${stepType === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    <FiAlignLeft size={14} className="mb-1" /> Текст
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setStepType('code'); resetStepInputs(); }}
                                    className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all ${stepType === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    <FiCode size={14} className="mb-1" /> Код
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setStepType('image'); resetStepInputs(); }}
                                    className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all ${stepType === 'image' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    <FiUploadCloud size={14} className="mb-1" /> Фото
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setStepType('video'); resetStepInputs(); }}
                                    className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all ${stepType === 'video' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    <FiVideo size={14} className="mb-1" /> Видео
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                {/* HAR DOIM KO'RINADIGAN MAJBURIY TA'RIF (DESCRIPTION) */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                                        Описание этапа (Обязательно)
                                    </label>
                                    <textarea 
                                        value={currentStepDescription} 
                                        onChange={(e) => setCurrentStepDescription(e.target.value)} 
                                        onPaste={handlePaste}
                                        placeholder="Введите текст объяснения для этого шага..." 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none h-20 resize-none transition-all shadow-inner"
                                    ></textarea>
                                </div>

                                {/* CONDITIONALLY RENDERED INPUTS (FAQAT BITTA MEDIA) */}
                                {stepType === 'code' && (
                                    <div className="animate-fadeIn">
                                        <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                            <FiCode /> Код этого этапа
                                        </label>
                                        <textarea 
                                            value={currentStepCode} 
                                            onChange={(e) => setCurrentStepCode(e.target.value)} 
                                            placeholder="const data = () => { console.log('Only Code here') }" 
                                            className="w-full p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-xl border border-gray-800 outline-none h-28 resize-none transition-all focus:border-indigo-700"
                                        ></textarea>
                                    </div>
                                )}

                                {stepType === 'video' && (
                                    <div className="animate-fadeIn">
                                        <label className="text-xs font-semibold text-red-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                            <FiVideo /> YouTube Video ID
                                        </label>
                                        <input 
                                            value={currentStepVideo} 
                                            onChange={(e) => setCurrentStepVideo(e.target.value)} 
                                            type="text"
                                            placeholder="Напр: dQw4w9WgXcQ (Только ID видео)" 
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                                        />
                                    </div>
                                )}

                                {stepType === 'image' && (
                                    <div className="animate-fadeIn space-y-2">
                                        <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block mb-1">
                                            Изображение этапа
                                        </label>
                                        <div className="relative group">
                                            <input 
                                                type="file" 
                                                onChange={handleFileChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                                            />
                                            <div className="w-full py-4 border border-dashed border-emerald-300 bg-emerald-50/30 rounded-xl text-center transition-all group-hover:border-emerald-500">
                                                <FiUploadCloud size={18} className="mx-auto text-emerald-500 mb-1" />
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter block">
                                                    {currentStepFile ? `Выбран файл: ${currentStepFile.name}` : "Кликните или Ctrl+V для загрузки фото"}
                                                </span>
                                            </div>
                                        </div>
                                        {currentStepFile && (
                                            <img 
                                                src={URL.createObjectURL(currentStepFile)} 
                                                className="w-20 h-20 rounded-xl border border-gray-200 object-cover mx-auto shadow-sm" 
                                                alt="Pre-upload preview" 
                                            />
                                        )}
                                    </div>
                                )}

                                <button 
                                    type="button" 
                                    onClick={handleAddStep} 
                                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-[1px] hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md shadow-indigo-200"
                                >
                                    Добавить этот этап
                                </button>
                            </div>

                            {/* STEPS LIST (PREVIEW) */}
                            <div className="mt-8 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {learn.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl opacity-40 italic">
                                        <FiInfo size={24} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-xs">Добавьте первый этап обучения</p>
                                    </div>
                                ) : (
                                    learn.map((item, index) => (
                                        <div key={index} className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm group overflow-hidden">
                                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Этап {index + 1} 
                                                    {item.code && ' • [КОД]'}
                                                    {item.youtubeId && ' • [ВИДЕО]'}
                                                    {item.hasImage && ' • [ФОТО]'}
                                                    {!item.code && !item.youtubeId && !item.hasImage && ' • [ТОЛЬКО ТЕКСТ]'}
                                                </span>
                                                <button 
                                                    onClick={() => handleRemoveLearn(index)} 
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="p-3 space-y-2">
                                                <div className="flex gap-3">
                                                    {item.hasImage && item.file && (
                                                        <img src={URL.createObjectURL(item.file)} className="w-14 h-14 rounded-xl border border-gray-100 object-cover shrink-0" alt="Step Preview" />
                                                    )}
                                                    {item.desc && (
                                                        <p className="text-[11px] font-semibold text-gray-600 italic leading-relaxed">
                                                            {item.desc}
                                                        </p>
                                                    )}
                                                </div>
                                                {item.code && (
                                                    <pre className="p-2 bg-gray-900 text-green-400 font-mono text-[9px] rounded-xl overflow-x-auto whitespace-pre-wrap max-h-20">
                                                        {item.code}
                                                    </pre>
                                                )}
                                                {item.youtubeId && (
                                                    <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold rounded-xl">
                                                        <FiVideo /> YouTube Video ID: <span className="font-mono text-gray-800 bg-white px-1 border rounded">{item.youtubeId}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS FOOTER */}
                    <div className="p-8 bg-gradient-to-r from-indigo-500 to-violet-600 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-white/80 text-xs italic">
                            <FiInfo className="shrink-0" />
                            <span>После публикации урок станет доступен всем студентам мгновенно.</span>
                        </div>
                        <button 
                            onClick={handlePostTask}
                            disabled={loading}
                            className="w-full md:w-auto px-12 py-4 bg-white text-indigo-600 font-bold text-xs uppercase tracking-[2px] rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
                        >
                            {loading ? <FiLoader className="animate-spin" /> : <><FiCheck /> Опубликовать урок</>}
                        </button>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* BOTTOM TASK LIST SECTION */}
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full"></div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Существующие уроки</h2>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <TaskList />
                    </div>
                </div>
            </div>
        </div>
    );
}