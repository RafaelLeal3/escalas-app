import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoreVertical, CalendarDays } from 'lucide-react';

// --- Constantes ---
const LOCAL_STORAGE_KEY = 'escalasAppNotes';

// --- Constantes (Dados, Classes, etc.) ---
const DATE_CLASS = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };
const LETRA_CLASS = [
    ["A","B","C/G","D","E","F","H","I","T"],
    ["A","B","C","D","E","F","G","H"],
    ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R"],
    ["O","P","Q","R","V","X","Y","Z"]
];
const ESCALA_CLASS = { 1: "4X2X4", 2: "4X2-6X4", 3: "4X1X3-4X2X4", 4: "4X1X3" };
const PRIMEIRA_DATA = [
    ['2020-01-02','2020-01-06','2020-01-04','2020-01-08','2020-01-10','2020-01-10','2020-01-02','2020-01-06','2020-01-08'],
    ['2020-01-16','2020-01-02','2020-01-04','2020-01-06','2020-01-08','2020-01-10','2020-01-12','2020-01-14'],
    ['2020-01-12','2020-01-14','2020-01-16','2020-01-18','2020-01-02','2020-01-04','2020-01-06','2020-01-08','2020-01-10','2020-01-01','2020-01-03','2020-01-05','2020-01-07','2020-01-09','2020-01-11','2020-01-13','2020-01-15','2020-01-17'],
    ['2020-01-06','2020-01-02','2020-01-08','2020-01-04','2020-01-03','2020-01-07','2020-01-05','2020-01-01']
];
const SITUACAO_CLASS = [
    ["T1","T2","T3","T4","N1","N2","F1","F2","F3","F4"],
    ["T1","T2","T3","T4","T5","T6","F1","F2","F3","F4","T1","T2","T3","T4","F1","F2"],
    ["T1","T2","T3","T4","N1","F1","F2","F3","T1","T2","T3","T4","N1","N2","F1","F2","F3","F4"],
    ["T1","T2","T3","T4","N1","F1","F2","F3"]
];
const MONTH_CLASS = { 1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro" };
const SITUATION_BG_COLORS = { 'T': 'bg-[#CE2E2C]', 'F': 'bg-[#2F9E58]', 'N': 'bg-[#5D42BF]', '': 'bg-[#2D3141]' };

// --- Funções Auxiliares ---
const getSituationBgColorClass = (situation) => {
    if (!situation) return SITUATION_BG_COLORS[''];
    const type = situation.charAt(0);
    return SITUATION_BG_COLORS[type] || SITUATION_BG_COLORS[''];
};

const calculateSituation = (day, year, month, contEsc, contLet) => {
    if (!PRIMEIRA_DATA[contEsc - 1] || !PRIMEIRA_DATA[contEsc - 1][contLet - 1]) return 0;
    const d2 = new Date(Date.UTC(year, month - 1, day));
    const d1_str = PRIMEIRA_DATA[contEsc - 1][contLet - 1];
    const d1 = new Date(d1_str);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const cycleLengths = { 1: 10, 2: 16, 3: 18, 4: 8 };
    return diffDays % (cycleLengths[contEsc] || 1);
};

// --- Componentes ---

const NoteModal = ({ isOpen, onClose, selectedDate, currentEscala, currentLetra, initialNote, onSave, onClear }) => {
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen) setNote(initialNote || '');
    }, [isOpen, initialNote]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(selectedDate, currentEscala, currentLetra, note);
        onClose();
    };
    
    const handleClear = () => {
        onClear(selectedDate, currentEscala, currentLetra);
        onClose();
    };

    const [year, month, day] = selectedDate.split('-').map(Number);
    const formattedDate = new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const escalaLetraText = `Escala: ${ESCALA_CLASS[currentEscala]} | Letra: ${LETRA_CLASS[currentEscala - 1]?.[currentLetra - 1] || '-'}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2D3141] rounded-lg shadow-xl p-6 w-full max-w-sm text-white flex flex-col gap-4">
                <h2 className="text-xl font-bold text-center">Nota para {formattedDate}</h2>
                <p className="text-sm text-gray-300 text-center">{escalaLetraText}</p>
                <textarea
                    className="w-full p-2 rounded-md bg-[#1f2128] border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                    placeholder="Adicione a sua nota aqui..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold transition-colors">Cancelar</button>
                    <button onClick={handleClear} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors">Limpar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors">Salvar</button>
                </div>
            </div>
        </div>
    );
};

const DayCell = ({ day, situacao, isToday, onClick, note }) => {
    if (day === " ") {
        return <div className="flex-1 h-[70px]"></div>;
    }

    const bgColorClass = getSituationBgColorClass(situacao);
    const dayTextColorClass = situacao ? 'text-white' : 'text-blue-300';
    const todayIndicatorStyle = isToday ? 'bg-yellow-400 text-black rounded-full' : '';

    return (
        <div
            className={`flex flex-col rounded-md p-1 transition-colors duration-200 ease-in-out cursor-pointer text-white text-base overflow-hidden relative h-[70px] ${bgColorClass}`}
            onClick={onClick}
        >
            <div className="flex justify-end w-full">
                <div className={`w-6 h-6 flex items-center justify-center font-semibold text-xs ${todayIndicatorStyle} ${isToday ? '' : dayTextColorClass}`}>
                    {day}
                </div>
            </div>
            <div className="flex-grow flex items-center justify-center">
                 <span className="text-lg font-bold">{situacao || ' '}</span>
            </div>
            {note && (
                <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-yellow-300 bg-black bg-opacity-40 px-1 py-0.5 truncate">
                    {note}
                </div>
            )}
        </div>
    );
};

const Legend = () => (
    <div className="w-full mt-3 mb-1 p-1.5 rounded-lg shadow-md bg-[#20303e] text-white">
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
            <div className="flex items-center"><div className={`w-2.5 h-2.5 rounded-sm mr-1.5 ${SITUATION_BG_COLORS['T']}`}></div><span className="text-xs">Trabalho</span></div>
            <div className="flex items-center"><div className={`w-2.5 h-2.5 rounded-sm mr-1.5 ${SITUATION_BG_COLORS['F']}`}></div><span className="text-xs">Folga</span></div>
            <div className="flex items-center"><div className={`w-2.5 h-2.5 rounded-sm mr-1.5 ${SITUATION_BG_COLORS['N']}`}></div><span className="text-xs">Noturno</span></div>
            <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm mr-1.5 bg-yellow-400"></div><span className="text-xs">Hoje</span></div>
        </div>
    </div>
);

const Calendar = ({ currentDate, setCurrentDate }) => {
    const [contEsc, setContEsc] = useState(1);
    const [contLet, setContLet] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [notes, setNotes] = useState({});
    
    const [offset, setOffset] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const containerRef = useRef(null);
    const touchStartX = useRef(0);
    const didDrag = useRef(false);
    const animationDuration = 300;

    useEffect(() => {
        try {
            const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedNotes) {
                setNotes(JSON.parse(storedNotes));
            }
        } catch (error) {
            console.error("Erro ao carregar notas do localStorage:", error);
        }
    }, []);

    const handleSaveNote = useCallback((dateStr, esc, lettr, noteTxt) => {
        setNotes(prevNotes => {
            const newNotes = JSON.parse(JSON.stringify(prevNotes)); // Deep copy
            if (!newNotes[dateStr]) {
                newNotes[dateStr] = {};
            }
            newNotes[dateStr][`${esc}_${lettr}`] = noteTxt;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newNotes));
            return newNotes;
        });
    }, []);

    const handleClearNote = useCallback((dateStr, esc, lettr) => {
        setNotes(prevNotes => {
            const newNotes = JSON.parse(JSON.stringify(prevNotes)); // Deep copy
            if (newNotes[dateStr] && newNotes[dateStr][`${esc}_${lettr}`]) {
                delete newNotes[dateStr][`${esc}_${lettr}`];
                if (Object.keys(newNotes[dateStr]).length === 0) {
                    delete newNotes[dateStr];
                }
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newNotes));
            return newNotes;
        });
    }, []);

    const getMonthGrid = useCallback((date) => {
        const year = date.getFullYear(), month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDay) || day > daysInMonth) week.push(" ");
                else week.push(day++);
            }
            grid.push(week);
        }
        return { grid, date };
    }, []);

    const handleEscalaChange = (delta) => {
        setContEsc(prev => (prev + delta > 4 ? 1 : (prev + delta < 1 ? 4 : prev + delta)));
        setContLet(1);
    };

    const handleLetraChange = (delta) => {
        const limits = { 1: 9, 2: 8, 3: 18, 4: 8 };
        setContLet(prev => (prev + delta > limits[contEsc] ? 1 : (prev + delta < 1 ? limits[contEsc] : prev + delta)));
    };

    const onTouchStart = (e) => {
        if (isAnimating) return;
        touchStartX.current = e.touches[0].clientX;
        setIsTransitioning(false);
        didDrag.current = false;
    };
    
    const onTouchMove = (e) => {
        if (isAnimating) return;
        const deltaX = e.touches[0].clientX - touchStartX.current;
        if (!didDrag.current && Math.abs(deltaX) > 5) {
            didDrag.current = true;
        }
        if (didDrag.current) {
            setOffset(deltaX);
        }
    };

    const onTouchEnd = () => {
        if (isAnimating) return;
        setIsTransitioning(true);
        const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
        const swipeThreshold = containerWidth / 4;

        if (Math.abs(offset) > swipeThreshold) {
            const finalOffset = offset < 0 ? -containerWidth : containerWidth;
            setOffset(finalOffset);
            setIsAnimating(true); 
        } else {
            setOffset(0); 
        }
    };
    
    const handleTransitionEnd = () => {
        if (!isAnimating) return; 

        const direction = offset < 0 ? 1 : -1;
        
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
        setCurrentDate(newDate);
        
        setIsTransitioning(false);
        setOffset(0);
        setIsAnimating(false);
    };

    const handleDayClick = (day, date) => {
        if (day === " " || didDrag.current) return;
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setModalDate(dateString);
        setIsModalOpen(true);
    };

    const renderGridCells = (gridData) => {
        const { grid, date } = gridData;
        return (
            <div className="calendar-grid">
                {grid.flat().map((day, index) => {
                    const isToday = day !== " " && new Date().getDate() === day && new Date().getMonth() === date.getMonth() && new Date().getFullYear() === date.getFullYear();
                    const daySituacao = (day !== " ") ? SITUACAO_CLASS[contEsc - 1]?.[calculateSituation(day, date.getFullYear(), date.getMonth() + 1, contEsc, contLet)] : "";
                    const dateString = (day !== " ") ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : "";
                    const dayNote = notes[dateString]?.[`${contEsc}_${contLet}`];

                    return <DayCell key={`${date.getTime()}-${index}`} day={day} situacao={daySituacao} isToday={isToday} onClick={() => handleDayClick(day, date)} note={dayNote} />;
                })}
            </div>
        );
    };
    
    const prevMonthData = getMonthGrid(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const currentMonthData = getMonthGrid(currentDate);
    const nextMonthData = getMonthGrid(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="flex flex-col items-center w-full rounded-lg overflow-hidden shadow-lg bg-[#1f2128]">
            <NoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedDate={modalDate} currentEscala={contEsc} currentLetra={contLet} initialNote={notes[modalDate]?.[`${contEsc}_${contLet}`] || ''} onSave={handleSaveNote} onClear={handleClearNote} />
            
            <div className="relative z-10 w-full" onTouchStart={(e) => e.stopPropagation()}>
                <div className="w-full bg-[#2D3141] rounded-t-lg p-2 flex items-center justify-between">
                    <button onClick={() => handleEscalaChange(-1)} className="p-3 rounded-full hover:bg-gray-700 transition-colors"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                    <div className="text-white text-lg font-semibold">{ESCALA_CLASS[contEsc]}</div>
                    <button onClick={() => handleEscalaChange(1)} className="p-3 rounded-full hover:bg-gray-700 transition-colors"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                </div>
                <div className="w-full bg-[#2D3141] -mt-1 p-2 flex items-center justify-between">
                    <button onClick={() => handleLetraChange(-1)} className="p-3 rounded-full hover:bg-gray-700 transition-colors"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                    <div className="text-white text-lg font-semibold">{LETRA_CLASS[contEsc - 1]?.[contLet - 1] || '-'}</div>
                    <button onClick={() => handleLetraChange(1)} className="p-3 rounded-full hover:bg-gray-700 transition-colors"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                </div>
                <div className="w-full bg-[#2D3141] rounded-b-lg p-3 text-white text-xl font-semibold text-center select-none">{MONTH_CLASS[currentDate.getMonth() + 1]} {currentDate.getFullYear()}</div>
            </div>

            <div className="w-full grid grid-cols-7 bg-[#2D3141] text-white text-sm font-bold h-[40px] rounded-t-md mt-2">{Object.values(DATE_CLASS).map(dayName => <div key={dayName} className="flex items-center justify-center h-full w-full">{dayName}</div>)}</div>
            
            <div ref={containerRef} className="relative w-full overflow-hidden bg-[#2D3141] cursor-grab" style={{ height: '440px', touchAction: 'none' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <div onTransitionEnd={handleTransitionEnd} className="calendar-filmstrip" style={{width: '300%', display: 'flex', transform: `translateX(calc(-${100/3}% + ${offset}px))`, transition: isTransitioning ? `transform ${animationDuration}ms ease-out` : 'none'}}>
                    <div className="calendar-page">{renderGridCells(prevMonthData)}</div>
                    <div className="calendar-page">{renderGridCells(currentMonthData)}</div>
                    <div className="calendar-page">{renderGridCells(nextMonthData)}</div>
                </div>
            </div>
        </div>
    );
};

const Header = ({ onTodayClick, onAboutClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const createMenuAction = (handler) => (e) => {
        e.preventDefault();
        handler();
        setIsMenuOpen(false);
    };

    return (
        <header className="w-full px-4 flex items-center bg-[#2D3141] py-3 rounded-lg shadow-md">
            <CalendarDays className="w-7 h-7 text-white mr-2" /><h1 className="text-lg font-bold flex-grow">Escalas</h1>
            <div className="relative ml-auto" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2.5 rounded-full hover:bg-zinc-600 focus:outline-none transition-colors"><MoreVertical className="w-5 h-5 text-white" /></button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#20303e] rounded-md shadow-lg py-1 z-20">
                        <button onClick={createMenuAction(onTodayClick)} className="w-full text-left block px-4 py-2 text-sm text-white hover:bg-gray-700">Hoje</button>
                        <button onClick={createMenuAction(onAboutClick)} className="w-full text-left block px-4 py-2 text-sm text-white hover:bg-gray-700">Sobre</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const showSnackbar = (message) => {
        setSnackbar({ open: true, message });
        setTimeout(() => setSnackbar({ open: false, message: '' }), 3000);
    };

    return (
        <div className="min-h-screen bg-[#1f2128] flex flex-col items-center py-4 px-4 font-sans text-white">
            <div className="w-full max-w-lg">
                <Header onTodayClick={() => setCurrentDate(new Date())} onAboutClick={() => showSnackbar("Rafael Leal Productions! | Beta 1.0 | 2025")} />
                <main className="w-full mt-2">
                    <Legend />
                    <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
                </main>
            </div>
            {snackbar.open && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50">{snackbar.message}</div>}
            <style>{`.calendar-page {width: calc(100% / 3);flex-shrink: 0;padding: 0 0.5rem;}.calendar-grid {display: grid;grid-template-columns: repeat(7, 1fr);gap: 0.25rem;}`}</style>
        </div>
    );
}
