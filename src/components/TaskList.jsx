import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../Layouts/Modal.jsx';
import { 
    FiRefreshCw, 
    FiBookOpen, 
    FiTrash2, 
    FiLayers,
    FiPlusCircle,
    FiEye,       
    FiLoader,
    FiAlertCircle,
    FiCheckCircle,
    FiX,
    FiEdit2
} from 'react-icons/fi';

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const [isViewTestsModalOpen, setIsViewTestsModalOpen] = useState(false);
    const [currentTests, setCurrentTests] = useState([]);
    const [currentTaskTitle, setCurrentTaskTitle] = useState("");
    const [testsLoading, setTestsLoading] = useState(false);
    const [deletingTestId, setDeletingTestId] = useState(null);

    const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
    const [completedStudents, setCompletedStudents] = useState([]);
    const [completedLessonTitle, setCompletedLessonTitle] = useState("");

    const handleGetTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/learn');
            setTasks(res.data.tasks || res.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Вы уверены, что хотите безвозвратно удалить это задание и все его шаги?")) return;

        try {
            await api.delete(`/learn/${id}`);
            setTasks(prev => prev.filter(task => task.id !== id));
        } catch (error) {
            alert("Ошибка при удалении. Проверьте права доступа.");
        }
    };

    useEffect(() => {
        handleGetTasks();
    }, []);

    const handleOpenModal = (id) => {
        setSelectedTaskId(id);
        setIsModalOpen(true);
    };

    const handleOpenViewTestsModal = async (task) => {
        setCurrentTaskTitle(task.title);
        setIsViewTestsModalOpen(true);
        setTestsLoading(true);
        setCurrentTests([]);

        try {
            const res = await api.get(`/tests/${task.id}`);
            const fetchedTests = res.data.data || res.data || [];
            setCurrentTests(fetchedTests);
        } catch (error) {
            setCurrentTests([]);
        } finally {
            setTestsLoading(false);
        }
    };

    const handleDeleteTest = async (testId) => {
        if (!window.confirm("Удалить этот тест?")) return;
        setDeletingTestId(testId);
        try {
            await api.delete(`/tests/${testId}`);
            setCurrentTests(prev => prev.filter(t => t.id !== testId));
        } catch (error) {
            alert("Ошибка при удалении теста");
        } finally {
            setDeletingTestId(null);
        }
    };

    const handleOpenCompletedModal = (task) => {
        setCompletedLessonTitle(task.title);
        setCompletedStudents(task.completed || []);
        setIsCompletedModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50 p-4 lg:p-8 font-[Inter] text-gray-700">
            <div className="max-w-[1400px] mx-auto">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <FiLayers size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Библиотека уроков</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Управление учебными модулями и тестами</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleGetTasks} 
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
                    >
                        <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
                        Обновить
                    </button>
                </div>

                {/* LOADING */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-white border border-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* TASK GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tasks.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300 flex flex-col relative"
                                >
                                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                                        <button 
                                            onClick={() => handleDeleteTask(item.id)}
                                            className="p-2 bg-white text-gray-400 hover:text-red-600 border border-gray-100 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Удалить"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="p-8 flex-grow cursor-pointer" onClick={() => handleOpenCompletedModal(item)}>
                                        <div className="flex items-center gap-2 mb-4">
                                            {item.topic && (
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                                    {item.topic}
                                                </span>
                                            )}
                                            {item.tests && (
                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                                    {item.tests.length} тестов
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-700 transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                                            {item.desc || 'Описание урока не добавлено...'}
                                        </p>
                                    </div>

                                    <div className="px-8 pb-8 grid grid-cols-2 gap-3 mt-auto">
                                        <button 
                                            onClick={() => handleOpenViewTestsModal(item)}
                                            className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-bold uppercase tracking-[1px] flex items-center justify-center gap-2 transition-all border border-gray-200"
                                        >
                                            <FiEye size={14} />
                                            Тесты
                                        </button>

                                        <button 
                                            onClick={() => handleOpenModal(item.id)}
                                            className="py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-[1px] flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700"
                                        >
                                            <FiPlusCircle size={14} />
                                            + Тест
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {tasks.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <FiBookOpen className="mx-auto text-gray-200 mb-4" size={48} />
                                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Библиотека пуста</h3>
                                <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-medium">Создайте свой первый урок в конструкторе</p>
                            </div>
                        )}
                    </>
                )}

                {/* ADD TEST MODAL */}
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    taskId={selectedTaskId} 
                />

                {/* COMPLETED STUDENTS MODAL */}
                {isCompletedModalOpen && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                            
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-indigo-50/30">
                                <div>
                                    <h2 className="text-md font-bold text-gray-900 truncate max-w-[350px]">{completedLessonTitle}</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                                        Выполнили: {completedStudents.length} {completedStudents.length === 1 ? 'студент' : 'студентов'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsCompletedModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-xl transition-colors"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-2 bg-gray-50/30">
                                {completedStudents.length === 0 ? (
                                    <div className="text-center py-12 opacity-50 italic flex flex-col items-center justify-center gap-2">
                                        <FiAlertCircle size={32} className="text-gray-300" />
                                        <p className="text-sm">Никто еще не выполнил этот урок.</p>
                                    </div>
                                ) : (
                                    completedStudents.map((student, idx) => (
                                        <div key={student.id || idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">
                                                    {student.name || student.email || 'Без имени'}
                                                </p>
                                                {student.email && (
                                                    <p className="text-[11px] text-gray-400 truncate">{student.email}</p>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0">
                                                Выполнено
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={() => setIsCompletedModalOpen(false)}
                                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-200"
                                >
                                    Закрыть
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {/* VIEW TESTS MODAL */}
                {isViewTestsModalOpen && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                            
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-indigo-50/30">
                                <div>
                                    <h2 className="text-md font-bold text-gray-900 truncate max-w-[500px]">{currentTaskTitle}</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Список тестов</p>
                                </div>
                                <button 
                                    onClick={() => setIsViewTestsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-xl transition-colors"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-gray-50/30">
                                {testsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                                        <FiLoader className="animate-spin text-indigo-600" size={28} />
                                        <p className="text-xs uppercase tracking-wider font-bold">Загрузка тестов...</p>
                                    </div>
                                ) : currentTests.length === 0 ? (
                                    <div className="text-center py-12 opacity-50 italic flex flex-col items-center justify-center gap-2">
                                        <FiAlertCircle size={32} className="text-gray-300" />
                                        <p className="text-sm">Для этого урока еще не создано ни одного теста.</p>
                                    </div>
                                ) : (
                                    currentTests.map((test, idx) => (
                                        <div key={test.id || idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-2.5 items-start flex-1">
                                                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-gray-800 leading-relaxed">
                                                            {test.question || test.d}
                                                        </h4>
                                                        {test.hint && (
                                                            <p className="text-[11px] text-gray-400 mt-1 italic">Подсказка: {test.hint}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteTest(test.id)}
                                                    disabled={deletingTestId === test.id}
                                                    className="p-1.5 text-gray-300 hover:text-red-600 transition-colors shrink-0"
                                                    title="Удалить тест"
                                                >
                                                    {deletingTestId === test.id ? <FiLoader className="animate-spin" size={14} /> : <FiTrash2 size={14} />}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-7">
                                                {(test.variants || test.options || []).map((variant, oIdx) => {
                                                    const variantName = variant.name || variant;
                                                    const isCorrect = variant.isTrue || variant === test.answer;
                                                    return (
                                                        <div 
                                                            key={variant.id || oIdx} 
                                                            className={`p-2.5 rounded-xl text-xs border flex items-center justify-between gap-2 ${
                                                                isCorrect 
                                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' 
                                                                : 'bg-gray-50 border-gray-100 text-gray-600'
                                                            }`}
                                                        >
                                                            <span className="truncate">{variantName}</span>
                                                            {isCorrect && <FiCheckCircle className="text-emerald-600 shrink-0" size={14} />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={() => setIsViewTestsModalOpen(false)}
                                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-200"
                                >
                                    Закрыть
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
