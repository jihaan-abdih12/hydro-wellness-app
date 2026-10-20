import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Droplets,
  Moon,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Sun,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Save,
  CheckCircle2
} from 'lucide-react';

const DAILY_WATER_GOAL_ML = 2500;
const GLASS_SIZE_ML = 250;
const TOTAL_GLASSES = DAILY_WATER_GOAL_ML / GLASS_SIZE_ML;

const ENERGY_LEVELS = [
  { level: 1, label: 'Exhausted', color: 'from-red-500 to-rose-600', text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40', emoji: '😴' },
  { level: 2, label: 'Low Energy', color: 'from-orange-500 to-amber-600', text: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40', emoji: '🥱' },
  { level: 3, label: 'Moderate', color: 'from-yellow-500 to-amber-500', text: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/40', emoji: '😐' },
  { level: 4, label: 'Energetic', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', emoji: '⚡' },
  { level: 5, label: 'Peak Power', color: 'from-blue-500 to-indigo-600', text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40', emoji: '🔥' },
];

const MOOD_OPTIONS = ['Motivated', 'Calm', 'Focused', 'Stressed', 'Tired', 'Grateful', 'Anxious', 'Happy'];
const SLEEP_TAGS = ['Deep Sleep', 'Woke up often', 'Early Riser', 'Late Night', 'Restful', 'Dreams'];

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('hw_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('today');

  const getTodayKey = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(getTodayKey());

  const [waterGlasses, setWaterGlasses] = useState(0);
  const [customWaterInput, setCustomWaterInput] = useState('');
  const [customWaterLog, setCustomWaterLog] = useState([]);

  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepHours, setSleepHours] = useState(8);
  const [selectedSleepTags, setSelectedSleepTags] = useState(['Restful']);

  const [energyLevel, setEnergyLevel] = useState(3);
  const [selectedMoods, setSelectedMoods] = useState(['Focused']);

  const [notes, setNotes] = useState('');
  const [celebratedToday, setCelebratedToday] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('hw_history_v1');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hw_theme', theme);
  }, [theme]);

  useEffect(() => {
    const dayData = history[selectedDate];
    if (dayData) {
      setWaterGlasses(dayData.waterGlasses || 0);
      setCustomWaterLog(dayData.customWaterLog || []);
      setBedtime(dayData.bedtime || '23:00');
      setWakeTime(dayData.wakeTime || '07:00');
      setSleepHours(dayData.sleepHours || 8);
      setSelectedSleepTags(dayData.selectedSleepTags || ['Restful']);
      setEnergyLevel(dayData.energyLevel || 3);
      setSelectedMoods(dayData.selectedMoods || ['Focused']);
      setNotes(dayData.notes || '');
      setCelebratedToday(dayData.celebratedToday || false);
    } else {
      setWaterGlasses(0);
      setCustomWaterLog([]);
      setBedtime('23:00');
      setWakeTime('07:00');
      setSleepHours(8);
      setSelectedSleepTags(['Restful']);
      setEnergyLevel(3);
      setSelectedMoods(['Focused']);
      setNotes('');
      setCelebratedToday(false);
    }
  }, [selectedDate]);

  const handleSaveLog = () => {
    const updatedDay = {
      waterGlasses,
      customWaterLog,
      bedtime,
      wakeTime,
      sleepHours,
      selectedSleepTags,
      energyLevel,
      selectedMoods,
      notes,
      celebratedToday,
      totalWaterMl: waterGlasses * GLASS_SIZE_ML + customWaterLog.reduce((acc, item) => acc + item.amount, 0),
    };

    const nextHistory = { ...history, [selectedDate]: updatedDay };
    setHistory(nextHistory);
    localStorage.setItem('hw_history_v1', JSON.stringify(nextHistory));

    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 3000);
  };

  const totalCustomMl = customWaterLog.reduce((sum, item) => sum + item.amount, 0);
  const totalWaterMl = waterGlasses * GLASS_SIZE_ML + totalCustomMl;
  const waterProgressPercent = Math.min(100, Math.round((totalWaterMl / DAILY_WATER_GOAL_ML) * 100));

  useEffect(() => {
    if (waterProgressPercent >= 100 && !celebratedToday && selectedDate === getTodayKey()) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setCelebratedToday(true);
    }
  }, [waterProgressPercent, celebratedToday, selectedDate]);

  const handleToggleGlass = (index) => {
    if (index + 1 === waterGlasses) {
      setWaterGlasses(index);
    } else {
      setWaterGlasses(index + 1);
    }
  };

  const handleAddCustomWater = (e) => {
    e.preventDefault();
    const val = parseInt(customWaterInput, 10);
    if (!val || val <= 0) return;
    const newEntry = { id: Date.now(), amount: val, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setCustomWaterLog([...customWaterLog, newEntry]);
    setCustomWaterInput('');
  };

  const handleRemoveCustomEntry = (id) => {
    setCustomWaterLog(customWaterLog.filter(item => item.id !== id));
  };

  const toggleSleepTag = (tag) => {
    setSelectedSleepTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleMoodTag = (mood) => {
    setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const calculateSleepQualityLabel = (hours) => {
    if (hours < 6) return { label: 'Insufficient Rest', color: 'text-amber-500 bg-amber-500/10' };
    if (hours >= 6 && hours <= 8.5) return { label: 'Optimal Sleep', color: 'text-emerald-500 bg-emerald-500/10' };
    return { label: 'Extended Rest', color: 'text-blue-500 bg-blue-500/10' };
  };

  const currentEnergyObj = ENERGY_LEVELS.find(e => e.level === energyLevel) || ENERGY_LEVELS[2];
  const sleepInfo = calculateSleepQualityLabel(sleepHours);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-16">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
                AquaPulse & Wellness Log
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily Hydration, Sleep & Energy Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'today' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                History Logs
              </button>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-500" />
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>

          {selectedDate !== getTodayKey() && (
            <button
              onClick={() => setSelectedDate(getTodayKey())}
              className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              Jump to Today <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-cyan-500" /> Water: {totalWaterMl} / {DAILY_WATER_GOAL_ML} ml</span>
            <span className="flex items-center gap-1.5"><Moon className="w-4 h-4 text-indigo-500" /> Sleep: {sleepHours} hrs</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Energy: {energyLevel}/5</span>
          </div>
        </div>

        {activeTab === 'today' ? (
          <div className="space-y-6">
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Hydration Tracker</h2>
                    <p className="text-xs text-slate-500">Goal: {DAILY_WATER_GOAL_ML} ml ({TOTAL_GLASSES} glasses x {GLASS_SIZE_ML}ml)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{waterProgressPercent}%</span>
                  <p className="text-xs text-slate-500">{totalWaterMl} ml logged</p>
                </div>
              </div>

              <div className="relative w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${waterProgressPercent}%` }} />
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 mb-6">
                {Array.from({ length: TOTAL_GLASSES }).map((_, idx) => {
                  const isFilled = idx < waterGlasses;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleGlass(idx)}
                      className={`group relative flex flex-col items-center justify-center p-3 h-20 rounded-2xl border transition-all duration-200 ${
                        isFilled
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-500 shadow-md shadow-cyan-500/10 scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-cyan-400'
                      }`}
                    >
                      <Droplets className={`w-6 h-6 mb-1 transition-transform group-hover:scale-110 ${isFilled ? 'text-cyan-500 fill-cyan-500/30' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold">{GLASS_SIZE_ML}ml</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <form onSubmit={handleAddCustomWater} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    placeholder="Custom ml (e.g. 350)"
                    value={customWaterInput}
                    onChange={(e) => setCustomWaterInput(e.target.value)}
                    className="w-full sm:w-52 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-colors flex items-center gap-1 shrink-0 shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> Add ML
                  </button>
                </form>

                <button onClick={() => { setWaterGlasses(0); setCustomWaterLog([]); setCelebratedToday(false); }} className="text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Water Intake
                </button>
              </div>

              {customWaterLog.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {customWaterLog.map((entry) => (
                    <span key={entry.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                      + {entry.amount} ml ({entry.time})
                      <button onClick={() => handleRemoveCustomEntry(entry.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Moon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">Sleep & Rest Quality</h2>
                        <p className="text-xs text-slate-500">Track bedtime, wake time, and tags</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sleepInfo.color}`}>{sleepInfo.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <label className="text-xs font-medium text-slate-500 block mb-1">Bedtime</label>
                      <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full bg-transparent font-bold text-base focus:outline-none" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <label className="text-xs font-medium text-slate-500 block mb-1">Wake Time</label>
                      <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full bg-transparent font-bold text-base focus:outline-none" />
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Hours Slept:</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">{sleepHours} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="14"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Sleep Tags:</label>
                    <div className="flex flex-wrap gap-2">
                      {SLEEP_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleSleepTag(tag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            selectedSleepTags.includes(tag) ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Daily Energy & Mood</h2>
                      <p className="text-xs text-slate-500">1-5 energy level and mood chips</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3 mb-5">
                    {ENERGY_LEVELS.map((item) => (
                      <button
                        key={item.level}
                        onClick={() => setEnergyLevel(item.level)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          energyLevel === item.level ? 'border-amber-500 bg-amber-500/10 scale-105 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-2xl mb-1">{item.emoji}</span>
                        <span className="text-xs font-bold">{item.level}</span>
                      </button>
                    ))}
                  </div>

                  <div className={`p-3.5 rounded-2xl ${currentEnergyObj.bg} border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between mb-5`}>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Current Status</span>
                      <span className={`font-bold text-xs ${currentEnergyObj.text}`}>{currentEnergyObj.label}</span>
                    </div>
                    <span className="text-xl">{currentEnergyObj.emoji}</span>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Mood Badges:</label>
                    <div className="flex flex-wrap gap-2">
                      {MOOD_OPTIONS.map((mood) => (
                        <button
                          key={mood}
                          onClick={() => toggleMoodTag(mood)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            selectedMoods.includes(mood) ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Daily Reflection & Notes</h2>
                  <p className="text-xs text-slate-500">How are you feeling today?</p>
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Write your daily wellness reflections here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium"
              />
            </section>

            {/* SUBMIT / SAVE LOG BUTTON */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div>
                <h3 className="font-bold text-base">Ready to save today's entry?</h3>
                <p className="text-xs text-slate-500">Save all your hydration, sleep, energy, and notes to your history.</p>
              </div>

              <div className="flex items-center gap-3">
                {saveMessage && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Log Saved Successfully!
                  </span>
                )}
                <button
                  onClick={handleSaveLog}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Daily Log
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" /> Logged Wellness History
            </h2>

            {Object.keys(history).length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">No historical wellness entries logged yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(history)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, data]) => (
                    <div
                      key={date}
                      onClick={() => { setSelectedDate(date); setActiveTab('today'); }}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-cyan-500/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 font-bold text-center min-w-[80px]">
                          <span className="text-[10px] block text-slate-400">Date</span>
                          <span className="text-xs">{date}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="text-cyan-600 dark:text-cyan-400">💧 {data.totalWaterMl || 0} ml</span>
                            <span className="text-indigo-600 dark:text-indigo-400">🌙 {data.sleepHours || 0} hrs</span>
                            <span className="text-amber-600 dark:text-amber-400">⚡ Level {data.energyLevel || 3}/5</span>
                          </div>
                          {data.notes && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">"{data.notes}"</p>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-cyan-500" />
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}