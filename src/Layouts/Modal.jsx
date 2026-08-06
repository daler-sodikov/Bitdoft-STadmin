import React, { useState } from 'react';
import api from '../api/axios';
import { 
    HiOutlinePhotograph, 
    HiOutlineCheckCircle, 
    HiOutlinePlusCircle, 
    HiOutlineTrash, 
    HiX, 
    HiOutlineQuestionMarkCircle 
} from 'react-icons/hi';

export default function Modal({ taskId, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(""); // Prisma modelidagi 'hint' uchun state (oldingi title)
  const [question, setQuestion] = useState('');
  
  const [mainImageFile, setMainImageFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState(""); 

  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [variants, setVariants] = useState([]); // Modelga mos: [{ name: "...", isTrue: false/true }]

  if (!isOpen) return null;

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMainImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddTextOption = () => {
    if (!answer.trim()) return alert("Введите текст ответа!");
    
    // Model talab qilgan 'name' va 'isTrue' maydonlari bilan obyekt qo'shamiz
    setVariants(prev => [...prev, { name: answer.trim(), isTrue: isCorrect }]);
    setAnswer("");
    setIsCorrect(false);
  };

  const handlePostTest = async () => {
    if (!question.trim() || variants.length < 2) {
      return alert("Заполните все поля и добавьте минимум 2 варианта ответа!");
    }

    // Hech bo'lmaganda bitta to'g'ri variant tanlanganini tekshiramiz
    const hasTrueVariant = variants.some(v => v.isTrue === true);
    if (!hasTrueVariant) {
      return alert("Пожалуйста, отметьте хотя бы один вариант как 'Правильный ответ'!");
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('question', question);
    formData.append('hint', hint || ""); // Backend modeldagi 'hint'ga ketadi
    formData.append('learnId', taskId);
    
    // Variants massivini JSON string qilib yuboramiz (Backend uni JSON.parse qilib oladi)
    formData.append('variants', JSON.stringify(variants)); 

    if (mainImageFile) {
      formData.append('image', mainImageFile);
    }

    try {
      await api.post('/tests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert("Тест успешно добавлен!");
      setHint('');
      setQuestion('');
      setMainImageFile(null);
      setImagePreview('');
      setVariants([]);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Произошла ошибка при сохранении теста");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-indigo-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <HiOutlineQuestionMarkCircle size={24} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight">Создание вопроса</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">ID Задания: {taskId}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all text-gray-300"
          >
            <HiX size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Main Question Section */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Подсказка (Hint)</label>
              <input 
                value={hint} onChange={(e) => setHint(e.target.value)}
                placeholder="Подсказка или тема вопроса..." 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-semibold" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Текст вопроса</label>
              <div className="relative group">
                <textarea 
                  value={question} onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Введите здесь текст вопроса..." 
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 h-40 resize-none transition-all leading-relaxed"
                ></textarea>
                
                <div className="absolute right-4 bottom-4 flex items-center gap-3">
                  {imagePreview && (
                    <div className="relative group/img">
                      <img src={imagePreview} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg" alt="Question" />
                      <button onClick={() => { setMainImageFile(null); setImagePreview(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                        <HiX size={14} />
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-16 h-16 bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-400">
                    <input type="file" onChange={handleMainImageChange} className="hidden" accept="image/*" />
                    <HiOutlinePhotograph size={24} />
                    <span className="text-[8px] font-bold mt-1">ФОТО</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="bg-gray-50/80 p-6 rounded-[2.5rem] border border-gray-100 space-y-5">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
               Варианты ответов <span className="flex-1 h-[1px] bg-gray-200"></span>
            </h4>
            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
              <input 
                value={answer} onChange={(e) => setAnswer(e.target.value)}
                placeholder="Текст ответа..." 
                className="w-full p-3 bg-gray-50 border-transparent border-b-2 border-b-gray-200 focus:border-indigo-400 outline-none transition-all font-medium text-gray-700"
              />
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${isCorrect ? 'bg-green-500 border-green-500 shadow-lg shadow-green-100' : 'border-gray-200 group-hover:border-indigo-300'}`}>
                    <input type="checkbox" checked={isCorrect} onChange={(e) => setIsCorrect(e.target.checked)} className="hidden" />
                    {isCorrect && <HiOutlineCheckCircle className="text-white" size={18} />}
                  </div>
                  <span className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-gray-400'}`}>Правильный ответ</span>
                </label>

                <div className="flex gap-2">
                  <button type="button" onClick={handleAddTextOption} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-[10px] font-black hover:from-indigo-600 hover:to-violet-700 transition-all active:scale-95 shadow-md shadow-indigo-200">
                    + ДОБАВИТЬ
                  </button>
                </div>
              </div>
            </div>

            {/* List of Options */}
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {variants.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4 italic">Минимум 2 варианта...</p>
              )}
              {variants.map((opt, idx) => (
                <div key={idx} className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${opt.isTrue ? 'bg-green-50 border-green-200' : 'bg-white border-transparent hover:border-gray-200 shadow-sm'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${opt.isTrue ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <p className="flex-1 text-sm font-bold text-gray-700">{opt.name}</p>
                  <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">
                    <HiOutlineTrash size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-white">
          <button 
            onClick={handlePostTest}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black rounded-3xl hover:shadow-2xl hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                СОХРАНЕНИЕ...
              </div>
            ) : "СОХРАНИТЬ И ОПУБЛИКОВАТЬ"}
          </button>
        </div>
      </div>
    </div>
  );
}
